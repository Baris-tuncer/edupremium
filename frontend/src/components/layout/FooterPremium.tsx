import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

const FooterPremium = () => {

  // LİNKLERİ BURADA TANIMLIYORUZ (Doğru Yönlendirme İçin)
  const platformLinks = [
    { name: 'Öğretmenler', href: '/teachers' },
    { name: 'Dersler', href: '/subjects' }, // Veya /courses
    { name: 'Nasıl Çalışır?', href: '/#how-it-works' }, // Ana sayfadaki bölüme kaydırır
    { name: 'Fiyatlandırma', href: '/pricing' },
    { name: 'Başarı Hikayeleri', href: '/success-stories' }
  ];

  const corporateLinks = [
    { name: 'Hakkımızda', href: '/about' },
    { name: 'Kariyer', href: '/careers' },
    { name: 'Eğitmen Olun', href: '/become-tutor' }, // Eğitmen başvuru sayfası
    { name: 'İletişim', href: '/contact' },
    { name: 'Blog', href: '/blog' }
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com' },
    { icon: Twitter, href: 'https://twitter.com' },
    { icon: Instagram, href: 'https://instagram.com/edupremium_official' },
    { icon: Linkedin, href: 'https://linkedin.com' }
  ];

  return (
    <footer className="bg-[#020617] text-slate-300 relative overflow-hidden">

      {/* --- ÜST ALTIN ÇİZGİ --- */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80 shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>

      {/* Arka Plan Efekti */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-[#D4AF37] opacity-[0.03] blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* 1. SÜTUN: MARKA & HAKKINDA */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center text-[#020617]">
                <span className="font-serif font-bold text-2xl">E</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white font-serif tracking-tight">EduPremium</h3>
                <p className="text-[10px] text-[#D4AF37] tracking-[0.2em] uppercase font-bold">Özel Ders Platformu</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Türkiye'nin en seçkin eğitmen kadrosuyla, kişiselleştirilmiş ve premium bir öğrenme deneyimi sunuyoruz. Geleceğinizi şansa bırakmayın.
            </p>

            {/* Sosyal Medya Linkleri */}
            <div className="flex gap-3">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#020617] hover:border-[#D4AF37] transition-all duration-300 group"
                >
                  <item.icon className="w-4 h-4 text-slate-400 group-hover:text-[#020617]" />
                </a>
              ))}
            </div>
          </div>

          {/* 2. SÜTUN: PLATFORM LİNKLERİ */}
          <div>
            <h4 className="text-lg font-bold text-[#D4AF37] font-serif mb-6">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. SÜTUN: KURUMSAL LİNKLERİ */}
          <div>
            <h4 className="text-lg font-bold text-[#D4AF37] font-serif mb-6">Kurumsal</h4>
            <ul className="space-y-3">
              {corporateLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. SÜTUN: İLETİŞİM */}
          <div>
            <h4 className="text-lg font-bold text-[#D4AF37] font-serif mb-6">Bize Ulaşın</h4>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-400">Maslak Mah. Büyükdere Cad. No:123, Sarıyer/İstanbul</span>
              </li>
              <li className="flex items-center gap-3">
                <a href="tel:+902123456789" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Phone className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-sm text-slate-400">+90 (212) 345 67 89</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <a href="mailto:info@edupremium.com" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Mail className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-sm text-slate-400">info@edupremium.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* --- ALT BÖLÜM --- */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; 2026 EduPremium. Tüm hakları saklıdır.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/kvkk" className="text-xs text-slate-500 hover:text-[#D4AF37] transition-colors">KVKK</Link>
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-[#D4AF37] transition-colors">Gizlilik</Link>
            <Link href="/terms" className="text-xs text-slate-500 hover:text-[#D4AF37] transition-colors">Kullanım Şartları</Link>
          </div>

          {/* Güvenli Ödeme Rozeti */}
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">256-Bit SSL Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterPremium;
