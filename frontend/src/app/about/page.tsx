'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-4xl font-bold text-navy-900 mb-8">Hakkımızda</h1>
            
            <div className="card p-8 mb-8">
              <h2 className="font-display text-2xl font-semibold text-navy-900 mb-4">Misyonumuz</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                EduPremium olarak, her öğrencinin kendi potansiyelini keşfetmesine ve akademik hedeflerine ulaşmasına yardımcı olmak için kurulduk. Türkiye&apos;nin en seçkin öğretmenlerini öğrencilerle buluşturarak, kaliteli eğitimi herkes için erişilebilir kılıyoruz.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Birebir özel ders formatında, öğrencilerin bireysel ihtiyaçlarına göre özelleştirilmiş eğitim programları sunuyoruz. Her öğrenci benzersizdir ve öğrenme tarzları farklıdır - biz de tam olarak bu farklılıklara odaklanıyoruz.
              </p>
            </div>

            <div className="card p-8 mb-8">
              <h2 className="font-display text-2xl font-semibold text-navy-900 mb-4">Vizyonumuz</h2>
              <p className="text-slate-600 leading-relaxed">
                Türkiye&apos;nin en güvenilir ve kaliteli online özel ders platformu olmak. Teknoloji ve eğitimi birleştirerek, coğrafi sınırları ortadan kaldırıyor ve her öğrenciye alanında uzman öğretmenlerle çalışma fırsatı sunuyoruz.
              </p>
            </div>

            <div className="card p-8 mb-8">
              <h2 className="font-display text-2xl font-semibold text-navy-900 mb-4">Neden EduPremium?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">Seçkin Öğretmenler</h3>
                    <p className="text-slate-600 text-sm">Alanında uzman, deneyimli ve referans kontrolünden geçmiş öğretmenler</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">Esnek Zamanlama</h3>
                    <p className="text-slate-600 text-sm">Kendi programınıza uygun saatlerde ders alın</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">İlerleme Takibi</h3>
                    <p className="text-slate-600 text-sm">Düzenli raporlar ve değerlendirmelerle ilerlemenizi takip edin</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">Güvenli Ödeme</h3>
                    <p className="text-slate-600 text-sm">Güvenli ödeme altyapısı ve memnuniyet garantisi</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <h2 className="font-display text-2xl font-semibold text-navy-900 mb-4">Rakamlarla EduPremium</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="font-display text-3xl font-bold text-gold-500 mb-1">500+</div>
                  <div className="text-slate-600 text-sm">Uzman Öğretmen</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-gold-500 mb-1">10.000+</div>
                  <div className="text-slate-600 text-sm">Mutlu Öğrenci</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-gold-500 mb-1">50.000+</div>
                  <div className="text-slate-600 text-sm">Tamamlanan Ders</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-gold-500 mb-1">4.9/5</div>
                  <div className="text-slate-600 text-sm">Memnuniyet Puanı</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
