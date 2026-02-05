import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Star, BookOpen } from 'lucide-react'

export default function BlogPage() {
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
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest mb-6 bg-white/40 backdrop-blur-md shadow-sm">
                <BookOpen className="w-3 h-3 text-[#D4AF37]" /> Blog
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Blog</h1>
              <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
                Güncel İçerikler
              </p>
            </div>

            {/* İçerik */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F172A]/5 text-center">
              <div className="w-16 h-16 bg-[#FDFBF7] border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <p className="text-slate-600 text-lg italic">
                Eğitim ve teknoloji üzerine yazılarımız çok yakında burada olacak.
              </p>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
