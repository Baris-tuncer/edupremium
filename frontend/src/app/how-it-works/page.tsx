'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Star, UserPlus, Search, CalendarCheck, Video } from 'lucide-react'

export default function NasilCalisirPage() {
  const adimlar = [
    {
      icon: UserPlus,
      baslik: '1. Kayıt Olun',
      aciklama: 'Ücretsiz hesap oluşturun ve profilinizi tamamlayın.'
    },
    {
      icon: Search,
      baslik: '2. Öğretmen Seçin',
      aciklama: 'İhtiyacınıza uygun öğretmeni inceleyin ve seçin.'
    },
    {
      icon: CalendarCheck,
      baslik: '3. Randevu Alın',
      aciklama: 'Uygun saat ve tarihi belirleyip randevunuzu oluşturun.'
    },
    {
      icon: Video,
      baslik: '4. Derse Başlayın',
      aciklama: 'MS Teams üzerinden online dersinize katılın.'
    },
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
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest mb-6 bg-white/40 backdrop-blur-md shadow-sm">
                <Star className="w-3 h-3 text-[#D4AF37] fill-current" /> Kolay Adımlar
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Nasıl Çalışır?</h1>
              <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
                4 kolay adımda özel ders almaya başlayın.
              </p>
            </div>

            {/* Adımlar */}
            <div className="space-y-6">
              {adimlar.map((adim, index) => {
                const Icon = adim.icon
                return (
                  <div
                    key={adim.baslik}
                    className="group bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl shadow-[#0F172A]/5 flex items-center gap-6 hover:bg-white hover:scale-[1.01] hover:shadow-[#D4AF37]/10 transition-all duration-300"
                  >
                    <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37] transition-colors">
                      <Icon className="w-7 h-7 text-[#D4AF37] group-hover:text-[#0F172A] transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-1">{adim.baslik}</h3>
                      <p className="text-slate-500">{adim.aciklama}</p>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
