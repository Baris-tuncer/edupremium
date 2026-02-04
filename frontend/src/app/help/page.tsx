'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';

export default function YardimPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Yardım Merkezi"
        subtitle="Size nasıl yardımcı olabiliriz?"
      />
      <main className="bg-slate-50 pb-16">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/faq" className="bg-white p-6 rounded-2xl shadow-card hover:shadow-elevated transition-shadow">
              <h3 className="font-semibold text-lg text-navy-900 mb-2">Sıkça Sorulan Sorular</h3>
              <p className="text-slate-500">En çok sorulan soruların cevapları</p>
            </Link>
            <Link href="/contact" className="bg-white p-6 rounded-2xl shadow-card hover:shadow-elevated transition-shadow">
              <h3 className="font-semibold text-lg text-navy-900 mb-2">Bize Ulaşın</h3>
              <p className="text-slate-500">Destek ekibimizle iletişime geçin</p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
