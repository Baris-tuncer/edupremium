import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Star, CreditCard, CheckCircle } from 'lucide-react'

export default function FiyatlandirmaPage() {
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
                <CreditCard className="w-3 h-3 text-[#D4AF37]" /> Fiyatlandırma
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Fiyatlandırma</h1>
              <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
                Şeffaf ve esnek fiyatlandırma modeli
              </p>
            </div>

            {/* İçerik */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F172A]/5">
              <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">Öğretmene Göre Değişken Fiyatlar</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Ders ücretleri her öğretmenin deneyimi, uzmanlık alanı ve tercihlerine göre farklılık göstermektedir.
                Her öğretmenin profil sayfasında ders ücreti açıkça belirtilmektedir.
              </p>

              <div className="border-t border-slate-200 pt-8 mt-8">
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-6">Neden Değişken Fiyat?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <p className="text-slate-600">Her öğretmenin deneyim seviyesi farklıdır</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <p className="text-slate-600">Uzmanlık alanları ve sertifikalar fiyatı etkiler</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <p className="text-slate-600">Öğrenciler bütçelerine uygun öğretmen seçebilir</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <p className="text-slate-600">Kaliteli eğitim her bütçeye uygun seçeneklerle sunulur</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-8 mt-8">
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-4">Ödeme Yöntemleri</h3>
                <p className="text-slate-600">Kredi kartı ve banka havalesi ile güvenli ödeme yapabilirsiniz.</p>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
