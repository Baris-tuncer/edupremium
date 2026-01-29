'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function TeacherLessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchLessons();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLessons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Oturum bulunamadı');
        return;
      }
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('teacher_id', user.id)
        .order('scheduled_at', { ascending: true });
      if (error) {
        setLessons([]);
      } else {
        setLessons(data || []);
      }
    } catch (error) {
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const completeLesson = async (lessonId: string) => {
    setCompletingId(lessonId);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', lessonId);
      if (error) {
        toast.error('Ders tamamlanamadı');
        return;
      }
      setLessons(prev => prev.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, status: 'COMPLETED', completed_at: new Date().toISOString() }
          : lesson
      ));
      toast.success('Ders başarıyla tamamlandı!');
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setCompletingId(null);
    }
  };

  const filteredLessons = lessons.filter((lesson) => {
    if (filter === 'upcoming') {
      return lesson.status !== 'COMPLETED' && lesson.status !== 'CANCELLED';
    } else if (filter === 'completed') {
      return lesson.status === 'COMPLETED';
    }
    return true;
  });

  const canComplete = (lesson: any) => {
    const lessonDate = new Date(lesson.scheduled_at);
    return lessonDate <= currentTime && lesson.status !== 'COMPLETED' && lesson.status !== 'CANCELLED';
  };

  const canJoinMeeting = (lesson: any) => {
    if (!lesson.meeting_link) return false;
    if (lesson.status === 'COMPLETED' || lesson.status === 'CANCELLED') return false;
    const lessonStart = new Date(lesson.scheduled_at);
    const fifteenMinsBefore = new Date(lessonStart.getTime() - 15 * 60 * 1000);
    const fifteenMinsAfter = new Date(lessonStart.getTime() + 15 * 60 * 1000);
    return currentTime >= fifteenMinsBefore && currentTime <= fifteenMinsAfter;
  };

  const getStatusBadge = (status: string, scheduledAt: string) => {
    const lessonDate = new Date(scheduledAt);
    const isPast = lessonDate < currentTime;
    if (status === 'COMPLETED') {
      return <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Tamamlandı</span>;
    }
    if (status === 'CANCELLED') {
      return <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">İptal Edildi</span>;
    }
    if (isPast) {
      return <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Tamamlanmadı</span>;
    }
    return <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Planlandı</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Derslerim</h1>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'upcoming' ? 'bg-navy-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          Gelecek Dersler
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'completed' ? 'bg-navy-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          Tamamlanan Dersler
        </button>
      </div>
      <div className="space-y-4">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <div key={lesson.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center font-semibold text-navy-600">
                    {lesson.subject?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">{lesson.subject || 'Ders'}</h3>
                    <p className="text-sm text-slate-600">{lesson.duration_minutes} dakika • {lesson.price} ₺</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-navy-900">
                      {new Date(lesson.scheduled_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(lesson.scheduled_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {getStatusBadge(lesson.status, lesson.scheduled_at)}
                  {canJoinMeeting(lesson) && (
                    <a href={lesson.meeting_link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      🎥 Derse Katıl
                    </a>
                  )}
                  {canComplete(lesson) && (
                    <button onClick={() => completeLesson(lesson.id)} disabled={completingId === lesson.id} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                      {completingId === lesson.id ? 'Tamamlanıyor...' : 'Dersi Tamamla'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500">{filter === 'upcoming' ? 'Henüz planlanmış ders bulunmuyor' : 'Henüz tamamlanmış ders bulunmuyor'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
