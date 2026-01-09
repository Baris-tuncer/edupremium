export default function FiyatlandirmaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-navy-900 mb-4">Fiyatlandırma</h1>
        <p className="text-slate-600 mb-12">Şeffaf ve uygun fiyatlarla kaliteli eğitim.</p>
        <div className="bg-white p-8 rounded-2xl shadow-card">
          <p className="text-slate-700 mb-6">Ders ücretleri öğretmene göre değişmektedir. Her öğretmenin profil sayfasında ders ücreti belirtilmektedir.</p>
          <ul className="space-y-3 text-slate-600">
            <li>Ortalama ders ücreti: 200-500 TL/saat</li>
            <li>İlk ders için indirimli fiyatlar</li>
            <li>Paket derslerde özel indirimler</li>
            <li>Ödeme: Kredi kartı veya havale</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
