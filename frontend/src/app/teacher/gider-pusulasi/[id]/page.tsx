'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Banknote,
  Save,
  Send,
  Trash2,
  User,
  Calendar,
  BookOpen,
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
  lessons?: {
    id: string;
    scheduled_at: string;
    duration_minutes: number;
    subject: string;
    student_id: string;
  };
  student_name?: string;
}

const statusConfig = {
  DRAFT: {
    label: 'Taslak',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock,
    description: 'Bilgilerinizi kontrol edip gönderin',
  },
  SUBMITTED: {
    label: 'Gönderildi',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: AlertCircle,
    description: 'Admin onayı bekleniyor',
  },
  APPROVED: {
    label: 'Onaylandı',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
    description: 'Ödeme bekleniyor',
  },
  PAID: {
    label: 'Ödendi',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: Banknote,
    description: 'Ödeme tamamlandı',
  },
  REJECTED: {
    label: 'Reddedildi',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    description: 'Düzeltme gerekli',
  },
};

export default function GiderPusulasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<ExpenseReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    tc_number: '',
    address: '',
    iban: '',
  });

  useEffect(() => {
    loadReceipt();
  }, [params.id]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/teacher/login');
        return;
      }

      const { data: receiptData, error } = await supabase
        .from('expense_receipts')
        .select(`
          *,
          lessons (
            id,
            scheduled_at,
            duration_minutes,
            subject,
            student_id
          )
        `)
        .eq('id', params.id)
        .single();

      if (error || !receiptData) {
        console.error('Error loading receipt:', error);
        router.push('/teacher/gider-pusulasi');
        return;
      }

      // Verify ownership
      if (receiptData.teacher_id !== user.id) {
        router.push('/teacher/gider-pusulasi');
        return;
      }

      // Get student name
      if (receiptData.lessons?.student_id) {
        const { data: student } = await supabase
          .from('student_profiles')
          .select('full_name')
          .eq('id', receiptData.lessons.student_id)
          .single();

        receiptData.student_name = student?.full_name || 'Öğrenci';
      }

      setReceipt(receiptData);
      setFormData({
        tc_number: receiptData.tc_number || '',
        address: receiptData.address || '',
        iban: receiptData.iban || '',
      });
    } catch (error) {
      console.error('Error loading receipt:', error);
      router.push('/teacher/gider-pusulasi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!receipt) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('expense_receipts')
        .update({
          tc_number: formData.tc_number,
          address: formData.address,
          iban: formData.iban,
          updated_at: new Date().toISOString(),
          status: 'DRAFT',
          rejection_reason: null,
        })
        .eq('id', receipt.id);

      if (error) {
        console.error('Error saving:', error);
        alert('Kaydetme sırasında bir hata oluştu');
        return;
      }

      // Also update teacher profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('teacher_profiles')
          .update({
            tc_number: formData.tc_number || undefined,
            address: formData.address || undefined,
            iban: formData.iban || undefined,
          })
          .eq('id', user.id);
      }

      await loadReceipt();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!receipt) return;

    if (!formData.tc_number || !formData.address || !formData.iban) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      setSubmitting(true);

      // First save
      const { error: saveError } = await supabase
        .from('expense_receipts')
        .update({
          tc_number: formData.tc_number,
          address: formData.address,
          iban: formData.iban,
          updated_at: new Date().toISOString(),
        })
        .eq('id', receipt.id);

      if (saveError) {
        console.error('Error saving:', saveError);
        alert('Kaydetme sırasında bir hata oluştu');
        return;
      }

      // Then submit
      const { error: submitError } = await supabase
        .from('expense_receipts')
        .update({
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', receipt.id);

      if (submitError) {
        console.error('Error submitting:', submitError);
        alert('Gönderim sırasında bir hata oluştu');
        return;
      }

      await loadReceipt();
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!receipt) return;

    if (!confirm('Bu gider pusulasını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setDeleting(true);

      const { error } = await supabase
        .from('expense_receipts')
        .delete()
        .eq('id', receipt.id);

      if (error) {
        console.error('Error deleting:', error);
        alert('Silme sırasında bir hata oluştu');
        return;
      }

      router.push('/teacher/gider-pusulasi');
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setDeleting(false);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEditable = receipt?.status === 'DRAFT' || receipt?.status === 'REJECTED';

  const handleDownloadPDF = () => {
    if (!receipt) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Gider Pusulası - ${receipt.receipt_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; }
          .header h1 { font-size: 24px; color: #0F172A; margin-bottom: 5px; }
          .header .receipt-no { font-family: monospace; font-size: 18px; color: #D4AF37; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 14px; font-weight: bold; color: #64748B; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .info-item { }
          .info-label { font-size: 12px; color: #94A3B8; margin-bottom: 2px; }
          .info-value { font-size: 14px; color: #0F172A; font-weight: 500; }
          .amount-box { background: #0F172A; color: white; padding: 20px; border-radius: 12px; margin-top: 20px; }
          .amount-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center; }
          .amount-label { font-size: 11px; color: #94A3B8; margin-bottom: 5px; }
          .amount-value { font-size: 20px; font-weight: bold; }
          .amount-value.net { color: #4ADE80; font-size: 24px; }
          .amount-note { font-size: 10px; color: #FCD34D; margin-top: 5px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; color: #94A3B8; font-size: 12px; }
          .signature-area { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          .signature-box { text-align: center; padding-top: 60px; border-top: 1px solid #0F172A; }
          .signature-label { font-size: 12px; color: #64748B; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GİDER PUSULASI</h1>
          <div class="receipt-no">${receipt.receipt_number}</div>
        </div>

        <div class="section">
          <div class="section-title">Kişisel Bilgiler</div>
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
              <div class="info-label">IBAN</div>
              <div class="info-value" style="font-family: monospace;">${receipt.iban || '-'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Ders Bilgileri</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Ders</div>
              <div class="info-value">${receipt.lessons?.subject || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Öğrenci</div>
              <div class="info-value">${receipt.student_name || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tarih</div>
              <div class="info-value">${receipt.lessons?.scheduled_at ? new Date(receipt.lessons.scheduled_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Süre</div>
              <div class="info-value">${receipt.lessons?.duration_minutes || 60} dakika</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Tutar Bilgileri</div>
          <div class="amount-box">
            <div class="amount-grid">
              <div>
                <div class="amount-label">Brüt Tutar</div>
                <div class="amount-value">${formatCurrency(receipt.gross_amount)}</div>
              </div>
              <div>
                <div class="amount-label">Stopaj (%${Number(receipt.stopaj_rate)})</div>
                <div class="amount-value">${formatCurrency(receipt.stopaj_amount)}</div>
                <div class="amount-note">Platform öder</div>
              </div>
              <div>
                <div class="amount-label">Ödenecek Tutar</div>
                <div class="amount-value net">${formatCurrency(receipt.net_amount)}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="signature-area">
          <div class="signature-box">
            <div class="signature-label">Ödemeyi Yapan</div>
          </div>
          <div class="signature-box">
            <div class="signature-label">Ödemeyi Alan</div>
          </div>
        </div>

        <div class="footer">
          Bu belge ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} tarihinde oluşturulmuştur.
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Gider pusulası bulunamadı</p>
      </div>
    );
  }

  const StatusIcon = statusConfig[receipt.status].icon;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/teacher/gider-pusulasi"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8960C] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
                <FileText className="w-6 h-6 text-[#0F172A]" />
              </div>
              <div>
                <h1 className="font-mono text-xl font-bold text-slate-900">{receipt.receipt_number}</h1>
                <p className="text-slate-500 text-sm">Gider Pusulası</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF İndir
            </button>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${statusConfig[receipt.status].color}`}>
              <StatusIcon className="w-5 h-5" />
              <div>
                <p className="font-semibold">{statusConfig[receipt.status].label}</p>
                <p className="text-xs opacity-75">{statusConfig[receipt.status].description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Reason */}
      {receipt.status === 'REJECTED' && receipt.rejection_reason && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Reddedildi</p>
              <p className="text-red-700">{receipt.rejection_reason}</p>
              <p className="text-sm text-red-600 mt-2">Lütfen bilgilerinizi düzeltip tekrar gönderin.</p>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#D4AF37]" />
          Ders Bilgileri
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Ders</p>
            <p className="font-medium text-slate-900">{receipt.lessons?.subject || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Öğrenci</p>
            <p className="font-medium text-slate-900">{receipt.student_name || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Tarih</p>
            <p className="font-medium text-slate-900">
              {receipt.lessons?.scheduled_at ? formatDate(receipt.lessons.scheduled_at) : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Süre</p>
            <p className="font-medium text-slate-900">{receipt.lessons?.duration_minutes || 60} dakika</p>
          </div>
        </div>
      </div>

      {/* Amount Info */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-6 mb-6 text-white">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-[#D4AF37]" />
          Tutar Bilgileri
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Brüt Tutar</p>
            <p className="text-xl font-bold">{formatCurrency(receipt.gross_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Stopaj (%{Number(receipt.stopaj_rate)})</p>
            <p className="text-xl font-bold text-amber-400">{formatCurrency(receipt.stopaj_amount)}</p>
            <p className="text-xs text-amber-300 mt-1">Platform öder</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-400 mb-1">Size Ödenecek Tutar</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(receipt.net_amount)}</p>
            <p className="text-xs text-emerald-300 mt-1">Stopaj platform tarafından karşılanır</p>
          </div>
        </div>
      </div>

      {/* Personal Info Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#D4AF37]" />
          Kişisel Bilgiler
        </h2>

        <div className="space-y-4">
          {/* Full Name (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
            <input
              type="text"
              value={receipt.full_name}
              disabled
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          {/* TC Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              TC Kimlik No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.tc_number}
              onChange={(e) => setFormData({ ...formData, tc_number: e.target.value })}
              disabled={!isEditable}
              maxLength={11}
              placeholder="11 haneli TC Kimlik Numaranız"
              className={`w-full px-4 py-3 border rounded-xl transition-colors ${
                isEditable
                  ? 'bg-white border-slate-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Adres <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditable}
              rows={3}
              placeholder="Tam adresiniz"
              className={`w-full px-4 py-3 border rounded-xl transition-colors resize-none ${
                isEditable
                  ? 'bg-white border-slate-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            />
          </div>

          {/* IBAN */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              IBAN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.iban}
              onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
              disabled={!isEditable}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              className={`w-full px-4 py-3 border rounded-xl font-mono transition-colors ${
                isEditable
                  ? 'bg-white border-slate-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#D4AF37]" />
          Tarihler
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Oluşturulma</p>
            <p className="font-medium text-slate-900">{formatDate(receipt.created_at)}</p>
          </div>
          {receipt.submitted_at && (
            <div>
              <p className="text-slate-500">Gönderilme</p>
              <p className="font-medium text-slate-900">{formatDate(receipt.submitted_at)}</p>
            </div>
          )}
          {receipt.approved_at && (
            <div>
              <p className="text-slate-500">Onaylanma</p>
              <p className="font-medium text-slate-900">{formatDate(receipt.approved_at)}</p>
            </div>
          )}
          {receipt.paid_at && (
            <div>
              <p className="text-slate-500">Ödenme</p>
              <p className="font-medium text-emerald-600">{formatDate(receipt.paid_at)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {isEditable && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !formData.tc_number || !formData.address || !formData.iban}
            className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0F172A] rounded-xl font-medium hover:bg-[#B8960C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Gönderiliyor...' : 'Onayla ve Gönder'}
          </button>
          {receipt.status === 'DRAFT' && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors disabled:opacity-50 ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Siliniyor...' : 'Sil'}
            </button>
          )}
        </div>
      )}

      {/* Admin Notes */}
      {receipt.admin_notes && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="font-semibold text-blue-900 mb-1">Admin Notu</p>
          <p className="text-blue-700">{receipt.admin_notes}</p>
        </div>
      )}
    </div>
  );
}
