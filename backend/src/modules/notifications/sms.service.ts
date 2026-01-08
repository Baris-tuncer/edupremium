// ============================================================================
// SMS SERVICE (NetGSM)
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private userCode: string;
  private password: string;
  private header: string;
  private baseUrl = 'https://api.netgsm.com.tr/sms/send/get';

  constructor(private configService: ConfigService) {
    this.userCode = this.configService.get<string>('NETGSM_USER_CODE')!;
    this.password = this.configService.get<string>('NETGSM_PASSWORD')!;
    this.header = this.configService.get<string>('NETGSM_HEADER')!;
  }

  // ========================================
  // SEND SMS
  // ========================================
  async sendSms(phone: string, message: string): Promise<boolean> {
    try {
      // Format phone number (remove +90 if present)
      const formattedPhone = phone.replace(/^\+90/, '').replace(/\D/g, '');

      const params = new URLSearchParams({
        usercode: this.userCode,
        password: this.password,
        gsmno: formattedPhone,
        message: message,
        msgheader: this.header,
        dil: 'TR',
      });

      const response = await axios.get(`${this.baseUrl}?${params.toString()}`);

      // NetGSM returns codes: 00 = success, 01 = success, others = error
      const responseCode = response.data.toString().split(' ')[0];
      
      if (['00', '01', '02'].includes(responseCode)) {
        this.logger.log(`SMS sent to: ${formattedPhone}`);
        return true;
      }

      this.logger.warn(`SMS failed with code: ${responseCode}`);
      return false;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phone}`, error);
      return false;
    }
  }

  // ========================================
  // APPOINTMENT CONFIRMATION
  // ========================================
  async sendAppointmentConfirmation(
    phone: string,
    data: {
      teacherName: string;
      subjectName: string;
      scheduledAt: string;
    },
  ): Promise<boolean> {
    const message = `Ders randevunuz onaylandi. ${data.subjectName} - ${data.teacherName}, ${data.scheduledAt}. Detaylar icin e-postanizi kontrol edin. - EdTech Platform`;
    
    return this.sendSms(phone, message);
  }

  // ========================================
  // LESSON REMINDER
  // ========================================
  async sendLessonReminder(
    phone: string,
    data: {
      subjectName: string;
      scheduledAt: string;
      reminderType: 'morning' | 'hour-before';
    },
  ): Promise<boolean> {
    const reminderText = data.reminderType === 'morning' 
      ? 'Bugun bir dersiniz var' 
      : 'Dersinize 1 saat kaldi';

    const message = `${reminderText}: ${data.subjectName}, ${data.scheduledAt}. Derse katilmak icin e-postanizdaki linki kullanin. - EdTech Platform`;
    
    return this.sendSms(phone, message);
  }

  // ========================================
  // PARENT NOTIFICATION
  // ========================================
  async sendParentNotification(
    phone: string,
    studentName: string,
    message: string,
  ): Promise<boolean> {
    const smsMessage = `${studentName} icin bilgilendirme: ${message} - EdTech Platform`;
    
    return this.sendSms(phone, smsMessage);
  }

  // ========================================
  // BANK TRANSFER REMINDER
  // ========================================
  async sendBankTransferReminder(
    phone: string,
    data: {
      orderCode: string;
      deadline: string;
    },
  ): Promise<boolean> {
    const message = `Odeme hatirlatmasi: ${data.orderCode} kodlu randevunuz icin son odeme tarihi ${data.deadline}. Odeme yapilmazsa randevu iptal edilecektir. - EdTech Platform`;
    
    return this.sendSms(phone, message);
  }
}
