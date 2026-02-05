import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

  // Supabase ile oturumu kontrol et
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

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
