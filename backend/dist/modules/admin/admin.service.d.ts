import { PrismaService } from '../../prisma/prisma.module';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class AdminService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    getPendingTeachers(page?: number, limit?: number): Promise<{
        data: ({
            user: {
                email: string;
                createdAt: Date;
            };
            branch: {
                name: string;
            };
            invitationCode: {
                code: string;
            };
        } & {
            firstName: string;
            lastName: string;
            branchId: string;
            introVideoUrl: string | null;
            bio: string | null;
            hourlyRate: import("@prisma/client/runtime/library").Decimal;
            iban: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            commissionRate: import("@prisma/client/runtime/library").Decimal;
            profilePhotoUrl: string | null;
            isApproved: boolean;
            approvedAt: Date | null;
            invitationCodeId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    approveTeacher(teacherId: string, adminUserId: string): Promise<{
        firstName: string;
        lastName: string;
        branchId: string;
        introVideoUrl: string | null;
        bio: string | null;
        hourlyRate: import("@prisma/client/runtime/library").Decimal;
        iban: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
        profilePhotoUrl: string | null;
        isApproved: boolean;
        approvedAt: Date | null;
        invitationCodeId: string | null;
    }>;
    rejectTeacher(teacherId: string, reason: string): Promise<{
        message: string;
    }>;
    getDashboardStats(): Promise<{
        users: {
            totalStudents: number;
            totalTeachers: number;
            pendingTeachers: number;
        };
        appointments: {
            monthlyTotal: number;
            weeklyTotal: number;
        };
        finance: {
            monthlyRevenue: number | import("@prisma/client/runtime/library").Decimal;
            pendingBankTransfers: number;
        };
    }>;
    approveBankTransfer(appointmentId: string, adminUserId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        subjectId: string;
        teacherId: string;
        studentId: string;
        orderCode: string;
        scheduledAt: Date;
        durationMinutes: number;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
        teacherEarning: import("@prisma/client/runtime/library").Decimal | null;
        platformFee: import("@prisma/client/runtime/library").Decimal | null;
        iyzicoPaymentId: string | null;
        iyzicoConversationId: string | null;
        bankTransferDeadline: Date | null;
        bankTransferReceiptUrl: string | null;
        teamsJoinUrl: string | null;
        teamsMeetingId: string | null;
        teacherStartedAt: Date | null;
        markedNoShow: boolean;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelledById: string | null;
        cancelReason: string | null;
    }>;
    rejectBankTransfer(appointmentId: string, reason: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        subjectId: string;
        teacherId: string;
        studentId: string;
        orderCode: string;
        scheduledAt: Date;
        durationMinutes: number;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
        teacherEarning: import("@prisma/client/runtime/library").Decimal | null;
        platformFee: import("@prisma/client/runtime/library").Decimal | null;
        iyzicoPaymentId: string | null;
        iyzicoConversationId: string | null;
        bankTransferDeadline: Date | null;
        bankTransferReceiptUrl: string | null;
        teamsJoinUrl: string | null;
        teamsMeetingId: string | null;
        teacherStartedAt: Date | null;
        markedNoShow: boolean;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelledById: string | null;
        cancelReason: string | null;
    }>;
}
