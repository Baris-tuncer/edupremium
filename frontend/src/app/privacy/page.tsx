'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';

export default function GizlilikPolitikasiPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Gizlilik Politikası"
        subtitle="KVKK Aydınlatma Metni ve Gizlilik Politikası"
      />
      <main className="bg-slate-50 pb-16">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-slate-500 mb-8">Son güncelleme: 23 Ocak 2026</p>
          
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 prose prose-slate max-w-none">
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Veri Sorumlusu</h2>
              <p className="text-slate-600 mb-4">
                6698 sayili Kisisel Verilerin Korunmasi Kanunu ("KVKK") kapsaminda, kisisel verileriniz; 
                veri sorumlusu olarak EduPremium ("Sirket") tarafindan asagida aciklanan amaclar 
                dogrultusunda ve kanuna uygun sekilde islenebilecektir.
              </p>
              <ul className="list-none text-slate-600 space-y-2">
                <li><strong>Sirket Unvani:</strong> [Sirket Unvani]</li>
                <li><strong>Adres:</strong> [Sirket Adresi]</li>
                <li><strong>E-posta:</strong> kvkk@edupremium.com</li>
                <li><strong>Telefon:</strong> [Telefon Numarasi]</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Toplanan Kisisel Veriler</h2>
              <p className="text-slate-600 mb-4">
                Platformumuz uzerinden asagidaki kisisel veriler toplanmaktadir:
              </p>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-3">2.1 Kimlik Bilgileri</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
                <li>Ad, soyad</li>
                <li>T.C. kimlik numarasi (ogretmenler icin)</li>
                <li>Dogum tarihi</li>
                <li>Cinsiyet</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">2.2 Iletisim Bilgileri</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
                <li>E-posta adresi</li>
                <li>Telefon numarasi</li>
                <li>Adres bilgileri</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">2.3 Egitim ve Mesleki Bilgiler</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
                <li>Egitim durumu ve sinif seviyesi (ogrenciler icin)</li>
                <li>Universite ve bolum bilgileri (ogretmenler icin)</li>
                <li>Mesleki deneyim ve sertifikalar</li>
                <li>Uzmanlik alanlari</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">2.4 Finansal Bilgiler</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
                <li>IBAN bilgileri (ogretmenler icin)</li>
                <li>Odeme gecmisi</li>
                <li>Fatura bilgileri</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">2.5 Gorsel ve Isitsel Veriler</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
                <li>Profil fotograflari</li>
                <li>Tanitim videolari</li>
                <li>Ders kayitlari (izin verildigi takdirde)</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">2.6 Dijital Veriler</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-1">
                <li>IP adresi</li>
                <li>Cerez verileri</li>
                <li>Tarayici ve cihaz bilgileri</li>
                <li>Platform kullanim kayitlari</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Kisisel Verilerin Isleme Amaclari</h2>
              <p className="text-slate-600 mb-4">
                Kisisel verileriniz asagidaki amaclarla islenmektedir:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Uyelik ve hesap islemlerinin yurutulmesi</li>
                <li>Ogretmen-ogrenci eslestirme hizmetinin sunulmasi</li>
                <li>Ders planlamasi ve yonetimi</li>
                <li>Odeme islemlerinin gerceklestirilmesi</li>
                <li>Musteri hizmetleri ve destek saglanmasi</li>
                <li>Platform guvenliginin saglanmasi</li>
                <li>Yasal yukumluluklerin yerine getirilmesi</li>
                <li>Hizmet kalitesinin artirilmasi</li>
                <li>Istatistiksel analizler yapilmasi</li>
                <li>Pazarlama ve kampanya bildirimleri (izin verildiginde)</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Kisisel Verilerin Isleme Hukuki Sebepleri</h2>
              <p className="text-slate-600 mb-4">
                Kisisel verileriniz, KVKK'nin 5. ve 6. maddelerinde belirtilen asagidaki hukuki sebeplere dayali olarak islenmektedir:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Acik rizanizin bulunmasi</li>
                <li>Sozlesmenin kurulmasi veya ifasi icin gerekli olmasi</li>
                <li>Hukuki yukumluluklerimizin yerine getirilmesi</li>
                <li>Bir hakkin tesisi, kullanilmasi veya korunmasi icin zorunlu olmasi</li>
                <li>Temel hak ve ozgurluklerinize zarar vermemek kaydiyla, mesru menfaatlerimiz icin gerekli olmasi</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Kisisel Verilerin Aktarilmasi</h2>
              <p className="text-slate-600 mb-4">
                Kisisel verileriniz, yukarida belirtilen amaclar dogrultusunda asagidaki taraflara aktarilabilir:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Is ortaklari:</strong> Odeme hizmeti saglayicilari, bulut hizmet saglayicilari</li>
                <li><strong>Yasal makamlar:</strong> Mahkemeler, duzenlayici kurumlar (yasal zorunluluk halinde)</li>
                <li><strong>Diger kullanicilar:</strong> Profil bilgileriniz (ad, fotograf, brans) diger kullanicilara gorunur olabilir</li>
              </ul>
              <p className="text-slate-600 mt-4">
                Kisisel verileriniz, yurt disina aktarilmamaktadir. Yurt disina aktarim gerektiginde 
                acik rizaniz alinacak ve KVKK'nin 9. maddesine uygun hareket edilecektir.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Kisisel Verilerin Saklanma Suresi</h2>
              <p className="text-slate-600 mb-4">
                Kisisel verileriniz, ilgili mevzuatta ongörulen surelere uygun olarak saklanir:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Hesap bilgileri: Uyelik suresince ve uyelik sonlandiktan sonra 10 yil</li>
                <li>Islem kayitlari: 10 yil</li>
                <li>Finansal veriler: 10 yil</li>
                <li>Pazarlama izinleri: Izin geri cekilene kadar</li>
                <li>Ders kayitlari: 1 yil</li>
              </ul>
              <p className="text-slate-600 mt-4">
                Saklama suresi sona eren veriler, imha politikamiz cercevesinde guvenli bir sekilde silinir veya anonim hale getirilir.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Veri Guveniligi</h2>
              <p className="text-slate-600 mb-4">
                Kisisel verilerinizin guvenligini saglamak icin asagidaki onlemleri almaktayiz:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>SSL/TLS sifreleme teknolojisi</li>
                <li>Guvenlik duvarlari ve saldiri tespit sistemleri</li>
                <li>Duzeni guvenlik denetimleri</li>
                <li>Erisim yetkilendirme ve loglama</li>
                <li>Calisan egitimi ve gizlilik sozlesmeleri</li>
                <li>Fiziksel guvenlik onlemleri</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Ilgili Kisi Haklari (KVKK Madde 11)</h2>
              <p className="text-slate-600 mb-4">
                KVKK'nin 11. maddesi uyarinca asagidaki haklara sahipsiniz:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Kisisel verilerinizin islenip islenmedigini ogrenme</li>
                <li>Kisisel verileriniz islenmisse buna iliskin bilgi talep etme</li>
                <li>Kisisel verilerinizin islenme amacini ve bunlarin amacina uygun kullanilip kullanilmadigini ogrenme</li>
                <li>Yurt icinde veya yurt disinda kisisel verilerinizin aktarildigi ucuncu kisileri bilme</li>
                <li>Kisisel verilerinizin eksik veya yanlis islenmis olmasi halinde bunlarin duzeltilmesini isteme</li>
                <li>KVKK'nin 7. maddesinde ongörulen sartlar cercevesinde kisisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                <li>Duzeltme ve silme islemlerinin kisisel verilerinizin aktarildigi ucuncu kisilere bildirilmesini isteme</li>
                <li>Islenen verilerinizin munhasiran otomatik sistemler vasitasiyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya cikmasina itiraz etme</li>
                <li>Kisisel verilerinizin kanuna aykiri olarak islenmesi sebebiyle zarara ugramaniz halinde zararin giderilmesini talep etme</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Basvuru Yontemi</h2>
              <p className="text-slate-600 mb-4">
                Yukaridaki haklarinizi kullanmak icin asagidaki yontemlerle basvurabilirsiniz:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>E-posta:</strong> kvkk@edupremium.com (kayitli e-posta adresinizden)</li>
                <li><strong>Posta:</strong> [Sirket Adresi] adresine noter araciligiyla veya iadeli taahhutlu mektup ile</li>
                <li><strong>Online Form:</strong> Platform uzerindeki KVKK basvuru formu</li>
              </ul>
              <p className="text-slate-600 mt-4">
                Basvurular 30 gun icerisinde sonuclandirilir. Islemin ayrica bir maliyet gerektirmesi halinde, 
                Kisisel Verileri Koruma Kurulu tarafindan belirlenen ucret tarifesi uygulanacaktir.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Cerez Politikasi</h2>
              <p className="text-slate-600 mb-4">
                Platformumuz, kullanici deneyimini iyilestirmek icin cerezler kullanmaktadir:
              </p>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-3">10.1 Zorunlu Cerezler</h3>
              <p className="text-slate-600 mb-4">
                Platformun temel islevlerini saglamak icin gereklidir. Devre disi birakilamaz.
              </p>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">10.2 Performans Cerezleri</h3>
              <p className="text-slate-600 mb-4">
                Platform kullanimini analiz etmek icin kullanilir. Izninize tabidir.
              </p>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">10.3 Islevsellik Cerezleri</h3>
              <p className="text-slate-600 mb-4">
                Tercihlerinizi hatirlamak icin kullanilir. Izninize tabidir.
              </p>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">10.4 Pazarlama Cerezleri</h3>
              <p className="text-slate-600">
                Kisisellestirilmis reklamlar gostermek icin kullanilir. Izninize tabidir.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Degisiklikler</h2>
              <p className="text-slate-600">
                Bu aydinlatma metni gerektiginde guncellenebilir. Onemli degisiklikler Platform 
                uzerinden veya e-posta ile bildirilecektir. Guncellenmis metni duzeni olarak kontrol etmenizi oneririz.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Iletisim</h2>
              <p className="text-slate-600 mb-4">
                KVKK kapsamindaki haklariniz veya gizlilik politikamiz hakkinda sorulariniz icin:
              </p>
              <ul className="list-none text-slate-600 space-y-2">
                <li><strong>Veri Sorumlusu Temsilcisi:</strong> [Isim]</li>
                <li><strong>E-posta:</strong> kvkk@edupremium.com</li>
                <li><strong>Telefon:</strong> [Telefon Numarasi]</li>
                <li><strong>Adres:</strong> [Sirket Adresi]</li>
              </ul>
            </section>

            <section className="pt-6 border-t border-slate-200">
              <p className="text-slate-500 text-sm">
                Bu KVKK Aydinlatma Metni en son 23 Ocak 2026 tarihinde guncellenmistir.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
