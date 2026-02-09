'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, DollarSign, Calendar, BookOpen, ArrowUpRight, Wallet } from 'lucide-react';

interface Earning {
  id: string;
  subject: string;
  student_name: string;
  price: number;
  completed_at: string;
}

interface MonthlyData {
  month: string;
  earnings: number;
  lessons: number;
}

export default function TeacherEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    completedLessons: 0
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, subject, student_id, price, scheduled_at, status')
        .eq('teacher_id', user.id)
        .eq('status', 'COMPLETED')
        .order('scheduled_at', { ascending: false });

      if (!lessons || lessons.length === 0) {
        setEarnings([]);
        return;
      }

      const studentIds = [...new Set(lessons.map(l => l.student_id).filter(Boolean))];
      const { data: students } = await supabase
        .from('student_profiles')
        .select('id, full_name')
        .in('id', studentIds);

      const studentMap = new Map();
      (students || []).forEach(s => studentMap.set(s.id, s.full_name));

      const formattedEarnings = lessons.map(l => ({
        id: l.id,
        subject: l.subject,
        student_name: studentMap.get(l.student_id) || 'Öğrenci',
        price: l.price || 0,
        completed_at: l.scheduled_at
      }));

      setEarnings(formattedEarnings);

      // Istatistikler
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      let totalEarnings = 0;
      let thisMonth = 0;
      let lastMonth = 0;

      lessons.forEach(l => {
        const price = l.price || 0;
        const date = new Date(l.scheduled_at);
        totalEarnings += price;

        if (date >= thisMonthStart) {
          thisMonth += price;
        } else if (date >= lastMonthStart && date <= lastMonthEnd) {
          lastMonth += price;
        }
      });

      setStats({
        totalEarnings,
        thisMonth,
        lastMonth,
        completedLessons: lessons.length
      });

      // Aylik veri (son 6 ay)
      const monthly: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthName = monthDate.toLocaleDateString('tr-TR', { month: 'short' });

        let monthEarnings = 0;
        let monthLessons = 0;

        lessons.forEach(l => {
          const date = new Date(l.scheduled_at);
          if (date >= monthDate && date <= monthEnd) {
            monthEarnings += l.price || 0;
            monthLessons += 1;
          }
        });

        monthly.push({ month: monthName, earnings: monthEarnings, lessons: monthLessons });
      }

      setMonthlyData(monthly);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) => n.toLocaleString('tr-TR') + ' TL';

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const maxEarning = Math.max(...monthlyData.map(m => m.earnings), 1);

  // Bu ay vs geçen ay karşılaştırma
  const monthChange = stats.lastMonth > 0
    ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth * 100).toFixed(0)
    : stats.thisMonth > 0 ? '100' : '0';
  const isPositiveChange = Number(monthChange) >= 0;

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
          <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8960C] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
            <Wallet className="w-6 h-6 text-[#0F172A]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">Kazançlarım</h1>
            <p className="text-slate-500 text-sm">Kazanç özeti ve işlem geçmişi</p>
          </div>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Toplam Kazanç */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <span className="text-sm font-medium text-slate-400">Toplam Kazanç</span>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalEarnings)}</p>
            <p className="text-xs text-slate-500 mt-2">Tüm zamanlar</p>
          </div>
        </div>

        {/* Bu Ay */}
        <div className="bg-white/80 backdrop-blur-xl border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-600">Bu Ay</span>
            </div>
            {stats.thisMonth > 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                isPositiveChange
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {isPositiveChange ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                %{Math.abs(Number(monthChange))}
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.thisMonth)}</p>
          <p className="text-xs text-slate-500 mt-2">Geçen aya göre</p>
        </div>

        {/* Geçen Ay */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Geçen Ay</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{formatCurrency(stats.lastMonth)}</p>
          <p className="text-xs text-slate-500 mt-2">Önceki dönem</p>
        </div>

        {/* Tamamlanan Ders */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <span className="text-sm font-medium text-slate-600">Tamamlanan Ders</span>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{stats.completedLessons}</p>
          <p className="text-xs text-slate-500 mt-2">Toplam ders sayısı</p>
        </div>
      </div>

      {/* Aylık Grafik */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-lg mb-8 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Aylık Kazanç Grafiği</h2>
              <p className="text-sm text-slate-500 mt-1">Son 6 aylık kazanç performansı</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-t from-[#D4AF37] to-[#F5D572] rounded-sm" />
                <span className="text-slate-600">Kazanç</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-3 h-56">
            {monthlyData.map((m, i) => {
              const heightPercent = (m.earnings / maxEarning) * 100;
              const isCurrentMonth = i === monthlyData.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 px-3 py-2 bg-[#0F172A] text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                    {formatCurrency(m.earnings)}
                  </div>
                  {/* Bar */}
                  <div className="w-full h-40 bg-slate-100/50 rounded-xl relative overflow-hidden">
                    <div
                      className={`absolute bottom-0 w-full rounded-xl transition-all duration-500 ${
                        isCurrentMonth
                          ? 'bg-gradient-to-t from-[#D4AF37] to-[#F5D572]'
                          : 'bg-gradient-to-t from-slate-300 to-slate-200'
                      }`}
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    />
                  </div>
                  {/* Label */}
                  <div className="mt-3 text-center">
                    <span className={`text-sm font-medium ${isCurrentMonth ? 'text-[#D4AF37]' : 'text-slate-600'}`}>
                      {m.month}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">{m.lessons} ders</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* İşlem Geçmişi */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">İşlem Geçmişi</h2>
            <p className="text-sm text-slate-500 mt-1">Tamamlanan derslerin listesi</p>
          </div>
          {earnings.length > 10 && (
            <button className="text-sm text-[#D4AF37] hover:text-[#B8960C] font-medium flex items-center gap-1">
              Tümünü Gör <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {earnings.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Henüz tamamlanmış ders bulunmuyor</p>
            <p className="text-slate-400 text-sm mt-1">Derslerinizi tamamladıkça burada görünecek</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Ders</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Öğrenci</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Tarih</th>
                  <th className="text-right py-4 px-6 font-semibold text-slate-700 text-sm">Kazanç</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {earnings.slice(0, 10).map((e, index) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#0F172A] font-semibold text-sm">
                          {e.subject?.charAt(0) || 'D'}
                        </div>
                        <span className="font-medium text-slate-900">{e.subject}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-600">{e.student_name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-500 text-sm">{formatDate(e.completed_at)}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold text-sm">
                        +{formatCurrency(e.price)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
