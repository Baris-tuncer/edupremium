// ============================================================================
// EMAIL SERVICE - Matches NotificationsListener exactly
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  private async send(to: string, subject: string, html: string): Promise<boolean> {
    this.logger.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
    // TODO: Integrate with SendGrid or other email provider
    return true;
  }

  // Listener calls: sendBankTransferInstructions(email, { studentName, orderCode, amount, deadline })
  async sendBankTransferInstructions(
    to: string,
    data: {
      studentName: string;
      orderCode: string;
      amount: number;
      deadline: Date;
    },
  ): Promise<boolean> {
    return this.send(
      to,
      'Havale Bilgileri',
      `<p>Merhaba ${data.studentName},</p>
       <p>Sipariş Kodu: ${data.orderCode}</p>
       <p>Tutar: ${data.amount} TL</p>
       <p>Son Ödeme Tarihi: ${data.deadline.toLocaleDateString('tr-TR')}</p>`,
    );
  }

  // Listener calls: sendAppointmentConfirmation(email, { recipientName, teacherName, subject, scheduledAt, teamsJoinUrl })
  async sendAppointmentConfirmation(
    to: string,
    data: {
      recipientName: string;
      teacherName: string;
      subject: string;
      scheduledAt: Date;
      teamsJoinUrl: string;
    },
  ): Promise<boolean> {
    return this.send(
      to,
      'Randevu Onayı',
      `<p>Merhaba ${data.recipientName},</p>
       <p>Ders: ${data.subject}</p>
       <p>Öğretmen: ${data.teacherName}</p>
       <p>Tarih: ${data.scheduledAt.toLocaleString('tr-TR')}</p>
       <p>Teams Link: ${data.teamsJoinUrl}</p>`,
    );
  }

  // Listener calls: sendAppointmentCancellation(email, { name, subject, scheduledAt })
  async sendAppointmentCancellation(
    to: string,
    data: {
      name: string;
      subject: string;
      scheduledAt: Date;
    },
  ): Promise<boolean> {
    return this.send(
      to,
      'Randevu İptali',
      `<p>Merhaba ${data.name},</p>
       <p>${data.subject} dersiniz (${data.scheduledAt.toLocaleString('tr-TR')}) iptal edilmiştir.</p>`,
    );
  }

  // Listener calls: sendFeedbackRequest(email, { teacherName, studentName, subject, appointmentId })
  async sendFeedbackRequest(
    to: string,
    data: {
      teacherName: string;
      studentName: string;
      subject: string;
      appointmentId: string;
    },
  ): Promise<boolean> {
    return this.send(
      to,
      'Ders Değerlendirmesi',
      `<p>Merhaba ${data.teacherName},</p>
       <p>${data.studentName} ile yaptığınız ${data.subject} dersini değerlendirin.</p>`,
    );
  }

  // Listener calls: sendTeacherApproval(email, { name })
  async sendTeacherApproval(
    to: string,
    data: { name: string },
  ): Promise<boolean> {
    return this.send(
      to,
      'Öğretmen Başvurunuz Onaylandı',
      `<p>Tebrikler ${data.name}!</p>
       <p>Öğretmen başvurunuz onaylanmıştır.</p>`,
    );
  }

  // Listener calls: sendLessonReminder(email, { message, scheduledAt, teamsJoinUrl })
  async sendLessonReminder(
    to: string,
    data: {
      message: string;
      scheduledAt: Date;
      teamsJoinUrl?: string;
    },
  ): Promise<boolean> {
    return this.send(
      to,
      'Ders Hatırlatması',
      `<p>${data.message}</p>
       <p>Tarih: ${data.scheduledAt.toLocaleString('tr-TR')}</p>
       ${data.teamsJoinUrl ? `<p>Teams Link: ${data.teamsJoinUrl}</p>` : ''}`,
    );
  }

  // Additional methods that might be needed
  async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
    return this.send(to, 'Hoş Geldiniz', `<p>Merhaba ${firstName}!</p>`);
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
    return this.send(to, 'Şifre Sıfırlama', `<a href="${resetLink}">Şifrenizi sıfırlayın</a>`);
  }

  // Alias for backwards compatibility
  async sendBankTransferInfo(to: string, data: any): Promise<boolean> {
    return this.sendBankTransferInstructions(to, data);
  }
}
