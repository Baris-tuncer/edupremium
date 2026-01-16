'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gradeLevel?: number;
  schoolName?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  totalAppointments: number;
  isActive: boolean;
  status: string;
  createdAt: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

      const response = await fetch(`${baseUrl}/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Öğrenciler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'active') return matchesSearch && student.isActive;
    if (filter === 'inactive') return matchesSearch && !student.isActive;
    return matchesSearch;
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        Aktif
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        Pasif
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Öğrenciler</h1>
          <p className="text-gray-600 mt-1">Randevu alan tüm öğrencileri görüntüleyin</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="İsim veya email ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : 'Pasif'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-gray-900">{students.length}</div>
          <div className="text-gray-600">Toplam Öğrenci</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-green-600">
            {students.filter((s) => s.isActive).length}
          </div>
          <div className="text-gray-600">Aktif Öğrenci</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-blue-600">
            {students.reduce((sum, s) => sum + (s.totalAppointments || 0), 0)}
          </div>
          <div className="text-gray-600">Toplam Randevu</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-purple-600">
            {
              students.filter((s) => {
                const date = new Date(s.createdAt);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length
            }
          </div>
          <div className="text-gray-600">Bu Ay Kayıt</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Öğrenci</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Telefon</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Veli</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Randevu</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Durum</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kayıt</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                        {student.firstName?.charAt(0)}
                        {student.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        {student.schoolName && (
                          <div className="text-sm text-gray-500">{student.schoolName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {student.parentName || '-'}
                    {student.parentPhone && (
                      <div className="text-xs text-gray-400">{student.parentPhone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {student.totalAppointments || 0}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(student.isActive)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(student.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
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
