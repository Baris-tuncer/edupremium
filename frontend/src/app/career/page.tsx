import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Star, Briefcase, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function KariyerPage() {
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
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest mb-6 bg-white/40 backdrop-blur-md shadow-sm">
                <Briefcase className="w-3 h-3 text-[#D4AF37]" /> Kariyer
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Kariyer</h1>
              <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
                EduPremium ailesine katılmak ister misiniz?
              </p>
            </div>

            {/* Kart */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F172A]/5">
              <div className="w-14 h-14 bg-[#0F172A] rounded-2xl flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7 text-[#D4AF37]" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">Öğretmen Olarak Başvurun</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Alanında uzman öğretmenler arıyoruz. Esnek çalışma saatleri ve rekabetçi kazanç fırsatı.
              </p>
              <Link
                href="/teacher/register"
                className="inline-flex items-center gap-2 bg-[#0F172A] text-white font-bold py-4 px-8 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg group"
              >
                Başvur <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
