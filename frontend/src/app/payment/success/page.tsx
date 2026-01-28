'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/student/lessons');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Ödeme Başarılı! 🎉</h1>
        <p className="text-slate-600 mb-6">Ders kaydınız oluşturuldu. Öğretmeniniz sizinle iletişime geçecektir.</p>

        {orderId && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-500">Sipariş Numarası</p>
            <p className="font-mono text-slate-800">{orderId}</p>
          </div>
        )}

        <p className="text-sm text-slate-500 mb-6">{countdown} saniye sonra derslerinize yönlendirileceksiniz...</p>

        <div className="space-y-3">
          <Link href="/student/lessons" className="block w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors">
            Derslerime Git
          </Link>
          <Link href="/student/dashboard" className="block w-full py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
