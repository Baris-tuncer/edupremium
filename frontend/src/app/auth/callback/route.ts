import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Statik render'ı engelle - her zaman dinamik çalışsın
export const dynamic = 'force-dynamic';

// Rol bazlı yönlendirme yardımcısı
function getRedirectUrl(role: string | undefined, type: string | null, origin: string, fallback: string): string {
  if (type === 'signup' || type === 'email' || type === 'magiclink') {
    if (role === 'teacher') return '/teacher/login?verified=true';
    if (role === 'student') return '/student/login?verified=true';
    return '/login?verified=true';
  }
  if (type === 'recovery') return '/update-password';
  return fallback;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/';

  // Supabase'den gelen hata parametresi
  const errorParam = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (errorParam) {
    console.error('Auth callback error param:', errorParam, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || errorParam)}`, requestUrl.origin)
    );
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // ─── AKIŞ 1: PKCE Flow (code parametresi) ───
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth code exchange error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    const role = data?.user?.user_metadata?.role;
    const redirectPath = getRedirectUrl(role, type, requestUrl.origin, next);
    return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
  }

  // ─── AKIŞ 2: Implicit Flow (token_hash parametresi) ───
  if (token_hash) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: (type as 'signup' | 'email' | 'recovery' | 'magiclink' | 'invite') || 'email',
    });

    if (error) {
      console.error('Auth token verify error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    const role = data?.user?.user_metadata?.role;
    const redirectPath = getRedirectUrl(role, type, requestUrl.origin, next);
    return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
  }

  // ─── Hiçbir parametre yoksa login'e yönlendir ───
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
