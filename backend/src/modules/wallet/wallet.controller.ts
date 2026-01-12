// ============================================================================
// WALLET CONTROLLER - Cüzdan ve İşlem Yönetimi
// ============================================================================

import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.module';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private prisma: PrismaService) {}

  // Wallet bakiyesi
  @Get('balance')
  async getBalance(@Request() req: any) {
    const userId = req.user.sub;

    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: { wallet: true },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }

    if (!teacher.wallet) {
      // Wallet yoksa oluştur
      const wallet = await this.prisma.wallet.create({
        data: {
          teacherId: teacher.id,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
        },
      });

      return {
        success: true,
        data: wallet,
      };
    }

    return {
      success: true,
      data: teacher.wallet,
    };
  }

  // İşlem geçmişi
  @Get('transactions')
  async getTransactions(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const userId = req.user.sub;

    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: { wallet: true },
    });

    if (!teacher || !teacher.wallet) {
      return {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: parseInt(limit),
          totalPages: 0,
        },
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { walletId: teacher.wallet.id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.walletTransaction.count({
        where: { walletId: teacher.wallet.id },
      }),
    ]);

    return {
      success: true,
      data: {
        items: transactions,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }
}
