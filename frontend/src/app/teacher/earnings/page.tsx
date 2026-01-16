'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function TeacherEarningsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await api.getTeacherDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const wallet = dashboard?.wallet || {};
  const stats = dashboard?.monthlyStats || {};

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">Kazançlarım</h1>
        <p className="text-slate-600">Gelir takibi ve ödeme geçmişi</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white p-6">
          <p className="text-white/80 mb-2">Kullanılabilir Bakiye</p>
          <p className="font-display text-3xl font-bold">₺{wallet.availableBalance || 0}</p>
        </div>

        <div className="card p-6">
          <p className="text-slate-600 mb-2">Bekleyen Bakiye</p>
          <p className="font-display text-3xl font-bold text-navy-900">₺{wallet.pendingBalance || 0}</p>
        </div>

        <div className="card p-6">
          <p className="text-slate-600 mb-2">Toplam Kazanç</p>
          <p className="font-display text-3xl font-bold text-navy-900">₺{wallet.totalEarned || 0}</p>
        </div>
      </div>

      <div className="card p-6 mb-8">
        <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">Bu Ay</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-slate-600 mb-1">Tamamlanan Ders</p>
            <p className="font-display text-2xl font-bold text-navy-900">{stats.completedLessons || 0}</p>
          </div>
          <div>
            <p className="text-slate-600 mb-1">Toplam Kazanç</p>
            <p className="font-display text-2xl font-bold text-navy-900">₺{stats.earnings || 0}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">Para Çekme</h2>
        <p className="text-slate-600 mb-4">
          Kullanılabilir bakiyenizi banka hesabınıza aktarabilirsiniz.
        </p>
        <button className="px-6 py-3 bg-navy-600 text-white rounded-xl hover:bg-navy-700 transition-colors">
          Para Çek
        </button>
      </div>
    </div>
  );
}
