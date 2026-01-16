'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  branches: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string }>;
  hourlyRate: number;
  pricing?: {
    teacherEarning: number;
    platformFee: number;
    tax: number;
    totalPrice: number;
  };
  totalLessons: number;
  isActive: boolean;
  status: string;
  createdAt: string;
  bio?: string;
  profilePhotoUrl?: string;
  introVideoUrl?: string;
}

export default function AdminTeachersPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

      const response = await fetch(`${baseUrl}/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setTeachers(result.data || []);
      }
    } catch (error: any) {
      console.error('Öğretmenler yüklenemedi:', error);
      toast.error('Öğretmenler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (teacherId: string) => {
    if (!confirm('Bu öğretmeni devre dışı bırakmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

      const response = await fetch(`${baseUrl}/admin/teachers/${teacherId}/reject`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Öğretmen devre dışı bırakıldı');
        loadTeachers();
        setIsModalOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.message || 'İşlem başarısız');
      }
    } catch (error: any) {
      toast.error('İşlem başarısız');
    }
  };

  const handleActivate = async (teacherId: string) => {
    if (!confirm('Bu öğretmeni aktif etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

      const response = await fetch(`${baseUrl}/admin/teachers/${teacherId}/activate`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Öğretmen aktif edildi');
        loadTeachers();
        setIsModalOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.message || 'İşlem başarısız');
      }
    } catch (error: any) {
      toast.error('İşlem başarısız');
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    if (activeTab === 'active') return t.isActive;
    if (activeTab === 'inactive') return !t.isActive;
    return true;
  });

  const openModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Öğretmen Yönetimi</h1>
        <div className="text-sm text-gray-500">
          Toplam: {teachers.length} öğretmen
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Tümü
          <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            {teachers.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'active'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Aktif
          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {teachers.filter((t) => t.isActive).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('inactive')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'inactive'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pasif
          <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            {teachers.filter((t) => !t.isActive).length}
          </span>
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Öğretmen bulunmuyor</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 overflow-hidden">
                    {teacher.profilePhotoUrl ? (
                      <img src={teacher.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      `${teacher.firstName[0]}${teacher.lastName[0]}`
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {teacher.firstName} {teacher.lastName}
                      </h3>
                      {teacher.isActive ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Aktif
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Pasif
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 text-gray-900">{teacher.email}</span>
                      </div>
                      {teacher.phone && (
                        <div>
                          <span className="text-gray-500">Telefon:</span>
                          <span className="ml-2 text-gray-900">{teacher.phone}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Branş:</span>
                        <span className="ml-2 text-gray-900">
                          {teacher.branches?.map((b) => b.name).join(', ') || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tamamlanan Ders:</span>
                        <span className="ml-2 text-gray-900">{teacher.totalLessons || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Öğretmen Ücreti:</span>
                        <span className="ml-2 text-gray-900">₺{teacher.hourlyRate}/saat</span>
                      </div>
                      {teacher.pricing && (
                        <div>
                          <span className="text-gray-500">Veli Ödemesi:</span>
                          <span className="ml-2 text-green-600 font-semibold">₺{teacher.pricing.totalPrice.toFixed(0)}/saat</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(teacher)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    İncele
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedTeacher.firstName} {selectedTeacher.lastName}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedTeacher.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefon</label>
                    <p className="text-gray-900">{selectedTeacher.phone || '-'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Branşlar</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTeacher.branches?.map((branch) => (
                      <span
                        key={branch.id}
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                      >
                        {branch.name}
                      </span>
                    )) || <span className="text-gray-500">-</span>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Dersler</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTeacher.subjects?.map((subject) => (
                      <span
                        key={subject.id}
                        className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                      >
                        {subject.name}
                      </span>
                    )) || <span className="text-gray-500">-</span>}
                  </div>
                </div>

                {/* Fiyatlandırma Detayları */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Fiyatlandırma Detayları</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Öğretmen Ücreti:</span>
                      <span className="font-medium">₺{selectedTeacher.hourlyRate}</span>
                    </div>
                    {selectedTeacher.pricing && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Platform Komisyonu (%20):</span>
                          <span className="font-medium">₺{selectedTeacher.pricing.platformFee.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">KDV (%20):</span>
                          <span className="font-medium">₺{selectedTeacher.pricing.tax.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-700 font-semibold">Veli Ödemesi:</span>
                          <span className="font-bold text-green-600">₺{selectedTeacher.pricing.totalPrice.toFixed(0)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tamamlanan Ders</label>
                    <p className="text-gray-900">{selectedTeacher.totalLessons || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Durum</label>
                    <p className={selectedTeacher.isActive ? 'text-green-600' : 'text-red-600'}>
                      {selectedTeacher.isActive ? 'Aktif' : 'Pasif'}
                    </p>
                  </div>
                </div>

                {selectedTeacher.bio && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hakkında</label>
                    <p className="text-gray-900 mt-1">{selectedTeacher.bio}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Kayıt Tarihi</label>
                  <p className="text-gray-900">
                    {new Date(selectedTeacher.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                {selectedTeacher.isActive ? (
                  <button
                    onClick={() => handleDeactivate(selectedTeacher.id)}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Devre Dışı Bırak
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(selectedTeacher.id)}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Aktif Et
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
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
