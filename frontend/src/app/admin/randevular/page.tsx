'use client';

import React, { useState, useEffect } from 'react';

interface Appointment {
  id: string;
  orderCode: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  paymentStatus: string;
  paymentAmount?: number;
  student: {
    firstName: string;
    lastName: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
  subject: {
    name: string;
  };
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app'}/admin/appointments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'ALL') return true;
    return apt.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-orange-100 text-orange-800',
    };
    const labels: Record<string, string> = {
      PENDING_PAYMENT: 'Ödeme Bekliyor',
      CONFIRMED: 'Onaylandı',
      IN_PROGRESS: 'Devam Ediyor',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal Edildi',
      NO_SHOW: 'Katılmadı',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Randevular</h1>
          <p className="text-slate-600 mt-1">Tüm ders randevularını görüntüleyin</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-navy-900">{appointments.length}</div>
          <div className="text-slate-600">Toplam Randevu</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-green-600">
            {appointments.filter(a => a.status === 'CONFIRMED').length}
          </div>
          <div className="text-slate-600">Onaylanan</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-blue-600">
            {appointments.filter(a => a.status === 'COMPLETED').length}
          </div>
          <div className="text-slate-600">Tamamlanan</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-yellow-600">
            {appointments.filter(a => a.status === 'PENDING_PAYMENT').length}
          </div>
          <div className="text-slate-600">Ödeme Bekleyen</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-navy-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {f === 'ALL' ? 'Tümü' : 
             f === 'PENDING_PAYMENT' ? 'Ödeme Bekleyen' :
             f === 'CONFIRMED' ? 'Onaylanan' :
             f === 'COMPLETED' ? 'Tamamlanan' : 'İptal'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-navy-600">{apt.orderCode?.slice(0, 8)}...</span>
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
                    {apt.paymentAmount ? `₺${apt.paymentAmount}` : '-'}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  Randevu bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
