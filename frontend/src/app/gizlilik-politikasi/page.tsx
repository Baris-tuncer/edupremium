export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-navy-900 mb-8">Gizlilik Politikasi</h1>
        <div className="bg-white p-8 rounded-2xl shadow-card prose prose-slate">
          <p className="mb-4">Son guncelleme: Ocak 2026</p>
          <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-4">Toplanan Veriler</h2>
          <p className="text-slate-600 mb-4">Ad, soyad, e-posta adresi, telefon numarasi gibi kisisel bilgilerinizi sadece hizmet sunumu icin kullaniyoruz.</p>
          <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-4">Veri Guvenligi</h2>
          <p className="text-slate-600 mb-4">Tum verileriniz SSL sertifikasi ile korunmaktadir. Ucuncu taraflarla paylasilmamaktadir.</p>
          <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-4">Iletisim</h2>
          <p className="text-slate-600">Sorulariniz icin: privacy@edupremium.com</p>
        </div>
      </div>
    </div>
  );
}
