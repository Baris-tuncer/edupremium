import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ExpenseReceiptsService {
  private readonly logger = new Logger(ExpenseReceiptsService.name);

  constructor(private prisma: PrismaService) {}

  // Generate receipt number: GP-2024-0001
  private async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `GP-${year}-`;

    const lastReceipt = await this.prisma.expenseReceipt.findFirst({
      where: {
        receiptNumber: { startsWith: prefix },
      },
      orderBy: { receiptNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastReceipt) {
      const lastNumber = parseInt(lastReceipt.receiptNumber.split('-')[2], 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  // Calculate stopaj and net amounts
  private calculateAmounts(grossAmount: number, stopajRate: number = 20) {
    const stopajAmount = (grossAmount * stopajRate) / 100;
    const netAmount = grossAmount - stopajAmount;
    return { stopajAmount, netAmount };
  }

  // Get teacher's expense receipts
  async getMyReceipts(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new BadRequestException('Öğretmen bulunamadı');
    }

    const receipts = await this.prisma.expenseReceipt.findMany({
      where: { teacherId: teacher.id },
      include: {
        appointment: {
          include: {
            subject: true,
            student: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: receipts };
  }

  // Get single receipt by ID (for teacher)
  async getReceiptById(userId: string, receiptId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new BadRequestException('Öğretmen bulunamadı');
    }

    const receipt = await this.prisma.expenseReceipt.findUnique({
      where: { id: receiptId },
      include: {
        appointment: {
          include: {
            subject: true,
            student: true,
          },
        },
        teacher: true,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Gider pusulası bulunamadı');
    }

    if (receipt.teacherId !== teacher.id) {
      throw new ForbiddenException('Bu gider pusulasına erişim yetkiniz yok');
    }

    return { success: true, data: receipt };
  }

  // Update receipt (only DRAFT status)
  async updateReceipt(
    userId: string,
    receiptId: string,
    updateData: { tcNumber?: string; address?: string; iban?: string },
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new BadRequestException('Öğretmen bulunamadı');
    }

    const receipt = await this.prisma.expenseReceipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException('Gider pusulası bulunamadı');
    }

    if (receipt.teacherId !== teacher.id) {
      throw new ForbiddenException('Bu gider pusulasına erişim yetkiniz yok');
    }

    if (receipt.status !== 'DRAFT' && receipt.status !== 'REJECTED') {
      throw new BadRequestException('Sadece taslak veya reddedilmiş gider pusulası düzenlenebilir');
    }

    // Update receipt
    const updatedReceipt = await this.prisma.expenseReceipt.update({
      where: { id: receiptId },
      data: {
        tcNumber: updateData.tcNumber,
        address: updateData.address,
        iban: updateData.iban,
        status: 'DRAFT', // Reset to DRAFT if it was REJECTED
        rejectionReason: null,
      },
    });

    // Also update teacher's profile with these values
    await this.prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        tcNumber: updateData.tcNumber || teacher.tcNumber,
        address: updateData.address || teacher.address,
        iban: updateData.iban || teacher.iban,
      },
    });

    return { success: true, data: updatedReceipt };
  }

  // Submit receipt for approval (DRAFT -> SUBMITTED)
  async submitReceipt(userId: string, receiptId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new BadRequestException('Öğretmen bulunamadı');
    }

    const receipt = await this.prisma.expenseReceipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException('Gider pusulası bulunamadı');
    }

    if (receipt.teacherId !== teacher.id) {
      throw new ForbiddenException('Bu gider pusulasına erişim yetkiniz yok');
    }

    if (receipt.status !== 'DRAFT') {
      throw new BadRequestException('Sadece taslak gider pusulası gönderilebilir');
    }

    // Validate required fields
    if (!receipt.tcNumber || !receipt.address || !receipt.iban) {
      throw new BadRequestException('TC Kimlik No, Adres ve IBAN bilgileri zorunludur');
    }

    const updatedReceipt = await this.prisma.expenseReceipt.update({
      where: { id: receiptId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    return { success: true, data: updatedReceipt };
  }

  // Delete receipt (only DRAFT status)
  async deleteReceipt(userId: string, receiptId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new BadRequestException('Öğretmen bulunamadı');
    }

    const receipt = await this.prisma.expenseReceipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException('Gider pusulası bulunamadı');
    }

    if (receipt.teacherId !== teacher.id) {
      throw new ForbiddenException('Bu gider pusulasına erişim yetkiniz yok');
    }

    if (receipt.status !== 'DRAFT') {
      throw new BadRequestException('Sadece taslak gider pusulası silinebilir');
    }

    await this.prisma.expenseReceipt.delete({
      where: { id: receiptId },
    });

    return { success: true, message: 'Gider pusulası silindi' };
  }

  // ==================== ADMIN METHODS ====================

  // Get all receipts (admin)
  async getAllReceipts(filters?: { status?: string; teacherId?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.teacherId) {
      where.teacherId = filters.teacherId;
    }

    const receipts = await this.prisma.expenseReceipt.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: {
              select: { email: true, phone: true },
            },
          },
        },
        appointment: {
          include: {
            subject: true,
            student: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: receipts };
  }

  // Get receipt by ID (admin)
  async getReceiptByIdAdmin(receiptId: string) {
    const receipt = await this.prisma.expenseReceipt.findUnique({
      where: { id: receiptId },
      include: {
        teacher: {
          include: {
            user: {
              select: { email: true, phone: true },
            },
          },
        },
        appointment: {
          include: {
            subject: true,
            student: true,
          },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException('Gider pusulası bulunamadı');
    }

    return { success: true, data: receipt };
  }

  // Approve receipt (admin)
  async approveReceipt(receiptId: string, adminNotes?: string) {
    const receipt = await this.prisma.expenseReceipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException('Gider pusulası bulunamadı');
    }

    if (receipt.status !== 'SUBMITTED') {
      throw new BadRequestException('Sadece gönderilmiş gider pusulası onaylanabilir');
    }

    const updatedReceipt = await this.prisma.expenseReceipt.update({
      where: { id: receiptId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        adminNotes,
      },
    });

    return { success: true, data: updatedReceipt };
  }

  // Reject receipt (admin)
  async rejectReceipt(receiptId: string, rejectionReason: string) {
    const receipt = await this.prisma.expenseReceipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException('Gider pusulası bulunamadı');
    }

    if (receipt.status !== 'SUBMITTED') {
      throw new BadRequestException('Sadece gönderilmiş gider pusulası reddedilebilir');
    }

    const updatedReceipt = await this.prisma.expenseReceipt.update({
      where: { id: receiptId },
      data: {
        status: 'REJECTED',
        rejectionReason,
      },
    });

    return { success: true, data: updatedReceipt };
  }

  // Mark as paid (admin)
  async markAsPaid(receiptId: string) {
    const receipt = await this.prisma.expenseReceipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException('Gider pusulası bulunamadı');
    }

    if (receipt.status !== 'APPROVED') {
      throw new BadRequestException('Sadece onaylanmış gider pusulası ödenmiş olarak işaretlenebilir');
    }

    const updatedReceipt = await this.prisma.expenseReceipt.update({
      where: { id: receiptId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    return { success: true, data: updatedReceipt };
  }

  // ==================== CRON JOB ====================

  // Create expense receipt for a completed appointment
  async createReceiptForAppointment(appointmentId: string) {
    // Check if receipt already exists
    const existingReceipt = await this.prisma.expenseReceipt.findUnique({
      where: { appointmentId },
    });

    if (existingReceipt) {
      return existingReceipt;
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        teacher: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Randevu bulunamadı');
    }

    if (appointment.status !== 'COMPLETED') {
      throw new BadRequestException('Sadece tamamlanmış dersler için gider pusulası oluşturulabilir');
    }

    const teacher = appointment.teacher;
    const grossAmount = Number(appointment.teacherEarning || 0);

    if (grossAmount <= 0) {
      this.logger.warn(`Appointment ${appointmentId} has no teacher earning, skipping receipt creation`);
      return null;
    }

    const { stopajAmount, netAmount } = this.calculateAmounts(grossAmount, 20);
    const receiptNumber = await this.generateReceiptNumber();

    const receipt = await this.prisma.expenseReceipt.create({
      data: {
        teacherId: teacher.id,
        appointmentId: appointment.id,
        receiptNumber,
        fullName: `${teacher.firstName} ${teacher.lastName}`,
        tcNumber: teacher.tcNumber,
        address: teacher.address,
        iban: teacher.iban,
        grossAmount: new Decimal(grossAmount),
        stopajRate: new Decimal(20),
        stopajAmount: new Decimal(stopajAmount),
        netAmount: new Decimal(netAmount),
        status: 'DRAFT',
      },
    });

    this.logger.log(`Created expense receipt ${receiptNumber} for appointment ${appointmentId}`);
    return receipt;
  }

  // Cron job: Check for completed appointments without receipts every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Running expense receipt generation cron job...');

    try {
      // Find completed appointments without expense receipts
      const completedAppointments = await this.prisma.appointment.findMany({
        where: {
          status: 'COMPLETED',
          expenseReceipt: null,
          teacherEarning: { gt: 0 },
        },
        take: 100, // Process in batches
      });

      this.logger.log(`Found ${completedAppointments.length} appointments without receipts`);

      for (const appointment of completedAppointments) {
        try {
          await this.createReceiptForAppointment(appointment.id);
        } catch (error) {
          this.logger.error(`Failed to create receipt for appointment ${appointment.id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Cron job failed:', error);
    }
  }

  // Manual trigger for creating receipts (admin)
  async generateMissingReceipts() {
    const completedAppointments = await this.prisma.appointment.findMany({
      where: {
        status: 'COMPLETED',
        expenseReceipt: null,
        teacherEarning: { gt: 0 },
      },
    });

    let created = 0;
    let failed = 0;

    for (const appointment of completedAppointments) {
      try {
        await this.createReceiptForAppointment(appointment.id);
        created++;
      } catch (error) {
        failed++;
        this.logger.error(`Failed to create receipt for appointment ${appointment.id}:`, error);
      }
    }

    return {
      success: true,
      data: {
        total: completedAppointments.length,
        created,
        failed,
      },
    };
  }

  // Get statistics (admin)
  async getStatistics() {
    const [draft, submitted, approved, paid, rejected, totals] = await Promise.all([
      this.prisma.expenseReceipt.count({ where: { status: 'DRAFT' } }),
      this.prisma.expenseReceipt.count({ where: { status: 'SUBMITTED' } }),
      this.prisma.expenseReceipt.count({ where: { status: 'APPROVED' } }),
      this.prisma.expenseReceipt.count({ where: { status: 'PAID' } }),
      this.prisma.expenseReceipt.count({ where: { status: 'REJECTED' } }),
      this.prisma.expenseReceipt.aggregate({
        _sum: {
          grossAmount: true,
          netAmount: true,
          stopajAmount: true,
        },
        where: { status: 'PAID' },
      }),
    ]);

    return {
      success: true,
      data: {
        counts: { draft, submitted, approved, paid, rejected },
        totals: {
          grossAmount: totals._sum.grossAmount || 0,
          netAmount: totals._sum.netAmount || 0,
          stopajAmount: totals._sum.stopajAmount || 0,
        },
      },
    };
  }
}
