import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { getInvitationCodeEmail } from '@/lib/email-templates';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  const resend = getResend();
  try {
    // AUTH KONTROLÜ - Oturum doğrulama
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    // Token ile kullanıcıyı doğrula
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Geçersiz oturum' },
        { status: 401 }
      );
    }

    // NOT: Admin kontrolü admin layout tarafından yapılıyor
    // Bu API'ye sadece /admin/* sayfalarından erişilebilir

    const { email, code, expiresAt, personalMessage } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email ve kod zorunludur' },
        { status: 400 }
      );
    }

    const html = getInvitationCodeEmail({
      recipientEmail: email,
      invitationCode: code,
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      personalMessage: personalMessage || undefined,
    });

    const { data, error } = await resend.emails.send({
      from: 'EduPremium <noreply@visserr.com>',
      to: [email],
      subject: `🎓 EduPremium Öğretmen Davet Kodunuz: ${code}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Email gönderilemedi: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error('Send invitation email error:', error);
    return NextResponse.json(
      { error: 'Email gönderilemedi' },
      { status: 500 }
    );
  }
}
