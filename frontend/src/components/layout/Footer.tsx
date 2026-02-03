import Link from 'next/link'
import { FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa'

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
            <div className="flex gap-4">
              <SocialLink href="#" icon={<FaTwitter />} />
              <SocialLink href="#" icon={<FaInstagram />} />
              <SocialLink href="#" icon={<FaLinkedinIn />} />
            </div>
          </div>

          {/* 2. KOLON: PLATFORM */}
          <FooterSection
            title="Platform"
            links={[
              { label: 'Öğretmenler', href: '/teachers' },
              { label: 'Dersler', href: '/courses' },
              { label: 'Nasıl Çalışır?', href: '#' },
              { label: 'Fiyatlandırma', href: '#' },
            ]}
          />

          {/* 3. KOLON: KURUMSAL */}
          <FooterSection
            title="Kurumsal"
            links={[
              { label: 'Hakkımızda', href: '/about' },
              { label: 'Kariyer', href: '#' },
              { label: 'İletişim', href: '/contact' },
              { label: 'Blog', href: '#' },
            ]}
          />

          {/* 4. KOLON: DESTEK */}
          <FooterSection
            title="Destek"
            links={[
              { label: 'Yardım Merkezi', href: '#' },
              { label: 'SSS', href: '/faq' },
              { label: 'Gizlilik Politikası', href: '/privacy' },
              { label: 'Kullanım Şartları', href: '/terms' },
            ]}
          />
        </div>

        {/* ALT ÇİZGİ & COPYRIGHT */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 EduPremium. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">KVKK Aydınlatma Metni</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Kullanım Koşulları</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// YARDIMCI BİLEŞENLER (Aynı dosya içinde)
const FooterSection = ({ title, links }: { title: string, links: { label: string, href: string }[] }) => (
  <div>
    <h3 className="font-serif font-bold text-slate-900 mb-6">{title}</h3>
    <ul className="space-y-3">
      {links.map((link, index) => (
        <li key={index}>
          <Link
            href={link.href}
            className={`text-sm transition-colors ${link.href === '#' ? 'text-slate-400 cursor-default' : 'text-slate-600 hover:text-blue-900'}`}
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
