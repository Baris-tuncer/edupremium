export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-navy-900 mb-8">Kullanim Sartlari</h1>
        <div className="bg-white p-8 rounded-2xl shadow-card prose prose-slate">
          <p className="mb-4">Son guncelleme: Ocak 2026</p>
          <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-4">Genel Kosullar</h2>
          <p className="text-slate-600 mb-4">EduPremium platformunu kullanarak bu sartlari kabul etmis sayilirsiniz.</p>
          <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-4">Hesap Sorumlulugu</h2>
          <p className="text-slate-600 mb-4">Hesabinizin guvenliginden siz sorumlusunuz. Sifrenizi kimseyle paylasmayiniz.</p>
          <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-4">Odeme ve Iptal</h2>
          <p className="text-slate-600 mb-4">Dersler icin odeme onceden alinir. Iptal politikamiz 24 saat onceden bildirim gerektirir.</p>
          <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-4">Iletisim</h2>
          <p className="text-slate-600">Sorulariniz icin: legal@edupremium.com</p>
        </div>
      </div>
    </div>
  );
}
