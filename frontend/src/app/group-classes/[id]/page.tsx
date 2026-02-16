'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/price-calculator';
import { toast, Toaster } from 'react-hot-toast';

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
  enrollment_deadline: string;
  enrolled_count: number;
  spots_left: number;
  teacher: {
    id: string;
    full_name: string;
    profile_photo_url: string | null;
    bio: string | null;
    subjects: string[];
    total_lessons_completed: number;
    rating: number | null;
  };
}

export default function GroupClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [groupClass, setGroupClass] = useState<GroupClass | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    // Kullanıcı kontrolü
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser);

    // Sınıf bilgisi
    const { data: { session } } = await supabase.auth.getSession();
    const headers: any = {};
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`/api/group-classes/${id}`, { headers });
    const result = await response.json();

    if (result.groupClass) {
      setGroupClass(result.groupClass);
      setIsEnrolled(result.isEnrolled);
    }

    setLoading(false);
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/student/login?redirect=/group-classes/${id}`);
      return;
    }

    setEnrolling(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Oturum hatası. Lutfen tekrar giris yapın.');
        router.push('/student/login');
        return;
      }

      const response = await fetch(`/api/group-classes/${id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (result.success && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        toast.error(result.error || 'Kayıt olusturulamadı');
      }
    } catch (error) {
      toast.error('Bir hata olustu');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!groupClass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-4">Sınıf Bulunamadı</h1>
          <Link href="/group-classes" className="text-[#D4AF37] hover:underline">
            Tum grup derslerini gor
          </Link>
        </div>
      </div>
    );
  }

  const scheduledDate = new Date(groupClass.scheduled_at);
  const deadlineDate = new Date(groupClass.enrollment_deadline);
  const isDeadlinePassed = deadlineDate < new Date();
  const isFull = groupClass.spots_left <= 0;
  const canEnroll = !isEnrolled && !isDeadlinePassed && !isFull && groupClass.status === 'open';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/group-classes" className="flex items-center gap-2 text-slate-600 hover:text-[#0F172A]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-serif text-xl font-semibold text-[#0F172A]">EduPremium</span>
            </Link>
            {user ? (
              <Link
                href="/student/my-group-classes"
                className="text-slate-600 hover:text-[#0F172A] font-medium"
              >
                Grup Derslerim
              </Link>
            ) : (
              <Link
                href="/student/login"
                className="bg-[#0F172A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors"
              >
                Giris Yap
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Status */}
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
                    {groupClass.subject}
                  </span>
                  <h1 className="text-2xl font-bold text-[#0F172A] mt-2">{groupClass.title}</h1>
                </div>
                {groupClass.status === 'confirmed' ? (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-emerald-100 text-emerald-700">
                    Kesin Yapılacak
                  </span>
                ) : (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
                    Kayıt Acık
                  </span>
                )}
              </div>

              {groupClass.description && (
                <p className="text-slate-600 mb-4">{groupClass.description}</p>
              )}

              {/* Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500">Katılımcılar</span>
                  <span className="font-medium text-[#0F172A]">
                    {groupClass.enrolled_count}/{groupClass.max_capacity}
                    {groupClass.enrolled_count < groupClass.min_capacity && (
                      <span className="text-amber-600 ml-1">(min {groupClass.min_capacity})</span>
                    )}
                  </span>
                </div>
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
                {groupClass.enrolled_count < groupClass.min_capacity && (
                  <p className="text-xs text-amber-600 mt-2">
                    Minimum {groupClass.min_capacity} ogrenci gerekli. Su an {groupClass.enrolled_count} kisi kayıtlı.
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-bold text-[#0F172A] mb-4">Ders Detayları</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tarih</p>
                    <p className="font-medium text-[#0F172A]">
                      {scheduledDate.toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Saat & Sure</p>
                    <p className="font-medium text-[#0F172A]">
                      {scheduledDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {groupClass.duration_minutes} dk
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Kontenjan</p>
                    <p className="font-medium text-[#0F172A]">
                      {groupClass.spots_left} yer kaldı ({groupClass.max_capacity} kisilik)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Son Kayıt</p>
                    <p className={`font-medium ${isDeadlinePassed ? 'text-red-600' : 'text-[#0F172A]'}`}>
                      {deadlineDate.toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-bold text-[#0F172A] mb-4">Ogretmen</h2>
              <div className="flex items-start gap-4">
                {groupClass.teacher.profile_photo_url ? (
                  <img
                    src={groupClass.teacher.profile_photo_url}
                    alt={groupClass.teacher.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#0F172A] text-xl font-semibold">
                    {groupClass.teacher.full_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-[#0F172A]">{groupClass.teacher.full_name}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                    <span>{groupClass.teacher.total_lessons_completed || 0} ders tamamladı</span>
                    {groupClass.teacher.rating && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {groupClass.teacher.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {groupClass.teacher.bio && (
                    <p className="text-slate-600 text-sm mt-2">{groupClass.teacher.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-slate-500 text-sm">Katılım Ucreti</p>
                <p className="text-3xl font-bold text-[#D4AF37]">{formatPrice(groupClass.display_price)}</p>
                <p className="text-xs text-slate-400 mt-1">kisi bası</p>
              </div>

              {isEnrolled ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <svg className="w-8 h-8 text-emerald-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold text-emerald-700">Bu derse kayıtlısınız</p>
                  <Link
                    href="/student/my-group-classes"
                    className="text-emerald-600 text-sm hover:underline mt-2 inline-block"
                  >
                    Grup derslerime git
                  </Link>
                </div>
              ) : isFull ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="font-semibold text-red-700">Kontenjan Doldu</p>
                </div>
              ) : isDeadlinePassed ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <p className="font-semibold text-slate-700">Kayıt Suresi Doldu</p>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-[#0F172A] text-white py-3 rounded-xl font-semibold hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors disabled:opacity-50"
                >
                  {enrolling ? 'Yonlendiriliyor...' : 'Hemen Kayıt Ol'}
                </button>
              )}

              {canEnroll && (
                <div className="mt-4 space-y-2 text-xs text-slate-500">
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    48 saat oncesine kadar ucretsiz iptal
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Min kisi sayısına ulasılmazsa tam iade
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Online canli ders
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
