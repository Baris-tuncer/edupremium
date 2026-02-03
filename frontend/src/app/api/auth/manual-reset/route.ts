import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Resend ve Supabase ayarları
const resend = new Resend(process.env.RESEND_API_KEY)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service Role Key ŞART (Gizli Anahtar)
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // 1. Supabase'den "Recovery Link" (Şifre Sıfırlama Linki) iste
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.visserr.com'}/update-password`
      }
    })

    if (error) throw error

    // Link: data.properties.action_link içinde gelir
    const resetLink = data.properties.action_link

    // 2. Linki Resend ile gönder (Davet sistemi gibi)
    const { error: emailError } = await resend.emails.send({
      from: 'EduPremium <info@visserr.com>', // Çalışan adres
      to: [email],
      subject: 'Şifrenizi Sıfırlayın',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Şifre Sıfırlama</h1>
          <p>Hesabınız için şifre sıfırlama talebi aldık.</p>
          <p>Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Şifremi Sıfırla
          </a>
          <p style="font-size: 12px; color: #666;">Bu talebi siz yapmadıysanız, bu maili dikkate almayın.</p>
        </div>
      `
    })

    if (emailError) throw emailError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Manual Reset Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
