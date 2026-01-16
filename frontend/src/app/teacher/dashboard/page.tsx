'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function TeacherDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await api.getTeacherDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = dashboard?.monthlyStats || {};
  const upcomingLessons = dashboard?.upcomingLessons || [];
  const wallet = dashboard?.wallet || {};

  return (
    <div className="p-8">
      <div className="card bg-gradient-to-r from-navy-900 to-navy-700 text-white p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold mb-2">Hoş Geldiniz!</h2>
            <p className="text-white/80">
              {upcomingLessons.length > 0 ? `Bugün ${upcomingLessons.length} dersiniz var.` : 'Bugün planlanmış dersiniz yok.'}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center px-6 py-3 bg-white/10 rounded-xl">
              <div className="font-display text-2xl font-bold">{stats.completedLessons || 0}</div>
              <div className="text-sm text-navy-200">Bu Ay Ders</div>
            </div>
            <div className="text-center px-6 py-3 bg-white/10 rounded-xl">
              <div className="font-display text-2xl font-bold">₺{stats.earnings || 0}</div>
              <div className="text-sm text-navy-200">Bu Ay Kazanç</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-navy-900">Yaklaşan Dersler</h3>
              <span className="text-sm text-slate-500">{upcomingLessons.length} ders</span>
            </div>
            {upcomingLessons.length > 0 ? (
              <div className="space-y-4">
                {upcomingLessons.map((lesson: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center font-semibold text-navy-600">
                        {lesson.studentName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-navy-900">{lesson.studentName}</div>
                        <div className="text-sm text-slate-500">{lesson.subject}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-navy-900">
                        {new Date(lesson.scheduledAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(lesson.scheduledAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Yaklaşan ders bulunmuyor</p>
                <Link href="/teacher/availability" className="text-navy-600 hover:underline text-sm mt-2 inline-block">
                  Müsaitlik ekleyin →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-gold-500 to-gold-600 text-white p-6">
            <div className="mb-6">
              <div className="text-white/80 text-sm mb-1">Kullanılabilir Bakiye</div>
              <div className="font-display text-3xl font-bold">₺{wallet.availableBalance || 0}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-xl p-3">
                <div className="text-white/80 text-sm">Bu Ay Kazanç</div>
                <div className="font-display text-xl font-bold">₺{stats.earnings || 0}</div>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <div className="text-white/80 text-sm">Bekleyen</div>
                <div className="font-display text-xl font-bold">₺{wallet.pendingBalance || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
