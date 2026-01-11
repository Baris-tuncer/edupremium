'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ============================================
// TEACHER SIDEBAR
// ============================================
const TeacherSidebar = ({ activeItem }: { activeItem: string }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'appointments', label: 'Derslerim', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'availability', label: 'Müsaitlik', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'students', label: 'Öğrencilerim', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'feedback', label: 'Değerlendirmeler', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'earnings', label: 'Kazançlarım', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'profile', label: 'Profilim', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'settings', label: 'Ayarlar', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-navy flex flex-col z-40">
      {/* Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={`/teacher/${item.id}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeItem === item.id
                ? 'bg-white/10 text-white'
                : 'text-navy-200 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
            </svg>
            <span className="font-medium">{item.label}</span>
            {activeItem === item.id && (
              <span className="ml-auto w-1.5 h-1.5 bg-gold-400 rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center font-display font-semibold text-navy-900">
            MÖ
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">Mehmet Öztürk</div>
            <div className="text-sm text-navy-300">Matematik</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ============================================
// TEACHER HEADER
// ============================================
const TeacherHeader = () => (
  <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 px-8 flex items-center justify-between">
    <div>
      <h1 className="text-xl font-display font-semibold text-navy-900">Öğretmen Paneli</h1>
    </div>
    <div className="flex items-center gap-4">
      {/* Quick Action */}
      <Link href="/teacher/availability" className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Müsaitlik Ekle
      </Link>

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
// EARNINGS CARD
// ============================================
const EarningsCard = () => (
  <div className="card bg-gradient-navy text-white p-6 col-span-full lg:col-span-1">
    <div className="flex items-center justify-between mb-6">
      <h3 className="font-display font-semibold">Kazançlarım</h3>
      <span className="text-sm text-navy-200">Ocak 2026</span>
    </div>
    
    <div className="mb-6">
      <div className="text-sm text-navy-200 mb-1">Kullanılabilir Bakiye</div>
      <div className="font-display text-4xl font-bold">₺12,450</div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white/10 rounded-xl p-4">
        <div className="text-sm text-navy-200 mb-1">Bu Ay Kazanç</div>
        <div className="font-display text-xl font-semibold">₺4,500</div>
      </div>
      <div className="bg-white/10 rounded-xl p-4">
        <div className="text-sm text-navy-200 mb-1">Bekleyen</div>
        <div className="font-display text-xl font-semibold">₺900</div>
      </div>
    </div>

    <button className="w-full py-3 bg-gold-500 text-navy-900 font-semibold rounded-xl hover:bg-gold-400 transition-colors">
    </button>
  </div>
);

// ============================================
// TODAY'S LESSONS
// ============================================
const TodaysLessons = () => {
  const lessons = [
    { id: 1, student: 'Ali Y.', subject: 'Matematik', time: '10:00', status: 'completed' },
    { id: 2, student: 'Zeynep K.', subject: 'Geometri', time: '14:00', status: 'upcoming' },
    { id: 3, student: 'Emre D.', subject: 'Matematik', time: '16:00', status: 'upcoming' },
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-navy-900">Bugünkü Dersler</h3>
        <span className="badge badge-navy">{lessons.length} ders</span>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center font-display font-semibold text-navy-700">
              {lesson.student.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-medium text-navy-900">{lesson.student}</div>
              <div className="text-sm text-slate-500">{lesson.subject}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-navy-900">{lesson.time}</div>
              {lesson.status === 'completed' ? (
                <span className="text-xs text-emerald-600">Tamamlandı</span>
              ) : (
                <span className="text-xs text-gold-600">Bekliyor</span>
              )}
            </div>
            {lesson.status === 'upcoming' && (
              <Link href="/teacher/availability" className="btn-primary py-2 px-4 text-sm flex items-center gap-2">Başlat</Link>
            )}
            {lesson.status === 'completed' && (
              <Link href={`/teacher/feedback/${lesson.id}`} className="btn-secondary py-2 px-4 text-sm">
                Değerlendir
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// PENDING FEEDBACKS
// ============================================
const PendingFeedbacks = () => {
  const pending = [
    { id: 1, student: 'Ali Y.', subject: 'Matematik', date: '14 Ocak 2026' },
    { id: 2, student: 'Selin A.', subject: 'Geometri', date: '13 Ocak 2026' },
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-navy-900">Bekleyen Değerlendirmeler</h3>
        <span className="badge badge-warning">{pending.length} adet</span>
      </div>

      <div className="space-y-3">
        {pending.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 border border-amber-200 bg-amber-50 rounded-xl">
            <div>
              <div className="font-medium text-navy-900">{item.student} - {item.subject}</div>
              <div className="text-sm text-slate-500">{item.date}</div>
            </div>
            <Link href={`/teacher/feedback/${item.id}`} className="btn-gold py-2 px-4 text-sm">
              Değerlendir
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// WEEKLY STATS
// ============================================
const WeeklyStats = () => (
  <div className="card p-6">
    <h3 className="font-display font-semibold text-navy-900 mb-6">Haftalık İstatistikler</h3>
    
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="text-center p-4 bg-slate-50 rounded-xl">
        <div className="font-display text-3xl font-bold text-navy-900">12</div>
        <div className="text-sm text-slate-500">Tamamlanan Ders</div>
      </div>
      <div className="text-center p-4 bg-slate-50 rounded-xl">
        <div className="font-display text-3xl font-bold text-navy-900">4.9</div>
        <div className="text-sm text-slate-500">Ortalama Puan</div>
      </div>
    </div>

    {/* Simple Bar Chart */}
    <div className="space-y-3">
      {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, i) => {
        const heights = [60, 80, 40, 100, 70, 30, 0];
        return (
          <div key={day} className="flex items-center gap-3">
            <span className="w-8 text-sm text-slate-500">{day}</span>
            <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-navy-500 rounded-full transition-all duration-500"
                style={{ width: `${heights[i]}%` }}
              />
            </div>
            <span className="w-6 text-sm text-slate-600">{Math.round(heights[i] / 20)}</span>
          </div>
        );
      })}
    </div>
  </div>
);

// ============================================
// MAIN DASHBOARD
// ============================================
export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherSidebar activeItem="dashboard" />
      <TeacherHeader />

      <main className="ml-64 pt-16 p-8">
        {/* Welcome Banner */}
        <div className="card bg-gradient-to-r from-navy-900 to-navy-700 text-white p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold mb-2 text-white">Hoş Geldiniz!</h2>
              <p className="text-white/80">Bugün 3 dersiniz var. İlk ders saat 10:00'da.</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center px-6 py-3 bg-white/10 rounded-xl">
                <div className="font-display text-2xl font-bold">1,240</div>
                <div className="text-sm text-navy-200">Toplam Ders</div>
              </div>
              <div className="text-center px-6 py-3 bg-white/10 rounded-xl">
                <div className="font-display text-2xl font-bold">4.9</div>
                <div className="text-sm text-navy-200">Puan</div>
              </div>
              <div className="text-center px-6 py-3 bg-white/10 rounded-xl">
                <div className="font-display text-2xl font-bold">128</div>
                <div className="text-sm text-navy-200">Değerlendirme</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <TodaysLessons />
            <PendingFeedbacks />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <EarningsCard />
            <WeeklyStats />
          </div>
        </div>
      </main>
    </div>
  );
}
