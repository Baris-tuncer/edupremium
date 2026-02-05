import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Star, Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function IletisimPage() {
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
                <Star className="w-3 h-3 text-[#D4AF37] fill-current" /> İletişim
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Bize Ulaşın</h1>
              <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
                Sorularınız ve önerileriniz için bizimle iletişime geçebilirsiniz.
              </p>
            </div>

            {/* Kartlar */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* İletişim Bilgileri */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5">
                <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-6">İletişim Bilgileri</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">E-Posta</p>
                      <a href="mailto:info@visserr.com" className="text-slate-600 hover:text-[#D4AF37] transition-colors">info@visserr.com</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">Telefon</p>
                      <a href="tel:+905332951303" className="text-slate-600 hover:text-[#D4AF37] transition-colors">+90 533 295 13 03</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">Adres</p>
                      <p className="text-slate-600">İstanbul, Türkiye</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Çalışma Saatleri */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5">
                <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-6">Çalışma Saatleri</h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">Hafta İçi</p>
                      <p className="text-slate-600">Pazartesi - Cuma: 09:00 - 18:00</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">Cumartesi</p>
                      <p className="text-slate-600">10:00 - 14:00</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">Pazar</p>
                      <p className="text-slate-400">Kapalı</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-[#FDFBF7] rounded-xl border border-[#D4AF37]/20">
                  <p className="text-xs text-slate-500 text-center">
                    Acil durumlar için e-posta yoluyla 7/24 ulaşabilirsiniz.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
