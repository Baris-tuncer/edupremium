'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface InvitationCode {
  id: string;
  code: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED';
  assignedEmail: string | null;
  assignedPhone: string | null;
  usedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  teachers: { firstName: string; lastName: string }[];
}

export default function InvitationsPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<InvitationCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'USED' | 'EXPIRED'>('ALL');

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    expiresInDays: 7,
  });

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app'}/admin/invitations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createInvitation = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app'}/admin/invitations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        alert('Davet kodu oluşturuldu!');
        setShowCreateModal(false);
        setFormData({ email: '', phone: '', expiresInDays: 7 });
        fetchInvitations();
      } else {
        alert('Hata oluştu!');
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      alert('Hata oluştu!');
    }
  };

  const revokeInvitation = async (id: string) => {
    if (!confirm('Bu davet kodunu iptal etmek istediğinize emin misiniz?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app'}/admin/invitations/${id}/revoke`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert('Davet kodu iptal edildi!');
        fetchInvitations();
      }
    } catch (error) {
      console.error('Error revoking invitation:', error);
    }
  };

  const sendEmail = async (id: string) => {
    if (!confirm('Email göndermek istediğinize emin misiniz?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app'}/admin/invitations/${id}/send-email`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(`Email başarıyla gönderildi: ${data.email}`);
      } else {
        const error = await response.json();
        alert(`Hata: ${error.message}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Email gönderilemedi!');
    }
  };

  const filteredInvitations = invitations.filter((inv) => {
    if (filter === 'ALL') return true;
    return inv.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'USED': return 'bg-blue-100 text-blue-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'REVOKED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Aktif';
      case 'USED': return 'Kullanıldı';
      case 'EXPIRED': return 'Süresi Doldu';
      case 'REVOKED': return 'İptal Edildi';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-900">Davet Kodları</h1>
            <p className="text-slate-600 mt-1">Öğretmen kayıt kodlarını yönetin</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-6 py-3 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Kod Oluştur
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {['ALL', 'ACTIVE', 'USED', 'EXPIRED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-navy-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f === 'ALL' ? 'Tümü' : f === 'ACTIVE' ? 'Aktif' : f === 'USED' ? 'Kullanılmış' : 'Süresi Dolmuş'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Kod</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Durum</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Telefon</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Oluşturulma</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Son Kullanma</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInvitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="font-mono font-semibold text-navy-900">{inv.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(inv.status)}`}>
                      {getStatusText(inv.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{inv.assignedEmail || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{inv.assignedPhone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(inv.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {inv.status === 'ACTIVE' && (
                        <>
                          {inv.assignedEmail && (
                            <button
                              onClick={() => sendEmail(inv.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                              title="Email Gönder"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Email
                            </button>
                          )}
                          <button
                            onClick={() => revokeInvitation(inv.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            İptal Et
                          </button>
                        </>
                      )}
                      {inv.status === 'USED' && inv.teachers.length > 0 && (
                        <span className="text-sm text-slate-600">
                          {inv.teachers[0].firstName} {inv.teachers[0].lastName}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvitations.length === 0 && (
            <div className="text-center py-12 text-slate-500">Davet kodu bulunamadı</div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Yeni Davet Kodu</h2>

            <div className="space-y-4">
              <div>
                <label className="input-label">Email (Opsiyonel)</label>
                <input
                  type="email"
                  className="input"
                  placeholder="teacher@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Telefon (Opsiyonel)</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+905551234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Geçerlilik Süresi (Gün)</label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  value={formData.expiresInDays}
                  onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1 py-3">
                İptal
              </button>
              <button onClick={createInvitation} className="btn-primary flex-1 py-3">
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
