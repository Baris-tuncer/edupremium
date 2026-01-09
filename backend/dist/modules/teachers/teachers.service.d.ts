import { PrismaService } from '../../prisma/prisma.module';
import { PaginatedResponseDto } from '../../common/dto/common.dto';
interface TeacherListQuery {
    page?: number;
    limit?: number;
    branchId?: string;
    subjectId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
}
interface TeacherPublicProfile {
    id: string;
    firstName: string;
    lastNameInitial: string;
    profilePhotoUrl: string | null;
    introVideoUrl: string;
    bio: string | null;
    hourlyRate: number;
    branchName: string;
    subjects: string[];
    completedLessons: number;
    averageRating: number | null;
}
interface AvailabilitySlot {
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
}
export declare class TeachersService {
    private prisma;
    constructor(prisma: PrismaService);
    listTeachers(query: TeacherListQuery): Promise<PaginatedResponseDto<TeacherPublicProfile>>;
    getTeacherProfile(id: string): Promise<TeacherPublicProfile>;
    getTeacherAvailability(teacherId: string, startDate: string, endDate: string): Promise<AvailabilitySlot[]>;
    updateProfile(userId: string, data: {
        bio?: string;
        introVideoUrl?: string;
        profilePhotoUrl?: string;
        hourlyRate?: number;
        iban?: string;
    }): Promise<{
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
    updateAvailability(userId: string, slots: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isRecurring: boolean;
        specificDate?: string;
    }>): Promise<{
        created: number;
    }>;
    getTeacherDashboard(userId: string): Promise<{
        profile: {
            firstName: string;
            lastName: string;
            isApproved: boolean;
            hourlyRate: import("@prisma/client/runtime/library").Decimal;
        };
        wallet: {
            availableBalance: import("@prisma/client/runtime/library").Decimal;
            pendingBalance: import("@prisma/client/runtime/library").Decimal;
            totalEarned: import("@prisma/client/runtime/library").Decimal;
        };
        upcomingLessons: {
            id: string;
            studentName: string;
            subject: string;
            scheduledAt: Date;
            teamsJoinUrl: string;
        }[];
        monthlyStats: {
            completedLessons: number;
            earnings: number | import("@prisma/client/runtime/library").Decimal;
        };
        recentFeedback: {
            studentName: string;
            subject: string;
            rating: number;
            date: Date;
        }[];
    }>;
}
export {};
