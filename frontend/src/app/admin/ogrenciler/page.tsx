'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  created_at: string;
  total_lessons: number;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      // Öğrenci profilleri
      const { data: profiles, error } = await supabase
        .from('student_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Her öğrencinin ders sayısını al
      const studentsWithLessons = await Promise.all(
        (profiles || []).map(async (student) => {
          const { count } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', student.id);

          return {
            ...student,
            total_lessons: count || 0
          };
        })
      );

      setStudents(studentsWithLessons);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

  // İstatistikler
  const totalStudents = students.length;
  const thisMonthStudents = students.filter(s => {
    const date = new Date(s.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const totalLessons = students.reduce((sum, s) => sum + s.total_lessons, 0);

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
        <h1 className="text-2xl font-bold text-slate-900">Öğrenciler</h1>
        <p className="text-slate-600 mt-1">Tüm öğrencileri görüntüleyin</p>
      </div>

      {/* Arama */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="İsim veya email ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-6">
          <span className="text-sm font-medium text-slate-500">Toplam Öğrenci</span>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalStudents}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-6">
          <span className="text-sm font-medium text-slate-500">Bu Ay Kayıt</span>
          <p className="text-3xl font-bold text-green-600 mt-2">{thisMonthStudents}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-6">
          <span className="text-sm font-medium text-slate-500">Toplam Ders</span>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalLessons}</p>
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-4 px-6 font-medium text-slate-600">Öğrenci</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Telefon</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Veli</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Ders Sayısı</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  {searchTerm ? 'Aramayla eşleşen öğrenci bulunamadı' : 'Henüz öğrenci bulunmuyor'}
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-[#D4AF37]">
                          {student.full_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{student.full_name || 'Isimsiz'}</p>
                        <p className="text-sm text-slate-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {student.phone || '-'}
                  </td>
                  <td className="py-4 px-6">
                    {student.parent_name ? (
                      <div>
                        <p className="text-slate-900">{student.parent_name}</p>
                        <p className="text-sm text-slate-500">{student.parent_phone || '-'}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-medium text-slate-900">{student.total_lessons}</span>
                  </td>
                  <td className="py-4 px-6 text-center text-slate-600">
                    {formatDate(student.created_at)}
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
