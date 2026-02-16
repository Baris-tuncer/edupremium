'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '../components/Sidebar';
import { toast } from 'sonner';

interface PremiumPlan {
  id: string;
  plan_key: string;
  label: string;
  days: number;
  price: number;
  per_day: number;
  is_popular: boolean;
  is_active: boolean;
}

interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

interface PlatformSetting {
  value: string;
  type: string;
  description: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  ilkokul: 'İlkokul',
  ortaokul: 'Ortaokul',
  lise: 'Lise',
  lgs: 'LGS',
  'tyt-ayt': 'TYT-AYT',
  'yabanci-dil': 'Yabancı Dil',
};

const ICON_MAP: Record<string, JSX.Element> = {
  home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
  'trending-up': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
  users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  'user-group': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
  percent: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />,
  support: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
  shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
};

export default function PremiumAyarlarPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'features' | 'settings'>('overview');

  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [features, setFeatures] = useState<PremiumFeature[]>([]);
  const [settings, setSettings] = useState<Record<string, PlatformSetting>>({});
  const [stats, setStats] = useState<any>({});

  // Edit modals
  const [editingPlan, setEditingPlan] = useState<PremiumPlan | null>(null);
  const [editingFeature, setEditingFeature] = useState<PremiumFeature | null>(null);
  const [newFeature, setNewFeature] = useState({ title: '', description: '', icon: 'star' });
  const [showNewFeatureForm, setShowNewFeatureForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/premium-settings');
      const data = await res.json();

      if (data.error) {
        // Tablolar henüz yoksa varsayılan değerler kullan
        setPlans([
          { id: '1', plan_key: '30', label: '1 Ay', days: 30, price: 4500, per_day: 150, is_popular: false, is_active: true },
          { id: '2', plan_key: '90', label: '3 Ay', days: 90, price: 12000, per_day: 133, is_popular: true, is_active: true },
          { id: '3', plan_key: '180', label: '6 Ay', days: 180, price: 21000, per_day: 117, is_popular: false, is_active: true },
          { id: '4', plan_key: '365', label: '1 Yıl', days: 365, price: 37000, per_day: 101, is_popular: false, is_active: true },
        ]);
        setFeatures([
          { id: '1', title: 'Ana Sayfa Vitrini', description: 'Ziyaretçilerin ilk gördüğü premium bölümde yer alın', icon: 'home', sort_order: 1, is_active: true },
          { id: '2', title: 'Editörün Seçimi Rozeti', description: 'Profilinizde güven veren altın rozet', icon: 'star', sort_order: 2, is_active: true },
          { id: '3', title: 'Arama Sonuçlarında Üst Sıra', description: 'Öğretmenler sayfasında öncelikli gösterim', icon: 'trending-up', sort_order: 3, is_active: true },
          { id: '4', title: 'Öğrenci Portalı Vitrini', description: 'Kayıtlı öğrencilerin ana ekranında öne çıkın', icon: 'users', sort_order: 4, is_active: true },
          { id: '5', title: 'Grup Dersleri Oluşturma', description: 'Birden fazla öğrenciye aynı anda ders verin', icon: 'user-group', sort_order: 5, is_active: true },
          { id: '6', title: 'Düşük Komisyon Oranı', description: 'Standart %20 yerine sadece %15 komisyon', icon: 'percent', sort_order: 6, is_active: true },
        ]);
        setSettings({
          premium_vat_rate: { value: '20', type: 'number', description: 'KDV oranı (%)' },
          standard_commission_rate: { value: '20', type: 'number', description: 'Standart komisyon (%)' },
          premium_commission_rate: { value: '15', type: 'number', description: 'Premium komisyon (%)' },
        });
        setStats({
          active_premium_count: 0,
          pending_applications: 0,
          total_revenue: 0,
          category_distribution: {},
        });
      } else {
        setPlans(data.plans || []);
        setFeatures(data.features || []);
        setSettings(data.settings || {});
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/premium-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'plan',
          id: editingPlan.id,
          data: editingPlan,
        }),
      });

      if (res.ok) {
        toast.success('Plan güncellendi');
        setEditingPlan(null);
        fetchData();
      } else {
        toast.error('Güncelleme başarısız');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateFeature = async () => {
    if (!editingFeature) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/premium-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feature',
          id: editingFeature.id,
          data: editingFeature,
        }),
      });

      if (res.ok) {
        toast.success('Özellik güncellendi');
        setEditingFeature(null);
        fetchData();
      } else {
        toast.error('Güncelleme başarısız');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFeature = async () => {
    if (!newFeature.title || !newFeature.description) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/premium-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feature',
          data: newFeature,
        }),
      });

      if (res.ok) {
        toast.success('Özellik eklendi');
        setShowNewFeatureForm(false);
        setNewFeature({ title: '', description: '', icon: 'star' });
        fetchData();
      } else {
        toast.error('Ekleme başarısız');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (!confirm('Bu özelliği silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/premium-settings?type=feature&id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Özellik silindi');
        fetchData();
      } else {
        toast.error('Silme başarısız');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      const res = await fetch('/api/admin/premium-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'setting',
          id: key,
          data: { value },
        }),
      });

      if (res.ok) {
        toast.success('Ayar güncellendi');
        fetchData();
      } else {
        toast.error('Güncelleme başarısız');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <AdminSidebar activeItem="premium-ayarlar" />
        <main className="ml-64 p-8">
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <AdminSidebar activeItem="premium-ayarlar" />
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#F5D572] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
            <svg className="w-7 h-7 text-[#0F172A]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 2L1 8l11 13L23 8l-5-6H6zm3.5 1h5l2.5 3h-10l2.5-3zM12 19L3.5 9h17L12 19z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Premium Üyelik Ayarları</h1>
            <p className="text-slate-500">Fiyatlar, özellikler ve komisyon oranları</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { key: 'overview', label: 'Genel Bakış' },
            { key: 'plans', label: 'Fiyat Planları' },
            { key: 'features', label: 'Özellikler' },
            { key: 'settings', label: 'Ayarlar' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'text-[#D4AF37] border-[#D4AF37]'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <span className="text-slate-600 text-sm">Aktif Premium</span>
                </div>
                <p className="text-3xl font-bold text-[#0F172A]">{stats.active_premium_count || 0}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-slate-600 text-sm">Bekleyen Başvuru</span>
                </div>
                <p className="text-3xl font-bold text-[#0F172A]">{stats.pending_applications || 0}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-slate-600 text-sm">Toplam Gelir</span>
                </div>
                <p className="text-3xl font-bold text-[#0F172A]">{(stats.total_revenue || 0).toLocaleString('tr-TR')} ₺</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <span className="text-slate-600 text-sm">Kategori Sayısı</span>
                </div>
                <p className="text-3xl font-bold text-[#0F172A]">{Object.keys(stats.category_distribution || {}).length}</p>
              </div>
            </div>

            {/* Kategori Dağılımı */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">Kategori Dağılımı</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <div key={key} className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#D4AF37]">
                      {stats.category_distribution?.[key] || 0}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mevcut Fiyatlar Özeti */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">Mevcut Fiyat Planları</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {plans.filter(p => p.is_active).map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-xl p-4 text-center ${
                      plan.is_popular
                        ? 'bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border-2 border-[#D4AF37]'
                        : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {plan.is_popular && (
                      <span className="inline-block bg-[#D4AF37] text-[#0F172A] text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                        EN POPÜLER
                      </span>
                    )}
                    <p className="font-bold text-[#0F172A]">{plan.label}</p>
                    <p className="text-2xl font-bold text-[#D4AF37] mt-1">
                      {plan.price.toLocaleString('tr-TR')} ₺
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Günlük {plan.per_day} ₺</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Özellikler Özeti */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">Premium Üyelik Avantajları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.filter(f => f.is_active).map((feature) => (
                  <div key={feature.id} className="flex gap-3 bg-slate-50 rounded-xl p-4">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {ICON_MAP[feature.icon] || ICON_MAP.star}
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#0F172A] text-sm">{feature.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Plans */}
        {activeTab === 'plans' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
            <h3 className="text-lg font-bold text-[#0F172A] mb-4">Fiyat Planları</h3>
            <p className="text-slate-500 text-sm mb-6">
              Premium üyelik fiyatlarını buradan düzenleyebilirsiniz. Fiyatlar KDV hariç olarak girilmelidir.
            </p>

            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    plan.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-[#D4AF37]">{plan.days}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#0F172A]">{plan.label}</p>
                        {plan.is_popular && (
                          <span className="bg-[#D4AF37] text-[#0F172A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            POPÜLER
                          </span>
                        )}
                        {!plan.is_active && (
                          <span className="bg-slate-300 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            PASİF
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{plan.days} gün - Günlük {plan.per_day} ₺</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#0F172A]">{plan.price.toLocaleString('tr-TR')} ₺</p>
                      <p className="text-xs text-slate-400">KDV Hariç</p>
                    </div>
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="px-4 py-2 bg-[#0F172A] text-white rounded-lg hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors"
                    >
                      Düzenle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Features */}
        {activeTab === 'features' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Premium Özellikler</h3>
                <p className="text-slate-500 text-sm">
                  Premium üyelikle gelen avantajları buradan yönetebilirsiniz.
                </p>
              </div>
              <button
                onClick={() => setShowNewFeatureForm(true)}
                className="px-4 py-2 bg-[#D4AF37] text-[#0F172A] rounded-lg font-medium hover:bg-[#D4AF37]/80 transition-colors"
              >
                + Yeni Özellik
              </button>
            </div>

            {showNewFeatureForm && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-emerald-800 mb-3">Yeni Özellik Ekle</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Başlık"
                    value={newFeature.title}
                    onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                    className="px-4 py-2 border border-slate-200 rounded-lg"
                  />
                  <select
                    value={newFeature.icon}
                    onChange={(e) => setNewFeature({ ...newFeature, icon: e.target.value })}
                    className="px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    {Object.keys(ICON_MAP).map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Açıklama"
                    value={newFeature.description}
                    onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                    className="px-4 py-2 border border-slate-200 rounded-lg md:col-span-2"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddFeature}
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving ? 'Ekleniyor...' : 'Ekle'}
                  </button>
                  <button
                    onClick={() => setShowNewFeatureForm(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    feature.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {ICON_MAP[feature.icon] || ICON_MAP.star}
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#0F172A]">{feature.title}</p>
                        {!feature.is_active && (
                          <span className="bg-slate-300 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            PASİF
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{feature.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingFeature(feature)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDeleteFeature(feature.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Komisyon Oranları */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">Komisyon Oranları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Standart Öğretmen Komisyonu (%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      defaultValue={settings.standard_commission_rate?.value || '20'}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg"
                      onBlur={(e) => handleUpdateSetting('standard_commission_rate', e.target.value)}
                    />
                    <span className="flex items-center text-slate-500">%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Normal öğretmenlerden alınan komisyon</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Premium Öğretmen Komisyonu (%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      defaultValue={settings.premium_commission_rate?.value || '15'}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg"
                      onBlur={(e) => handleUpdateSetting('premium_commission_rate', e.target.value)}
                    />
                    <span className="flex items-center text-slate-500">%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Premium öğretmenlerden alınan komisyon</p>
                </div>
              </div>
            </div>

            {/* KDV Oranı */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">Vergi Ayarları</h3>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  KDV Oranı (%)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    defaultValue={settings.premium_vat_rate?.value || '20'}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg"
                    onBlur={(e) => handleUpdateSetting('premium_vat_rate', e.target.value)}
                  />
                  <span className="flex items-center text-slate-500">%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Premium üyelik ödemelerine uygulanan KDV</p>
              </div>
            </div>

            {/* Banka Bilgileri */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">Havale/EFT Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Banka Adı</label>
                  <input
                    type="text"
                    defaultValue={settings.premium_bank_name?.value || 'AKBANK'}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    onBlur={(e) => handleUpdateSetting('premium_bank_name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hesap Sahibi</label>
                  <input
                    type="text"
                    defaultValue={settings.premium_bank_holder?.value || ''}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    onBlur={(e) => handleUpdateSetting('premium_bank_holder', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">IBAN</label>
                  <input
                    type="text"
                    defaultValue={settings.premium_bank_iban?.value || ''}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg font-mono"
                    onBlur={(e) => handleUpdateSetting('premium_bank_iban', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Plan Modal */}
        {editingPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">Plan Düzenle: {editingPlan.label}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plan Adı</label>
                  <input
                    type="text"
                    value={editingPlan.label}
                    onChange={(e) => setEditingPlan({ ...editingPlan, label: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fiyat (₺ KDV Hariç)</label>
                  <input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingPlan.is_popular}
                      onChange={(e) => setEditingPlan({ ...editingPlan, is_popular: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">En Popüler</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingPlan.is_active}
                      onChange={(e) => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">Aktif</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleUpdatePlan}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#0F172A] text-white rounded-lg hover:bg-[#D4AF37] hover:text-[#0F172A] disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Feature Modal */}
        {editingFeature && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">Özellik Düzenle</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
                  <input
                    type="text"
                    value={editingFeature.title}
                    onChange={(e) => setEditingFeature({ ...editingFeature, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                  <input
                    type="text"
                    value={editingFeature.description}
                    onChange={(e) => setEditingFeature({ ...editingFeature, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingFeature.is_active}
                    onChange={(e) => setEditingFeature({ ...editingFeature, is_active: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm">Aktif</span>
                </label>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleUpdateFeature}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#0F172A] text-white rounded-lg hover:bg-[#D4AF37] hover:text-[#0F172A] disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  onClick={() => setEditingFeature(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
