import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

export default function KvkkPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">

      {/* ÜST BAŞLIK (Premium Lacivert Tasarım) */}
      <div className="bg-[#020617] py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-6 bg-[#D4AF37]/5 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" /> Yasal Bilgilendirme
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-serif mb-4">
            KVKK Aydınlatma Metni
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
            Kişisel verilerinizin güvenliği ve gizliliği bizim için esastır.
          </p>
        </div>
      </div>

      {/* İÇERİK ALANI */}
      <div className="container mx-auto px-4 py-16 relative z-10 -mt-10">
        <div className="bg-white rounded-3xl shadow-xl border border-[#D4AF37]/10 p-8 md:p-12 max-w-4xl mx-auto">
          <div className="prose prose-slate prose-lg max-w-none">

            <h3 className="text-[#0F172A] font-serif font-bold text-xl mb-4">1. Veri Sorumlusu</h3>
            <p className="text-slate-600 mb-6">
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, EduPremium olarak, veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlar kapsamında işlemekteyiz.
            </p>

            <h3 className="text-[#0F172A] font-serif font-bold text-xl mb-4">2. Kişisel Verilerin İşlenme Amacı</h3>
            <p className="text-slate-600 mb-6">
              Toplanan kişisel verileriniz; hizmetlerimizden faydalanmanız, üyelik işlemlerinin gerçekleştirilmesi, eğitim süreçlerinin yönetilmesi ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.
            </p>

            <h3 className="text-[#0F172A] font-serif font-bold text-xl mb-4">3. İşlenen Kişisel Veriler</h3>
            <ul className="list-disc pl-5 text-slate-600 mb-6 space-y-2">
              <li>Kimlik Bilgileri (Ad, Soyad)</li>
              <li>İletişim Bilgileri (E-posta, Telefon, Adres)</li>
              <li>İşlem Güvenliği Bilgileri (IP adresi, Log kayıtları)</li>
              <li>Müşteri İşlem Bilgileri (Ders talepleri, Ödeme bilgileri)</li>
            </ul>

            <h3 className="text-[#0F172A] font-serif font-bold text-xl mb-4">4. Haklarınız</h3>
            <p className="text-slate-600 mb-6">
              KVKK'nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme haklarına sahipsiniz.
            </p>

            <div className="bg-[#FDFBF7] p-6 rounded-xl border border-[#D4AF37]/20 mt-8">
              <p className="text-sm text-slate-500 mb-2 font-bold uppercase tracking-wider">İletişim</p>
              <p className="text-slate-700">
                Haklarınızla ilgili taleplerinizi <a href="mailto:kvkk@edupremium.com" className="text-[#D4AF37] font-bold hover:underline">kvkk@edupremium.com</a> adresine iletebilirsiniz.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
