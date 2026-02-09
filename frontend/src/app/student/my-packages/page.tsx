'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { User, LogOut, Package, Calendar, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import StudentNotificationBell from '../components/NotificationBell';
import RescheduleModal from '@/components/RescheduleModal';

interface PackagePayment {
  id: string;
  campaign_name: string;
  campaign_type: string;
  total_lessons: number;
  lesson_count: number;
  bonus_lessons: number;
  discount_percent: number;
  total_amount: number;
  teacher_total_earnings: number;
  status: string;
  completed_lessons: number;
  cancelled_lessons: number;
  created_at: string;
  completed_at: string;
  expires_at: string;
  cancelled_at: string;
  refund_amount: number;
  teacher_id: string;
  teacher?: {
    full_name: string;
    avatar_url: string;
  };
  lessons?: Lesson[];
}

interface Lesson {
  id: string;
  scheduled_at: string;
  status: string;
  reschedule_count: number;
  meeting_link: string;
}

export default function MyPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackagePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const [rescheduleData, setRescheduleData] = useState<{
    lesson: Lesson;
    teacherId: string;
    teacherName: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/student/login');
      return;
    }

    // Öğrenci profili
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    setStudentName(profile?.full_name || 'Öğrenci');

    // Paketleri al
    const { data: packagesData, error } = await supabase
      .from('package_payments')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Packages fetch error:', error);
      toast.error('Paketler yüklenemedi');
      setLoading(false);
      return;
    }

    // Her paket için öğretmen bilgisi ve dersler
    const packagesWithDetails = await Promise.all(
      (packagesData || []).map(async (pkg) => {
        // Öğretmen bilgisi
        const { data: teacher } = await supabase
          .from('teacher_profiles')
          .select('full_name, avatar_url')
          .eq('id', pkg.teacher_id)
          .single();

        // Dersler
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id, scheduled_at, status, reschedule_count, meeting_link')
          .eq('package_payment_id', pkg.id)
          .order('scheduled_at', { ascending: true });

        return {
          ...pkg,
          teacher,
          lessons: lessons || [],
        };
      })
    );

    setPackages(packagesWithDetails);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/student/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Aktif
          </span>
        );
      case 'cancelled':
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">
            <XCircle className="w-3 h-3" />
            İptal Edildi
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            Ödeme Bekleniyor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  const getLessonStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">Tamamlandı</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">Planlandı</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded">İptal</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] relative overflow-hidden">
      {/* Arka Plan */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/50 shadow-sm">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-[#D4AF37]">
                <span className="font-serif font-bold text-xl">E</span>
              </div>
              <span className="font-serif font-bold text-xl text-[#0F172A] hidden md:block">EduPremium</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/student/dashboard" className="text-sm font-medium text-slate-600 hover:text-[#D4AF37] transition-colors hidden md:block">
                Öğretmenler
              </Link>
              <Link href="/student/lessons" className="text-sm font-medium text-slate-600 hover:text-[#D4AF37] transition-colors hidden md:block">
                Derslerim
              </Link>
              <Link href="/student/my-packages" className="text-sm font-medium text-[#D4AF37] hidden md:block">
                Paketlerim
              </Link>
              <StudentNotificationBell />
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200/50">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-[#0F172A]">{studentName}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Öğrenci</p>
                </div>
                <div className="w-10 h-10 bg-slate-100/50 rounded-full border border-slate-200/50 flex items-center justify-center text-slate-500">
                  <User className="w-5 h-5" />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-10">
          {/* Başlık */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#F5D572] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
              <Package className="w-7 h-7 text-[#0F172A]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A] font-serif">Paketlerim</h1>
              <p className="text-slate-600">Satın aldığınız ders paketleri ve derslerin durumu</p>
            </div>
          </div>

          {/* Paket Listesi */}
          {packages.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/50 shadow-xl">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Henüz paketiniz yok</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Öğretmenlerimizin kampanyalı ders paketlerini inceleyerek avantajlı fiyatlarla ders satın alabilirsiniz.
              </p>
              <Link
                href="/student/dashboard"
                className="inline-flex items-center gap-2 bg-[#0F172A] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors"
              >
                Öğretmenleri İncele
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {packages.map((pkg) => {
                const completedCount = pkg.lessons?.filter(l => l.status === 'COMPLETED').length || 0;
                const upcomingLessons = pkg.lessons?.filter(l => l.status === 'CONFIRMED' && new Date(l.scheduled_at) > new Date()) || [];
                const isExpanded = expandedPackage === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden"
                  >
                    {/* Paket Başlığı */}
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {pkg.teacher?.avatar_url ? (
                            <img
                              src={pkg.teacher.avatar_url}
                              alt={pkg.teacher.full_name}
                              className="w-14 h-14 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                              <span className="text-xl font-bold text-[#0F172A]">
                                {pkg.teacher?.full_name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-[#0F172A]">{pkg.campaign_name}</h3>
                            <p className="text-slate-600 text-sm">{pkg.teacher?.full_name}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {getStatusBadge(pkg.status)}
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                pkg.campaign_type === 'package_discount'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {pkg.campaign_type === 'package_discount' ? 'İndirimli Paket' : 'Bonus Ders'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#0F172A]">
                            {pkg.total_amount.toLocaleString('tr-TR')} TL
                          </p>
                          <p className="text-xs text-slate-500">Toplam Ödeme</p>
                        </div>
                      </div>

                      {/* İstatistikler */}
                      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#0F172A]">{pkg.total_lessons}</p>
                          <p className="text-xs text-slate-500">Toplam Ders</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
                          <p className="text-xs text-slate-500">Tamamlanan</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{upcomingLessons.length}</p>
                          <p className="text-xs text-slate-500">Bekleyen</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-400">
                            {pkg.total_lessons - completedCount - upcomingLessons.length}
                          </p>
                          <p className="text-xs text-slate-500">Kalan Hak</p>
                        </div>
                      </div>

                      {/* Genişlet/Daralt Butonu */}
                      <button
                        onClick={() => setExpandedPackage(isExpanded ? null : pkg.id)}
                        className="w-full mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-[#D4AF37] transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <span>Dersleri Gizle</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Dersleri Göster ({pkg.lessons?.length || 0})</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Ders Listesi */}
                    {isExpanded && pkg.lessons && pkg.lessons.length > 0 && (
                      <div className="border-t border-slate-100 bg-slate-50/50">
                        <div className="p-6">
                          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                            Ders Programı
                          </h4>
                          <div className="space-y-3">
                            {pkg.lessons.map((lesson, index) => {
                              const lessonDate = new Date(lesson.scheduled_at);
                              const isPast = lessonDate < new Date();
                              const isUpcoming = !isPast && lesson.status === 'CONFIRMED';

                              return (
                                <div
                                  key={lesson.id}
                                  className={`flex items-center justify-between p-4 rounded-xl border ${
                                    isUpcoming
                                      ? 'bg-white border-blue-200'
                                      : lesson.status === 'COMPLETED'
                                      ? 'bg-emerald-50/50 border-emerald-100'
                                      : 'bg-white border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                                      lesson.status === 'COMPLETED'
                                        ? 'bg-emerald-100 text-emerald-600'
                                        : isUpcoming
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}>
                                      {index + 1}
                                    </div>
                                    <div>
                                      <p className="font-medium text-[#0F172A]">
                                        {formatDateTime(lesson.scheduled_at)}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        {getLessonStatusBadge(lesson.status)}
                                        {lesson.reschedule_count > 0 && (
                                          <span className="text-[10px] text-amber-600 font-medium">
                                            {lesson.reschedule_count} değişiklik yapıldı
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {isUpcoming && lesson.meeting_link && (
                                      <a
                                        href={lesson.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                                      >
                                        Derse Katıl
                                      </a>
                                    )}
                                    {isUpcoming && lesson.reschedule_count < 2 && (
                                      <button
                                        className="text-slate-500 hover:text-[#D4AF37] text-xs font-medium transition-colors"
                                        onClick={() => {
                                          setRescheduleData({
                                            lesson,
                                            teacherId: pkg.teacher_id,
                                            teacherName: pkg.teacher?.full_name || 'Öğretmen',
                                          });
                                        }}
                                      >
                                        Tarih Değiştir
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Paket İptal */}
                        {pkg.status === 'completed' && upcomingLessons.length > 0 && (
                          <div className="p-6 pt-0">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                              <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-amber-800">Paket İptali</p>
                                  <p className="text-xs text-amber-700 mt-1">
                                    Paketi iptal ettiğinizde, tamamlanan dersler tekil fiyattan hesaplanır ve kalan tutar iade edilir.
                                    İptal işlemi için destek ekibimizle iletişime geçin.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* İptal Bilgisi */}
                    {(pkg.status === 'cancelled' || pkg.status === 'refunded') && (
                      <div className="border-t border-red-100 bg-red-50/50 p-6">
                        <div className="flex items-center gap-3">
                          <XCircle className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="text-sm font-medium text-red-800">
                              Bu paket {formatDate(pkg.cancelled_at)} tarihinde iptal edildi.
                            </p>
                            {pkg.refund_amount > 0 && (
                              <p className="text-xs text-red-600 mt-1">
                                İade tutarı: {pkg.refund_amount.toLocaleString('tr-TR')} TL
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleData && (
        <RescheduleModal
          lesson={rescheduleData.lesson}
          teacherId={rescheduleData.teacherId}
          teacherName={rescheduleData.teacherName}
          onClose={() => setRescheduleData(null)}
          onSuccess={() => {
            loadData(); // Refresh data
          }}
        />
      )}
    </div>
  );
}
