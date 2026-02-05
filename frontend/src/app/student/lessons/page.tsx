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

  // Kayıt onay modalı
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null);
  const [joiningMeeting, setJoiningMeeting] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
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
      toast.error('Öğrenci profili bulunamadı');
      router.push('/student/login');
      return;
    }

    setStudentName(studentProfile.full_name || 'Öğrenci');
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

  const canJoinMeeting = (lesson: any) => {
    if (!lesson.meeting_link) return false;
    if (lesson.status === 'COMPLETED' || lesson.status === 'CANCELLED') return false;
    
    const lessonStart = new Date(lesson.scheduled_at);
    const fifteenMinsBefore = new Date(lessonStart.getTime() - 15 * 60 * 1000);
    const fifteenMinsAfter = new Date(lessonStart.getTime() + 15 * 60 * 1000);
    
    return currentTime >= fifteenMinsBefore && currentTime <= fifteenMinsAfter;
  };

  // Derse katıl butonuna tıklandığında önce onay modalı göster
  const handleJoinClick = (lessonId: string) => {
    setPendingLessonId(lessonId);
    setConsentChecked(false);
    setShowConsentModal(true);
  };

  // Onay verildikten sonra derse katıl (token ile)
  const handleConsentAndJoin = async () => {
    if (!consentChecked || !pendingLessonId) return;

    setJoiningMeeting(true);
    try {
      const response = await fetch('/api/lessons/meeting-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: pendingLessonId })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Derse katılırken hata oluştu');
        return;
      }

      // Token'lı URL ile derse katıl
      window.open(data.meetingUrl, '_blank', 'noopener,noreferrer');
      setShowConsentModal(false);
      setPendingLessonId(null);
      setConsentChecked(false);
    } catch (error) {
      toast.error('Derse katılırken hata oluştu');
    } finally {
      setJoiningMeeting(false);
    }
  };

  const getStatusBadge = (status: string, scheduledAt: string) => {
    const lessonDate = new Date(scheduledAt);
    
    if (status === 'COMPLETED') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Tamamlandı</span>;
    }
    if (status === 'CANCELLED') {
      return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">İptal Edildi</span>;
    }
    if (lessonDate < currentTime) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Beklemede</span>;
    }
    return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Onaylandı</span>;
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
      <div className="min-h-screen bg-[#FDFBF7]/80 backdrop-blur-xl flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#FDFBF7]/80 backdrop-blur-xl overflow-hidden">
      {/* --- ARKA PLAN --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')` }}></div>
        <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
      </div>
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] font-serif">EduPremium</h1>
            <p className="text-sm text-slate-600">Hoş geldin, {studentName}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/student/dashboard" className="px-4 py-2 text-slate-600 hover:text-[#D4AF37] font-medium transition-colors">
              Öğretmenler
            </Link>
            <Link href="/student/lessons" className="px-4 py-2 text-[#D4AF37] font-bold">
              Derslerim
            </Link>
            <button onClick={handleLogout} className="px-4 py-2 text-slate-600 hover:text-[#0F172A] font-medium transition-colors">
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Derslerim</h2>
            <p className="text-slate-600">Satın aldığınız dersleri görüntüleyin</p>
          </div>
        </div>

        {/* Filtre Butonları */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('upcoming')}
            className={'px-4 py-2 rounded-xl font-medium transition-colors ' +
              (filter === 'upcoming' ? 'bg-[#0F172A] text-white' : 'bg-white/80 text-slate-600 border border-white/50 hover:bg-white')}
          >
            Gelecek Dersler ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={'px-4 py-2 rounded-xl font-medium transition-colors ' +
              (filter === 'completed' ? 'bg-[#0F172A] text-white' : 'bg-white/80 text-slate-600 border border-white/50 hover:bg-white')}
          >
            Geçmiş Dersler ({completedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={'px-4 py-2 rounded-xl font-medium transition-colors ' +
              (filter === 'all' ? 'bg-[#0F172A] text-white' : 'bg-white/80 text-slate-600 border border-white/50 hover:bg-white')}
          >
            Tümü ({lessons.length})
          </button>
        </div>

        {/* Ders Listesi */}
        {filteredLessons.length > 0 ? (
          <div className="space-y-4">
            {filteredLessons.map((lesson) => (
              <div key={lesson.id} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-[#0F172A]/5 p-6">
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
                        {lesson.teacher?.full_name || 'Öğretmen'}
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
                      <div className="text-xs text-slate-500">Süre</div>
                      <div className="font-medium text-slate-900">{lesson.duration_minutes} dakika</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Ücret</div>
                    <div className="font-bold text-lg text-slate-900">{lesson.price} TL</div>
                  </div>
                </div>

                {canJoinMeeting(lesson) && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleJoinClick(lesson.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all"
                    >
                      🎥 Derse Katıl
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-[#0F172A]/5 p-12 text-center">
            <p className="text-slate-500 mb-4">
              {filter === 'upcoming' && 'Gelecek dersiniz bulunmuyor'}
              {filter === 'completed' && 'Geçmiş dersiniz bulunmuyor'}
              {filter === 'all' && 'Henüz ders satın almadınız'}
            </p>
            <Link 
              href="/student/dashboard" 
              className="inline-block px-6 py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all"
            >
              Öğretmenlere Göz At
            </Link>
          </div>
        )}
      </main>

      {/* Kayıt Onay Modalı */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔴</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Güvenlik Bildirimi</h2>
                <p className="text-sm text-slate-500">Derse katılmadan önce lütfen okuyun</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-amber-800 text-sm leading-relaxed">
                Bu online ders, <strong>tarafların ve platformun hukuki haklarını korumak amacıyla</strong> ses ve görüntü olarak kaydedilmektedir.
              </p>
            </div>

            <div className="space-y-3 mb-6 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Kayıtlar yalnızca güvenlik ve hukuki süreçler için kullanılır</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Kayıtlar 7 gün süreyle saklanır, ardından otomatik silinir</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Üçüncü taraflarla paylaşılmaz (yasal zorunluluk hariç)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>KVKK kapsamında korunur</span>
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer mb-6 border-2 border-transparent hover:border-slate-200 transition-colors">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-700 text-sm">
                Bu dersin ses ve görüntü olarak kaydedileceğini okudum, anladım ve <strong>kabul ediyorum</strong>.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowConsentModal(false); setPendingLessonId(null); }}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConsentAndJoin}
                disabled={!consentChecked || joiningMeeting}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {joiningMeeting ? (
                  <span>Bağlanıyor...</span>
                ) : (
                  <>
                    <span>🎥</span>
                    Kabul Et ve Derse Katıl
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
