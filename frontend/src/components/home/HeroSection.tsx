import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, CheckCircle2, Users, BookOpen } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen bg-[#FDFBF7]/80 backdrop-blur-xl overflow-hidden flex items-center">

      {/* Arka Plan Fotoğrafı */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/hero-library.jpg')`
        }}
      />

      {/* Perde (Gradient) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/95 to-[#FDFBF7]/40 sm:via-[#FDFBF7]/85"></div>

      {/* İçerik Alanı */}
      <div className="container mx-auto px-6 md:px-12 relative z-20 py-24">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Sol Taraf - Ana İçerik */}
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

          {/* Sağ Taraf - Eğitmen Görseli ve Özellikler */}
          <div className="hidden lg:flex items-center gap-6">

            {/* Eğitmen Görseli */}
            <div className="relative">
              {/* Arka Plan Dekorasyon */}
              <div className="absolute -inset-4 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-[3rem] blur-2xl"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-xl"></div>

              {/* Görsel */}
              <div className="relative">
                <img
                  src="/hero-teacher.png"
                  alt="EduPremium Eğitmen"
                  className="w-[320px] h-auto object-contain drop-shadow-2xl"
                />

              </div>
            </div>

            {/* Eğitmenlere Yönelik Özellikler */}
            <div className="flex flex-col gap-4 max-w-[280px]">
              {/* Başlık */}
              <div className="mb-2">
                <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1">Eğitmenler İçin</p>
                <h3 className="text-xl font-bold text-[#0F172A] leading-tight">Eğitim Kariyerinizi<br />Bir Üst Seviyeye Taşıyın</h3>
              </div>

              {/* Maddeler */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50 hover:bg-white/80 transition-all group">
                  <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37] transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm">Birebir Özel Dersler</p>
                    <p className="text-xs text-slate-500">Kendi programınızı belirleyin</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50 hover:bg-white/80 transition-all group">
                  <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37] transition-colors">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm">Grup Dersleri Oluşturun</p>
                    <p className="text-xs text-slate-500">3-20 kişilik sınıflar açın</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50 hover:bg-white/80 transition-all group">
                  <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37] transition-colors">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm">Kursunuzu Yönetin</p>
                    <p className="text-xs text-slate-500">Tüm araçlar elinizin altında</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/teacher/register"
                className="mt-2 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B49120] text-[#0F172A] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all group"
              >
                Eğitmen Olarak Katılın
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Scroll Down İndikatörü */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#0F172A] font-bold">Keşfet</span>
        <ChevronDown className="w-6 h-6 text-[#0F172A]" />
      </div>

      {/* Alt Çizgi */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/30 to-[#D4AF37]/0"></div>

    </section>
  );
};

export default HeroSection;
