'use client';

import React, { useState } from 'react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  
  const [settings, setSettings] = useState({
    platformName: 'EduPremium',
    platformEmail: 'info@edupremium.com',
    supportPhone: '+90 850 309 00 00',
    commissionRate: 20,
    minLessonPrice: 100,
    maxLessonPrice: 2000,
    lessonDuration: 60,
    cancellationHours: 24,
    smsEnabled: false,
    emailEnabled: true,
    teamsEnabled: true,
    maintenanceMode: false,
  });

  const handleSave = async () => {
    alert('Ayarlar kaydedildi!');
  };

  const tabs = [
    { id: 'general', name: 'Genel', icon: '⚙️' },
    { id: 'pricing', name: 'Fiyatlandırma', icon: '💰' },
    { id: 'notifications', name: 'Bildirimler', icon: '🔔' },
    { id: 'integrations', name: 'Entegrasyonlar', icon: '🔗' },
    { id: 'security', name: 'Güvenlik', icon: '🔒' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Sistem Ayarları</h1>
          <p className="text-slate-600 mt-1">Platform ayarlarını yönetin</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-navy-900 hover:bg-navy-800 text-white px-6 py-3 rounded-xl font-medium"
        >
          Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-navy-50 text-navy-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {activeTab === 'general' && (
              <>
                <h2 className="text-xl font-bold text-navy-900 mb-6">Genel Ayarlar</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Platform Adı</label>
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">İletişim Email</label>
                    <input
                      type="email"
                      value={settings.platformEmail}
                      onChange={(e) => setSettings({ ...settings, platformEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Destek Telefonu</label>
                    <input
                      type="tel"
                      value={settings.supportPhone}
                      onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium text-red-900">Bakım Modu</div>
                      <div className="text-sm text-red-600">Siteyi bakım moduna alır</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'pricing' && (
              <>
                <h2 className="text-xl font-bold text-navy-900 mb-6">Fiyatlandırma Ayarları</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Platform Komisyonu (%)</label>
                    <input
                      type="number"
                      value={settings.commissionRate}
                      onChange={(e) => setSettings({ ...settings, commissionRate: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500"
                    />
                    <p className="text-sm text-slate-500 mt-1">Her dersten kesilecek komisyon oranı</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Min. Ders Ücreti (₺)</label>
                      <input
                        type="number"
                        value={settings.minLessonPrice}
                        onChange={(e) => setSettings({ ...settings, minLessonPrice: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Max. Ders Ücreti (₺)</label>
                      <input
                        type="number"
                        value={settings.maxLessonPrice}
                        onChange={(e) => setSettings({ ...settings, maxLessonPrice: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Varsayılan Ders Süresi (dakika)</label>
                    <select
                      value={settings.lessonDuration}
                      onChange={(e) => setSettings({ ...settings, lessonDuration: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500"
                    >
                      <option value={30}>30 dakika</option>
                      <option value={45}>45 dakika</option>
                      <option value={60}>60 dakika</option>
                      <option value={90}>90 dakika</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">İptal Süresi (saat)</label>
                    <input
                      type="number"
                      value={settings.cancellationHours}
                      onChange={(e) => setSettings({ ...settings, cancellationHours: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500"
                    />
                    <p className="text-sm text-slate-500 mt-1">Ücretsiz iptal için minimum süre</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <h2 className="text-xl font-bold text-navy-900 mb-6">Bildirim Ayarları</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">Email Bildirimleri</div>
                      <div className="text-sm text-slate-500">Resend ile email gönderimi</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailEnabled}
                        onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">SMS Bildirimleri</div>
                      <div className="text-sm text-slate-500">Netgsm ile SMS gönderimi</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.smsEnabled}
                        onChange={(e) => setSettings({ ...settings, smsEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-600"></div>
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'integrations' && (
              <>
                <h2 className="text-xl font-bold text-navy-900 mb-6">Entegrasyonlar</h2>
                <div className="space-y-4">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-slate-900">Microsoft Teams</div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Aktif</span>
                    </div>
                    <p className="text-sm text-slate-500">Online ders görüşmeleri için</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-slate-900">Iyzico</div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Aktif</span>
                    </div>
                    <p className="text-sm text-slate-500">Ödeme altyapısı</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-slate-900">Resend</div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Aktif</span>
                    </div>
                    <p className="text-sm text-slate-500">Email servisi</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-slate-900">Netgsm</div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Yapılandırılmadı</span>
                    </div>
                    <p className="text-sm text-slate-500">SMS servisi</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-slate-900">OpenAI</div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Aktif</span>
                    </div>
                    <p className="text-sm text-slate-500">AI rapor oluşturma</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h2 className="text-xl font-bold text-navy-900 mb-6">Güvenlik Ayarları</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="font-medium text-yellow-800 mb-1">⚠️ Dikkat</div>
                    <p className="text-sm text-yellow-700">Bu ayarlar sistem güvenliğini etkiler. Dikkatli olun.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Oturum Süresi (gün)</label>
                    <input
                      type="number"
                      defaultValue={7}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Max. Giriş Denemesi</label>
                    <input
                      type="number"
                      defaultValue={5}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-500"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
