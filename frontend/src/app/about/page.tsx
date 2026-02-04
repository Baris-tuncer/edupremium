import PageHeader from '@/components/shared/PageHeader';
import { ContentSection } from '@/components/shared/ContentSection';
import { Target, Users, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="w-full">
      <PageHeader title="Hakkımızda" subtitle="Hikayemiz" />
      <ContentSection>
        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[#0F172A]">
          <p className="lead text-2xl font-serif text-center mb-12">
            "Eğitim, bir kova doldurmak değil, bir ateş yakmaktır."
          </p>
          <div className="grid md:grid-cols-3 gap-0 border border-[#D4AF37]/20 mb-16">
             <div className="p-8 border-r border-[#D4AF37]/20 text-center hover:bg-white transition-colors">
                <Target className="w-10 h-10 mx-auto text-[#D4AF37] mb-4"/>
                <h3 className="text-xl font-bold mb-2">Misyon</h3>
                <p className="text-sm">Erişilebilir mükemmellik.</p>
             </div>
             <div className="p-8 border-r border-[#D4AF37]/20 text-center hover:bg-white transition-colors">
                <Users className="w-10 h-10 mx-auto text-[#D4AF37] mb-4"/>
                <h3 className="text-xl font-bold mb-2">Vizyon</h3>
                <p className="text-sm">Global eğitim standartları.</p>
             </div>
             <div className="p-8 text-center hover:bg-white transition-colors">
                <Award className="w-10 h-10 mx-auto text-[#D4AF37] mb-4"/>
                <h3 className="text-xl font-bold mb-2">Değerler</h3>
                <p className="text-sm">Güven, Kalite, Şeffaflık.</p>
             </div>
          </div>
          <h3>Biz Kimiz?</h3>
          <p>EduPremium, Türkiye'nin en seçkin eğitmenlerini öğrencilerle buluşturan premium bir eğitim platformudur. Standartların ötesinde, kişiselleştirilmiş ve sonuç odaklı bir yaklaşım benimsiyoruz.</p>
        </div>
      </ContentSection>
    </main>
  );
}
