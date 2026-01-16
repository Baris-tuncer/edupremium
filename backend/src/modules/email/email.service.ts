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
        from: 'EduPremium <onboarding@resend.dev>',
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
                  <a href="https://edupremium.vercel.app/register" class="button">Kayıt Olmak İçin Tıklayın</a>
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

  // ✨ Randevu Onayı Email'i
  async sendAppointmentConfirmation(
    email: string,
    studentName: string,
    teacherName: string,
    lessonDate: Date,
    lessonTime: string,
    subject: string,
    orderCode: string
  ): Promise<boolean> {
    if (!this.enabled) {
      console.log('📧 EMAIL (TEST MODE):', email, '→ Randevu onayı:', lessonDate);
      return true;
    }

    try {
      const formattedDate = new Date(lessonDate).toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      await this.resend.emails.send({
        from: 'EduPremium <onboarding@resend.dev>',
        to: email,
        subject: '✅ Randevunuz Onaylandı - EduPremium',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .lesson-box { background: white; border: 3px solid #a855f7; border-radius: 10px; padding: 20px; margin: 20px 0; }
              .lesson-item { display: flex; align-items: center; margin: 10px 0; }
              .lesson-icon { font-size: 24px; margin-right: 10px; }
              .button { display: inline-block; background: #a855f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Randevunuz Onaylandı!</h1>
                <p>Dersiniz için hazır mısınız?</p>
              </div>
              <div class="content">
                <p>Merhaba <strong>${studentName}</strong>,</p>
                
                <p>Randevunuz oluşturuldu ve öğretmeniniz bilgilendirildi!</p>

                <div class="lesson-box">
                  <h3 style="color: #7c3aed; margin-top: 0;">📚 Ders Detayları</h3>
                  
                  <div class="lesson-item">
                    <span class="lesson-icon">👨‍🏫</span>
                    <div>
                      <strong>Öğretmen:</strong> ${teacherName}
                    </div>
                  </div>

                  <div class="lesson-item">
                    <span class="lesson-icon">📖</span>
                    <div>
                      <strong>Ders:</strong> ${subject}
                    </div>
                  </div>

                  <div class="lesson-item">
                    <span class="lesson-icon">📅</span>
                    <div>
                      <strong>Tarih:</strong> ${formattedDate}
                    </div>
                  </div>

                  <div class="lesson-item">
                    <span class="lesson-icon">🕐</span>
                    <div>
                      <strong>Saat:</strong> ${lessonTime}
                    </div>
                  </div>

                  <div class="lesson-item">
                    <span class="lesson-icon">🔖</span>
                    <div>
                      <strong>Sipariş No:</strong> ${orderCode}
                    </div>
                  </div>
                </div>

                <div class="alert-box">
                  <p style="margin: 0;"><strong>⚠️ Önemli:</strong> Lütfen dersten 5 dakika önce sisteme giriş yapın. İnternet bağlantınızı ve kamera/mikrofonunuzu kontrol edin.</p>
                </div>

                <center>
                  <a href="https://edupremium.vercel.app/student/lessons" class="button">Derslerime Git</a>
                </center>

                <p><strong>💡 Hazırlık İpuçları:</strong></p>
                <ul>
                  <li>Ders materyallerinizi hazırlayın</li>
                  <li>Sessiz bir ortam seçin</li>
                  <li>Not defterinizi yanınızda bulundurun</li>
                  <li>Sorularınızı önceden not alın</li>
                </ul>

                <p>İyi dersler!<br>
                <strong>EduPremium Ekibi</strong></p>
              </div>
              <div class="footer">
                <p>© 2026 EduPremium. Tüm hakları saklıdır.</p>
                <p>📞 Destek: destek@edupremium.com | 📱 +90 850 309 00 00</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log('✅ Appointment confirmation sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Email error:', error);
      return false;
    }
  }

  // ✨ Ödeme Onayı Email'i
  async sendPaymentConfirmation(
    email: string,
    userName: string,
    teacherName: string,
    subject: string,
    amount: number,
    transactionId: string,
    lessonDate: Date
  ): Promise<boolean> {
    if (!this.enabled) {
      console.log('📧 EMAIL (TEST MODE):', email, '→ Ödeme onayı:', amount, 'TL');
      return true;
    }

    try {
      const formattedAmount = amount.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      const currentDate = new Date().toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const formattedLessonDate = new Date(lessonDate).toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      await this.resend.emails.send({
        from: 'EduPremium <onboarding@resend.dev>',
        to: email,
        subject: '✅ Ödemeniz Alındı - EduPremium',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .payment-box { background: white; border: 3px solid #10b981; border-radius: 10px; padding: 20px; margin: 20px 0; }
              .payment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .payment-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; color: #059669; }
              .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
              .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .info-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💳 Ödeme Onayı</h1>
                <p>İşleminiz başarıyla tamamlandı!</p>
              </div>
              <div class="content">
                <div class="success-icon">✅</div>
                
                <p>Merhaba <strong>${userName}</strong>,</p>
                
                <p>Ödemeniz başarıyla alındı. Dersiniz onaylandı! 🎉</p>

                <div class="payment-box">
                  <h3 style="color: #059669; margin-top: 0;">📋 Ödeme Detayları</h3>
                  
                  <div class="payment-row">
                    <span>Öğretmen:</span>
                    <span><strong>${teacherName}</strong></span>
                  </div>

                  <div class="payment-row">
                    <span>Ders:</span>
                    <span>${subject}</span>
                  </div>

                  <div class="payment-row">
                    <span>Ders Tarihi:</span>
                    <span>${formattedLessonDate}</span>
                  </div>

                  <div class="payment-row">
                    <span>Ödeme Tarihi:</span>
                    <span>${currentDate}</span>
                  </div>

                  <div class="payment-row">
                    <span>İşlem No:</span>
                    <span>${transactionId}</span>
                  </div>

                  <div class="payment-row">
                    <span>Toplam Tutar:</span>
                    <span>${formattedAmount} TL</span>
                  </div>
                </div>

                <div class="info-box">
                  <h3 style="margin-top: 0;">🎓 Sırada Ne Var?</h3>
                  <ul style="margin: 10px 0;">
                    <li>Dersiniz onaylandı ve öğretmeniniz bilgilendirildi</li>
                    <li>Ders saatinden önce email ile hatırlatma alacaksınız</li>
                    <li>Derslerinizi panelinizden takip edebilirsiniz</li>
                    <li>Faturanız email adresinize ayrıca gönderilecektir</li>
                  </ul>
                </div>

                <center>
                  <a href="https://edupremium.vercel.app/student/dashboard" class="button">Panelime Git</a>
                </center>

                <p>Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin.</p>
                
                <p>İyi dersler!<br>
                <strong>EduPremium Ekibi</strong></p>
              </div>
              <div class="footer">
                <p>© 2026 EduPremium. Tüm hakları saklıdır.</p>
                <p>📞 Destek: destek@edupremium.com | 📱 +90 850 309 00 00</p>
                <p style="font-size: 10px; color: #94a3b8; margin-top: 10px;">
                  Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log('✅ Payment confirmation sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Email error:', error);
      return false;
    }
  }
}
