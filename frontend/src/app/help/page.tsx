import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Star, GraduationCap, Presentation, LifeBuoy } from 'lucide-react'

export default function HelpPage() {
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
                <LifeBuoy className="w-3 h-3 text-[#D4AF37]" /> Destek
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Yardım Merkezi</h1>
              <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
                Size nasıl yardımcı olabiliriz?
              </p>
            </div>

            {/* Kartlar */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5 hover:bg-white hover:scale-[1.01] hover:shadow-[#D4AF37]/10 transition-all duration-300 cursor-pointer">
                <div className="w-14 h-14 bg-[#0F172A] rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#D4AF37] transition-colors">
                  <GraduationCap className="w-7 h-7 text-[#D4AF37] group-hover:text-[#0F172A] transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-2">Öğrenci Rehberi</h3>
                <p className="text-slate-600">Ders alma, ödeme ve iptal süreçleri.</p>
              </div>

              <div className="group bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5 hover:bg-white hover:scale-[1.01] hover:shadow-[#D4AF37]/10 transition-all duration-300 cursor-pointer">
                <div className="w-14 h-14 bg-[#0F172A] rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#D4AF37] transition-colors">
                  <Presentation className="w-7 h-7 text-[#D4AF37] group-hover:text-[#0F172A] transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-2">Öğretmen Rehberi</h3>
                <p className="text-slate-600">Profil oluşturma, ders verme ve ödeme alma.</p>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
