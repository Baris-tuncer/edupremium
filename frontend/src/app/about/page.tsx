import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Star, Target, Users, Award } from 'lucide-react'

export default function AboutPage() {
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
                <Star className="w-3 h-3 text-[#D4AF37] fill-current" /> EduPremium
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">About Us</h1>
              <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto">
                Our Story
              </p>
            </div>

            {/* Quote */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F172A]/5 mb-8 text-center">
              <p className="text-2xl font-serif text-[#0F172A] italic">
                &quot;Education is not the filling of a pail, but the lighting of a fire.&quot;
              </p>
            </div>

            {/* Mission / Vision / Values */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-[#0F172A]/5 text-center">
                <div className="w-14 h-14 bg-[#FDFBF7]/80 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-2">Mission</h3>
                <p className="text-slate-500 text-sm">Accessible excellence.</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-[#0F172A]/5 text-center">
                <div className="w-14 h-14 bg-[#FDFBF7]/80 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-2">Vision</h3>
                <p className="text-slate-500 text-sm">Global education standards.</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-[#0F172A]/5 text-center">
                <div className="w-14 h-14 bg-[#FDFBF7]/80 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-2">Values</h3>
                <p className="text-slate-500 text-sm">Trust, Quality, Transparency.</p>
              </div>
            </div>

            {/* Who We Are */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F172A]/5">
              <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">Who We Are</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                EduPremium is a premium education platform that connects Turkey&apos;s most distinguished educators with students. Beyond standards, we adopt a personalized and results-oriented approach.
              </p>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
