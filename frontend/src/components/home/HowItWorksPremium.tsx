import React from 'react';

const steps = [
  {
    number: "01",
    title: "Öğretmen Seçin",
    description: "İhtiyacınıza uygun branşta, değerlendirmeleri inceleyerek size en uygun eğitmeni belirleyin."
  },
  {
    number: "02",
    title: "Randevu Alın",
    description: "Öğretmenin müsait olduğu saatlerden size uygun olanı seçin ve güvenli ödeme ile onaylayın."
  },
  {
    number: "03",
    title: "Derse Katılın",
    description: "Ders saatinde otomatik oluşturulan yüksek kaliteli video bağlantısı ile derse tek tıkla katılın."
  },
  {
    number: "04",
    title: "İlerlemeyi Takip Edin",
    description: "Ders sonrası detaylı raporlarla ve ödev takibi ile öğrencinizin gelişimini adım adım izleyin."
  }
];

const HowItWorksPremium = () => {
  return (
    <section className="relative py-24 overflow-hidden">

      {/* --- ARKA PLAN (AYNI KÜTÜPHANE TEMASI) --- */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2672&auto=format&fit=crop')` }}
        />
        {/* Beyaz Perde (Yazıların okunması için - %60 Opaklık) */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/90"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">

        {/* BAŞLIK */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-[#D4AF37] font-bold tracking-widest text-xs uppercase mb-3 block">NASIL ÇALIŞIR?</span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-6">
            4 Kolay Adımda Başlayın
          </h2>
          <p className="text-slate-700 text-lg font-medium">
            Birkaç dakika içinde ilk dersinizi ayarlayabilir, eğitim yolculuğunuza başlayabilirsiniz.
          </p>
        </div>

        {/* ADIMLAR GRID */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Bağlantı Çizgisi (Sadece Masaüstü) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent -z-10"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 hover:bg-white hover:shadow-xl hover:shadow-[#D4AF37]/10 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
            >
              {/* Numara (Arka planda büyük silik) */}
              <span className="absolute -right-4 -top-6 text-9xl font-serif text-[#0F172A]/5 group-hover:text-[#D4AF37]/10 transition-colors duration-500 select-none">
                {step.number}
              </span>

              {/* Numara (Ön planda şık) */}
              <div className="text-4xl font-serif font-bold text-[#D4AF37] mb-4 relative z-10 drop-shadow-sm">
                {step.number}
              </div>

              {/* İçerik */}
              <h3 className="text-xl font-bold text-[#0F172A] mb-3 font-serif relative z-10">
                {step.title}
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed font-medium relative z-10">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksPremium;
