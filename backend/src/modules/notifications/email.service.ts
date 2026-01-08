// ============================================================================
// EMAIL SERVICE (SendGrid)
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private fromEmail: string;
  private fromName: string;

  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY')!);
    this.fromEmail = this.configService.get<string>('EMAIL_FROM', 'noreply@platform.com');
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME', 'Premium EdTech Platform');
  }

  // ========================================
  // SEND EMAIL
  // ========================================
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const msg: any = {
        to: options.to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: options.subject,
      };

      if (options.templateId) {
        msg.templateId = options.templateId;
        msg.dynamicTemplateData = options.dynamicTemplateData;
      } else {
        msg.text = options.text;
        msg.html = options.html;
      }

      await sgMail.send(msg);
      this.logger.log(`Email sent to: ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return false;
    }
  }

  // ========================================
  // APPOINTMENT CONFIRMATION
  // ========================================
  async sendAppointmentConfirmation(
    to: string,
    data: {
      studentName: string;
      teacherName: string;
      subjectName: string;
      scheduledAt: string;
      teamsJoinUrl: string;
      orderCode: string;
    },
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1A365D;">Ders Randevunuz Onaylandı</h2>
        
        <p>Merhaba ${data.studentName},</p>
        
        <p>Ders randevunuz başarıyla oluşturuldu. Detaylar aşağıdadır:</p>
        
        <div style="background: #F7FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Öğretmen:</strong> ${data.teacherName}</p>
          <p><strong>Ders:</strong> ${data.subjectName}</p>
          <p><strong>Tarih ve Saat:</strong> ${data.scheduledAt}</p>
          <p><strong>Sipariş Kodu:</strong> ${data.orderCode}</p>
        </div>
        
        <p>Ders saati geldiğinde aşağıdaki butona tıklayarak derse katılabilirsiniz:</p>
        
        <a href="${data.teamsJoinUrl}" style="display: inline-block; background: #1A365D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Derse Katıl
        </a>
        
        <p style="color: #718096; font-size: 14px;">
          Herhangi bir sorunuz olursa destek ekibimizle iletişime geçebilirsiniz.
        </p>
        
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;">
        
        <p style="color: #A0AEC0; font-size: 12px;">
          Bu e-posta Premium EdTech Platform tarafından gönderilmiştir.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Ders Randevunuz Onaylandı - ${data.subjectName}`,
      html,
    });
  }

  // ========================================
  // LESSON REMINDER
  // ========================================
  async sendLessonReminder(
    to: string,
    data: {
      recipientName: string;
      teacherName: string;
      subjectName: string;
      scheduledAt: string;
      teamsJoinUrl: string;
      reminderType: 'morning' | 'hour-before';
    },
  ): Promise<boolean> {
    const reminderText = data.reminderType === 'morning' 
      ? 'Bugün bir dersiniz var' 
      : 'Dersinize 1 saat kaldı';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1A365D;">${reminderText}</h2>
        
        <p>Merhaba ${data.recipientName},</p>
        
        <div style="background: #F7FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Öğretmen:</strong> ${data.teacherName}</p>
          <p><strong>Ders:</strong> ${data.subjectName}</p>
          <p><strong>Saat:</strong> ${data.scheduledAt}</p>
        </div>
        
        <a href="${data.teamsJoinUrl}" style="display: inline-block; background: #1A365D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Derse Katıl
        </a>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Ders Hatırlatması - ${data.subjectName}`,
      html,
    });
  }

  // ========================================
  // PARENT REPORT
  // ========================================
  async sendParentReport(
    to: string,
    data: {
      parentName: string;
      studentName: string;
      subjectName: string;
      lessonDate: string;
      report: string;
    },
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1A365D;">Ders Değerlendirme Raporu</h2>
        
        <p>Sayın ${data.parentName},</p>
        
        <p>${data.studentName}'ın ${data.lessonDate} tarihli ${data.subjectName} dersi için değerlendirme raporu aşağıdadır:</p>
        
        <div style="background: #F7FAFC; padding: 20px; border-radius: 8px; margin: 20px 0; line-height: 1.6;">
          ${data.report.replace(/\n/g, '<br>')}
        </div>
        
        <p style="color: #718096; font-size: 14px;">
          Bu rapor, öğretmen değerlendirmesi temel alınarak hazırlanmıştır.
        </p>
        
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;">
        
        <p style="color: #A0AEC0; font-size: 12px;">
          Premium EdTech Platform - Eğitimde Mükemmellik
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `${data.studentName} - ${data.subjectName} Ders Raporu`,
      html,
    });
  }

  // ========================================
  // BANK TRANSFER INFO
  // ========================================
  async sendBankTransferInfo(
    to: string,
    data: {
      studentName: string;
      orderCode: string;
      amount: number;
      bankName: string;
      iban: string;
      deadline: string;
    },
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1A365D;">Havale/EFT Bilgileri</h2>
        
        <p>Merhaba ${data.studentName},</p>
        
        <p>Ders randevunuz oluşturuldu. Ödemeyi tamamlamak için aşağıdaki hesaba havale/EFT yapmanız gerekmektedir:</p>
        
        <div style="background: #F7FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Banka:</strong> ${data.bankName}</p>
          <p><strong>IBAN:</strong> ${data.iban}</p>
          <p><strong>Tutar:</strong> ${data.amount.toFixed(2)} TL</p>
          <p><strong>Açıklama:</strong> ${data.orderCode}</p>
        </div>
        
        <p style="color: #E53E3E; font-weight: bold;">
          ⚠️ Son Ödeme Tarihi: ${data.deadline}
        </p>
        
        <p style="color: #718096; font-size: 14px;">
          Lütfen açıklama kısmına sipariş kodunuzu yazmayı unutmayınız. 
          Ödeme onaylandıktan sonra ders linkiniz e-posta ile gönderilecektir.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Ödeme Bilgileri - ${data.orderCode}`,
      html,
    });
  }
}
