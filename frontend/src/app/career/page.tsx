'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';

export default function KariyerPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Kariyer"
        subtitle="EduPremium ailesine katılmak ister misiniz?"
      />
      <main className="bg-slate-50 pb-16">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white p-8 rounded-2xl shadow-card">
            <h2 className="font-semibold text-xl text-navy-900 mb-4">Öğretmen Olarak Başvurun</h2>
            <p className="text-slate-600 mb-6">Alanında uzman öğretmenler arıyoruz. Esnek çalışma saatleri ve rekabetçi kazanç fırsatı.</p>
            <a href="/teacher/register" className="inline-block bg-navy-900 text-white px-6 py-3 rounded-lg hover:bg-navy-800 transition-colors">Başvur</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
