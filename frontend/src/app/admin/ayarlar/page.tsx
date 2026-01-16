'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Settings {
  pricing: {
    platformCommissionRate: number;
    taxRate: number;
    minHourlyRate: number;
    maxHourlyRate: number;
    defaultLessonDuration: number;
    cancellationHours: number;
  };
  general: {
    platformName: string;
    supportEmail: string;
    supportPhone: string;
  };
  integrations: {
    [key: string]: {
      configured: boolean;
      name: string;
      description: string;
    };
  };
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [pricing, setPricing] = useState({
    platformCommissionRate: 20,
    taxRate: 20,
    minHourlyRate: 100,
    maxHourlyRate: 2000,
    defaultLessonDuration: 60,
    cancellationHours: 24,
  });

  const [general, setGeneral] = useState({
    platformName: 'EduPremium',
    supportEmail: 'destek@edupremium.com',
    supportPhone: '+90 850 123 4567',
  });

  // Örnek fiyat hesaplama
  const exampleTeacherRate = 1000;
  const commission = exampleTeacherRate * (pricing.platformCommissionRate / 100);
  const subtotal = exampleTeacherRate + commission;
  const tax = subtotal * (pricing.taxRate / 100);
  const totalPrice = subtotal + tax;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

      const response = await fetch(`${baseUrl}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
        if (data.data.pricing) {
          setPricing(data.data.pricing);
        }
        if (data.data.general) {
          setGeneral(data.data.general);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Ayarlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

      const response = await fetch(`${baseUrl}/admin/settings`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pricing, general }),
      });

      if (response.ok) {
        toast.success('Ayarlar kaydedildi');
        fetchSettings();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Kaydetme başarısız');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Kaydetme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Genel', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'pricing', label: 'Fiyatlandırma', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'notifications', label: 'Bildirimler', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'integrations', label: 'Entegrasyonlar', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { id: 'security', label: 'Güvenlik', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistem Ayarları</h1>
          <p className="text-gray-600 mt-1">Platform ayarlarını yönetin</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            'Kaydet'
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-xl p-4 shadow-sm h-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
              </svg>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl p-6 shadow-sm">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Genel Ayarlar</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Adı
                  </label>
                  <input
                    type="text"
                    value={general.platformName}
                    onChange={(e) => setGeneral({ ...general, platformName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destek Email
                  </label>
                  <input
                    type="email"
                    value={general.supportEmail}
                    onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destek Telefon
                  </label>
                  <input
                    type="tel"
                    value={general.supportPhone}
                    onChange={(e) => setGeneral({ ...general, supportPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Fiyatlandırma Ayarları</h2>

              {/* Örnek Hesaplama */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-3">Örnek Fiyat Hesaplama (₺{exampleTeacherRate} için)</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Öğretmen Ücreti:</span>
                    <span className="font-medium">₺{exampleTeacherRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Platform Komisyonu (%{pricing.platformCommissionRate}):</span>
                    <span className="font-medium">₺{commission.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Ara Toplam:</span>
                    <span className="font-medium">₺{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">KDV (%{pricing.taxRate}):</span>
                    <span className="font-medium">₺{tax.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between col-span-2 border-t border-blue-200 pt-2">
                    <span className="text-blue-900 font-semibold">Veli Ödemesi:</span>
                    <span className="font-bold text-green-600 text-lg">₺{totalPrice.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Komisyonu (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pricing.platformCommissionRate}
                    onChange={(e) =>
                      setPricing({ ...pricing, platformCommissionRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Her dersten kesilecek komisyon oranı</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KDV Oranı (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pricing.taxRate}
                    onChange={(e) =>
                      setPricing({ ...pricing, taxRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Veliye yansıtılacak KDV oranı</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min. Ders Ücreti (₺)
                    </label>
                    <input
                      type="number"
                      value={pricing.minHourlyRate}
                      onChange={(e) =>
                        setPricing({ ...pricing, minHourlyRate: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max. Ders Ücreti (₺)
                    </label>
                    <input
                      type="number"
                      value={pricing.maxHourlyRate}
                      onChange={(e) =>
                        setPricing({ ...pricing, maxHourlyRate: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Varsayılan Ders Süresi (dakika)
                  </label>
                  <select
                    value={pricing.defaultLessonDuration}
                    onChange={(e) =>
                      setPricing({ ...pricing, defaultLessonDuration: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={30}>30 dakika</option>
                    <option value={45}>45 dakika</option>
                    <option value={60}>60 dakika</option>
                    <option value={90}>90 dakika</option>
                    <option value={120}>120 dakika</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İptal Süresi (saat)
                  </label>
                  <input
                    type="number"
                    value={pricing.cancellationHours}
                    onChange={(e) =>
                      setPricing({ ...pricing, cancellationHours: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Ücretsiz iptal için minimum süre</p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Bildirim Ayarları</h2>
              <div className="space-y-4">
                {[
                  { id: 'email_new_booking', label: 'Yeni randevu bildirimi (Email)', enabled: true },
                  { id: 'sms_new_booking', label: 'Yeni randevu bildirimi (SMS)', enabled: false },
                  { id: 'email_reminder', label: 'Ders hatırlatması (Email)', enabled: true },
                  { id: 'sms_reminder', label: 'Ders hatırlatması (SMS)', enabled: false },
                  { id: 'email_payment', label: 'Ödeme bildirimi (Email)', enabled: true },
                  { id: 'email_report', label: 'Ders raporu bildirimi (Email)', enabled: true },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-700">{item.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Entegrasyonlar</h2>
              <div className="space-y-4">
                {settings?.integrations &&
                  Object.entries(settings.integrations).map(([key, integration]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                        <p className="text-sm text-gray-500">{integration.description}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          integration.configured
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {integration.configured ? 'Aktif' : 'Yapılandırılmadı'}
                      </span>
                    </div>
                  ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Entegrasyon yapılandırmaları Railway environment variables üzerinden yönetilir.
                  Değişiklik yapmak için Railway Dashboard'a gidin.
                </p>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Güvenlik Ayarları</h2>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Şifre Politikası</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>- Minimum 8 karakter</p>
                    <p>- En az 1 büyük harf</p>
                    <p>- En az 1 rakam</p>
                    <p>- En az 1 özel karakter</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Oturum Ayarları</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Oturum süresi</span>
                      <span className="font-medium">7 gün</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Maksimum aktif oturum</span>
                      <span className="font-medium">5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
