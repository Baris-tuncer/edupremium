'use client';

import React from 'react';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Öğretmen Seçin',
      description: 'İhtiyacınıza uygun branşta, değerlendirmeleri inceleyerek öğretmeninizi belirleyin.',
    },
    {
      number: '02',
      title: 'Randevu Alın',
      description: 'Öğretmenin müsait olduğu saatlerden size uygun olanı seçin ve güvenli ödeme ile onaylayın.',
    },
    {
      number: '03',
      title: 'Derse Katılın',
      description: 'Ders saatinde otomatik oluşturulan video bağlantısı ile online dersinize tek tıkla katılın.',
    },
    {
      number: '04',
      title: 'İlerlemeyi Takip Edin',
      description: 'Ders sonrası raporlarla öğrencinizin gelişimini takip edin.',
    },
  ];

  return (
    <section className="section bg-slate-50">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-gold-600 uppercase tracking-wider mb-4">
            Nasıl Çalışır?
          </span>
          <h2 className="mb-6">4 Kolay Adımda Başlayın</h2>
          <p className="text-lg text-slate-600">
            Birkaç dakika içinde ilk dersinizi ayarlayabilirsiniz.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-navy-200 to-transparent z-0" />
              )}
              <div className="relative bg-white rounded-2xl p-8 shadow-card hover:shadow-elevated transition-shadow duration-300">
                <div className="font-display text-5xl font-bold text-navy-100 mb-4">
                  {step.number}
                </div>
                <h3 className="font-display text-xl font-semibold text-navy-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
