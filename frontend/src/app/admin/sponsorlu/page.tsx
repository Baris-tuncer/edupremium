'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { key: 'ilkokul', label: 'İlkokul' },
  { key: 'ortaokul', label: 'Ortaokul' },
  { key: 'lise', label: 'Lise' },
  { key: 'lgs', label: 'LGS Hazırlık' },
  { key: 'tyt-ayt', label: 'TYT-AYT' },
  { key: 'yabanci-dil', label: 'Yabancı Dil' },
];

interface FeaturedTeacher {
  id: string;
  full_name: string;
  featured_category: string | null;
  featured_headline: string | null;
  featured_until: string | null;
  is_featured: boolean;
  rating: number | null;
  avatar_url: string | null;
  university: string | null;
}

interface Payment {
  id: string;
  teacher_id: string;
  category: string;
  headline: string;
  amount: number;
  plan_days?: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  teacher_profiles?: {
    full_name: string;
    avatar_url: string | null;
    rating: number | null;
  };
}

// Fiyat planları
const PRICING_PLANS = [
  { key: '30', days: 30, price: 4500, label: '1 Ay' },
  { key: '90', days: 90, price: 12000, label: '3 Ay' },
  { key: '180', days: 180, price: 21000, label: '6 Ay' },
  { key: '365', days: 365, price: 37000, label: '1 Yıl' },
];

