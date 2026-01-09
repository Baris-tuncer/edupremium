// ============================================================================
// SMS SERVICE - Matches NotificationsListener exactly
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {}

  // Listener calls: sendText(phone, message)
  async sendText(to: string, message: string): Promise<boolean> {
    this.logger.log(`[SMS] To: ${to}, Message: ${message.substring(0, 50)}...`);
    // TODO: Integrate with SMS provider (Netgsm, Twilio, etc.)
    return true;
  }

  // Alias
  async send(to: string, message: string): Promise<boolean> {
    return this.sendText(to, message);
  }

  // Listener calls: sendLessonReminder(phone, { name, subject, date })
  async sendLessonReminder(
    to: string,
    data: {
      name: string;
      subject: string;
      date: Date;
    },
  ): Promise<boolean> {
    const message = `Merhaba ${data.name}, ${data.date.toLocaleString('tr-TR')} tarihinde ${data.subject} dersiniz var.`;
    return this.sendText(to, message);
  }

  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    return this.sendText(to, `EduPremium doğrulama kodunuz: ${code}`);
  }
}
