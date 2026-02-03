'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };
    getUser();
  }, []);

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    setError('');
    setResent(false);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setResent(true);
      }
    } catch (err) {
      setError('E-posta gonderilemedi. Lutfen tekrar deneyin.');
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Edu<span className="text-navy-600">Premium</span>
            </h1>
          </Link>
          <p className="mt-2 text-slate-500 text-sm">Ozel Ders Platformu</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Mail className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">E-posta Dogrulamasi Gerekli</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Hesabinizi aktif hale getirmek icin e-posta adresinize gonderilen dogrulama baglantisinA tiklayin.
            </p>
          </div>

          {/* Email Info */}
          {email && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
              <p className="text-sm text-slate-600 text-center">
                Dogrulama e-postasi su adrese gonderildi:
              </p>
              <p className="text-sm font-semibold text-slate-900 text-center mt-1">
                {email}
              </p>
            </div>
          )}

          {/* Resent Success */}
          {resent && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-6">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-sm text-emerald-700">Dogrulama e-postasi tekrar gonderildi.</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-slate-600">1</span>
              </div>
              <p className="text-sm text-slate-600">E-posta kutunuzu kontrol edin</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-slate-600">2</span>
              </div>
              <p className="text-sm text-slate-600">EduPremium tarafindan gonderilen e-postayi acin</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-slate-600">3</span>
              </div>
              <p className="text-sm text-slate-600">Dogrulama baglantisinA tiklayin</p>
            </div>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={resending || !email}
            className="w-full py-3.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {resending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Gonderiliyor...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>E-postayi Tekrar Gonder</span>
              </>
            )}
          </button>

          {/* Spam Notice */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 text-center">
              E-posta gelmediyse spam/gereksiz klasorunuzu kontrol edin. Bazen e-postalar bu klasore dusebilir.
            </p>
          </div>

          {/* Logout / Back */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cikis Yap
            </button>
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Giris Sayfasi</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Yardima mi ihtiyaciniz var?{' '}
          <Link href="/iletisim" className="text-slate-600 hover:text-slate-900 underline underline-offset-2">
            Destek alin
          </Link>
        </p>
      </div>
    </div>
  );
}
