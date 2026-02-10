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
  Download,
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
  lesson_duration?: number;
  student_name?: string;
  teacher_signature?: string;
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
            student_id,
            duration_minutes
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

      // Get teacher info and student names
      if (receiptsData && receiptsData.length > 0) {
        const teacherIds = [...new Set(receiptsData.map(r => r.teacher_id))];
        const studentIds = [...new Set(receiptsData.map(r => r.lessons?.student_id).filter(Boolean))];

        const { data: teachers } = await supabase
          .from('teacher_profiles')
          .select('id, email, phone, signature_image')
          .in('id', teacherIds);

        const { data: students } = await supabase
          .from('student_profiles')
          .select('id, full_name')
          .in('id', studentIds);

        const teacherMap = new Map(teachers?.map(t => [t.id, t]) || []);
        const studentMap = new Map(students?.map(s => [s.id, s.full_name]) || []);

        const enrichedReceipts = receiptsData.map(r => ({
          ...r,
          teacher_email: teacherMap.get(r.teacher_id)?.email || '',
          teacher_phone: teacherMap.get(r.teacher_id)?.phone || '',
          teacher_signature: teacherMap.get(r.teacher_id)?.signature_image || '',
          lesson_subject: r.lessons?.subject || '',
          lesson_date: r.lessons?.scheduled_at || '',
          lesson_duration: r.lessons?.duration_minutes || 60,
          student_name: r.lessons?.student_id ? studentMap.get(r.lessons.student_id) || 'Öğrenci' : 'Öğrenci',
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

  const handleDownloadPDF = (receipt: ExpenseReceipt) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Gider Pusulası - ${receipt.receipt_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: A4; margin: 10mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 15px 25px; max-width: 800px; margin: 0 auto; font-size: 12px; }
          .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
          .header h1 { font-size: 22px; color: #0F172A; margin-bottom: 4px; font-weight: 700; }
          .header .receipt-no { font-family: monospace; font-size: 16px; color: #D4AF37; font-weight: 600; }
          .header .date { font-size: 11px; color: #64748B; margin-top: 4px; }
          .section { margin-bottom: 12px; }
          .section-title { font-size: 11px; font-weight: 700; color: #0F172A; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .info-item { background: #F8FAFC; padding: 8px 10px; border-radius: 6px; }
          .info-label { font-size: 9px; color: #0F172A; margin-bottom: 2px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-value { font-size: 12px; color: #0F172A; font-weight: 500; }
          .amount-box { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color: white; padding: 14px; border-radius: 8px; margin-top: 8px; }
          .amount-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center; }
          .amount-label { font-size: 9px; color: #94A3B8; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; }
          .amount-value { font-size: 16px; font-weight: bold; }
          .amount-value.net { color: #4ADE80; font-size: 18px; }
          .amount-note { font-size: 9px; color: #FCD34D; margin-top: 3px; font-weight: 500; }
          .signature-area { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          .signature-box { text-align: center; }
          .signature-name { font-size: 12px; font-weight: 600; color: #0F172A; margin-bottom: 4px; }
          .signature-title { font-size: 10px; color: #64748B; margin-bottom: 6px; }
          .signature-image { height: 50px; margin-bottom: 6px; }
          .signature-image img { max-height: 50px; max-width: 150px; }
          .signature-line { border-top: 1px solid #0F172A; padding-top: 6px; }
          .signature-label { font-size: 10px; color: #64748B; font-weight: 600; text-transform: uppercase; }
          .footer { margin-top: 15px; padding: 10px; background: #F8FAFC; border-radius: 6px; text-align: center; }
          .footer-note { font-size: 9px; color: #64748B; line-height: 1.5; }
          .footer-note strong { color: #0F172A; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GİDER PUSULASI</h1>
          <div class="receipt-no">${receipt.receipt_number}</div>
          <div class="date">Düzenleme Tarihi: ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>

        <div class="section">
          <div class="section-title">Ödeme Yapılan Kişi Bilgileri</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Ad Soyad</div>
              <div class="info-value">${receipt.full_name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">TC Kimlik No</div>
              <div class="info-value">${receipt.tc_number || '-'}</div>
            </div>
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">Adres</div>
              <div class="info-value">${receipt.address || '-'}</div>
            </div>
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">IBAN Numarası</div>
              <div class="info-value" style="font-family: monospace; letter-spacing: 1px;">${receipt.iban || '-'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Hizmet Bilgileri</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Verilen Hizmet</div>
              <div class="info-value">${receipt.lesson_subject || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Hizmet Alan</div>
              <div class="info-value">${receipt.student_name || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Hizmet Tarihi</div>
              <div class="info-value">${receipt.lesson_date ? new Date(receipt.lesson_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Hizmet Süresi</div>
              <div class="info-value">${receipt.lesson_duration || 60} dakika</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Ödeme Bilgileri</div>
          <div class="amount-box">
            <div class="amount-grid">
              <div>
                <div class="amount-label">Brüt Tutar</div>
                <div class="amount-value">${formatCurrency(receipt.gross_amount)}</div>
              </div>
              <div>
                <div class="amount-label">Stopaj (%${Number(receipt.stopaj_rate)})</div>
                <div class="amount-value">${formatCurrency(receipt.stopaj_amount)}</div>
                <div class="amount-note">Platform tarafından ödenir</div>
              </div>
              <div>
                <div class="amount-label">Net Ödeme Tutarı</div>
                <div class="amount-value net">${formatCurrency(receipt.net_amount)}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="signature-area">
          <div class="signature-box">
            <div class="signature-name">EduPremium</div>
            <div class="signature-title">Eğitim Teknolojileri</div>
            <div class="signature-image"></div>
            <div class="signature-line">
              <div class="signature-label">Ödemeyi Yapan</div>
            </div>
          </div>
          <div class="signature-box">
            <div class="signature-name">${receipt.full_name}</div>
            <div class="signature-title">Eğitmen</div>
            <div class="signature-image">
              ${receipt.teacher_signature ? `<img src="${receipt.teacher_signature}" alt="İmza" />` : ''}
            </div>
            <div class="signature-line">
              <div class="signature-label">Ödemeyi Alan</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="footer-note">
            Bu belge <strong>${receipt.receipt_number}</strong> numarası ile dijital ortamda oluşturulmuştur.<br>
            Belge, tarafların platform üzerinden verdikleri onay ile geçerlilik kazanmıştır.<br>
            Oluşturulma: ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
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
                        <button
                          onClick={() => handleDownloadPDF(receipt)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="PDF İndir"
                        >
                          <Download className="w-4 h-4" />
                        </button>
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
