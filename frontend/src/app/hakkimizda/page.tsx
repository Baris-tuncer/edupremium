export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-navy-900 mb-8">Hakkımızda</h1>
        <div className="prose prose-lg text-slate-700">
          <p className="mb-6">EduPremium, 2024 yılında Türkiye nin en seçkin özel ders platformu olma vizyonuyla kurulmuştur.</p>
          <p className="mb-6">Misyonumuz, öğrencileri alanında uzman öğretmenlerle buluşturarak akademik başarılarını en üst seviyeye taşımaktır.</p>
          <h2 className="font-display text-2xl text-navy-900 mt-12 mb-4">Vizyonumuz</h2>
          <p className="mb-6">Türkiye nin her yerinden öğrencilerin kaliteli eğitime erişebilmesini sağlamak.</p>
          <h2 className="font-display text-2xl text-navy-900 mt-12 mb-4">Değerlerimiz</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kalite odaklı eğitim</li>
            <li>Öğrenci memnuniyeti</li>
            <li>Şeffaflık ve güven</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
