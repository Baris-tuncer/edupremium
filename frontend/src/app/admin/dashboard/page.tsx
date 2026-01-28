'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalTeachers: number;
  totalStudents: number;
  totalLessons: number;
  completedLessons: number;
  totalRevenue: number;
  platformCommission: number;
  thisMonthRevenue: number;
  thisMonthLessons: number;
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
    thisMonthRevenue: 0,
    thisMonthLessons: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Ogretmen sayisi
      const { count: teacherCount } = await supabase
        .from('teacher_profiles')
        .select('*', { count: 'exact', head: true });

      // Ogrenci sayisi
      const { count: studentCount } = await supabase
        .from('student_profiles')
        .select('*', { count: 'exact', head: true });

      // Tum dersler
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, price, status, scheduled_at');

      const totalLessons = lessons?.length || 0;
      const completedLessons = lessons?.filter(l => l.status === 'COMPLETED').length || 0;
      const totalRevenue = lessons?.filter(l => l.status === 'COMPLETED')
        .reduce((sum, l) => sum + (l.price || 0), 0) || 0;

      // Platform komisyonu (%25)
      const platformCommission = Math.round(totalRevenue * 0.25);

      // Bu ay
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const thisMonthLessons = lessons?.filter(l => 
        l.status === 'COMPLETED' && l.scheduled_at >= monthStart
      ) || [];
      const thisMonthRevenue = thisMonthLessons.reduce((sum, l) => sum + (l.price || 0), 0);

      setStats({
        totalTeachers: teacherCount || 0,
        totalStudents: studentCount || 0,
        totalLessons,
        completedLessons,
        totalRevenue,
        platformCommission,
        thisMonthRevenue,
        thisMonthLessons: thisMonthLessons.length
      });
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) => n.toLocaleString('tr-TR') + ' TL';

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Platform genel bakis</p>
      </div>

      {/* Ana Istatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Toplam Ogretmen</span>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalTeachers}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Toplam Ogrenci</span>
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Tamamlanan Ders</span>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.completedLessons}</p>
          <p className="text-sm text-slate-400 mt-1">Toplam: {stats.totalLessons}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Toplam Gelir</span>
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      {/* Finansal Ozet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <span className="text-sm font-medium text-green-100">Bu Ay Gelir</span>
          <p className="text-3xl font-bold mt-2">{formatCurrency(stats.thisMonthRevenue)}</p>
          <p className="text-sm text-green-100 mt-1">{stats.thisMonthLessons} ders</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <span className="text-sm font-medium text-blue-100">Platform Komisyonu</span>
          <p className="text-3xl font-bold mt-2">{formatCurrency(stats.platformCommission)}</p>
          <p className="text-sm text-blue-100 mt-1">%25 komisyon</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <span className="text-sm font-medium text-purple-100">Ogretmen Odemeleri</span>
          <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue - stats.platformCommission)}</p>
          <p className="text-sm text-purple-100 mt-1">Net odenen</p>
        </div>
      </div>

      {/* Komisyon Sistemi Bilgisi */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Komisyon Sistemi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="font-medium text-slate-900">Baslangic</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">%25</p>
            <p className="text-sm text-slate-500">0-100 ders</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="font-medium text-slate-900">Standart</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">%20</p>
            <p className="text-sm text-slate-500">101-200 ders</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="font-medium text-slate-900">Premium</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">%15</p>
            <p className="text-sm text-slate-500">201+ ders</p>
          </div>
        </div>
      </div>
    </div>
  );
}
