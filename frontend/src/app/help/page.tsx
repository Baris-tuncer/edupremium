import PageHeader from '@/components/shared/PageHeader';
import { ContentSection } from '@/components/shared/ContentSection';

export default function HelpPage() {
  return (
    <main className="w-full">
      <PageHeader title="Yardım Merkezi" subtitle="Size Nasıl Yardımcı Olabiliriz?" />
      <ContentSection>
         <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 border border-slate-200 hover:border-[#D4AF37] transition-colors cursor-pointer">
               <h3 className="font-bold text-xl mb-2">Öğrenci Rehberi</h3>
               <p className="text-slate-600">Ders alma, ödeme ve iptal süreçleri.</p>
            </div>
            <div className="p-8 border border-slate-200 hover:border-[#D4AF37] transition-colors cursor-pointer">
               <h3 className="font-bold text-xl mb-2">Öğretmen Rehberi</h3>
               <p className="text-slate-600">Profil oluşturma, ders verme ve ödeme alma.</p>
            </div>
         </div>
      </ContentSection>
    </main>
  );
}
