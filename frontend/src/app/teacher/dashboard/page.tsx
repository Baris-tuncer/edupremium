'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Star, BookOpen, Users, Calendar, TrendingUp, LogOut, Loader2, ChevronRight } from 'lucide-react'

interface Stats {
  monthlyEarnings: number
  totalLessons: number
  activeStudents: number
  averageRating: number
}

interface UpcomingLesson {
  id: string
  subject: string
  scheduled_at: string
  student_name: string
  duration_minutes: number
}

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  student_name: string
}

export default function TeacherDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    monthlyEarnings: 0,
    totalLessons: 0,
    activeStudents: 0,
    averageRating: 0
  })
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([])
  const [recentReviews, setRecentReviews] = useState<Review[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data: allLessons } = await supabase
        .from('lessons')
        .select('id, price, status, scheduled_at, student_id')
        .eq('teacher_id', user.id)

      const { data: monthlyLessons } = await supabase
        .from('lessons')
        .select('price')
        .eq('teacher_id', user.id)
        .eq('status', 'COMPLETED')
        .gte('scheduled_at', monthStart)

      const monthlyEarnings = monthlyLessons?.reduce((sum, l) => sum + (l.price || 0), 0) || 0
      const totalLessons = allLessons?.filter(l => l.status === 'COMPLETED').length || 0
      const uniqueStudents = new Set(allLessons?.map(l => l.student_id) || [])
      const activeStudents = uniqueStudents.size

      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('teacher_id', user.id)

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

      setStats({ monthlyEarnings, totalLessons, activeStudents, averageRating })

      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() + 7)

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
        .limit(5)

      setUpcomingLessons(upcoming?.map(l => ({
        id: l.id,
        subject: l.subject,
        scheduled_at: l.scheduled_at,
        duration_minutes: l.duration_minutes || 60,
        student_name: (l.student as any)?.full_name || 'Öğrenci'
      })) || [])

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
        .limit(3)

      setRecentReviews(recentReviewsData?.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        student_name: (r.student as any)?.full_name || 'Öğrenci'
      })) || [])

    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-[#D4AF37]' : 'text-slate-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/teacher/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-[#FDFBF7]/80 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')`
            }}
          ></div>
          <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-[#FDFBF7]/80 backdrop-blur-xl overflow-hidden">

      {/* --- ARKA PLAN --- */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')`
          }}
        ></div>
        <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
      </div>

      <div className="relative z-10 pt-10 pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest mb-3 bg-white/40 backdrop-blur-md shadow-sm">
                <Star className="w-3 h-3 text-[#D4AF37] fill-current" /> Eğitmen Paneli
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] font-serif">Genel Bakış</h1>
              <p className="text-slate-500 text-sm mt-1">Performansınızı ve yaklaşan derslerinizi takip edin</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium bg-white/50 px-4 py-2 rounded-full backdrop-blur-md"
            >
              <LogOut className="w-4 h-4" /> Çıkış
            </button>
          </div>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-2xl shadow-[#0F172A]/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Bu Ay Kazanç</span>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">{formatCurrency(stats.monthlyEarnings)}</p>
              <p className="text-xs text-slate-400 mt-1">Net kazanç</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-2xl shadow-[#0F172A]/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Tamamlanan Ders</span>
                <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">{stats.totalLessons}</p>
              <p className="text-xs text-slate-400 mt-1">Toplam ders</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-2xl shadow-[#0F172A]/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Aktif Öğrenci</span>
                <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#D4AF37]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">{stats.activeStudents}</p>
              <p className="text-xs text-slate-400 mt-1">Toplam öğrenci</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-2xl shadow-[#0F172A]/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Ortalama Puan</span>
                <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center border border-[#D4AF37]/20">
                  <Star className="w-5 h-5 text-[#D4AF37] fill-current" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
              </p>
              <p className="text-xs text-slate-400 mt-1">5 üzerinden</p>
            </div>
          </div>

          {/* Alt Kısım - 2 Sütun */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Yaklaşan Dersler */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-8 shadow-2xl shadow-[#0F172A]/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#0F172A] font-serif">Yaklaşan Dersler</h2>
                <Link href="/teacher/lessons" className="text-xs text-[#D4AF37] font-bold hover:underline flex items-center gap-1">
                  Tümünü Gör <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {upcomingLessons.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Bu hafta planlanmış ders bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-4 p-4 bg-[#FDFBF7]/80 backdrop-blur-xl rounded-xl border border-slate-100">
                      <div className="w-11 h-11 bg-[#0F172A] rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-[#D4AF37]">
                          {lesson.subject.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0F172A] text-sm truncate">{lesson.subject}</p>
                        <p className="text-xs text-slate-400">{lesson.student_name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-[#0F172A]">{formatDate(lesson.scheduled_at)}</p>
                        <p className="text-xs text-slate-400">{formatTime(lesson.scheduled_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Son Değerlendirmeler */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-8 shadow-2xl shadow-[#0F172A]/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#0F172A] font-serif">Son Değerlendirmeler</h2>
                <Link href="/teacher/feedback" className="text-xs text-[#D4AF37] font-bold hover:underline flex items-center gap-1">
                  Tümünü Gör <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {recentReviews.length === 0 ? (
                <div className="text-center py-10">
                  <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Henüz değerlendirme bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="p-4 bg-[#FDFBF7]/80 backdrop-blur-xl rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[#0F172A] text-sm">{review.student_name}</span>
                        <div className="flex items-center gap-0.5">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-slate-500 line-clamp-2">{review.comment}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-2">{formatDate(review.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
