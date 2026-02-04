'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';

export default function KullanimSartlariPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Kullanım Şartları"
        subtitle="Platform kullanım koşulları ve sözleşme hükümleri"
      />
      <main className="bg-slate-50 pb-16">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-slate-500 mb-8">Son güncelleme: 23 Ocak 2026</p>
          
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 prose prose-slate max-w-none">
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Genel Hukumler</h2>
              <p className="text-slate-600 mb-4">
                Bu Kullanim Sartlari ("Sozlesme"), EduPremium platformunu ("Platform") kullanan tum kullanicilar 
                ("Kullanici", "Ogrenci", "Ogretmen" veya "Veli") ile Platform sahibi arasindaki hukuki iliskiyi duzenler.
              </p>
              <p className="text-slate-600 mb-4">
                Platformu kullanarak, kayit olarak veya hizmetlerimizden yararlanarak bu Sozlesme'nin tum 
                hukumlerini okudugunuzu, anladiginizi ve kabul ettiginizi beyan ve taahhut etmis olursunuz.
              </p>
              <p className="text-slate-600">
                Bu Sozlesme'yi kabul etmiyorsaniz, Platformu kullanmayiniz.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Tanimlar</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Platform:</strong> EduPremium web sitesi, mobil uygulamalar ve ilgili tum dijital hizmetler.</li>
                <li><strong>Ogretmen:</strong> Platformda ders veren, davet usulu sisteme dahil edilmis egitimciler.</li>
                <li><strong>Ogrenci:</strong> Platformdan ders alan kullanicilar.</li>
                <li><strong>Veli:</strong> Ogrenci adina islem yapan yasal temsilciler.</li>
                <li><strong>Ders:</strong> Ogretmen ve ogrenci arasinda gerceklesen online egitim oturumu.</li>
                <li><strong>Hesap:</strong> Kullanicinin Platforma erisim icin olusturdugu kisisel hesap.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Uyelik ve Hesap Guveniligi</h2>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">3.1 Kayit Sartlari</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Platformu kullanmak icin 18 yasindan buyuk olmaniz veya yasal velinizin onayini almaniz gerekmektedir.</li>
                <li>Kayit sirasinda verdiginiz bilgilerin dogru, guncel ve eksiksiz olmasi zorunludur.</li>
                <li>Ogretmen olarak kayit olmak icin gecerli bir davet kodu gereklidir.</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-3">3.2 Hesap Sorumlulugu</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Hesabinizin guvenliginden tamamen siz sorumlusunuz.</li>
                <li>Sifrenizi ucuncu kisilerle paylasmamaniz gerekmektedir.</li>
                <li>Hesabinizda gerceklesen tum islemlerden siz sorumlu tutulacaksiniz.</li>
                <li>Yetkisiz erisim supheniz varsa derhal bizimle iletisime gecmelisiniz.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Hizmet Kullanim Kurallari</h2>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">4.1 Kabul Edilebilir Kullanim</h3>
              <p className="text-slate-600 mb-4">Platform yalnizca egitim amacli kullanilabilir. Asagidaki davranislar kesinlikle yasaktir:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Yanlis veya yaniltici bilgi vermek</li>
                <li>Baska bir kisinin kimligine burunmek</li>
                <li>Platform guvenligini tehlikeye atacak islemler yapmak</li>
                <li>Platformu yasadisi amaclarla kullanmak</li>
                <li>Diger kullanicilari taciz etmek veya rahatsiz etmek</li>
                <li>Fikri mulkiyet haklarini ihlal etmek</li>
                <li>Platform disinda odeme talep etmek veya kabul etmek</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">4.2 Ogretmen Yukumlulukleri</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Belirlenen ders saatlerine uymak</li>
                <li>Profesyonel ve saygiIi bir tutum sergilemek</li>
                <li>Egitim kalitesini korumak</li>
                <li>Ogrenci gizliligine saygı gostermek</li>
                <li>Platform kurallarına uymak</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">4.3 Ogrenci/Veli Yukumlulukleri</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Derslere zamaninda katilmak</li>
                <li>Ogretmene saygiIi davranmak</li>
                <li>Odemeleri zamaninda yapmak</li>
                <li>Uygun bir ogrenme ortami saglamak</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Odeme Kosullari</h2>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">5.1 Ucretlendirme</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Ders ucretleri ogretmen profillerinde belirtilmistir.</li>
                <li>Tum fiyatlar Turk Lirasi (TL) cinsindendir.</li>
                <li>Platform, hizmet komisyonu alma hakkini sakli tutar.</li>
                <li>Fiyat degisiklikleri onceden duyurulacaktir.</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">5.2 Odeme Yontemleri</h3>
              <p className="text-slate-600 mb-4">
                Odemeler kredi karti, banka karti veya havale/EFT yoluyla yapilabilir. 
                Tum odemeler guvenli odeme altyapisi uzerinden gerceklestirilir.
              </p>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">5.3 Fatura</h3>
              <p className="text-slate-600">
                Her odeme icin elektronik fatura duzenlenir ve kayitli e-posta adresinize gonderilir.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Iptal ve Iade Politikasi</h2>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">6.1 Ders Iptali</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li><strong>24 saatten fazla once:</strong> Tam iade yapilir.</li>
                <li><strong>12-24 saat once:</strong> %50 iade yapilir.</li>
                <li><strong>12 saatten az:</strong> Iade yapilmaz.</li>
                <li>Ogretmen kaynakli iptallerde tam iade yapilir.</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">6.2 Iade Sureci</h3>
              <p className="text-slate-600">
                Iadeler, iptal talebinin onaylanmasindan itibaren 5-10 is gunu icerisinde 
                odemenin yapildigi yonteme iade edilir.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Fikri Mulkiyet Haklari</h2>
              <p className="text-slate-600 mb-4">
                Platform uzerindeki tum icerik, tasarim, logo, yazi, grafik, yazilim ve diger materyaller 
                EduPremium'un veya lisans verenlerinin mulkiyetindedir ve telif hakki ile korunmaktadir.
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Platform icerigini kopyalayamazsiniz, dagitamazsiniz veya ticari amacla kullanamazsiniz.</li>
                <li>Ders kayitlari ogretmenin izni olmadan paylasilamaz.</li>
                <li>Ogretmenlerin olusturdugu materyaller kendilerine aittir.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Sorumluluk Sinirlamasi</h2>
              <p className="text-slate-600 mb-4">
                EduPremium, asagidaki durumlardan dolayi sorumluluk kabul etmez:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Teknik arizalar veya kesintiler nedeniyle yasanan aksakliklar</li>
                <li>Ucuncu taraf hizmetlerinden kaynaklanan sorunlar</li>
                <li>Kullanici hatalari veya ihmalleri</li>
                <li>Ogretmen-ogrenci arasindaki anlasmazliklar</li>
                <li>Dolayli, ozel veya cezai zararlar</li>
              </ul>
              <p className="text-slate-600 mt-4">
                Platformun toplam sorumlulugu, kullanicinin son 12 ayda odedigi tutari asmayacaktir.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Hesap Askiya Alma ve Fesih</h2>
              <p className="text-slate-600 mb-4">
                EduPremium, asagidaki durumlarda hesabinizi askiya alma veya feshetme hakkini sakli tutar:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Bu Sozlesme'nin ihlali</li>
                <li>Yasadisi veya uygunsuz davranislar</li>
                <li>Diger kullanicilara zarar veren eylemler</li>
                <li>Dolandiricilik veya suistimal</li>
                <li>Uzun sureli hesap hareketsizligi</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Degisiklikler</h2>
              <p className="text-slate-600">
                EduPremium, bu Sozlesme'yi herhangi bir zamanda degistirme hakkini sakli tutar. 
                Onemli degisiklikler e-posta veya Platform uzerinden bildirilecektir. 
                Degisikliklerden sonra Platformu kullanmaya devam etmeniz, 
                yeni kosullari kabul ettiginiz anlamina gelir.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Uyusmazliklarin Cozumu</h2>
              <p className="text-slate-600 mb-4">
                Bu Sozlesme'den dogan uyusmazliklarda Turk hukuku uygulanacaktir.
              </p>
              <p className="text-slate-600">
                Uyusmazliklarin cozumunde Istanbul Mahkemeleri ve Icra Daireleri yetkilidir.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Iletisim</h2>
              <p className="text-slate-600 mb-4">
                Bu Sozlesme hakkinda sorulariniz icin bizimle iletisime gecebilirsiniz:
              </p>
              <ul className="list-none text-slate-600 space-y-2">
                <li><strong>E-posta:</strong> legal@edupremium.com</li>
                <li><strong>Adres:</strong> [Sirket Adresi]</li>
                <li><strong>Telefon:</strong> [Telefon Numarasi]</li>
              </ul>
            </section>

            <section className="pt-6 border-t border-slate-200">
              <p className="text-slate-500 text-sm">
                Bu Kullanim Sartlari en son 23 Ocak 2026 tarihinde guncellenmistir.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
