import React from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';

const CtaPremium = () => {
  return (
    <section className="relative py-32 overflow-hidden">

      {/* --- ARKA PLAN (KÜTÜPHANE TEMASI) --- */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2672&auto=format&fit=crop')` }}
        />
        {/* Beyaz Perde (%60 Opaklık) */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
        {/* Üstten ve Alttan Hafif Geçiş (Yumuşak Bitiş) */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/90"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">

        {/* İKONİK ÜST SİMGE */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0F172A] text-[#D4AF37] mb-8 shadow-2xl shadow-[#D4AF37]/20 border-4 border-white/50 animate-bounce-slow">
          <ArrowRight className="w-8 h-8 -rotate-45" />
        </div>

        {/* BAŞLIK VE METİN */}
        <h2 className="text-4xl md:text-6xl font-bold text-[#0F172A] font-serif mb-6 drop-shadow-sm leading-tight">
          Çocuğunuzun Geleceğine <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#b4941f]">Yatırım Yapın</span>
        </h2>

        <p className="text-slate-700 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          Akademik başarıda fark yaratmak için ilk adımı bugün atın.
          Uzman öğretmenlerimiz öğrencinizi bekliyor.
        </p>

        {/* BUTONLAR */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          {/* Birincil Buton (Kayıt Ol) */}
          <Link
            href="/register"
            className="group relative px-8 py-4 bg-[#0F172A] text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:shadow-[#0F172A]/30 hover:-translate-y-1 transition-all duration-300 min-w-[200px]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Ücretsiz Kayıt Ol <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            {/* Buton Arkası Altın Işıltı */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FDFBF7] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <span className="absolute inset-0 rounded-xl border border-white/10"></span>
          </Link>

          {/* İkincil Buton (İncele) */}
          <Link
            href="/teachers"
            className="px-8 py-4 bg-white/50 backdrop-blur-md border-2 border-[#0F172A]/10 text-[#0F172A] font-bold text-lg rounded-xl hover:bg-white hover:border-[#0F172A] transition-all duration-300 min-w-[200px] flex items-center justify-center gap-2 group"
          >
            <Search className="w-5 h-5 text-[#D4AF37] group-hover:text-[#0F172A] transition-colors" />
            Öğretmenleri İncele
          </Link>
        </div>

      </div>
    </section>
  );
};

export default CtaPremium;
