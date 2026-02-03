export default function FiyatlandirmaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-navy-900 mb-4">Fiyatlandirma</h1>
        <p className="text-slate-600 mb-12">Seffaf ve esnek fiyatlandirma modeli.</p>
        <div className="bg-white p-8 rounded-2xl shadow-card">
          <h2 className="font-semibold text-xl text-navy-900 mb-4">Ogretmene Gore Degisken Fiyatlar</h2>
          <p className="text-slate-700 mb-6">Ders ucretleri her ogretmenin deneyimi, uzmanlik alani ve tercihlerine gore farklilik gostermektedir. Her ogretmenin profil sayfasinda ders ucreti acikca belirtilmektedir.</p>
          <div className="border-t border-slate-200 pt-6 mt-6">
            <h3 className="font-semibold text-lg text-navy-900 mb-4">Neden Degisken Fiyat?</h3>
            <ul className="space-y-3 text-slate-600">
              <li>Her ogretmenin deneyim seviyesi farklidir</li>
              <li>Uzmanlik alanlari ve sertifikalar fiyati etkiler</li>
              <li>Ogrenciler butcelerine uygun ogretmen secebilir</li>
              <li>Kaliteli egitim her butceye uygun seceneklerle sunulur</li>
            </ul>
          </div>
          <div className="border-t border-slate-200 pt-6 mt-6">
            <h3 className="font-semibold text-lg text-navy-900 mb-4">Odeme Yontemleri</h3>
            <p className="text-slate-600">Kredi karti ve banka havalesi ile guvenli odeme yapabilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
