'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

const FooterPremium = () => {

  // LİNKLERİ BURADA TANIMLIYORUZ (Doğru Yönlendirme İçin)
  const platformLinks = [
    { name: 'Öğretmenler', href: '/teachers' },
    { name: 'Dersler', href: '/subjects' }, // Veya /courses
    { name: 'Nasıl Çalışır?', href: '/how-it-works' },
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
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/logo-192.png"
                alt="EduPremium Logo"
                className="w-14 h-14 object-contain"
              />
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
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-80 transition-all duration-300"
              >
                <Facebook className="w-4 h-4 text-white" />
              </a>
              {/* Twitter/X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-all duration-300"
              >
                <Twitter className="w-4 h-4 text-white" />
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com/edupremium_official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-all duration-300"
                style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
              >
                <Instagram className="w-4 h-4 text-white" />
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#0A66C2] flex items-center justify-center hover:opacity-80 transition-all duration-300"
              >
                <Linkedin className="w-4 h-4 text-white" />
              </a>
            </div>

            {/* Mobil Uygulama Butonları */}
            <div className="mt-6">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Mobil Uygulama</p>
              <div className="flex gap-2">
                {/* App Store */}
                <button
                  onClick={() => alert('Yapım aşamasında - Çok yakında App Store\'da!')}
                  className="flex items-center gap-2 bg-black border border-white/20 hover:border-white/40 text-white px-3 py-2 rounded-lg transition-all duration-300"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] leading-none text-slate-400">Yakında</div>
                    <div className="text-xs font-semibold leading-tight">App Store</div>
                  </div>
                </button>
                {/* Google Play */}
                <button
                  onClick={() => alert('Yapım aşamasında - Çok yakında Google Play\'de!')}
                  className="flex items-center gap-2 bg-black border border-white/20 hover:border-white/40 text-white px-3 py-2 rounded-lg transition-all duration-300"
                >
                  <svg className="w-6 h-6" viewBox="0 0 512 512">
                    <path fill="#2196F3" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"/>
                    <path fill="#4CAF50" d="M47 0C34.5 0 24 10.5 24 23v466c0 12.5 10.5 23 23 23l287-287L47 0z"/>
                    <path fill="#FFC107" d="M325.3 277.7L104.6 499l280.8-161.2-60.1-60.1z"/>
                    <path fill="#F44336" d="M465 234.3c12-6.9 12-24.6 0-31.5L385.4 174l-60.1 60.1 60.1 60.1 79.6-28.4c0 .1 0-31.5 0-31.5z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] leading-none text-slate-400">Yakında</div>
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
                <span className="text-sm text-slate-300">Maslak Mah. Büyükdere Cad. No:123, Sarıyer/İstanbul</span>
              </li>
              <li className="flex items-center gap-3">
                <a href="tel:+902123456789" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Phone className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-sm text-slate-300">+90 (212) 345 67 89</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <a href="mailto:info@visserr.com" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Mail className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-sm text-slate-300">info@visserr.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* --- ALT BÖLÜM --- */}
        <div className="border-t border-white/10 pt-8">
          {/* Güvenlik Rozetleri */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[11px] text-slate-300 uppercase tracking-wider font-bold">256-Bit SSL</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <svg className="w-4 h-4 text-[#F6821F]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5088 16.8447C15.981 17.5354 15.4068 18.2679 14.5624 18.2825C13.7179 18.2971 13.4378 17.7877 12.4596 17.7877C11.4814 17.7877 11.1686 18.2679 10.3715 18.2971C9.54217 18.3263 8.88497 17.4878 8.35257 16.8009C7.26867 15.3927 6.43207 12.8352 7.54787 11.1087C8.10097 10.2556 8.98457 9.71309 9.94457 9.69849C10.7563 9.68389 11.5214 10.2483 12.0181 10.2483C12.5148 10.2483 13.4451 9.56439 14.4233 9.66929C14.8346 9.68679 15.8636 9.82809 16.5453 10.7709C16.4836 10.8099 15.2076 11.5534 15.2222 13.0949C15.2368 14.9329 16.8174 15.5572 16.8356 15.5645C16.8174 15.6037 16.5672 16.4896 16.5088 16.8447ZM14.0232 6.36719C13.4847 7.00069 12.6329 7.49179 11.7812 7.41609C11.6667 6.56419 12.0617 5.67149 12.5548 5.10379C13.0915 4.48489 14.0268 3.99379 14.7814 3.96459C14.8814 4.85729 14.5523 5.72639 14.0232 6.36719Z"/>
              </svg>
              <span className="text-[11px] text-slate-300 uppercase tracking-wider font-bold">App Store Güvenli</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#F6821F" d="M16.557 12.667l1.037-4.413-4.787 4.413h3.75zm-5.337.006l2.17-5.467-5.44 2.067 3.27 3.4zm4.32-6.24l-4.413 1.61L7.61 6.89l7.93-.463zM5.557 8.833l2.94 2.06-2.557.69-.383-2.75zm-.267 3.377l1.18 1.233-1.66.557.48-1.79zm8.78 3.753l.903-3.67h-3.31l2.407 3.67zm-5.723-1.376l3.95.293-3.117 1.75-.833-2.043zm-2.457-.64l1.3-2.45.847 2.087-2.147.363zm4.94 4.313l.78-1.81 1.093 1.65-1.873.16zm.557-3.083l-4.517-.327-.57 1.417 4.23 2.583.857-3.673z"/>
              </svg>
              <span className="text-[11px] text-slate-300 uppercase tracking-wider font-bold">Cloudflare Korumalı</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-300 font-medium">
                &copy; 2026 EduPremium. Tüm hakları saklıdır.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tüm içerikler 5846 sayılı FSEK ve uluslararası telif hakları ile korunmaktadır. İzinsiz kopyalanması yasaktır.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/kvkk" className="text-xs text-slate-400 hover:text-[#D4AF37] transition-colors">KVKK</Link>
              <Link href="/privacy" className="text-xs text-slate-400 hover:text-[#D4AF37] transition-colors">Gizlilik</Link>
              <Link href="/terms" className="text-xs text-slate-400 hover:text-[#D4AF37] transition-colors">Kullanım Şartları</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterPremium;
