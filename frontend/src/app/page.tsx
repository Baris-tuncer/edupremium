'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// ============================================
// HERO SECTION
// ============================================
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
    {/* Background Elements */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-navy-50" />
    <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-navy-100/30 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-100/40 rounded-full blur-3xl" />
    
    {/* Decorative Pattern */}
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a365d' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }} />

    <div className="container-wide relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Content */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy-50 rounded-full mb-6 animate-fade-up">
            <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse-soft" />
            <span className="text-sm font-medium text-navy-700">Türkiye'nin Premium Eğitim Platformu</span>
          </div>
          
          <h1 className="mb-6 animate-fade-up delay-100">
            Eğitimde <span className="text-gradient">Mükemmelliğe</span> Giden Yol
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed animate-fade-up delay-200">
            Alanında uzman, titizlikle seçilmiş öğretmenlerle birebir online ders deneyimi. 
            Çocuğunuzun akademik başarısı için en doğru adım. Bütçenize uygun öğretmen seçenekleriyle.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-up delay-300">
            <Link href="/register" className="btn-primary text-lg px-8 py-4">
              Hemen Başla
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/teachers" className="btn-secondary text-lg px-8 py-4">
              Öğretmenleri Keşfet
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 animate-fade-up delay-400">
            {[
              { value: '500+', label: 'Uzman Öğretmen' },
              { value: '15.000+', label: 'Tamamlanan Ders' },
              { value: '%98', label: 'Memnuniyet Oranı' },
            ].map((stat, i) => (
              <div key={i} className="text-center sm:text-left">
                <div className="font-display text-3xl md:text-4xl font-bold text-navy-900">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual */}
        <div className="relative hidden lg:block animate-fade-up delay-200">
          <div className="relative">
            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-elevated p-8 border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-navy rounded-2xl flex items-center justify-center text-white font-display text-2xl">
                  M
                </div>
                <div>
                  <div className="font-display text-xl font-semibold text-navy-900">Mehmet Öztürk</div>
                  <div className="text-slate-500">Matematik Öğretmeni</div>
                </div>
                <div className="ml-auto">
                  <div className="flex items-center gap-1 text-gold-500">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">4.9</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-sm text-slate-500 mb-1">Ders Ücreti</div>
                  <div className="font-display text-2xl font-semibold text-navy-900">₺450<span className="text-base font-normal text-slate-400">/saat</span></div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-sm text-slate-500 mb-1">Deneyim</div>
                  <div className="font-display text-2xl font-semibold text-navy-900">12 Yıl</div>
                </div>
              </div>

              <button className="btn-primary w-full">
                Randevu Al
              </button>
            </div>

            {/* Floating Cards */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-card p-4 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">Ders Tamamlandı</div>
                  <div className="text-xs text-slate-500">Az önce</div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-20 bg-white rounded-2xl shadow-card p-4 animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">MS Teams</div>
                  <div className="text-xs text-slate-500">Otomatik toplantı</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Scroll Indicator */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </section>
);

// ============================================
// FEATURES SECTION
// ============================================
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
      description: 'Microsoft Teams entegrasyonu ile kesintisiz, yüksek kaliteli video dersler. Otomatik toplantı oluşturma ve hatırlatmalar.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'AI Destekli Raporlar',
      description: 'Her ders sonrası yapay zeka tarafından hazırlanan detaylı ilerleme raporları. Velilere otomatik bilgilendirme.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Güvenli Ödeme',
      description: '3D Secure kredi kartı veya havale/EFT ile güvenli ödeme. Şeffaf fiyatlandırma, gizli ücret yok.',
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Kişisel Yaklaşım',
      description: 'Öğrencinin seviyesine ve hedeflerine göre özelleştirilmiş ders planları. Birebir ilgi ve takip.',
    },
  ];

  return (
    <section className="section bg-white">
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

// ============================================
// HOW IT WORKS SECTION
// ============================================
const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Öğretmen Seçin',
      description: 'İhtiyacınıza uygun branşta, tanıtım videolarını izleyerek ve değerlendirmeleri inceleyerek öğretmeninizi belirleyin.',
    },
    {
      number: '02',
      title: 'Randevu Alın',
      description: 'Öğretmenin müsait olduğu saatlerden size uygun olanı seçin ve güvenli ödeme ile randevunuzu onaylayın.',
    },
    {
      number: '03',
      title: 'Derse Katılın',
      description: 'Ders saatinde otomatik oluşturulan Microsoft Teams linki ile online dersinize tek tıkla katılın.',
    },
    {
      number: '04',
      title: 'İlerlemeyi Takip Edin',
      description: 'Her ders sonrası AI destekli raporlarla öğrencinizin gelişimini takip edin.',
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
              {/* Connector Line */}
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

// ============================================
// SUBJECTS SECTION
// ============================================
const SubjectsSection = () => {
  const subjects = [
    { name: 'Matematik', icon: '∑', count: 85 },
    { name: 'Fizik', icon: '⚛', count: 42 },
    { name: 'Kimya', icon: '⚗', count: 38 },
    { name: 'Biyoloji', icon: '🧬', count: 35 },
    { name: 'Türkçe', icon: 'A', count: 56 },
    { name: 'İngilizce', icon: 'EN', count: 78 },
    { name: 'Tarih', icon: '📜', count: 28 },
    { name: 'Coğrafya', icon: '🌍', count: 24 },
  ];

  return (
    <section className="section bg-white">
      <div className="container-wide">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <span className="inline-block text-sm font-semibold text-gold-600 uppercase tracking-wider mb-4">
              Branşlar
            </span>
            <h2>Tüm Dersler İçin Uzman Öğretmenler</h2>
          </div>
          <Link href="/subjects" className="btn-ghost mt-4 lg:mt-0">
            Tüm Branşları Gör
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {subjects.map((subject, index) => (
            <Link
              key={index}
              href={`/teachers?branch=${subject.name.toLowerCase()}`}
              className="group card-interactive p-6"
            >
              <div className="text-3xl mb-4">{subject.icon}</div>
              <h3 className="font-display text-lg font-semibold text-navy-900 mb-1 group-hover:text-navy-700">
                {subject.name}
              </h3>
              <p className="text-sm text-slate-500">{subject.count} öğretmen</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// CTA SECTION
// ============================================
const CTASection = () => (
  <section className="section bg-gradient-navy relative overflow-hidden">
    {/* Decorative Elements */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
    
    <div className="container-narrow relative z-10 text-center">
      <h2 className="text-white mb-6">
        Çocuğunuzun Geleceğine Yatırım Yapın
      </h2>
      <p className="text-xl text-navy-200 mb-10 max-w-2xl mx-auto">
        Akademik başarıda fark yaratmak için ilk adımı bugün atın. 
        Uzman öğretmenlerimiz öğrencinizi bekliyor.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/register" className="btn-gold text-lg px-8 py-4">
          Ücretsiz Kayıt Ol
        </Link>
        <Link href="/teachers" className="btn-secondary text-lg px-8 py-4 !bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
          Öğretmenleri İncele
        </Link>
      </div>
    </div>
  </section>
);

// ============================================
// MAIN PAGE
// ============================================
export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SubjectsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
