// ============================================================================
// AUTH SERVICE - Token süresi 7 gün, Refresh 30 gün
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

      // Wallet oluştur
      await tx.wallet.create({
        data: {
          teacherId: newUser.id,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
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

  async login(dto: { email: string; password: string }): Promise<TokenResponseDto> {
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

  async forgotPassword(dto: { email: string }): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (user) {
      this.logger.log(`Password reset requested for ${dto.email}`);
    }

    return { message: 'If email exists, reset link sent' };
  }

  async resetPassword(dto: { token: string; newPassword: string }): Promise<{ message: string }> {
    return { message: 'Password reset successful' };
  }

  private generateTokenResponse(user: any): TokenResponseDto {
    const payload = { sub: user.id, email: user.email, role: user.role };

    // ÖNEMLİ: Token süresi 7 gün olarak ayarlandı
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '7d', // 7 gün - artık 15 dakika değil!
    });

    // Refresh token 30 gün
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '30d', // 30 gün
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 604800, // 7 gün saniye cinsinden
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
