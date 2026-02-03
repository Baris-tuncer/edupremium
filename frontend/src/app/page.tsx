import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* HERO SECTION */}
      <div className="relative isolate px-6 pt-14 lg:px-8 flex-grow flex items-center">

        {/* ARKA PLAN EFEKTI */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 bg-white/50 backdrop-blur-sm">
              Türkiye'nin Premium Eğitim Platformu
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl font-serif">
            Eğitimde Mükemmelliğe <br />
            <span className="text-blue-900">Giden Yol</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-xl mx-auto">
            Alanında uzman, titizlikle seçilmiş öğretmenlerle birebir online ders deneyimi. Çocuğunuzun akademik başarısı için en doğru adım.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            {/* SOL BUTON: OGRETMEN BASVURUSU (KOYU RENK) */}
            <Link
              href="/register"
              className="rounded-md bg-slate-800 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
            >
              Hemen Başla <span aria-hidden="true">→</span>
            </Link>

            {/* SAG BUTON: OGRENCI KAYDI / KESFET (BEYAZ) */}
            <Link
              href="/student/register"
              className="rounded-md bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Öğretmenleri Keşfet
            </Link>
          </div>

           {/* ASAGI OK (KESFET) */}
           <div className="mt-16 animate-bounce text-gray-400">
              <span className="text-xs uppercase tracking-widest block mb-2">Keşfet</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
           </div>
        </div>

        {/* ALT ARKA PLAN EFEKTI */}
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
