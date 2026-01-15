import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { InvitationStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class InvitationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async createInvitationCode(data: {
    email?: string;
    phone?: string;
    createdById: string;
    expiresInDays?: number;
  }) {
    if (!data.email && !data.phone) {
      throw new BadRequestException('Email veya telefon numarası gerekli');
    }

    const code = await this.generateUniqueCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 7));

    return this.prisma.invitationCode.create({
      data: {
        code,
        assignedEmail: data.email,
        assignedPhone: data.phone,
        createdById: data.createdById,
        expiresAt,
        status: InvitationStatus.ACTIVE,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async getAllInvitations(filters?: { status?: InvitationStatus; createdById?: string }) {
    return this.prisma.invitationCode.findMany({
      where: { status: filters?.status, createdById: filters?.createdById },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        teachers: { select: { id: true, firstName: true, lastName: true, userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvitationById(id: string) {
    const invitation = await this.prisma.invitationCode.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        teachers: { select: { id: true, firstName: true, lastName: true, userId: true } },
      },
    });
    if (!invitation) throw new NotFoundException('Davet kodu bulunamadı');
    return invitation;
  }

  async validateInvitationCode(code: string) {
    const invitation = await this.prisma.invitationCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!invitation) throw new BadRequestException('Geçersiz davet kodu');
    if (invitation.status !== InvitationStatus.ACTIVE) throw new BadRequestException('Bu davet kodu artık kullanılamaz');
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      await this.prisma.invitationCode.update({ where: { id: invitation.id }, data: { status: InvitationStatus.EXPIRED } });
      throw new BadRequestException('Davet kodunun süresi dolmuş');
    }
    return invitation;
  }

  async useInvitationCode(code: string, teacherId: string) {
    const invitation = await this.validateInvitationCode(code);
    return this.prisma.invitationCode.update({ where: { id: invitation.id }, data: { status: InvitationStatus.USED, usedAt: new Date() } });
  }

  async revokeInvitation(id: string) {
    const invitation = await this.getInvitationById(id);
    if (invitation.status === InvitationStatus.USED) throw new BadRequestException('Kullanılmış davet kodu iptal edilemez');
    return this.prisma.invitationCode.update({ where: { id }, data: { status: InvitationStatus.REVOKED } });
  }

  async sendSMS(id: string) {
    const invitation = await this.getInvitationById(id);
    if (!invitation.assignedPhone) throw new BadRequestException('Bu davet koduna atanmış telefon numarası yok');
    const success = await this.smsService.sendInvitationCode(invitation.assignedPhone, invitation.code, invitation.expiresAt);
    if (!success) throw new BadRequestException('SMS gönderilemedi');
    return { success: true, message: 'SMS başarıyla gönderildi', phone: invitation.assignedPhone };
  }

  async sendEmail(id: string) {
    const invitation = await this.getInvitationById(id);
    if (!invitation.assignedEmail) throw new BadRequestException('Bu davet koduna atanmış email adresi yok');
    const success = await this.emailService.sendInvitationCode(invitation.assignedEmail, invitation.code, invitation.expiresAt);
    if (!success) throw new BadRequestException('Email gönderilemedi');
    return { success: true, message: 'Email başarıyla gönderildi', email: invitation.assignedEmail };
  }

  private async generateUniqueCode(): Promise<string> {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code: string;
    let isUnique = false;
    while (!isUnique) {
      code = '';
      for (let i = 0; i < 6; i++) code += characters.charAt(Math.floor(Math.random() * characters.length));
      const existing = await this.prisma.invitationCode.findUnique({ where: { code } });
      if (!existing) isUnique = true;
    }
    return code;
  }

  async expireOldCodes() {
    const now = new Date();
    const result = await this.prisma.invitationCode.updateMany({
      where: { status: InvitationStatus.ACTIVE, expiresAt: { lt: now } },
      data: { status: InvitationStatus.EXPIRED },
    });
    return { expiredCount: result.count };
  }
}
