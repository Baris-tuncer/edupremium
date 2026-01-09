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
exports.InvitationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const client_1 = require("@prisma/client");
let InvitationsService = class InvitationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createInvitations(adminUserId, dto) {
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
                    status: client_1.InvitationStatus.ACTIVE,
                },
            });
            invitations.push(invitation);
        }
        return invitations;
    }
    async listInvitations(page = 1, limit = 20, status) {
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
    async revokeInvitation(id) {
        const invitation = await this.prisma.invitationCode.findUnique({
            where: { id },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.status !== client_1.InvitationStatus.ACTIVE) {
            throw new common_1.BadRequestException('Only active invitations can be revoked');
        }
        return this.prisma.invitationCode.update({
            where: { id },
            data: { status: client_1.InvitationStatus.REVOKED },
        });
    }
    async validateInvitationCode(code, email) {
        const invitation = await this.prisma.invitationCode.findUnique({
            where: { code },
        });
        if (!invitation) {
            return { valid: false, reason: 'Invalid code' };
        }
        if (invitation.status !== client_1.InvitationStatus.ACTIVE) {
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
    async expireOldInvitations() {
        const result = await this.prisma.invitationCode.updateMany({
            where: {
                status: client_1.InvitationStatus.ACTIVE,
                expiresAt: { lt: new Date() },
            },
            data: { status: client_1.InvitationStatus.EXPIRED },
        });
        return { expiredCount: result.count };
    }
    generateInvitationCode() {
        const year = new Date().getFullYear();
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `INV-${year}-${randomPart}`;
    }
};
exports.InvitationsService = InvitationsService;
exports.InvitationsService = InvitationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], InvitationsService);
//# sourceMappingURL=invitations.service.js.map