import React from 'react';
import Link from 'next/link';
import { GraduationCap, Presentation, ChevronRight, Star } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#FDFBF7]/80 backdrop-blur-xl overflow-hidden">

      {/* ARKA PLAN - Opaklık Landing Page ile Eşitlendi (%60) */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')`
          }}
        ></div>
        {/* KRİTİK AYAR: %60 Opaklık (Landing Page Standardı) */}
        <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">

        {/* Rozet */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest mb-8 bg-white/40 backdrop-blur-md shadow-sm">
          <Star className="w-3 h-3 text-[#D4AF37] fill-current" /> EduPremium
        </div>

        {/* Başlık */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-3 drop-shadow-sm">
          Giriş Yap
        </h1>
        <p className="text-slate-700 text-lg mb-12 font-medium">
          Hesap türünüzü seçin
        </p>

        {/* Kartlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* VELİ / ÖĞRENCİ */}
          <Link
            href="/student/login"
            className="group bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-10 hover:bg-white hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#D4AF37]/20 transition-all duration-300 flex flex-col items-center cursor-pointer relative overflow-hidden"
          >
            <div className="w-16 h-16 bg-[#FDFBF7]/80 backdrop-blur-xl border border-slate-100 rounded-2xl flex items-center justify-center text-[#0F172A] mb-6 group-hover:bg-[#D4AF37] group-hover:text-white transition-all shadow-sm">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-2">
              Veli / Öğrenci
            </h2>
            <p className="text-slate-600 text-sm mb-8 px-4 font-medium">
              Ders almak için giriş yapın
            </p>
            <span className="inline-flex items-center gap-2 text-[#0F172A] font-bold uppercase tracking-wider text-xs border border-slate-300 px-5 py-2.5 rounded-full group-hover:bg-[#0F172A] group-hover:text-white group-hover:border-[#0F172A] transition-all">
              Giriş Yap <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          {/* ÖĞRETMEN */}
          <Link
            href="/teacher/login"
            className="group bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-10 hover:bg-white hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#D4AF37]/20 transition-all duration-300 flex flex-col items-center cursor-pointer relative overflow-hidden"
          >
            <div className="w-16 h-16 bg-[#FDFBF7]/80 backdrop-blur-xl border border-slate-100 rounded-2xl flex items-center justify-center text-[#0F172A] mb-6 group-hover:bg-[#D4AF37] group-hover:text-white transition-all shadow-sm">
              <Presentation className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-2">
              Öğretmen
            </h2>
            <p className="text-slate-600 text-sm mb-8 px-4 font-medium">
              Ders vermek için giriş yapın
            </p>
            <span className="inline-flex items-center gap-2 text-[#0F172A] font-bold uppercase tracking-wider text-xs border border-slate-300 px-5 py-2.5 rounded-full group-hover:bg-[#0F172A] group-hover:text-white group-hover:border-[#0F172A] transition-all">
              Giriş Yap <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

        </div>

        <div className="mt-12 text-slate-600 text-sm font-medium">
          Hesabınız yok mu? <Link href="/register" className="text-[#0F172A] font-bold hover:text-[#D4AF37] transition-colors ml-1 underline decoration-slate-300 underline-offset-4">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}
