'use client';

import React, { useState, useEffect } from 'react';

interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  platformFee: number;
  teacherEarning: number;
  status: string;
  method: string;
  paidAt?: string;
  createdAt: string;
  appointment?: {
    orderCode: string;
    student: { firstName: string; lastName: string };
    teacher: { firstName: string; lastName: string };
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app'}/admin/payments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPayments(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  const totalRevenue = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalFees = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + Number(p.platformFee), 0);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      PENDING: 'Beklemede',
      PAID: 'Ödendi',
      COMPLETED: 'Tamamlandı',
      FAILED: 'Başarısız',
      REFUNDED: 'İade Edildi',
      CANCELLED: 'İptal',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CREDIT_CARD: 'Kredi Kartı',
      BANK_TRANSFER: 'Banka Transferi',
    };
    return labels[method] || method;
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
          <h1 className="text-3xl font-bold text-navy-900">Ödemeler</h1>
          <p className="text-slate-600 mt-1">Tüm ödeme işlemlerini görüntüleyin</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-navy-900">{payments.length}</div>
          <div className="text-slate-600">Toplam İşlem</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-green-600">₺{totalRevenue.toLocaleString('tr-TR')}</div>
          <div className="text-slate-600">Toplam Gelir</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-blue-600">₺{totalFees.toLocaleString('tr-TR')}</div>
          <div className="text-slate-600">Platform Komisyonu</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-yellow-600">
            {payments.filter(p => p.status === 'PENDING').length}
          </div>
          <div className="text-slate-600">Bekleyen Ödeme</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].map((f) => (
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
             f === 'PENDING' ? 'Bekleyen' :
             f === 'COMPLETED' ? 'Tamamlanan' :
             f === 'FAILED' ? 'Başarısız' : 'İade'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tarih</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Öğrenci</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Öğretmen</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Yöntem</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tutar</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Komisyon</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(payment.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {payment.appointment?.student?.firstName} {payment.appointment?.student?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {payment.appointment?.teacher?.firstName} {payment.appointment?.teacher?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{getMethodLabel(payment.method)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">₺{Number(payment.amount).toLocaleString('tr-TR')}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">₺{Number(payment.platformFee).toLocaleString('tr-TR')}</td>
                  <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  Ödeme bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
