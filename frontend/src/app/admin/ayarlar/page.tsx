'use client';

import { useState } from 'react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('fiyatlandirma');
  const [testPrice, setTestPrice] = useState(1500);
  const [testCommission, setTestCommission] = useState(0.25);

  // Dogru fiyatlandirma formulu (pricing.ts ile ayni)
  const calculatePrice = (basePrice: number, commissionRate: number = 0.25) => {
    if (!basePrice || basePrice <= 0) {
      return {
        basePrice: 0, commissionRate, commissionAmount: 0, teacherNet: 0,
        teacherGross: 0, stopajAmount: 0, platformShare: 0,
        kdvMatrah: 0, kdvAmount: 0, rawTotal: 0, displayPrice: 0
      };
    }
    
    const commissionAmount = basePrice * commissionRate;
    const teacherNet = basePrice - commissionAmount;
    const teacherGross = teacherNet / 0.80;
    const stopajAmount = teacherGross - teacherNet;
    const platformShare = commissionAmount;
    const kdvMatrah = teacherGross + platformShare;
    const kdvAmount = kdvMatrah * 0.20;
    const rawTotal = kdvMatrah + kdvAmount;
    const displayPrice = Math.round(rawTotal / 50) * 50;
    
    return {
      basePrice, commissionRate, commissionAmount: Math.round(commissionAmount),
      teacherNet: Math.round(teacherNet), teacherGross: Math.round(teacherGross),
      stopajAmount: Math.round(stopajAmount), platformShare: Math.round(platformShare),
      kdvMatrah: Math.round(kdvMatrah), kdvAmount: Math.round(kdvAmount),
      rawTotal: Math.round(rawTotal), displayPrice
    };
  };

  const priceDetails = calculatePrice(testPrice, testCommission);
  const formatCurrency = (n: number) => n.toLocaleString('tr-TR') + ' TL';

  const tabs = [
    { id: 'fiyatlandirma', label: 'Fiyatlandirma', icon: '₺' },
    { id: 'komisyon', label: 'Komisyon Oranlari', icon: '%' },
    { id: 'genel', label: 'Genel Ayarlar', icon: '⚙' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Sistem Ayarlari</h1>
        <p className="text-slate-600 mt-1">Platform ayarlarini yonetin</p>
      </div>

      <div className="flex gap-8">
        <div className="w-64 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                activeTab === tab.id ? 'bg-red-50 text-red-600 font-medium' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {activeTab === 'fiyatlandirma' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Fiyat Hesaplama Araci</h2>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Ogretmen Baz Fiyati (TL)</label>
                    <input
                      type="number"
                      value={testPrice}
                      onChange={(e) => setTestPrice(Number(e.target.value))}
                      min={1500}
                      step={50}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    />
                    <p className="text-sm text-slate-500 mt-1">Minimum: 1.500 TL</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Komisyon Orani</label>
                    <select
                      value={testCommission}
                      onChange={(e) => setTestCommission(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <option value={0.25}>%25 - Baslangic (0-100 ders)</option>
                      <option value={0.20}>%20 - Standart (101-200 ders)</option>
                      <option value={0.15}>%15 - Premium (201+ ders)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6">
                  <h3 className="font-semibold text-red-600 mb-4 text-lg">Fiyat Hesaplama Detayi</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-slate-700 mb-3">1. Ogretmen Tarafi</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Baz Fiyat:</span>
                          <span className="font-medium">{formatCurrency(priceDetails.basePrice)}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>Komisyon ({(testCommission * 100).toFixed(0)}%):</span>
                          <span className="font-medium">-{formatCurrency(priceDetails.commissionAmount)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 bg-green-50 -mx-4 px-4 py-2 rounded">
                          <span className="font-medium text-green-700">Ogretmen Net Alacagi:</span>
                          <span className="font-bold text-green-700">{formatCurrency(priceDetails.teacherNet)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-slate-700 mb-3">2. Vergi Hesaplama (Veliye Yansir)</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Brutlestirme (Stopaj %20):</span>
                          <span className="font-medium">{formatCurrency(priceDetails.teacherGross)}</span>
                        </div>
                        <div className="flex justify-between text-orange-600">
                          <span>Stopaj Tutari:</span>
                          <span className="font-medium">{formatCurrency(priceDetails.stopajAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Platform Payi:</span>
                          <span className="font-medium">{formatCurrency(priceDetails.platformShare)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">KDV Matrahi:</span>
                          <span className="font-medium">{formatCurrency(priceDetails.kdvMatrah)}</span>
                        </div>
                        <div className="flex justify-between text-orange-600">
                          <span>KDV (%20):</span>
                          <span className="font-medium">{formatCurrency(priceDetails.kdvAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-slate-700 mb-3">3. Sonuc</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Ham Toplam:</span>
                          <span className="font-medium">{formatCurrency(priceDetails.rawTotal)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 bg-blue-50 -mx-4 px-4 py-3 rounded">
                          <span className="font-semibold text-blue-700">Veli Odeyecegi (50'ye Yuvarlanmis):</span>
                          <span className="font-bold text-blue-700 text-xl">{formatCurrency(priceDetails.displayPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <h3 className="font-semibold mb-4">Hizli Ozet</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-blue-100 text-sm">Ogretmen Alir</p>
                    <p className="text-2xl font-bold">{formatCurrency(priceDetails.teacherNet)}</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-blue-100 text-sm">Platform Kazanir</p>
                    <p className="text-2xl font-bold">{formatCurrency(priceDetails.commissionAmount)}</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-blue-100 text-sm">Veli Oder</p>
                    <p className="text-2xl font-bold">{formatCurrency(priceDetails.displayPrice)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'komisyon' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Kademeli Komisyon Oranlari</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-5 bg-red-50 rounded-xl border-2 border-red-200">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">%25</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">Baslangic</h3>
                    <p className="text-slate-600">0 - 100 ders</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl">%20</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">Standart</h3>
                    <p className="text-slate-600">101 - 200 ders</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">%15</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">Premium</h3>
                    <p className="text-slate-600">201+ ders</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'genel' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Genel Ayarlar</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Ders Ucreti</label>
                  <p className="text-2xl font-bold text-slate-900">1.500 TL</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Maksimum Ders Ucreti</label>
                  <p className="text-2xl font-bold text-slate-900">Limit Yok</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl">
                  <label className="block text-sm font-medium text-orange-700 mb-2">Stopaj Orani</label>
                  <p className="text-2xl font-bold text-orange-700">%20</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <label className="block text-sm font-medium text-purple-700 mb-2">KDV Orani</label>
                  <p className="text-2xl font-bold text-purple-700">%20</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
