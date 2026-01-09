import { PrismaService } from '../../prisma/prisma.module';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getCurrentUser(userId: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        id: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        isActive: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    updateEmail(userId: string, newEmail: string): Promise<{
        message: string;
    }>;
    updatePhone(userId: string, newPhone: string): Promise<{
        message: string;
    }>;
    deleteAccount(userId: string): Promise<{
        message: string;
    }>;
    exportUserData(userId: string): Promise<{
        exportDate: string;
        userData: {
            student: {
                appointments: ({
                    teacher: {
                        firstName: string;
                        lastName: string;
                    };
                    subject: {
                        name: string;
                        branchId: string;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
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
                feedbacks: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    teacherId: string;
                    appointmentId: string;
                    studentId: string;
                    comprehensionLevel: number;
                    engagementLevel: number;
                    participationLevel: number;
                    homeworkStatus: string | null;
                    topicsCovered: string[];
                    improvementAreas: string[];
                    areasForImprovement: string[];
                    aiGeneratedReport: string | null;
                    aiReportGeneratedAt: Date | null;
                    teacherNotes: string | null;
                }[];
            } & {
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
            };
            teacher: {
                wallet: {
                    transactions: {
                        type: string;
                        description: string | null;
                        id: string;
                        createdAt: Date;
                        appointmentId: string | null;
                        amount: import("@prisma/client/runtime/library").Decimal;
                        walletId: string;
                        balanceAfter: import("@prisma/client/runtime/library").Decimal | null;
                    }[];
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    teacherId: string;
                    availableBalance: import("@prisma/client/runtime/library").Decimal;
                    pendingBalance: import("@prisma/client/runtime/library").Decimal;
                    totalEarned: import("@prisma/client/runtime/library").Decimal;
                    totalWithdrawn: import("@prisma/client/runtime/library").Decimal;
                };
                appointments: ({
                    student: {
                        firstName: string;
                    };
                    subject: {
                        name: string;
                        branchId: string;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
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
                feedbacks: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    teacherId: string;
                    appointmentId: string;
                    studentId: string;
                    comprehensionLevel: number;
                    engagementLevel: number;
                    participationLevel: number;
                    homeworkStatus: string | null;
                    topicsCovered: string[];
                    improvementAreas: string[];
                    areasForImprovement: string[];
                    aiGeneratedReport: string | null;
                    aiReportGeneratedAt: Date | null;
                    teacherNotes: string | null;
                }[];
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
            };
            sessions: {
                createdAt: Date;
                userAgent: string;
                ipAddress: string;
            }[];
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.UserStatus;
            isEmailVerified: boolean;
            isPhoneVerified: boolean;
            isActive: boolean;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
