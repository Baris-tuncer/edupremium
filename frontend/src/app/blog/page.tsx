import PageHeader from '@/components/shared/PageHeader';
import { ContentSection } from '@/components/shared/ContentSection';

export default function BlogPage() {
  return (
    <main className="w-full">
      <PageHeader title="Blog" subtitle="Güncel İçerikler" />
      <ContentSection>
        <p className="text-center text-slate-500 italic">Eğitim ve teknoloji üzerine yazılarımız çok yakında burada olacak.</p>
      </ContentSection>
    </main>
  );
}
