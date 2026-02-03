export default function NasilCalisirPage() {
  const adimlar = [
    { baslik: "1. Kayıt Olun", aciklama: "Ücretsiz hesap oluşturun ve profilinizi tamamlayın." },
    { baslik: "2. Öğretmen Seçin", aciklama: "İhtiyacınıza uygun öğretmeni inceleyin ve seçin." },
    { baslik: "3. Randevu Alın", aciklama: "Uygun saat ve tarihi belirleyip randevunuzu oluşturun." },
    { baslik: "4. Derse Başlayın", aciklama: "MS Teams üzerinden online dersinize katılın." },
  ];
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-navy-900 mb-4">Nasıl Çalışır?</h1>
        <p className="text-slate-600 mb-12">4 kolay adımda özel ders almaya başlayın.</p>
        <div className="space-y-8">
          {adimlar.map((adim) => (
            <div key={adim.baslik} className="bg-white p-6 rounded-2xl shadow-card">
              <h3 className="font-semibold text-xl text-navy-900 mb-2">{adim.baslik}</h3>
              <p className="text-slate-600">{adim.aciklama}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
