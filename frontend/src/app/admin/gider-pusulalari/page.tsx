'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Banknote,
  RefreshCw,
  Eye,
  X,
  CreditCard,
  Search,
  Zap,
} from 'lucide-react';

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
  teacher_id: string;
  lesson_id: string;
  teacher_email?: string;
  teacher_phone?: string;
  lesson_subject?: string;
  lesson_date?: string;
}

interface Statistics {
  draft: number;
  submitted: number;
  approved: number;
  paid: number;
  rejected: number;
  totalPaid: number;
}

const statusConfig = {
  DRAFT: {
    label: 'Taslak',
    color: 'bg-amber-100 text-amber-700',
    icon: Clock,
  },
  SUBMITTED: {
    label: 'Gönderildi',
    color: 'bg-blue-100 text-blue-700',
    icon: AlertCircle,
  },
  APPROVED: {
    label: 'Onaylandı',
    color: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle,
  },
  PAID: {
    label: 'Ödendi',
    color: 'bg-green-100 text-green-700',
    icon: Banknote,
  },
  REJECTED: {
    label: 'Reddedildi',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
};

export default function AdminGiderPusulalariPage() {
  const [receipts, setReceipts] = useState<ExpenseReceipt[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<ExpenseReceipt | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Build query
      let query = supabase
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
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: receiptsData, error } = await query;

      if (error) {
        console.error('Error loading receipts:', error);
        return;
      }

      // Get teacher info
      if (receiptsData && receiptsData.length > 0) {
        const teacherIds = [...new Set(receiptsData.map(r => r.teacher_id))];
        const { data: teachers } = await supabase
          .from('teacher_profiles')
          .select('id, email, phone')
          .in('id', teacherIds);

        const teacherMap = new Map(teachers?.map(t => [t.id, t]) || []);

        const enrichedReceipts = receiptsData.map(r => ({
          ...r,
          teacher_email: teacherMap.get(r.teacher_id)?.email || '',
          teacher_phone: teacherMap.get(r.teacher_id)?.phone || '',
          lesson_subject: r.lessons?.subject || '',
          lesson_date: r.lessons?.scheduled_at || '',
        }));

        setReceipts(enrichedReceipts);

        // Calculate statistics
        const stats: Statistics = {
          draft: enrichedReceipts.filter(r => r.status === 'DRAFT').length,
          submitted: enrichedReceipts.filter(r => r.status === 'SUBMITTED').length,
          approved: enrichedReceipts.filter(r => r.status === 'APPROVED').length,
          paid: enrichedReceipts.filter(r => r.status === 'PAID').length,
          rejected: enrichedReceipts.filter(r => r.status === 'REJECTED').length,
          totalPaid: enrichedReceipts
            .filter(r => r.status === 'PAID')
            .reduce((sum, r) => sum + Number(r.net_amount), 0),
        };
        setStatistics(stats);
      } else {
        setReceipts([]);
        setStatistics({
          draft: 0,
          submitted: 0,
          approved: 0,
          paid: 0,
          rejected: 0,
          totalPaid: 0,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReceipt) return;

    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('expense_receipts')
        .update({
          status: 'APPROVED',
          approved_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedReceipt.id);

      if (error) {
        console.error('Error approving:', error);
        alert('Onaylama sırasında bir hata oluştu');
        return;
      }

      setShowModal(false);
      setSelectedReceipt(null);
      setAdminNotes('');
      await loadData();
    } catch (error) {
      console.error('Error approving:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReceipt || !rejectionReason.trim()) {
      alert('Red sebebi zorunludur');
      return;
    }

    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('expense_receipts')
        .update({
          status: 'REJECTED',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedReceipt.id);

      if (error) {
        console.error('Error rejecting:', error);
        alert('Reddetme sırasında bir hata oluştu');
        return;
      }

      setShowModal(false);
      setSelectedReceipt(null);
      setRejectionReason('');
      await loadData();
    } catch (error) {
      console.error('Error rejecting:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (receipt: ExpenseReceipt) => {
    if (!confirm(`${receipt.receipt_number} numaralı pusulayı ödendi olarak işaretlemek istiyor musunuz?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('expense_receipts')
        .update({
          status: 'PAID',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', receipt.id);

      if (error) {
        console.error('Error marking as paid:', error);
        alert('İşlem sırasında bir hata oluştu');
        return;
      }

      await loadData();
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const handleGenerateMissing = async () => {
    alert('Bu özellik henüz aktif değil. Gider pusulaları ders tamamlandığında otomatik oluşturulacak.');
  };

  const formatCurrency = (amount: number) => {
    return Number(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredReceipts = receipts.filter((r) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      r.receipt_number.toLowerCase().includes(search) ||
      r.full_name.toLowerCase().includes(search) ||
      (r.teacher_email && r.teacher_email.toLowerCase().includes(search))
    );
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8960C] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
            <FileText className="w-6 h-6 text-[#0F172A]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">Gider Pusulaları</h1>
            <p className="text-slate-500 text-sm">Öğretmen gider pusulalarını yönetin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateMissing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Eksikleri Oluştur
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {statistics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-slate-500">Taslak</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{statistics.draft}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-slate-500">Bekleyen</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{statistics.submitted}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-slate-500">Onaylı</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{statistics.approved}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="w-4 h-4 text-green-600" />
              <span className="text-xs text-slate-500">Ödendi</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{statistics.paid}</p>
          </div>
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs text-slate-400">Toplam Ödenen</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(statistics.totalPaid)}</p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pusula no, isim veya email ile ara..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Tümü' },
            { key: 'SUBMITTED', label: 'Bekleyen' },
            { key: 'APPROVED', label: 'Onaylı' },
            { key: 'PAID', label: 'Ödendi' },
            { key: 'REJECTED', label: 'Reddedildi' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-[#D4AF37] text-[#0F172A]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredReceipts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Gider pusulası bulunamadı</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm">Pusula No</th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm">Öğretmen</th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm">Ders</th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm">Net Tutar</th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm">Durum</th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm">Tarih</th>
                <th className="text-right py-4 px-4 font-semibold text-slate-700 text-sm">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.map((receipt) => {
                const StatusIcon = statusConfig[receipt.status].icon;
                return (
                  <tr key={receipt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm font-semibold text-[#D4AF37]">
                        {receipt.receipt_number}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{receipt.full_name}</p>
                        <p className="text-xs text-slate-500">{receipt.teacher_email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-slate-900">{receipt.lesson_subject || '-'}</p>
                        <p className="text-xs text-slate-500">
                          {receipt.lesson_date ? formatDate(receipt.lesson_date) : '-'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(receipt.net_amount)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[receipt.status].color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig[receipt.status].label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500">
                      {formatDate(receipt.created_at)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {receipt.status === 'SUBMITTED' && (
                          <button
                            onClick={() => {
                              setSelectedReceipt(receipt);
                              setShowModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="İncele"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {receipt.status === 'APPROVED' && (
                          <button
                            onClick={() => handleMarkPaid(receipt)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                          >
                            <Banknote className="w-4 h-4" />
                            Ödendi
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedReceipt.receipt_number}</h2>
                  <p className="text-slate-500 text-sm">Gider Pusulası Detayı</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedReceipt(null);
                    setRejectionReason('');
                    setAdminNotes('');
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Teacher Info */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Öğretmen Bilgileri</h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ad Soyad</span>
                    <span className="font-medium">{selectedReceipt.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">TC Kimlik No</span>
                    <span className="font-mono">{selectedReceipt.tc_number || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email</span>
                    <span>{selectedReceipt.teacher_email || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Telefon</span>
                    <span>{selectedReceipt.teacher_phone || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Adres</h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-700">{selectedReceipt.address || 'Belirtilmemiş'}</p>
                </div>
              </div>

              {/* IBAN */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">IBAN</h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-mono text-slate-700">{selectedReceipt.iban || 'Belirtilmemiş'}</p>
                </div>
              </div>

              {/* Amount */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Tutar Bilgileri</h3>
                <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 text-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Brüt Tutar</p>
                      <p className="text-lg font-bold">{formatCurrency(selectedReceipt.gross_amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Stopaj (%{selectedReceipt.stopaj_rate})</p>
                      <p className="text-lg font-bold text-amber-400">{formatCurrency(selectedReceipt.stopaj_amount)}</p>
                      <p className="text-xs text-amber-300 mt-1">Platform öder</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400">Öğretmene Ödenecek Tutar</p>
                      <p className="text-2xl font-bold text-emerald-400">{formatCurrency(selectedReceipt.net_amount)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block font-semibold text-slate-900 mb-2">Admin Notu (Opsiyonel)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="Öğretmene iletilecek not..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-colors resize-none"
                />
              </div>

              {/* Rejection Reason */}
              <div>
                <label className="block font-semibold text-slate-900 mb-2">Red Sebebi (Reddetmek için zorunlu)</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  placeholder="Reddedilme sebebini yazın..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                Reddet
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                {actionLoading ? 'İşleniyor...' : 'Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
