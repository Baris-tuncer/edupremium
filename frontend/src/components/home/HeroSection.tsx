import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, BookOpen } from 'lucide-react';

const HeroSection = () => {
  return (
    // 1. ANA KAPLAYICI: Ekranı tam kaplar (h-screen), boşluk yok (p-0)
    <section className="relative w-full h-screen bg-[#FDFBF7] overflow-hidden flex items-center">
      
      {/* 2. ARKA PLAN FOTOĞRAFI (Tam Ekran) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1507842217121-9e691b2d0941?q=80&w=2574&auto=format&fit=crop')`
        }}
      />

      {/* 3. PERDE (GRADIENT) - Yazıların okunması için */}
      {/* Soldan sağa doğru: Tam Krem -> Yarı Saydam -> Şeffaf */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/95 to-transparent sm:via-[#FDFBF7]/70"></div>

      {/* 4. İÇERİK ALANI */}
      <div className="container mx-auto px-6 md:px-12 relative z-20 h-full flex flex-col justify-center">
        
        <div className="max-w-2xl">
          {/* Üst Etiket */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 border-l-4 border-[#D4AF37] bg-white/50 backdrop-blur-sm">
            <span className="text-[#0F172A] font-bold tracking-widest text-xs uppercase">EduPremium Akademi</span>
          </div>

          {/* Ana Başlık */}
          <h1 className="text-5xl md:text-7xl font-bold text-[#0F172A] font-serif leading-[1.1] mb-8">
            Geleceği <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#B49120]">
              Mükemmellikle
            </span> <br />
            İnşa Edin.
          </h1>

          {/* Açıklama */}
          <p className="text-lg md:text-xl text-slate-700 mb-10 leading-relaxed max-w-lg font-light">
            Sıradan derslerin ötesine geçin. Seçkin eğitmen kadrosu ve kişiselleştirilmiş müfredat ile potansiyelinizi zirveye taşıyın.
          </p>

          {/* Butonlar */}
          <div className="flex flex-col sm:flex-row gap-5">
            <Link href="/register" className="px-10 py-4 bg-[#0F172A] text-white text-lg font-medium hover:bg-[#1E293B] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#0F172A]/20 group">
              Hemen Başla 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="/teachers" className="px-10 py-4 bg-transparent border border-[#0F172A] text-[#0F172A] text-lg font-medium hover:bg-[#0F172A] hover:text-white transition-all flex items-center justify-center">
              Eğitmenleri İncele
            </Link>
          </div>
        </div>

      </div>

      {/* 5. ALT BAĞLANTI İNDİKATÖRÜ (Scroll Down) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#0F172A] font-bold">Keşfet</span>
        <ChevronDown className="w-6 h-6 text-[#0F172A]" />
      </div>

      {/* Alt Çizgi (Diğer section ile tam öpüşmesi için) */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/30 to-[#D4AF37]/0"></div>

    </section>
  );
};

export default HeroSection;
