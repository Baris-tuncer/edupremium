export default function DerslerPage() {
  const kategoriler = [
    {
      seviye: "Ilkokul",
      dersler: ["Matematik", "Turkce", "Fen Bilimleri", "Ingilizce", "Sosyal Bilgiler"]
    },
    {
      seviye: "Ortaokul", 
      dersler: ["Matematik", "Turkce", "Fen Bilimleri", "Ingilizce", "Sosyal Bilgiler"]
    },
    {
      seviye: "Lise",
      dersler: ["Matematik", "Fizik", "Kimya", "Biyoloji", "Turkce", "Tarih", "Cografya", "Felsefe"]
    },
    {
      seviye: "Yabanci Diller",
      dersler: ["Ingilizce", "Almanca", "Rusca", "Ispanyolca", "Fransizca"]
    }
  ];
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-navy-900 mb-4">Dersler</h1>
        <p className="text-slate-600 mb-12">Tum branslarda uzman ogretmenlerimizle birebir ders alin.</p>
        <div className="space-y-12">
          {kategoriler.map((kategori) => (
            <div key={kategori.seviye}>
              <h2 className="font-display text-2xl text-navy-900 mb-6">{kategori.seviye}</h2>
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                {kategori.dersler.map((ders) => (
                  <div key={ders} className="bg-white p-4 rounded-xl shadow-card hover:shadow-elevated transition-shadow text-center">
                    <span className="font-medium text-navy-800">{ders}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
