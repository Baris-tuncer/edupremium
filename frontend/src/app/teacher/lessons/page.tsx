'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

const tabs = [
  { id: 'upcoming', label: 'Yaklaşan Dersler' },
  { id: 'completed', label: 'Tamamlanan Dersler' },
  { id: 'cancelled', label: 'İptal Edilen' },
];

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700 border border-green-200',
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  COMPLETED: 'bg-blue-100 text-blue-700 border border-blue-200',
  CANCELLED: 'bg-red-100 text-red-700 border border-red-200',
};

const statusLabels: Record<string, string> = {
  CONFIRMED: 'Onaylandı',
  PENDING_PAYMENT: 'Bekliyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

export default function TeacherLessonsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await api.getTeacherLessons();
      setAppointments(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.approveAppointment(id);
      await loadAppointments();
    } catch (error) {
      console.error('Error approving:', error);
      alert('Onaylama başarısız oldu');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Reddetme sebebi (opsiyonel):');
    setActionLoading(id);
    try {
      await api.rejectAppointment(id, reason || undefined);
      await loadAppointments();
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Reddetme başarısız oldu');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === 'upcoming') return apt.status === 'PENDING_PAYMENT' || apt.status === 'CONFIRMED';
    if (activeTab === 'completed') return apt.status === 'COMPLETED';
    if (activeTab === 'cancelled') return apt.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/teacher" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Dashboard</span>
            </Link>
            <h1 className="font-semibold text-xl text-slate-900">Derslerim</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Yükleniyor...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Bu kategoride ders bulunmuyor.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-600 font-semibold text-sm">
                          {apt.student?.firstName?.[0] || '?'}{apt.student?.lastName?.[0] || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {apt.student?.firstName} {apt.student?.lastName}
                        </h3>
                        <p className="text-slate-500 text-sm">{apt.subject?.name || 'Ders'}</p>
                      </div>
                    </div>
                    
                    <div className="text-right min-w-[160px]">
                      <div className="font-medium text-slate-900">
                        {new Date(apt.scheduledAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                      </div>
                      <div className="text-slate-500 text-sm">
                        {new Date(apt.scheduledAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 min-w-[240px] justify-end">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[apt.status] || 'bg-gray-100'}`}>
                        {statusLabels[apt.status] || apt.status}
                      </span>

                      {apt.status === 'CONFIRMED' && (
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
                          Derse Başla
                        </button>
                      )}

                      {apt.status === 'PENDING_PAYMENT' && (
                        <>
                          <button 
                            onClick={() => handleApprove(apt.id)}
                            disabled={actionLoading === apt.id}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
                          >
                            {actionLoading === apt.id ? '...' : 'Onayla'}
                          </button>
                          <button 
                            onClick={() => handleReject(apt.id)}
                            disabled={actionLoading === apt.id}
                            className="text-red-600 text-sm font-medium hover:text-red-700 disabled:opacity-50"
                          >
                            Reddet
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {apt.notes && apt.status === 'CANCELLED' && (
                    <div className="mt-3 text-sm text-slate-500 bg-slate-100 rounded-lg px-4 py-2">
                      İptal sebebi: {apt.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
