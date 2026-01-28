'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Stats {
  monthlyEarnings: number;
  totalLessons: number;
  activeStudents: number;
  averageRating: number;
}

interface UpcomingLesson {
  id: string;
  subject: string;
  scheduled_at: string;
  student_name: string;
  duration_minutes: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  student_name: string;
}

export default function TeacherDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    monthlyEarnings: 0,
    totalLessons: 0,
    activeStudents: 0,
    averageRating: 0
  });
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Bu ayın başlangıcı
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Tüm dersler
      const { data: allLessons } = await supabase
        .from('lessons')
        .select('id, price, status, scheduled_at, student_id')
        .eq('teacher_id', user.id);

      // Bu ayki kazanç (tamamlanan dersler)
      const { data: monthlyLessons } = await supabase
        .from('lessons')
        .select('price')
        .eq('teacher_id', user.id)
        .eq('status', 'COMPLETED')
        .gte('scheduled_at', monthStart);

      const monthlyEarnings = monthlyLessons?.reduce((sum, l) => sum + (l.price || 0), 0) || 0;

      // Toplam tamamlanan ders
      const totalLessons = allLessons?.filter(l => l.status === 'COMPLETED').length || 0;

      // Aktif öğrenci sayısı (benzersiz)
      const uniqueStudents = new Set(allLessons?.map(l => l.student_id) || []);
      const activeStudents = uniqueStudents.size;

      // Ortalama puan
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('teacher_id', user.id);

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      setStats({
        monthlyEarnings,
        totalLessons,
        activeStudents,
        averageRating
      });

      // Yaklaşan dersler (bu haftaki)
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { data: upcoming } = await supabase
        .from('lessons')
        .select(`
          id,
          subject,
          scheduled_at,
          duration_minutes,
          student:student_profiles(full_name)
        `)
        .eq('teacher_id', user.id)
        .in('status', ['PENDING', 'CONFIRMED'])
        .gte('scheduled_at', now.toISOString())
        .lte('scheduled_at', weekEnd.toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      setUpcomingLessons(upcoming?.map(l => ({
        id: l.id,
        subject: l.subject,
        scheduled_at: l.scheduled_at,
        duration_minutes: l.duration_minutes || 60,
        student_name: (l.student as any)?.full_name || 'Öğrenci'
      })) || []);

      // Son değerlendirmeler
      const { data: recentReviewsData } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          student:student_profiles(full_name)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setRecentReviews(recentReviewsData?.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        student_name: (r.student as any)?.full_name || 'Öğrenci'
      })) || []);

    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-slate-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900">Genel Bakış</h1>
        <p className="text-slate-600 mt-1">Performansınızı ve yaklaşan derslerinizi takip edin</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Bu Ay Kazanç */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Bu Ay Kazanç</span>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.monthlyEarnings)}</p>
          <p className="text-sm text-slate-400 mt-1">Net kazanç</p>
        </div>

        {/* Toplam Ders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Tamamlanan Ders</span>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalLessons}</p>
          <p className="text-sm text-slate-400 mt-1">Toplam ders</p>
        </div>

        {/* Aktif Öğrenci */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Aktif Öğrenci</span>
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.activeStudents}</p>
          <p className="text-sm text-slate-400 mt-1">Toplam öğrenci</p>
        </div>

        {/* Ortalama Puan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Ortalama Puan</span>
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
          </p>
          <p className="text-sm text-slate-400 mt-1">5 üzerinden</p>
        </div>
      </div>

      {/* Alt Kısım - 2 Sütun */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yaklaşan Dersler */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-slate-900">Yaklaşan Dersler</h2>
            <Link href="/teacher/lessons" className="text-sm text-blue-600 hover:text-blue-700">
              Tümünü Gör
            </Link>
          </div>

          {upcomingLessons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">Bu hafta planlanmış ders bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingLessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-700">
                      {lesson.subject.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{lesson.subject}</p>
                    <p className="text-sm text-slate-500">{lesson.student_name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-slate-900">{formatDate(lesson.scheduled_at)}</p>
                    <p className="text-sm text-slate-500">{formatTime(lesson.scheduled_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Son Değerlendirmeler */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-slate-900">Son Değerlendirmeler</h2>
            <Link href="/teacher/reviews" className="text-sm text-blue-600 hover:text-blue-700">
              Tümünü Gör
            </Link>
          </div>

          {recentReviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">Henüz değerlendirme bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{review.student_name}</span>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-slate-600 line-clamp-2">{review.comment}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">{formatDate(review.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
