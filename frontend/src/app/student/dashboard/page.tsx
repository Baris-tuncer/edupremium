'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EDUCATION_LEVELS, LevelKey, parseSubject } from '@/lib/constants';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');

  useEffect(() => {
    checkAuthAndLoadData();
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
    await fetchTeachers();
    setIsLoading(false);
  };

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .not('full_name', 'is', null);
    if (error) {
      console.error('Error:', error);
      return;
    }
    setTeachers(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/student/login');
  };

  const availableSubjects = useMemo(() => {
    if (!selectedLevel) return [];
    const levelData = EDUCATION_LEVELS[selectedLevel as LevelKey];
    return levelData ? levelData.subjects : [];
  }, [selectedLevel]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = teacher.full_name?.toLowerCase().includes(query);
        const titleMatch = teacher.title?.toLowerCase().includes(query);
        if (!nameMatch && !titleMatch) return false;
      }
      if (selectedLevel && selectedSubject) {
        const searchKey = selectedLevel + ':' + selectedSubject;
        if (!teacher.subjects || !teacher.subjects.includes(searchKey)) {
          return false;
        }
      } else if (selectedLevel) {
        const prefix = selectedLevel + ':';
        const hasLevel = teacher.subjects?.some(function(s: string) {
          return s.startsWith(prefix);
        });
        if (!hasLevel) return false;
      }
      if (priceRange) {
        const price = teacher.price_per_hour || 0;
        if (priceRange === '0-300' && price > 300) return false;
        if (priceRange === '300-500' && (price < 300 || price > 500)) return false;
        if (priceRange === '500-1000' && (price < 500 || price > 1000)) return false;
        if (priceRange === '1000+' && price < 1000) return false;
      }
      return true;
    });
  }, [teachers, searchQuery, selectedLevel, selectedSubject, priceRange]);

  const displaySubjects = (subjects: string[] | null) => {
    if (!subjects || subjects.length === 0) return null;
    const displayed = subjects.slice(0, 3).map((s) => {
      const parsed = parseSubject(s);
      if (parsed) {
        const levelData = EDUCATION_LEVELS[parsed.level as LevelKey];
        const shortLevel = levelData?.label.split(' ')[0] || parsed.level;
        return parsed.name + ' (' + shortLevel + ')';
      }
      return s;
    });
    return (
      <div className="flex flex-wrap gap-2">
        {displayed.map((subject, idx) => (
          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
            {subject}
          </span>
        ))}
        {subjects.length > 3 && (
          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
            +{subjects.length - 3}
          </span>
        )}
      </div>
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLevel('');
    setSelectedSubject('');
    setPriceRange('');
  };

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
          <button onClick={handleLogout} className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium">
            Cikis Yap
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Ogretmen Ara</h2>
            {(searchQuery || selectedLevel || selectedSubject || priceRange) && (
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Filtreleri Temizle
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Isim ile Ara</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ogretmen adi..."
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Egitim Seviyesi</label>
              <select
                value={selectedLevel}
                onChange={(e) => { setSelectedLevel(e.target.value); setSelectedSubject(''); }}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Tumu</option>
                {Object.entries(EDUCATION_LEVELS).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ders</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedLevel}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white disabled:bg-slate-100"
              >
                <option value="">Tumu</option>
                {availableSubjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fiyat Araligi</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Tumu</option>
                <option value="0-300">0 - 300 TL</option>
                <option value="300-500">300 - 500 TL</option>
                <option value="500-1000">500 - 1000 TL</option>
                <option value="1000+">1000 TL ve uzeri</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-slate-600">
            <span className="font-bold text-slate-900">{filteredTeachers.length}</span> ogretmen bulundu
          </p>
        </div>

        {filteredTeachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {teacher.avatar_url ? (
                        <img src={teacher.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-blue-600">{teacher.full_name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 truncate">{teacher.full_name}</h3>
                      <p className="text-sm text-slate-600 truncate">{teacher.title || 'Ogretmen'}</p>
                    </div>
                  </div>

                  <div className="mb-4">{displaySubjects(teacher.subjects)}</div>

                  {teacher.bio && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{teacher.bio}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-2xl font-bold text-slate-900">{teacher.hourly_rate_display || teacher.price_per_hour || '—'}</span>
                      <span className="text-slate-600 text-sm"> TL/saat</span><span className="text-slate-400 text-xs block">(vergiler dahil)</span>
                    </div>
                    <Link href={'/student/teacher/' + teacher.id} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                      Incele
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500">Aramaniza uygun ogretmen bulunamadi</p>
            <button onClick={clearFilters} className="mt-4 text-blue-600 hover:text-blue-800 font-medium">
              Filtreleri Temizle
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
