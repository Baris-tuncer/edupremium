'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface InvitationCode {
  id: string;
  code: string;
  status: string;
  assigned_email: string | null;
  assigned_phone: string | null;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
  used_by_name: string | null;
}

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    expiresInDays: 7,
    sendEmail: true,
    personalMessage: ''
  });
  const [creating, setCreating] = useState(false);

  // Email gonderme modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<InvitationCode | null>(null);
  const [emailForm, setEmailForm] = useState({ email: '', personalMessage: '' });
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usedCodes = data?.filter(d => d.used_by) || [];
      const teacherIds = usedCodes.map(c => c.used_by);

      let teacherMap = new Map();
      if (teacherIds.length > 0) {
        const { data: teachers } = await supabase
          .from('teacher_profiles')
          .select('id, full_name')
          .in('id', teacherIds);
        
        (teachers || []).forEach(t => teacherMap.set(t.id, t.full_name));
      }

      const formatted = (data || []).map(inv => ({
        ...inv,
        used_by_name: teacherMap.get(inv.used_by) || null
      }));

      setInvitations(formatted);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'EDU-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const sendInvitationEmail = async (email: string, code: string, expiresAt: string, personalMessage?: string) => {
    try {
      // Auth token al
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Oturum bulunamadı');
      }

      const response = await fetch('/api/invitation/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ email, code, expiresAt, personalMessage: personalMessage || '' })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Email gönderilemedi');
      }

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  };

  const createInvitation = async () => {
    setCreating(true);
    try {
      const code = generateCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.expiresInDays);
      const expiresAtStr = expiresAt.toISOString();

      const { error } = await supabase
        .from('invitation_codes')
        .insert({
          code,
          status: 'ACTIVE',
          assigned_email: formData.email || null,
          assigned_phone: formData.phone || null,
          expires_at: expiresAtStr,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Email gonder (checkbox isaretliyse ve email varsa)
      if (formData.sendEmail && formData.email) {
        try {
          await sendInvitationEmail(formData.email, code, expiresAtStr, formData.personalMessage);
          alert(`✅ Kod oluşturuldu ve email gönderildi!\n\nKod: ${code}\nEmail: ${formData.email}`);
        } catch (emailError) {
          alert(`⚠️ Kod oluşturuldu ama email gönderilemedi!\n\nKod: ${code}\nHata: ${emailError instanceof Error ? emailError.message : 'Bilinmeyen hata'}`);
        }
      } else {
        alert(`✅ Kod oluşturuldu: ${code}`);
      }

      setShowModal(false);
      setFormData({ email: '', phone: '', expiresInDays: 7, sendEmail: true, personalMessage: '' });
      loadInvitations();
    } catch (error) {
      console.error('Error:', error);
      alert('Kod oluşturulamadı! Hata: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
    } finally {
      setCreating(false);
    }
  };

  const openEmailModal = (inv: InvitationCode) => {
    setSelectedInvitation(inv);
    setEmailForm({
      email: inv.assigned_email || '',
      personalMessage: ''
    });
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!selectedInvitation || !emailForm.email) {
      alert('Email adresi zorunludur');
      return;
    }

    setSendingEmail(true);
    try {
      await sendInvitationEmail(
        emailForm.email,
        selectedInvitation.code,
        selectedInvitation.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        emailForm.personalMessage
      );

      // Eger assigned_email bos ise guncelle
      if (!selectedInvitation.assigned_email && emailForm.email) {
        await supabase
          .from('invitation_codes')
          .update({ assigned_email: emailForm.email })
          .eq('id', selectedInvitation.id);
      }

      alert(`✅ Email başarıyla gönderildi!\n\n${emailForm.email} adresine ${selectedInvitation.code} kodu gönderildi.`);
      setShowEmailModal(false);
      setSelectedInvitation(null);
      loadInvitations();
    } catch (error) {
      alert('❌ Email gönderilemedi! Hata: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setSendingEmail(false);
    }
  };

  const revokeCode = async (id: string) => {
    if (!confirm('Bu kodu iptal etmek istediğinize emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('invitation_codes')
        .update({ status: 'REVOKED' })
        .eq('id', id);

      if (error) throw error;
      loadInvitations();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Kod kopyalandı: ' + code);
  };

  const filteredInvitations = invitations.filter(inv => {
    if (filter === 'all') return true;
    if (filter === 'ACTIVE') return inv.status === 'ACTIVE';
    if (filter === 'USED') return inv.status === 'USED';
    if (filter === 'EXPIRED') return inv.status === 'EXPIRED' || (inv.expires_at && new Date(inv.expires_at) < new Date() && inv.status === 'ACTIVE');
    return true;
  });

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('tr-TR') : '-';

  const getStatusBadge = (status: string, expiresAt: string | null) => {
    if (status === 'ACTIVE' && expiresAt && new Date(expiresAt) < new Date()) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Süresi Dolmuş</span>;
    }

    const styles: Record<string, string> = {
      'ACTIVE': 'bg-green-100 text-green-700',
      'USED': 'bg-blue-100 text-blue-700',
      'EXPIRED': 'bg-gray-100 text-gray-700',
      'REVOKED': 'bg-red-100 text-red-700'
    };
    const labels: Record<string, string> = {
      'ACTIVE': 'Aktif',
      'USED': 'Kullanıldı',
      'EXPIRED': 'Süresi Doldu',
      'REVOKED': 'İptal Edildi'
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Davet Kodları</h1>
          <p className="text-slate-600 mt-1">Öğretmen kayıt kodlarını yönetin ve email ile gönderin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-[#0F172A] hover:bg-[#D4AF37] hover:text-[#0F172A] text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kod Oluştur
        </button>
      </div>

      {/* Istatistikler */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-[#0F172A]/5 p-4">
          <p className="text-sm text-slate-500">Toplam</p>
          <p className="text-2xl font-bold text-slate-900">{invitations.length}</p>
        </div>
        <div className="bg-green-50 rounded-3xl border border-green-200 p-4">
          <p className="text-sm text-green-600">Aktif</p>
          <p className="text-2xl font-bold text-green-700">{invitations.filter(i => i.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-blue-50 rounded-3xl border border-blue-200 p-4">
          <p className="text-sm text-blue-600">Kullanıldı</p>
          <p className="text-2xl font-bold text-blue-700">{invitations.filter(i => i.status === 'USED').length}</p>
        </div>
        <div className="bg-gray-50 rounded-3xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Süresi Dolmuş</p>
          <p className="text-2xl font-bold text-gray-700">{invitations.filter(i => i.status === 'EXPIRED' || i.status === 'REVOKED').length}</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'Tümü' },
          { value: 'ACTIVE', label: 'Aktif' },
          { value: 'USED', label: 'Kullanılmış' },
          { value: 'EXPIRED', label: 'Süresi Dolmuş' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f.value
                ? 'bg-[#0F172A] text-white'
                : 'bg-white/80 backdrop-blur-xl text-slate-600 hover:bg-slate-50 border border-slate-200'
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
              <th className="text-left py-4 px-6 font-medium text-slate-600">Kod</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Durum</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Email</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Telefon</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Oluşturulma</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Son Kullanma</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Kullanan</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvitations.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  Davet kodu bulunamadı
                </td>
              </tr>
            ) : (
              filteredInvitations.map(inv => (
                <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <span className="font-mono font-semibold text-slate-900">{inv.code}</span>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(inv.status, inv.expires_at)}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {inv.assigned_email || '-'}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {inv.assigned_phone || '-'}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {formatDate(inv.created_at)}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {formatDate(inv.expires_at)}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {inv.used_by_name || '-'}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Kopyala */}
                      <button
                        onClick={() => copyCode(inv.code)}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                        title="Kopyala"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      {/* Email Gonder */}
                      {inv.status === 'ACTIVE' && !(inv.expires_at && new Date(inv.expires_at) < new Date()) && (
                        <button
                          onClick={() => openEmailModal(inv)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                          title="Email ile Gönder"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                      {/* Iptal Et */}
                      {inv.status === 'ACTIVE' && (
                        <button
                          onClick={() => revokeCode(inv.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          title="İptal Et"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Yeni Kod Olustur Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Yeni Davet Kodu</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email (Opsiyonel)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@email.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Telefon (Opsiyonel)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Geçerlilik Süresi</label>
                <select
                  value={formData.expiresInDays}
                  onChange={(e) => setFormData({ ...formData, expiresInDays: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                >
                  <option value={7}>7 gün</option>
                  <option value={14}>14 gün</option>
                  <option value={30}>30 gün</option>
                  <option value={90}>90 gün</option>
                </select>
              </div>

              {/* Email Gonder Checkbox */}
              {formData.email && (
                <>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <input
                      type="checkbox"
                      id="sendEmail"
                      checked={formData.sendEmail}
                      onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="sendEmail" className="text-sm text-blue-800 font-medium cursor-pointer">
                      📧 Oluşturulunca email ile gönder
                    </label>
                  </div>

                  {formData.sendEmail && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Kişisel Mesaj (Opsiyonel)</label>
                      <textarea
                        value={formData.personalMessage}
                        onChange={(e) => setFormData({ ...formData, personalMessage: e.target.value })}
                        placeholder="Merhaba, sizi platformumuza davet etmekten mutluluk duyuyoruz..."
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none resize-none"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                onClick={createInvitation}
                disabled={creating}
                className="flex-1 px-4 py-3 bg-[#0F172A] hover:bg-[#D4AF37] hover:text-[#0F172A] text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {creating ? 'Oluşturuluyor...' : (formData.sendEmail && formData.email ? 'Oluştur ve Gönder' : 'Oluştur')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Gonder Modal */}
      {showEmailModal && selectedInvitation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Davet Kodu Gönder</h2>
                <p className="text-slate-500 text-sm">Kodu email ile gönderin</p>
              </div>
            </div>

            {/* Kod Bilgisi */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Davet Kodu</p>
                  <p className="font-mono text-lg font-bold text-slate-900">{selectedInvitation.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Son Kullanma</p>
                  <p className="text-sm font-medium text-slate-700">{formatDate(selectedInvitation.expires_at)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Adresi *</label>
                <input
                  type="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  placeholder="ornek@email.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kişisel Mesaj (Opsiyonel)</label>
                <textarea
                  value={emailForm.personalMessage}
                  onChange={(e) => setEmailForm({ ...emailForm, personalMessage: e.target.value })}
                  placeholder="Merhaba, sizi platformumuza davet etmekten mutluluk duyuyoruz..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowEmailModal(false); setSelectedInvitation(null); }}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail || !emailForm.email}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingEmail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Email Gönder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
