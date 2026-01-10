'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'student' | 'teacher' | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gradeLevel: '',
    schoolName: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    invitationCode: '',
    branchId: '',
    iban: '',
    iban: '',
          introVideoUrl: '',
          hourlyRate: '',
    profilePhoto: null as File | null,
    acceptTerms: false,
    acceptKvkk: false,
  });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFormData(prev => ({ ...prev, profilePhoto: file }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';
          
          let endpoint = '';
          let body: any = {};

          if (userType === 'student') {
            endpoint = '/auth/register/student';
            body = {
              email: formData.email,
              password: formData.password,
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone || undefined,
              gradeLevel: formData.gradeLevel ? parseInt(formData.gradeLevel) : undefined,
              schoolName: formData.schoolName || undefined,
              parentName: formData.parentName || undefined,
              parentEmail: formData.parentEmail || undefined,
              parentPhone: formData.parentPhone || undefined,
            };
          } else {
            endpoint = '/auth/register/teacher';
            body = {
              email: formData.email,
              password: formData.password,
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone || undefined,
              invitationCode: formData.invitationCode,
              branchId: formData.branchId,
              introVideoUrl: formData.introVideoUrl,
              hourlyRate: parseFloat(formData.hourlyRate),
              iban: formData.iban || undefined,
            };
          }

          const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Kayıt başarısız');
          }

          // Başarılı - token'ları kaydet ve yönlendir
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          
          alert('Kayıt başarılı!');
          window.location.href = userType === 'student' ? '/student/dashboard' : '/teacher/dashboard';
          
        } catch (error: any) {
          alert(error.message || 'Bir hata oluştu');
        } finally {
          setIsLoading(false);
        }
      };
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
          <div className="w-12 h-12 bg-gradient-navy rounded-xl flex items-center justify-center shadow-elegant group-hover:shadow-elevated transition-shadow duration-300">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <span className="font-display text-2xl font-semibold text-navy-900">EduPremium</span>
          </div>
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step >= s ? 'bg-navy-900 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > s ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 rounded-full ${step > s ? 'bg-navy-900' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="card p-8">
          {/* Step 1: Choose Type */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl md:text-3xl text-center mb-2">Kayıt Ol</h1>
              <p className="text-slate-600 text-center mb-8">Nasıl kayıt olmak istiyorsunuz?</p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setUserType('student')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    userType === 'student'
                      ? 'border-navy-600 bg-navy-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-14 h-14 bg-navy-100 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">Öğrenci / Veli</h3>
                  <p className="text-slate-600 text-sm">Özel ders almak için kayıt olun</p>
                </button>

                <button
                  onClick={() => setUserType('teacher')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    userType === 'teacher'
                      ? 'border-navy-600 bg-navy-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-14 h-14 bg-gold-100 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">Öğretmen</h3>
                  <p className="text-slate-600 text-sm">Davet kodunuz varsa öğretmen olarak kayıt olun</p>
                </button>
              </div>

              <button
                onClick={() => userType && setStep(2)}
                disabled={!userType}
                className="btn-primary w-full py-4 text-lg disabled:opacity-50"
              >
                Devam Et
              </button>
            </div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="animate-fade-up">
              <h1 className="text-2xl md:text-3xl text-center mb-2">
                {userType === 'student' ? 'Öğrenci Bilgileri' : 'Öğretmen Bilgileri'}
              </h1>
              <p className="text-slate-600 text-center mb-8">Kişisel bilgilerinizi girin</p>

              {userType === 'teacher' && (
                <div className="mb-6">
                  <label htmlFor="invitationCode" className="input-label">Davet Kodu *</label>
                  <input
                    type="text"
                    id="invitationCode"
                    name="invitationCode"
                    value={formData.invitationCode}
                    onChange={handleChange}
                    className="input"
                    placeholder="INV-2026-XXXXXX"
                    required
                  />
                  <p className="text-sm text-slate-500 mt-1">Davet kodunuz yoksa lütfen bizimle iletişime geçin.</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="input-label">Ad *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="input-label">Soyad *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="input-label">E-posta *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="input-label">Telefon *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="5XX XXX XX XX"
                  required
                />
              </div>

              {userType === 'student' && (
                <>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="gradeLevel" className="input-label">Sınıf *</label>
                      <select
                        id="gradeLevel"
                        name="gradeLevel"
                        value={formData.gradeLevel}
                        onChange={handleChange}
                        className="input"
                        required
                      >
                        <option value="">Seçin</option>
                        {[5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                          <option key={g} value={g}>{g}. Sınıf</option>
                        ))}
                        <option value="mezun">Mezun</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="schoolName" className="input-label">Okul Adı</label>
                      <input
                        type="text"
                        id="schoolName"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        className="input"
                      />
                    </div>
                  </div>
                </>
              )}

              {userType === 'teacher' && (
                <div className="mb-4">
                  <label htmlFor="branchId" className="input-label">Branş *</label>
                  <select
                    id="branchId"
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Seçin</option>
        <option value="2bb543f0-cca9-4c03-8af1-eb616db3ff4d">Matematik</option>
                    <option value="fizik">Fizik</option>
                    <option value="kimya">Kimya</option>
                    <option value="biyoloji">Biyoloji</option>
                    <option value="turkce">Türkçe-Edebiyat</option>
                    <option value="ingilizce">İngilizce</option>
                  </select>
                </div>
              )}

              {userType === 'teacher' && (
                <div className="mb-4">
                  <label htmlFor="iban" className="input-label">IBAN *</label>
                  <input
                    type="text"
                    id="iban"
                    name="iban"
                    value={formData.iban}
                    onChange={handleChange}
                    className="input"
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Ders ucretleriniz bu hesaba aktarilacaktir</p>
                </div>
              )}
                    {/* Tanıtım Videosu */}
                                        {userType === 'teacher' && (
                                          <div className="mb-4">
                                            <label htmlFor="introVideoUrl" className="input-label">Tanıtım Video URL *</label>
                                            <input
                                              type="url"
                                              id="introVideoUrl"
                                              name="introVideoUrl"
                                              value={formData.introVideoUrl}
                                              onChange={handleChange}
                                              className="input"
                                              placeholder="https://youtube.com/watch?v=..."
                                              required
                                            />
                                            <p className="text-xs text-slate-500 mt-1">YouTube veya Vimeo linki</p>
                                          </div>
                                        )}

                                        {/* Saat Ücreti */}
                                        {userType === 'teacher' && (
                                          <div className="mb-4">
                                            <label htmlFor="hourlyRate" className="input-label">Saat Ücreti (₺) *</label>
                                            <input
                                              type="number"
                                              id="hourlyRate"
                                              name="hourlyRate"
                                              value={formData.hourlyRate}
                                              onChange={handleChange}
                                              className="input"
                                              placeholder="450"
                                              min="100"
                                              required
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Minimum 100₺</p>
                                          </div>
                                        )}
                          {/* Profil Fotoğrafı - Opsiyonel */}
                                        {userType === 'teacher' && (
                                          <div className="mb-4">
                                            <label className="input-label">Profil Fotoğrafı (Opsiyonel)</label>
                                            <div className="flex items-center gap-4">
                                              <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                                                {photoPreview ? (
                                                  <img src={photoPreview} alt="Önizleme" className="w-full h-full object-cover" />
                                                ) : (
                                                  <span className="text-gray-400 text-xs text-center">Vesikalık<br/>Fotoğraf</span>
                                                )}
                                              </div>
                                              <div>
                                                <input
                                                  type="file"
                                                  id="profilePhoto"
                                                  accept="image/*"
                                                  onChange={handlePhotoChange}
                                                  className="hidden"
                                                />
                                                <label
                                                  htmlFor="profilePhoto"
                                                  className="inline-block bg-navy-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-navy-700 text-sm"
                                                >
                                                  Fotoğraf Seç
                                                </label>
                                                <p className="text-xs text-slate-500 mt-1">JPG, PNG (Max 2MB)</p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                          <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="password" className="input-label">Şifre *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input"
                    placeholder="En az 8 karakter"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="input-label">Şifre Tekrar *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-4">
                  Geri
                </button>
                <button type="submit" className="btn-primary flex-1 py-4">
                  Devam Et
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Parent Info (for students) / Confirm (for teachers) */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="animate-fade-up">
              {userType === 'student' ? (
                <>
                  <h1 className="text-2xl md:text-3xl text-center mb-2">Veli Bilgileri</h1>
                  <p className="text-slate-600 text-center mb-8">Ders raporları için veli bilgilerini girin</p>

                  <div className="mb-4">
                    <label htmlFor="parentName" className="input-label">Veli Adı Soyadı *</label>
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="parentEmail" className="input-label">Veli E-posta *</label>
                    <input
                      type="email"
                      id="parentEmail"
                      name="parentEmail"
                      value={formData.parentEmail}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                    <p className="text-sm text-slate-500 mt-1">Ders raporları bu adrese gönderilecektir.</p>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="parentPhone" className="input-label">Veli Telefon</label>
                    <input
                      type="tel"
                      id="parentPhone"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl text-center mb-2">Kayıt Özeti</h1>
                  <p className="text-slate-600 text-center mb-8">Bilgilerinizi kontrol edin</p>

                  <div className="bg-slate-50 rounded-xl p-6 mb-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ad Soyad</span>
                      <span className="font-medium text-navy-900">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">E-posta</span>
                      <span className="font-medium text-navy-900">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Telefon</span>
                      <span className="font-medium text-navy-900">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Davet Kodu</span>
                      <span className="font-medium text-navy-900">{formData.invitationCode}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Terms */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
                    required
                  />
                  <span className="text-sm text-slate-600">
                    <Link href="/terms" className="text-navy-600 hover:underline">Kullanım Koşulları</Link>'nı okudum ve kabul ediyorum. *
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptKvkk"
                    checked={formData.acceptKvkk}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
                    required
                  />
                  <span className="text-sm text-slate-600">
                    <Link href="/privacy" className="text-navy-600 hover:underline">KVKK Aydınlatma Metni</Link>'ni okudum ve onaylıyorum. *
                  </span>
                </label>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-4">
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.acceptTerms || !formData.acceptKvkk}
                  className="btn-primary flex-1 py-4 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Kaydediliyor...
                    </span>
                  ) : (
                    'Kayıt Ol'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <p className="text-center text-slate-600 mt-8">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="font-semibold text-navy-600 hover:text-navy-800">
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
