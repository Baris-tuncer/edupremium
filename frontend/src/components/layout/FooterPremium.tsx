'use client';

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

            {/* Mobil Uygulama Butonları */}
            <div className="mt-6">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Mobil Uygulama</p>
              <div className="flex gap-2">
                {/* App Store */}
                <button
                  onClick={() => alert('Yapım aşamasında - Çok yakında App Store\'da!')}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-white px-3 py-2 rounded-lg transition-all duration-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] leading-none text-slate-500">Yakında</div>
                    <div className="text-xs font-semibold leading-tight">App Store</div>
                  </div>
                </button>
                {/* Google Play */}
                <button
                  onClick={() => alert('Yapım aşamasında - Çok yakında Google Play\'de!')}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-white px-3 py-2 rounded-lg transition-all duration-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] leading-none text-slate-500">Yakında</div>
                    <div className="text-xs font-semibold leading-tight">Google Play</div>
                  </div>
                </button>
              </div>
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
