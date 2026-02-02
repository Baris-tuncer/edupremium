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
    expiresInDays: 7
  });
  const [creating, setCreating] = useState(false);

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

      // Kullanilan kodlar icin ogretmen isimlerini al
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

  const createInvitation = async () => {
    setCreating(true);
    try {
      const code = generateCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.expiresInDays);

      const { error } = await supabase
        .from('invitation_codes')
        .insert({
          code,
          status: 'ACTIVE',
          assigned_email: formData.email || null,
          assigned_phone: formData.phone || null,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setShowModal(false);
      setFormData({ email: '', phone: '', expiresInDays: 7 });
      loadInvitations();
    } catch (error) {
      console.error('Error:', error);
      alert('Kod olusturulamadi! Hata: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
    } finally {
      setCreating(false);
    }
  };

  const revokeCode = async (id: string) => {
    if (!confirm('Bu kodu iptal etmek istediginize emin misiniz?')) return;

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
    alert('Kod kopyalandi: ' + code);
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
    // Suresi dolmus mu kontrol et
    if (status === 'ACTIVE' && expiresAt && new Date(expiresAt) < new Date()) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Suresi Dolmus</span>;
    }

    const styles: Record<string, string> = {
      'ACTIVE': 'bg-green-100 text-green-700',
      'USED': 'bg-blue-100 text-blue-700',
      'EXPIRED': 'bg-gray-100 text-gray-700',
      'REVOKED': 'bg-red-100 text-red-700'
    };
    const labels: Record<string, string> = {
      'ACTIVE': 'Aktif',
      'USED': 'Kullanildi',
      'EXPIRED': 'Suresi Doldu',
      'REVOKED': 'Iptal Edildi'
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
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Davet Kodlari</h1>
          <p className="text-slate-600 mt-1">Ogretmen kayit kodlarini yonetin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kod Olustur
        </button>
      </div>

      {/* Istatistikler */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Toplam</p>
          <p className="text-2xl font-bold text-slate-900">{invitations.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-600">Aktif</p>
          <p className="text-2xl font-bold text-green-700">{invitations.filter(i => i.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-600">Kullanildi</p>
          <p className="text-2xl font-bold text-blue-700">{invitations.filter(i => i.status === 'USED').length}</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Suresi Dolmus</p>
          <p className="text-2xl font-bold text-gray-700">{invitations.filter(i => i.status === 'EXPIRED' || i.status === 'REVOKED').length}</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'Tumu' },
          { value: 'ACTIVE', label: 'Aktif' },
          { value: 'USED', label: 'Kullanilmis' },
          { value: 'EXPIRED', label: 'Suresi Dolmus' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f.value
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-4 px-6 font-medium text-slate-600">Kod</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Durum</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Email</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Telefon</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Olusturulma</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Son Kullanma</th>
              <th className="text-left py-4 px-6 font-medium text-slate-600">Kullanan</th>
              <th className="text-center py-4 px-6 font-medium text-slate-600">Islemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvitations.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  Davet kodu bulunamadi
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
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => copyCode(inv.code)}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                        title="Kopyala"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      {inv.status === 'ACTIVE' && (
                        <button
                          onClick={() => revokeCode(inv.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          title="Iptal Et"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Yeni Davet Kodu</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email (Opsiyonel)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@email.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Telefon (Opsiyonel)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Gecerlilik Suresi</label>
                <select
                  value={formData.expiresInDays}
                  onChange={(e) => setFormData({ ...formData, expiresInDays: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value={7}>7 gun</option>
                  <option value={14}>14 gun</option>
                  <option value={30}>30 gun</option>
                  <option value={90}>90 gun</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                Iptal
              </button>
              <button
                onClick={createInvitation}
                disabled={creating}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {creating ? 'Olusturuluyor...' : 'Olustur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
