'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ============================================
// SIDEBAR COMPONENT
// ============================================
const Sidebar = ({ activeItem }: { activeItem: string }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'appointments', label: 'Derslerim', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'teachers', label: 'Öğretmenler', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'reports', label: 'Raporlar', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'payments', label: 'Ödemeler', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 'settings', label: 'Ayarlar', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

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
            AY
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-900 truncate">Ali Yılmaz</div>
            <div className="text-sm text-slate-500">11. Sınıf</div>
          </div>
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
    </aside>
  );
};

// ============================================
// HEADER COMPONENT
// ============================================
const DashboardHeader = () => (
  <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 px-8 flex items-center justify-between">
    <div>
      <h1 className="text-xl font-display font-semibold text-navy-900">Hoş Geldin, Ali</h1>
    </div>
    <div className="flex items-center gap-4">
      {/* Search */}
      <div className="relative">
        <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Öğretmen ara..."
          className="pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-lg text-sm w-64 focus:ring-2 focus:ring-navy-500/20 focus:bg-white transition-all"
        />
      </div>

      {/* Notifications */}
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
// STAT CARD
// ============================================
const StatCard = ({ icon, label, value, change, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  color: 'navy' | 'gold' | 'emerald' | 'violet';
}) => {
  const colors = {
    navy: 'bg-navy-100 text-navy-600',
    gold: 'bg-gold-100 text-gold-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    violet: 'bg-violet-100 text-violet-600',
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        {change && (
          <span className="text-sm font-medium text-emerald-600">{change}</span>
        )}
      </div>
      <div className="font-display text-3xl font-bold text-navy-900 mb-1">{value}</div>
      <div className="text-slate-500">{label}</div>
    </div>
  );
};

// ============================================
// UPCOMING LESSON CARD
// ============================================
const UpcomingLessonCard = ({ lesson }: { lesson: any }) => (
  <div className="card p-5 flex items-center gap-4 hover:shadow-elevated transition-shadow">
    <div className="w-14 h-14 bg-gradient-navy rounded-xl flex items-center justify-center text-white font-display text-xl font-semibold shrink-0">
      {lesson.teacherInitials}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-display font-semibold text-navy-900">{lesson.teacherName}</div>
      <div className="text-slate-500">{lesson.subject}</div>
    </div>
    <div className="text-right shrink-0">
      <div className="font-semibold text-navy-900">{lesson.time}</div>
      <div className="text-sm text-slate-500">{lesson.date}</div>
    </div>
    <Link 
      href={lesson.teamsUrl} 
      className="btn-primary py-2 px-4 text-sm shrink-0"
    >
      Katıl
    </Link>
  </div>
);

// ============================================
// RECENT REPORT CARD
// ============================================
const RecentReportCard = ({ report }: { report: any }) => (
  <div className="card p-5 hover:shadow-elevated transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center text-navy-600 font-display font-semibold">
          {report.teacherInitials}
        </div>
        <div>
          <div className="font-medium text-navy-900">{report.subject}</div>
          <div className="text-sm text-slate-500">{report.date}</div>
        </div>
      </div>
      <span className={`badge ${report.score >= 4 ? 'badge-success' : report.score >= 3 ? 'badge-gold' : 'badge-warning'}`}>
        {report.score}/5
      </span>
    </div>
    <p className="text-sm text-slate-600 line-clamp-2">{report.summary}</p>
    <Link href={`/student/reports/${report.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-navy-600 hover:text-navy-800 mt-3">
      Raporu Oku
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  </div>
);

// ============================================
// MAIN DASHBOARD
// ============================================
export default function StudentDashboard() {
  const upcomingLessons = [
    { id: 1, teacherName: 'Mehmet Ö.', teacherInitials: 'MÖ', subject: 'Matematik', date: 'Bugün', time: '15:00', teamsUrl: '#' },
    { id: 2, teacherName: 'Ayşe K.', teacherInitials: 'AK', subject: 'Fizik', date: 'Yarın', time: '10:00', teamsUrl: '#' },
    { id: 3, teacherName: 'Can D.', teacherInitials: 'CD', subject: 'İngilizce', date: '15 Ocak', time: '14:30', teamsUrl: '#' },
  ];

  const recentReports = [
    { id: 1, teacherInitials: 'MÖ', subject: 'Matematik', date: '10 Ocak 2026', score: 4.5, summary: 'Ali bu derste türev konusunu çok iyi kavradı. Özellikle zincir kuralı uygulamalarında başarılı oldu.' },
    { id: 2, teacherInitials: 'AK', subject: 'Fizik', date: '8 Ocak 2026', score: 4, summary: 'Hareket konusunda iyi ilerleme kaydedildi. Serbest düşme problemlerinde pratik yapılması önerilir.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar activeItem="dashboard" />
      <DashboardHeader />

      {/* Main Content */}
      <main className="ml-64 pt-16 p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Yaklaşan Dersler"
            value="3"
            color="navy"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Tamamlanan Dersler"
            value="24"
            change="+3 bu ay"
            color="emerald"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
            label="Ortalama Puan"
            value="4.3"
            color="gold"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Bu Ay Harcama"
            value="₺1,350"
            color="violet"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Lessons */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-navy-900">Yaklaşan Dersler</h2>
              <Link href="/student/appointments" className="text-sm font-medium text-navy-600 hover:text-navy-800">
                Tümünü Gör
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingLessons.map((lesson) => (
                <UpcomingLessonCard key={lesson.id} lesson={lesson} />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h2 className="font-display text-xl font-semibold text-navy-900 mb-6">Hızlı İşlemler</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/teachers" className="card-interactive p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center text-navy-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900">Yeni Ders Al</div>
                    <div className="text-sm text-slate-500">Öğretmen bul ve randevu al</div>
                  </div>
                </Link>
                <Link href="/student/reports" className="card-interactive p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center text-gold-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900">Raporları İncele</div>
                    <div className="text-sm text-slate-500">AI destekli ilerleme raporları</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-navy-900">Son Raporlar</h2>
              <Link href="/student/reports" className="text-sm font-medium text-navy-600 hover:text-navy-800">
                Tümü
              </Link>
            </div>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <RecentReportCard key={report.id} report={report} />
              ))}
            </div>

            {/* Progress Card */}
            <div className="card p-6 mt-6 bg-gradient-navy text-white">
              <h3 className="font-display font-semibold mb-4">Aylık İlerleme</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-navy-200">Matematik</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-400 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-navy-200">Fizik</span>
                    <span className="font-medium">70%</span>
                  </div>
                  <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-400 rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-navy-200">İngilizce</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-400 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
