import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Star, Target, Eye, Shield, GraduationCap, Users, Award } from 'lucide-react'

export default function HakkimizdaPage() {
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
                <Star className="w-3 h-3 text-[#D4AF37] fill-current" /> EduPremium
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Hakkımızda</h1>
              <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto">
                Türkiye&apos;nin en seçkin özel ders platformu
              </p>
            </div>

            {/* Ana İçerik Kartı */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F172A]/5 mb-8">
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                EduPremium, 2024 yılında Türkiye&apos;nin en seçkin özel ders platformu olma vizyonuyla kurulmuştur.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                Misyonumuz, öğrencileri alanında uzman öğretmenlerle buluşturarak akademik başarılarını en üst seviyeye taşımaktır.
              </p>
            </div>

            {/* Vizyon & Misyon */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">

              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-[#0F172A]/5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif">Vizyonumuz</h2>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Türkiye&apos;nin her yerinden öğrencilerin kaliteli eğitime erişebilmesini sağlamak ve eğitimde fırsat eşitliğini dijital ortamda gerçekleştirmek.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-[#0F172A]/5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif">Misyonumuz</h2>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Öğrencileri alanında uzman, titizlikle seçilmiş öğretmenlerle buluşturarak bireysel öğrenme deneyimini en üst seviyeye taşımak.
                </p>
              </div>

            </div>

            {/* Değerlerimiz */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F172A]/5">
              <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-8 text-center">Değerlerimiz</h2>
              <div className="grid md:grid-cols-3 gap-6">

                <div className="text-center">
                  <div className="w-14 h-14 bg-[#FDFBF7] border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-7 h-7 text-[#D4AF37]" />
                  </div>
                  <h3 className="font-bold text-[#0F172A] mb-2">Kalite Odaklı Eğitim</h3>
                  <p className="text-slate-500 text-sm">Her öğretmenimiz davet usulü seçilir ve kalite standartlarımıza uygunluğu değerlendirilir.</p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-[#FDFBF7] border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-7 h-7 text-[#D4AF37]" />
                  </div>
                  <h3 className="font-bold text-[#0F172A] mb-2">Öğrenci Memnuniyeti</h3>
                  <p className="text-slate-500 text-sm">Öğrencilerimizin akademik gelişimi ve memnuniyeti her zaman önceliğimizdir.</p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-[#FDFBF7] border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-7 h-7 text-[#D4AF37]" />
                  </div>
                  <h3 className="font-bold text-[#0F172A] mb-2">Şeffaflık ve Güven</h3>
                  <p className="text-slate-500 text-sm">Şeffaf fiyatlandırma, güvenli ödeme ve açık iletişim ile güven inşa ederiz.</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
