'use client';

import React, { useState } from 'react';

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('this_month');

  const reports = [
    { id: 'overview', name: 'Genel Bakış', icon: '📊' },
    { id: 'revenue', name: 'Gelir Raporu', icon: '💰' },
    { id: 'teachers', name: 'Öğretmen Performansı', icon: '👨‍🏫' },
    { id: 'students', name: 'Öğrenci Aktivitesi', icon: '👨‍🎓' },
    { id: 'lessons', name: 'Ders İstatistikleri', icon: '📚' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Raporlar</h1>
          <p className="text-slate-600 mt-1">Platform istatistiklerini ve raporlarını görüntüleyin</p>
        </div>
        <button className="bg-navy-900 hover:bg-navy-800 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Rapor İndir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-navy-900 mb-4">Rapor Türü</h3>
            <div className="space-y-2">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    selectedReport === report.id
                      ? 'bg-navy-50 text-navy-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{report.icon}</span>
                  <span className="font-medium">{report.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-navy-900 mb-4">Tarih Aralığı</h3>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500"
              >
                <option value="today">Bugün</option>
                <option value="this_week">Bu Hafta</option>
                <option value="this_month">Bu Ay</option>
                <option value="last_month">Geçen Ay</option>
                <option value="this_year">Bu Yıl</option>
                <option value="custom">Özel Tarih</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {selectedReport === 'overview' && (
              <>
                <h2 className="text-xl font-bold text-navy-900 mb-6">Genel Bakış</h2>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-700">156</div>
                    <div className="text-sm text-blue-600">Toplam Ders</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-700">₺45,200</div>
                    <div className="text-sm text-green-600">Toplam Gelir</div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-yellow-700">23</div>
                    <div className="text-sm text-yellow-600">Yeni Öğrenci</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-purple-700">4.8</div>
                    <div className="text-sm text-purple-600">Ort. Puan</div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-slate-500">Grafik verisi yükleniyor...</p>
                </div>
              </>
            )}

            {selectedReport === 'revenue' && (
              <>
                <h2 className="text-xl font-bold text-navy-900 mb-6">Gelir Raporu</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="font-medium">Brüt Gelir</span>
                    <span className="text-xl font-bold text-navy-900">₺52,400</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="font-medium">Platform Komisyonu (%20)</span>
                    <span className="text-xl font-bold text-green-600">₺10,480</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="font-medium">Öğretmen Ödemeleri</span>
                    <span className="text-xl font-bold text-blue-600">₺41,920</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="font-medium">İade Edilen</span>
                    <span className="text-xl font-bold text-red-600">₺1,200</span>
                  </div>
                </div>
              </>
            )}

            {selectedReport === 'teachers' && (
              <>
                <h2 className="text-xl font-bold text-navy-900 mb-6">Öğretmen Performansı</h2>
                <div className="text-center text-slate-500 py-12">
                  <p>Öğretmen performans raporu hazırlanıyor...</p>
                </div>
              </>
            )}

            {selectedReport === 'students' && (
              <>
                <h2 className="text-xl font-bold text-navy-900 mb-6">Öğrenci Aktivitesi</h2>
                <div className="text-center text-slate-500 py-12">
                  <p>Öğrenci aktivite raporu hazırlanıyor...</p>
                </div>
              </>
            )}

            {selectedReport === 'lessons' && (
              <>
                <h2 className="text-xl font-bold text-navy-900 mb-6">Ders İstatistikleri</h2>
                <div className="text-center text-slate-500 py-12">
                  <p>Ders istatistikleri raporu hazırlanıyor...</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
