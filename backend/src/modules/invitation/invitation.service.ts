import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { InvitationStatus } from '@prisma/client';

@Injectable()
export class InvitationService {
  constructor(private prisma: PrismaService) {}

  // Davet kodu üret
  async createInvitationCode(data: {
    email?: string;
    phone?: string;
    createdById: string;
    expiresInDays?: number;
  }) {
    if (!data.email && !data.phone) {
      throw new BadRequestException('Email veya telefon numarası gerekli');
    }

    // 6 haneli benzersiz kod üret
    const code = await this.generateUniqueCode();
    
    // Varsayılan 7 gün geçerlilik
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
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // Tüm davet kodlarını listele
  async getAllInvitations(filters?: {
    status?: InvitationStatus;
    createdById?: string;
  }) {
    return this.prisma.invitationCode.findMany({
      where: {
        status: filters?.status,
        createdById: filters?.createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        teachers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Tek davet kodunu getir
  async getInvitationById(id: string) {
    const invitation = await this.prisma.invitationCode.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        teachers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userId: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Davet kodu bulunamadı');
    }

    return invitation;
  }

  // Kod ile davet kodunu doğrula
  async validateInvitationCode(code: string) {
    const invitation = await this.prisma.invitationCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!invitation) {
      throw new BadRequestException('Geçersiz davet kodu');
    }

    if (invitation.status !== InvitationStatus.ACTIVE) {
      throw new BadRequestException('Bu davet kodu artık kullanılamaz');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      await this.prisma.invitationCode.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('Davet kodunun süresi dolmuş');
    }

    return invitation;
  }

  // Davet kodunu kullan
  async useInvitationCode(code: string, teacherId: string) {
    const invitation = await this.validateInvitationCode(code);

    return this.prisma.invitationCode.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.USED,
        usedAt: new Date(),
      },
    });
  }

  // Davet kodunu iptal et
  async revokeInvitation(id: string) {
    const invitation = await this.getInvitationById(id);

    if (invitation.status === InvitationStatus.USED) {
      throw new BadRequestException('Kullanılmış davet kodu iptal edilemez');
    }

    return this.prisma.invitationCode.update({
      where: { id },
      data: { status: InvitationStatus.REVOKED },
    });
  }

  // SMS gönder (Placeholder - SMS servis entegrasyonu gerekli)
  async sendSMS(id: string) {
    const invitation = await this.getInvitationById(id);

    if (!invitation.assignedPhone) {
      throw new BadRequestException('Bu davet koduna atanmış telefon numarası yok');
    }

    // TODO: SMS servis entegrasyonu (Twilio, Vonage, vs.)
    const message = `EduPremium Davet Kodu: ${invitation.code}\n\nBu kod ile kayıt olmak için: https://edupremium-jet.vercel.app/register?code=${invitation.code}\n\nKod 7 gün geçerlidir.`;
    
    console.log(`[SMS] Sending to ${invitation.assignedPhone}:`, message);

    // SMS servis burada çağrılacak
    // await smsService.send(invitation.assignedPhone, message);

    return {
      success: true,
      message: 'SMS gönderildi',
      phone: invitation.assignedPhone,
    };
  }

  // Email gönder (Placeholder - Email servis entegrasyonu gerekli)
  async sendEmail(id: string) {
    const invitation = await this.getInvitationById(id);

    if (!invitation.assignedEmail) {
      throw new BadRequestException('Bu davet koduna atanmış email adresi yok');
    }

    // TODO: Email servis entegrasyonu (SendGrid, AWS SES, vs.)
    const emailContent = {
      to: invitation.assignedEmail,
      subject: 'EduPremium Öğretmen Davet Kodu',
      html: `
        <h2>EduPremium'a Hoş Geldiniz!</h2>
        <p>Öğretmen olarak platforma katılmanız için davet edildiniz.</p>
        <p><strong>Davet Kodunuz:</strong> <code style="font-size: 24px; font-weight: bold;">${invitation.code}</code></p>
        <p>Kayıt olmak için <a href="https://edupremium-jet.vercel.app/register?code=${invitation.code}">buraya tıklayın</a>.</p>
        <p><small>Bu kod ${invitation.expiresAt?.toLocaleDateString('tr-TR')} tarihine kadar geçerlidir.</small></p>
      `,
    };

    console.log('[EMAIL] Sending to:', invitation.assignedEmail);
    console.log(emailContent);

    // Email servis burada çağrılacak
    // await emailService.send(emailContent);

    return {
      success: true,
      message: 'Email gönderildi',
      email: invitation.assignedEmail,
    };
  }

  // 6 haneli benzersiz kod üret
  private async generateUniqueCode(): Promise<string> {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Karışık karakterler (0, O, 1, I hariç)
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      // Kodun benzersiz olup olmadığını kontrol et
      const existing = await this.prisma.invitationCode.findUnique({
        where: { code },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    return code;
  }

  // Süresi dolmuş kodları temizle (Cron job için)
  async expireOldCodes() {
    const now = new Date();
    
    const result = await this.prisma.invitationCode.updateMany({
      where: {
        status: InvitationStatus.ACTIVE,
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: InvitationStatus.EXPIRED,
      },
    });

    return {
      expiredCount: result.count,
    };
  }
}
