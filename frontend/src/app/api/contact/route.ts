import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      )
    }

    const subjectMap: Record<string, string> = {
      general: 'Genel Bilgi',
      teacher: 'Öğretmen Başvurusu',
      student: 'Öğrenci/Veli Desteği',
      technical: 'Teknik Destek',
      partnership: 'İş Birliği',
      other: 'Diğer'
    }

    await resend.emails.send({
      from: 'EduPremium <noreply@visserr.com>',
      to: ['info@visserr.com'],
      replyTo: email,
      subject: `[İletişim Formu] ${subjectMap[subject] || subject} - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Yeni İletişim Mesajı</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold; width: 120px;">Ad Soyad:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">E-posta:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">Konu:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${subjectMap[subject] || subject}</td>
              </tr>
            </table>
            <div style="margin-top: 20px;">
              <h3 style="color: #1e3a5f; margin-bottom: 10px;">Mesaj:</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
          <div style="background: #1e3a5f; color: white; padding: 15px; text-align: center; font-size: 12px;">
            Bu mesaj visserr.com iletişim formundan gönderilmiştir.
          </div>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Mesaj gönderilemedi' },
      { status: 500 }
    )
  }
}