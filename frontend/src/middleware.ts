import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public sayfalar - auth gerektirmez
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/giris',
  '/kayit',
  '/student/login',
  '/student/register',
  '/teacher/register',
  '/forgot-password',
  '/update-password',
  '/verify-email',
  '/auth/callback',
  '/teachers',
  '/ogretmenler',
  '/hakkimizda',
  '/iletisim',
  '/sss',
  '/kvkk',
  '/gizlilik',
  '/kullanim-kosullari',
  '/api',
];

// Email doğrulaması gerektirmeyen sayfalar (giriş yapmış ama onaylamamış kullanıcılar için)
const noVerificationPaths = [
  '/verify-email',
  '/auth/callback',
  '/api',
];

// Cookie'leri bir response'tan diğerine kopyalayan yardımcı fonksiyon
function copyResponseCookies(source: NextResponse, destination: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    destination.cookies.set(cookie.name, cookie.value, {
      ...cookie,
    });
  });
  return destination;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Static dosyaları atla
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // .css, .js, .png vb.
  ) {
    return response;
  }

  // Public path kontrolü
  const isPublicPath = publicPaths.some(path => {
    if (path === '/') return pathname === '/';
    if (path === '/api') return pathname.startsWith('/api');
    if (path === '/teachers') return pathname.startsWith('/teachers');
    return pathname === path || pathname.startsWith(path + '/');
  });

  // Verification gerektirmeyen path kontrolü
  const isNoVerificationPath = noVerificationPaths.some(path => {
    if (path === '/api') return pathname.startsWith('/api');
    return pathname === path || pathname.startsWith(path + '/');
  });

  try {
    const supabase = createMiddlewareClient({ req: request, res: response });

    // getSession çağrısı cookie'leri günceller (refresh token kullanır)
    const { data: { session } } = await supabase.auth.getSession();

    // Kullanıcı giriş yapmamış
    if (!session) {
      // Public sayfa ise izin ver
      if (isPublicPath) {
        return response;
      }
      // Korumalı sayfaya erişmeye çalışıyor - login'e yönlendir
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      // Cookie'leri kopyala (refresh token güncellemesi için)
      return copyResponseCookies(response, redirectResponse);
    }

    // Kullanıcı giriş yapmış - email doğrulama kontrolü
    const user = session.user;
    const emailConfirmed = user.email_confirmed_at !== null && user.email_confirmed_at !== undefined;

    // Email onaylanmamış ve verification gerektiren sayfa
    // GEÇİCİ OLARAK DEVRE DIŞI - DEBUG AMAÇLI
    // if (!emailConfirmed && !isNoVerificationPath) {
    //   const redirectResponse = NextResponse.redirect(new URL('/verify-email', request.url));
    //   return copyResponseCookies(response, redirectResponse);
    // }

    // Email onaylanmış kullanıcı verify-email sayfasına girmeye çalışıyor
    if (emailConfirmed && pathname === '/verify-email') {
      const redirectResponse = NextResponse.redirect(new URL('/', request.url));
      return copyResponseCookies(response, redirectResponse);
    }

    // Giriş yapmış ve onaylanmış kullanıcı login/register sayfalarına gitmeye çalışıyor
    if (emailConfirmed && (pathname === '/login' || pathname === '/student/login' || pathname === '/register' || pathname === '/student/register')) {
      // Kullanıcı tipine göre yönlendir
      // Student profile kontrolü
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (studentProfile) {
        const redirectResponse = NextResponse.redirect(new URL('/student/dashboard', request.url));
        return copyResponseCookies(response, redirectResponse);
      }

      // Teacher profile kontrolü
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (teacherProfile) {
        const redirectResponse = NextResponse.redirect(new URL('/teacher/dashboard', request.url));
        return copyResponseCookies(response, redirectResponse);
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
