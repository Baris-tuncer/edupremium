'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/price-calculator';

interface GroupClass {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  scheduled_at: string;
  duration_minutes: number;
  min_capacity: number;
  max_capacity: number;
  net_price: number;
  display_price: number;
  status: string;
  meeting_link: string | null;
  enrolled_count: number;
  spots_left: number;
  total_revenue: number;
  teacher_earnings: number;
  platform_earnings: number;
  teacher: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface Stats {
  total_classes: number;
  open_classes: number;
  confirmed_classes: number;
  completed_classes: number;
  cancelled_classes: number;
  total_students: number;
  total_revenue: number;
  total_teacher_earnings: number;
  total_platform_earnings: number;
}

interface Enrollment {
  id: string;
  order_id: string;
  amount_paid: number;
  payment_status: string;
  status: string;
  created_at: string;
  student: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

export default function AdminGroupClassesPage() {
  const [classes, setClasses] = useState<GroupClass[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Modal state
  const [selectedClass, setSelectedClass] = useState<GroupClass | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await fetch('/api/admin/group-classes');
      const result = await response.json();

      if (result.classes) {
        setClasses(result.classes);
      }
      if (result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassDetail = async (classId: string) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/admin/group-classes/${classId}`);
      const result = await response.json();

      if (result.enrollments) {
        setEnrollments(result.enrollments);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleViewDetail = async (groupClass: GroupClass) => {
    setSelectedClass(groupClass);
    await loadClassDetail(groupClass.id);
  };

  const handleUpdateStatus = async (classId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/group-classes/${classId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadClasses();
        if (selectedClass?.id === classId) {
          setSelectedClass({ ...selectedClass, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredClasses = classes.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const formatCurrency = (n: number) => (n || 0).toLocaleString('tr-TR') + ' TL';

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'open': 'bg-blue-100 text-blue-700',
      'confirmed': 'bg-emerald-100 text-emerald-700',
      'completed': 'bg-slate-100 text-slate-700',
      'cancelled': 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      'open': 'Kayit Acik',
      'confirmed': 'Onaylandi',
      'completed': 'Tamamlandi',
      'cancelled': 'Iptal',
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-slate-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Grup Dersleri</h1>
        <p className="text-slate-600 mt-1">Tum grup derslerini goruntuleyebilir ve yonetebilirsiniz</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 p-4">
            <p className="text-sm text-slate-500">Toplam</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total_classes}</p>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-sm text-blue-600">Kayit Acik</p>
            <p className="text-2xl font-bold text-blue-700">{stats.open_classes}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
            <p className="text-sm text-emerald-600">Onaylanan</p>
            <p className="text-2xl font-bold text-emerald-700">{stats.confirmed_classes}</p>
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Tamamlanan</p>
            <p className="text-2xl font-bold text-slate-700">{stats.completed_classes}</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-4">
            <p className="text-sm text-red-600">Iptal</p>
            <p className="text-2xl font-bold text-red-700">{stats.cancelled_classes}</p>
          </div>
          <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
            <p className="text-sm text-purple-600">Toplam Ogrenci</p>
            <p className="text-2xl font-bold text-purple-700">{stats.total_students}</p>
          </div>
        </div>
      )}

      {/* Revenue Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-xl p-4 text-white">
            <p className="text-sm text-white/60">Toplam Gelir</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 text-white">
            <p className="text-sm text-white/60">Ogretmen Kazanci</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.total_teacher_earnings)}</p>
          </div>
          <div className="bg-gradient-to-br from-[#D4AF37] to-[#c4a030] rounded-xl p-4 text-[#0F172A]">
            <p className="text-sm text-[#0F172A]/60">Platform Kazanci</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.total_platform_earnings)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'Tumu' },
          { value: 'open', label: 'Kayit Acik' },
          { value: 'confirmed', label: 'Onaylanan' },
          { value: 'completed', label: 'Tamamlanan' },
          { value: 'cancelled', label: 'Iptal' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f.value
                ? 'bg-[#0F172A] text-white'
                : 'bg-white/80 backdrop-blur-xl text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-4 px-6 font-medium text-slate-600">Tarih</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Baslik</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Ogretmen</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Kayit</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Fiyat</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Gelir</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Durum</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Islem</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  Grup dersi bulunamadi
                </td>
              </tr>
            ) : (
              filteredClasses.map(gc => (
                <tr key={gc.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div className="text-slate-900 font-medium">{formatDate(gc.scheduled_at)}</div>
                    <div className="text-slate-500 text-sm">{formatTime(gc.scheduled_at)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-900">{gc.title}</div>
                    <div className="text-slate-500 text-sm">{gc.subject}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-slate-900">{gc.teacher.full_name}</div>
                    <div className="text-slate-500 text-sm">{gc.teacher.email}</div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`font-medium ${
                      gc.enrolled_count >= gc.min_capacity ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {gc.enrolled_count}/{gc.max_capacity}
                    </span>
                    <div className="text-slate-500 text-xs">min: {gc.min_capacity}</div>
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-slate-900">
                    {formatCurrency(gc.display_price)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="font-medium text-slate-900">{formatCurrency(gc.total_revenue)}</div>
                    <div className="text-emerald-600 text-xs">+{formatCurrency(gc.platform_earnings)}</div>
                  </td>
                  <td className="py-4 px-6 text-center">{getStatusBadge(gc.status)}</td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleViewDetail(gc)}
                      className="text-[#D4AF37] hover:text-[#0F172A] font-medium text-sm"
                    >
                      Detay
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0F172A]">{selectedClass.title}</h2>
                  <p className="text-slate-500">{selectedClass.subject} - {selectedClass.teacher.full_name}</p>
                </div>
                <button
                  onClick={() => { setSelectedClass(null); setEnrollments([]); }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Info Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Tarih</p>
                  <p className="font-medium text-slate-900">
                    {formatDate(selectedClass.scheduled_at)} {formatTime(selectedClass.scheduled_at)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Kayit</p>
                  <p className="font-medium text-slate-900">
                    {selectedClass.enrolled_count}/{selectedClass.max_capacity} (min: {selectedClass.min_capacity})
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Durum</p>
                  <div className="mt-1">{getStatusBadge(selectedClass.status)}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Ogrenci Fiyati</p>
                  <p className="font-medium text-slate-900">{formatCurrency(selectedClass.display_price)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Toplam Gelir</p>
                  <p className="font-medium text-slate-900">{formatCurrency(selectedClass.total_revenue)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Platform Kazanci</p>
                  <p className="font-medium text-emerald-600">{formatCurrency(selectedClass.platform_earnings)}</p>
                </div>
              </div>

              {/* Status Update */}
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 mb-2">Durum Degistir</p>
                <div className="flex gap-2">
                  {['open', 'confirmed', 'completed', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedClass.id, status)}
                      disabled={selectedClass.status === status}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedClass.status === status
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {status === 'open' && 'Kayit Acik'}
                      {status === 'confirmed' && 'Onayla'}
                      {status === 'completed' && 'Tamamla'}
                      {status === 'cancelled' && 'Iptal Et'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enrollments */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Kayitli Ogrenciler</p>

                {loadingDetail ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : enrollments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Henuz kayitli ogrenci yok
                  </div>
                ) : (
                  <div className="space-y-2">
                    {enrollments.map(enrollment => (
                      <div
                        key={enrollment.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          enrollment.payment_status === 'completed' && enrollment.status === 'enrolled'
                            ? 'bg-emerald-50 border border-emerald-200'
                            : 'bg-slate-50 border border-slate-200'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-slate-900">{enrollment.student.full_name}</p>
                          <p className="text-sm text-slate-500">{enrollment.student.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">{formatCurrency(enrollment.amount_paid)}</p>
                          <p className={`text-xs ${
                            enrollment.payment_status === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {enrollment.payment_status === 'completed' ? 'Odendi' : 'Bekliyor'}
                            {enrollment.status === 'cancelled' && ' (Iptal)'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
