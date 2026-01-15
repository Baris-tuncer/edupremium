'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

// ============================================
// TEACHER SIDEBAR
// ============================================
const TeacherSidebar = ({ activeItem, user }: { activeItem: string; user: any }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'lessons', label: 'Derslerim', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'availability', label: 'Müsaitlik', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'students', label: 'Öğrencilerim', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'feedback', label: 'Değerlendirmeler', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'earnings', label: 'Kazançlarım', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'profile', label: 'Profilim', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'settings', label: 'Ayarlar', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const getInitials = () => {
    if (!user) return '??';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '??';
  };

  const getFullName = () => {
    if (!user) return 'Yükleniyor...';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Kullanıcı';
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-navy flex flex-col z-40">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <span className="font-display text-xl font-semibold text-white">EduPremium</span>
            <span className="block text-2xs text-navy-300 uppercase tracking-widest">Öğretmen Paneli</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link key={item.id} href={`/teacher/${item.id}`} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeItem === item.id ? 'bg-white/10 text-white' : 'text-navy-200 hover:bg-white/5 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
            </svg>
            <span className="font-medium">{item.label}</span>
            {activeItem === item.id && <span className="ml-auto w-1.5 h-1.5 bg-gold-400 rounded-full" />}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center font-display font-semibold text-navy-900">{getInitials()}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">{getFullName()}</div>
            <div className="text-sm text-navy-300">Öğretmen</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const TeacherHeader = () => (
  <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 px-8 flex items-center justify-between">
    <div><h1 className="text-xl font-display font-semibold text-navy-900">Öğretmen Paneli</h1></div>
    <div className="flex items-center gap-4">
      <button className="relative p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-50 rounded-lg transition-colors">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full" />
      </button>
    </div>
  </header>
);

export default function TeacherDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        window.location.href = '/login';
        return;
      }
      try {
        const [userData, dashboardData] = await Promise.all([
          api.getMe(),
          api.getTeacherDashboard(),
        ]);
        setUser(userData);
        setDashboard(dashboardData);
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        if (error?.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const profile = dashboard?.profile || {};
  const stats = dashboard?.monthlyStats || {};
  const upcomingLessons = dashboard?.upcomingLessons || [];
  const wallet = dashboard?.wallet || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherSidebar activeItem="dashboard" user={user} />
      <TeacherHeader />
      <main className="ml-64 pt-16 p-8">
        <div className="card bg-gradient-to-r from-navy-900 to-navy-700 text-white p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold mb-2 text-white">Hoş Geldiniz, {user?.firstName || 'Öğretmen'}!</h2>
              <p className="text-white/80">{upcomingLessons.length > 0 ? `Bugün ${upcomingLessons.length} dersiniz var.` : 'Bugün planlanmış dersiniz yok.'}</p>
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
                        <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center font-semibold text-navy-600">{lesson.student?.firstName?.charAt(0) || 'Ö'}</div>
                        <div>
                          <div className="font-medium text-navy-900">{lesson.student?.firstName} {lesson.student?.lastName?.charAt(0)}.</div>
                          <div className="text-sm text-slate-500">{lesson.subject?.name || 'Ders'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-navy-900">{new Date(lesson.scheduledAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-sm text-slate-500">{new Date(lesson.scheduledAt).toLocaleDateString('tr-TR')}</div>
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
                  <Link href="/teacher/availability" className="text-navy-600 hover:underline text-sm mt-2 inline-block">Müsaitlik ekleyin →</Link>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div className="card bg-gradient-to-br from-gold-500 to-gold-600 text-white p-6">
              <div className="flex items-center justify-between mb-4"><span className="text-white/80">Ocak 2026</span></div>
              <div className="mb-6">
                <div className="text-white/80 text-sm mb-1">Kullanılabilir Bakiye</div>
                <div className="font-display text-3xl font-bold">₺{wallet?.balance || 0}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-xl p-3">
                  <div className="text-white/80 text-sm">Bu Ay Kazanç</div>
                  <div className="font-display text-xl font-bold">₺{stats.earnings || 0}</div>
                </div>
                <div className="bg-white/20 rounded-xl p-3">
                  <div className="text-white/80 text-sm">Bekleyen</div>
                  <div className="font-display text-xl font-bold">₺{wallet?.pendingBalance || 0}</div>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-display text-lg font-semibold text-navy-900 mb-4">Haftalık İstatistikler</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="font-display text-2xl font-bold text-navy-900">{stats.completedLessons || 0}</div>
                  <div className="text-sm text-slate-500">Tamamlanan Ders</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="font-display text-2xl font-bold text-navy-900">-</div>
                  <div className="text-sm text-slate-500">Ortalama Puan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
