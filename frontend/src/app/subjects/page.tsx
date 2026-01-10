'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

const subjectCategories = [
  {
    title: 'İlkokul',
    subjects: ['Matematik', 'Türkçe', 'Fen Bilimleri', 'İngilizce', 'Sosyal Bilgiler']
  },
  {
    title: 'Ortaokul',
    subjects: ['Matematik', 'Türkçe', 'Fen Bilimleri', 'İngilizce', 'Sosyal Bilgiler']
  },
  {
    title: 'Lise',
    subjects: ['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Tarih', 'Coğrafya', 'Felsefe']
  },
  {
    title: 'Sınav Hazırlık',
    subjects: ['LGS Hazırlık', 'TYT Hazırlık', 'AYT Hazırlık']
  },
  {
    title: 'Yabancı Dil',
    subjects: ['İngilizce', 'Almanca', 'Fransızca', 'İspanyolca', 'TOEFL Hazırlık', 'IELTS Hazırlık']
  }
];

export default function SubjectsPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
        <div className="container-wide">
          <div className="mb-12">
            <h1 className="font-display text-4xl font-bold text-navy-900 mb-4">Dersler</h1>
            <p className="text-slate-600 text-lg">Tüm branşlarda uzman öğretmenlerimizle birebir ders alın.</p>
          </div>

          <div className="space-y-12">
            {subjectCategories.map((category) => (
              <div key={category.title}>
                <h2 className="font-display text-2xl font-semibold text-navy-900 mb-6">{category.title}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {category.subjects.map((subject) => (
                    <Link
                      key={subject}
                      href={"/teachers?subject=" + encodeURIComponent(subject)}
                      className="card p-6 text-center hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                    >
                      <span className="font-medium text-navy-900">{subject}</span>
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
