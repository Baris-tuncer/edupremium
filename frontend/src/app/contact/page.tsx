'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
            full_name: formData.name,
            email: formData.email,
            message: formData.message,
            created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Hata:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#FDFBF7]">
      {/* Üst Başlık (Daha Alçak) */}
      <div className="bg-[#020617] py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white font-serif mb-2">Bize Ulaşın</h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">Sorularınız için buradayız.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20">
        {/* KUTUYU KÜÇÜLTTÜK: max-w-4xl yaptık (eskiden tam genişlikti) */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-[#D4AF37]/10 max-w-5xl mx-auto">

          {/* Sol Taraf (Bilgiler - Daha Kompakt) */}
          <div className="bg-[#0F172A] text-white p-8 md:w-5/12 flex flex-col justify-center">
            <h3 className="text-xl font-bold font-serif text-[#D4AF37] mb-6">İletişim</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D4AF37] mt-1" />
                <div><h4 className="font-bold text-sm">Adres</h4><p className="text-slate-400 text-xs leading-relaxed">Maslak Mah. Büyükdere Cad.<br/>No:123 Sarıyer/İstanbul</p></div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#D4AF37]" />
                <div><h4 className="font-bold text-sm">Telefon</h4><p className="text-slate-400 text-xs">+90 (212) 345 67 89</p></div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#D4AF37]" />
                <div><h4 className="font-bold text-sm">E-Posta</h4><p className="text-slate-400 text-xs">info@edupremium.com</p></div>
              </div>
            </div>
          </div>

          {/* Sağ Taraf (Form - SLIM FIT) */}
          <div className="p-8 md:w-7/12 bg-white">
            <h3 className="text-lg font-bold font-serif text-[#0F172A] mb-1">Hızlı Mesaj</h3>
            <p className="text-slate-500 mb-5 text-xs">Size en kısa sürede dönüş yapacağız.</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Inputları küçülttük (py-2 text-sm) */}
                <input
                  type="text"
                  placeholder="Adınız Soyadınız"
                  className="w-full bg-[#FDFBF7] border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37] outline-none transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="E-Posta Adresiniz"
                  className="w-full bg-[#FDFBF7] border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37] outline-none transition-colors"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              {/* Textarea KÜÇÜLDÜ: rows={3} yaptık */}
              <textarea
                rows={3}
                placeholder="Mesajınız..."
                className="w-full bg-[#FDFBF7] border border-slate-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:border-[#D4AF37] outline-none transition-colors"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                required
              ></textarea>

              {status === 'success' && <div className="text-green-600 bg-green-50 p-2 rounded text-xs font-bold flex items-center gap-2"><CheckCircle className="w-3 h-3"/> İletildi!</div>}
              {status === 'error' && <div className="text-red-600 bg-red-50 p-2 rounded text-xs font-bold flex items-center gap-2"><AlertCircle className="w-3 h-3"/> Hata oluştu.</div>}

              {/* Buton Küçüldü */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0F172A] text-white font-bold py-2.5 rounded-lg hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-md text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? '...' : (
                   <>Gönder <Send className="w-3 h-3" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
