import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 1. HERKESE AÇIK YOLLAR (Whitelist)
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/student/register', // <-- Kritik düzeltmemiz burada
  '/forgot-password',
  '/verify-email',
  '/about',
  '/contact',
  '/courses',
  '/teachers',
  '/privacy',
  '/terms',
  '/faq',
  '/pricing',
  '/career',
  '/blog',
  '/help',
  '/how-it-works'
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // 2. Supabase ile oturumu kontrol et (Eski sağlam yöntem)
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  // 3. EĞER Gidilen yol "Public" listesindeyse VEYA statik dosyaysa -> KARIŞMA
  if (publicPaths.some(p => path === p || path.startsWith(p + '/')) ||
      path.startsWith('/_next') ||
      path.startsWith('/api') ||
      path.startsWith('/static') ||
      path.includes('.')) {
    return res
  }

  // 4. EĞER Public değilse ve OTURUM YOKSA -> Login'e at
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 5. Oturum varsa devam et
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
