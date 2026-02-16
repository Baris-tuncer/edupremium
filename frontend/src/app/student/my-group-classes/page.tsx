'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/price-calculator';
import { toast, Toaster } from 'react-hot-toast';

interface GroupClassEnrollment {
  id: string;
  order_id: string;
  amount_paid: number;
  payment_status: string;
  status: string;
  created_at: string;
  group_class: {
    id: string;
    title: string;
    description: string | null;
    subject: string;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    meeting_link: string | null;
    teacher: {
      id: string;
      full_name: string;
      profile_photo_url: string | null;
    };
  };
}

export default function MyGroupClassesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeClasses, setActiveClasses] = useState<GroupClassEnrollment[]>([]);
  const [pastClasses, setPastClasses] = useState<GroupClassEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Kayıt onay modalı
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const [joiningMeeting, setJoiningMeeting] = useState(false);

  useEffect(() => {
    // Basarılı odeme kontrolu
    const success = searchParams.get('success');
    const orderId = searchParams.get('orderId');
    if (success === 'true') {
      toast.success('Kayıt basarıyla tamamlandı!');
    }

    checkAuthAndLoadData();
  }, [searchParams]);

  const checkAuthAndLoadData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      router.push('/student/login?redirect=/student/my-group-classes');
      return;
    }

    setUser(authUser);
    await fetchClasses(authUser);
    setLoading(false);
  };

  const fetchClasses = async (authUser: any) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    const response = await fetch('/api/group-classes/my-classes', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();

    if (result.activeClasses) {
      setActiveClasses(result.activeClasses);
    }
    if (result.pastClasses) {
      setPastClasses(result.pastClasses);
    }
  };

  const canJoinMeeting = (enrollment: GroupClassEnrollment) => {
    if (!enrollment.group_class.meeting_link) return false;
    if (enrollment.group_class.status !== 'confirmed') return false;

    const lessonStart = new Date(enrollment.group_class.scheduled_at);
    const fifteenMinsBefore = new Date(lessonStart.getTime() - 15 * 60 * 1000);
    const lessonEnd = new Date(lessonStart.getTime() + enrollment.group_class.duration_minutes * 60 * 1000);

    const now = new Date();
    return now >= fifteenMinsBefore && now <= lessonEnd;
  };

  const canCancel = (enrollment: GroupClassEnrollment) => {
    const scheduledAt = new Date(enrollment.group_class.scheduled_at);
    const now = new Date();
    const hoursDiff = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff >= 48 && enrollment.status === 'enrolled';
  };

  const handleJoinClick = (classId: string) => {
    setPendingClassId(classId);
    setConsentChecked(false);
    setShowConsentModal(true);
  };

  const handleConsentAndJoin = async () => {
    if (!consentChecked || !pendingClassId) return;

    setJoiningMeeting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Oturum hatası');
        return;
      }

      const response = await fetch(`/api/group-classes/${pendingClassId}/meeting-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.meetingUrl) {
        setShowConsentModal(false);
        window.open(result.meetingUrl, '_blank');
      } else {
        toast.error(result.error || 'Toplantı linki alınamadı');
      }
    } catch (error) {
      toast.error('Bir hata olustu');
    } finally {
      setJoiningMeeting(false);
    }
  };

  const handleCancel = async (classId: string) => {
    if (!confirm('Bu dersden kaydınızı iptal etmek istediginizden emin misiniz? Ucretiniz iade edilecektir.')) return;

    setCancelling(classId);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Oturum hatası');
        return;
      }

      const response = await fetch(`/api/group-classes/${classId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Kaydınız iptal edildi. Iade islemleri baslatıldı.');
        await fetchClasses(user);
      } else {
        toast.error(result.error || 'Iptal islemedi basarısız');
      }
    } catch (error) {
      toast.error('Bir hata olustu');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadge = (enrollment: GroupClassEnrollment) => {
    const gcStatus = enrollment.group_class.status;
    const enrollStatus = enrollment.status;

    if (enrollStatus === 'cancelled') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
          Iptal Edildi
        </span>
      );
    }

    if (gcStatus === 'cancelled') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
          Ders Iptal
        </span>
      );
    }

    if (gcStatus === 'completed') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
          Tamamlandı
        </span>
      );
    }

    if (gcStatus === 'confirmed') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
          Onaylandı
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
        Bekliyor
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/student/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-serif text-xl font-semibold text-[#0F172A]">EduPremium</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/group-classes"
                className="text-slate-600 hover:text-[#0F172A] font-medium"
              >
                Grup Dersleri
              </Link>
              <Link
                href="/student/lessons"
                className="text-slate-600 hover:text-[#0F172A] font-medium"
              >
                Derslerim
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Grup Derslerim</h1>
          <Link
            href="/group-classes"
            className="bg-[#0F172A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors"
          >
            Yeni Ders Bul
          </Link>
        </div>

        {/* Active Classes */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Aktif Dersler</h2>

          {activeClasses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-slate-500 mb-4">Henuz aktif grup dersiniz yok.</p>
              <Link href="/group-classes" className="text-[#D4AF37] hover:underline">
                Grup derslerini inceleyin
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeClasses.map((enrollment) => {
                const scheduledDate = new Date(enrollment.group_class.scheduled_at);
                const showJoinButton = canJoinMeeting(enrollment);

                return (
                  <div
                    key={enrollment.id}
                    className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-[#D4AF37]/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {enrollment.group_class.teacher.profile_photo_url ? (
                          <img
                            src={enrollment.group_class.teacher.profile_photo_url}
                            alt={enrollment.group_class.teacher.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#0F172A] font-semibold">
                            {enrollment.group_class.teacher.full_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-[#0F172A]">{enrollment.group_class.title}</h3>
                            {getStatusBadge(enrollment)}
                          </div>
                          <p className="text-sm text-slate-500">{enrollment.group_class.teacher.full_name}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {scheduledDate.toLocaleDateString('tr-TR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {scheduledDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">
                              {enrollment.group_class.subject}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {showJoinButton && (
                          <button
                            onClick={() => handleJoinClick(enrollment.group_class.id)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Derse Katıl
                          </button>
                        )}

                        {canCancel(enrollment) && (
                          <button
                            onClick={() => handleCancel(enrollment.group_class.id)}
                            disabled={cancelling === enrollment.group_class.id}
                            className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {cancelling === enrollment.group_class.id ? 'Iptal ediliyor...' : 'Iptal Et'}
                          </button>
                        )}

                        <Link
                          href={`/group-classes/${enrollment.group_class.id}`}
                          className="text-slate-500 hover:text-[#0F172A] p-2"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Classes */}
        {pastClasses.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Gecmis Dersler</h2>
            <div className="space-y-4">
              {pastClasses.map((enrollment) => {
                const scheduledDate = new Date(enrollment.group_class.scheduled_at);

                return (
                  <div
                    key={enrollment.id}
                    className="bg-white/60 rounded-2xl p-6 border border-slate-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {enrollment.group_class.teacher.profile_photo_url ? (
                          <img
                            src={enrollment.group_class.teacher.profile_photo_url}
                            alt={enrollment.group_class.teacher.full_name}
                            className="w-10 h-10 rounded-full object-cover opacity-75"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 font-semibold">
                            {enrollment.group_class.teacher.full_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-slate-600">{enrollment.group_class.title}</h3>
                            {getStatusBadge(enrollment)}
                          </div>
                          <p className="text-sm text-slate-400">{enrollment.group_class.teacher.full_name}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {scheduledDate.toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="text-slate-400 text-sm">
                        {formatPrice(enrollment.amount_paid)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">Derse Katılım Onayı</h2>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-800">
                Bu ders kaydedilecektir. Dersin kaydedilmesini ve egitim amacıyla kullanılmasını onaylıyor musunuz?
              </p>
            </div>

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span className="text-sm text-slate-600">
                Dersin kaydedilmesini ve EduPremium tarafından egitim amacıyla kullanılmasını onaylıyorum.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConsentModal(false);
                  setPendingClassId(null);
                }}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Iptal
              </button>
              <button
                onClick={handleConsentAndJoin}
                disabled={!consentChecked || joiningMeeting}
                className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {joiningMeeting ? 'Baglaniyor...' : 'Derse Katıl'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
