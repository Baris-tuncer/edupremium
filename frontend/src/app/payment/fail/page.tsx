'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { XCircle } from 'lucide-react'

function FailContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#FDFBF7] overflow-hidden">

      {/* --- ARKA PLAN --- */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')`
          }}
        ></div>
        <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
      </div>

      <div className="relative z-10 px-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0F172A]/5 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-serif mb-2">Ödeme Başarısız</h1>
          <p className="text-slate-600 mb-8">{error || 'Ödeme işlemi sırasında bir hata oluştu.'}</p>
          <a
            href="/teachers"
            className="inline-flex items-center gap-2 bg-[#0F172A] text-white font-bold py-4 px-8 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg"
          >
            Tekrar Dene
          </a>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FailContent />
    </Suspense>
  )
}
