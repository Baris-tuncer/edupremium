import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  const type = requestUrl.searchParams.get('type');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Code exchange - Supabase otomatik olarak session oluşturur
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    // Başarılı doğrulama sonrası yönlendirme
    if (type === 'signup' || type === 'email') {
      // Email doğrulama başarılı - login sayfasına yönlendir
      return NextResponse.redirect(
        new URL('/login?verified=true', requestUrl.origin)
      );
    }

    if (type === 'recovery') {
      // Şifre sıfırlama - update-password sayfasına yönlendir
      return NextResponse.redirect(
        new URL('/update-password', requestUrl.origin)
      );
    }

    // Diğer durumlar için next parametresine veya ana sayfaya yönlendir
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // Code yoksa login sayfasına yönlendir
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
