import React from 'react';
import { ShieldCheck, Video, Lock, Clock, Mail, Users } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "Seçkin Öğretmenler",
    description: "Titiz bir değerlendirme sürecinden geçmiş, alanında uzman öğretmenler. Her öğretmen davet usulü sisteme dahil edilir."
  },
  {
    icon: <Video className="w-8 h-8" />,
    title: "Profesyonel Altyapı",
    description: "Yüksek kaliteli video altyapısı ile kesintisiz online dersler. Otomatik ders bağlantısı oluşturma ve hatırlatmalar."
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: "Güvenli Ödeme",
    description: "3D Secure kredi kartı ile güvenli ödeme. Şeffaf fiyatlandırma, gizli ücret yok."
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: "Esnek Zamanlama",
    description: "Öğretmen müsaitlik takvimine göre size en uygun zamanı saniyeler içinde planlayın."
  },
  {
    icon: <Mail className="w-8 h-8" />,
    title: "Anlık Bildirimler",
    description: "Ders hatırlatmaları, randevu onayları ve gelişim raporları anında cebinize gelir."
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Kişisel Yaklaşım",
    description: "Öğrencinin seviyesine ve hedeflerine uygun, tamamen kişiselleştirilmiş eğitim müfredatı."
  }
];

const WhyUsPremium = () => {
  return (
    <section className="relative py-24 overflow-hidden">

      {/* --- ARKA PLAN (KÜTÜPHANE VE IŞIKLAR) --- */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2672&auto=format&fit=crop')` }}
        />
        {/* Beyaz Perde (Yazıların okunması için) */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px]"></div>
        {/* Hafif Altın Geçiş */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/80"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">

        {/* BAŞLIK (Orijinal Metin & Renk) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#D4AF37] font-bold tracking-widest text-xs uppercase mb-3 block">NEDEN BİZ?</span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-6">
            Eğitimde Fark Yaratan Özellikler
          </h2>
          <p className="text-slate-600 text-lg">
            Geleneksel özel ders deneyimini modern teknoloji ile birleştirerek eğitimde yeni bir standart belirliyoruz.
          </p>
        </div>

        {/* KARTLAR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-8 hover:bg-white hover:shadow-2xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1 transition-all duration-500"
            >

              {/* İKON KUTUSU */}
              <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0F172A]/5 text-[#0F172A] group-hover:bg-[#0F172A] group-hover:text-[#D4AF37] transition-all duration-300">
                {feature.icon}
              </div>

              {/* İÇERİK */}
              <h3 className="text-xl font-bold text-[#0F172A] mb-3 font-serif">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyUsPremium;
