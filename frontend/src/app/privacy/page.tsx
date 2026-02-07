import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Star, ShieldCheck } from 'lucide-react'

export default function GizlilikPolitikasiPage() {
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
                <ShieldCheck className="w-3 h-3 text-[#D4AF37]" /> KVKK
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Gizlilik Politikası</h1>
              <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
                KVKK Aydınlatma Metni
              </p>
            </div>

            {/* İçerik */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F172A]/5">
              <p className="text-slate-500 mb-8">Son güncelleme: 23 Ocak 2026</p>

              <div className="prose prose-slate max-w-none">

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">1. Veri Sorumlusu</h2>
                  <p className="text-slate-600 mb-4">
                    6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında, kişisel verileriniz;
                    veri sorumlusu olarak EduPremium (&quot;Şirket&quot;) tarafından aşağıda açıklanan amaçlar
                    doğrultusunda ve kanuna uygun şekilde işlenebilecektir.
                  </p>
                  <ul className="list-none text-slate-600 space-y-2">
                    <li><strong>Şirket Ünvanı:</strong> Mac Elt Özel Eğitim Yayıncılık Dağ. Paz. ve Tic. Ltd. Şti.</li>
                    <li><strong>Adres:</strong> Altunizade - Istanbul</li>
                    <li><strong>E-posta:</strong> info@visserr.com</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">2. Toplanan Kişisel Veriler</h2>
                  <p className="text-slate-600 mb-4">
                    Platformumuz üzerinden aşağıdaki kişisel veriler toplanmaktadır:
                  </p>

                  <h3 className="text-lg font-semibold text-[#0F172A] mb-3">2.1 Kimlik Bilgileri</h3>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
                    <li>Ad, soyad</li>
                    <li>T.C. kimlik numarası (öğretmenler için)</li>
                    <li>Doğum tarihi</li>
                    <li>Cinsiyet</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-[#0F172A] mb-3">2.2 İletişim Bilgileri</h3>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
                    <li>E-posta adresi</li>
                    <li>Telefon numarası</li>
                    <li>Adres bilgileri</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-[#0F172A] mb-3">2.3 Eğitim ve Mesleki Bilgiler</h3>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
                    <li>Eğitim durumu ve sınıf seviyesi (öğrenciler için)</li>
                    <li>Üniversite ve bölüm bilgileri (öğretmenler için)</li>
                    <li>Mesleki deneyim ve sertifikalar</li>
                    <li>Uzmanlık alanları</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-[#0F172A] mb-3">2.4 Finansal Bilgiler</h3>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
                    <li>IBAN bilgileri (öğretmenler için)</li>
                    <li>Ödeme geçmişi</li>
                    <li>Fatura bilgileri</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-[#0F172A] mb-3">2.5 Görsel ve İşitsel Veriler</h3>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
                    <li>Profil fotoğrafları</li>
                    <li>Tanıtım videoları</li>
                    <li>Ders kayıtları (izin verildiği takdirde)</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-[#0F172A] mb-3">2.6 Dijital Veriler</h3>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1">
                    <li>IP adresi</li>
                    <li>Çerez verileri</li>
                    <li>Tarayıcı ve cihaz bilgileri</li>
                    <li>Platform kullanım kayıtları</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">3. Kişisel Verilerin İşleme Amaçları</h2>
                  <p className="text-slate-600 mb-4">
                    Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
                  </p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li>Üyelik ve hesap işlemlerinin yürütülmesi</li>
                    <li>Öğretmen-öğrenci eşleştirme hizmetinin sunulması</li>
                    <li>Ders planlaması ve yönetimi</li>
                    <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
                    <li>Müşteri hizmetleri ve destek sağlanması</li>
                    <li>Platform güvenliğinin sağlanması</li>
                    <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                    <li>Hizmet kalitesinin artırılması</li>
                    <li>İstatistiksel analizler yapılması</li>
                    <li>Pazarlama ve kampanya bildirimleri (izin verildiğinde)</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">4. Kişisel Verilerin İşleme Hukuki Sebepleri</h2>
                  <p className="text-slate-600 mb-4">
                    Kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayalı olarak işlenmektedir:
                  </p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li>Açık rızanızın bulunması</li>
                    <li>Sözleşmenin kurulması veya ifası için gerekli olması</li>
                    <li>Hukuki yükümlülüklerimizin yerine getirilmesi</li>
                    <li>Bir hakkın tesisi, kullanılması veya korunması için zorunlu olması</li>
                    <li>Temel hak ve özgürlüklerinize zarar vermemek kaydıyla, meşru menfaatlerimiz için gerekli olması</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">5. Kişisel Verilerin Aktarılması</h2>
                  <p className="text-slate-600 mb-4">
                    Kişisel verileriniz, yukarıda belirtilen amaçlar doğrultusunda aşağıdaki taraflara aktarılabilir:
                  </p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li><strong>İş ortakları:</strong> Ödeme hizmeti sağlayıcıları, bulut hizmet sağlayıcıları</li>
                    <li><strong>Yasal makamlar:</strong> Mahkemeler, düzenleyici kurumlar (yasal zorunluluk halinde)</li>
                    <li><strong>Diğer kullanıcılar:</strong> Profil bilgileriniz (ad, fotoğraf, branş) diğer kullanıcılara görünür olabilir</li>
                  </ul>
                  <p className="text-slate-600 mt-4">
                    Kişisel verileriniz, yurt dışına aktarılmamaktadır. Yurt dışına aktarım gerektiğinde
                    açık rızanız alınacak ve KVKK&apos;nın 9. maddesine uygun hareket edilecektir.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">6. Kişisel Verilerin Saklanma Süresi</h2>
                  <p className="text-slate-600 mb-4">
                    Kişisel verileriniz, ilgili mevzuatta öngörülen sürelere uygun olarak saklanır:
                  </p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li>Hesap bilgileri: Üyelik süresince ve üyelik sonlandıktan sonra 10 yıl</li>
                    <li>İşlem kayıtları: 10 yıl</li>
                    <li>Finansal veriler: 10 yıl</li>
                    <li>Pazarlama izinleri: İzin geri çekilene kadar</li>
                    <li>Ders kayıtları: 1 yıl</li>
                  </ul>
                  <p className="text-slate-600 mt-4">
                    Saklama süresi sona eren veriler, imha politikamız çerçevesinde güvenli bir şekilde silinir veya anonim hale getirilir.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">7. Veri Güvenliği</h2>
                  <p className="text-slate-600 mb-4">
                    Kişisel verilerinizin güvenliğini sağlamak için aşağıdaki önlemleri almaktayız:
                  </p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li>SSL/TLS şifreleme teknolojisi</li>
                    <li>Güvenlik duvarları ve saldırı tespit sistemleri</li>
                    <li>Düzenli güvenlik denetimleri</li>
                    <li>Erişim yetkilendirme ve loglama</li>
                    <li>Çalışan eğitimi ve gizlilik sözleşmeleri</li>
                    <li>Fiziksel güvenlik önlemleri</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">8. İlgili Kişi Hakları (KVKK Madde 11)</h2>
                  <p className="text-slate-600 mb-4">
                    KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
                  </p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                    <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                    <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                    <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                    <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
                    <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                    <li>Düzeltme ve silme işlemlerinin kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                    <li>İşlenen verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                    <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">9. Başvuru Yöntemi</h2>
                  <p className="text-slate-600 mb-4">
                    Yukarıdaki haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
                  </p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2">
                    <li><strong>E-posta:</strong> info@visserr.com (kayıtlı e-posta adresinizden)</li>
                    <li><strong>Posta:</strong> Altunizade - Istanbul adresine noter aracılığıyla veya iadeli taahhütlü mektup ile</li>
                    <li><strong>Online Form:</strong> Platform üzerindeki KVKK başvuru formu</li>
                  </ul>
                  <p className="text-slate-600 mt-4">
                    Başvurular 30 gün içerisinde sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi halinde,
                    Kişisel Verileri Koruma Kurulu tarafından belirlenen ücret tarifesi uygulanacaktır.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">10. Çerez Politikası</h2>
                  <p className="text-slate-600 mb-4">
                    Platformumuz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır:
                  </p>

                  <h3 className="text-lg font-semibold text-[#0F172A] mb-3">10.1 Zorunlu Çerezler</h3>
                  <p className="text-slate-600 mb-4">
                    Platformun temel işlevlerini sağlamak için gereklidir. Devre dışı bırakılamaz.
                  </p>

                  <h3 className="text-lg font-semibold text-[#0F172A] mb-3">10.2 Performans Çerezleri</h3>
                  <p className="text-slate-600 mb-4">
                    Platform kullanımını analiz etmek için kullanılır. İzninize tabidir.
                  </p>

                  <h3 className="text-lg font-semibold text-[#0F172A] mb-3">10.3 İşlevsellik Çerezleri</h3>
                  <p className="text-slate-600 mb-4">
                    Tercihlerinizi hatırlamak için kullanılır. İzninize tabidir.
                  </p>

                  <h3 className="text-lg font-semibold text-[#0F172A] mb-3">10.4 Pazarlama Çerezleri</h3>
                  <p className="text-slate-600">
                    Kişiselleştirilmiş reklamlar göstermek için kullanılır. İzninize tabidir.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">11. Değişiklikler</h2>
                  <p className="text-slate-600">
                    Bu aydınlatma metni gerektiğinde güncellenebilir. Önemli değişiklikler Platform
                    üzerinden veya e-posta ile bildirilecektir. Güncellenmiş metni düzenli olarak kontrol etmenizi öneririz.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-4">12. İletişim</h2>
                  <p className="text-slate-600 mb-4">
                    KVKK kapsamındaki haklarınız veya gizlilik politikamız hakkında sorularınız için:
                  </p>
                  <div className="bg-[#FDFBF7]/80 backdrop-blur-xl rounded-xl border border-[#D4AF37]/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                      <span className="font-bold text-[#0F172A]">İletişim Bilgileri</span>
                    </div>
                    <ul className="list-none text-slate-600 space-y-2">
                      <li><strong>Veri Sorumlusu:</strong> Mehmet Ali Kafasibuyuk</li>
                      <li><strong>E-posta:</strong> info@visserr.com</li>
                      <li><strong>Adres:</strong> Altunizade - Istanbul</li>
                    </ul>
                  </div>
                </section>

                <section className="pt-6 border-t border-slate-200">
                  <p className="text-slate-500 text-sm">
                    Bu KVKK Aydınlatma Metni en son 23 Ocak 2026 tarihinde güncellenmiştir.
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
