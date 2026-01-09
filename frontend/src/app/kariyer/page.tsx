export default function KariyerPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl text-navy-900 mb-4">Kariyer</h1>
        <p className="text-slate-600 mb-12">EduPremium ailesine katilmak ister misiniz?</p>
        <div className="bg-white p-8 rounded-2xl shadow-card">
          <h2 className="font-semibold text-xl text-navy-900 mb-4">Ogretmen Olarak Basvurun</h2>
          <p className="text-slate-600 mb-6">Alaninda uzman ogretmenler ariyoruz. Esnek calisma saatleri ve rekabetci kazanc firsati.</p>
          <a href="/register" className="inline-block bg-navy-900 text-white px-6 py-3 rounded-lg hover:bg-navy-800 transition-colors">Basvur</a>
        </div>
      </div>
    </div>
  );
}
