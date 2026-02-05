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
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const { data: lessonsData, error } = await supabase
        .from('lessons')
        .select('*')
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      const teacherIds = Array.from(new Set(lessonsData?.map(l => l.teacher_id) || []));
      const studentIds = Array.from(new Set(lessonsData?.map(l => l.student_id).filter(Boolean) || []));

      const { data: teachers } = await supabase
        .from('teacher_profiles')
        .select('id, full_name')
        .in('id', teacherIds.length > 0 ? teacherIds : ['00000000-0000-0000-0000-000000000000']);

      const { data: students } = await supabase
        .from('student_profiles')
        .select('id, full_name')
        .in('id', studentIds.length > 0 ? studentIds : ['00000000-0000-0000-0000-000000000000']);

      const teacherMap = new Map();
      (teachers || []).forEach(t => teacherMap.set(t.id, t.full_name));

      const studentMap = new Map();
      (students || []).forEach(s => studentMap.set(s.id, s.full_name));

      const formatted = (lessonsData || []).map(l => ({
        ...l,
        teacher_name: teacherMap.get(l.teacher_id) || 'Bilinmiyor',
        student_name: studentMap.get(l.student_id) || 'Bilinmiyor'
      }));

      setLessons(formatted);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter(l => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  const stats = {
    total: lessons.length,
    confirmed: lessons.filter(l => l.status === 'CONFIRMED').length,
    completed: lessons.filter(l => l.status === 'COMPLETED').length,
    cancelled: lessons.filter(l => l.status === 'CANCELLED').length
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const formatCurrency = (n: number) => (n || 0).toLocaleString('tr-TR') + ' TL';

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'CONFIRMED': 'bg-blue-100 text-blue-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'CANCELLED': 'bg-red-100 text-red-700'
    };
    const labels: Record<string, string> = {
      'PENDING': 'Bekliyor',
      'CONFIRMED': 'Onaylandı',
      'COMPLETED': 'Tamamlandı',
      'CANCELLED': 'İptal'
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-slate-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dersler</h1>
        <p className="text-slate-600 mt-1">Tüm dersleri görüntüleyebilirsiniz</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-4">
          <p className="text-sm text-slate-500">Toplam</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
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
          <p className="text-sm text-red-600">İptal</p>
          <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'Tümü' },
          { value: 'CONFIRMED', label: 'Onaylanan' },
          { value: 'COMPLETED', label: 'Tamamlanan' },
          { value: 'CANCELLED', label: 'İptal' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f.value
                ? 'bg-[#0F172A] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-4 px-6 font-medium text-slate-600">Tarih</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Saat</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Ders</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Öğretmen</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Öğrenci</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Ücret</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Durum</th>
            </tr>
          </thead>
          <tbody>
            {filteredLessons.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Ders bulunamadı
                </td>
              </tr>
            ) : (
              filteredLessons.map(lesson => (
                <tr key={lesson.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6 text-slate-600">{formatDate(lesson.scheduled_at)}</td>
                  <td className="py-4 px-6 text-slate-600">{formatTime(lesson.scheduled_at)}</td>
                  <td className="py-4 px-6 font-medium text-slate-900">{lesson.subject}</td>
                  <td className="py-4 px-6 text-slate-600">{lesson.teacher_name}</td>
                  <td className="py-4 px-6 text-slate-600">{lesson.student_name}</td>
                  <td className="py-4 px-6 text-center font-medium text-slate-900">{formatCurrency(lesson.price)}</td>
                  <td className="py-4 px-6 text-center">{getStatusBadge(lesson.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
