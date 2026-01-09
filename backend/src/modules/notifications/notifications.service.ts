import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendEmail(to: string, subject: string, body: string) {
    console.log(`Mock email to ${to}: ${subject}`);
  }

  async sendSms(to: string, message: string) {
    console.log(`Mock SMS to ${to}: ${message}`);
  }
}
