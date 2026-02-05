'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Star, ChevronRight } from 'lucide-react';

export default function StudentLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      setSuccess('E-posta doğrulaması başarılı! Şimdi giriş yapabilirsiniz.');
    }
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw new Error(authError.message);

      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', data.user?.id)
        .single();

      if (!studentProfile) {
        await supabase.auth.signOut();
        throw new Error('Bu hesap bir öğrenci hesabı değil.');
      }

      window.location.href = '/student/dashboard';
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw new Error(error.message);

      setSuccess('Şifre sıfırlama linki e-posta adresinize gönderildi.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (err: any) {
      setError(err.message || 'Şifre sıfırlama başarısız.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#FDFBF7]/80 backdrop-blur-xl overflow-hidden">

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

      <div className="relative z-10 container mx-auto px-4">

        {/* Geri Dön */}
        <div className="absolute top-8 left-4 md:left-8">
          <Link href="/login" className="flex items-center gap-2 text-[#0F172A] font-bold text-sm hover:text-[#D4AF37] transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-md">
            <ArrowLeft className="w-4 h-4" /> Geri Dön
          </Link>
        </div>

        <div className="max-w-md mx-auto">

          {/* Rozet */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest bg-white/40 backdrop-blur-md shadow-sm">
              <Star className="w-3 h-3 text-[#D4AF37] fill-current" /> Öğrenci Portalı
            </div>
          </div>

          {/* FORM KARTI */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5">

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#0F172A] font-serif mb-2">Öğrenci Girişi</h1>
              <p className="text-slate-500 text-sm">EduPremium hesabınıza erişin</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium">
                {success}
              </div>
            )}

            {!showForgotPassword ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider ml-1">E-Posta</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="ornek@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Şifre</label>
                      <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs text-[#D4AF37] font-bold hover:underline">Şifremi Unuttum?</button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg flex items-center justify-center gap-2 group mt-4 disabled:opacity-50"
                  >
                    {isLoading ? 'Giriş Yapılıyor...' : (
                      <>Giriş Yap <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>

                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                  <p className="text-slate-500 text-sm">
                    Hesabınız yok mu? <Link href="/student/register" className="text-[#0F172A] font-bold hover:text-[#D4AF37] transition-colors">Kayıt Olun</Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#0F172A] font-serif mb-2">Şifre Sıfırlama</h3>
                  <p className="text-sm text-slate-500">E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider ml-1">E-Posta</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-slate-300"
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg disabled:opacity-50"
                  >
                    {isResetting ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setError(''); }}
                    className="w-full py-3 bg-slate-100 text-[#0F172A] rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Girişe Geri Dön
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
