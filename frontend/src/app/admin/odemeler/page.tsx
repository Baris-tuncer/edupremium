'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Payment {
  id: string;
  orderCode: string;
  student: { firstName: string; lastName: string };
  teacher: { firstName: string; lastName: string };
  subject: { name: string };
  scheduledAt: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentAmount: number;
  teacherEarning: number;
  platformFee: number;
  createdAt: string;
}

interface Totals {
  totalRevenue: number;
  totalPlatformFee: number;
  totalTeacherEarnings: number;
  totalTax: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totals, setTotals] = useState<Totals>({
    totalRevenue: 0,
    totalPlatformFee: 0,
    totalTeacherEarnings: 0,
    totalTax: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

      const response = await fetch(`${baseUrl}/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.data || []);
        if (data.totals) {
          setTotals(data.totals);
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Ödemeler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === 'ALL') return true;
    return p.paymentStatus === filter;
  });

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

  const getMethodLabel = (method?: string) => {
    if (!method) return '-';
    const labels: Record<string, string> = {
      CREDIT_CARD: 'Kredi Kartı',
      BANK_TRANSFER: 'Havale/EFT',
    };
    return labels[method] || method;
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ödemeler</h1>
          <p className="text-gray-600 mt-1">Tüm ödeme işlemlerini görüntüleyin</p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-green-100 text-sm mb-1">Toplam Gelir (Brüt)</div>
          <div className="text-3xl font-bold">₺{totals.totalRevenue.toLocaleString('tr-TR')}</div>
          <div className="text-green-100 text-xs mt-2">Velilerden alınan toplam</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-blue-100 text-sm mb-1">Platform Komisyonu</div>
          <div className="text-3xl font-bold">₺{totals.totalPlatformFee.toLocaleString('tr-TR')}</div>
          <div className="text-blue-100 text-xs mt-2">%20 komisyon</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-purple-100 text-sm mb-1">Öğretmen Ödemeleri</div>
          <div className="text-3xl font-bold">₺{totals.totalTeacherEarnings.toLocaleString('tr-TR')}</div>
          <div className="text-purple-100 text-xs mt-2">Öğretmenlere ödenen</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="text-orange-100 text-sm mb-1">KDV Tutarı</div>
          <div className="text-3xl font-bold">₺{totals.totalTax.toLocaleString('tr-TR')}</div>
          <div className="text-orange-100 text-xs mt-2">%20 KDV</div>
        </div>
      </div>

      {/* Fiyatlandırma Açıklaması */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">Fiyatlandırma Mantığı</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Öğretmen Ücreti: Öğretmenin belirlediği saatlik ücret</p>
          <p>• Platform Komisyonu: Öğretmen ücreti x %20</p>
          <p>• Ara Toplam: Öğretmen Ücreti + Platform Komisyonu</p>
          <p>• KDV: Ara Toplam x %20</p>
          <p>• Veli Ödemesi: Ara Toplam + KDV</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'PENDING', 'PAID', 'COMPLETED', 'FAILED', 'REFUNDED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {f === 'ALL'
              ? 'Tümü'
              : f === 'PENDING'
              ? 'Bekleyen'
              : f === 'PAID'
              ? 'Ödendi'
              : f === 'COMPLETED'
              ? 'Tamamlandı'
              : f === 'FAILED'
              ? 'Başarısız'
              : 'İade'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tarih</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Öğrenci</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Öğretmen</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ders</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Yöntem</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Öğretmen</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Komisyon</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Toplam</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(payment.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {payment.student?.firstName} {payment.student?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {payment.teacher?.firstName} {payment.teacher?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.subject?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getMethodLabel(payment.paymentMethod)}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    ₺{(payment.teacherEarning || 0).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-blue-600">
                    ₺{(payment.platformFee || 0).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                    ₺{(payment.paymentAmount || 0).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(payment.paymentStatus)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
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
