'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { calculatePriceFromNet, getCommissionRate, formatPrice } from '@/lib/price-calculator';

interface GroupClass {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  scheduled_at: string;
  duration_minutes: number;
  min_capacity: number;
  max_capacity: number;
  net_price: number;
  display_price: number;
  status: string;
  meeting_link: string | null;
  enrollment_deadline: string;
  created_at: string;
  enrolled_count: number;
  spots_left: number;
  total_earnings: number;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profile_photo_url: string | null;
}

interface Enrollment {
  id: string;
  student_id: string;
  amount_paid: number;
  payment_status: string;
  status: string;
  created_at: string;
  student: Student;
}

const SUBJECTS = [
  'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Turkce', 'Edebiyat',
  'Tarih', 'Cografya', 'Ingilizce', 'Almanca', 'Fransizca', 'Felsefe',
];

export default function TeacherGroupClassesPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [classes, setClasses] = useState<GroupClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<GroupClass | null>(null);
  const [students, setStudents] = useState<Enrollment[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formScheduledAt, setFormScheduledAt] = useState('');
  const [formDuration, setFormDuration] = useState(60);
  const [formNetPrice, setFormNetPrice] = useState(500);

  // Sabit kapasite değerleri
  const MIN_CAPACITY = 3;
  const MAX_CAPACITY = 20;
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

    const { data: profileData } = await supabase
      .from('teacher_profiles')
      .select('*, is_featured, total_lessons_completed')
      .eq('id', user.id)
      .single();

    setProfile(profileData);

    // Grup derslerini al
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      const response = await fetch('/api/group-classes/teacher', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const result = await response.json();
      if (result.classes) {
        setClasses(result.classes);
        setStats(result.stats);
      }
    }

    // Default tarih: 3 gün sonra saat 14:00
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    defaultDate.setHours(14, 0, 0, 0);
    setFormScheduledAt(defaultDate.toISOString().slice(0, 16));

    setLoading(false);
  };

  const calculatePreview = () => {
    if (!profile || !formNetPrice) return null;
    const commissionRate = getCommissionRate(profile.total_lessons_completed || 0);
    return calculatePriceFromNet(formNetPrice, commissionRate);
  };

  const handleCreateClass = async () => {
    if (!formTitle || !formSubject || !formScheduledAt || !formNetPrice) {
      setErrorMessage('Tum zorunlu alanları doldurun');
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

      const response = await fetch('/api/group-classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription || null,
          subject: formSubject,
          scheduled_at: new Date(formScheduledAt).toISOString(),
          duration_minutes: formDuration,
          net_price: formNetPrice,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateModal(false);
        resetForm();
        fetchData();
      } else {
        setErrorMessage(result.error || 'Sınıf olusturulamadı');
      }
    } catch (err) {
      setErrorMessage('Bir hata olustu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClass = async (classId: string) => {
    if (!confirm('Bu sınıfı iptal etmek istediginizden emin misiniz? Tum ogrencilere iade yapılacaktır.')) return;

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    await fetch(`/api/group-classes/${classId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    fetchData();
  };

  const handleViewStudents = async (groupClass: GroupClass) => {
    setSelectedClass(groupClass);
    setShowStudentsModal(true);
    setLoadingStudents(true);

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
      const response = await fetch(`/api/group-classes/${groupClass.id}/students`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const result = await response.json();
      setStudents(result.enrollments || []);
    }

    setLoadingStudents(false);
  };

  const handleJoinMeeting = async (groupClass: GroupClass) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    const response = await fetch(`/api/group-classes/${groupClass.id}/meeting-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();
    if (result.meetingUrl) {
      window.open(result.meetingUrl, '_blank');
    } else {
      alert(result.error || 'Toplantı linki alınamadı');
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormSubject('');
    setFormDuration(60);
    setFormNetPrice(500);
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    defaultDate.setHours(14, 0, 0, 0);
    setFormScheduledAt(defaultDate.toISOString().slice(0, 16));
  };

  const preview = calculatePreview();

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'open': 'bg-blue-100 text-blue-700',
      'confirmed': 'bg-emerald-100 text-emerald-700',
      'completed': 'bg-slate-100 text-slate-700',
      'cancelled': 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      'open': 'Kayıt Acık',
      'confirmed': 'Onaylandı',
      'completed': 'Tamamlandı',
      'cancelled': 'Iptal',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-slate-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Premium Vitrin uyesi degilse
  if (!profile?.is_featured) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Grup Derslerim</h1>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Premium Vitrin Gerekli</h2>
          <p className="text-slate-600 mb-6">Grup dersi olusturmak icin Premium Vitrin uyesi olmanız gerekmektedir.</p>
          <a
            href="/teacher/one-cik"
            className="inline-block bg-[#D4AF37] text-[#0F172A] px-6 py-3 rounded-xl font-semibold hover:bg-[#c4a030] transition-colors"
          >
            Premium Vitrine Gec
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#F5D572] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
            <svg className="w-6 h-6 text-[#0F172A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Grup Derslerim</h1>
            <p className="text-slate-600 text-sm">Grup dersleri olusturun ve yonetin</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Grup Dersi
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/50">
            <p className="text-slate-500 text-sm">Toplam Sınıf</p>
            <p className="text-2xl font-bold text-[#0F172A]">{stats.total_classes}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/50">
            <p className="text-slate-500 text-sm">Aktif Sınıflar</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.open_classes + stats.confirmed_classes}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/50">
            <p className="text-slate-500 text-sm">Toplam Ogrenci</p>
            <p className="text-2xl font-bold text-[#0F172A]">{stats.total_students}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/50">
            <p className="text-slate-500 text-sm">Toplam Kazanc</p>
            <p className="text-2xl font-bold text-[#D4AF37]">{formatPrice(stats.total_earnings)}</p>
          </div>
        </div>
      )}

      {/* Class List */}
      {classes.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/50">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Henuz grup dersi yok</h3>
          <p className="text-slate-600 mb-4">Birden fazla ogrenciyle ayni anda ders yaparak daha fazla kazanın.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-[#D4AF37] font-medium hover:underline"
          >
            Ilk grup dersinizi olusturun
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {classes.map((groupClass) => {
            const scheduledDate = new Date(groupClass.scheduled_at);
            const isUpcoming = scheduledDate > new Date();
            const canJoin = groupClass.status === 'confirmed' && isUpcoming;

            return (
              <div
                key={groupClass.id}
                className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                  groupClass.status === 'open' || groupClass.status === 'confirmed'
                    ? 'border-[#D4AF37]/30 shadow-lg'
                    : 'border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-[#0F172A]">{groupClass.title}</h3>
                      {getStatusBadge(groupClass.status)}
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        {groupClass.subject}
                      </span>
                    </div>

                    {groupClass.description && (
                      <p className="text-slate-600 text-sm mb-3">{groupClass.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Tarih:</span>
                        <span className="ml-1 font-semibold text-[#0F172A]">
                          {scheduledDate.toLocaleDateString('tr-TR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Sure:</span>
                        <span className="ml-1 font-semibold text-[#0F172A]">{groupClass.duration_minutes} dk</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Kayıt:</span>
                        <span className="ml-1 font-semibold text-[#0F172A]">
                          {groupClass.enrolled_count}/{groupClass.max_capacity}
                          {groupClass.enrolled_count < groupClass.min_capacity && (
                            <span className="text-amber-600 text-xs ml-1">
                              (min {groupClass.min_capacity})
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Fiyat:</span>
                        <span className="ml-1 font-semibold text-[#0F172A]">{formatPrice(groupClass.display_price)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Kazancınız:</span>
                        <span className="ml-1 font-semibold text-emerald-600">{formatPrice(groupClass.total_earnings)}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            groupClass.enrolled_count >= groupClass.min_capacity
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${(groupClass.enrolled_count / groupClass.max_capacity) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {groupClass.spots_left} kisi daha katılabilir
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Ogrencileri gor */}
                    <button
                      onClick={() => handleViewStudents(groupClass)}
                      className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Ogrencileri Gor"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </button>

                    {/* Derse katıl */}
                    {canJoin && (
                      <button
                        onClick={() => handleJoinMeeting(groupClass)}
                        className="p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                        title="Derse Katıl"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    )}

                    {/* Iptal et */}
                    {(groupClass.status === 'open' || groupClass.status === 'confirmed') && isUpcoming && (
                      <button
                        onClick={() => handleCancelClass(groupClass.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        title="Iptal Et"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0F172A]">Yeni Grup Dersi Olustur</h2>
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
              {/* Baslik */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ders Basligi *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Orn: LGS Matematik Kamp"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  maxLength={100}
                />
              </div>

              {/* Acıklama */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Acıklama</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Ders hakkında kısa acıklama..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] resize-none"
                  rows={2}
                  maxLength={300}
                />
              </div>

              {/* Konu */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Konu *</label>
                <select
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                >
                  <option value="">Konu secin...</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Tarih ve Saat */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tarih ve Saat *</label>
                <input
                  type="datetime-local"
                  value={formScheduledAt}
                  onChange={e => setFormScheduledAt(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
                <p className="text-xs text-slate-500 mt-1">En az 48 saat sonrası olmalıdır</p>
              </div>

              {/* Sure */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ders Suresi (dakika)</label>
                <select
                  value={formDuration}
                  onChange={e => setFormDuration(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                >
                  <option value={30}>30 dakika</option>
                  <option value={45}>45 dakika</option>
                  <option value={60}>60 dakika</option>
                  <option value={90}>90 dakika</option>
                  <option value={120}>120 dakika</option>
                </select>
              </div>

              {/* Kapasite (Sabit) */}
              <div className="bg-slate-50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kapasite</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Minimum:</span>
                    <span className="font-bold text-[#0F172A]">{MIN_CAPACITY} kisi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Maksimum:</span>
                    <span className="font-bold text-[#0F172A]">{MAX_CAPACITY} kisi</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Minimum {MIN_CAPACITY} ogrenci kayıt olmazsa ders iptal edilir.</p>
              </div>

              {/* Fiyat */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kisi Bası Net Fiyat (TL) *</label>
                <input
                  type="number"
                  value={formNetPrice}
                  onChange={e => setFormNetPrice(Math.max(500, parseInt(e.target.value) || 500))}
                  min={500}
                  step={50}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
                <p className="text-xs text-slate-500 mt-1">Her ogrenci basına cebinize kalacak net tutar (min 500 TL)</p>
              </div>

              {/* Fiyat Onizleme */}
              {preview && (
                <div className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-xl p-5 text-white">
                  <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-3">Fiyat Onizleme</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Net Fiyatınız</span>
                      <p className="font-bold text-lg">{formatPrice(preview.netPrice)}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Ogrenci Oder</span>
                      <p className="font-bold text-lg text-[#D4AF37]">{formatPrice(preview.displayPrice)}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Min Kazanc ({MIN_CAPACITY} kisi)</span>
                      <p className="font-bold text-emerald-400">{formatPrice(preview.netPrice * MIN_CAPACITY)}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Max Kazanc ({MAX_CAPACITY} kisi)</span>
                      <p className="font-bold text-emerald-400">{formatPrice(preview.netPrice * MAX_CAPACITY)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bilgi notu */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-700 text-sm">
                  <strong>Not:</strong> Minimum {MIN_CAPACITY} ogrenci kayıt olmazsa ders otomatik iptal edilir ve odemeler iade edilir.
                  Kayıt icin son tarih ders saatinden 24 saat oncesidir.
                </p>
              </div>

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
                Iptal
              </button>
              <button
                onClick={handleCreateClass}
                disabled={submitting || !formTitle || !formSubject || !formScheduledAt || !formNetPrice}
                className="flex-1 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-[#D4AF37] hover:text-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Olusturuluyor...' : 'Grup Dersi Olustur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {showStudentsModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0F172A]">Kayıtlı Ogrenciler</h2>
                  <p className="text-slate-500 text-sm">{selectedClass.title}</p>
                </div>
                <button
                  onClick={() => { setShowStudentsModal(false); setSelectedClass(null); setStudents([]); }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingStudents ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">Henuz kayıtlı ogrenci yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students
                    .filter(e => e.payment_status === 'completed' && e.status === 'enrolled')
                    .map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                      >
                        {enrollment.student.profile_photo_url ? (
                          <img
                            src={enrollment.student.profile_photo_url}
                            alt={enrollment.student.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#0F172A] font-semibold">
                            {enrollment.student.full_name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-[#0F172A]">{enrollment.student.full_name}</p>
                          <p className="text-sm text-slate-500">{enrollment.student.email}</p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(enrollment.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
