import React from 'react';
import Link from 'next/link';
import { GraduationCap, Presentation, ChevronRight, Star } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#FDFBF7] overflow-hidden">

      {/* --- ARKA PLAN (Kütüphane ama AYDINLIK) --- */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')`
          }}
        ></div>
        {/* Beyaz/Krem Perde (%90 Opaklık) */}
        <div className="absolute inset-0 bg-[#FDFBF7]/90 backdrop-blur-[4px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">

        {/* Logo Rozeti */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/50 text-[#0F172A] text-xs font-bold uppercase tracking-widest mb-8 bg-white/50 backdrop-blur-md shadow-sm">
          <Star className="w-3 h-3 text-[#D4AF37] fill-current" /> Aramıza Katılın
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-3 drop-shadow-sm">
          Hesap Oluştur
        </h1>
        <p className="text-slate-600 text-lg mb-12 font-medium">
          Nasıl devam etmek istersiniz?
        </p>

        {/* KARTLAR (Beyaz Porselen Görünüm) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* VELİ / ÖĞRENCİ KARTI */}
          <Link
            href="/student/register"
            className="group bg-white border border-slate-200 rounded-3xl p-10 hover:border-[#D4AF37] hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-300 flex flex-col items-center cursor-pointer relative overflow-hidden"
          >
            {/* Kart Hover Efekti */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

            <div className="w-16 h-16 bg-[#FDFBF7] border border-slate-100 rounded-2xl flex items-center justify-center text-[#0F172A] mb-6 group-hover:scale-110 group-hover:bg-[#D4AF37] group-hover:text-white transition-all shadow-sm">
              <GraduationCap className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-2">
              Veli / Öğrenci
            </h2>
            <p className="text-slate-500 text-sm mb-8 px-4 leading-relaxed">
              Çocuğunuz için uzman öğretmenlerden birebir ders almak istiyorsanız
            </p>

            <span className="inline-flex items-center gap-2 text-[#0F172A] font-bold uppercase tracking-wider text-xs border border-slate-200 px-5 py-2.5 rounded-full group-hover:bg-[#0F172A] group-hover:text-white group-hover:border-[#0F172A] transition-all">
              Kayıt Ol <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          {/* ÖĞRETMEN KARTI */}
          <Link
            href="/teacher/register"
            className="group bg-white border border-slate-200 rounded-3xl p-10 hover:border-[#D4AF37] hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-300 flex flex-col items-center cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

            <div className="w-16 h-16 bg-[#FDFBF7] border border-slate-100 rounded-2xl flex items-center justify-center text-[#0F172A] mb-6 group-hover:scale-110 group-hover:bg-[#D4AF37] group-hover:text-white transition-all shadow-sm">
              <Presentation className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-2">
              Öğretmen
            </h2>
            <p className="text-slate-500 text-sm mb-8 px-4 leading-relaxed">
              Platformumuzda ders vermek ve öğrencilere ulaşmak istiyorsanız
            </p>

            <span className="inline-flex items-center gap-2 text-[#0F172A] font-bold uppercase tracking-wider text-xs border border-slate-200 px-5 py-2.5 rounded-full group-hover:bg-[#0F172A] group-hover:text-white group-hover:border-[#0F172A] transition-all">
              Başvuru Yap <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

        </div>

        {/* ALT BİLGİ */}
        <div className="mt-12 text-slate-500 text-sm font-medium">
          Zaten hesabınız var mı? <Link href="/login" className="text-[#0F172A] font-bold hover:text-[#D4AF37] transition-colors ml-1 underline decoration-slate-300 underline-offset-4 hover:decoration-[#D4AF37]">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
