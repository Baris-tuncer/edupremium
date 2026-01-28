'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function FailContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Odeme Basarisiz</h1>
        <p className="text-gray-600 mb-6">{error || 'Odeme islemi sirasinda bir hata olustu.'}</p>
        <a href="/teachers" className="inline-block bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700">
          Tekrar Dene
        </a>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yukleniyor...</div>}>
      <FailContent />
    </Suspense>
  );
}
