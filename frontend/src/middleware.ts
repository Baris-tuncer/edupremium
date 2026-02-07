import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting için in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Bellek temizliği (her 5 dakikada bir eski kayıtları sil)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) return false;
  record.count++;
  return true;
}

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         'unknown';
}

// Herkese açık sayfalar listesi (Login gerektirmeyenler)
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/student/login',
  '/student/register',
  '/teacher/login',
  '/teacher/register',
  '/admin/login',
  '/forgot-password',
  '/reset-password',
  '/update-password',
  '/verify-email',
  '/auth/callback',
  '/teachers',
  '/courses',
  '/subjects',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/faq',
  '/pricing',
  '/career',
  '/careers',
  '/blog',
  '/help',
  '/how-it-works',
  '/kvkk',
  '/become-tutor',
  '/success-stories'
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const path = req.nextUrl.pathname
  const clientIP = getClientIP(req)

  // Rate limiting kontrolleri
  // Login endpoints: 5 deneme / dakika
  if (path.includes('/login') || path.includes('/auth')) {
    if (!checkRateLimit(`login:${clientIP}`, 5, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Çok fazla deneme. Lütfen 1 dakika bekleyin.' },
        { status: 429 }
      )
    }
  }

  // Contact form: 3 mesaj / dakika
  if (path === '/api/contact') {
    if (!checkRateLimit(`contact:${clientIP}`, 3, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Çok fazla mesaj gönderdiniz. Lütfen 1 dakika bekleyin.' },
        { status: 429 }
      )
    }
  }

  // Genel API limiti: 100 istek / dakika
  if (path.startsWith('/api/')) {
    if (!checkRateLimit(`api:${clientIP}`, 100, 60 * 1000)) {
      return NextResponse.json(
        { error: 'İstek limiti aşıldı. Lütfen bekleyin.' },
        { status: 429 }
      )
    }
  }

  // Supabase ile oturumu kontrol et
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Eğer gidilen yol public listesindeyse veya statik dosyaysa -> izin ver
  if (publicPaths.some(p => path === p || path.startsWith(p + '/')) ||
      path.startsWith('/_next') ||
      path.startsWith('/api') ||
      path.startsWith('/static') ||
      path.includes('.')) {
    return res
  }

  // Admin sayfalarına oturumsuz erişimde admin login'e yönlendir
  if (!session && path.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  // Eğer public değilse ve oturum yoksa -> Login'e yönlendir
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Oturum varsa devam et
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
