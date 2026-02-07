'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield } from 'lucide-react';
import Turnstile from '@/components/Turnstile';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA States
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      setError('Lütfen güvenlik doğrulamasını tamamlayın.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Email veya şifre hatalı');
        setLoading(false);
        return;
      }

      // Admin kontrolü
      const { data: profile } = await supabase
        .from('teacher_profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();

      if (!profile?.is_admin) {
        await supabase.auth.signOut();
        setError('Bu hesap admin yetkisine sahip değil');
        setLoading(false);
        return;
      }

      // Check if MFA is required
      const { data: assuranceLevel } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (assuranceLevel?.currentLevel === 'aal1' && assuranceLevel?.nextLevel === 'aal2') {
        // MFA is required - get the factor
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp?.find(f => f.status === 'verified');

        if (totpFactor) {
          setMfaFactorId(totpFactor.id);
          setShowMfaInput(true);
          setLoading(false);
          return;
        }
      }

      // Hard navigation - çerez senkronizasyonu için
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError('Bir hata oluştu');
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId || mfaCode.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code: mfaCode
      });

      if (verifyError) throw verifyError;

      // MFA verified, proceed
      window.location.href = '/admin/dashboard';

    } catch (err: any) {
      setError('Doğrulama kodu hatalı. Lütfen tekrar deneyin.');
      console.error('MFA verify error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Girişi</h1>
            <p className="text-slate-500 mt-2">EduPremium Yönetim Paneli</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          {showMfaInput ? (
            /* 2FA Code Input */
            <form onSubmit={handleMfaVerify} className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20 mb-4">
                <Shield className="w-6 h-6 text-[#D4AF37]" />
                <div>
                  <p className="font-semibold text-slate-900">2FA Doğrulaması</p>
                  <p className="text-sm text-slate-500">Authenticator uygulamanızdaki 6 haneli kodu girin</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Doğrulama Kodu</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowMfaInput(false); setMfaCode(''); setError(''); }}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={loading || mfaCode.length !== 6}
                  className="flex-1 bg-[#0F172A] hover:bg-[#D4AF37] hover:text-[#0F172A] text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? 'Doğrulanıyor...' : 'Doğrula'}
                </button>
              </div>
            </form>
          ) : (
            /* Normal Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                  placeholder="admin@edupremium.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Şifre</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Turnstile onVerify={handleTurnstileVerify} />

              <button
                type="submit"
                disabled={loading || !turnstileToken}
                className="w-full bg-[#0F172A] hover:bg-[#D4AF37] hover:text-[#0F172A] text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
