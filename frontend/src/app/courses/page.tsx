'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import { EDUCATION_LEVELS, LevelKey } from '@/lib/constants';

export default function DerslerPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Dersler"
        subtitle="Tüm branşlarda uzman öğretmenlerimizle birebir ders alın."
      />
      <main className="bg-slate-50 pb-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          
          <div className="space-y-12">
            {Object.entries(EDUCATION_LEVELS).map(([key, value]) => (
              <div key={key}>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">{value.label}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {value.subjects.map((ders) => (
                    <Link 
                      href={'/teachers?level=' + key + '&subject=' + encodeURIComponent(ders)}
                      key={ders} 
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all text-center group"
                    >
                      <span className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{ders}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
