'use client';

import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Seçkin Öğretmenler',
      description: 'Titiz bir değerlendirme sürecinden geçmiş, alanında uzman öğretmenler. Her öğretmen davet usulü sisteme dahil edilir.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Profesyonel Altyapı',
      description: 'Yüksek kaliteli video altyapısı ile kesintisiz online dersler. Otomatik ders bağlantısı oluşturma ve hatırlatmalar.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Güvenli Ödeme',
      description: '3D Secure kredi kartı ile güvenli ödeme. Şeffaf fiyatlandırma, gizli ücret yok.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Esnek Zamanlama',
      description: 'Öğretmen müsaitlik takvimine göre size uygun saati seçin. 7/24 randevu alma imkanı.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Anlık Bildirimler',
      description: 'Ders hatırlatmaları, randevu onayları ve ilerleme raporları e-posta ile anında iletilir.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Kişisel Yaklaşım',
      description: 'Öğrencinin seviyesine ve hedeflerine göre özelleştirilmiş ders planları. Birebir ilgi ve takip.',
    },
  ];

  return (
    <section className="section bg-white/80 backdrop-blur-xl">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-gold-600 uppercase tracking-wider mb-4">
            Neden Biz?
          </span>
          <h2 className="mb-6">Eğitimde Fark Yaratan Özellikler</h2>
          <p className="text-lg text-slate-600">
            Geleneksel özel ders deneyimini modern teknoloji ile birleştirerek
            eğitimde yeni bir standart belirliyoruz.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl border border-slate-100 hover:border-navy-100 hover:bg-navy-50/30 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-navy-100 rounded-2xl flex items-center justify-center text-navy-600 mb-6 group-hover:bg-navy-900 group-hover:text-white transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="font-display text-xl font-semibold text-navy-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
