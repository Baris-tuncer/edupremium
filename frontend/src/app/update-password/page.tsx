'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Supabase oturumunu kontrol et
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Session yoksa, URL'den token'ı al ve oturumu başlat
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
      setSessionChecked(true);
    };

    checkSession();
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Sifre en az 8 karakter olmalidir';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Sifre en az bir buyuk harf icermelidir';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Sifre en az bir kucuk harf icermelidir';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Sifre en az bir rakam icermelidir';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Sifreler eslesmedi');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setError('Bir hata olustu. Lutfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (): { label: string; color: string; width: string } => {
    if (!password) return { label: '', color: 'bg-slate-200', width: '0%' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: 'Zayif', color: 'bg-red-500', width: '33%' };
    if (score <= 4) return { label: 'Orta', color: 'bg-amber-500', width: '66%' };
    return { label: 'Guclu', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = passwordStrength();

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

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
          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-7 h-7 text-slate-600" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">Yeni Sifre Belirleyin</h2>
                <p className="mt-2 text-slate-500 text-sm leading-relaxed">
                  Hesabiniz icin guvenli bir sifre olusturun.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Yeni Sifre
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="En az 8 karakter"
                      required
                      className="w-full px-4 py-3.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {password && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-500">Sifre gucu</span>
                        <span className={`text-xs font-medium ${
                          strength.label === 'Zayif' ? 'text-red-600' :
                          strength.label === 'Orta' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: strength.width }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Sifre Tekrari
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Sifrenizi tekrar girin"
                      required
                      className="w-full px-4 py-3.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-2 text-xs text-red-500">Sifreler eslesmedi</p>
                  )}
                  {confirmPassword && password === confirmPassword && confirmPassword.length >= 8 && (
                    <p className="mt-2 text-xs text-emerald-500 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Sifreler eslesiyor
                    </p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-medium text-slate-700 mb-2">Sifre gereksinimleri:</p>
                  <ul className="space-y-1.5">
                    {[
                      { met: password.length >= 8, text: 'En az 8 karakter' },
                      { met: /[A-Z]/.test(password), text: 'En az bir buyuk harf (A-Z)' },
                      { met: /[a-z]/.test(password), text: 'En az bir kucuk harf (a-z)' },
                      { met: /[0-9]/.test(password), text: 'En az bir rakam (0-9)' },
                    ].map((req, i) => (
                      <li key={i} className={`flex items-center gap-2 text-xs ${req.met ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {req.met ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                        )}
                        {req.text}
                      </li>
                    ))}
                  </ul>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                  className="w-full py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Guncelleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Sifreyi Guncelle</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Sifreniz Guncellendi</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Yeni sifreniz basariyla kaydedildi. Simdi giris yapabilirsiniz.
              </p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                <p className="text-xs text-slate-500">
                  Birkaç saniye icinde giris sayfasina yonlendirileceksiniz...
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
              >
                Giris Yap
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Bir sorun mu yasiyorsunuz?{' '}
          <Link href="/iletisim" className="text-slate-600 hover:text-slate-900 underline underline-offset-2">
            Destek alin
          </Link>
        </p>
      </div>
    </div>
  );
}
