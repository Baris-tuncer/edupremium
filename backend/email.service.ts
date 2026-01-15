import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private enabled: boolean;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.enabled = !!apiKey;
    
    if (this.enabled) {
      this.resend = new Resend(apiKey);
    }
  }

  async sendInvitationCode(
    email: string,
    code: string,
    expiresAt?: Date
  ): Promise<boolean> {
    if (!this.enabled) {
      console.log('📧 EMAIL (TEST MODE):', email, '→ Kod:', code);
      return true;
    }

    try {
      const expiryText = expiresAt 
        ? new Date(expiresAt).toLocaleDateString('tr-TR')
        : '7 gün içinde';

      await this.resend.emails.send({
        from: 'EduPremium <onboarding@resend.dev>', // Test email
        to: email,
        subject: 'EduPremium Öğretmen Davet Kodunuz',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .code-box { background: white; border: 3px solid #3b82f6; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
              .code { font-size: 32px; font-weight: bold; color: #1e3a8a; letter-spacing: 3px; font-family: monospace; }
              .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 EduPremium</h1>
                <p>Öğretmen Davet Kodunuz Hazır!</p>
              </div>
              <div class="content">
                <p>Merhaba,</p>
                <p>EduPremium platformuna öğretmen olarak kayıt olabilmeniz için davet kodunuz oluşturuldu.</p>
                
                <div class="code-box">
                  <p style="margin: 0; font-size: 14px; color: #64748b;">Davet Kodunuz:</p>
                  <p class="code">${code}</p>
                </div>

                <p><strong>Kayıt İçin:</strong></p>
                <ol>
                  <li>Kayıt sayfasına gidin</li>
                  <li>Yukarıdaki kodu girin</li>
                  <li>Bilgilerinizi doldurun</li>
                  <li>Hemen öğretmeye başlayın!</li>
                </ol>

                <center>
                  <a href="https://edupremium.com/register" class="button">Kayıt Olmak İçin Tıklayın</a>
                </center>

                <p style="color: #ef4444; font-size: 14px;">
                  ⚠️ Bu kod ${expiryText} tarihine kadar geçerlidir.
                </p>

                <p>Herhangi bir sorunuz varsa bizimle iletişime geçebilirsiniz.</p>
                
                <p>İyi dersler!<br>
                <strong>EduPremium Ekibi</strong></p>
              </div>
              <div class="footer">
                <p>© 2026 EduPremium. Tüm hakları saklıdır.</p>
                <p>Bu email otomatik olarak gönderilmiştir.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log('✅ Email sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Email error:', error);
      return false;
    }
  }
}
