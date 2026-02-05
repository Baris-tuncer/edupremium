import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Star, HelpCircle } from 'lucide-react'

export default function FAQPage() {
  const sorular = [
    { soru: 'Nasıl kayıt olabilirim?', cevap: 'Ana sayfadaki Kayıt Ol butonuna tıklayarak ücretsiz hesap oluşturabilirsiniz.' },
    { soru: 'Ödeme yöntemleri nelerdir?', cevap: 'Kredi kartı ve banka havalesi ile ödeme yapabilirsiniz.' },
    { soru: 'Dersi iptal edebilir miyim?', cevap: 'Ders başlangıcına 24 saat kala ücretsiz iptal edebilirsiniz.' },
    { soru: 'Öğretmenler nasıl seçiliyor?', cevap: 'Tüm öğretmenlerimiz titiz bir mülakat ve değerlendirme sürecinden geçmektedir.' },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen relative bg-[#FDFBF7] overflow-hidden">

        {/* --- ARKA PLAN --- */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')`
            }}
          ></div>
          <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
        </div>

        <div className="relative z-10 pt-28 pb-20 px-4">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest mb-6 bg-white/40 backdrop-blur-md shadow-sm">
                <HelpCircle className="w-3 h-3 text-[#D4AF37]" /> SSS
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Sıkça Sorulan Sorular</h1>
              <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
                Merak ettikleriniz
              </p>
            </div>

            {/* Sorular */}
            <div className="space-y-4">
              {sorular.map((item, i) => (
                <details key={i} className="group bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-[#0F172A]/5 overflow-hidden">
                  <summary className="font-bold text-lg cursor-pointer list-none flex justify-between items-center p-6 md:p-8 hover:text-[#D4AF37] transition-colors text-[#0F172A] font-serif">
                    {item.soru}
                    <span className="text-[#D4AF37] group-open:rotate-45 transition-transform text-2xl flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
                    <p className="text-slate-600 leading-relaxed">{item.cevap}</p>
                  </div>
                </details>
              ))}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
