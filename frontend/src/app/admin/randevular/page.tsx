'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Appointment {
  id: string;
  orderCode: string;
  student: { id: string; firstName: string; lastName: string };
  teacher: { id: string; firstName: string; lastName: string; hourlyRate: number };
  subject: { id: string; name: string };
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  teacherEarning: number;
  platformFee: number;
  teamsJoinUrl?: string;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

const STATUS_OPTIONS = [
  { value: 'PENDING_PAYMENT', label: 'Ödeme Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMED', label: 'Onaylandı', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: 'Devam Ediyor', color: 'bg-purple-100 text-purple-800' },
  { value: 'COMPLETED', label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
  { value: 'NO_SHOW', label: 'Katılmadı', color: 'bg-orange-100 text-orange-800' },
];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

      const response = await fetch(`${baseUrl}/admin/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Randevular yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

      const response = await fetch(`${baseUrl}/admin/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Durum güncellendi');
        fetchAppointments();
        setSelectedAppointment(null);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Güncelleme başarısız');
      }
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'ALL') return true;
    return apt.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find((o) => o.value === status);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${option?.color || 'bg-slate-100 text-slate-800'}`}>
        {option?.label || status}
      </span>
    );
  };

  // İstatistikler
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
    pending: appointments.filter((a) => a.status === 'PENDING_PAYMENT').length,
    cancelled: appointments.filter((a) => a.status === 'CANCELLED').length,
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Randevular</h1>
          <p className="text-slate-600 mt-1">Tüm ders randevularını yönetin</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-2xl shadow-[#0F172A]/5">
          <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-slate-600">Toplam</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-2xl shadow-[#0F172A]/5">
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-slate-600">Ödeme Bekliyor</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-2xl shadow-[#0F172A]/5">
          <div className="text-3xl font-bold text-blue-600">{stats.confirmed}</div>
          <div className="text-slate-600">Onaylandı</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-2xl shadow-[#0F172A]/5">
          <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-slate-600">Tamamlandı</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-2xl shadow-[#0F172A]/5">
          <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-slate-600">İptal</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-[#0F172A] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {f === 'ALL'
              ? 'Tümü'
              : STATUS_OPTIONS.find((o) => o.value === f)?.label || f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Sipariş No</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Öğrenci</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Öğretmen</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Ders</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tarih</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tutar</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Durum</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-600">
                      {apt.orderCode?.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {apt.student?.firstName} {apt.student?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {apt.teacher?.firstName} {apt.teacher?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{apt.subject?.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(apt.scheduledAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    ₺{apt.paymentAmount || 0}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedAppointment(apt)}
                      className="text-[#D4AF37] hover:text-[#0F172A] font-medium text-sm"
                    >
                      Detay
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  Randevu bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Randevu Detayı</h2>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">Sipariş No</label>
                    <p className="text-slate-900 font-mono">{selectedAppointment.orderCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Mevcut Durum</label>
                    <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">Öğrenci</label>
                    <p className="text-slate-900">
                      {selectedAppointment.student?.firstName} {selectedAppointment.student?.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Öğretmen</label>
                    <p className="text-slate-900">
                      {selectedAppointment.teacher?.firstName} {selectedAppointment.teacher?.lastName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">Ders</label>
                    <p className="text-slate-900">{selectedAppointment.subject?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Süre</label>
                    <p className="text-slate-900">{selectedAppointment.durationMinutes} dakika</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">Tarih & Saat</label>
                  <p className="text-slate-900">
                    {new Date(selectedAppointment.scheduledAt).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Fiyat Detayları */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3">Fiyat Detayları</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Öğretmen Kazancı:</span>
                      <span className="font-medium">₺{selectedAppointment.teacherEarning || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Platform Komisyonu:</span>
                      <span className="font-medium">₺{selectedAppointment.platformFee || 0}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-slate-700 font-semibold">Toplam Ödeme:</span>
                      <span className="font-bold text-green-600">₺{selectedAppointment.paymentAmount || 0}</span>
                    </div>
                  </div>
                </div>

                {selectedAppointment.teamsJoinUrl && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Teams Link</label>
                    <a
                      href={selectedAppointment.teamsJoinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D4AF37] hover:underline block truncate"
                    >
                      {selectedAppointment.teamsJoinUrl}
                    </a>
                  </div>
                )}

                {/* Durum Değiştirme */}
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-slate-500 block mb-2">Durum Değiştir</label>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateStatus(selectedAppointment.id, option.value)}
                        disabled={selectedAppointment.status === option.value}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedAppointment.status === option.value
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="w-full px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
