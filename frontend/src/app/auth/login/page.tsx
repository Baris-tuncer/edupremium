import React from 'react';
import Link from 'next/link';
import { GraduationCap, Presentation, ArrowRight, Star } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#020617]">

      {/* --- 1. ARKA PLAN KATMANI (ATMOSFER) --- */}
      <div className="absolute inset-0 z-0">
        {/* Fotoğraf: Modern eğitim ortamı */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2670&auto=format&fit=crop')`
          }}
        ></div>

        {/* KRİTİK: Koyu Lacivert Perde (%85 Opaklık) - Yazılar net okunsun diye */}
        <div className="absolute inset-0 bg-[#020617]/85 backdrop-blur-[2px]"></div>

        {/* Işık Efektleri */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37] opacity-[0.05] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4AF37] opacity-[0.03] rounded-full blur-[120px]"></div>
      </div>

      {/* --- 2. İÇERİK KATMANI --- */}
      <div className="relative z-10 container mx-auto px-4">

        {/* BAŞLIK */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-6 bg-[#D4AF37]/10 backdrop-blur-md">
            <Star className="w-3 h-3 fill-current" /> EduPremium Giriş
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white font-serif mb-4 drop-shadow-lg">
            Tekrar Hoş Geldiniz
          </h1>
          <p className="text-slate-400 text-lg font-light max-w-xl mx-auto">
            Premium eğitim paneline erişmek için lütfen giriş tipini seçiniz.
          </p>
        </div>

        {/* SEÇİM KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {/* --- KART 1: ÖĞRENCİ / VELİ --- */}
          <Link
            href="/auth/login/student"
            className="group relative h-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/10 hover:border-[#D4AF37]/50 transition-all duration-500 overflow-hidden"
          >
            {/* Hover Işığı */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/0 to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#D4AF37] transition-all duration-500 shadow-2xl">
              <GraduationCap className="w-10 h-10 text-slate-300 group-hover:text-[#D4AF37] transition-colors" />
            </div>

            <h2 className="text-2xl font-bold text-white font-serif mb-2 group-hover:text-[#D4AF37] transition-colors">
              Öğrenci / Veli
            </h2>
            <p className="text-slate-400 text-sm mb-8 px-4 group-hover:text-slate-200 transition-colors">
              Ders takibi, ödevler ve gelişim raporları için giriş yapın.
            </p>

            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-[#D4AF37] transition-colors">
              Giriş Yap <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          {/* --- KART 2: EĞİTMEN (YENİ SİMGE: SUNUM TAHTASI) --- */}
          <Link
            href="/auth/login/teacher"
            className="group relative h-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/10 hover:border-[#D4AF37]/50 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/0 to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#D4AF37] transition-all duration-500 shadow-2xl">
              {/* Kravat yerine Sunum Tahtası */}
              <Presentation className="w-10 h-10 text-slate-300 group-hover:text-[#D4AF37] transition-colors" />
            </div>

            <h2 className="text-2xl font-bold text-white font-serif mb-2 group-hover:text-[#D4AF37] transition-colors">
              Eğitmen
            </h2>
            <p className="text-slate-400 text-sm mb-8 px-4 group-hover:text-slate-200 transition-colors">
              Ders programı yönetimi ve öğrenci takibi için panelinize gidin.
            </p>

            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-[#D4AF37] transition-colors">
              Panelime Git <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

        </div>

        {/* Alt Link */}
        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm">
            Henüz hesabınız yok mu? <Link href="/register" className="text-[#D4AF37] font-bold hover:underline">Hemen Kayıt Olun</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
