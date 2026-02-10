'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Banknote, Eye, ChevronRight, RefreshCw } from 'lucide-react';

interface ExpenseReceipt {
  id: string;
  receipt_number: string;
  full_name: string;
  tc_number: string | null;
  address: string | null;
  iban: string | null;
  gross_amount: number;
  stopaj_rate: number;
  stopaj_amount: number;
  net_amount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PAID' | 'REJECTED';
  admin_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  lesson_id: string;
  lessons?: {
    id: string;
    scheduled_at: string;
    subject: string;
    student_profiles?: {
      full_name: string;
    };
  };
}

const statusConfig = {
  DRAFT: {
    label: 'Taslak',
    color: 'bg-amber-100 text-amber-700',
    icon: Clock,
    description: 'Bilgilerinizi kontrol edip gönderiniz',
  },
  SUBMITTED: {
    label: 'Gönderildi',
    color: 'bg-blue-100 text-blue-700',
    icon: AlertCircle,
    description: 'Admin onayı bekleniyor',
  },
  APPROVED: {
    label: 'Onaylandı',
    color: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle,
    description: 'Ödeme bekleniyor',
  },
  PAID: {
    label: 'Ödendi',
    color: 'bg-green-100 text-green-700',
    icon: Banknote,
    description: 'Ödeme tamamlandı',
  },
  REJECTED: {
    label: 'Reddedildi',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
    description: 'Düzeltme gerekli',
  },
};

export default function GiderPusulasiPage() {
  const [receipts, setReceipts] = useState<ExpenseReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get teacher profile
      const { data: teacher } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!teacher) return;

      // Get expense receipts with lesson info
      const { data: receiptsData, error } = await supabase
        .from('expense_receipts')
        .select(`
          *,
          lessons (
            id,
            scheduled_at,
            subject,
            student_id
          )
        `)
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading receipts:', error);
        return;
      }

      // Get student names
      if (receiptsData && receiptsData.length > 0) {
        const studentIds = [...new Set(receiptsData.map(r => r.lessons?.student_id).filter(Boolean))];
        const { data: students } = await supabase
          .from('student_profiles')
          .select('id, full_name')
          .in('id', studentIds);

        const studentMap = new Map(students?.map(s => [s.id, s.full_name]) || []);

        const enrichedReceipts = receiptsData.map(r => ({
          ...r,
          lessons: r.lessons ? {
            ...r.lessons,
            student_profiles: {
              full_name: studentMap.get(r.lessons.student_id) || 'Öğrenci'
            }
          } : null
        }));

        setReceipts(enrichedReceipts);
      } else {
        setReceipts([]);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return Number(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const filteredReceipts = filter === 'all'
    ? receipts
    : receipts.filter(r => r.status === filter);

  const stats = {
    draft: receipts.filter(r => r.status === 'DRAFT').length,
    submitted: receipts.filter(r => r.status === 'SUBMITTED').length,
    approved: receipts.filter(r => r.status === 'APPROVED').length,
    paid: receipts.filter(r => r.status === 'PAID').length,
    rejected: receipts.filter(r => r.status === 'REJECTED').length,
  };

  const totalPaid = receipts
    .filter(r => r.status === 'PAID')
    .reduce((sum, r) => sum + Number(r.net_amount), 0);

  const totalPending = receipts
    .filter(r => ['DRAFT', 'SUBMITTED', 'APPROVED'].includes(r.status))
    .reduce((sum, r) => sum + Number(r.net_amount), 0);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8960C] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
              <FileText className="w-6 h-6 text-[#0F172A]" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">Gider Pusulası</h1>
              <p className="text-slate-500 text-sm">Tamamlanan dersler için gider pusulalarınız</p>
            </div>
          </div>
          <button
            onClick={loadReceipts}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Banknote className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm text-slate-400">Toplam Ödenen</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-slate-600">Bekleyen Ödeme</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-slate-600">Onay Bekleyen</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <span className="text-sm text-slate-600">Taslak</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.draft}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'Tümü', count: receipts.length },
          { key: 'DRAFT', label: 'Taslak', count: stats.draft },
          { key: 'SUBMITTED', label: 'Gönderildi', count: stats.submitted },
          { key: 'APPROVED', label: 'Onaylandı', count: stats.approved },
          { key: 'PAID', label: 'Ödendi', count: stats.paid },
          { key: 'REJECTED', label: 'Reddedildi', count: stats.rejected },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-[#D4AF37] text-[#0F172A]'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label} {f.count > 0 && <span className="ml-1 opacity-70">({f.count})</span>}
          </button>
        ))}
      </div>

      {/* Receipt List */}
      {filteredReceipts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Gider pusulası bulunamadı</p>
          <p className="text-slate-400 text-sm mt-1">
            Dersleriniz tamamlandıkça gider pusulaları otomatik oluşturulacak
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReceipts.map((receipt) => {
            const StatusIcon = statusConfig[receipt.status].icon;
            return (
              <Link
                key={receipt.id}
                href={`/teacher/gider-pusulasi/${receipt.id}`}
                className="block bg-white rounded-2xl border border-slate-200 hover:border-[#D4AF37]/30 hover:shadow-lg hover:shadow-[#D4AF37]/5 transition-all duration-200"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-semibold text-[#D4AF37]">
                          {receipt.receipt_number}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[receipt.status].color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig[receipt.status].label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                        <span className="font-medium">{receipt.lessons?.subject || 'Ders'}</span>
                        <span className="text-slate-400">•</span>
                        <span>{receipt.lessons?.student_profiles?.full_name || 'Öğrenci'}</span>
                        <span className="text-slate-400">•</span>
                        <span>{receipt.lessons?.scheduled_at ? formatDate(receipt.lessons.scheduled_at) : '-'}</span>
                      </div>
                      {receipt.status === 'REJECTED' && receipt.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                          <p className="text-sm text-red-700">
                            <strong>Red Sebebi:</strong> {receipt.rejection_reason}
                          </p>
                        </div>
                      )}
                      {receipt.status === 'DRAFT' && (!receipt.tc_number || !receipt.address || !receipt.iban) && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                          <p className="text-sm text-amber-700">
                            Eksik bilgiler var. Göndermek için tamamlayın.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Net Tutar</p>
                        <p className="text-xl font-bold text-emerald-600">{formatCurrency(receipt.net_amount)}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
        <h3 className="font-semibold text-blue-900 mb-2">Nasıl Çalışır?</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>Dersiniz tamamlandığında sistem otomatik olarak gider pusulası oluşturur (Taslak)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>TC Kimlik, Adres ve IBAN bilgilerinizi kontrol edip "Gönder" butonuna tıklayın</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>Admin onayından sonra ödemeniz IBAN'ınıza yapılacaktır</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
