import PageHeader from '@/components/shared/PageHeader';
import { ContentSection } from '@/components/shared/ContentSection';

export default function KullanimSartlariPage() {
  return (
    <main className="w-full">
      <PageHeader title="Kullanım Şartları" subtitle="Platform Kuralları" />
      <ContentSection>
        <p className="text-slate-500 mb-8">Son güncelleme: 23 Ocak 2026</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Genel Hükümler</h2>
            <p className="text-slate-600 mb-4">
              Bu Kullanım Şartları, EduPremium platformunu kullanan tüm kullanıcılar
              ile Platform sahibi arasındaki hukuki ilişkiyi düzenler.
            </p>
            <p className="text-slate-600">
              Platformu kullanarak bu Sözleşme'nin tüm hükümlerini okuduğunuzu,
              anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Hizmet Kullanım Kuralları</h2>
            <p className="text-slate-600 mb-4">Platform yalnızca eğitim amaçlı kullanılabilir. Aşağıdaki davranışlar yasaktır:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Yanlış veya yanıltıcı bilgi vermek</li>
              <li>Başka bir kişinin kimliğine bürünmek</li>
              <li>Platform güvenliğini tehlikeye atacak işlemler yapmak</li>
              <li>Diğer kullanıcıları taciz etmek</li>
              <li>Platform dışında ödeme talep etmek</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. İptal ve İade Politikası</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>24 saatten fazla önce:</strong> Tam iade yapılır.</li>
              <li><strong>12-24 saat önce:</strong> %50 iade yapılır.</li>
              <li><strong>12 saatten az:</strong> İade yapılmaz.</li>
              <li>Öğretmen kaynaklı iptallerde tam iade yapılır.</li>
            </ul>
          </section>

          <section className="pt-6 border-t border-slate-200">
            <p className="text-slate-500 text-sm">
              Detaylı kullanım şartları için legal@edupremium.com adresine başvurabilirsiniz.
            </p>
          </section>
        </div>
      </ContentSection>
    </main>
  );
}
