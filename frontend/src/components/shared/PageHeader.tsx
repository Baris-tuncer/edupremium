import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    // w-full (Tam Genişlik), h-[40vh] (Yükseklik), rounded-none (Köşe Yok)
    <div className="relative w-full h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-[#0F172A]">

      {/* Arka Plan Fotoğrafı - Sabit ve Tam Ekran */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/hero-library.jpg')`,
          opacity: 0.6
        }}
      />

      {/* Lacivert Perde */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0F172A]/80 via-[#0F172A]/70 to-[#0F172A]/90"></div>

      {/* İçerik */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-white font-serif mb-4 tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-[#D4AF37]"></div>
            <p className="text-lg md:text-xl text-[#D4AF37] font-light tracking-widest uppercase">
              {subtitle}
            </p>
            <div className="h-px w-12 bg-[#D4AF37]"></div>
          </div>
        )}
      </div>

      {/* Alt Çizgi - Keskin Geçiş İçin */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37]"></div>
    </div>
  );
};
export default PageHeader;
