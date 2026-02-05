import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ShieldCheck, Star } from 'lucide-react'

export default function KvkkPage() {
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
                <Star className="w-3 h-3 text-[#D4AF37] fill-current" /> Yasal Bilgilendirme
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">KVKK Aydınlatma Metni</h1>
              <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto">
                Kişisel verilerinizin güvenliği ve gizliliği bizim için esastır.
              </p>
            </div>

            {/* İçerik Kartı */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F172A]/5">
              <div className="prose prose-slate prose-lg max-w-none">

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">1. Veri Sorumlusu</h2>
                  <p className="text-slate-600">
                    6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, EduPremium olarak, veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlar kapsamında işlemekteyiz.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">2. Kişisel Verilerin İşlenme Amacı</h2>
                  <p className="text-slate-600">
                    Toplanan kişisel verileriniz; hizmetlerimizden faydalanmanız, üyelik işlemlerinin gerçekleştirilmesi, eğitim süreçlerinin yönetilmesi ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">3. İşlenen Kişisel Veriler</h2>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li>Kimlik Bilgileri (Ad, Soyad)</li>
                    <li>İletişim Bilgileri (E-posta, Telefon, Adres)</li>
                    <li>İşlem Güvenliği Bilgileri (IP adresi, Log kayıtları)</li>
                    <li>Müşteri İşlem Bilgileri (Ders talepleri, Ödeme bilgileri)</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">4. Kişisel Verilerin Aktarılması</h2>
                  <p className="text-slate-600">
                    Kişisel verileriniz, yasal zorunluluklar ve hizmet gereksinimleri çerçevesinde; iş ortaklarımıza, hizmet sağlayıcılarımıza ve yetkili kamu kurum ve kuruluşlarına aktarılabilmektedir.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">5. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
                  <p className="text-slate-600">
                    Kişisel verileriniz; web sitemiz, mobil uygulamamız ve çağrı merkezimiz aracılığıyla elektronik ortamda toplanmaktadır. Bu veriler, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen hukuki sebeplere dayanılarak işlenmektedir.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">6. Haklarınız</h2>
                  <p className="text-slate-600 mb-4">
                    KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
                  </p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                    <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                    <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                    <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                    <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                    <li>KVKK&apos;nın 7. maddesi kapsamında kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                    <li>İşlenen verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                  </ul>
                </section>

                <div className="bg-[#FDFBF7] p-6 rounded-xl border border-[#D4AF37]/20">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                    <p className="text-sm text-[#0F172A] font-bold uppercase tracking-wider">İletişim</p>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Haklarınızla ilgili taleplerinizi <a href="mailto:kvkk@edupremium.com" className="text-[#D4AF37] font-bold hover:underline">kvkk@edupremium.com</a> adresine iletebilirsiniz.
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
