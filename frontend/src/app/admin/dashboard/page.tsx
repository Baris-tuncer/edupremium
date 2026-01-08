'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ============================================
// ADMIN SIDEBAR
// ============================================
const AdminSidebar = ({ activeItem }: { activeItem: string }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
    { id: 'teachers', label: 'Öğretmenler', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'students', label: 'Öğrenciler', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'invitations', label: 'Davet Kodları', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
    { id: 'appointments', label: 'Randevular', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'payments', label: 'Ödemeler', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 'hakedis', label: 'Hakediş', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z' },
    { id: 'reports', label: 'Raporlar', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'settings', label: 'Sistem Ayarları', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <span className="font-display text-xl font-semibold text-white">EduPremium</span>
            <span className="block text-2xs text-slate-400 uppercase tracking-widest">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={`/admin/${item.id}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeItem === item.id
                ? 'bg-gold-500 text-slate-900'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
            </svg>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Admin User */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-display font-semibold text-white">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">Admin</div>
            <div className="text-sm text-slate-400">Sistem Yöneticisi</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ============================================
// STAT CARD
// ============================================
const StatCard = ({ icon, label, value, change, trend, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  color: 'navy' | 'gold' | 'emerald' | 'violet' | 'rose';
}) => {
  const colors = {
    navy: 'bg-navy-500',
    gold: 'bg-gold-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
        {change && (
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <div className="font-display text-3xl font-bold text-navy-900 mb-1">{value}</div>
      <div className="text-slate-500">{label}</div>
    </div>
  );
};

// ============================================
// PENDING APPROVALS
// ============================================
const PendingApprovals = () => {
  const pendingTeachers = [
    { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@email.com', branch: 'Fizik', date: '14 Ocak 2026' },
    { id: 2, name: 'Fatma Demir', email: 'fatma@email.com', branch: 'Kimya', date: '13 Ocak 2026' },
    { id: 3, name: 'Mustafa Kaya', email: 'mustafa@email.com', branch: 'Biyoloji', date: '12 Ocak 2026' },
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-navy-900">Onay Bekleyen Öğretmenler</h3>
        <span className="badge badge-warning">{pendingTeachers.length} adet</span>
      </div>

      <div className="space-y-4">
        {pendingTeachers.map((teacher) => (
          <div key={teacher.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center font-display font-semibold text-navy-700">
              {teacher.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-navy-900">{teacher.name}</div>
              <div className="text-sm text-slate-500">{teacher.email}</div>
            </div>
            <div className="text-right">
              <div className="badge badge-navy">{teacher.branch}</div>
              <div className="text-xs text-slate-400 mt-1">{teacher.date}</div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Link href="/admin/teachers?status=pending" className="btn-secondary w-full mt-6">
        Tümünü Gör
      </Link>
    </div>
  );
};

// ============================================
// PENDING BANK TRANSFERS
// ============================================
const PendingBankTransfers = () => {
  const transfers = [
    { id: 1, student: 'Ali Yılmaz', amount: 450, orderCode: 'ORD-2026-ABC123', date: '15 Ocak 2026', deadline: '2 saat' },
    { id: 2, student: 'Zeynep Kaya', amount: 400, orderCode: 'ORD-2026-DEF456', date: '14 Ocak 2026', deadline: '5 saat' },
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-navy-900">Bekleyen Havale/EFT</h3>
        <span className="badge badge-gold">{transfers.length} adet</span>
      </div>

      <div className="space-y-4">
        {transfers.map((transfer) => (
          <div key={transfer.id} className="p-4 border border-amber-200 bg-amber-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-navy-900">{transfer.student}</div>
                <div className="text-sm text-slate-500 font-mono">{transfer.orderCode}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl font-bold text-navy-900">₺{transfer.amount}</div>
                <div className="text-xs text-amber-600">Son: {transfer.deadline}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 btn-primary py-2 text-sm">Onayla</button>
              <button className="flex-1 btn-secondary py-2 text-sm">Reddet</button>
            </div>
          </div>
        ))}
      </div>

      <Link href="/admin/payments?type=bank_transfer&status=pending" className="btn-secondary w-full mt-6">
        Tümünü Gör
      </Link>
    </div>
  );
};

// ============================================
// RECENT ACTIVITY
// ============================================
const RecentActivity = () => {
  const activities = [
    { id: 1, type: 'teacher_approved', text: 'Mehmet Öztürk öğretmen olarak onaylandı', time: '5 dk önce' },
    { id: 2, type: 'payment_received', text: 'Ali Yılmaz ₺450 ödeme yaptı', time: '15 dk önce' },
    { id: 3, type: 'lesson_completed', text: 'Matematik dersi tamamlandı', time: '1 saat önce' },
    { id: 4, type: 'new_registration', text: 'Yeni öğrenci kaydı: Zeynep K.', time: '2 saat önce' },
    { id: 5, type: 'feedback_submitted', text: 'Ders değerlendirmesi gönderildi', time: '3 saat önce' },
  ];

  const typeIcons: Record<string, { icon: string; color: string }> = {
    teacher_approved: { icon: '✓', color: 'bg-emerald-100 text-emerald-600' },
    payment_received: { icon: '₺', color: 'bg-gold-100 text-gold-600' },
    lesson_completed: { icon: '📚', color: 'bg-navy-100 text-navy-600' },
    new_registration: { icon: '👤', color: 'bg-violet-100 text-violet-600' },
    feedback_submitted: { icon: '⭐', color: 'bg-amber-100 text-amber-600' },
  };

  return (
    <div className="card p-6">
      <h3 className="font-display font-semibold text-navy-900 mb-6">Son Aktiviteler</h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${typeIcons[activity.type].color}`}>
              {typeIcons[activity.type].icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-700">{activity.text}</div>
              <div className="text-xs text-slate-400">{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MAIN DASHBOARD
// ============================================
export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar activeItem="dashboard" />

      {/* Header */}
      <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-slate-200 z-30 px-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold text-navy-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Hoş geldiniz, Admin</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn-primary py-2 px-4 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Davet Kodu Oluştur
          </button>
        </div>
      </header>

      <main className="ml-64 pt-16 p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            label="Toplam Öğretmen"
            value="248"
            change="12"
            trend="up"
            color="navy"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            label="Toplam Öğrenci"
            value="1,847"
            change="89"
            trend="up"
            color="emerald"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            label="Bu Ay Ders"
            value="3,240"
            change="18%"
            trend="up"
            color="violet"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Bu Ay Gelir"
            value="₺428K"
            change="24%"
            trend="up"
            color="gold"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>}
            label="Bekleyen Hakediş"
            value="₺52K"
            color="rose"
          />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <PendingApprovals />
            <PendingBankTransfers />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <RecentActivity />
            
            {/* Quick Links */}
            <div className="card p-6">
              <h3 className="font-display font-semibold text-navy-900 mb-4">Hızlı İşlemler</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/invitations" className="p-4 bg-slate-50 rounded-xl text-center hover:bg-slate-100 transition-colors">
                  <div className="text-2xl mb-2">🎟️</div>
                  <div className="text-sm font-medium text-slate-700">Davet Kodları</div>
                </Link>
                <Link href="/admin/hakedis" className="p-4 bg-slate-50 rounded-xl text-center hover:bg-slate-100 transition-colors">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-sm font-medium text-slate-700">Hakediş Öde</div>
                </Link>
                <Link href="/admin/reports" className="p-4 bg-slate-50 rounded-xl text-center hover:bg-slate-100 transition-colors">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-medium text-slate-700">Raporlar</div>
                </Link>
                <Link href="/admin/settings" className="p-4 bg-slate-50 rounded-xl text-center hover:bg-slate-100 transition-colors">
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="text-sm font-medium text-slate-700">Ayarlar</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
