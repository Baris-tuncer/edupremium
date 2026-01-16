'use client';

import React, { useState, useEffect } from 'react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  user: {
    email: string;
    phone?: string;
    status: string;
    createdAt: string;
  };
  gradeLevel?: number;
  schoolName?: string;
  parentName?: string;
  parentEmail?: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app'}/admin/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudents(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      SUSPENDED: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Aktif',
      INACTIVE: 'Pasif',
      PENDING: 'Beklemede',
      SUSPENDED: 'Askıya Alındı',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.ACTIVE}`}>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Öğrenciler</h1>
          <p className="text-slate-600 mt-1">Tüm öğrencileri görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="İsim veya email ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-navy-900">{students.length}</div>
          <div className="text-slate-600">Toplam Öğrenci</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-green-600">
            {students.filter(s => s.user?.status === 'ACTIVE').length}
          </div>
          <div className="text-slate-600">Aktif Öğrenci</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="text-3xl font-bold text-blue-600">
            {students.filter(s => {
              const date = new Date(s.user?.createdAt);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
          </div>
          <div className="text-slate-600">Bu Ay Kayıt</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Öğrenci</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Sınıf</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Veli</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Durum</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center font-semibold text-navy-600">
                        {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-navy-900">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-slate-500">{student.schoolName || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{student.user?.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {student.gradeLevel ? `${student.gradeLevel}. Sınıf` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{student.parentName || '-'}</td>
                  <td className="px-6 py-4">{getStatusBadge(student.user?.status || 'ACTIVE')}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {student.user?.createdAt ? new Date(student.user.createdAt).toLocaleDateString('tr-TR') : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  {searchTerm ? 'Aramanızla eşleşen öğrenci bulunamadı' : 'Henüz öğrenci bulunmuyor'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
