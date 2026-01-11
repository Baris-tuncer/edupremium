'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

// ============================================
// SIDEBAR COMPONENT
// ============================================
const Sidebar = ({ activeItem, user }: { activeItem: string; user: any }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'appointments', label: 'Derslerim', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'teachers', label: 'Öğretmenler', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'reports', label: 'Raporlar', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'payments', label: 'Ödemeler', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
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
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-navy rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-display text-xl font-semibold text-navy-900">EduPremium</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={`/student/${item.id}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeItem === item.id
                ? 'bg-navy-50 text-navy-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
            </svg>
            <span className="font-medium">{item.label}</span>
            {activeItem === item.id && (
              <span className="ml-auto w-1.5 h-1.5 bg-gold-500 rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center font-display font-semibold text-navy-700">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-navy-900 truncate">{getFullName()}</div>
            <div className="text-sm text-slate-500">Öğrenci</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ============================================
// HEADER
// ============================================
const Header = ({ user }: { user: any }) => (
  <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 px-8 flex items-center justify-between">
    <div>
      <h1 className="text-xl font-display font-semibold text-navy-900">
        Merhaba, {user?.firstName || 'Öğrenci'}!
      </h1>
      <p className="text-sm text-slate-500">Bugün harika bir gün olacak 🌟</p>
    </div>
    <div className="flex items-center gap-4">
      <Link href="/teachers" className="btn-primary py-2 px-4 text-sm">
        Öğretmen Bul
      </Link>
      <button className="relative p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-50 rounded-lg transition-colors">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full" />
      </button>
    </div>
  </header>
);

// ============================================
// MAIN PAGE
// ============================================
export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
        
        try {
          const dashboardData = await api.getStudentDashboard();
          setDashboard(dashboardData);
        } catch (e) {
          console.log('Dashboard not available yet');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        window.location.href = '/login';
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

  const upcomingLessons = dashboard?.upcomingLessons || [];
  const recentReports = dashboard?.recentReports || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar activeItem="dashboard" user={user} />
      <Header user={user} />

      <main className="ml-64 pt-16 p-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-navy-900">{dashboard?.totalLessons || 0}</div>
                <div className="text-sm text-slate-500">Toplam Ders</div>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-navy-900">{dashboard?.completedLessons || 0}</div>
                <div className="text-sm text-slate-500">Tamamlanan</div>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-navy-900">{upcomingLessons.length}</div>
                <div className="text-sm text-slate-500">Yaklaşan</div>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-navy-900">{recentReports.length}</div>
                <div className="text-sm text-slate-500">Rapor</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Lessons */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-semibold text-navy-900">Yaklaşan Dersler</h3>
                <Link href="/student/appointments" className="text-navy-600 hover:underline text-sm">
                  Tümünü Gör →
                </Link>
              </div>
              
              {upcomingLessons.length > 0 ? (
                <div className="space-y-4">
                  {upcomingLessons.map((lesson: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center font-semibold text-navy-600">
                          {lesson.teacher?.firstName?.charAt(0) || 'Ö'}
                        </div>
                        <div>
                          <div className="font-medium text-navy-900">
                            {lesson.teacher?.firstName} {lesson.teacher?.lastName?.charAt(0)}.
                          </div>
                          <div className="text-sm text-slate-500">{lesson.subject?.name || 'Ders'}</div>
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
                  <p>Henüz planlanmış ders yok</p>
                  <Link href="/teachers" className="text-navy-600 hover:underline text-sm mt-2 inline-block">
                    Öğretmen bul ve ders al →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-display text-lg font-semibold text-navy-900 mb-4">Hızlı İşlemler</h3>
              <div className="space-y-3">
                <Link href="/teachers" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-navy-900">Öğretmen Bul</div>
                    <div className="text-sm text-slate-500">Yeni ders al</div>
                  </div>
                </Link>
                <Link href="/student/reports" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-navy-900">Raporlarım</div>
                    <div className="text-sm text-slate-500">Ders raporlarını gör</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
