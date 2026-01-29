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
  const meetingSection = data.meetingLink ? `
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 20px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); border-radius: 16px; padding: 28px;">
                <tr>
                  <td align="center">
                    <p style="color: #d4af37; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">🎥 Online Ders Linki</p>
                    <a href="${data.meetingLink}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); color: #0d1b2a; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">Derse Katıl</a>
                    <p style="color: #8b9dc3; margin: 14px 0 0 0; font-size: 12px;">Bu linki ders saatinde kullanabilirsiniz</p>
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
        ${meetingSection}
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
  const meetingSection = data.meetingLink ? `
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 20px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); border-radius: 16px; padding: 28px;">
                <tr>
                  <td align="center">
                    <p style="color: #d4af37; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">🎥 Online Ders Linki</p>
                    <a href="${data.meetingLink}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); color: #0d1b2a; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">Derse Katıl</a>
                    <p style="color: #8b9dc3; margin: 14px 0 0 0; font-size: 12px;">Bu linki ders saatinde kullanabilirsiniz</p>
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
        ${meetingSection}
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
        ${data.meetingLink ? `
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 20px 40px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%); border-radius: 16px; padding: 28px;">
                <tr>
                  <td align="center">
                    <p style="color: #d4af37; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">🎥 Online Ders Linki</p>
                    <a href="${data.meetingLink}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%); color: #0d1b2a; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">Derse Katıl</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ` : ''}
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
