'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { key: 'ilkokul', label: 'İlkokul (1-4)' },
  { key: 'ortaokul', label: 'Ortaokul (5-8)' },
  { key: 'lise', label: 'Lise (9-12)' },
  { key: 'lgs', label: 'LGS Hazırlık' },
  { key: 'tyt-ayt', label: 'TYT-AYT Hazırlık' },
  { key: 'yabanci-dil', label: 'Yabancı Dil' },
];

const PRICING_PLANS = [
  { key: '30', days: 30, price: 4500, label: '1 Ay', perDay: 150, popular: false },
  { key: '90', days: 90, price: 12000, label: '3 Ay', perDay: 133, popular: true },
  { key: '180', days: 180, price: 21000, label: '6 Ay', perDay: 117, popular: false },
  { key: '365', days: 365, price: 37000, label: '1 Yıl', perDay: 101, popular: false },
];

const BANK_INFO = {
  bankName: 'AKBANK',
  accountHolder: 'Mac Elt Özel Eğitim Yayıncılık Dağ. Paz. ve Tic. Ltd. Şti.',
  iban: 'TR06 0004 6000 2088 8000 5930 60',
  ibanRaw: 'TR0600046000208880005930 60', // Kopyalama için boşluksuz
  description: 'Editörün Seçimi - [İsminiz]',
};

