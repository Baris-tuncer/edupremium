'use client'

import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* 1. KOLON: LOGO & AÇIKLAMA */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <span className="bg-slate-900 text-white w-10 h-10 flex items-center justify-center rounded-xl text-xl font-bold group-hover:bg-blue-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </span>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 leading-none font-serif">EduPremium</span>
                <span className="text-[0.6rem] tracking-widest text-slate-500 uppercase mt-1">Özel Ders Platformu</span>
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Türkiye'nin en seçkin özel ders platformu. Alanında uzman öğretmenlerle birebir online eğitim deneyimi.
            </p>
            <div className="flex gap-3">
              {/* Facebook */}
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-80 transition-all duration-300">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:opacity-80 transition-all duration-300">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full text-white hover:opacity-80 transition-all duration-300" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0A66C2] text-white hover:opacity-80 transition-all duration-300">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>

            {/* Mobil Uygulama Butonları */}
            <div className="mt-6">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Mobil Uygulama</p>
              <div className="flex flex-col gap-2">
                {/* App Store */}
                <button
                  onClick={() => alert('Yapım aşamasında - Çok yakında App Store\'da!')}
                  className="flex items-center gap-2 bg-black hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] leading-none opacity-70">Yakında</div>
                    <div className="text-sm font-semibold leading-tight">App Store</div>
                  </div>
                </button>
                {/* Google Play */}
                <button
                  onClick={() => alert('Yapım aşamasında - Çok yakında Google Play\'de!')}
                  className="flex items-center gap-2 bg-black hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 512 512">
                    <path fill="#2196F3" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"/>
                    <path fill="#4CAF50" d="M47 0C34.5 0 24 10.5 24 23v466c0 12.5 10.5 23 23 23l287-287L47 0z"/>
                    <path fill="#FFC107" d="M325.3 277.7L104.6 499l280.8-161.2-60.1-60.1z"/>
                    <path fill="#F44336" d="M465 234.3c12-6.9 12-24.6 0-31.5L385.4 174l-60.1 60.1 60.1 60.1 79.6-28.4c0 .1 0-31.5 0-31.5z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] leading-none opacity-70">Yakında</div>
                    <div className="text-sm font-semibold leading-tight">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 2. KOLON: PLATFORM */}
          <FooterSection
            title="Platform"
            links={[
              { label: 'Öğretmenler', href: '/teachers' },
              { label: 'Dersler', href: '/courses' },
              { label: 'Nasıl Çalışır?', href: '/how-it-works' },
              { label: 'Fiyatlandırma', href: '/pricing' },
            ]}
          />

          {/* 3. KOLON: KURUMSAL */}
          <FooterSection
            title="Kurumsal"
            links={[
              { label: 'Hakkımızda', href: '/about' },
              { label: 'Kariyer', href: '/career' },
              { label: 'İletişim', href: '/contact' },
              { label: 'Blog', href: '/blog' },
            ]}
          />

          {/* 4. KOLON: DESTEK */}
          <FooterSection
            title="Destek"
            links={[
              { label: 'Yardım Merkezi', href: '/help' },
              { label: 'SSS', href: '/faq' },
              { label: 'Gizlilik Politikası', href: '/privacy' },
              { label: 'Kullanım Şartları', href: '/terms' },
            ]}
          />
        </div>

        {/* ALT ÇİZGİ & COPYRIGHT */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="text-center md:text-left">
            <p>© 2026 EduPremium. Tüm hakları saklıdır.</p>
            <p className="text-[10px] text-slate-400 mt-1">Tüm içerikler telif hakkı ile korunmaktadır. İzinsiz kopyalanması yasaktır.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">KVKK Aydınlatma Metni</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Kullanım Koşulları</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// YARDIMCI BİLEŞENLER
const FooterSection = ({ title, links }: { title: string, links: { label: string, href: string }[] }) => (
  <div>
    <h3 className="font-serif font-bold text-slate-900 mb-6">{title}</h3>
    <ul className="space-y-3">
      {links.map((link, index) => (
        <li key={index}>
          <Link
            href={link.href}
            className="text-sm text-slate-600 hover:text-blue-900 transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

const SocialLink = ({ href, icon }: { href: string, icon: React.ReactNode }) => (
  <a
    href={href}
    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-blue-900 hover:text-white transition-all duration-300 text-sm"
  >
    {icon}
  </a>
)

export default Footer
