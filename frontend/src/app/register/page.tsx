import React from 'react';
import Link from 'next/link';
import { GraduationCap, Presentation, ChevronRight, Star } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#020617] overflow-hidden">

      {/* ARKA PLAN (AYNI KÜTÜPHANE - BÜTÜNLÜK İÇİN) */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')`
          }}
        ></div>
        <div className="absolute inset-0 bg-[#020617]/85 backdrop-blur-[3px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-8 bg-[#D4AF37]/10 backdrop-blur-md">
          <Star className="w-3 h-3 fill-current" /> Aramıza Katılın
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white font-serif mb-3 drop-shadow-md">
          Hesap Oluştur
        </h1>
        <p className="text-slate-300 text-lg mb-12 font-light">
          Nasıl devam etmek istersiniz?
        </p>

        {/* KARTLAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* VELİ / ÖĞRENCİ KAYIT */}
          <Link
            href="/student/register"
            className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 hover:bg-white/10 hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col items-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-transparent border border-white/5 rounded-2xl flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/30 transition-all shadow-lg">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white font-serif mb-2 group-hover:text-[#D4AF37] transition-colors">
              Veli / Öğrenci
            </h2>
            <p className="text-slate-400 text-sm mb-8 group-hover:text-slate-300 transition-colors px-4">
              Çocuğunuz için uzman öğretmenlerden birebir ders almak istiyorsanız
            </p>
            <span className="inline-flex items-center gap-2 text-[#D4AF37] font-bold uppercase tracking-wider text-xs border border-[#D4AF37]/30 px-4 py-2 rounded-full group-hover:bg-[#D4AF37] group-hover:text-[#020617] transition-all">
              Kayıt Ol <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          {/* ÖĞRETMEN KAYIT */}
          <Link
            href="/teacher/register"
            className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 hover:bg-white/10 hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col items-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-transparent border border-white/5 rounded-2xl flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/30 transition-all shadow-lg">
              <Presentation className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white font-serif mb-2 group-hover:text-[#D4AF37] transition-colors">
              Öğretmen
            </h2>
            <p className="text-slate-400 text-sm mb-8 group-hover:text-slate-300 transition-colors px-4">
              Platformumuzda ders vermek ve öğrencilere ulaşmak istiyorsanız
            </p>
            <span className="inline-flex items-center gap-2 text-[#D4AF37] font-bold uppercase tracking-wider text-xs border border-[#D4AF37]/30 px-4 py-2 rounded-full group-hover:bg-[#D4AF37] group-hover:text-[#020617] transition-all">
              Başvuru Yap <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

        </div>

        <div className="mt-12 text-slate-500 text-sm">
          Zaten hesabınız var mı? <Link href="/login" className="text-white font-bold hover:text-[#D4AF37] transition-colors ml-1">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
