import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  private enabled: boolean;

  constructor() {
    // İleride SMS API credentials buraya
    this.enabled = process.env.SMS_ENABLED === 'true';
  }

  async sendInvitationCode(
    phone: string,
    code: string,
    expiresAt?: Date
  ): Promise<boolean> {
    if (!this.enabled) {
      console.log('📱 SMS (TEST MODE):', phone, '→ Kod:', code);
      return true;
    }

    try {
      const expiryText = expiresAt 
        ? new Date(expiresAt).toLocaleDateString('tr-TR')
        : '7 gün';

      const message = `EduPremium davet kodunuz: ${code}

Kayit icin: edupremium.com/register

Kod ${expiryText} gecerlidir.`;

      console.log('📱 SMS GÖNDER:', phone);
      console.log('Mesaj:', message);

      // TODO: SMS API entegrasyonu
      // Netgsm, İleti Merkezi, Twilio vs.
      // await smsApi.send(phone, message);

      return true;
    } catch (error) {
      console.error('❌ SMS error:', error);
      return false;
    }
  }
}
