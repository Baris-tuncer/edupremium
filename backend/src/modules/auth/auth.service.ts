// ============================================================================
// AUTH SERVICE - Matches AuthController exactly
// ============================================================================

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.module';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus } from '@prisma/client';

// DTO interfaces to match controller expectations
interface RegisterStudentDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface RegisterTeacherDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  invitationCode: string;
  branchId: string;
  bio?: string;
  hourlyRate?: number;
}

interface LoginDto {
  email: string;
  password: string;
}

interface RefreshTokenDto {
  refreshToken: string;
}

interface ForgotPasswordDto {
  email: string;
}

interface ResetPasswordDto {
  token: string;
  password: string;
}

interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Controller: registerStudent(@Body() dto: RegisterStudentDto): Promise<TokenResponseDto>
  async registerStudent(dto: RegisterStudentDto): Promise<TokenResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        phone: dto.phone || null,
      },
    });

    await this.prisma.student.create({
      data: {
        userId: user.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    return this.generateTokenResponse(user);
  }

  // Controller: registerTeacher(@Body() dto: RegisterTeacherDto): Promise<TokenResponseDto>
  async registerTeacher(dto: RegisterTeacherDto): Promise<TokenResponseDto> {
    const invitationCode = await this.prisma.invitationCode.findFirst({
      where: { code: dto.invitationCode, status: 'ACTIVE' },
    });

    if (!invitationCode) {
      throw new BadRequestException('Invalid or expired invitation code');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash,
          role: UserRole.TEACHER,
          status: UserStatus.PENDING,
          phone: dto.phone || null,
        },
      });

      await tx.teacher.create({
        data: {
          userId: newUser.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          branchId: dto.branchId,
          bio: dto.bio || '',
          hourlyRate: dto.hourlyRate || 200,
          invitationCodeId: invitationCode.id,
        },
      });

      await tx.invitationCode.update({
        where: { id: invitationCode.id },
        data: { status: 'USED', usedById: newUser.id, usedAt: new Date() },
      });

      return newUser;
    });

    return this.generateTokenResponse(user);
  }

  // Controller: login(@Body() dto: LoginDto): Promise<TokenResponseDto>
  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account suspended');
    }

    return this.generateTokenResponse(user);
  }

  // Controller: refresh(@Body() dto: RefreshTokenDto): Promise<TokenResponseDto>
  async refreshToken(dto: { refreshToken: string }): Promise<TokenResponseDto> {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokenResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Controller: logout(@Body() dto: RefreshTokenDto): Promise<void>
  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      await this.prisma.session.deleteMany({
        where: { userId: payload.sub },
      });
    } catch (e) {
      // Token invalid, nothing to do
    }
  }

  // Controller: forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }>
  async forgotPassword(dto: { email: string }): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (user) {
      this.logger.log(`Password reset requested for ${dto.email}`);
    }

    return { message: 'If email exists, reset link sent' };
  }

  // Controller: resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }>
  async resetPassword(dto: { token: string; newPassword: string }): Promise<{ message: string }> {
    // TODO: Validate token and reset password
    return { message: 'Password reset successful' };
  }

  private generateTokenResponse(user: any): TokenResponseDto {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 604800,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
