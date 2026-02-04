import PageHeader from '@/components/shared/PageHeader';
import { ContentSection } from '@/components/shared/ContentSection';

export default function CareersPage() {
  return (
    <main className="w-full">
      <PageHeader title="Kariyer" subtitle="Ekibimize Katılın" />
      <ContentSection>
        <div className="text-center py-12 border border-dashed border-slate-300">
          <h3 className="text-2xl font-serif mb-4">Aramıza Katılmak İster misiniz?</h3>
          <p className="mb-8 text-slate-600">Şu anda açık pozisyonumuz bulunmamaktadır ancak genel başvurularınızı her zaman bekleriz.</p>
          <button className="px-8 py-3 bg-[#0F172A] text-white font-medium hover:bg-[#1E293B] transition-colors rounded-none">CV Gönder</button>
        </div>
      </ContentSection>
    </main>
  );
}
