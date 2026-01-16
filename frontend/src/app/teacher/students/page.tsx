'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await api.getMyStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">Öğrencilerim</h1>
        <p className="text-slate-600">Derse giren öğrencilerinizin listesi</p>
      </div>

      {students.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student.id} className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center font-display font-semibold text-2xl text-navy-600">
                  {student.firstName?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-navy-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-slate-600">{student.totalLessons || 0} ders</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600">
                  Son Ders: {student.lastLesson ? new Date(student.lastLesson).toLocaleDateString('tr-TR') : 'Henüz yok'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-slate-500">Henüz öğrenciniz bulunmuyor</p>
        </div>
      )}
    </div>
  );
}
