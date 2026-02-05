'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { BookOpen, ChevronRight, Star } from 'lucide-react'

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
]

export default function SubjectsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen relative bg-[#FDFBF7]/80 backdrop-blur-xl overflow-hidden">

        {/* --- ARKA PLAN --- */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')`
            }}
          ></div>
          <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
        </div>

        <div className="relative z-10 pt-28 pb-20 px-4">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest mb-6 bg-white/40 backdrop-blur-md shadow-sm">
                <Star className="w-3 h-3 text-[#D4AF37] fill-current" /> Branşlar
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Dersler</h1>
              <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
                Tüm branşlarda uzman öğretmenlerimizle birebir ders alın.
              </p>
            </div>

            {/* Kategoriler */}
            <div className="space-y-12">
              {subjectCategories.map((category) => (
                <div key={category.title}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0F172A] font-serif">{category.title}</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {category.subjects.map((subject) => (
                      <Link
                        key={subject}
                        href={"/teachers?subject=" + encodeURIComponent(subject)}
                        className="group bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-6 text-center hover:bg-white hover:scale-[1.03] hover:shadow-xl hover:shadow-[#D4AF37]/10 transition-all duration-300"
                      >
                        <span className="font-bold text-[#0F172A] text-sm group-hover:text-[#D4AF37] transition-colors">{subject}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#D4AF37] mx-auto mt-2 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
