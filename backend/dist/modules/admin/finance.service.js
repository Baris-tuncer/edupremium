"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const library_1 = require("@prisma/client/runtime/library");
let FinanceService = class FinanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMonthlyHakedisReport(year, month) {
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
            totalTeacherEarnings: report.reduce((sum, r) => sum + (r.totalEarnings?.toNumber() || 0), 0),
            totalPlatformFees: report.reduce((sum, r) => sum + (r.platformFee?.toNumber() || 0), 0),
            totalGrossRevenue: report.reduce((sum, r) => sum + (r.grossRevenue?.toNumber() || 0), 0),
        };
        return {
            period: `${year}-${String(month).padStart(2, '0')}`,
            teachers: report,
            totals,
        };
    }
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
    async processPayout(walletId, amount, adminUserId, reference) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { id: walletId },
            include: { teacher: true },
        });
        if (!wallet) {
            throw new common_1.BadRequestException('Wallet not found');
        }
        if (wallet.availableBalance.toNumber() < amount) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        if (!wallet.teacher.iban) {
            throw new common_1.BadRequestException('Teacher IBAN not set');
        }
        const [transaction] = await this.prisma.$transaction([
            this.prisma.walletTransaction.create({
                data: {
                    walletId,
                    type: 'WITHDRAWAL',
                    amount: -amount,
                    balanceAfter: wallet.availableBalance.toNumber() - amount,
                    description: `Hakediş ödemesi - Ref: ${reference}`,
                    processedById: adminUserId,
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
            amount: new library_1.Decimal(amount),
            transactionId: transaction.id,
        };
    }
    async processBulkPayout(payouts, adminUserId, batchReference) {
        const results = [];
        const errors = [];
        for (const payout of payouts) {
            try {
                const result = await this.processPayout(payout.walletId, payout.amount, adminUserId, `${batchReference}-${payout.walletId.slice(0, 8)}`);
                results.push(result);
            }
            catch (error) {
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
    async creditTeacherWallet(teacherId, appointmentId, amount) {
        let wallet = await this.prisma.wallet.findUnique({
            where: { teacherId },
        });
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
    async getTransactionHistory(teacherId, page = 1, limit = 20) {
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
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map