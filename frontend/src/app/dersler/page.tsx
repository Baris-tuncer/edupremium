export default function DerslerPage() {
  const dersler = [
    { isim: "Matematik", seviye: "İlkokul - Üniversite" },
    { isim: "Fizik", seviye: "Lise - Üniversite" },
    { isim: "Kimya", seviye: "Lise - Üniversite" },
    { isim: "Biyoloji", seviye: "Lise - Üniversite" },
    { isim: "İngilizce", seviye: "Tüm Seviyeler" },
    { isim: "Türkçe", seviye: "İlkokul - Lise" },
  ];
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-navy-900 mb-4">Dersler</h1>
        <p className="text-slate-600 mb-12">Tüm branşlarda uzman öğretmenlerimizle birebir ders alın.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {dersler.map((ders) => (
            <div key={ders.isim} className="bg-white p-6 rounded-2xl shadow-card hover:shadow-elevated transition-shadow">
              <h3 className="font-semibold text-xl text-navy-900 mb-2">{ders.isim}</h3>
              <p className="text-slate-500">{ders.seviye}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
