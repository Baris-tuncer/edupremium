'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface PricingConfig {
  commissionRate: number;
  taxRate: number;
}

interface Subject {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
}

interface ExamType {
  id: string;
  name: string;
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    commissionRate: 20,
    taxRate: 20,
  });
  const [formData, setFormData] = useState({
    bio: '',
    hourlyRate: '',
    iban: '',
  });

  // YENİ: Subject/Branch/ExamType için state'ler
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [allExamTypes, setAllExamTypes] = useState<ExamType[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [selectedExamTypeIds, setSelectedExamTypeIds] = useState<string[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchPricingConfig();
    fetchOptions();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.getMyProfile(); // YENİ: getMyProfile kullan
      setProfile(data);
      setFormData({
        bio: data.bio || '',
        hourlyRate: data.hourlyRate || '',
        iban: data.iban || '',
      });

      // Mevcut seçimleri set et
      setSelectedSubjectIds(data.subjects?.map((s: any) => s.id) || []);
      setSelectedBranchIds(data.branches?.map((b: any) => b.id) || []);
      setSelectedExamTypeIds(data.examTypes?.map((e: any) => e.id) || []);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Profil yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [subjects, branches, examTypes] = await Promise.all([
        api.listSubjects(),
        api.listBranches(),
        api.listExamTypes(),
      ]);
      setAllSubjects(subjects);
      setAllBranches(branches);
      setAllExamTypes(examTypes);
    } catch (error) {
      console.error('Failed to fetch options:', error);
    }
  };

  const fetchPricingConfig = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';
      
      const response = await fetch(`${baseUrl}/admin/settings/calculate-price`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setPricingConfig({
            commissionRate: data.data.commissionRate || 20,
            taxRate: data.data.taxRate || 20,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch pricing config:', error);
    }
  };

  const roundToNearest100 = (value: number) => Math.round(value / 100) * 100;

  const calculatePricing = (teacherRate: number) => {
    const commission = teacherRate * (pricingConfig.commissionRate / 100);
    const subtotal = teacherRate + commission;
    const tax = subtotal * (pricingConfig.taxRate / 100);
    const totalPriceRaw = subtotal + tax;
    const totalPrice = roundToNearest100(totalPriceRaw);
    return { commission, subtotal, tax, totalPriceRaw, totalPrice };
  };

  const hourlyRateNum = parseFloat(formData.hourlyRate) || 0;
  const pricing = calculatePricing(hourlyRateNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Profil bilgilerini güncelle
      await api.updateMyProfile({
        bio: formData.bio,
        hourlyRate: parseFloat(formData.hourlyRate),
        iban: formData.iban,
      });

      // Subject/Branch/ExamType güncelle
      await Promise.all([
        api.updateMySubjects(selectedSubjectIds),
        api.updateMyBranches(selectedBranchIds),
        api.updateMyExamTypes(selectedExamTypeIds),
      ]);

      toast.success('Profil başarıyla güncellendi!');
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Profil güncellenemedi');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const toggleBranch = (branchId: string) => {
    setSelectedBranchIds(prev =>
      prev.includes(branchId)
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  const toggleExamType = (examTypeId: string) => {
    setSelectedExamTypeIds(prev =>
      prev.includes(examTypeId)
        ? prev.filter(id => id !== examTypeId)
        : [...prev, examTypeId]
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">Profil Ayarları</h1>
          <p className="text-slate-600">Profilinizi düzenleyin ve öğrencilere kendinizi tanıtın</p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bio */}
          <div className="card p-6">
            <label className="block font-medium text-navy-900 mb-2">
              Hakkımda
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              placeholder="Kendinizi tanıtın, deneyimlerinizden bahsedin..."
            />
            <p className="text-sm text-slate-500 mt-2">
              Bu metin öğrencilerin sizin profilinizde göreceği açıklama olacaktır.
            </p>
          </div>

          {/* Hourly Rate with Price Calculation */}
          <div className="card p-6">
            <label className="block font-medium text-navy-900 mb-2">
              Saatlik Ücretiniz (₺)
            </label>
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              placeholder="500"
              min="0"
              step="1"
            />
            <p className="text-sm text-slate-500 mt-2">
              Bu, tamamlanan dersler için size ödenecek saatlik ücrettir.
            </p>

            {hourlyRateNum > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-3">Fiyat Detayları</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Sizin Alacağınız:</span>
                    <span className="font-medium text-blue-900">₺{hourlyRateNum.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Platform Komisyonu (%{pricingConfig.commissionRate}):</span>
                    <span className="font-medium text-blue-900">₺{Math.round(pricing.commission).toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">KDV (%{pricingConfig.taxRate}):</span>
                    <span className="font-medium text-blue-900">₺{Math.round(pricing.tax).toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-semibold text-blue-900">Veliye Gösterilecek Fiyat:</span>
                    <span className="font-bold text-green-600 text-lg">₺{pricing.totalPrice.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  * Son fiyat en yakın 100 TL'ye yuvarlanır
                </p>
              </div>
            )}
          </div>

          {/* YENİ: Subject Selection */}
          <div className="card p-6">
            <label className="block font-medium text-navy-900 mb-4">
              Dersler
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({selectedSubjectIds.length} seçili)
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allSubjects.map((subject) => (
                <label
                  key={subject.id}
                  className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjectIds.includes(subject.id)}
                    onChange={() => toggleSubject(subject.id)}
                    className="w-4 h-4 text-navy-600 border-slate-300 rounded focus:ring-navy-500"
                  />
                  <span className="text-sm text-slate-700">{subject.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* YENİ: Branch Selection */}
          <div className="card p-6">
            <label className="block font-medium text-navy-900 mb-4">
              Kademeler
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({selectedBranchIds.length} seçili)
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allBranches.map((branch) => (
                <label
                  key={branch.id}
                  className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedBranchIds.includes(branch.id)}
                    onChange={() => toggleBranch(branch.id)}
                    className="w-4 h-4 text-navy-600 border-slate-300 rounded focus:ring-navy-500"
                  />
                  <span className="text-sm text-slate-700">{branch.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* YENİ: ExamType Selection */}
          <div className="card p-6">
            <label className="block font-medium text-navy-900 mb-4">
              Sınav Türleri
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({selectedExamTypeIds.length} seçili)
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allExamTypes.map((examType) => (
                <label
                  key={examType.id}
                  className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedExamTypeIds.includes(examType.id)}
                    onChange={() => toggleExamType(examType.id)}
                    className="w-4 h-4 text-navy-600 border-slate-300 rounded focus:ring-navy-500"
                  />
                  <span className="text-sm text-slate-700">{examType.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* IBAN */}
          <div className="card p-6">
            <label className="block font-medium text-navy-900 mb-2">
              IBAN
            </label>
            <input
              type="text"
              value={formData.iban}
              onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent font-mono"
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              maxLength={32}
            />
            <p className="text-sm text-slate-500 mt-2">
              Kazançlarınızın aktarılacağı banka hesap numarası.
            </p>
          </div>

          {/* Profile Photo & Intro Video */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <label className="block font-medium text-navy-900 mb-4">
                Profil Fotoğrafı
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-navy-100 rounded-full flex items-center justify-center text-2xl font-display font-semibold text-navy-600 overflow-hidden">
                  {profile?.profilePhotoUrl ? (
                    <img src={profile.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile?.firstName?.charAt(0)
                  )}
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors"
                >
                  Fotoğraf Yükle
                </button>
              </div>
            </div>

            <div className="card p-6">
              <label className="block font-medium text-navy-900 mb-4">
                Tanıtım Videosu
              </label>
              <button
                type="button"
                className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-navy-500 hover:text-navy-600 transition-colors"
              >
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Video Yükle
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={fetchProfile}
              className="px-6 py-3 text-slate-600 hover:text-navy-900 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-navy-600 text-white rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
