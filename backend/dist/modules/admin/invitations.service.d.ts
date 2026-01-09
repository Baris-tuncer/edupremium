import { PrismaService } from '../../prisma/prisma.module';
import { InvitationStatus } from '@prisma/client';
interface CreateInvitationDto {
    assignedEmail?: string;
    expiresInDays?: number;
    count?: number;
}
export declare class InvitationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createInvitations(adminUserId: string, dto: CreateInvitationDto): Promise<any[]>;
    listInvitations(page?: number, limit?: number, status?: InvitationStatus): Promise<{
        data: {
            id: string;
            code: string;
            status: import(".prisma/client").$Enums.InvitationStatus;
            assignedEmail: string;
            createdBy: any;
            createdAt: Date;
            expiresAt: Date;
            usedAt: Date;
            usedBy: {
                name: string;
                email: any;
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    revokeInvitation(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        assignedEmail: string | null;
        createdById: string | null;
        usedById: string | null;
        usedAt: Date | null;
        expiresAt: Date | null;
    }>;
    validateInvitationCode(code: string, email?: string): Promise<{
        valid: boolean;
        reason: string;
        invitation?: undefined;
    } | {
        valid: boolean;
        invitation: {
            id: string;
            status: import(".prisma/client").$Enums.InvitationStatus;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            assignedEmail: string | null;
            createdById: string | null;
            usedById: string | null;
            usedAt: Date | null;
            expiresAt: Date | null;
        };
        reason?: undefined;
    }>;
    expireOldInvitations(): Promise<{
        expiredCount: number;
    }>;
    private generateInvitationCode;
}
export {};
