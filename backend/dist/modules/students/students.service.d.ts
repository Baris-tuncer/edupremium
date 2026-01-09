import { PrismaService } from '../../prisma/prisma.module';
export declare class StudentsService {
    private prisma;
    constructor(prisma: PrismaService);
    getStudentDashboard(userId: string): Promise<{
        profile: {
            firstName: string;
            lastName: string;
            gradeLevel: number;
            schoolName: string;
        };
        upcomingLessons: {
            id: string;
            teacherName: string;
            teacherPhoto: string;
            subject: string;
            scheduledAt: Date;
            teamsJoinUrl: string;
        }[];
        recentLessons: {
            id: string;
            teacherName: string;
            subject: string;
            scheduledAt: Date;
            feedback: {
                comprehensionLevel: number;
                hasReport: boolean;
            };
        }[];
        monthlyStats: {
            completedLessons: number;
            totalSpent: number | import("@prisma/client/runtime/library").Decimal;
        };
    }>;
    updateProfile(userId: string, data: {
        gradeLevel?: number;
        schoolName?: string;
        parentName?: string;
        parentEmail?: string;
        parentPhone?: string;
    }): Promise<{
        firstName: string;
        lastName: string;
        gradeLevel: number | null;
        schoolName: string | null;
        parentName: string | null;
        parentEmail: string | null;
        parentPhone: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    getLessonHistory(userId: string, page?: number, limit?: number): Promise<{
        data: ({
            teacher: {
                firstName: string;
                lastName: string;
            };
            subject: {
                name: string;
            };
            feedback: {
                comprehensionLevel: number;
                engagementLevel: number;
                participationLevel: number;
                aiGeneratedReport: string;
            };
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getLessonReport(userId: string, appointmentId: string): Promise<{
        lessonDate: Date;
        teacherName: string;
        subject: string;
        feedback: {
            comprehensionLevel: number;
            engagementLevel: number;
            participationLevel: number;
            homeworkStatus: string;
            topicsCovered: string[];
        };
        aiReport: string;
    }>;
}
