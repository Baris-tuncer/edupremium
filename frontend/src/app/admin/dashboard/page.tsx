'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, TrendingDown, Wallet, PieChart, Activity, ArrowUpRight } from 'lucide-react';

interface Stats {
  totalTeachers: number;
  totalStudents: number;
  totalLessons: number;
  completedLessons: number;
  totalRevenue: number;
  platformCommission: number;
  teacherPayouts: number;
  thisMonthRevenue: number;
  thisMonthLessons: number;
  lastMonthRevenue: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  lessons: number;
  commission: number;
}

interface RecentLesson {
  id: string;
  subject: string;
  teacher_name: string;
  student_name: string;
  price: number;
  scheduled_at: string;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalTeachers: 0,
    totalStudents: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalRevenue: 0,
    platformCommission: 0,
    teacherPayouts: 0,
    thisMonthRevenue: 0,
    thisMonthLessons: 0,
    lastMonthRevenue: 0
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [recentLessons, setRecentLessons] = useState<RecentLesson[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Öğretmen sayısı
      const { count: teacherCount } = await supabase
        .from('teacher_profiles')
        .select('*', { count: 'exact', head: true });

      // Öğrenci sayısı
      const { count: studentCount } = await supabase
        .from('student_profiles')
        .select('*', { count: 'exact', head: true });

      // Tum dersler
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, price, status, scheduled_at, teacher_id, student_id, subject')
        .order('scheduled_at', { ascending: false });

      const totalLessons = lessons?.length || 0;
      const completedLessonsList = lessons?.filter(l => l.status === 'COMPLETED') || [];
      const completedLessons = completedLessonsList.length;

      // Her dersin komisyonunu ayrı ayrı hesapla (odemeler sayfasıyla tutarlı)
      const commissionRate = 0.25;
      let totalRevenue = 0;
      let platformCommission = 0;
      let teacherPayouts = 0;

      completedLessonsList.forEach(l => {
        const price = l.price || 0;
        const lessonCommission = Math.round(price * commissionRate);
        const teacherEarning = price - lessonCommission;

        totalRevenue += price;
        platformCommission += lessonCommission;
        teacherPayouts += teacherEarning;
      });

      // Bu ay ve geçen ay
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const thisMonthLessons = lessons?.filter(l =>
        l.status === 'COMPLETED' && new Date(l.scheduled_at) >= thisMonthStart
      ) || [];
      const thisMonthRevenue = thisMonthLessons.reduce((sum, l) => sum + (l.price || 0), 0);

      const lastMonthLessons = lessons?.filter(l =>
        l.status === 'COMPLETED' &&
        new Date(l.scheduled_at) >= lastMonthStart &&
        new Date(l.scheduled_at) <= lastMonthEnd
      ) || [];
      const lastMonthRevenue = lastMonthLessons.reduce((sum, l) => sum + (l.price || 0), 0);

      setStats({
        totalTeachers: teacherCount || 0,
        totalStudents: studentCount || 0,
        totalLessons,
        completedLessons,
        totalRevenue,
        platformCommission,
        teacherPayouts,
        thisMonthRevenue,
        thisMonthLessons: thisMonthLessons.length,
        lastMonthRevenue
      });

      // Aylık veri (son 6 ay)
      const monthly: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthName = monthDate.toLocaleDateString('tr-TR', { month: 'short' });

        const monthLessons = lessons?.filter(l => {
          const date = new Date(l.scheduled_at);
          return l.status === 'COMPLETED' && date >= monthDate && date <= monthEnd;
        }) || [];

        let monthRevenue = 0;
        let monthCommission = 0;
        monthLessons.forEach(l => {
          const price = l.price || 0;
          monthRevenue += price;
          monthCommission += Math.round(price * 0.25);
        });

        monthly.push({
          month: monthName,
          revenue: monthRevenue,
          lessons: monthLessons.length,
          commission: monthCommission
        });
      }
      setMonthlyData(monthly);

      // Son tamamlanan dersler
      const recentCompletedLessons = lessons?.filter(l => l.status === 'COMPLETED').slice(0, 5) || [];

      // Öğretmen ve öğrenci bilgilerini al
      const teacherIds = [...new Set(recentCompletedLessons.map(l => l.teacher_id).filter(Boolean))];
      const studentIds = [...new Set(recentCompletedLessons.map(l => l.student_id).filter(Boolean))];

      const { data: teachers } = await supabase
        .from('teacher_profiles')
        .select('id, full_name')
        .in('id', teacherIds);

      const { data: students } = await supabase
        .from('student_profiles')
        .select('id, full_name')
        .in('id', studentIds);

      const teacherMap = new Map(teachers?.map(t => [t.id, t.full_name]) || []);
      const studentMap = new Map(students?.map(s => [s.id, s.full_name]) || []);

      const recentData = recentCompletedLessons.map(l => ({
        id: l.id,
        subject: l.subject || 'Ders',
        teacher_name: teacherMap.get(l.teacher_id) || 'Öğretmen',
        student_name: studentMap.get(l.student_id) || 'Öğrenci',
        price: l.price || 0,
        scheduled_at: l.scheduled_at
      }));

