'use client'

import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Star, BookOpen, ChevronRight } from 'lucide-react'
import { EDUCATION_LEVELS, LevelKey } from '@/lib/constants'

export default function DerslerPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen relative bg-[#FDFBF7] overflow-hidden">

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
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest mb-6 bg-white/40 backdrop-blur-md shadow-sm">
                <BookOpen className="w-3 h-3 text-[#D4AF37]" /> Dersler
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Dersler</h1>
              <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
                Tüm branşlarda uzman öğretmenlerimizle birebir ders alın.
              </p>
            </div>

            {/* Seviyeler */}
            <div className="space-y-10">
              {Object.entries(EDUCATION_LEVELS).map(([key, value]) => (
                <div key={key} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-[#0F172A]/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0F172A] font-serif">{value.label}</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {value.subjects.map((ders) => (
                      <Link
                        href={'/teachers?level=' + key + '&subject=' + encodeURIComponent(ders)}
                        key={ders}
                        className="group bg-white/60 border border-white/50 rounded-2xl p-4 text-center hover:bg-white hover:scale-[1.02] hover:shadow-[#D4AF37]/10 hover:shadow-lg transition-all duration-300"
                      >
                        <span className="font-medium text-[#0F172A] group-hover:text-[#D4AF37] transition-colors text-sm flex items-center justify-center gap-1">
                          {ders}
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
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
