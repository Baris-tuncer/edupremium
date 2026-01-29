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
        <!-- Meeting Link -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 20px 30px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #dbeafe; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px;">
                <tr>
                  <td align="center">
                    <p style="color: #1d4ed8; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">🎥 Online Ders Linki</p>
                    <a href="${data.meetingLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 14px; font-weight: 600;">Derse Katıl</a>
                    <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 11px;">Bu linki ders saatinde kullanabilirsiniz</p>
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
  <title>Ödeme Onayı - EduPremium</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0fdf4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0; padding: 30px;">
          <tr>
            <td align="center">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">EduPremium</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Online Eğitim Platformu</p>
            </td>
          </tr>
        </table>

        <!-- Success Icon -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 40px 30px 20px 30px;">
          <tr>
            <td align="center">
              <div style="width: 80px; height: 80px; background-color: #d1fae5; border-radius: 50%; display: inline-block; line-height: 80px;">
                <span style="font-size: 40px;">✓</span>
              </div>
              <h2 style="color: #059669; margin: 20px 0 10px 0; font-size: 24px;">Ödemeniz Başarılı!</h2>
              <p style="color: #6b7280; margin: 0; font-size: 16px;">Merhaba ${data.studentName}, dersiniz başarıyla oluşturuldu.</p>
            </td>
          </tr>
        </table>

        <!-- Lesson Details -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 20px 30px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; padding: 24px;">
                <tr>
                  <td>
                    <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">📚 Ders Detayları</h3>
                    
                    <table width="100%" cellspacing="0" cellpadding="8">
                      <tr>
                        <td style="color: #64748b; font-size: 14px; width: 40%;">Öğretmen</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">${data.teacherName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Ders</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">${data.subject}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Tarih</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">${data.date}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Saat</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">${data.time}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Süre</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">60 Dakika</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${meetingSection}

        <!-- Payment Info -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 20px 30px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 20px;">
                <tr>
                  <td align="center">
                    <p style="color: #059669; margin: 0 0 5px 0; font-size: 14px;">Ödenen Tutar</p>
                    <p style="color: #047857; margin: 0; font-size: 32px; font-weight: 700;">${data.price.toLocaleString('tr-TR')} TL</p>
                    <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">Sipariş No: ${data.orderId}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 20px 30px 40px 30px;">
          <tr>
            <td align="center">
              <a href="https://www.visserr.com/student/lessons" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">Derslerime Git</a>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #1e293b; border-radius: 0 0 16px 16px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">Sorularınız mı var?</p>
              <a href="mailto:destek@visserr.com" style="color: #10b981; text-decoration: none; font-size: 14px;">destek@visserr.com</a>
              <p style="color: #64748b; margin: 20px 0 0 0; font-size: 12px;">© 2026 EduPremium. Tüm hakları saklıdır.</p>
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
        <!-- Meeting Link -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 20px 30px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #dbeafe; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px;">
                <tr>
                  <td align="center">
                    <p style="color: #1d4ed8; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">🎥 Online Ders Linki</p>
                    <a href="${data.meetingLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 14px; font-weight: 600;">Derse Katıl</a>
                    <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 11px;">Bu linki ders saatinde kullanabilirsiniz</p>
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
  <title>Yeni Ders Bildirimi - EduPremium</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #eff6ff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 16px 16px 0 0; padding: 30px;">
          <tr>
            <td align="center">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">EduPremium</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Öğretmen Paneli</p>
            </td>
          </tr>
        </table>

        <!-- Celebration -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 40px 30px 20px 30px;">
          <tr>
            <td align="center">
              <div style="width: 80px; height: 80px; background-color: #dbeafe; border-radius: 50%; display: inline-block; line-height: 80px;">
                <span style="font-size: 40px;">🎉</span>
              </div>
              <h2 style="color: #1d4ed8; margin: 20px 0 10px 0; font-size: 24px;">Yeni Ders Satışı!</h2>
              <p style="color: #6b7280; margin: 0; font-size: 16px;">Tebrikler ${data.teacherName}! Yeni bir ders satışınız var.</p>
            </td>
          </tr>
        </table>

        <!-- Student & Lesson Info -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 20px 30px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; padding: 24px;">
                <tr>
                  <td>
                    <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">📖 Ders Bilgileri</h3>
                    
                    <table width="100%" cellspacing="0" cellpadding="8">
                      <tr>
                        <td style="color: #64748b; font-size: 14px; width: 40%;">Öğrenci</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">${data.studentName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Ders</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">${data.subject}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Tarih</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">${data.date}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Saat</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">${data.time}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 14px;">Süre</td>
                        <td style="color: #1e293b; font-size: 14px; font-weight: 600;">60 Dakika</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${meetingSection}

        <!-- Earnings -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 20px 30px;">
          <tr>
            <td>
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 20px;">
                <tr>
                  <td align="center">
                    <p style="color: #059669; margin: 0 0 5px 0; font-size: 14px;">Bu Dersten Kazancınız</p>
                    <p style="color: #047857; margin: 0; font-size: 32px; font-weight: 700;">${data.earnings.toLocaleString('tr-TR')} TL</p>
                    <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">Ders ücreti: ${data.price.toLocaleString('tr-TR')} TL</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: white; padding: 20px 30px 40px 30px;">
          <tr>
            <td align="center">
              <a href="https://www.visserr.com/teacher/lessons" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">Derslerime Git</a>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #1e293b; border-radius: 0 0 16px 16px; padding: 30px;">
          <tr>
            <td align="center">
              <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">Sorularınız mı var?</p>
              <a href="mailto:destek@visserr.com" style="color: #3b82f6; text-decoration: none; font-size: 14px;">destek@visserr.com</a>
              <p style="color: #64748b; margin: 20px 0 0 0; font-size: 12px;">© 2026 EduPremium. Tüm hakları saklıdır.</p>
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
