'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subjects: string[];
  base_price: number;
  commission_rate: number;
  completed_lessons_count: number;
  is_verified: boolean;
  updated_at: string;
  avatar_url: string | null;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('teacher_profiles')
        .select('id, full_name, email, phone, subjects, base_price, commission_rate, completed_lessons_count, is_verified, updated_at, avatar_url')
        .order('updated_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setTeachers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (teacherId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('teacher_profiles')
        .update({ is_verified: !currentStatus })
        .eq('id', teacherId);

      if (error) throw error;
      loadTeachers();
      setSelectedTeacher(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredTeachers = teachers.filter(t => {
    if (filter === 'verified') return t.is_verified;
    if (filter === 'unverified') return !t.is_verified;
    return true;
  });

  const formatCurrency = (n: number) => (n || 0).toLocaleString('tr-TR') + ' TL';
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('tr-TR') : '-';

  const getCommissionLabel = (rate: number) => {
    if (rate === 0.15) return 'Premium (%15)';
    if (rate === 0.20) return 'Standart (%20)';
    return 'Baslangic (%25)';
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-red-700 font-semibold mb-2">Hata Olustu</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => { setError(null); setLoading(true); loadTeachers(); }}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ogretmenler</h1>
          <p className="text-slate-600 mt-1">Tum ogretmenleri yonetin</p>
        </div>
        <div className="text-sm text-slate-500">
          Toplam: {teachers.length} ogretmen
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex gap-2 mb-6">
        {(['all', 'verified', 'unverified'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-red-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {f === 'all' ? 'Tumu' : f === 'verified' ? 'Onaylilar' : 'Onaysizlar'}
            <span className="ml-2 text-xs">
              ({f === 'all' ? teachers.length : 
                f === 'verified' ? teachers.filter(t => t.is_verified).length :
                teachers.filter(t => !t.is_verified).length})
            </span>
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-4 px-6 font-medium text-slate-600">Ogretmen</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Branslar</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Baz Fiyat</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Komisyon</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Ders</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Durum</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Islem</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Ogretmen bulunamadi
                </td>
              </tr>
            ) : (
              filteredTeachers.map(teacher => (
                <tr key={teacher.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {teacher.avatar_url ? (
                        <img src={teacher.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-700">
                            {teacher.full_name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{teacher.full_name || 'Isimsiz'}</p>
                        <p className="text-sm text-slate-500">{teacher.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects?.slice(0, 2).map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {s}
                        </span>
                      ))}
                      {(teacher.subjects?.length || 0) > 2 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          +{teacher.subjects.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-medium">
                    {formatCurrency(teacher.base_price)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-sm text-slate-600">
                      {getCommissionLabel(teacher.commission_rate || 0.25)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center font-medium">
                    {teacher.completed_lessons_count || 0}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {teacher.is_verified ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Onayli
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        Bekliyor
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => setSelectedTeacher(teacher)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      Detay
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  {selectedTeacher.avatar_url ? (
                    <img src={selectedTeacher.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-blue-700">
                        {selectedTeacher.full_name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedTeacher.full_name}</h2>
                    <p className="text-slate-500">{selectedTeacher.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTeacher(null)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500">Telefon</label>
                    <p className="font-medium">{selectedTeacher.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Son Guncelleme</label>
                    <p className="font-medium">{formatDate(selectedTeacher.updated_at)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-500">Branslar</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTeacher.subjects?.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">{s}</span>
                    )) || <span className="text-slate-400">-</span>}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Fiyatlandirma</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Baz Fiyat:</span>
                      <span className="font-medium">{formatCurrency(selectedTeacher.base_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Komisyon Orani:</span>
                      <span className="font-medium">{getCommissionLabel(selectedTeacher.commission_rate || 0.25)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tamamlanan Ders:</span>
                      <span className="font-medium">{selectedTeacher.completed_lessons_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                {selectedTeacher.is_verified ? (
                  <button
                    onClick={() => toggleVerification(selectedTeacher.id, true)}
                    className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-xl transition-colors"
                  >
                    Onayi Kaldir
                  </button>
                ) : (
                  <button
                    onClick={() => toggleVerification(selectedTeacher.id, false)}
                    className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
                  >
                    Onayla
                  </button>
                )}
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
