'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function TeacherLessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const data = await api.getMyLessons();
      setLessons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      toast.error('Dersler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLessons = lessons.filter((lesson) => {
    if (filter === 'all') return true;
    return lesson.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      PENDING_PAYMENT: 'Ödeme Bekliyor',
      CONFIRMED: 'Onaylandı',
      IN_PROGRESS: 'Devam Ediyor',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal Edildi',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.PENDING_PAYMENT}`}>
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
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">Derslerim</h1>
        <p className="text-slate-600">Tüm derslerinizi ve randevularınızı görüntüleyin</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        {['all', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-navy-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Tümü' : f === 'CONFIRMED' ? 'Onaylı' : f === 'COMPLETED' ? 'Tamamlanan' : 'İptal'}
          </button>
        ))}
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <div key={lesson.id} className="card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center font-semibold text-navy-600">
                    {lesson.student?.firstName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-navy-900">
                      {lesson.student?.firstName} {lesson.student?.lastName}
                    </h3>
                    <p className="text-sm text-slate-600">{lesson.subject?.name}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-medium text-navy-900">
                      {new Date(lesson.scheduledAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(lesson.scheduledAt).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {getStatusBadge(lesson.status)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-slate-500">Henüz ders bulunmuyor</p>
          </div>
        )}
      </div>
    </div>
  );
}
