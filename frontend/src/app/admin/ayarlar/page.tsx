'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, Check } from 'lucide-react';
import { calculatePriceFromNet, PRICE_CONSTANTS, COMMISSION_TIERS } from '@/lib/price-calculator';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('fiyatlandirma');
  const [testNetPrice, setTestNetPrice] = useState(1000);
  const [testCommission, setTestCommission] = useState(0.25);

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
    if (activeTab === 'guvenlik') {
      checkMfaStatus();
    }
  }, [activeTab]);

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
        friendlyName: 'EduPremium Admin 2FA'
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

    if (!confirm('2FA\'yı devre dışı bırakmak istediğinizden emin misiniz?')) {
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

  // Yeni fiyatlandırma sistemi: Öğretmen net alır, üzerine eklenir
  const priceDetails = calculatePriceFromNet(testNetPrice, testCommission);
  const formatCurrency = (n: number) => n.toLocaleString('tr-TR') + ' TL';

  const tabs = [
    { id: 'fiyatlandirma', label: 'Fiyatlandırma', icon: '₺' },
    { id: 'komisyon', label: 'Komisyon Oranları', icon: '%' },
    { id: 'genel', label: 'Genel Ayarlar', icon: '⚙' },
    { id: 'guvenlik', label: 'Güvenlik (2FA)', icon: '🔐' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Sistem Ayarları</h1>
        <p className="text-slate-600 mt-1">Platform ayarlarını yönetin</p>
      </div>

      <div className="flex gap-8">
        <div className="w-64 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                activeTab === tab.id ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {activeTab === 'fiyatlandirma' && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Fiyat Hesaplama Aracı</h2>
                <p className="text-sm text-slate-500 mb-4">Öğretmen net tutarını yazar, vergiler ve komisyon üzerine eklenir.</p>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Öğretmen Net Tutarı (TL)</label>
                    <input
                      type="number"
                      value={testNetPrice}
                      onChange={(e) => setTestNetPrice(Number(e.target.value))}
                      min={PRICE_CONSTANTS.MIN_NET_PRICE}
                      step={50}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                    />
                    <p className="text-sm text-slate-500 mt-1">Minimum: {PRICE_CONSTANTS.MIN_NET_PRICE.toLocaleString('tr-TR')} TL</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Komisyon Oranı</label>
                    <select
                      value={testCommission}
                      onChange={(e) => setTestCommission(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                    >
                      {COMMISSION_TIERS.map(tier => (
                        <option key={tier.rate} value={tier.rate}>
                          %{tier.percentage} - {tier.label} ({tier.minLessons}-{tier.maxLessons === Infinity ? '∞' : tier.maxLessons} ders)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6">
                  <h3 className="font-semibold text-[#D4AF37] mb-4 text-lg">Fiyat Hesaplama Detayı</h3>

                  <div className="space-y-3 text-sm">
                    {/* Öğretmen Net Tutarı */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <h4 className="font-medium text-green-700 mb-3">1. Öğretmen Net Tutarı</h4>
                      <div className="flex justify-between">
                        <span className="text-green-700">Öğretmenin Alacağı (Net):</span>
                        <span className="font-bold text-green-700 text-lg">{formatCurrency(priceDetails.netPrice)}</span>
                      </div>
                      <p className="text-xs text-green-600 mt-2">Öğretmen bu tutarı tam olarak alır, komisyon kesilmez.</p>
                    </div>

                    {/* Üzerine Eklenenler */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-lg p-4">
                      <h4 className="font-medium text-slate-700 mb-3">2. Üzerine Eklenen Tutarlar</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-orange-600">
                          <span>Stopaj (%{(PRICE_CONSTANTS.STOPAJ_RATE * 100).toFixed(0)}):</span>
                          <span className="font-medium">+{formatCurrency(priceDetails.stopaj)}</span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                          <span>Platform Komisyonu (%{(testCommission * 100).toFixed(0)}):</span>
                          <span className="font-medium">+{formatCurrency(priceDetails.komisyon)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200">
                          <span className="text-slate-600">Ara Toplam (KDV Hariç):</span>
                          <span className="font-medium">{formatCurrency(priceDetails.araToplam)}</span>
                        </div>
                        <div className="flex justify-between text-purple-600">
                          <span>KDV (%{(PRICE_CONSTANTS.KDV_RATE * 100).toFixed(0)}):</span>
                          <span className="font-medium">+{formatCurrency(priceDetails.kdv)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sonuç */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h4 className="font-medium text-blue-700 mb-3">3. Veli Ödeyeceği Tutar</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-slate-600">
                          <span>Ham Toplam:</span>
                          <span className="font-medium">{formatCurrency(priceDetails.rawTotal)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-blue-200">
                          <span className="font-semibold text-blue-700">Final (50'ye Yuvarlanmış):</span>
                          <span className="font-bold text-blue-700 text-xl">{formatCurrency(priceDetails.displayPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-2xl p-6 text-white">
                <h3 className="font-semibold mb-4">Hızlı Özet</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
                    <p className="text-green-200 text-sm">Öğretmen Alır (Net)</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(priceDetails.netPrice)}</p>
                  </div>
                  <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
                    <p className="text-blue-200 text-sm">Platform Kazanır</p>
                    <p className="text-2xl font-bold text-blue-400">{formatCurrency(priceDetails.komisyon)}</p>
                  </div>
                  <div className="bg-amber-500/20 rounded-xl p-4 border border-amber-500/30">
                    <p className="text-amber-200 text-sm">Veli Öder</p>
                    <p className="text-2xl font-bold text-amber-400">{formatCurrency(priceDetails.displayPrice)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'komisyon' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Kademeli Komisyon Oranları</h2>
              <p className="text-sm text-slate-500 mb-6">Komisyon öğretmenden kesilmez, veliye yansıyan fiyata eklenir.</p>

              <div className="space-y-4">
                {COMMISSION_TIERS.map((tier, index) => {
                  const colors = [
                    { bg: 'bg-[#D4AF37]/10', border: 'border-[#D4AF37]/30', circle: 'bg-[#D4AF37]' },
                    { bg: 'bg-yellow-50', border: 'border-yellow-200', circle: 'bg-yellow-500' },
                    { bg: 'bg-green-50', border: 'border-green-200', circle: 'bg-green-500' },
                  ];
                  const color = colors[index] || colors[0];
                  return (
                    <div key={tier.rate} className={`flex items-center gap-4 p-5 ${color.bg} rounded-xl border-2 ${color.border}`}>
                      <div className={`w-16 h-16 ${color.circle} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                        %{tier.percentage}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-lg">{tier.label}</h3>
                        <p className="text-slate-600">
                          {tier.minLessons} - {tier.maxLessons === Infinity ? '∞' : tier.maxLessons} ders
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'genel' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Genel Ayarlar</h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-green-50 rounded-xl">
                  <label className="block text-sm font-medium text-green-700 mb-2">Minimum Net Ders Ücreti</label>
                  <p className="text-2xl font-bold text-green-700">{PRICE_CONSTANTS.MIN_NET_PRICE.toLocaleString('tr-TR')} TL</p>
                  <p className="text-xs text-green-600 mt-1">Öğretmenin alacağı minimum tutar</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Maksimum Ders Ücreti</label>
                  <p className="text-2xl font-bold text-slate-900">Limit Yok</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl">
                  <label className="block text-sm font-medium text-orange-700 mb-2">Stopaj Oranı</label>
                  <p className="text-2xl font-bold text-orange-700">%{(PRICE_CONSTANTS.STOPAJ_RATE * 100).toFixed(0)}</p>
                  <p className="text-xs text-orange-600 mt-1">Net tutarın üzerine eklenir</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <label className="block text-sm font-medium text-purple-700 mb-2">KDV Oranı</label>
                  <p className="text-2xl font-bold text-purple-700">%{(PRICE_CONSTANTS.KDV_RATE * 100).toFixed(0)}</p>
                  <p className="text-xs text-purple-600 mt-1">Ara toplam üzerine eklenir</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guvenlik' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-[#D4AF37]" />
                <h2 className="text-lg font-semibold text-slate-900">İki Faktörlü Doğrulama (2FA)</h2>
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
                      <p className="text-sm text-green-600">Admin hesabınız ek güvenlik katmanıyla korunuyor</p>
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
                        <code className="text-sm font-mono text-slate-900 flex-1 break-all">{secret}</code>
                        <button onClick={copySecret} className="p-1.5 hover:bg-slate-200 rounded transition-colors">
                          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Doğrulama Kodu</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6 haneli kod"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
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
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <p className="text-amber-800 font-medium">Admin hesabınız için 2FA önerilir!</p>
                    <p className="text-amber-600 text-sm mt-1">Tüm sistem verilerine erişiminiz olduğu için ekstra güvenlik katmanı eklemeniz tavsiye edilir.</p>
                  </div>
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
          )}
        </div>
      </div>
    </div>
  );
}
