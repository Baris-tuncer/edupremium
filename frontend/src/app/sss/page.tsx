export default function SSSPage() {
  const sorular = [
    { soru: "Nasil kayit olabilirim?", cevap: "Ana sayfadaki Kayit Ol butonuna tiklayarak ucretsiz hesap olusturabilirsiniz." },
    { soru: "Odeme yontemleri nelerdir?", cevap: "Kredi karti ve banka havalesi ile odeme yapabilirsiniz." },
    { soru: "Dersi iptal edebilir miyim?", cevap: "Ders baslangicina 24 saat kala ucretsiz iptal edebilirsiniz." },
    { soru: "Ogretmenler nasil seciliyor?", cevap: "Tum ogretmenlerimiz titiz bir mulakat ve degerlendirme surecinden gecmektedir." },
  ];
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-navy-900 mb-12">Sikca Sorulan Sorular</h1>
        <div className="space-y-6">
          {sorular.map((item) => (
            <div key={item.soru} className="bg-white p-6 rounded-2xl shadow-card">
              <h3 className="font-semibold text-lg text-navy-900 mb-2">{item.soru}</h3>
              <p className="text-slate-600">{item.cevap}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
