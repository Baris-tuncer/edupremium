import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// HERKESE AÇIK SAYFALAR LİSTESİ (KİMLİK SORULMAZ)
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/student/register', // <-- İşte sorunu çözen satır (Öğrenci Kaydı)
  '/forgot-password',
  '/verify-email',
  '/about',
  '/contact',
  '/courses',
  '/teachers',
  '/privacy',
  '/terms'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Eğer gidilen yol "Public" listesindeyse, hiçbir şey yapma, devam et.
  // (Ayrıca /teachers/123 gibi alt sayfaları da otomatik kabul et)
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next()
  }

  // 2. Eğer resim, css, api veya statik dosyaysa karışma
  if (pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/static') ||
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // 3. Admin sayfaları için özel koruma (Gelecekte lazım olur)
  const token = request.cookies.get('auth_token')?.value
  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // 4. DİĞER HER ŞEY İÇİN: Eğer giriş yapmamışsa Login'e at
  // (Ama listedekileri yukarıda geçirdik, o yüzden artık sorun çıkmaz)
  if (!token) {
    // Burası sadece gerçekten gizli olması gereken profil sayfaları için çalışacak
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Aşağıdakiler HARİÇ tüm yolları kontrol et:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
