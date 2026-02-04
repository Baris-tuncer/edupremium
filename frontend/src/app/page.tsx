import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedTeachers from '@/components/home/FeaturedTeachers';
import WhyUsPremium from '@/components/home/WhyUsPremium';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import SubjectsSection from '@/components/home/SubjectsSection';

// ============================================
// CTA SECTION
// ============================================
const CTASection = () => (
  <section className="section bg-gradient-navy relative overflow-hidden">
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
        <Link href="/student/register" className="btn-gold text-lg px-8 py-4">
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
        {/* 1. Kütüphane Manzaralı Giriş */}
        <HeroSection />

        {/* 2. YENİ PREMIUM ÖĞRETMEN VİTRİNİ (Taşan Kartlar + Lacivert Perde) */}
        <FeaturedTeachers />

        {/* 3. Diğer Bölümler */}
        <WhyUsPremium />
        <HowItWorksSection />
        <SubjectsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
