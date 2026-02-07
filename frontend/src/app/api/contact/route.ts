import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

// Zod validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(100, 'İsim çok uzun'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  subject: z.string().min(1, 'Konu seçiniz'),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalı').max(2000, 'Mesaj 2000 karakteri geçemez'),
})

// XSS koruması için HTML escape fonksiyonu
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(request: NextRequest) {
  const resend = getResend()

  try {
    const body = await request.json()

    // Zod ile validation
    const validationResult = contactSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message).join(', ')
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      )
    }

    const { name, email, subject, message } = validationResult.data

    // HTML escape uygula
    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeMessage = escapeHtml(message)

    const subjectMap: Record<string, string> = {
      general: 'Genel Bilgi',
      teacher: 'Öğretmen Başvurusu',
      student: 'Öğrenci/Veli Desteği',
      technical: 'Teknik Destek',
      partnership: 'İş Birliği',
      other: 'Diğer'
    }

    const safeSubjectLabel = escapeHtml(subjectMap[subject] || subject)

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
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">E-posta:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${safeEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">Konu:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${safeSubjectLabel}</td>
              </tr>
            </table>
            <div style="margin-top: 20px;">
              <h3 style="color: #1e3a5f; margin-bottom: 10px;">Mesaj:</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
                ${safeMessage.replace(/\n/g, '<br>')}
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
