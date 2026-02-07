'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

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
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedIban, setCopiedIban] = useState(false);

  const currentPlan = PRICING_PLANS.find(p => p.key === selectedPlan) || PRICING_PLANS[1];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createClient();
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

  const copyIban = () => {
    navigator.clipboard.writeText(BANK_INFO.iban.replace(/\s/g, ''));
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleSubmit = async () => {
    if (!category || !headline || !user) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const supabase = createClient();

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
          setErrorMessage('Hata: ' + error.message);
          return;
        }

        setSubmitted(true);
        fetchData();
      } else {
        // Paratika ile ödeme - Auth token al
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setErrorMessage('Oturum hatası. Lütfen tekrar giriş yapın.');
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
          setErrorMessage('Ödeme oturumu oluşturulamadı. Lütfen tekrar deneyin.');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setErrorMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
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
                  onClick={copyIban}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors"
                >
                  {copiedIban ? '✓ Kopyalandı' : 'Kopyala'}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-slate-500">Tutar</span>
              <div className="text-right">
                <span className="font-bold text-[#0F172A] text-lg">{Math.round(currentPlan.price * 1.20).toLocaleString('tr-TR')} ₺</span>
                <span className="block text-[10px] text-slate-400">(KDV Dahil)</span>
              </div>
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
    <div className="p-8 max-w-3xl mx-auto">
      {/* Başlık */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#F5D572] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
          <svg className="w-6 h-6 text-[#0F172A]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 2L1 8l11 13L23 8l-5-6H6zm3.5 1h5l2.5 3h-10l2.5-3zM12 19L3.5 9h17L12 19z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Premium Vitrin</h1>
          <span className="inline-block bg-[#D4AF37] text-[#0F172A] text-[10px] font-bold px-2 py-0.5 rounded mt-1">PRO ÜYELİK</span>
        </div>
      </div>
      <p className="text-slate-600 mb-8 ml-16">Profilinizi binlerce öğrenciye öne çıkarın ve ders taleplerinizi katlayın.</p>

      {/* Nedir ve Avantajlar */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        {/* Dekoratif elementler */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 text-[#D4AF37]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 2L1 8l11 13L23 8l-5-6H6zm3.5 1h5l2.5 3h-10l2.5-3zM12 19L3.5 9h17L12 19z" />
            </svg>
            <div>
              <h2 className="text-xl font-bold">Premium Vitrin Nedir?</h2>
              <p className="text-white/60 text-sm">Editörün Seçimi Programı</p>
            </div>
          </div>

          <p className="text-white/80 text-sm mb-6 leading-relaxed">
            Premium Vitrin, profilinizi EduPremium'un en görünür alanlarına taşıyarak öğrenci erişiminizi maksimize eder.
            Seçtiğiniz kategoride "Editörün Seçimi" rozetiyle öne çıkar, güvenilirliğinizi ve görünürlüğünüzü artırırsınız.
          </p>

          <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4">Üyelik Avantajları</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3 bg-white/5 rounded-xl p-3">
              <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Ana Sayfa Vitrini</p>
                <p className="text-white/50 text-xs">Ziyaretçilerin ilk gördüğü premium bölümde yer alın</p>
              </div>
            </div>

            <div className="flex gap-3 bg-white/5 rounded-xl p-3">
              <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Editörün Seçimi Rozeti</p>
                <p className="text-white/50 text-xs">Profilinizde güven veren altın rozet</p>
              </div>
            </div>

            <div className="flex gap-3 bg-white/5 rounded-xl p-3">
              <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Arama Sonuçlarında Üst Sıra</p>
                <p className="text-white/50 text-xs">Öğretmenler sayfasında öncelikli gösterim</p>
              </div>
            </div>

            <div className="flex gap-3 bg-white/5 rounded-xl p-3">
              <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Öğrenci Portalı Vitrini</p>
                <p className="text-white/50 text-xs">Kayıtlı öğrencilerin ana ekranında öne çıkın</p>
              </div>
            </div>

            <div className="flex gap-3 bg-white/5 rounded-xl p-3">
              <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Öncelikli Destek</p>
                <p className="text-white/50 text-xs">Sorularınıza hızlı yanıt garantisi</p>
              </div>
            </div>

            <div className="flex gap-3 bg-white/5 rounded-xl p-3">
              <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Güvenilirlik Artışı</p>
                <p className="text-white/50 text-xs">Velilerin gözünde daha güvenilir profil</p>
              </div>
            </div>
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
                <p className="text-[10px] text-slate-400">(+KDV)</p>
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
                    copyIban();
                  }}
                  className="text-xs bg-white/80 backdrop-blur-xl hover:bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                >
                  {copiedIban ? '✓ Kopyalandı' : 'Kopyala'}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-500">Tutar ({currentPlan.label})</span>
              <div className="text-right">
                <span className="font-bold text-[#0F172A]">{Math.round(currentPlan.price * 1.20).toLocaleString('tr-TR')} ₺</span>
                <span className="block text-[10px] text-slate-400">(KDV Dahil)</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm text-center">{errorMessage}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !category || !headline}
          className="w-full bg-[#0F172A] text-white py-3.5 rounded-xl font-semibold hover:bg-[#D4AF37] hover:text-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? 'İşleniyor...' : paymentMethod === 'paratika'
            ? `Ödemeye Geç (${Math.round(currentPlan.price * 1.20).toLocaleString('tr-TR')} ₺ KDV Dahil)`
            : `Başvuruyu Gönder (${currentPlan.label})`}
        </button>
      </div>
    </div>
  );
}