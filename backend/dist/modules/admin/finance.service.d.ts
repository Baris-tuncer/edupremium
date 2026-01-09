import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';
interface PayoutResult {
    teacherId: string;
    amount: Decimal;
    transactionId: string;
}
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getMonthlyHakedisReport(year: number, month: number): Promise<{
        period: string;
        teachers: {
            teacherId: string;
            teacherName: string;
            iban: string;
            completedLessons: number;
            totalEarnings: Decimal;
            platformFee: Decimal;
            grossRevenue: Decimal;
            walletBalance: number | Decimal;
        }[];
        totals: {
            totalLessons: number;
            totalTeacherEarnings: number;
            totalPlatformFees: number;
            totalGrossRevenue: number;
        };
    }>;
    getPendingPayouts(): Promise<{
        walletId: string;
        teacherId: string;
        teacherName: string;
        iban: string;
        availableBalance: Decimal;
        pendingBalance: Decimal;
        totalEarned: Decimal;
        totalWithdrawn: Decimal;
    }[]>;
    processPayout(walletId: string, amount: number, adminUserId: string, reference: string): Promise<PayoutResult>;
    processBulkPayout(payouts: Array<{
        walletId: string;
        amount: number;
    }>, adminUserId: string, batchReference: string): Promise<{
        successful: PayoutResult[];
        failed: {
            walletId: string;
            error: string;
        }[];
        summary: {
            totalProcessed: number;
            totalFailed: number;
            totalAmount: number;
        };
    }>;
    creditTeacherWallet(teacherId: string, appointmentId: string, amount: number): Promise<{
        type: string;
        description: string | null;
        id: string;
        createdAt: Date;
        appointmentId: string | null;
        amount: Decimal;
        walletId: string;
        balanceAfter: Decimal | null;
    }>;
    getTransactionHistory(teacherId: string, page?: number, limit?: number): Promise<{
        data: {
            type: string;
            description: string | null;
            id: string;
            createdAt: Date;
            appointmentId: string | null;
            amount: Decimal;
            walletId: string;
            balanceAfter: Decimal | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
export {};
