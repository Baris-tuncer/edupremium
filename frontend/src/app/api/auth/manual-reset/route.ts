import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// 1. Anahtar Kontrolu
if (!process.env.RESEND_API_KEY) {
  console.error('CRITICAL: RESEND_API_KEY is missing');
}

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body.email

    console.log('Reset process started for:', email);

    // 2. Link Uretimi (String Birlestirme ile guvenli hale getirildi)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.visserr.com';

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: baseUrl + '/update-password'
      }
    })

    if (linkError) {
      return NextResponse.json({ error: 'Link Hatasi: ' + linkError.message }, { status: 400 })
    }

    const resetLink = linkData.properties.action_link

    // 3. Resend Mail Gonderimi (Detayli Hata Yakalama)
    // Gonderici: info@visserr.com
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'EduPremium <info@visserr.com>',
      to: [email],
      subject: 'Sifre Sifirlama Talebi',
      html: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">' +
            '<h2 style="color: #1a56db;">Sifrenizi Yenileyin</h2>' +
            '<p>EduPremium hesabiniz icin sifre sifirlama talebi aldik.</p>' +
            '<a href="' + resetLink + '" style="display: inline-block; background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">' +
            'Sifremi Sifirla' +
            '</a>' +
            '</div>'
    })

    // Hata varsa SAKLAMA, direkt kullaniciya don.
    if (emailError) {
      console.error('Resend Error:', emailError);
      return NextResponse.json({
        error: 'Mail Gonderilemedi: ' + emailError.message + ' (Tip: ' + emailError.name + ')'
      }, { status: 500 })
    }

    // Basarili
    console.log('Email sent info:', emailData);
    return NextResponse.json({ success: true, id: emailData?.id })

  } catch (error: any) {
    console.error('Server Error:', error)
    return NextResponse.json({ error: 'Sunucu Hatasi: ' + error.message }, { status: 500 })
  }
}
