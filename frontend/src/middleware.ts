import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Oturumu kontrol et
  const { data: { session } } = await supabase.auth.getSession()
  const path = req.nextUrl.pathname

  // --- 1. ADMIN YÖNLENDİRMESİ (YENİ) ---
  if (path.startsWith('/admin')) {
    // Admin login sayfasına gidiyorsa ve zaten giriş yapmışsa -> Panele at
    if (path === '/admin/login' && session) {
        return NextResponse.redirect(new URL('/admin/ogretmenler', req.url))
    }
    // Admin iç sayfasına girmeye çalışıyor ama oturumu yoksa -> Admin Login'e at
    if (path !== '/admin/login' && !session) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    // Diğer admin durumlarında izin ver
    return res
  }

  // --- 2. STANDART AYARLAR (MEVCUT KORUNDU) ---
  const isPublic =
    path === '/' ||
    path === '/login' ||
    path === '/register' ||
    path.startsWith('/teachers') ||
    path.startsWith('/auth') ||
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.includes('.')

  // Standart koruma: Özel sayfaya gidiyorsa ve oturum yoksa -> Normal Login'e at
  if (!isPublic && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
