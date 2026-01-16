'use client';

import React, { useState, useEffect } from 'react';

interface TeacherEarning {
  id: string;
  firstName: string;
  lastName: string;
  user: {
    email: string;
  };
  wallet?: {
    availableBalance: number;
    pendingBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
  };
  iban?: string;
}

export default function AdminHakedisPage() {
  const [teachers, setTeachers] = useState<TeacherEarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app'}/admin/teachers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTeachers(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPending = teachers.reduce((sum, t) => sum + Number(t.wallet?.pendingBalance || 0), 0);
  const totalAvailable = teachers.reduce((sum, t) => sum + Number(t.wallet?.availableBalance || 0), 0);
  const totalPaid = teachers.reduce((sum, t) => sum + Number(t.wallet?.totalWithdrawn || 0), 0);

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
          <h1 className="text-3xl font-bold text-navy-900">Hakediş Yönetimi</h1>
          <p className="text-slate-600 mt-1">Öğretmen ödemelerini yönetin</p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Toplu Ödeme Yap
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-navy-900">{teachers.length}</div>
          <div className="text-slate-600">Toplam Öğretmen</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-yellow-600">₺{totalPending.toLocaleString('tr-TR')}</div>
          <div className="text-slate-600">Bekleyen Bakiye</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-green-600">₺{totalAvailable.toLocaleString('tr-TR')}</div>
          <div className="text-slate-600">Çekilebilir Bakiye</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-blue-600">₺{totalPaid.toLocaleString('tr-TR')}</div>
          <div className="text-slate-600">Toplam Ödenen</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Öğretmen</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">IBAN</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Bekleyen</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Çekilebilir</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Toplam Kazanç</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {teachers.length > 0 ? (
              teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center font-semibold text-navy-600">
                        {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-navy-900">{teacher.firstName} {teacher.lastName}</div>
                        <div className="text-sm text-slate-500">{teacher.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                    {teacher.iban ? `${teacher.iban.slice(0, 4)}****${teacher.iban.slice(-4)}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-yellow-600">
                    ₺{Number(teacher.wallet?.pendingBalance || 0).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    ₺{Number(teacher.wallet?.availableBalance || 0).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    ₺{Number(teacher.wallet?.totalEarned || 0).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      className="text-green-600 hover:text-green-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!teacher.wallet?.availableBalance || teacher.wallet.availableBalance <= 0}
                    >
                      Ödeme Yap
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Öğretmen bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
