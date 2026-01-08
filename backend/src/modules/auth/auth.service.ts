// ============================================================================
// AUTH SERVICE
// ============================================================================

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.module';
import { UserRole } from '@prisma/client';
import {
  RegisterStudentDto,
  RegisterTeacherDto,
  LoginDto,
  TokenResponseDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ========================================
  // STUDENT REGISTRATION
  // ========================================
  async registerStudent(dto: RegisterStudentDto): Promise<TokenResponseDto> {
    // Check if email exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user and student in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: UserRole.STUDENT,
          status: 'ACTIVE',
          phone: dto.phone,
        },
      });

      await tx.student.create({
        data: {
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          gradeLevel: dto.gradeLevel,
          schoolName: dto.schoolName,
          parentName: dto.parentName,
          parentEmail: dto.parentEmail,
          parentPhone: dto.parentPhone,
        },
      });

      return user;
    });

    // Generate tokens
    return this.generateTokens(result.id, result.email, result.role);
  }

  // ========================================
  // TEACHER REGISTRATION (Invitation Required)
  // ========================================
  async registerTeacher(dto: RegisterTeacherDto): Promise<TokenResponseDto> {
    // Validate invitation code
    const invitation = await this.prisma.invitationCode.findUnique({
      where: { code: dto.invitationCode },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid invitation code');
    }

    if (invitation.status !== 'ACTIVE') {
      throw new BadRequestException('Invitation code is no longer valid');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation code has expired');
    }

    if (invitation.assignedEmail && invitation.assignedEmail !== dto.email) {
      throw new BadRequestException('This invitation code is assigned to a different email');
    }

    // Check if email exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Validate branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId },
    });

    if (!branch) {
      throw new BadRequestException('Invalid branch');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user, teacher, and update invitation in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: UserRole.TEACHER,
          status: 'PENDING', // Requires admin approval
          phone: dto.phone,
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          invitationCodeId: invitation.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          branchId: dto.branchId,
          introVideoUrl: dto.introVideoUrl,
          bio: dto.bio,
          hourlyRate: dto.hourlyRate,
          iban: dto.iban,
        },
      });

      // Mark invitation as used
      await tx.invitationCode.update({
        where: { id: invitation.id },
        data: {
          status: 'USED',
          usedAt: new Date(),
        },
      });

      return user;
    });

    return this.generateTokens(result.id, result.email, result.role);
  }

  // ========================================
  // LOGIN
  // ========================================
  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account suspended. Please contact support.');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  // ========================================
  // REFRESH TOKEN
  // ========================================
  async refreshToken(dto: RefreshTokenDto): Promise<TokenResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Verify session exists
      const session = await this.prisma.session.findUnique({
        where: { refreshToken: dto.refreshToken },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.deletedAt || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Delete old session
      await this.prisma.session.delete({
        where: { id: session.id },
      });

      // Generate new tokens
      return this.generateTokens(user.id, user.email, user.role);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ========================================
  // LOGOUT
  // ========================================
  async logout(refreshToken: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { refreshToken },
    });
  }

  // ========================================
  // FORGOT PASSWORD
  // ========================================
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Store in Redis or database (simplified here)
    // In production, use Redis with TTL
    await this.prisma.systemConfig.upsert({
      where: { key: `password_reset:${resetToken}` },
      update: { value: JSON.stringify({ userId: user.id, expires: resetExpires }) },
      create: {
        key: `password_reset:${resetToken}`,
        value: JSON.stringify({ userId: user.id, expires: resetExpires }),
        type: 'json',
      },
    });

    // TODO: Send email with reset link
    // await this.emailService.sendPasswordReset(user.email, resetToken);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  // ========================================
  // RESET PASSWORD
  // ========================================
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const resetData = await this.prisma.systemConfig.findUnique({
      where: { key: `password_reset:${dto.token}` },
    });

    if (!resetData) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const parsed = JSON.parse(resetData.value);
    
    if (new Date(parsed.expires) < new Date()) {
      await this.prisma.systemConfig.delete({
        where: { key: `password_reset:${dto.token}` },
      });
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    // Update password and delete reset token
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: parsed.userId },
        data: { passwordHash },
      }),
      this.prisma.systemConfig.delete({
        where: { key: `password_reset:${dto.token}` },
      }),
      // Invalidate all sessions
      this.prisma.session.deleteMany({
        where: { userId: parsed.userId },
      }),
    ]);

    return { message: 'Password has been reset successfully' };
  }

  // ========================================
  // HELPER: Generate Tokens
  // ========================================
  private async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<TokenResponseDto> {
    const payload = { sub: userId, email, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Store refresh token session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      tokenType: 'Bearer',
    };
  }
}
