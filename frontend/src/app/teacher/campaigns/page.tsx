'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  calculatePackagePrice,
  calculateBonusPackage,
  CAMPAIGN_TYPES,
  PACKAGE_CONSTANTS,
} from '@/lib/package-calculator';

interface Campaign {
  id: string;
  type: string;
  name: string;
  description: string | null;
  lesson_count: number;
  discount_percent: number;
  bonus_lessons: number;
  net_price_per_lesson: number;
  single_lesson_display_price: number;
  package_total_price: number;
  teacher_total_earnings: number;
  purchase_count: number;
  is_active: boolean;
  ends_at: string;
  created_at: string;
}

export default function CampaignsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [formType, setFormType] = useState<'package_discount' | 'bonus_lesson'>('package_discount');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLessonCount, setFormLessonCount] = useState(10);
  const [formDiscountPercent, setFormDiscountPercent] = useState(15);
  const [formBonusLessons, setFormBonusLessons] = useState(1);
  const [formEndsAt, setFormEndsAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      .select('*, is_featured, hourly_rate_net, commission_rate')
      .eq('id', user.id)
      .single();

    setProfile(profileData);

    // Kampanyaları al
    const { data: campaignsData } = await supabase
      .from('campaigns')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    setCampaigns(campaignsData || []);

    // Default bitiş tarihi: 30 gün sonra
    const defaultEnd = new Date();
    defaultEnd.setDate(defaultEnd.getDate() + 30);
    setFormEndsAt(defaultEnd.toISOString().split('T')[0]);

    setLoading(false);
  };

  const calculatePreview = () => {
    if (!profile?.hourly_rate_net) return null;
    const commissionRate = profile.commission_rate || 0.25;

    if (formType === 'package_discount') {
      return calculatePackagePrice(
        profile.hourly_rate_net,
        formLessonCount,
        formDiscountPercent,
        commissionRate
      );
    } else {
      return calculateBonusPackage(
        profile.hourly_rate_net,
        formLessonCount,
        formBonusLessons,
        commissionRate
      );
    }
  };

  const handleCreateCampaign = async () => {
    if (!formName || !formEndsAt) {
      setErrorMessage('Kampanya adı ve bitiş tarihi gereklidir');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setErrorMessage('Oturum hatası');
        return;
      }

      const response = await fetch('/api/packages/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: formType,
          name: formName,
          description: formDescription || null,
          lessonCount: formLessonCount,
          discountPercent: formType === 'package_discount' ? formDiscountPercent : 0,
          bonusLessons: formType === 'bonus_lesson' ? formBonusLessons : 0,
          endsAt: new Date(formEndsAt).toISOString(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateModal(false);
        resetForm();
        fetchData();
      } else {
        setErrorMessage(result.error || 'Kampanya oluşturulamadı');
      }
    } catch (err) {
      setErrorMessage('Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (campaignId: string, currentStatus: boolean) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    await fetch('/api/packages/campaigns', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        campaignId,
        is_active: !currentStatus,
      }),
    });

    fetchData();
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) return;

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    await fetch(`/api/packages/campaigns?campaignId=${campaignId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    fetchData();
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormLessonCount(10);
    setFormDiscountPercent(15);
    setFormBonusLessons(1);
    setFormType('package_discount');
    const defaultEnd = new Date();
    defaultEnd.setDate(defaultEnd.getDate() + 30);
    setFormEndsAt(defaultEnd.toISOString().split('T')[0]);
  };

  const preview = calculatePreview();

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Premium Vitrin üyesi değilse
  if (!profile?.is_featured) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Kampanyalarım</h1>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 2L1 8l11 13L23 8l-5-6H6zm3.5 1h5l2.5 3h-10l2.5-3zM12 19L3.5 9h17L12 19z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Premium Vitrin Gerekli</h2>
          <p className="text-slate-600 mb-6">Kampanya oluşturmak için Premium Vitrin üyesi olmanız gerekmektedir.</p>
          <a
            href="/teacher/one-cik"
            className="inline-block bg-[#D4AF37] text-[#0F172A] px-6 py-3 rounded-xl font-semibold hover:bg-[#c4a030] transition-colors"
          >
            Premium Vitrin'e Geç
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#F5D572] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
            <svg className="w-6 h-6 text-[#0F172A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Kampanyalarım</h1>
            <p className="text-slate-600 text-sm">Paket indirimleri ve bonus ders kampanyaları</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kampanya
        </button>
      </div>

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/50">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Henüz kampanya yok</h3>
          <p className="text-slate-600 mb-4">Öğrencilerinize cazip paketler sunmak için kampanya oluşturun.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-[#D4AF37] font-medium hover:underline"
          >
            İlk kampanyanızı oluşturun
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => {
            const isExpired = new Date(campaign.ends_at) < new Date();
            const totalLessons = campaign.lesson_count + campaign.bonus_lessons;

            return (
              <div
                key={campaign.id}
                className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                  campaign.is_active && !isExpired
                    ? 'border-[#D4AF37]/30 shadow-lg'
                    : 'border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-[#0F172A]">{campaign.name}</h3>
                      {campaign.is_active && !isExpired ? (
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      ) : isExpired ? (
                        <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          Süresi Doldu
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
                          Pasif
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        campaign.type === 'package_discount'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {campaign.type === 'package_discount' ? 'İndirim Paketi' : 'Bonus Ders'}
                      </span>
                    </div>

                    {campaign.description && (
                      <p className="text-slate-600 text-sm mb-3">{campaign.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Toplam Ders:</span>
                        <span className="ml-1 font-semibold text-[#0F172A]">
                          {totalLessons}
                          {campaign.bonus_lessons > 0 && (
                            <span className="text-emerald-600 text-xs ml-1">(+{campaign.bonus_lessons} bonus)</span>
                          )}
                        </span>
                      </div>
                      {campaign.discount_percent > 0 && (
                        <div>
                          <span className="text-slate-500">İndirim:</span>
                          <span className="ml-1 font-semibold text-[#D4AF37]">%{campaign.discount_percent}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-500">Fiyat:</span>
                        <span className="ml-1 font-semibold text-[#0F172A]">
                          {campaign.package_total_price.toLocaleString('tr-TR')} TL
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Kazancınız:</span>
                        <span className="ml-1 font-semibold text-emerald-600">
                          {campaign.teacher_total_earnings.toLocaleString('tr-TR')} TL
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Satış:</span>
                        <span className="ml-1 font-semibold text-[#0F172A]">{campaign.purchase_count}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Bitiş:</span>
                        <span className="ml-1 font-medium text-slate-700">
                          {new Date(campaign.ends_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(campaign.id, campaign.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        campaign.is_active
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                      title={campaign.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                    >
                      {campaign.is_active ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                    {campaign.purchase_count === 0 && (
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        title="Sil"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0F172A]">Yeni Kampanya Oluştur</h2>
                <button
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Kampanya Tipi */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Kampanya Tipi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormType('package_discount')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formType === 'package_discount'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="font-semibold text-[#0F172A]">İndirim Paketi</span>
                    </div>
                    <p className="text-xs text-slate-500">Örn: 10 ders %15 indirimli</p>
                  </button>
                  <button
                    onClick={() => setFormType('bonus_lesson')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formType === 'bonus_lesson'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      <span className="font-semibold text-[#0F172A]">Bonus Ders</span>
                    </div>
                    <p className="text-xs text-slate-500">Örn: 5 al 1 hediye</p>
                  </button>
                </div>
              </div>

              {/* Kampanya Adı */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kampanya Adı</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Örn: LGS Matematik Paketi"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  maxLength={100}
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Açıklama (Opsiyonel)</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Kampanya hakkında kısa açıklama..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] resize-none"
                  rows={2}
                  maxLength={300}
                />
              </div>

              {/* Ders Sayısı */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ders Sayısı ({PACKAGE_CONSTANTS.MIN_LESSONS}-{PACKAGE_CONSTANTS.MAX_LESSONS})
                </label>
                <input
                  type="number"
                  value={formLessonCount}
                  onChange={e => setFormLessonCount(Math.min(PACKAGE_CONSTANTS.MAX_LESSONS, Math.max(PACKAGE_CONSTANTS.MIN_LESSONS, parseInt(e.target.value) || PACKAGE_CONSTANTS.MIN_LESSONS)))}
                  min={PACKAGE_CONSTANTS.MIN_LESSONS}
                  max={PACKAGE_CONSTANTS.MAX_LESSONS}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>

              {/* İndirim veya Bonus */}
              {formType === 'package_discount' ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    İndirim Oranı (%5-%{PACKAGE_CONSTANTS.MAX_DISCOUNT_PERCENT})
                  </label>
                  <input
                    type="number"
                    value={formDiscountPercent}
                    onChange={e => setFormDiscountPercent(Math.min(PACKAGE_CONSTANTS.MAX_DISCOUNT_PERCENT, Math.max(5, parseInt(e.target.value) || 5)))}
                    min={5}
                    max={PACKAGE_CONSTANTS.MAX_DISCOUNT_PERCENT}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Hediye Ders Sayısı (1-{PACKAGE_CONSTANTS.MAX_BONUS_LESSONS})
                  </label>
                  <input
                    type="number"
                    value={formBonusLessons}
                    onChange={e => setFormBonusLessons(Math.min(PACKAGE_CONSTANTS.MAX_BONUS_LESSONS, Math.max(1, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={PACKAGE_CONSTANTS.MAX_BONUS_LESSONS}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                </div>
              )}

              {/* Bitiş Tarihi */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kampanya Bitiş Tarihi</label>
                <input
                  type="date"
                  value={formEndsAt}
                  onChange={e => setFormEndsAt(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>

              {/* Fiyat Önizleme */}
              {preview && (
                <div className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-xl p-5 text-white">
                  <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-3">Fiyat Önizleme</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Toplam Ders</span>
                      <p className="font-bold text-lg">
                        {preview.totalLessons}
                        {preview.bonusLessons > 0 && (
                          <span className="text-emerald-400 text-sm ml-1">(+{preview.bonusLessons} bonus)</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-white/60">Tekil Ders Fiyatı</span>
                      <p className="font-bold text-lg">{preview.singleLessonDisplayPrice.toLocaleString('tr-TR')} TL</p>
                    </div>
                    <div>
                      <span className="text-white/60">Paket Fiyatı (Veli Öder)</span>
                      <p className="font-bold text-xl text-[#D4AF37]">{preview.packageTotalPrice.toLocaleString('tr-TR')} TL</p>
                    </div>
                    <div>
                      <span className="text-white/60">Sizin Kazancınız</span>
                      <p className="font-bold text-xl text-emerald-400">{preview.teacherTotalEarnings.toLocaleString('tr-TR')} TL</p>
                    </div>
                  </div>
                  {preview.discountPercent > 0 && (
                    <p className="text-white/60 text-xs mt-3">
                      İndirim %{preview.discountPercent} - Normal: {(preview.singleLessonDisplayPrice * preview.lessonCount).toLocaleString('tr-TR')} TL
                    </p>
                  )}
                </div>
              )}

              {/* Error */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 text-sm text-center">{errorMessage}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleCreateCampaign}
                disabled={submitting || !formName || !formEndsAt}
                className="flex-1 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-[#D4AF37] hover:text-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Oluşturuluyor...' : 'Kampanya Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
