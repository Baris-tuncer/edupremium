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
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Hakkımızda</h1>
              <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto">
                Hikayemiz
              </p>
            </div>

            {/* Quote */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F172A]/5 mb-8 text-center">
              <p className="text-2xl font-serif text-[#0F172A] italic">
                &quot;Eğitim, bir kovayı doldurmak değil, bir ateşi yakmaktır.&quot;
              </p>
              <p className="text-slate-500 text-sm mt-4">— William Butler Yeats</p>
            </div>

            {/* Mission / Vision / Values */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-[#0F172A]/5 text-center">
                <div className="w-14 h-14 bg-[#FDFBF7]/80 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-2">Misyonumuz</h3>
                <p className="text-slate-500 text-sm">Kaliteli eğitimi herkes için erişilebilir kılmak.</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-[#0F172A]/5 text-center">
                <div className="w-14 h-14 bg-[#FDFBF7]/80 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-2">Vizyonumuz</h3>
                <p className="text-slate-500 text-sm">Türkiye'nin en güvenilir eğitim platformu olmak.</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-[#0F172A]/5 text-center">
                <div className="w-14 h-14 bg-[#FDFBF7]/80 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-2">Değerlerimiz</h3>
                <p className="text-slate-500 text-sm">Güven, Kalite, Şeffaflık.</p>
              </div>
            </div>

            {/* Who We Are */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F172A]/5">
              <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">Biz Kimiz?</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-4">
                EduPremium, Türkiye'nin en seçkin eğitmenlerini öğrencilerle buluşturan premium bir eğitim platformudur.
                Standartların ötesinde, kişiselleştirilmiş ve sonuç odaklı bir yaklaşım benimsiyoruz.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                Her öğrencinin benzersiz olduğuna inanıyor ve onların potansiyellerini en üst düzeye çıkarmak için
                alanında uzman eğitmenlerle birebir çalışma fırsatı sunuyoruz. Amacımız sadece ders vermek değil,
                öğrencilerimizin hayatlarında kalıcı bir fark yaratmaktır.
              </p>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
