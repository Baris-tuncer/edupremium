// ============================================================================
// USERS SERVICE
// ============================================================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ========================================
  // GET CURRENT USER PROFILE
  // ========================================
  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isEmailVerified: true,
        phone: true,
        isPhoneVerified: true,
        createdAt: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
            branch: { select: { name: true } },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            gradeLevel: true,
            schoolName: true,
            parentName: true,
            parentEmail: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ========================================
  // CHANGE PASSWORD
  // ========================================
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Invalidate all sessions except current
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    return { message: 'Password changed successfully' };
  }

  // ========================================
  // UPDATE EMAIL
  // ========================================
  async updateEmail(userId: string, newEmail: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existing && existing.id !== userId) {
      throw new BadRequestException('Email already in use');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        isEmailVerified: false,
      },
    });

    // TODO: Send verification email

    return { message: 'Email updated. Please verify your new email.' };
  }

  // ========================================
  // UPDATE PHONE
  // ========================================
  async updatePhone(userId: string, newPhone: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: newPhone,
        isPhoneVerified: false,
      },
    });

    // TODO: Send verification SMS

    return { message: 'Phone updated. Please verify your new phone.' };
  }

  // ========================================
  // DELETE ACCOUNT (Soft Delete)
  // ========================================
  async deleteAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    // Invalidate all sessions
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    return { message: 'Account scheduled for deletion. You have 30 days to recover.' };
  }

  // ========================================
  // EXPORT USER DATA (KVKK Compliance)
  // ========================================
  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacher: {
          include: {
            appointments: {
              include: {
                subject: true,
                student: { select: { firstName: true } },
              },
            },
            feedbacks: true,
            wallet: { include: { transactions: true } },
          },
        },
        student: {
          include: {
            appointments: {
              include: {
                subject: true,
                teacher: { select: { firstName: true, lastName: true } },
              },
            },
            feedbacks: true,
          },
        },
        sessions: {
          select: { createdAt: true, userAgent: true, ipAddress: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive fields
    const { passwordHash, ...safeUser } = user;

    return {
      exportDate: new Date().toISOString(),
      userData: safeUser,
    };
  }
}
