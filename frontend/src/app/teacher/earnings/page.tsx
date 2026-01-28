'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
        student_name: studentMap.get(l.student_id) || 'Ogrenci',
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
        <h1 className="font-display text-2xl font-bold text-slate-900">Kazanclarim</h1>
        <p className="text-slate-600 mt-1">Kazanc ozeti ve islem gecmisi</p>
      </div>

      {/* Ozet Kartlari */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <span className="text-sm font-medium text-slate-500">Toplam Kazanc</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(stats.totalEarnings)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <span className="text-sm font-medium text-slate-500">Bu Ay</span>
          <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(stats.thisMonth)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <span className="text-sm font-medium text-slate-500">Gecen Ay</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(stats.lastMonth)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <span className="text-sm font-medium text-slate-500">Tamamlanan Ders</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.completedLessons}</p>
        </div>
      </div>

      {/* Aylik Grafik */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <h2 className="font-semibold text-slate-900 mb-6">Aylik Kazanc</h2>
        <div className="flex items-end gap-4 h-48">
          {monthlyData.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: '160px' }}>
                <div
                  className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all"
                  style={{ height: `${(m.earnings / maxEarning) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 mt-2">{m.month}</span>
              <span className="text-xs font-medium text-slate-700">{m.lessons} ders</span>
            </div>
          ))}
        </div>
      </div>

      {/* Islem Gecmisi */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Islem Gecmisi</h2>
        </div>
        
        {earnings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600">Henuz tamamlanmis ders bulunmuyor.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-4 px-6 font-medium text-slate-600">Ders</th>
                <th className="text-left py-4 px-6 font-medium text-slate-600">Ogrenci</th>
                <th className="text-left py-4 px-6 font-medium text-slate-600">Tarih</th>
                <th className="text-right py-4 px-6 font-medium text-slate-600">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {earnings.slice(0, 10).map((e) => (
                <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6 font-medium text-slate-900">{e.subject}</td>
                  <td className="py-4 px-6 text-slate-600">{e.student_name}</td>
                  <td className="py-4 px-6 text-slate-600">{formatDate(e.completed_at)}</td>
                  <td className="py-4 px-6 text-right font-medium text-green-600">{formatCurrency(e.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