      setRecentLessons(recentData);

    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) => n.toLocaleString('tr-TR') + ' TL';
  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);

  // Bu ay vs geçen ay değişim
  const revenueChange = stats.lastMonthRevenue > 0
    ? ((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue * 100).toFixed(0)
    : stats.thisMonthRevenue > 0 ? '100' : '0';
  const isPositiveChange = Number(revenueChange) >= 0;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm">Platform genel bakış ve analitik</p>
          </div>
        </div>
      </div>

      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Toplam Öğretmen */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-blue-100 p-6 shadow-lg shadow-blue-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Aktif</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalTeachers}</p>
          <p className="text-sm text-slate-500 mt-1">Toplam Öğretmen</p>
        </div>

        {/* Toplam Öğrenci */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-100 p-6 shadow-lg shadow-purple-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Kayıtlı</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
          <p className="text-sm text-slate-500 mt-1">Toplam Öğrenci</p>
        </div>

        {/* Tamamlanan Ders */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-emerald-100 p-6 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stats.totalLessons} toplam</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.completedLessons}</p>
          <p className="text-sm text-slate-500 mt-1">Tamamlanan Ders</p>
        </div>

        {/* Toplam Gelir */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-slate-400 mt-1">Toplam Gelir</p>
          </div>
        </div>
      </div>

      {/* Gelir Grafiği ve Finansal Özet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Aylık Gelir Grafiği */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Aylık Gelir</h2>
                <p className="text-sm text-slate-500 mt-1">Son 6 aylık platform geliri</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-t from-[#D4AF37] to-[#F5D572] rounded-sm" />
                  <span className="text-slate-600">Gelir</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                  <span className="text-slate-600">Komisyon</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-4 h-52">
              {monthlyData.map((m, i) => {
                const heightPercent = (m.revenue / maxRevenue) * 100;
                const commissionPercent = (m.commission / maxRevenue) * 100;
                const isCurrentMonth = i === monthlyData.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 px-3 py-2 bg-[#0F172A] text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
                      <p className="font-semibold">{formatCurrency(m.revenue)}</p>
                      <p className="text-slate-400">{m.lessons} ders</p>
                    </div>
                    {/* Bar */}
                    <div className="w-full h-40 bg-slate-100/50 rounded-xl relative overflow-hidden">
                      {/* Komisyon (alt kısım) */}
                      <div
                        className="absolute bottom-0 w-full bg-emerald-500 transition-all duration-500"
                        style={{ height: `${Math.max(commissionPercent, 0)}%` }}
                      />
                      {/* Toplam gelir (üst kısım) */}
                      <div
                        className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${
                          isCurrentMonth
                            ? 'bg-gradient-to-t from-[#D4AF37] to-[#F5D572]'
                            : 'bg-gradient-to-t from-slate-400 to-slate-300'
                        }`}
                        style={{ height: `${Math.max(heightPercent, 2)}%` }}
                      />
                    </div>
                    {/* Label */}
                    <div className="mt-3 text-center">
                      <span className={`text-sm font-medium ${isCurrentMonth ? 'text-[#D4AF37]' : 'text-slate-600'}`}>
                        {m.month}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Finansal Özet */}
        <div className="space-y-4">
          {/* Bu Ay */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-emerald-100">Bu Ay Gelir</span>
              {stats.thisMonthRevenue > 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  isPositiveChange ? 'bg-white/20' : 'bg-red-500/50'
                }`}>
                  {isPositiveChange ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  %{Math.abs(Number(revenueChange))}
                </div>
              )}
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.thisMonthRevenue)}</p>
            <p className="text-sm text-emerald-100 mt-1">{stats.thisMonthLessons} ders tamamlandı</p>
          </div>

          {/* Platform Komisyonu */}
          <div className="bg-gradient-to-br from-[#0F172A] to-[#334155] rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm font-medium text-slate-300">Platform Komisyonu</span>
            </div>
            <p className="text-2xl font-bold text-[#D4AF37]">{formatCurrency(stats.platformCommission)}</p>
            <p className="text-sm text-slate-400 mt-1">%25 komisyon oranı</p>
          </div>

          {/* Öğretmen Ödemeleri */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-600">Öğretmen Ödemeleri</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.teacherPayouts)}</p>
            <p className="text-sm text-slate-500 mt-1">Net ödenen tutar</p>
          </div>
        </div>
      </div>

      {/* Alt Bölüm: Son İşlemler ve Komisyon Sistemi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son Tamamlanan Dersler */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Son Tamamlanan Dersler</h2>
              <p className="text-sm text-slate-500">En son tamamlanan 5 ders</p>
            </div>
            <button className="text-sm text-[#D4AF37] hover:text-[#B8960C] font-medium flex items-center gap-1">
              Tümü <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          {recentLessons.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentLessons.map((lesson) => (
                <div key={lesson.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#0F172A] font-semibold text-sm">
                        {lesson.subject?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{lesson.subject}</p>
                        <p className="text-xs text-slate-500">{lesson.teacher_name} → {lesson.student_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600 text-sm">+{formatCurrency(lesson.price)}</p>
                      <p className="text-xs text-slate-400">{formatDate(lesson.scheduled_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-500">Henüz tamamlanan ders yok</p>
            </div>
          )}
        </div>

        {/* Komisyon Sistemi */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Komisyon Sistemi</h2>
            <p className="text-sm text-slate-500">Ders sayısına göre komisyon oranları</p>
          </div>
          <div className="p-5 space-y-4">
            {/* Başlangıç */}
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-red-600">%25</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Başlangıç</p>
                <p className="text-sm text-slate-500">0 - 100 ders arası</p>
              </div>
              <div className="w-24 h-2 bg-red-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-red-500" />
              </div>
            </div>

            {/* Standart */}
            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-amber-600">%20</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Standart</p>
                <p className="text-sm text-slate-500">101 - 200 ders arası</p>
              </div>
              <div className="w-24 h-2 bg-amber-200 rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-amber-500" />
              </div>
            </div>

            {/* Premium */}
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-emerald-600">%15</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Premium</p>
                <p className="text-sm text-slate-500">201+ ders</p>
              </div>
              <div className="w-24 h-2 bg-emerald-200 rounded-full overflow-hidden">
                <div className="w-3/5 h-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
