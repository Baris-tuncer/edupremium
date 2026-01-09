// ============================================================================
// FINANCE SERVICE (Hakediş Management)
// ============================================================================

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';

interface TeacherEarnings {
  teacherId: string;
  teacherName: string;
  iban: string;
  completedLessons: number;
  totalEarnings: Decimal;
  pendingBalance: Decimal;
  availableBalance: Decimal;
}

interface PayoutResult {
  teacherId: string;
  amount: Decimal;
  transactionId: string;
}

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ========================================
  // GET MONTHLY HAKEDİŞ REPORT
  // ========================================
  async getMonthlyHakedisReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const earnings = await this.prisma.appointment.groupBy({
      by: ['teacherId'],
      where: {
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        teacherEarning: true,
        platformFee: true,
        paymentAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get teacher details
    const teacherIds = earnings.map((e) => e.teacherId);
    const teachers = await this.prisma.teacher.findMany({
      where: { id: { in: teacherIds } },
      include: {
        wallet: true,
      },
    });

    const teacherMap = new Map(teachers.map((t) => [t.id, t]));

    const report = earnings.map((e) => {
      const teacher = teacherMap.get(e.teacherId);
      return {
        teacherId: e.teacherId,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
        iban: teacher?.iban || 'N/A',
        completedLessons: e._count.id,
        totalEarnings: e._sum.teacherEarning,
        platformFee: e._sum.platformFee,
        grossRevenue: e._sum.paymentAmount,
        walletBalance: teacher?.wallet?.availableBalance || 0,
      };
    });

    const totals = {
      totalLessons: report.reduce((sum, r) => sum + r.completedLessons, 0),
      totalTeacherEarnings: report.reduce(
        (sum, r) => sum + (r.totalEarnings?.toNumber() || 0),
        0,
      ),
      totalPlatformFees: report.reduce(
        (sum, r) => sum + (r.platformFee?.toNumber() || 0),
        0,
      ),
      totalGrossRevenue: report.reduce(
        (sum, r) => sum + (r.grossRevenue?.toNumber() || 0),
        0,
      ),
    };

    return {
      period: `${year}-${String(month).padStart(2, '0')}`,
      teachers: report,
      totals,
    };
  }

  // ========================================
  // GET PENDING PAYOUTS
  // ========================================
  async getPendingPayouts() {
    const wallets = await this.prisma.wallet.findMany({
      where: {
        availableBalance: { gt: 0 },
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            iban: true,
          },
        },
      },
      orderBy: { availableBalance: 'desc' },
    });

    return wallets.map((w) => ({
      walletId: w.id,
      teacherId: w.teacher.id,
      teacherName: `${w.teacher.firstName} ${w.teacher.lastName}`,
      iban: w.teacher.iban,
      availableBalance: w.availableBalance,
      pendingBalance: w.pendingBalance,
      totalEarned: w.totalEarned,
      totalWithdrawn: w.totalWithdrawn,
    }));
  }

  // ========================================
  // PROCESS PAYOUT
  // ========================================
  async processPayout(
    walletId: string,
    amount: number,
    adminUserId: string,
    reference: string,
  ): Promise<PayoutResult> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: { teacher: true },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    if (wallet.availableBalance.toNumber() < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    if (!wallet.teacher.iban) {
      throw new BadRequestException('Teacher IBAN not set');
    }

    // Create transaction and update wallet in single transaction
    const [transaction] = await this.prisma.$transaction([
      this.prisma.walletTransaction.create({
        data: {
          walletId,
          type: 'WITHDRAWAL',
          amount: -amount,
          balanceAfter: wallet.availableBalance.toNumber() - amount,
          description: `Hakediş ödemesi - Ref: ${reference}`,
        },
      }),
      this.prisma.wallet.update({
        where: { id: walletId },
        data: {
          availableBalance: { decrement: amount },
          totalWithdrawn: { increment: amount },
        },
      }),
    ]);

    return {
      teacherId: wallet.teacherId,
      amount: new Decimal(amount),
      transactionId: transaction.id,
    };
  }

  // ========================================
  // BULK PAYOUT
  // ========================================
  async processBulkPayout(
    payouts: Array<{ walletId: string; amount: number }>,
    adminUserId: string,
    batchReference: string,
  ) {
    const results: PayoutResult[] = [];
    const errors: Array<{ walletId: string; error: string }> = [];

    for (const payout of payouts) {
      try {
        const result = await this.processPayout(
          payout.walletId,
          payout.amount,
          adminUserId,
          `${batchReference}-${payout.walletId.slice(0, 8)}`,
        );
        results.push(result);
      } catch (error) {
        errors.push({
          walletId: payout.walletId,
          error: error.message,
        });
      }
    }

    return {
      successful: results,
      failed: errors,
      summary: {
        totalProcessed: results.length,
        totalFailed: errors.length,
        totalAmount: results.reduce((sum, r) => sum + r.amount.toNumber(), 0),
      },
    };
  }

  // ========================================
  // CREDIT TEACHER WALLET (After Lesson)
  // ========================================
  async creditTeacherWallet(
    teacherId: string,
    appointmentId: string,
    amount: number,
  ) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { teacherId },
    });

    // Create wallet if doesn't exist
    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { teacherId },
      });
    }

    const [transaction] = await this.prisma.$transaction([
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          appointmentId,
          type: 'EARNING',
          amount,
          balanceAfter: wallet.availableBalance.toNumber() + amount,
          description: 'Ders ücreti',
        },
      }),
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { increment: amount },
          totalEarned: { increment: amount },
        },
      }),
    ]);

    return transaction;
  }

  // ========================================
  // GET TRANSACTION HISTORY
  // ========================================
  async getTransactionHistory(
    teacherId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { teacherId },
    });

    if (!wallet) {
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        include: {
          appointment: {
            select: {
              orderCode: true,
              subject: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export { PayoutResult } from './finance.types';
