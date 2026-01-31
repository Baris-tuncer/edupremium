export default function IletisimPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-navy-900 mb-8">İletişim</h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-semibold text-xl text-navy-900 mb-4">Bize Ulaşın</h2>
            <p className="text-slate-600 mb-4">Email: info@visserr.com</p>
            <p className="text-slate-600 mb-4">Telefon: +90 533 295 13 03</p>
            <p className="text-slate-600">Adres: İstanbul, Türkiye</p>
          </div>
          <div>
            <h2 className="font-semibold text-xl text-navy-900 mb-4">Çalışma Saatleri</h2>
            <p className="text-slate-600 mb-2">Pazartesi - Cuma: 09:00 - 18:00</p>
            <p className="text-slate-600">Cumartesi: 10:00 - 14:00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
