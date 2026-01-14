'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

// ============================================
// TEACHER DETAIL MODAL
// ============================================
const TeacherDetailModal = ({ teacherId, onClose, onApprove }: { 
  teacherId: string; 
  onClose: () => void;
  onApprove: () => void;
}) => {
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const data = await api.getTeacherById(teacherId);
        setTeacher(data);
      } catch (error) {
        console.error('Teacher fetch error:', error);
        alert('Öğretmen bilgileri yüklenemedi!');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId]);

  const handleApprove = async () => {
    if (!confirm('Bu öğretmeni onaylamak istediğinizden emin misiniz?')) return;
    
    try {
      setApproving(true);
      await api.approveTeacher(teacherId);
      alert('Öğretmen başarıyla onaylandı! Artık sistemde aktif.');
      window.location.reload();
    } catch (error) {
      console.error('Approve error:', error);
      alert('Onaylama başarısız!');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!teacher) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-navy-900">Öğretmen Detayları</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid md:grid-cols-2 gap-8">
          {/* Left Side - Media */}
          <div className="space-y-6">
            {/* Profile Photo */}
            <div>
              <h3 className="font-semibold text-navy-900 mb-3">Profil Fotoğrafı</h3>
              {teacher.profilePhotoUrl ? (
                <img 
                  src={teacher.profilePhotoUrl} 
                  alt={teacher.firstName}
                  className="w-full aspect-square object-cover rounded-xl border-2 border-slate-200"
                />
              ) : (
                <div className="w-full aspect-square bg-slate-100 rounded-xl flex items-center justify-center">
                  <span className="text-6xl font-display font-bold text-slate-400">
                    {teacher.firstName[0]}{teacher.lastName[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Intro Video */}
            {teacher.introVideoUrl && (
              <div>
                <h3 className="font-semibold text-navy-900 mb-3">Tanıtım Videosu</h3>
                <video 
                  src={teacher.introVideoUrl} 
                  controls 
                  className="w-full rounded-xl border-2 border-slate-200"
                />
              </div>
            )}
          </div>

          {/* Right Side - Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-2xl font-display font-bold text-navy-900 mb-1">
                {teacher.firstName} {teacher.lastName}
              </h3>
              <p className="text-slate-600">{teacher.email}</p>
            </div>

            {/* Branch */}
            <div>
              <h4 className="font-semibold text-navy-900 mb-2">Branş</h4>
              <div className="badge badge-navy">{teacher.branch.name}</div>
            </div>

            {/* Hourly Rate */}
            <div>
              <h4 className="font-semibold text-navy-900 mb-2">Saatlik Ücret</h4>
              <p className="text-2xl font-display font-bold text-gold-600">
                ₺{Number(teacher.hourlyRate).toFixed(0)}
              </p>
            </div>

            {/* Bio */}
            {teacher.bio && (
              <div>
                <h4 className="font-semibold text-navy-900 mb-2">Hakkında</h4>
                <p className="text-slate-700 whitespace-pre-wrap">{teacher.bio}</p>
              </div>
            )}

            {/* Subjects */}
            {teacher.subjects && teacher.subjects.length > 0 && (
              <div>
                <h4 className="font-semibold text-navy-900 mb-2">Dersler</h4>
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects.map((ts: any) => (
                    <span key={ts.id} className="badge badge-emerald">
                      {ts.subject?.name || 'Bilinmiyor'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* IBAN */}
            {teacher.iban && (
              <div>
                <h4 className="font-semibold text-navy-900 mb-2">IBAN</h4>
                <p className="font-mono text-sm text-slate-600">{teacher.iban}</p>
              </div>
            )}

            {/* Native */}
            <div>
              <h4 className="font-semibold text-navy-900 mb-2">Öğretmen Tipi</h4>
              <span className={`badge ${teacher.isNative ? 'badge-violet' : 'badge-slate'}`}>
                {teacher.isNative ? 'Native Speaker' : 'Türk Öğretmen'}
              </span>
            </div>

            {/* Registration Date */}
            <div>
              <h4 className="font-semibold text-navy-900 mb-2">Kayıt Tarihi</h4>
              <p className="text-slate-600">
                {new Date(teacher.createdAt).toLocaleDateString('tr-TR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary py-3"
          >
            Kapat
          </button>
          <button
            onClick={handleApprove}
            disabled={approving}
            className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {approving ? 'Onaylanıyor...' : '✓ Onayla'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  value: string | number;
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
const PendingApprovals = ({ teachers, onRefresh }: { teachers: any[]; onRefresh: () => void }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  return (
    <>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-navy-900">Onay Bekleyen Öğretmenler</h3>
          <span className="badge badge-warning">{teachers.length} adet</span>
        </div>

        {teachers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Onay bekleyen öğretmen bulunmuyor
          </div>
        ) : (
          <div className="space-y-4">
            {teachers.slice(0, 3).map((teacher) => (
              <div key={teacher.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center font-display font-semibold text-navy-700">
                  {teacher.firstName[0]}{teacher.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-navy-900">{teacher.firstName} {teacher.lastName}</div>
                  <div className="text-sm text-slate-500">{teacher.email}</div>
                </div>
                <div className="text-right">
                  <div className="badge badge-navy">{teacher.branch.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{new Date(teacher.createdAt).toLocaleDateString('tr-TR')}</div>
                </div>
                <button 
                  onClick={() => setSelectedTeacherId(teacher.id)}
                  className="px-4 py-2 bg-navy-500 text-white rounded-lg hover:bg-navy-600 transition-colors font-medium"
                >
                  İncele
                </button>
              </div>
            ))}
          </div>
        )}

        {teachers.length > 0 && (
          <Link href="/admin/teachers?status=pending" className="btn-secondary w-full mt-6">
            Tümünü Gör ({teachers.length})
          </Link>
        )}
      </div>

      {selectedTeacherId && (
        <TeacherDetailModal
          teacherId={selectedTeacherId}
          onClose={() => setSelectedTeacherId(null)}
          onApprove={onRefresh}
        />
      )}
    </>
  );
};

// ============================================
// MAIN DASHBOARD
// ============================================
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboardData, teachersData] = await Promise.all([
        api.getAdminDashboard(),
        api.getAllTeachers()
      ]);
      
      setStats(dashboardData);
      setTeachers(teachersData.filter((t: any) => !t.isApproved));
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar activeItem="dashboard" />

      <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-slate-200 z-30 px-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold text-navy-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Hoş geldiniz, Admin</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/invitations" className="btn-primary py-2 px-4 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Davet Kodu Oluştur
          </Link>
        </div>
      </header>

      <main className="ml-64 pt-16 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            label="Toplam Öğretmen"
            value={stats?.totalTeachers || 0}
            color="navy"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            label="Toplam Öğrenci"
            value={stats?.totalStudents || 0}
            color="emerald"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            label="Toplam Ders"
            value={stats?.totalAppointments || 0}
            color="violet"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Toplam Gelir"
            value={`₺${(stats?.totalRevenue || 0).toLocaleString('tr-TR')}`}
            color="gold"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>}
            label="Bu Ay Gelir"
            value={`₺${(stats?.monthlyRevenue || 0).toLocaleString('tr-TR')}`}
            color="rose"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PendingApprovals teachers={teachers} onRefresh={fetchData} />
          </div>

          <div className="space-y-8">
            <div className="card p-6">
              <h3 className="font-display font-semibold text-navy-900 mb-4">Hızlı İşlemler</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/teachers" className="p-4 bg-slate-50 rounded-xl text-center hover:bg-slate-100 transition-colors">
                  <div className="text-2xl mb-2">👨‍🏫</div>
                  <div className="text-sm font-medium text-slate-700">Öğretmenler</div>
                </Link>
                <Link href="/admin/students" className="p-4 bg-slate-50 rounded-xl text-center hover:bg-slate-100 transition-colors">
                  <div className="text-2xl mb-2">👨‍🎓</div>
                  <div className="text-sm font-medium text-slate-700">Öğrenciler</div>
                </Link>
                <Link href="/admin/appointments" className="p-4 bg-slate-50 rounded-xl text-center hover:bg-slate-100 transition-colors">
                  <div className="text-2xl mb-2">📅</div>
                  <div className="text-sm font-medium text-slate-700">Randevular</div>
                </Link>
                <Link href="/admin/invitations" className="p-4 bg-slate-50 rounded-xl text-center hover:bg-slate-100 transition-colors">
                  <div className="text-2xl mb-2">🎟️</div>
                  <div className="text-sm font-medium text-slate-700">Davet Kodları</div>
                </Link>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-display font-semibold text-navy-900 mb-4">Özet İstatistikler</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Aktif Öğretmen</span>
                  <span className="font-semibold text-navy-900">{stats?.activeTeachers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Onay Bekleyen</span>
                  <span className="font-semibold text-amber-600">{stats?.pendingTeachers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Aktif Öğrenci</span>
                  <span className="font-semibold text-navy-900">{stats?.activeStudents || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Tamamlanan Ders</span>
                  <span className="font-semibold text-emerald-600">{stats?.completedAppointments || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
