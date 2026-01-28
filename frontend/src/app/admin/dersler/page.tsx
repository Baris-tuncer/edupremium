'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Lesson {
  id: string;
  subject: string;
  scheduled_at: string;
  duration_minutes: number;
  price: number;
  status: string;
  teacher_name: string;
  student_name: string;
}

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('all');

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const { data: lessonsData, error } = await supabase
        .from('lessons')
        .select('id, subject, scheduled_at, duration_minutes, price, status, teacher_id, student_id')
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      // Ogretmen ve ogrenci isimlerini al
      const teacherIds = [...new Set(lessonsData?.map(l => l.teacher_id) || [])];
      const studentIds = [...new Set(lessonsData?.map(l => l.student_id) || [])];

      const { data: teachers } = await supabase
        .from('teacher_profiles')
        .select('id, full_name')
        .in('id', teacherIds);

      const { data: students } = await supabase
        .from('student_profiles')
        .select('id, full_name')
        .in('id', studentIds);

      const teacherMap = new Map();
      (teachers || []).forEach(t => teacherMap.set(t.id, t.full_name));

      const studentMap = new Map();
      (students || []).forEach(s => studentMap.set(s.id, s.full_name));

      const formattedLessons = (lessonsData || []).map(l => ({
        id: l.id,
        subject: l.subject,
        scheduled_at: l.scheduled_at,
        duration_minutes: l.duration_minutes || 60,
        price: l.price || 0,
        status: l.status,
        teacher_name: teacherMap.get(l.teacher_id) || 'Bilinmiyor',
        student_name: studentMap.get(l.student_id) || 'Bilinmiyor'
      }));

      setLessons(formattedLessons);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (lessonId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ status: newStatus })
        .eq('id', lessonId);

      if (error) throw error;
      loadLessons();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredLessons = lessons.filter(l => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('tr-TR', {
    hour: '2-digit', minute: '2-digit'
  });

  const formatCurrency = (n: number) => n.toLocaleString('tr-TR') + ' TL';

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'CONFIRMED': 'bg-blue-100 text-blue-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'CANCELLED': 'bg-red-100 text-red-700'
    };
    const labels: Record<string, string> = {
      'PENDING': 'Bekliyor',
      'CONFIRMED': 'Onaylandi',
      'COMPLETED': 'Tamamlandi',
      'CANCELLED': 'Iptal'
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Istatistikler
  const stats = {
    total: lessons.length,
    pending: lessons.filter(l => l.status === 'PENDING').length,
    confirmed: lessons.filter(l => l.status === 'CONFIRMED').length,
    completed: lessons.filter(l => l.status === 'COMPLETED').length,
    cancelled: lessons.filter(l => l.status === 'CANCELLED').length,
    totalRevenue: lessons.filter(l => l.status === 'COMPLETED').reduce((sum, l) => sum + l.price, 0)
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dersler</h1>
        <p className="text-slate-600 mt-1">Tum dersleri goruntuleyin ve yonetin</p>
      </div>

      {/* Istatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Toplam</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <p className="text-sm text-yellow-600">Bekleyen</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-600">Onaylanan</p>
          <p className="text-2xl font-bold text-blue-700">{stats.confirmed}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-600">Tamamlanan</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-600">Iptal</p>
          <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-red-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {f === 'all' ? 'Tumu' : f === 'PENDING' ? 'Bekleyen' : f === 'CONFIRMED' ? 'Onaylanan' : f === 'COMPLETED' ? 'Tamamlanan' : 'Iptal'}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-4 px-6 font-medium text-slate-600">Ders</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Ogretmen</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Ogrenci</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Tarih</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Ucret</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Durum</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Islem</th>
            </tr>
          </thead>
          <tbody>
            {filteredLessons.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Ders bulunamadi
                </td>
              </tr>
            ) : (
              filteredLessons.map(lesson => (
                <tr key={lesson.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <p className="font-medium text-slate-900">{lesson.subject}</p>
                    <p className="text-sm text-slate-500">{lesson.duration_minutes} dk</p>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{lesson.teacher_name}</td>
                  <td className="py-4 px-6 text-slate-600">{lesson.student_name}</td>
                  <td className="py-4 px-6 text-center">
                    <p className="text-slate-900">{formatDate(lesson.scheduled_at)}</p>
                    <p className="text-sm text-slate-500">{formatTime(lesson.scheduled_at)}</p>
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-slate-900">
                    {formatCurrency(lesson.price)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {getStatusBadge(lesson.status)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <select
                      value={lesson.status}
                      onChange={(e) => updateStatus(lesson.id, e.target.value)}
                      className="px-2 py-1 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <option value="PENDING">Bekliyor</option>
                      <option value="CONFIRMED">Onayla</option>
                      <option value="COMPLETED">Tamamla</option>
                      <option value="CANCELLED">Iptal Et</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
