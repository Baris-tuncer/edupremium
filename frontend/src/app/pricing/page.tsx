'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';

export default function FiyatlandirmaPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Fiyatlandırma"
        subtitle="Şeffaf ve esnek fiyatlandırma modeli"
      />
      <main className="bg-slate-50 pb-16">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white p-8 rounded-2xl shadow-card">
            <h2 className="font-semibold text-xl text-navy-900 mb-4">Öğretmene Göre Değişken Fiyatlar</h2>
            <p className="text-slate-700 mb-6">
              Ders ücretleri her öğretmenin deneyimi, uzmanlık alanı ve tercihlerine göre farklılık göstermektedir.
              Her öğretmenin profil sayfasında ders ücreti açıkça belirtilmektedir.
            </p>
            <div className="border-t border-slate-200 pt-6 mt-6">
              <h3 className="font-semibold text-lg text-navy-900 mb-4">Neden Değişken Fiyat?</h3>
              <ul className="space-y-3 text-slate-600">
                <li>• Her öğretmenin deneyim seviyesi farklıdır</li>
                <li>• Uzmanlık alanları ve sertifikalar fiyatı etkiler</li>
                <li>• Öğrenciler bütçelerine uygun öğretmen seçebilir</li>
                <li>• Kaliteli eğitim her bütçeye uygun seçeneklerle sunulur</li>
              </ul>
            </div>
            <div className="border-t border-slate-200 pt-6 mt-6">
              <h3 className="font-semibold text-lg text-navy-900 mb-4">Ödeme Yöntemleri</h3>
              <p className="text-slate-600">Kredi kartı ve banka havalesi ile güvenli ödeme yapabilirsiniz.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
