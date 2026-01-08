// ============================================================================
// INVITATIONS SERVICE
// ============================================================================

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { InvitationStatus } from '@prisma/client';

interface CreateInvitationDto {
  assignedEmail?: string;
  expiresInDays?: number;
  count?: number;
}

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  // ========================================
  // CREATE INVITATION CODE(S)
  // ========================================
  async createInvitations(
    adminUserId: string,
    dto: CreateInvitationDto,
  ) {
    const count = dto.count || 1;
    const invitations = [];

    for (let i = 0; i < count; i++) {
      const code = this.generateInvitationCode();
      const expiresAt = dto.expiresInDays
        ? new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      const invitation = await this.prisma.invitationCode.create({
        data: {
          code,
          createdById: adminUserId,
          assignedEmail: count === 1 ? dto.assignedEmail : null,
          expiresAt,
          status: InvitationStatus.ACTIVE,
        },
      });

      invitations.push(invitation);
    }

    return invitations;
  }

  // ========================================
  // LIST INVITATIONS
  // ========================================
  async listInvitations(
    page: number = 1,
    limit: number = 20,
    status?: InvitationStatus,
  ) {
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [invitations, total] = await Promise.all([
      this.prisma.invitationCode.findMany({
        where,
        include: {
          createdBy: {
            select: { email: true },
          },
          usedBy: {
            select: {
              firstName: true,
              lastName: true,
              user: { select: { email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invitationCode.count({ where }),
    ]);

    return {
      data: invitations.map((inv) => ({
        id: inv.id,
        code: inv.code,
        status: inv.status,
        assignedEmail: inv.assignedEmail,
        createdBy: inv.createdBy.email,
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
        usedAt: inv.usedAt,
        usedBy: inv.usedBy
          ? {
              name: `${inv.usedBy.firstName} ${inv.usedBy.lastName}`,
              email: inv.usedBy.user.email,
            }
          : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ========================================
  // REVOKE INVITATION
  // ========================================
  async revokeInvitation(id: string) {
    const invitation = await this.prisma.invitationCode.findUnique({
      where: { id },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.ACTIVE) {
      throw new BadRequestException('Only active invitations can be revoked');
    }

    return this.prisma.invitationCode.update({
      where: { id },
      data: { status: InvitationStatus.REVOKED },
    });
  }

  // ========================================
  // VALIDATE INVITATION CODE
  // ========================================
  async validateInvitationCode(code: string, email?: string) {
    const invitation = await this.prisma.invitationCode.findUnique({
      where: { code },
    });

    if (!invitation) {
      return { valid: false, reason: 'Invalid code' };
    }

    if (invitation.status !== InvitationStatus.ACTIVE) {
      return { valid: false, reason: 'Code is no longer active' };
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      return { valid: false, reason: 'Code has expired' };
    }

    if (invitation.assignedEmail && email && invitation.assignedEmail !== email) {
      return { valid: false, reason: 'Code is assigned to a different email' };
    }

    return { valid: true, invitation };
  }

  // ========================================
  // EXPIRE OLD INVITATIONS (Cron Job)
  // ========================================
  async expireOldInvitations() {
    const result = await this.prisma.invitationCode.updateMany({
      where: {
        status: InvitationStatus.ACTIVE,
        expiresAt: { lt: new Date() },
      },
      data: { status: InvitationStatus.EXPIRED },
    });

    return { expiredCount: result.count };
  }

  // ========================================
  // HELPER: Generate Code
  // ========================================
  private generateInvitationCode(): string {
    const year = new Date().getFullYear();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${year}-${randomPart}`;
  }
}
