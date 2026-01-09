// ============================================================================
// INVITATIONS SERVICE - Matches AdminController exactly
// ============================================================================

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { InvitationStatus } from '@prisma/client';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  // Controller calls: createInvitations (line 100)
  async createInvitations(
    adminUserId: string,
    data: { assignedEmail?: string; expiresInDays?: number },
  ) {
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 30));

    const invitation = await this.prisma.invitationCode.create({
      data: {
        code,
        assignedEmail: data.assignedEmail,
        createdById: adminUserId,
        expiresAt,
        status: InvitationStatus.ACTIVE,
      },
    });

    return {
      id: invitation.id,
      code: invitation.code,
      assignedEmail: invitation.assignedEmail,
      expiresAt: invitation.expiresAt,
      status: invitation.status,
    };
  }

  // Controller calls: listInvitations (line 110)
  async listInvitations(page = 1, limit = 20, status?: InvitationStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [invitations, total] = await Promise.all([
      this.prisma.invitationCode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invitationCode.count({ where }),
    ]);

    return {
      data: invitations.map((inv) => ({
        id: inv.id,
        code: inv.code,
        status: inv.status,
        assignedEmail: inv.assignedEmail,
        createdById: inv.createdById,
        usedById: inv.usedById,
        usedAt: inv.usedAt,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Controller calls: revokeInvitation (line 117)
  async revokeInvitation(codeId: string) {
    const invitation = await this.prisma.invitationCode.findUnique({
      where: { id: codeId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation code not found');
    }

    if (invitation.status !== InvitationStatus.ACTIVE) {
      throw new BadRequestException('Can only revoke active invitation codes');
    }

    return this.prisma.invitationCode.update({
      where: { id: codeId },
      data: { status: InvitationStatus.REVOKED },
    });
  }

  // Additional methods
  async validateInvitationCode(code: string): Promise<boolean> {
    const invitation = await this.prisma.invitationCode.findFirst({
      where: {
        code,
        status: InvitationStatus.ACTIVE,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    return !!invitation;
  }

  async getInvitationByCode(code: string) {
    const invitation = await this.prisma.invitationCode.findUnique({
      where: { code },
    });
    if (!invitation) {
      throw new NotFoundException('Invitation code not found');
    }
    return invitation;
  }

  // Aliases for backwards compatibility
  async createInvitationCode(adminUserId: string, assignedEmail?: string, expiresInDays = 30) {
    return this.createInvitations(adminUserId, { assignedEmail, expiresInDays });
  }

  async listInvitationCodes(page = 1, limit = 20, status?: InvitationStatus) {
    return this.listInvitations(page, limit, status);
  }

  async revokeInvitationCode(codeId: string) {
    return this.revokeInvitation(codeId);
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'EDU-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
