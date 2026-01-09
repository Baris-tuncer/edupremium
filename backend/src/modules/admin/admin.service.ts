// ============================================================================
// ADMIN SERVICE
// ============================================================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // ========================================
  // GET PENDING TEACHERS
  // ========================================
  async getPendingTeachers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [teachers, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where: { isApproved: false },
        include: {
          user: {
            select: { email: true, createdAt: true },
          },
          branch: {
            select: { name: true },
          },
          invitationCode: {
            select: { code: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.teacher.count({ where: { isApproved: false } }),
    ]);

    return {
      data: teachers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ========================================
  // APPROVE TEACHER
  // ========================================
  async approveTeacher(teacherId: string, adminUserId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    if (teacher.isApproved) {
      throw new BadRequestException('Teacher is already approved');
    }

    const [updatedTeacher] = await this.prisma.$transaction([
      this.prisma.teacher.update({
        where: { id: teacherId },
        data: {
          isApproved: true,
          approvedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id: teacher.userId },
        data: { status: UserStatus.ACTIVE },
      }),
    ]);

    // Emit event for welcome email
    this.eventEmitter.emit('teacher.approved', {
      teacherId,
      email: teacher.user.email,
      firstName: teacher.firstName,
    });

    return updatedTeacher;
  }

  // ========================================
  // REJECT TEACHER
  // ========================================
  async rejectTeacher(teacherId: string, reason: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true, invitationCode: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    await this.prisma.$transaction([
      // Soft delete user
      this.prisma.user.update({
        where: { id: teacher.userId },
        data: { deletedAt: new Date() },
      }),
      // Reactivate invitation code
      ...(teacher.invitationCodeId
        ? [
            this.prisma.invitationCode.update({
              where: { id: teacher.invitationCodeId },
              data: { status: 'ACTIVE', usedAt: null },
            }),
          ]
        : []),
    ]);

    // Emit event for rejection email
    this.eventEmitter.emit('teacher.rejected', {
      email: teacher.user.email,
      firstName: teacher.firstName,
      reason,
    });

    return { message: 'Teacher rejected' };
  }

  // ========================================
  // GET DASHBOARD STATS
  // ========================================
  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const [
      totalStudents,
      totalTeachers,
      pendingTeachers,
      monthlyAppointments,
      weeklyAppointments,
      monthlyRevenue,
      pendingBankTransfers,
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.teacher.count({ where: { isApproved: true } }),
      this.prisma.teacher.count({ where: { isApproved: false } }),
      this.prisma.appointment.count({
        where: {
          createdAt: { gte: startOfMonth },
          status: { not: 'CANCELLED' },
        },
      }),
      this.prisma.appointment.count({
        where: {
          createdAt: { gte: startOfWeek },
          status: { not: 'CANCELLED' },
        },
      }),
      this.prisma.appointment.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          paymentStatus: 'PAID',
        },
        _sum: { paymentAmount: true },
      }),
      this.prisma.appointment.count({
        where: {
          paymentMethod: 'BANK_TRANSFER',
          paymentStatus: 'PENDING',
          status: 'PENDING_PAYMENT',
        },
      }),
    ]);

    return {
      users: {
        totalStudents,
        totalTeachers,
        pendingTeachers,
      },
      appointments: {
        monthlyTotal: monthlyAppointments,
        weeklyTotal: weeklyAppointments,
      },
      finance: {
        monthlyRevenue: monthlyRevenue._sum.paymentAmount || 0,
        pendingBankTransfers,
      },
    };
  }

  // ========================================
  // APPROVE BANK TRANSFER
  // ========================================
  async approveBankTransfer(appointmentId: string, adminUserId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.paymentMethod !== 'BANK_TRANSFER') {
      throw new BadRequestException('This is not a bank transfer payment');
    }

    if (appointment.paymentStatus !== 'PENDING') {
      throw new BadRequestException('Payment is not pending');
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
      },
    });

    // Emit event for Teams meeting creation and notifications
    this.eventEmitter.emit('appointment.confirmed', {
      appointmentId,
      teacherId: appointment.teacherId,
      studentId: appointment.studentId,
      scheduledAt: appointment.scheduledAt,
    });

    return updated;
  }

  // ========================================
  // REJECT BANK TRANSFER
  // ========================================
  async rejectBankTransfer(appointmentId: string, reason: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: 'FAILED',
        status: 'CANCELLED',
        cancelReason: reason,
      },
    });

    // Emit event for notification
    this.eventEmitter.emit('payment.rejected', {
      appointmentId,
      reason,
    });

    return updated;
  }
}
