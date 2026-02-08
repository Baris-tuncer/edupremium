export function getStudentPaymentConfirmationEmail(data: {
  studentName: string;
  teacherName: string;
  subject: string;
  date: string;
  time: string;
  price: number;
  orderId: string;
  meetingLink?: string | null;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); border-radius: 20px 20px 0 0; padding: 50px 40px;">
          <tr>
            <td align="center">
              <p style="color: #d4af37; margin: 0 0 8px 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Premium Eğitim</p>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px;">EduPremium</h1>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 50px 40px 30px 40px;">
          <tr>
            <td align="center">
              <div style="width: 90px; height: 90px; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); border-radius: 50%; display: inline-block; line-height: 90px;">
                <span style="font-size: 40px;">✓</span>
              </div>
              <h2 style="color: #0d1b2a; margin: 28px 0 12px 0; font-size: 26px; font-weight: 600;">Ödemeniz Onaylandı</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">Merhaba ${data.studentName}, dersiniz başarıyla oluşturuldu.</p>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 30px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 30px; border-left: 4px solid #d4af37;">
                <tr>
                  <td>
                    <h3 style="color: #0d1b2a; margin: 0 0 24px 0; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">📚 Ders Detayları</h3>
                    <table width="100%" cellspacing="0" cellpadding="12">
                      <tr>
                        <td style="color: #64748b; font-size: 14px; width: 35%; border-bottom: 1px solid #e2e8f0;">Öğretmen</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.teacherName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Ders</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.subject}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Tarih</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.date}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Saat</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.time}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Süre</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600;">60 Dakika</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 30px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%); border-radius: 16px; padding: 30px;">
                <tr>
                  <td align="center">
                    <p style="color: #d4af37; margin: 0 0 8px 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Ödenen Tutar</p>
                    <p style="color: white; margin: 0; font-size: 38px; font-weight: 300;">${data.price.toLocaleString('tr-TR')} <span style="font-size: 20px;">TL</span></p>
                    <p style="color: #8b9dc3; margin: 12px 0 0 0; font-size: 12px;">Sipariş No: ${data.orderId}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 50px 40px;">
          <tr>
            <td align="center">
              <p style="color: #64748b; margin: 0 0 16px 0; font-size: 14px;">Ders saatinde aşağıdaki butondan derslerinize gidin ve "Derse Katıl" butonuna tıklayın.</p>
              <a href="https://www.visserr.com/student/lessons" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); color: #0d1b2a; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">Derslerime Git</a>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%); border-radius: 0 0 20px 20px; padding: 40px;">
          <tr>
            <td align="center">
              <p style="color: #8b9dc3; margin: 0 0 12px 0; font-size: 13px;">Sorularınız mı var?</p>
              <a href="mailto:destek@visserr.com" style="color: #d4af37; text-decoration: none; font-size: 14px; font-weight: 500;">destek@visserr.com</a>
              <p style="color: #4a5568; margin: 24px 0 0 0; font-size: 11px;">© 2026 EduPremium. Tüm hakları saklıdır.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getTeacherNewLessonEmail(data: {
  teacherName: string;
  studentName: string;
  subject: string;
  date: string;
  time: string;
  price: number;
  earnings: number;
  meetingLink?: string | null;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); border-radius: 20px 20px 0 0; padding: 50px 40px;">
          <tr>
            <td align="center">
              <p style="color: #d4af37; margin: 0 0 8px 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Öğretmen Paneli</p>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px;">EduPremium</h1>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 50px 40px 30px 40px;">
          <tr>
            <td align="center">
              <div style="width: 90px; height: 90px; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); border-radius: 50%; display: inline-block; line-height: 90px;">
                <span style="font-size: 40px;">🎉</span>
              </div>
              <h2 style="color: #0d1b2a; margin: 28px 0 12px 0; font-size: 26px; font-weight: 600;">Yeni Ders Satışı!</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">Tebrikler ${data.teacherName}! Yeni bir ders satışınız var.</p>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 30px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 30px; border-left: 4px solid #d4af37;">
                <tr>
                  <td>
                    <h3 style="color: #0d1b2a; margin: 0 0 24px 0; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">📖 Ders Bilgileri</h3>
                    <table width="100%" cellspacing="0" cellpadding="12">
                      <tr>
                        <td style="color: #64748b; font-size: 14px; width: 35%; border-bottom: 1px solid #e2e8f0;">Öğrenci</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.studentName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Ders</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.subject}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Tarih</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.date}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Saat</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.time}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Süre</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600;">60 Dakika</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 30px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%); border-radius: 16px; padding: 30px;">
                <tr>
                  <td align="center">
                    <p style="color: #d4af37; margin: 0 0 8px 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Bu Dersten Kazancınız</p>
                    <p style="color: white; margin: 0; font-size: 38px; font-weight: 300;">${data.earnings.toLocaleString('tr-TR')} <span style="font-size: 20px;">TL</span></p>
                    <p style="color: #8b9dc3; margin: 12px 0 0 0; font-size: 12px;">Ders ücreti: ${data.price.toLocaleString('tr-TR')} TL</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 50px 40px;">
          <tr>
            <td align="center">
              <p style="color: #64748b; margin: 0 0 16px 0; font-size: 14px;">Ders saatinde aşağıdaki butondan derslerinize gidin ve "Derse Katıl" butonuna tıklayın.</p>
              <a href="https://www.visserr.com/teacher/lessons" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); color: #0d1b2a; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">Derslerime Git</a>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%); border-radius: 0 0 20px 20px; padding: 40px;">
          <tr>
            <td align="center">
              <p style="color: #8b9dc3; margin: 0 0 12px 0; font-size: 13px;">Sorularınız mı var?</p>
              <a href="mailto:destek@visserr.com" style="color: #d4af37; text-decoration: none; font-size: 14px; font-weight: 500;">destek@visserr.com</a>
              <p style="color: #4a5568; margin: 24px 0 0 0; font-size: 11px;">© 2026 EduPremium. Tüm hakları saklıdır.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getLessonReminderEmail(data: {
  recipientName: string;
  recipientRole: 'student' | 'teacher';
  otherPartyName: string;
  subject: string;
  date: string;
  time: string;
  meetingLink?: string | null;
  hoursUntil: number;
}) {
  const isStudent = data.recipientRole === 'student';
  const roleText = isStudent ? 'Öğretmeniniz' : 'Öğrenciniz';
  const timeText = data.hoursUntil === 24 ? '24 saat' : '1 saat';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); border-radius: 20px 20px 0 0; padding: 50px 40px;">
          <tr>
            <td align="center">
              <p style="color: #d4af37; margin: 0 0 8px 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Ders Hatırlatması</p>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px;">EduPremium</h1>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 50px 40px 30px 40px;">
          <tr>
            <td align="center">
              <div style="width: 90px; height: 90px; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); border-radius: 50%; display: inline-block; line-height: 90px;">
                <span style="font-size: 40px;">⏰</span>
              </div>
              <h2 style="color: #0d1b2a; margin: 28px 0 12px 0; font-size: 26px; font-weight: 600;">Dersinize ${timeText} kaldı!</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">Merhaba ${data.recipientName}, yaklaşan dersinizi hatırlatmak isteriz.</p>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 30px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 30px; border-left: 4px solid #d4af37;">
                <tr>
                  <td>
                    <h3 style="color: #0d1b2a; margin: 0 0 24px 0; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">📚 Ders Detayları</h3>
                    <table width="100%" cellspacing="0" cellpadding="12">
                      <tr>
                        <td style="color: #64748b; font-size: 14px; width: 35%; border-bottom: 1px solid #e2e8f0;">${roleText}</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.otherPartyName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Ders</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.subject}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Tarih</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${data.date}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Saat</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 600;">${data.time}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 20px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); border-radius: 16px; padding: 28px;">
                <tr>
                  <td align="center">
                    <p style="color: #d4af37; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">🎥 Derse Katılın</p>
                    <a href="https://www.visserr.com/${isStudent ? 'student' : 'teacher'}/lessons" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); color: #0d1b2a; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">Derslerime Git</a>
                    <p style="color: #8b9dc3; margin: 14px 0 0 0; font-size: 12px;">Platform üzerinden "Derse Katıl" butonuna tıklayın</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%); border-radius: 0 0 20px 20px; padding: 40px;">
          <tr>
            <td align="center">
              <p style="color: #8b9dc3; margin: 0 0 12px 0; font-size: 13px;">Sorularınız mı var?</p>
              <a href="mailto:destek@visserr.com" style="color: #d4af37; text-decoration: none; font-size: 14px; font-weight: 500;">destek@visserr.com</a>
              <p style="color: #4a5568; margin: 24px 0 0 0; font-size: 11px;">© 2026 EduPremium. Tüm hakları saklıdır.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
