'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Payment {
  id: string;
  lesson_id: string;
  subject: string;
  teacher_name: string;
  student_name: string;
  price: number;
  teacher_earning: number;
  platform_commission: number;
  status: string;
  scheduled_at: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    platformCommission: 0,
    teacherPayments: 0,
    completedCount: 0
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      // Tamamlanmış dersleri çek (ödemeler olarak)
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('id, subject, price, status, scheduled_at, teacher_id, student_id')
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      // Öğretmen ve öğrenci isimlerini al
      const teacherIds = [...new Set(lessons?.map(l => l.teacher_id) || [])];
      const studentIds = [...new Set(lessons?.map(l => l.student_id).filter(Boolean) || [])];

      const { data: teachers } = await supabase
        .from('teacher_profiles')
        .select('id, full_name')
        .in('id', teacherIds);

      const { data: students } = await supabase
        .from('student_profiles')
        .select('id, full_name')
        .in('id', studentIds.length > 0 ? studentIds : ['00000000-0000-0000-0000-000000000000']);

      const teacherMap = new Map();
      (teachers || []).forEach(t => teacherMap.set(t.id, t.full_name));

      const studentMap = new Map();
      (students || []).forEach(s => studentMap.set(s.id, s.full_name));

      // Komisyon hesapla (%25)
      const commissionRate = 0.25;
      
      const formattedPayments = (lessons || []).map(l => {
        const commission = Math.round((l.price || 0) * commissionRate);
        const teacherEarning = (l.price || 0) - commission;
        
        return {
          id: l.id,
          lesson_id: l.id,
          subject: l.subject,
          teacher_name: teacherMap.get(l.teacher_id) || 'Bilinmiyor',
          student_name: studentMap.get(l.student_id) || 'Bilinmiyor',
          price: l.price || 0,
          teacher_earning: teacherEarning,
          platform_commission: commission,
          status: l.status,
          scheduled_at: l.scheduled_at
        };
      });

      setPayments(formattedPayments);

      // İstatistikler (sadece tamamlanan dersler)
      const completed = formattedPayments.filter(p => p.status === 'COMPLETED');
      const totalRevenue = completed.reduce((sum, p) => sum + p.price, 0);
      const platformCommission = completed.reduce((sum, p) => sum + p.platform_commission, 0);
      const teacherPayments = completed.reduce((sum, p) => sum + p.teacher_earning, 0);

      setStats({
        totalRevenue,
        platformCommission,
        teacherPayments,
        completedCount: completed.length
      });

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const formatCurrency = (n: number) => n.toLocaleString('tr-TR') + ' TL';
  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'CONFIRMED': 'bg-blue-100 text-blue-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'CANCELLED': 'bg-red-100 text-red-700'
    };
    const labels: Record<string, string> = {
      'PENDING': 'Bekliyor',
      'CONFIRMED': 'Onaylandı',
      'COMPLETED': 'Tamamlandı',
      'CANCELLED': 'İptal'
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-slate-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

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
        <h1 className="text-2xl font-bold text-slate-900">Ödemeler</h1>
        <p className="text-slate-600 mt-1">Tüm ödeme işlemlerini görüntüleyebilirsiniz</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-green-100 text-sm">Toplam Gelir (Brut)</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-green-100 text-sm mt-1">{stats.completedCount} tamamlanan ders</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm">Platform Komisyonu</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(stats.platformCommission)}</p>
          <p className="text-blue-100 text-sm mt-1">%25 komisyon</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-purple-100 text-sm">Öğretmen Ödemeleri</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(stats.teacherPayments)}</p>
          <p className="text-purple-100 text-sm mt-1">Net ödenen</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <p className="text-orange-100 text-sm">Bekleyen Ödeme</p>
          <p className="text-3xl font-bold mt-2">{payments.filter(p => p.status === 'CONFIRMED').length}</p>
          <p className="text-orange-100 text-sm mt-1">Onaylanmış dersler</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: 'all', label: 'Tümü' },
          { value: 'PENDING', label: 'Bekleyen' },
          { value: 'CONFIRMED', label: 'Onaylanan' },
          { value: 'COMPLETED', label: 'Tamamlanan' },
          { value: 'CANCELLED', label: 'İptal' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f.value
                ? 'bg-[#0F172A] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-4 px-6 font-medium text-slate-600">Tarih</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Ders</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Öğretmen</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Öğrenci</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Toplam</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Komisyon</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Öğretmen</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Durum</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  Ödeme bulunamadı
                </td>
              </tr>
            ) : (
              filteredPayments.map(payment => (
                <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6 text-slate-600">
                    {formatDate(payment.scheduled_at)}
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-900">
                    {payment.subject}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {payment.teacher_name}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {payment.student_name}
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-slate-900">
                    {formatCurrency(payment.price)}
                  </td>
                  <td className="py-4 px-6 text-center text-blue-600 font-medium">
                    {formatCurrency(payment.platform_commission)}
                  </td>
                  <td className="py-4 px-6 text-center text-green-600 font-medium">
                    {formatCurrency(payment.teacher_earning)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {getStatusBadge(payment.status)}
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
