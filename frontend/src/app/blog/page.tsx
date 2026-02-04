'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';

export default function BlogPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Blog"
        subtitle="Eğitim dünyasından haberler ve ipuçları"
      />
      <main className="bg-slate-50 pb-16">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white p-8 rounded-2xl shadow-card text-center">
            <p className="text-slate-500">Yakında blog yazıları eklenecektir.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
