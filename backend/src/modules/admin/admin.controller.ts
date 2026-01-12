// ============================================================================
// ADMIN CONTROLLER - Öğretmen Onaylama ve Platform Yönetimi
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.module';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  // Admin kontrolü
  private async checkAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
    
    return user;
  }

  // Admin Dashboard
  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    await this.checkAdmin(req.user.sub);

    const [
      totalTeachers,
      pendingTeachers,
      totalStudents,
      totalAppointments,
      completedAppointments,
      pendingPayments,
    ] = await Promise.all([
      this.prisma.teacher.count(),
      this.prisma.teacher.count({ where: { isApproved: false } }),
      this.prisma.student.count(),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.appointment.count({ where: { paymentStatus: 'PENDING' } }),
    ]);

    // Bu ayki gelir
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await this.prisma.appointment.aggregate({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: thisMonth },
      },
      _sum: { platformFee: true },
    });

    return {
      success: true,
      data: {
        totalTeachers,
        pendingTeachers,
        totalStudents,
        totalAppointments,
        completedAppointments,
        pendingPayments,
        monthlyRevenue: monthlyRevenue._sum.platformFee || 0,
      },
    };
  }

  // Onay bekleyen öğretmenler
  @Get('teachers/pending')
  async getPendingTeachers(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    await this.checkAdmin(req.user.sub);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [teachers, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where: { isApproved: false },
        skip,
        take: parseInt(limit),
        include: {
          user: { select: { email: true, phone: true, createdAt: true } },
          branch: true,
          subjects: { include: { subject: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.teacher.count({ where: { isApproved: false } }),
    ]);

    return {
      success: true,
      data: {
        items: teachers,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  // Öğretmen onayla
  @Post('teachers/:teacherId/approve')
  async approveTeacher(
    @Request() req: any,
    @Param('teacherId') teacherId: string,
  ) {
    await this.checkAdmin(req.user.sub);

    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    if (teacher.isApproved) {
      throw new BadRequestException('Teacher is already approved');
    }

    await this.prisma.teacher.update({
      where: { id: teacherId },
      data: {
        isApproved: true,
        approvedAt: new Date(),
      },
    });

    // User durumunu da güncelle
    await this.prisma.user.update({
      where: { id: teacher.userId },
      data: { status: 'ACTIVE' },
    });

    return {
      success: true,
      message: 'Teacher approved successfully',
    };
  }

  // Öğretmen reddet
  @Post('teachers/:teacherId/reject')
  async rejectTeacher(
    @Request() req: any,
    @Param('teacherId') teacherId: string,
    @Body() body: { reason: string },
  ) {
    await this.checkAdmin(req.user.sub);

    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    // User'ı suspended yap
    await this.prisma.user.update({
      where: { id: teacher.userId },
      data: { status: 'SUSPENDED' },
    });

    return {
      success: true,
      message: 'Teacher rejected',
      reason: body.reason,
    };
  }

  // Tüm öğretmenler
  @Get('teachers')
  async getAllTeachers(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    await this.checkAdmin(req.user.sub);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};

    if (status === 'approved') {
      where.isApproved = true;
    } else if (status === 'pending') {
      where.isApproved = false;
    }

    const [teachers, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: { select: { email: true, phone: true, status: true } },
          branch: true,
          wallet: true,
          _count: { select: { appointments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: teachers,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  // Davetiye kodları oluştur
  @Post('invitations')
  async createInvitationCodes(
    @Request() req: any,
    @Body() body: { count?: number; assignedEmail?: string; expiresInDays?: number },
  ) {
    const admin = await this.checkAdmin(req.user.sub);

    const count = body.count || 1;
    const expiresInDays = body.expiresInDays || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const codes: any[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = this.generateInvitationCode();
      const invitation = await this.prisma.invitationCode.create({
        data: {
          code,
          status: 'ACTIVE',
          assignedEmail: body.assignedEmail,
          createdById: admin.id,
          expiresAt,
        },
      });
      codes.push(invitation);
    }

    return {
      success: true,
      data: codes,
    };
  }

  // Davetiye kodlarını listele
  @Get('invitations')
  async listInvitations(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    await this.checkAdmin(req.user.sub);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [invitations, total] = await Promise.all([
      this.prisma.invitationCode.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          createdBy: { select: { firstName: true, lastName: true, email: true } },
          teachers: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invitationCode.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: invitations,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  // Davetiye iptal et
  @Delete('invitations/:id')
  async revokeInvitation(@Request() req: any, @Param('id') id: string) {
    await this.checkAdmin(req.user.sub);

    const invitation = await this.prisma.invitationCode.findUnique({
      where: { id },
    });

    if (!invitation) {
      throw new BadRequestException('Invitation not found');
    }

    if (invitation.status !== 'ACTIVE') {
      throw new BadRequestException('Invitation cannot be revoked');
    }

    await this.prisma.invitationCode.update({
      where: { id },
      data: { status: 'REVOKED' },
    });

    return {
      success: true,
      message: 'Invitation revoked',
    };
  }

  // Banka transferi onayla
  @Post('payments/:appointmentId/approve')
  async approveBankTransfer(
    @Request() req: any,
    @Param('appointmentId') appointmentId: string,
  ) {
    await this.checkAdmin(req.user.sub);

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { teacher: { include: { wallet: true } } },
    });

    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    if (appointment.paymentStatus !== 'PENDING') {
      throw new BadRequestException('Payment is not pending');
    }

    // Transaction ile güncelle
    await this.prisma.$transaction(async (tx) => {
      // Appointment'ı güncelle
      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        },
      });

      // Payment kaydı oluştur/güncelle
      await tx.payment.upsert({
        where: { appointmentId },
        create: {
          appointmentId,
          amount: appointment.paymentAmount || 0,
          platformFee: appointment.platformFee || 0,
          teacherEarning: appointment.teacherEarning || 0,
          status: 'PAID',
          method: 'BANK_TRANSFER',
          paidAt: new Date(),
        },
        update: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      // Öğretmen wallet'ına pending olarak ekle
      if (appointment.teacher?.wallet) {
        await tx.wallet.update({
          where: { id: appointment.teacher.wallet.id },
          data: {
            pendingBalance: {
              increment: appointment.teacherEarning || 0,
            },
          },
        });

        // Transaction kaydı
        await tx.walletTransaction.create({
          data: {
            walletId: appointment.teacher.wallet.id,
            appointmentId,
            amount: appointment.teacherEarning || 0,
            type: 'EARNING',
            description: `Ders ücreti - ${appointmentId.substring(0, 8)}`,
          },
        });
      }
    });

    return {
      success: true,
      message: 'Bank transfer approved',
    };
  }

  // Banka transferi reddet
  @Post('payments/:appointmentId/reject')
  async rejectBankTransfer(
    @Request() req: any,
    @Param('appointmentId') appointmentId: string,
    @Body() body: { reason: string },
  ) {
    await this.checkAdmin(req.user.sub);

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: 'FAILED',
        status: 'CANCELLED',
        cancelReason: body.reason,
      },
    });

    return {
      success: true,
      message: 'Bank transfer rejected',
    };
  }

  // Hakediş raporu
  @Get('finance/hakedis')
  async getHakedisReport(
    @Request() req: any,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    await this.checkAdmin(req.user.sub);

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const teachers = await this.prisma.teacher.findMany({
      where: { isApproved: true },
      include: {
        wallet: true,
        appointments: {
          where: {
            status: 'COMPLETED',
            completedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    const report = teachers.map((teacher) => {
      const totalEarnings = teacher.appointments.reduce(
        (sum, apt) => sum + parseFloat(apt.teacherEarning?.toString() || '0'),
        0,
      );

      return {
        teacherId: teacher.id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        iban: teacher.iban,
        completedLessons: teacher.appointments.length,
        totalEarnings,
        availableBalance: teacher.wallet?.availableBalance || 0,
      };
    });

    return {
      success: true,
      data: {
        period: `${year}-${month}`,
        teachers: report.filter((t) => t.completedLessons > 0),
        totalPayout: report.reduce((sum, t) => sum + t.totalEarnings, 0),
      },
    };
  }

  // Ödeme yap
  @Post('finance/payout')
  async processPayout(
    @Request() req: any,
    @Body() body: { walletId: string; amount: number; reference: string },
  ) {
    await this.checkAdmin(req.user.sub);

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: body.walletId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    if (parseFloat(wallet.availableBalance.toString()) < body.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    await this.prisma.$transaction(async (tx) => {
      // Wallet güncelle
      await tx.wallet.update({
        where: { id: body.walletId },
        data: {
          availableBalance: { decrement: body.amount },
          totalWithdrawn: { increment: body.amount },
        },
      });

      // Transaction kaydı
      await tx.walletTransaction.create({
        data: {
          walletId: body.walletId,
          amount: -body.amount,
          type: 'WITHDRAWAL',
          description: `Ödeme - ${body.reference}`,
        },
      });
    });

    return {
      success: true,
      message: 'Payout processed',
    };
  }

  // Davetiye kodu oluşturucu
  private generateInvitationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'EDU-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
