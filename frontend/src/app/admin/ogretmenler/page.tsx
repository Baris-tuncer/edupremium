'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  branch: {
    id: string;
    name: string;
  };
  subjects: Array<{
    id: string;
    name: string;
  }>;
  experience: number;
  hourlyRate: number;
  isApproved: boolean;
  rating: number;
  totalLessons: number;
  createdAt: string;
  bio?: string;
  photoUrl?: string;
  videoUrl?: string;
}

export default function AdminTeachersPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('pending');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, [activeTab]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      let data: Teacher[] = [];

      if (activeTab === 'all') {
        data = await api.getAllTeachers();
      } else if (activeTab === 'pending') {
        data = await api.getPendingTeachers();
      } else if (activeTab === 'approved') {
        const allTeachers = await api.getAllTeachers();
        data = allTeachers.filter((t: Teacher) => t.isApproved);
      }

      setTeachers(data);
    } catch (error: any) {
      console.error('Öğretmenler yüklenemedi:', error);
      toast.error(error.response?.data?.message || 'Öğretmenler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (teacherId: string) => {
    if (!confirm('Bu öğretmeni onaylamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.approveTeacher(teacherId);
      toast.success('Öğretmen başarıyla onaylandı! Artık sisteme giriş yapabilir.');
      loadTeachers();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Öğretmen onaylanamadı:', error);
      toast.error(error.response?.data?.message || 'Öğretmen onaylanamadı');
    }
  };

  const handleReject = async (teacherId: string) => {
    const reason = prompt('Red sebebini girin (opsiyonel):');
    
    if (!confirm('Bu öğretmeni reddetmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.rejectTeacher(teacherId, reason || undefined);
      toast.success('Öğretmen reddedildi');
      loadTeachers();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('İşlem başarısız:', error);
      toast.error(error.response?.data?.message || 'İşlem başarısız');
    }
  };

  const openModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Öğretmen Yönetimi</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'pending'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Onay Bekleyenler
          {teachers.length > 0 && activeTab === 'pending' && (
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              {teachers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'approved'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Onaylananlar
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Tümü
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Henüz öğretmen bulunmuyor</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
                    {teacher.firstName[0]}{teacher.lastName[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {teacher.firstName} {teacher.lastName}
                      </h3>
                      {teacher.isApproved ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Onaylandı
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Onay Bekliyor
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
                        <span className="text-gray-500">Dal:</span>
                        <span className="ml-2 text-gray-900">{teacher.branch.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Deneyim:</span>
                        <span className="ml-2 text-gray-900">{teacher.experience} yıl</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Ücret:</span>
                        <span className="ml-2 text-gray-900">₺{teacher.hourlyRate}/saat</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Dersler:</span>
                        <span className="ml-2 text-gray-900">
                          {teacher.subjects.map(s => s.name).join(', ')}
                        </span>
                      </div>
                    </div>

                    {teacher.bio && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{teacher.bio}</p>
                    )}
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
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedTeacher.email}</p>
                </div>

                {selectedTeacher.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefon</label>
                    <p className="text-gray-900">{selectedTeacher.phone}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Dal</label>
                  <p className="text-gray-900">{selectedTeacher.branch.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Dersler</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTeacher.subjects.map((subject) => (
                      <span
                        key={subject.id}
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                      >
                        {subject.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Deneyim</label>
                    <p className="text-gray-900">{selectedTeacher.experience} yıl</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Saatlik Ücret</label>
                    <p className="text-gray-900">₺{selectedTeacher.hourlyRate}</p>
                  </div>
                </div>

                {selectedTeacher.bio && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hakkında</label>
                    <p className="text-gray-900 mt-1">{selectedTeacher.bio}</p>
                  </div>
                )}

                {selectedTeacher.photoUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Profil Fotoğrafı</label>
                    <img
                      src={selectedTeacher.photoUrl}
                      alt="Profile"
                      className="mt-2 w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                {selectedTeacher.videoUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tanıtım Videosu</label>
                    <video
                      src={selectedTeacher.videoUrl}
                      controls
                      className="mt-2 w-full max-w-md rounded-lg"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Kayıt Tarihi</label>
                  <p className="text-gray-900">
                    {new Date(selectedTeacher.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {!selectedTeacher.isApproved && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(selectedTeacher.id)}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    ✓ Onayla
                  </button>
                  <button
                    onClick={() => handleReject(selectedTeacher.id)}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    ✗ Reddet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
