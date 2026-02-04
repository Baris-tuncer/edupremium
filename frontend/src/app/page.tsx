import Header from '@/components/layout/Header';
import FooterPremium from '@/components/layout/FooterPremium';
import HeroSection from '@/components/home/HeroSection';
import FeaturedTeachers from '@/components/home/FeaturedTeachers';
import WhyUsPremium from '@/components/home/WhyUsPremium';
import HowItWorksPremium from '@/components/home/HowItWorksPremium';
import SubjectCategoriesPremium from '@/components/home/SubjectCategoriesPremium';
import CtaPremium from '@/components/home/CtaPremium';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturedTeachers />
        <WhyUsPremium />
        <HowItWorksPremium />
        <SubjectCategoriesPremium />
        <CtaPremium />
      </main>
      <FooterPremium />
    </>
  );
}
