import PageHeader from '@/components/shared/PageHeader';
import { ContentSection } from '@/components/shared/ContentSection';

export default function GizlilikPolitikasiPage() {
  return (
    <main className="w-full">
      <PageHeader title="Gizlilik Politikası" subtitle="KVKK Aydınlatma Metni" />
      <ContentSection>
        <p className="text-slate-500 mb-8">Son güncelleme: 23 Ocak 2026</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Veri Sorumlusu</h2>
            <p className="text-slate-600 mb-4">
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, kişisel verileriniz;
              veri sorumlusu olarak EduPremium ("Şirket") tarafından aşağıda açıklanan amaçlar
              doğrultusunda ve kanuna uygun şekilde işlenebilecektir.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Toplanan Kişisel Veriler</h2>
            <p className="text-slate-600 mb-4">
              Platformumuz üzerinden aşağıdaki kişisel veriler toplanmaktadır:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Kimlik Bilgileri (Ad, soyad, T.C. kimlik numarası)</li>
              <li>İletişim Bilgileri (E-posta, telefon, adres)</li>
              <li>Eğitim ve Mesleki Bilgiler</li>
              <li>Finansal Bilgiler (IBAN, ödeme geçmişi)</li>
              <li>Görsel ve İşitsel Veriler (Profil fotoğrafları, ders kayıtları)</li>
              <li>Dijital Veriler (IP adresi, çerez verileri)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. İlgili Kişi Hakları</h2>
            <p className="text-slate-600 mb-4">
              KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerinizin düzeltilmesini veya silinmesini isteme</li>
            </ul>
          </section>

          <section className="pt-6 border-t border-slate-200">
            <p className="text-slate-500 text-sm">
              Detaylı KVKK Aydınlatma Metni için kvkk@edupremium.com adresine başvurabilirsiniz.
            </p>
          </section>
        </div>
      </ContentSection>
    </main>
  );
}
