'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Student {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  total_lessons: number;
  completed_lessons: number;
  last_lesson_date: string | null;
  total_spent: number;
}

export default function TeacherStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, student_id, price, status, scheduled_at')
        .eq('teacher_id', user.id);

      if (!lessons || lessons.length === 0) {
        setStudents([]);
        return;
      }

      const uniqueStudentIds = [...new Set(lessons.map(l => l.student_id).filter(Boolean))];

      const { data: studentProfiles } = await supabase
        .from('student_profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', uniqueStudentIds);

      const profileMap = new Map();
      (studentProfiles || []).forEach(p => profileMap.set(p.id, p));

      const studentMap = new Map<string, Student>();

      lessons.forEach(lesson => {
        const studentId = lesson.student_id;
        if (!studentId) return;
        const profile = profileMap.get(studentId);
        
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            id: studentId,
            full_name: profile?.full_name || 'Öğrenci',
            email: profile?.email || '',
            avatar_url: profile?.avatar_url || null,
            total_lessons: 0,
            completed_lessons: 0,
            last_lesson_date: null,
            total_spent: 0
          });
        }

        const student = studentMap.get(studentId)!;
        student.total_lessons += 1;
        
        if (lesson.status === 'COMPLETED') {
          student.completed_lessons += 1;
          student.total_spent += lesson.price || 0;
        }

        if (!student.last_lesson_date || new Date(lesson.scheduled_at) > new Date(student.last_lesson_date)) {
          student.last_lesson_date = lesson.scheduled_at;
        }
      });

      setStudents(Array.from(studentMap.values()));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (n: number) => n.toLocaleString('tr-TR') + ' TL';

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="font-serif text-2xl font-bold text-slate-900">Öğrencilerim</h1>
        <p className="text-slate-600 mt-1">Ders verdiğiniz öğrencilerin listesi</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Öğrenci ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md pl-4 pr-4 py-2 border border-white/50 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-[#0F172A]/5 p-12 text-center">
          <p className="text-slate-600">Henüz öğrenci bulunmuyor.</p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-[#0F172A]/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-4 px-6 font-medium text-slate-600">Öğrenci</th>
                <th className="text-center py-4 px-6 font-medium text-slate-600">Toplam Ders</th>
                <th className="text-center py-4 px-6 font-medium text-slate-600">Tamamlanan</th>
                <th className="text-center py-4 px-6 font-medium text-slate-600">Son Ders</th>
                <th className="text-right py-4 px-6 font-medium text-slate-600">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-[#D4AF37]">
                          {student.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{student.full_name}</p>
                        <p className="text-sm text-slate-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-medium">{student.total_lessons}</td>
                  <td className="py-4 px-6 text-center text-green-600 font-medium">{student.completed_lessons}</td>
                  <td className="py-4 px-6 text-center text-slate-600">{formatDate(student.last_lesson_date)}</td>
                  <td className="py-4 px-6 text-right font-medium">{formatCurrency(student.total_spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
