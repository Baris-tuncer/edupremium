import PageHeader from '@/components/shared/PageHeader';
import { ContentSection } from '@/components/shared/ContentSection';

export default function FAQPage() {
  const sorular = [
    { soru: "Nasıl kayıt olabilirim?", cevap: "Ana sayfadaki Kayıt Ol butonuna tıklayarak ücretsiz hesap oluşturabilirsiniz." },
    { soru: "Ödeme yöntemleri nelerdir?", cevap: "Kredi kartı ve banka havalesi ile ödeme yapabilirsiniz." },
    { soru: "Dersi iptal edebilir miyim?", cevap: "Ders başlangıcına 24 saat kala ücretsiz iptal edebilirsiniz." },
    { soru: "Öğretmenler nasıl seçiliyor?", cevap: "Tüm öğretmenlerimiz titiz bir mülakat ve değerlendirme sürecinden geçmektedir." },
  ];

  return (
    <main className="w-full">
      <PageHeader title="Sıkça Sorulan Sorular" subtitle="Merak Ettikleriniz" />
      <ContentSection>
        <div className="space-y-4">
           {sorular.map((item, i) => (
             <details key={i} className="group border-b border-slate-200 pb-4">
               <summary className="font-bold text-lg cursor-pointer list-none flex justify-between items-center py-4 hover:text-[#D4AF37] transition-colors">
                 {item.soru}
                 <span className="text-[#D4AF37] group-open:rotate-45 transition-transform">+</span>
               </summary>
               <p className="text-slate-600 pb-4 pl-4">{item.cevap}</p>
             </details>
           ))}
        </div>
      </ContentSection>
    </main>
  );
}
