export default function YardimPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-navy-900 mb-4">Yardim Merkezi</h1>
        <p className="text-slate-600 mb-12">Size nasil yardimci olabiliriz?</p>
        <div className="grid md:grid-cols-2 gap-6">
          <a href="/sss" className="bg-white p-6 rounded-2xl shadow-card hover:shadow-elevated transition-shadow">
            <h3 className="font-semibold text-lg text-navy-900 mb-2">Sikca Sorulan Sorular</h3>
            <p className="text-slate-500">En cok sorulan sorularin cevaplari</p>
          </a>
          <a href="/iletisim" className="bg-white p-6 rounded-2xl shadow-card hover:shadow-elevated transition-shadow">
            <h3 className="font-semibold text-lg text-navy-900 mb-2">Bize Ulasin</h3>
            <p className="text-slate-500">Destek ekibimizle iletisime gecin</p>
          </a>
        </div>
      </div>
    </div>
  );
}
