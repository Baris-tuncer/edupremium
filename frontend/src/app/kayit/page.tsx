'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function KayitSecimPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-navy-900 mb-4">Hesap Oluştur</h1>
          <p className="text-lg text-slate-600 mb-12">Nasıl devam etmek istersiniz?</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Veli / Öğrenci */}
            <Link
              href="/student/register"
              className="group bg-white rounded-2xl shadow-sm border-2 border-slate-200 hover:border-navy-500 p-8 transition-all hover:shadow-lg"
            >
              <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-navy-100 transition-colors">
                <svg className="w-8 h-8 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-3">Veli / Öğrenci</h2>
              <p className="text-slate-500">Çocuğunuz için uzman öğretmenlerden birebir ders almak istiyorsanız</p>
              <div className="mt-6 inline-flex items-center gap-2 text-navy-600 font-semibold group-hover:gap-3 transition-all">
                Kayıt Ol
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Öğretmen */}
            <Link
              href="/register"
              className="group bg-white rounded-2xl shadow-sm border-2 border-slate-200 hover:border-gold-500 p-8 transition-all hover:shadow-lg"
            >
              <div className="w-16 h-16 bg-gold-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gold-100 transition-colors">
                <svg className="w-8 h-8 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-3">Öğretmen</h2>
              <p className="text-slate-500">Platformumuzda ders vermek ve öğrencilere ulaşmak istiyorsanız</p>
              <div className="mt-6 inline-flex items-center gap-2 text-gold-600 font-semibold group-hover:gap-3 transition-all">
                Başvuru Yap
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>

          <p className="mt-8 text-slate-500">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-navy-600 font-semibold hover:underline">Giriş Yap</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
