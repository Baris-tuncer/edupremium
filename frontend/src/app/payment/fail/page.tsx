'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Ödeme işlemi başarısız oldu';
  const code = searchParams.get('code');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Ödeme Başarısız</h1>
        <p className="text-slate-600 mb-6">{error}</p>

        {code && (
          <div className="bg-red-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-500">Hata Kodu: {code}</p>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm font-medium text-slate-700 mb-2">Olası sebepler:</p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Kart limiti yetersiz olabilir</li>
            <li>• Kart bilgileri hatalı girilmiş olabilir</li>
            <li>• 3D Secure doğrulaması başarısız olabilir</li>
            <li>• Banka tarafından işlem reddedilmiş olabilir</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button onClick={() => window.history.back()} className="block w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Tekrar Dene
          </button>
          <Link href="/student/dashboard" className="block w-full py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
