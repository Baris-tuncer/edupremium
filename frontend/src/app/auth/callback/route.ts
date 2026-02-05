import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  const type = requestUrl.searchParams.get('type');

  if (code) {
    // Cookie-based client - Session'ı cookie'ye yazar
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Code exchange - Session cookie'ye yazılır
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    // Başarılı doğrulama sonrası yönlendirme
    if (type === 'signup' || type === 'email') {
      // Kullanıcının rolüne göre doğru login sayfasına yönlendir
      const role = data?.user?.user_metadata?.role;
      if (role === 'teacher') {
        return NextResponse.redirect(
          new URL('/teacher/login?verified=true', requestUrl.origin)
        );
      }
      if (role === 'student') {
        return NextResponse.redirect(
          new URL('/student/login?verified=true', requestUrl.origin)
        );
      }
      // Varsayılan
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