export default function SponsorluPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'add'>('overview');
  const [featuredTeachers, setFeaturedTeachers] = useState<FeaturedTeacher[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [headline, setHeadline] = useState('');
  const [duration, setDuration] = useState(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Featured öğretmenler
    const { data: featured } = await supabase
      .from('teacher_profiles')
      .select('id, full_name, featured_category, featured_headline, featured_until, is_featured, rating, avatar_url, university')
      .eq('is_featured', true);

    setFeaturedTeachers(featured || []);

    // Ödeme başvuruları
    const { data: paymentData } = await supabase
      .from('featured_payments')
      .select('*, teacher_profiles(full_name, avatar_url, rating)')
      .order('created_at', { ascending: false });

    setPayments(paymentData || []);

    // Tüm öğretmenler (ekleme formu için)
    const { data: teachers } = await supabase
      .from('teacher_profiles')
      .select('id, full_name, is_verified, rating')
      .eq('is_verified', true)
      .order('full_name');

    setAllTeachers(teachers || []);

    setLoading(false);
  };

  // Kategorideki dolu slot sayısı
  const getSlotCount = (categoryKey: string) => {
    const now = new Date().toISOString();
    return featuredTeachers.filter(t => 
      t.featured_category === categoryKey && 
      t.featured_until && 
      t.featured_until > now
    ).length;
  };

  // Manuel ekleme (admin tarafından)
  const handleAddFeatured = async () => {
    if (!selectedTeacher || !selectedCategory || !headline) {
      alert('Tüm alanları doldurun.');
      return;
    }

    setSaving(true);

    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + duration);

    // teacher_profiles güncelle (featured + verified)
    const { error: updateError } = await supabase
      .from('teacher_profiles')
      .update({
        is_featured: true,
        is_verified: true,
        featured_category: selectedCategory,
        featured_headline: headline,
        featured_until: endsAt.toISOString(),
      })
      .eq('id', selectedTeacher);

    if (updateError) {
      alert('Hata: ' + updateError.message);
      setSaving(false);
      return;
    }

    // Seçilen plana göre fiyat bul
    const selectedPlan = PRICING_PLANS.find(p => p.days === duration) || PRICING_PLANS[0];

    // Ödeme kaydı oluştur
    await supabase.from('featured_payments').insert({
      teacher_id: selectedTeacher,
      category: selectedCategory,
      headline: headline,
      amount: selectedPlan.price,
      plan_days: duration,
      payment_method: 'admin',
      payment_status: 'completed',
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    });

    alert('Öğretmen başarıyla öne çıkarıldı!');
    setSelectedTeacher('');
    setSelectedCategory('');
    setHeadline('');
    setSaving(false);
    fetchData();
    setActiveTab('overview');
  };

  // Featured kaldır
  const handleRemoveFeatured = async (teacherId: string) => {
    if (!confirm('Bu öğretmenin sponsorluğunu kaldırmak istediğinize emin misiniz?')) return;

    await supabase
      .from('teacher_profiles')
      .update({
        is_featured: false,
        featured_category: null,
        featured_headline: null,
        featured_until: null,
      })
      .eq('id', teacherId);

    fetchData();
  };

  // Havale onayı
  const handleApprovePayment = async (payment: Payment) => {
    const startsAt = new Date();
    const endsAt = new Date();
    const planDays = payment.plan_days || 30; // Varsayılan 30 gün
    endsAt.setDate(endsAt.getDate() + planDays);

    // Ödemeyi onayla
    await supabase
      .from('featured_payments')
      .update({
        payment_status: 'completed',
        approved_at: new Date().toISOString(),
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
      })
      .eq('id', payment.id);

    // Öğretmeni featured yap ve otomatik onayla
    await supabase
      .from('teacher_profiles')
      .update({
        is_featured: true,
        is_verified: true,
        featured_category: payment.category,
        featured_headline: payment.headline,
        featured_until: endsAt.toISOString(),
      })
      .eq('id', payment.teacher_id);

    alert('Ödeme onaylandı, öğretmen onaylandı ve öne çıkarıldı!');
    fetchData();
  };

  // Havale reddi
  const handleRejectPayment = async (paymentId: string) => {
    if (!confirm('Bu ödemeyi reddetmek istediğinize emin misiniz?')) return;

    await supabase
      .from('featured_payments')
      .update({ payment_status: 'rejected' })
      .eq('id', paymentId);

    fetchData();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isExpired = (date: string | null) => {
    if (!date) return true;
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sponsorlu Vitrin Yönetimi</h1>
          <p className="text-slate-500 mt-1">Editörün Seçimi öğretmenlerini yönetin</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { key: 'overview', label: 'Genel Bakış' },
          { key: 'payments', label: 'Ödeme Başvuruları' },
          { key: 'add', label: '+ Öğretmen Ekle' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-[#0F172A] text-white'
                : 'bg-white/80 backdrop-blur-xl text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Genel Bakış */}
      {activeTab === 'overview' && (
        <div>
          {/* Kategori Durumu */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {CATEGORIES.map(cat => {
              const count = getSlotCount(cat.key);
              return (
                <div key={cat.key} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{cat.label}</h3>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                      count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count} öğretmen
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Aktif Öğretmenler */}
          <h2 className="text-lg font-bold text-slate-900 mb-4">Aktif Sponsorlu Öğretmenler ({featuredTeachers.length})</h2>
          {featuredTeachers.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-8 text-center">
              <p className="text-slate-500">Henüz sponsorlu öğretmen yok.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {featuredTeachers.map(teacher => (
                <div key={teacher.id} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg shadow-[#0F172A]/5 p-4 flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    {teacher.avatar_url ? (
                      <img src={teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
                        {teacher.full_name?.[0]}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm">{teacher.full_name}</h3>
                    <p className="text-xs text-slate-500 truncate">{teacher.featured_headline}</p>
                  </div>

                  {/* Category & Expiry */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      {CATEGORIES.find(c => c.key === teacher.featured_category)?.label || teacher.featured_category}
                    </span>
                    {isExpired(teacher.featured_until) ? (
                      <span className="text-red-500 text-xs font-medium">Süresi Dolmuş</span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {formatDate(teacher.featured_until!)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleRemoveFeatured(teacher.id)}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0"
                    title="Kaldır"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Ödeme Başvuruları */}
      {activeTab === 'payments' && (
        <div>
          {payments.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-8 text-center">
              <p className="text-slate-500">Henüz ödeme başvurusu yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map(payment => (
                <div key={payment.id} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-5 flex items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">
                      {payment.teacher_profiles?.full_name || 'Bilinmeyen'}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">{payment.headline}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(payment.created_at)} • {payment.payment_method === 'havale' ? 'Havale/EFT' : payment.payment_method === 'paratika' ? 'Kredi Kartı' : 'Admin'}
                    </p>
                  </div>

                  {/* Category */}
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                    {CATEGORIES.find(c => c.key === payment.category)?.label || payment.category}
                  </span>

                  {/* Amount & Plan */}
                  <div className="text-right">
                    <span className="font-bold text-slate-900">₺{payment.amount.toLocaleString('tr-TR')}</span>
                    <p className="text-xs text-slate-500">{payment.plan_days || 30} gün</p>
                  </div>

                  {/* Status */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    payment.payment_status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    payment.payment_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {payment.payment_status === 'completed' ? 'Onaylı' :
                     payment.payment_status === 'pending' ? 'Bekliyor' : 'Reddedildi'}
                  </span>

                  {/* Actions for pending */}
                  {payment.payment_status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprovePayment(payment)}
                        className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-600"
                      >
                        Onayla
                      </button>
                      <button
                        onClick={() => handleRejectPayment(payment.id)}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600"
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Öğretmen Ekle */}
      {activeTab === 'add' && (
        <div className="max-w-xl">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Manuel Öğretmen Ekle</h2>
            <p className="text-sm text-slate-500">Ödeme alındıktan sonra öğretmeni buradan öne çıkarabilirsiniz.</p>

            {/* Öğretmen Seç */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Öğretmen</label>
              <select
                value={selectedTeacher}
                onChange={e => setSelectedTeacher(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              >
                <option value="">Öğretmen seçin...</option>
                {allTeachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} {t.rating ? `(★ ${t.rating})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              >
                <option value="">Kategori seçin...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Slogan */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Slogan / Başlık</label>
              <input
                type="text"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder='Örn: "LGS Matematik Uzmanı - %95 Başarı Oranı"'
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                maxLength={100}
              />
              <p className="text-xs text-slate-400 mt-1">{headline.length}/100 karakter</p>
            </div>

            {/* Süre */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Süre</label>
              <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              >
                {PRICING_PLANS.map(plan => (
                  <option key={plan.key} value={plan.days}>
                    {plan.label} ({plan.days} gün) - {plan.price.toLocaleString('tr-TR')} ₺
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              onClick={handleAddFeatured}
              disabled={saving || !selectedTeacher || !selectedCategory || !headline}
              className="w-full bg-[#0F172A] text-white py-3 rounded-lg font-semibold hover:bg-[#D4AF37] hover:text-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Ekleniyor...' : 'Öğretmeni Öne Çıkar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}