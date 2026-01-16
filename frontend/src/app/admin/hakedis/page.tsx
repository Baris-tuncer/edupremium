'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface TeacherEarning {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  iban?: string;
  hourlyRate: number;
  completedLessons: number;
  wallet?: {
    pendingBalance: number;
    availableBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
  };
  isActive: boolean;
}

interface Totals {
  totalPending: number;
  totalAvailable: number;
  totalPaid: number;
  totalEarned: number;
}

export default function AdminHakedisPage() {
  const [teachers, setTeachers] = useState<TeacherEarning[]>([]);
  const [totals, setTotals] = useState<Totals>({
    totalPending: 0,
    totalAvailable: 0,
    totalPaid: 0,
    totalEarned: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherEarning | null>(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

      const response = await fetch(`${baseUrl}/admin/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data.data || []);
        if (data.totals) {
          setTotals(data.totals);
        }
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Hakediş verileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (teacherId: string) => {
    toast.success('Ödeme işlemi başlatıldı (Demo)');
    // Gerçek implementasyonda buraya ödeme API'si çağrısı gelecek
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
          <h1 className="text-3xl font-bold text-gray-900">Hakediş Yönetimi</h1>
          <p className="text-gray-600 mt-1">Öğretmen ödemelerini yönetin</p>
        </div>
        <button
          onClick={() => toast.success('Toplu ödeme özelliği yakında aktif olacak')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Toplu Ödeme Yap
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-gray-900">{teachers.length}</div>
          <div className="text-gray-600">Toplam Öğretmen</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="text-yellow-100 text-sm mb-1">Bekleyen Bakiye</div>
          <div className="text-3xl font-bold">₺{totals.totalPending.toLocaleString('tr-TR')}</div>
          <div className="text-yellow-100 text-xs mt-2">Henüz ders tamamlanmadı</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-green-100 text-sm mb-1">Çekilebilir Bakiye</div>
          <div className="text-3xl font-bold">₺{totals.totalAvailable.toLocaleString('tr-TR')}</div>
          <div className="text-green-100 text-xs mt-2">Ödemeye hazır</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-blue-100 text-sm mb-1">Toplam Ödenen</div>
          <div className="text-3xl font-bold">₺{totals.totalPaid.toLocaleString('tr-TR')}</div>
          <div className="text-blue-100 text-xs mt-2">Öğretmenlere ödendi</div>
        </div>
      </div>

      {/* Açıklama */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">Hakediş Sistemi</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Öğretmen her ders için belirlediği saatlik ücreti alır</p>
          <p>• Ders tamamlandıktan sonra ödeme "Bekleyen" duruma geçer</p>
          <p>• 7 gün sonra ödeme "Çekilebilir" duruma geçer</p>
          <p>• Öğretmen IBAN'ına ödeme yapılabilir</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Öğretmen</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">IBAN</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Saatlik Ücret</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Tamamlanan Ders</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Bekleyen</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Çekilebilir</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Toplam Kazanç</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {teachers.length > 0 ? (
              teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                        {teacher.firstName?.charAt(0)}
                        {teacher.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {teacher.firstName} {teacher.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{teacher.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                    {teacher.iban ? `${teacher.iban.slice(0, 4)}****${teacher.iban.slice(-4)}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    ₺{teacher.hourlyRate.toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    {teacher.completedLessons || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-yellow-600">
                    ₺{(teacher.wallet?.pendingBalance || 0).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
                    ₺{(teacher.wallet?.availableBalance || 0).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                    ₺{(teacher.wallet?.totalEarned || 0).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTeacher(teacher)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Detay
                      </button>
                      <button
                        onClick={() => handlePayment(teacher.id)}
                        disabled={!teacher.wallet?.availableBalance || teacher.wallet.availableBalance <= 0}
                        className="text-green-600 hover:text-green-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Öde
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  Öğretmen bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedTeacher.firstName} {selectedTeacher.lastName}
                </h2>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedTeacher.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">IBAN</label>
                  <p className="text-gray-900 font-mono">{selectedTeacher.iban || 'Girilmemiş'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Cüzdan Detayları</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bekleyen Bakiye:</span>
                      <span className="font-medium text-yellow-600">
                        ₺{(selectedTeacher.wallet?.pendingBalance || 0).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Çekilebilir Bakiye:</span>
                      <span className="font-medium text-green-600">
                        ₺{(selectedTeacher.wallet?.availableBalance || 0).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-500">Toplam Kazanç:</span>
                      <span className="font-bold">
                        ₺{(selectedTeacher.wallet?.totalEarned || 0).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Toplam Çekilen:</span>
                      <span className="font-medium">
                        ₺{(selectedTeacher.wallet?.totalWithdrawn || 0).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Saatlik Ücret</label>
                    <p className="text-gray-900">₺{selectedTeacher.hourlyRate.toLocaleString('tr-TR')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tamamlanan Ders</label>
                    <p className="text-gray-900">{selectedTeacher.completedLessons || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => handlePayment(selectedTeacher.id)}
                  disabled={!selectedTeacher.wallet?.availableBalance || selectedTeacher.wallet.availableBalance <= 0}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ödeme Yap
                </button>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
