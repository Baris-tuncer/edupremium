import { Controller, Get, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { PrismaService } from '../../prisma/prisma.module';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private prisma: PrismaService) {}

  @Get('balance')
  async getBalance(@Request() req: any) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.sub }, include: { wallet: true } });
    if (!teacher) throw new BadRequestException('Teacher not found');
    if (!teacher.wallet) {
      const wallet = await this.prisma.wallet.create({ data: { teacherId: teacher.id, availableBalance: 0, pendingBalance: 0, totalEarned: 0, totalWithdrawn: 0 } });
      return { success: true, data: wallet };
    }
    return { success: true, data: teacher.wallet };
  }

  @Get('transactions')
  async getTransactions(@Request() req: any, @Query('page') page = '1', @Query('limit') limit = '20') {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: req.user.sub }, include: { wallet: true } });
    if (!teacher?.wallet) return { success: true, data: { items: [], total: 0 } };
    const transactions = await this.prisma.walletTransaction.findMany({ where: { walletId: teacher.wallet.id }, orderBy: { createdAt: 'desc' } });
    return { success: true, data: { items: transactions, total: transactions.length } };
  }
}
