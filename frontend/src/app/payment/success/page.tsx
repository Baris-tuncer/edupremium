'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lessonId');

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Odeme Basarili!</h1>
        <p className="text-gray-600 mb-6">Dersiniz basariyla olusturuldu.</p>
        <a href="/student/lessons" className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700">
          Derslerime Git
        </a>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yukleniyor...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
