import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Star } from 'lucide-react'

export default function KullanimSartlariPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen relative bg-[#FDFBF7]/80 backdrop-blur-xl overflow-hidden">

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
                <Star className="w-3 h-3 text-[#D4AF37] fill-current" /> Platform Kuralları
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Kullanım Şartları</h1>
              <p className="text-slate-500 text-sm">Son güncelleme: 23 Ocak 2026</p>
            </div>

            {/* İçerik Kartı */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F172A]/5">
              <div className="prose prose-slate max-w-none">

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">1. Genel Hükümler</h2>
                  <p className="text-slate-600 mb-4">
                    Bu Kullanım Şartları (&quot;Sözleşme&quot;), EduPremium platformunu (&quot;Platform&quot;) kullanan tüm kullanıcılar
                    (&quot;Kullanıcı&quot;, &quot;Öğrenci&quot;, &quot;Öğretmen&quot; veya &quot;Veli&quot;) ile Platform sahibi arasındaki hukuki ilişkiyi düzenler.
                  </p>
                  <p className="text-slate-600 mb-4">
                    Platformu kullanarak, kayıt olarak veya hizmetlerimizden yararlanarak bu Sözleşme&apos;nin tüm
                    hükümlerini okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan ve taahhüt etmiş olursunuz.
                  </p>
                  <p className="text-slate-600">
                    Bu Sözleşme&apos;yi kabul etmiyorsanız, Platformu kullanmayınız.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">2. Tanımlar</h2>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li><strong>Platform:</strong> EduPremium web sitesi, mobil uygulamalar ve ilgili tüm dijital hizmetler.</li>
                    <li><strong>Öğretmen:</strong> Platformda ders veren, davet usulü sisteme dahil edilmiş eğitimciler.</li>
                    <li><strong>Öğrenci:</strong> Platformdan ders alan kullanıcılar.</li>
                    <li><strong>Veli:</strong> Öğrenci adına işlem yapan yasal temsilciler.</li>
                    <li><strong>Ders:</strong> Öğretmen ve öğrenci arasında gerçekleşen online eğitim oturumu.</li>
                    <li><strong>Hesap:</strong> Kullanıcının Platforma erişim için oluşturduğu kişisel hesap.</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">3. Üyelik ve Hesap Güvenliği</h2>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">3.1 Kayıt Şartları</h3>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                    <li>Platformu kullanmak için 18 yaşından büyük olmanız veya yasal velinizin onayını almanız gerekmektedir.</li>
                    <li>Kayıt sırasında verdiğiniz bilgilerin doğru, güncel ve eksiksiz olması zorunludur.</li>
                    <li>Öğretmen olarak kayıt olmak için geçerli bir davet kodu gereklidir.</li>
                  </ul>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">3.2 Hesap Sorumluluğu</h3>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li>Hesabınızın güvenliğinden tamamen siz sorumlusunuz.</li>
                    <li>Şifrenizi üçüncü kişilerle paylaşmamanız gerekmektedir.</li>
                    <li>Hesabınızda gerçekleşen tüm işlemlerden siz sorumlu tutulacaksınız.</li>
                    <li>Yetkisiz erişim şüpheniz varsa derhal bizimle iletişime geçmelisiniz.</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">4. Hizmet Kullanım Kuralları</h2>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">4.1 Kabul Edilebilir Kullanım</h3>
                  <p className="text-slate-600 mb-4">Platform yalnızca eğitim amaçlı kullanılabilir. Aşağıdaki davranışlar kesinlikle yasaktır:</p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                    <li>Yanlış veya yanıltıcı bilgi vermek</li>
                    <li>Başka bir kişinin kimliğine bürünmek</li>
                    <li>Platform güvenliğini tehlikeye atacak işlemler yapmak</li>
                    <li>Platformu yasadışı amaçlarla kullanmak</li>
                    <li>Diğer kullanıcıları taciz etmek veya rahatsız etmek</li>
                    <li>Fikri mülkiyet haklarını ihlal etmek</li>
                    <li>Platform dışında ödeme talep etmek veya kabul etmek</li>
                  </ul>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">4.2 Öğretmen Yükümlülükleri</h3>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                    <li>Belirlenen ders saatlerine uymak</li>
                    <li>Profesyonel ve saygılı bir tutum sergilemek</li>
                    <li>Eğitim kalitesini korumak</li>
                    <li>Öğrenci gizliliğine saygı göstermek</li>
                    <li>Platform kurallarına uymak</li>
                  </ul>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">4.3 Öğrenci/Veli Yükümlülükleri</h3>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li>Derslere zamanında katılmak</li>
                    <li>Öğretmene saygılı davranmak</li>
                    <li>Ödemeleri zamanında yapmak</li>
                    <li>Uygun bir öğrenme ortamı sağlamak</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">5. Ödeme Koşulları</h2>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">5.1 Ücretlendirme</h3>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                    <li>Ders ücretleri öğretmen profillerinde belirtilmiştir.</li>
                    <li>Tüm fiyatlar Türk Lirası (TL) cinsindendir.</li>
                    <li>Platform, hizmet komisyonu alma hakkını saklı tutar.</li>
                    <li>Fiyat değişiklikleri önceden duyurulacaktır.</li>
                  </ul>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">5.2 Ödeme Yöntemleri</h3>
                  <p className="text-slate-600 mb-4">
                    Ödemeler kredi kartı, banka kartı veya havale/EFT yoluyla yapılabilir.
                    Tüm ödemeler güvenli ödeme altyapısı üzerinden gerçekleştirilir.
                  </p>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">5.3 Fatura</h3>
                  <p className="text-slate-600">
                    Her ödeme için elektronik fatura düzenlenir ve kayıtlı e-posta adresinize gönderilir.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">6. İptal ve İade Politikası</h2>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">6.1 Ders İptali</h3>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                    <li><strong>24 saatten fazla önce:</strong> Tam iade yapılır.</li>
                    <li><strong>12-24 saat önce:</strong> %50 iade yapılır.</li>
                    <li><strong>12 saatten az:</strong> İade yapılmaz.</li>
                    <li>Öğretmen kaynaklı iptallerde tam iade yapılır.</li>
                  </ul>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">6.2 İade Süreci</h3>
                  <p className="text-slate-600">
                    İadeler, iptal talebinin onaylanmasından itibaren 5-10 iş günü içerisinde
                    ödemenin yapıldığı yönteme iade edilir.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">7. Fikri Mülkiyet Hakları ve İçerik Koruma</h2>
                  <p className="text-slate-600 mb-4">
                    Platform üzerindeki tüm içerik, tasarım, logo, yazı, grafik, yazılım, kaynak kodu ve diğer materyaller
                    EduPremium&apos;un veya lisans verenlerinin mülkiyetindedir ve ulusal/uluslararası telif hakkı yasaları ile korunmaktadır.
                  </p>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">7.1 Yasaklanan Eylemler</h3>
                  <p className="text-slate-600 mb-4">Aşağıdaki eylemler kesinlikle yasaktır ve yasal işlem başlatılmasına neden olabilir:</p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                    <li>Platform içeriğini, tasarımını veya kaynak kodunu kısmen veya tamamen kopyalamak</li>
                    <li>Platformun benzerini veya klonunu oluşturmak</li>
                    <li>Otomatik araçlar (bot, scraper, crawler) ile içerik toplamak</li>
                    <li>Platform içeriğini başka sitelerde veya uygulamalarda kullanmak</li>
                    <li>Ders kayıtlarını izinsiz paylaşmak veya dağıtmak</li>
                    <li>Öğretmen profillerini, fotoğraflarını veya bilgilerini kopyalamak</li>
                    <li>Platform görsellerini başka sitelerde kullanmak (hotlinking dahil)</li>
                  </ul>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">7.2 DMCA ve Telif Hakkı İhlali Bildirimi</h3>
                  <p className="text-slate-600 mb-4">
                    EduPremium, Digital Millennium Copyright Act (DMCA) ve 5846 sayılı Fikir ve Sanat Eserleri Kanunu
                    kapsamında haklarını koruma hakkını saklı tutar. İçeriğimizin izinsiz kullanıldığını tespit ettiğimizde:
                  </p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                    <li>İhlal eden siteye resmi uyarı göndereceğiz</li>
                    <li>Hosting sağlayıcısına DMCA takedown bildirimi yapacağız</li>
                    <li>Arama motorlarına içerik kaldırma talebi göndereceğiz</li>
                    <li>Gerekli görüldüğünde yasal işlem başlatacağız</li>
                  </ul>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">7.3 Öğretmen ve Öğrenci İçerikleri</h3>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li>Öğretmenlerin oluşturduğu ders materyalleri kendilerine aittir ve Platform tarafından korunur.</li>
                    <li>Ders kayıtları öğretmenin açık yazılı izni olmadan paylaşılamaz.</li>
                    <li>Öğrencilerin ders sırasında aldığı notlar kişisel kullanım içindir, ticari amaçla kullanılamaz.</li>
                  </ul>

                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-800 text-sm font-medium">
                      <strong>Uyarı:</strong> Fikri mülkiyet haklarının ihlali, Türk Ceza Kanunu&apos;nun 71. maddesi ve
                      5846 sayılı Kanun kapsamında hapis cezası ve para cezası ile sonuçlanabilir.
                    </p>
                  </div>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">8. Sorumluluk Sınırlaması</h2>
                  <p className="text-slate-600 mb-4">
                    EduPremium, aşağıdaki durumlardan dolayı sorumluluk kabul etmez:
                  </p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li>Teknik arızalar veya kesintiler nedeniyle yaşanan aksaklıklar</li>
                    <li>Üçüncü taraf hizmetlerinden kaynaklanan sorunlar</li>
                    <li>Kullanıcı hataları veya ihmalleri</li>
                    <li>Öğretmen-öğrenci arasındaki anlaşmazlıklar</li>
                    <li>Dolaylı, özel veya cezai zararlar</li>
                  </ul>
                  <p className="text-slate-600 mt-4">
                    Platformun toplam sorumluluğu, kullanıcının son 12 ayda ödediği tutarı aşmayacaktır.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">9. Hesap Askıya Alma ve Fesih</h2>
                  <p className="text-slate-600 mb-4">
                    EduPremium, aşağıdaki durumlarda hesabınızı askıya alma veya feshetme hakkını saklı tutar:
                  </p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li>Bu Sözleşme&apos;nin ihlali</li>
                    <li>Yasadışı veya uygunsuz davranışlar</li>
                    <li>Diğer kullanıcılara zarar veren eylemler</li>
                    <li>Dolandırıcılık veya suistimal</li>
                    <li>Uzun süreli hesap hareketsizliği</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">10. Değişiklikler</h2>
                  <p className="text-slate-600">
                    EduPremium, bu Sözleşme&apos;yi herhangi bir zamanda değiştirme hakkını saklı tutar.
                    Önemli değişiklikler e-posta veya Platform üzerinden bildirilecektir.
                    Değişikliklerden sonra Platformu kullanmaya devam etmeniz,
                    yeni koşulları kabul ettiğiniz anlamına gelir.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">11. Uyuşmazlıkların Çözümü</h2>
                  <p className="text-slate-600 mb-4">
                    Bu Sözleşme&apos;den doğan uyuşmazlıklarda Türk hukuku uygulanacaktır.
                  </p>
                  <p className="text-slate-600">
                    Uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">12. İletişim</h2>
                  <p className="text-slate-600 mb-4">
                    Bu Sözleşme hakkında sorularınız için bizimle iletişime geçebilirsiniz:
                  </p>
                  <ul className="list-none text-slate-600 space-y-2">
                    <li><strong>E-posta:</strong> info@visserr.com</li>
                    <li><strong>Adres:</strong> Altunizade - Istanbul</li>
                  </ul>
                </section>

                <section className="pt-6 border-t border-slate-200">
                  <p className="text-slate-400 text-sm">
                    Bu Kullanım Şartları en son 23 Ocak 2026 tarihinde güncellenmiştir.
                  </p>
                </section>

              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
