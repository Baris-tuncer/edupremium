'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentLessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [filter, setFilter] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    checkAuthAndLoadData();
    // Her dakika güncelle (buton durumu için)
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/student/login');
      return;
    }

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (!studentProfile) {
      toast.error('Ogrenci profili bulunamadi');
      router.push('/student/login');
      return;
    }

    setStudentName(studentProfile.full_name || 'Ogrenci');
    await fetchLessons(user.id);
    setIsLoading(false);
  };

  const fetchLessons = async (userId: string) => {
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', userId)
      .order('scheduled_at', { ascending: true });

    if (lessonsError) {
      console.error('Lessons Error:', lessonsError);
      return;
    }

    if (!lessonsData || lessonsData.length === 0) {
      setLessons([]);
      return;
    }

    const teacherIds = [...new Set(lessonsData.map(l => l.teacher_id))];

    const { data: teachersData, error: teachersError } = await supabase
      .from('teacher_profiles')
      .select('id, full_name, avatar_url, title')
      .in('id', teacherIds);

    if (teachersError) {
      console.error('Teachers Error:', teachersError);
    }

    const teacherMap = new Map();
    if (teachersData) {
      teachersData.forEach(t => teacherMap.set(t.id, t));
    }

    const lessonsWithTeachers = lessonsData.map(lesson => ({
      ...lesson,
      teacher: teacherMap.get(lesson.teacher_id) || null
    }));

    setLessons(lessonsWithTeachers);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/student/login');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { weekday: 'long' });
  };

  // Derse Katıl butonu: ders başlangıcından 15 dk öncesinden, başlangıçtan 15 dk sonrasına kadar göster
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
    
    if (status === 'COMPLETED') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Tamamlandi</span>;
    }
    if (status === 'CANCELLED') {
      return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Iptal Edildi</span>;
    }
    if (lessonDate < currentTime) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Beklemede</span>;
    }
    return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Onaylandi</span>;
  };

  const filteredLessons = lessons.filter((lesson) => {
    const lessonDate = new Date(lesson.scheduled_at);
    
    if (filter === 'upcoming') {
      return lessonDate >= currentTime && lesson.status !== 'COMPLETED' && lesson.status !== 'CANCELLED';
    }
    if (filter === 'completed') {
      return lesson.status === 'COMPLETED' || lessonDate < currentTime;
    }
    return true;
  });

  const upcomingCount = lessons.filter((l) => {
    const lessonDate = new Date(l.scheduled_at);
    return lessonDate >= currentTime && l.status !== 'COMPLETED' && l.status !== 'CANCELLED';
  }).length;

  const completedCount = lessons.filter((l) => {
    const lessonDate = new Date(l.scheduled_at);
    return l.status === 'COMPLETED' || lessonDate < currentTime;
  }).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">EduPremium</h1>
            <p className="text-sm text-slate-600">Hos geldin, {studentName}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/student/dashboard" className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium">
              Ogretmenler
            </Link>
            <Link href="/student/lessons" className="px-4 py-2 text-blue-600 font-medium">
              Derslerim
            </Link>
            <button onClick={handleLogout} className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium">
              Cikis Yap
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Derslerim</h2>
            <p className="text-slate-600">Satin aldiginiz dersleri goruntuleyın</p>
          </div>
        </div>

        {/* Filtre Butonlari */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('upcoming')}
            className={'px-4 py-2 rounded-xl font-medium transition-colors ' + 
              (filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50')}
          >
            Gelecek Dersler ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={'px-4 py-2 rounded-xl font-medium transition-colors ' + 
              (filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50')}
          >
            Gecmis Dersler ({completedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={'px-4 py-2 rounded-xl font-medium transition-colors ' + 
              (filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50')}
          >
            Tumu ({lessons.length})
          </button>
        </div>

        {/* Ders Listesi */}
        {filteredLessons.length > 0 ? (
          <div className="space-y-4">
            {filteredLessons.map((lesson) => (
              <div key={lesson.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {lesson.teacher?.avatar_url ? (
                        <img 
                          src={lesson.teacher.avatar_url} 
                          alt="" 
                          className="w-14 h-14 rounded-full object-cover" 
                        />
                      ) : (
                        <span className="text-xl font-bold text-blue-600">
                          {lesson.teacher?.full_name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {lesson.teacher?.full_name || 'Ogretmen'}
                      </h3>
                      <p className="text-sm text-slate-600">{lesson.subject}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {getStatusBadge(lesson.status, lesson.scheduled_at)}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-xs text-slate-500">Tarih</div>
                      <div className="font-medium text-slate-900">
                        {formatDayName(lesson.scheduled_at)}, {formatDate(lesson.scheduled_at)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Saat</div>
                      <div className="font-medium text-slate-900">{formatTime(lesson.scheduled_at)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Sure</div>
                      <div className="font-medium text-slate-900">{lesson.duration_minutes} dakika</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Ucret</div>
                    <div className="font-bold text-lg text-slate-900">{lesson.price} TL</div>
                  </div>
                </div>

                {canJoinMeeting(lesson) && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <a 
                      href={lesson.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                    >
                      🎥 Derse Katil
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500 mb-4">
              {filter === 'upcoming' && 'Gelecek dersiniz bulunmuyor'}
              {filter === 'completed' && 'Gecmis dersiniz bulunmuyor'}
              {filter === 'all' && 'Henuz ders satin almadiniz'}
            </p>
            <Link 
              href="/student/dashboard" 
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Ogretmenlere Goz At
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
