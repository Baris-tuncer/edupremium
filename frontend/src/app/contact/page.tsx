'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
        <div className="container-wide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl font-bold text-navy-900 mb-4">İletişim</h1>
              <p className="text-slate-600 text-lg">Sorularınız için bize ulaşın, en kısa sürede yanıt verelim.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div className="card p-6">
                  <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-2">E-posta</h3>
                  <p className="text-slate-600">info@visserr.com</p>
                </div>

                <div className="card p-6">
                  <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-2">Telefon</h3>
                  <p className="text-slate-600">+90 533 295 13 03</p>
                  <p className="text-slate-500 text-sm mt-1">Pzt-Cuma: 09:00-18:00, Cmt: 10:00-14:00</p>
                </div>

                <div className="card p-6">
                  <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-2">Adres</h3>
                  <p className="text-slate-600">Levent, Büyükdere Cad. No:123</p>
                  <p className="text-slate-600">34394 Şişli/İstanbul</p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="card p-8">
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-navy-900 mb-2">Mesajınız Gönderildi!</h3>
                      <p className="text-slate-600 mb-6">En kısa sürede size dönüş yapacağız.</p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="btn-primary"
                      >
                        Yeni Mesaj Gönder
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-navy-900 mb-2">
                            Adınız Soyadınız
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="Adınız Soyadınız"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-navy-900 mb-2">
                            E-posta Adresiniz
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input-field"
                            placeholder="ornek@email.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy-900 mb-2">
                          Konu
                        </label>
                        <select
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="input-field"
                        >
                          <option value="">Konu seçin</option>
                          <option value="general">Genel Bilgi</option>
                          <option value="teacher">Öğretmen Olmak İstiyorum</option>
                          <option value="student">Öğrenci/Veli Desteği</option>
                          <option value="technical">Teknik Destek</option>
                          <option value="partnership">İş Birliği</option>
                          <option value="other">Diğer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy-900 mb-2">
                          Mesajınız
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="input-field resize-none"
                          placeholder="Mesajınızı buraya yazın..."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full"
                      >
                        {isSubmitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}