export default function OneCikPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePayment, setActivePayment] = useState<any>(null);

  // Form
  const [category, setCategory] = useState('');
  const [headline, setHeadline] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('90'); // Default: 3 ay (en popüler)
  const [paymentMethod, setPaymentMethod] = useState<'paratika' | 'havale'>('paratika');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentPlan = PRICING_PLANS.find(p => p.key === selectedPlan) || PRICING_PLANS[1];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    // Profil bilgisi
    const { data: profileData } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(profileData);

    // Aktif veya bekleyen başvuru var mı?
    const { data: payments } = await supabase
      .from('featured_payments')
      .select('*')
      .eq('teacher_id', user.id)
      .in('payment_status', ['pending', 'completed'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (payments && payments.length > 0) {
      setActivePayment(payments[0]);
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!category || !headline || !user) return;

    setSubmitting(true);

    try {
      if (paymentMethod === 'havale') {
        // Havale seçildi - başvuru oluştur, admin onayı bekle
        const { error } = await supabase.from('featured_payments').insert({
          teacher_id: user.id,
          category,
          headline,
          amount: currentPlan.price,
          plan_days: currentPlan.days,
          payment_method: 'havale',
          payment_status: 'pending',
        });

        if (error) {
          alert('Hata: ' + error.message);
          return;
        }

        setSubmitted(true);
        fetchData();
      } else {
        // Paratika ile ödeme - Auth token al
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          alert('Oturum hatası. Lütfen tekrar giriş yapın.');
          return;
        }

        const response = await fetch('/api/payment/featured-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            teacherId: user.id,
            category,
            headline,
            planKey: selectedPlan,
          }),
        });

        const result = await response.json();

        if (result.paymentUrl) {
          // Ödeme sayfasına yönlendir
          window.location.href = result.paymentUrl;
        } else {
          alert('Ödeme oturumu oluşturulamadı. Lütfen tekrar deneyin.');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Zaten aktif featured ise
  if (profile?.is_featured && profile?.featured_until && new Date(profile.featured_until) > new Date()) {
    const endDate = new Date(profile.featured_until).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const categoryLabel = CATEGORIES.find(c => c.key === profile.featured_category)?.label || profile.featured_category;

    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Öne Çık</h1>

        <div className="bg-gradient-to-br from-amber-50 to-[#D4AF37]/10 border-2 border-[#D4AF37]/40 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">Editörün Seçimi Aktif!</h2>
              <p className="text-amber-700 font-medium">Profiliniz öne çıkarılmış durumda</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[#D4AF37]/40/50">
              <span className="text-slate-600">Kategori</span>
              <span className="font-semibold text-[#0F172A]">{categoryLabel}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#D4AF37]/40/50">
              <span className="text-slate-600">Slogan</span>
              <span className="font-semibold text-[#0F172A]">{profile.featured_headline}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Bitiş Tarihi</span>
              <span className="font-semibold text-[#0F172A]">{endDate}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bekleyen başvuru varsa
  if (activePayment?.payment_status === 'pending') {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Öne Çık</h1>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Başvurunuz İnceleniyor</h2>
          <p className="text-slate-600 mb-4">Havale/EFT ödemesi doğrulandıktan sonra profiliniz öne çıkarılacaktır.</p>
          <p className="text-sm text-slate-500">Başvuru tarihi: {new Date(activePayment.created_at).toLocaleDateString('tr-TR')}</p>
        </div>
      </div>
    );
  }

  // Havale başvurusu gönderildi
  if (submitted) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Öne Çık</h1>

        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Başvurunuz Alındı!</h2>
          <p className="text-slate-600 mb-6">Aşağıdaki hesaba havale/EFT yaptıktan sonra başvurunuz onaylanacaktır.</p>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 text-left space-y-4 border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Banka</span>
              <span className="font-semibold text-[#0F172A]">{BANK_INFO.bankName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-sm">Hesap Sahibi</span>
              <span className="font-semibold text-[#0F172A] text-sm leading-tight">{BANK_INFO.accountHolder}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-sm">IBAN</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-[#0F172A] tracking-wide">{BANK_INFO.iban}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(BANK_INFO.iban.replace(/\s/g, ''));
                    alert('IBAN kopyalandı!');
                  }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors"
                >
                  Kopyala
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-slate-500">Tutar</span>
              <span className="font-bold text-[#0F172A] text-lg">{currentPlan.price.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-sm">Açıklama</span>
              <span className="font-semibold text-[#0F172A] text-sm">{BANK_INFO.description}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Yeni başvuru formu
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Öne Çık</h1>
      <p className="text-slate-600 mb-8">Profilinizi öne çıkararak daha fazla öğrenciye ulaşın.</p>

      {/* Avantajlar */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#0F172A]/80 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-8 h-8 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h2 className="text-xl font-bold">Editörün Seçimi Avantajları</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            <span>Ana sayfa vitrini</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            <span>Öğretmenler sayfası üst sıra</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            <span>Editörün Seçimi rozeti</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            <span>Öncelikli destek</span>
          </div>
        </div>
      </div>

      {/* Fiyat Planları */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#0F172A] mb-4">Süre Seçin</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PRICING_PLANS.map((plan) => (
            <button
              key={plan.key}
              onClick={() => setSelectedPlan(plan.key)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                selectedPlan === plan.key
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-lg'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#0F172A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  EN POPÜLER
                </div>
              )}
              <div className="text-center">
                <p className="font-bold text-[#0F172A] text-lg">{plan.label}</p>
                <p className="text-2xl font-bold text-[#D4AF37] mt-1">
                  {plan.price.toLocaleString('tr-TR')} ₺
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Günlük {plan.perDay} ₺
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-2xl shadow-[#0F172A]/5 space-y-5">
        {/* Kategori */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Hangi kategoride öne çıkmak istiyorsunuz?</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
          >
            <option value="">Kategori seçin...</option>
            {CATEGORIES.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Slogan */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Öne çıkan sloganınız</label>
          <input
            type="text"
            value={headline}
            onChange={e => setHeadline(e.target.value)}
            placeholder='Örn: "LGS Matematik Uzmanı - %95 Başarı Oranı"'
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            maxLength={100}
          />
          <p className="text-xs text-slate-400 mt-1">{headline.length}/100 karakter</p>
        </div>

        {/* Ödeme Yöntemi */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Ödeme Yöntemi</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('paratika')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                paymentMethod === 'paratika'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-[#0F172A]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-semibold text-[#0F172A]">Kredi Kartı</span>
              </div>
              <p className="text-xs text-slate-500">Anında aktif olur</p>
            </button>
            <button
              onClick={() => setPaymentMethod('havale')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                paymentMethod === 'havale'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-[#0F172A]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                <span className="font-semibold text-[#0F172A]">Havale/EFT</span>
              </div>
              <p className="text-xs text-slate-500">Admin onayı gerekir</p>
            </button>
          </div>
        </div>

        {/* Havale bilgileri */}
        {paymentMethod === 'havale' && (
          <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
            <p className="font-semibold text-slate-700 mb-2">Havale Bilgileri:</p>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Banka</span>
              <span className="font-semibold text-[#0F172A]">{BANK_INFO.bankName}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500">Hesap Sahibi</span>
              <span className="font-medium text-[#0F172A] text-xs leading-tight">{BANK_INFO.accountHolder}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500">IBAN</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-[#0F172A]">{BANK_INFO.iban}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(BANK_INFO.iban.replace(/\s/g, ''));
                    alert('IBAN kopyalandı!');
                  }}
                  className="text-xs bg-white/80 backdrop-blur-xl hover:bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                >
                  Kopyala
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-500">Tutar ({currentPlan.label})</span>
              <span className="font-bold text-[#0F172A]">{currentPlan.price.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !category || !headline}
          className="w-full bg-[#0F172A] text-white py-3.5 rounded-xl font-semibold hover:bg-[#D4AF37] hover:text-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? 'İşleniyor...' : paymentMethod === 'paratika'
            ? `Ödemeye Geç (${currentPlan.price.toLocaleString('tr-TR')} ₺ - ${currentPlan.label})`
            : `Başvuruyu Gönder (${currentPlan.label})`}
        </button>
      </div>
    </div>
  );
}