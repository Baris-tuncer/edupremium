'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, Check } from 'lucide-react';

export default function TeacherSettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    appointments: true,
    payments: true,
  });
  const [loggingOut, setLoggingOut] = useState(false);

  // 2FA States
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const totpFactor = data?.totp?.find(f => f.status === 'verified');
      setMfaEnabled(!!totpFactor);
      if (totpFactor) {
        setFactorId(totpFactor.id);
      }
    } catch (err) {
      console.error('MFA status check error:', err);
    } finally {
      setMfaLoading(false);
    }
  };

  const startEnrollment = async () => {
    setEnrolling(true);
    setMfaError(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'EduPremium 2FA'
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    } catch (err: any) {
      setMfaError(err.message || '2FA kurulumu başlatılamadı');
    } finally {
      setEnrolling(false);
    }
  };

  const verifyEnrollment = async () => {
    if (!factorId || verifyCode.length !== 6) return;

    setMfaLoading(true);
    setMfaError(null);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode
      });

      if (verifyError) throw verifyError;

      setMfaEnabled(true);
      setQrCode(null);
      setSecret(null);
      setVerifyCode('');
      setMfaSuccess('2FA başarıyla etkinleştirildi!');
      setTimeout(() => setMfaSuccess(null), 3000);
    } catch (err: any) {
      setMfaError(err.message || 'Kod doğrulanamadı. Lütfen tekrar deneyin.');
    } finally {
      setMfaLoading(false);
    }
  };

  const disableMfa = async () => {
    if (!factorId) return;

    if (!confirm('2FA\'yı devre dışı bırakmak istediğinizden emin misiniz? Bu, hesabınızın güvenliğini azaltacaktır.')) {
      return;
    }

    setMfaLoading(true);
    setMfaError(null);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId
      });

      if (error) throw error;

      setMfaEnabled(false);
      setFactorId(null);
      setMfaSuccess('2FA devre dışı bırakıldı.');
      setTimeout(() => setMfaSuccess(null), 3000);
    } catch (err: any) {
      setMfaError(err.message || '2FA devre dışı bırakılamadı');
    } finally {
      setMfaLoading(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/teacher/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: yine de yönlendir
      router.push('/teacher/login');
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#0F172A] mb-2">Ayarlar</h1>
          <p className="text-slate-600">Hesap ve bildirim ayarlarınızı yönetin</p>
        </div>

        {/* Notifications */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 mb-6 shadow-2xl shadow-[#0F172A]/5">
          <h2 className="font-serif text-xl font-semibold text-[#0F172A] mb-4">Bildirimler</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#0F172A]">Email Bildirimleri</p>
                <p className="text-sm text-slate-600">Önemli güncellemeler için email alın</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D4AF37]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/80 backdrop-blur-xl after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F172A]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#0F172A]">SMS Bildirimleri</p>
                <p className="text-sm text-slate-600">Randevu hatırlatmaları için SMS alın</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D4AF37]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/80 backdrop-blur-xl after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F172A]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 mb-6 shadow-2xl shadow-[#0F172A]/5">
          <h2 className="font-serif text-xl font-semibold text-[#0F172A] mb-4">Hesap</h2>
          <button className="text-[#D4AF37] hover:text-[#D4AF37]/80 font-medium">
            Şifre Değiştir
          </button>
        </div>

        {/* 2FA Security */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 mb-6 shadow-2xl shadow-[#0F172A]/5">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-[#D4AF37]" />
            <h2 className="font-serif text-xl font-semibold text-[#0F172A]">İki Faktörlü Doğrulama (2FA)</h2>
          </div>

          {mfaLoading && !qrCode ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Yükleniyor...</span>
            </div>
          ) : mfaEnabled ? (
            /* 2FA Enabled State */
            <div>
              <div className="flex items-center gap-3 mb-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">2FA Aktif</p>
                  <p className="text-sm text-green-600">Hesabınız ek güvenlik katmanıyla korunuyor</p>
                </div>
              </div>
              <button
                onClick={disableMfa}
                disabled={mfaLoading}
                className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-2"
              >
                <ShieldOff className="w-4 h-4" />
                2FA'yı Devre Dışı Bırak
              </button>
            </div>
          ) : qrCode ? (
            /* Enrollment in Progress */
            <div className="space-y-4">
              <p className="text-slate-600 text-sm">
                Google Authenticator veya benzeri bir uygulama ile aşağıdaki QR kodu tarayın:
              </p>

              <div className="flex justify-center p-4 bg-white rounded-xl border border-slate-200">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>

              {secret && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Manuel giriş kodu:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-[#0F172A] flex-1 break-all">{secret}</code>
                    <button onClick={copySecret} className="p-1.5 hover:bg-slate-200 rounded transition-colors">
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0F172A]">Doğrulama Kodu</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6 haneli kod"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setQrCode(null); setSecret(null); setVerifyCode(''); }}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={verifyEnrollment}
                  disabled={verifyCode.length !== 6 || mfaLoading}
                  className="flex-1 px-4 py-3 bg-[#0F172A] text-white rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mfaLoading ? 'Doğrulanıyor...' : 'Doğrula ve Etkinleştir'}
                </button>
              </div>
            </div>
          ) : (
            /* 2FA Not Enabled */
            <div>
              <p className="text-slate-600 text-sm mb-4">
                İki faktörlü doğrulama, hesabınıza ekstra bir güvenlik katmanı ekler.
                Giriş yaparken şifrenizin yanı sıra telefonunuzdaki bir uygulama ile oluşturulan
                tek kullanımlık kod da istenecektir.
              </p>
              <button
                onClick={startEnrollment}
                disabled={enrolling}
                className="px-6 py-3 bg-[#0F172A] text-white rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Hazırlanıyor...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    2FA'yı Etkinleştir
                  </>
                )}
              </button>
            </div>
          )}

          {mfaError && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              {mfaError}
            </div>
          )}

          {mfaSuccess && (
            <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm">
              {mfaSuccess}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white/80 backdrop-blur-xl border border-red-200/50 rounded-3xl p-6 shadow-2xl shadow-[#0F172A]/5">
          <h2 className="font-serif text-xl font-semibold text-red-600 mb-4">Tehlikeli Bölge</h2>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
          </button>
        </div>
      </div>
    </div>
  );
}
