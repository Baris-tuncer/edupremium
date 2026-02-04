'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';

export default function SSSPage() {
  const sorular = [
    { soru: "Nasıl kayıt olabilirim?", cevap: "Ana sayfadaki Kayıt Ol butonuna tıklayarak ücretsiz hesap oluşturabilirsiniz." },
    { soru: "Ödeme yöntemleri nelerdir?", cevap: "Kredi kartı ve banka havalesi ile ödeme yapabilirsiniz." },
    { soru: "Dersi iptal edebilir miyim?", cevap: "Ders başlangıcına 24 saat kala ücretsiz iptal edebilirsiniz." },
    { soru: "Öğretmenler nasıl seçiliyor?", cevap: "Tüm öğretmenlerimiz titiz bir mülakat ve değerlendirme sürecinden geçmektedir." },
  ];

  return (
    <>
      <Header />
      <PageHero
        title="Sıkça Sorulan Sorular"
        subtitle="Merak ettiğiniz tüm soruların cevapları"
      />
      <main className="bg-slate-50 pb-16">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="space-y-6">
            {sorular.map((item) => (
              <div key={item.soru} className="bg-white p-6 rounded-2xl shadow-card">
                <h3 className="font-semibold text-lg text-navy-900 mb-2">{item.soru}</h3>
                <p className="text-slate-600">{item.cevap}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