// Bu fonksiyonu email-templates.ts dosyasının SONUNA ekle

export function getInvitationCodeEmail(data: {
  recipientEmail: string;
  invitationCode: string;
  expiresAt: string;
  personalMessage?: string;
}) {
  const expiryDate = new Date(data.expiresAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const messageSection = data.personalMessage ? `
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 20px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: #fffbeb; border-radius: 12px; padding: 20px 24px; border-left: 4px solid #d4af37;">
                <tr>
                  <td>
                    <p style="color: #92400e; margin: 0 0 4px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">📝 Size Özel Mesaj</p>
                    <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.6;">${data.personalMessage}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); border-radius: 20px 20px 0 0; padding: 50px 40px;">
          <tr>
            <td align="center">
              <p style="color: #d4af37; margin: 0 0 8px 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Özel Davet</p>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px;">EduPremium</h1>
            </td>
          </tr>
        </table>

        <!-- Welcome -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 50px 40px 30px 40px;">
          <tr>
            <td align="center">
              <div style="width: 90px; height: 90px; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); border-radius: 50%; display: inline-block; line-height: 90px;">
                <span style="font-size: 40px;">🎓</span>
              </div>
              <h2 style="color: #0d1b2a; margin: 28px 0 12px 0; font-size: 26px; font-weight: 600;">EduPremium'a Davetlisiniz!</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">Türkiye'nin premium online eğitim platformunda öğretmen olarak yerinizi alın.</p>
            </td>
          </tr>
        </table>

        ${messageSection}

        <!-- Invitation Code Box -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 30px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%); border-radius: 16px; padding: 36px;">
                <tr>
                  <td align="center">
                    <p style="color: #d4af37; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">🔑 Davet Kodunuz</p>
                    <div style="background: rgba(212, 175, 55, 0.15); border: 2px dashed #d4af37; border-radius: 12px; padding: 20px 40px; display: inline-block;">
                      <p style="color: #d4af37; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 6px; font-family: 'Courier New', monospace;">${data.invitationCode}</p>
                    </div>
                    <p style="color: #8b9dc3; margin: 16px 0 0 0; font-size: 13px;">Son kullanma tarihi: <strong style="color: #d4af37;">${expiryDate}</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- How to Use -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 30px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 30px; border-left: 4px solid #d4af37;">
                <tr>
                  <td>
                    <h3 style="color: #0d1b2a; margin: 0 0 20px 0; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">📋 Nasıl Kayıt Olurum?</h3>
                    <table width="100%" cellspacing="0" cellpadding="10">
                      <tr>
                        <td style="color: #d4af37; font-size: 20px; font-weight: 700; width: 40px; vertical-align: top;">1</td>
                        <td style="color: #334155; font-size: 14px; line-height: 1.6; border-bottom: 1px solid #e2e8f0; padding-bottom: 14px;">
                          <strong>visserr.com</strong> adresine gidin ve "Öğretmen Olarak Kayıt Ol" butonuna tıklayın
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #d4af37; font-size: 20px; font-weight: 700; width: 40px; vertical-align: top;">2</td>
                        <td style="color: #334155; font-size: 14px; line-height: 1.6; border-bottom: 1px solid #e2e8f0; padding-bottom: 14px;">
                          Kayıt formunda <strong>"Davet Kodu"</strong> alanına yukarıdaki kodu girin
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #d4af37; font-size: 20px; font-weight: 700; width: 40px; vertical-align: top;">3</td>
                        <td style="color: #334155; font-size: 14px; line-height: 1.6;">
                          Profilinizi doldurun, diploma/sertifikanızı yükleyin ve admin onayını bekleyin
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 50px 40px;">
          <tr>
            <td align="center">
              <a href="https://www.visserr.com/kayit" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); color: #0d1b2a; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">Hemen Kayıt Ol</a>
              <p style="color: #94a3b8; margin: 16px 0 0 0; font-size: 12px;">Bu davet kodu size özeldir. Lütfen başkalarıyla paylaşmayınız.</p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%); border-radius: 0 0 20px 20px; padding: 40px;">
          <tr>
            <td align="center">
              <p style="color: #8b9dc3; margin: 0 0 12px 0; font-size: 13px;">Sorularınız mı var?</p>
              <a href="mailto:destek@visserr.com" style="color: #d4af37; text-decoration: none; font-size: 14px; font-weight: 500;">destek@visserr.com</a>
              <p style="color: #4a5568; margin: 24px 0 0 0; font-size: 11px;">© 2026 EduPremium. Tüm hakları saklıdır.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ============================================
// PAKET E-POSTALARI
// ============================================

export function getStudentPackageConfirmationEmail(data: {
  studentName: string;
  teacherName: string;
  campaignName: string;
  totalLessons: number;
  totalAmount: number;
  lessonDates: string[];
  orderId: string;
}) {
  const lessonRows = data.lessonDates.map((date, i) => `
    <tr>
      <td style="padding: 12px 16px; ${i < data.lessonDates.length - 1 ? 'border-bottom: 1px solid #e2e8f0;' : ''}">
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="width: 32px; vertical-align: top;">
              <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); border-radius: 6px; text-align: center; line-height: 24px; color: #0d1b2a; font-size: 12px; font-weight: 700;">${i + 1}</div>
            </td>
            <td style="padding-left: 12px; color: #334155; font-size: 14px; font-weight: 500;">${date}</td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); border-radius: 20px 20px 0 0; padding: 50px 40px;">
          <tr>
            <td align="center">
              <p style="color: #d4af37; margin: 0 0 8px 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Premium Paket</p>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px;">EduPremium</h1>
            </td>
          </tr>
        </table>

        <!-- Success Section -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 50px 40px 30px 40px;">
          <tr>
            <td align="center">
              <div style="width: 90px; height: 90px; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); border-radius: 50%; display: inline-block; line-height: 90px;">
                <span style="font-size: 40px;">✓</span>
              </div>
              <h2 style="color: #0d1b2a; margin: 28px 0 12px 0; font-size: 26px; font-weight: 600;">Paketiniz Hazır!</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">Merhaba ${data.studentName}, ders paketiniz başarıyla oluşturuldu.</p>
            </td>
          </tr>
        </table>

        <!-- Package Card -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 30px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%); border: 2px solid #d4af37; border-radius: 16px; padding: 28px;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); color: #0d1b2a; font-size: 10px; font-weight: 700; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Premium Paket</div>
                    <h3 style="color: #0d1b2a; margin: 12px 0 8px 0; font-size: 22px; font-weight: 700;">${data.campaignName}</h3>
                    <p style="color: #64748b; margin: 0; font-size: 14px;">${data.teacherName} ile</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Package Details -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 30px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 24px; border-left: 4px solid #d4af37;">
                <tr>
                  <td>
                    <table width="100%" cellspacing="0" cellpadding="12">
                      <tr>
                        <td style="color: #64748b; font-size: 14px; width: 40%; border-bottom: 1px solid #e2e8f0;">Toplam Ders</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${data.totalLessons} Ders</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Ödenen Tutar</td>
                        <td style="color: #0d1b2a; font-size: 14px; font-weight: 700;">${data.totalAmount.toLocaleString('tr-TR')} TL</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Lesson Schedule -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 30px 40px;">
          <tr>
            <td>
              <h3 style="color: #0d1b2a; margin: 0 0 16px 0; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">📅 Planlanan Dersler</h3>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                ${lessonRows}
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 50px 40px;">
          <tr>
            <td align="center">
              <a href="https://www.visserr.com/student/my-packages" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); color: #0d1b2a; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">Paketlerimi Görüntüle</a>
              <p style="color: #94a3b8; margin: 16px 0 0 0; font-size: 12px;">Sipariş No: ${data.orderId}</p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%); border-radius: 0 0 20px 20px; padding: 40px;">
          <tr>
            <td align="center">
              <p style="color: #8b9dc3; margin: 0 0 12px 0; font-size: 13px;">Sorularınız mı var?</p>
              <a href="mailto:destek@visserr.com" style="color: #d4af37; text-decoration: none; font-size: 14px; font-weight: 500;">destek@visserr.com</a>
              <p style="color: #4a5568; margin: 24px 0 0 0; font-size: 11px;">© 2026 EduPremium. Tüm hakları saklıdır.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getTeacherPackageSaleEmail(data: {
  teacherName: string;
  studentName: string;
  campaignName: string;
  totalLessons: number;
  earnings: number;
  lessonDates: string[];
}) {
  const lessonRows = data.lessonDates.map((date, i) => `
    <tr>
      <td style="padding: 12px 16px; ${i < data.lessonDates.length - 1 ? 'border-bottom: 1px solid rgba(255,255,255,0.1);' : ''}">
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="width: 32px; vertical-align: top;">
              <div style="width: 24px; height: 24px; background: rgba(212, 175, 55, 0.3); border-radius: 6px; text-align: center; line-height: 24px; color: #d4af37; font-size: 12px; font-weight: 700;">${i + 1}</div>
            </td>
            <td style="padding-left: 12px; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500;">${date}</td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); border-radius: 20px 20px 0 0; padding: 50px 40px;">
          <tr>
            <td align="center">
              <p style="color: #d4af37; margin: 0 0 8px 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Öğretmen Paneli</p>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px;">EduPremium</h1>
            </td>
          </tr>
        </table>

        <!-- Celebration Section -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 50px 40px 30px 40px;">
          <tr>
            <td align="center">
              <div style="width: 90px; height: 90px; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); border-radius: 50%; display: inline-block; line-height: 90px;">
                <span style="font-size: 40px;">🎉</span>
              </div>
              <h2 style="color: #0d1b2a; margin: 28px 0 12px 0; font-size: 26px; font-weight: 600;">Yeni Paket Satışı!</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">Tebrikler ${data.teacherName}! Bir öğrenci paketinizi satın aldı.</p>
            </td>
          </tr>
        </table>

        <!-- Sale Card -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 30px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%); border-radius: 16px; padding: 32px;">
                <tr>
                  <td align="center">
                    <p style="color: rgba(255,255,255,0.7); margin: 0 0 4px 0; font-size: 14px;">Öğrenci</p>
                    <h3 style="color: white; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">${data.studentName}</h3>
                    <div style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); color: #0d1b2a; font-size: 10px; font-weight: 700; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Premium Paket</div>
                    <h4 style="color: #d4af37; margin: 8px 0 20px 0; font-size: 18px; font-weight: 600;">${data.campaignName}</h4>
                    <div style="background: rgba(212, 175, 55, 0.2); border-radius: 12px; padding: 16px 32px; display: inline-block;">
                      <p style="color: rgba(255,255,255,0.7); margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Kazancınız</p>
                      <p style="color: #d4af37; margin: 0; font-size: 36px; font-weight: 700;">${data.earnings.toLocaleString('tr-TR')} <span style="font-size: 18px;">TL</span></p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Package Info -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 30px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 24px; border-left: 4px solid #d4af37;">
                <tr>
                  <td align="center">
                    <p style="color: #64748b; margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Toplam Ders</p>
                    <p style="color: #0d1b2a; margin: 0; font-size: 28px; font-weight: 700;">${data.totalLessons} <span style="font-size: 16px; font-weight: 500;">Ders</span></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Lesson Schedule -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 30px 40px;">
          <tr>
            <td>
              <h3 style="color: #0d1b2a; margin: 0 0 16px 0; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">📅 Planlanan Dersler</h3>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%); border-radius: 12px; overflow: hidden;">
                ${lessonRows}
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 10px 40px 50px 40px;">
          <tr>
            <td align="center">
              <a href="https://www.visserr.com/teacher/lessons" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); color: #0d1b2a; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">Derslerimi Görüntüle</a>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%); border-radius: 0 0 20px 20px; padding: 40px;">
          <tr>
            <td align="center">
              <p style="color: #8b9dc3; margin: 0 0 12px 0; font-size: 13px;">Sorularınız mı var?</p>
              <a href="mailto:destek@visserr.com" style="color: #d4af37; text-decoration: none; font-size: 14px; font-weight: 500;">destek@visserr.com</a>
              <p style="color: #4a5568; margin: 24px 0 0 0; font-size: 11px;">© 2026 EduPremium. Tüm hakları saklıdır.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
