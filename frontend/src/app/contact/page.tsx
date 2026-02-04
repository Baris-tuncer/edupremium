import PageHeader from '@/components/shared/PageHeader';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="w-full">
      <PageHeader title="İletişim" subtitle="Bize Ulaşın" />
      <div className="w-full bg-[#FDFBF7] py-0">
        <div className="grid md:grid-cols-2 min-h-[600px]">
           {/* Sol Taraf - Bilgiler (Koyu) */}
           <div className="bg-[#0F172A] text-white p-12 md:p-24 flex flex-col justify-center">
              <h3 className="text-3xl font-serif mb-12 text-[#D4AF37]">İletişim Kanalları</h3>
              <div className="space-y-8">
                 <div className="flex items-center gap-6">
                    <Mail className="w-6 h-6 text-[#D4AF37]" />
                    <span className="text-lg">info@edupremium.com</span>
                 </div>
                 <div className="flex items-center gap-6">
                    <Phone className="w-6 h-6 text-[#D4AF37]" />
                    <span className="text-lg">+90 212 555 0000</span>
                 </div>
                 <div className="flex items-center gap-6">
                    <MapPin className="w-6 h-6 text-[#D4AF37]" />
                    <span className="text-lg">Teknopark İstanbul</span>
                 </div>
              </div>
           </div>
           {/* Sağ Taraf - Form (Açık) */}
           <div className="bg-white p-12 md:p-24 flex flex-col justify-center">
              <h3 className="text-3xl font-serif mb-8 text-[#0F172A]">Mesaj Gönder</h3>
              <form className="space-y-6">
                 <input type="text" placeholder="Adınız Soyadınız" className="w-full p-4 bg-[#F8F8F8] border-b-2 border-slate-200 focus:border-[#D4AF37] outline-none transition-colors rounded-none" />
                 <input type="email" placeholder="E-posta Adresiniz" className="w-full p-4 bg-[#F8F8F8] border-b-2 border-slate-200 focus:border-[#D4AF37] outline-none transition-colors rounded-none" />
                 <textarea placeholder="Mesajınız" rows={4} className="w-full p-4 bg-[#F8F8F8] border-b-2 border-slate-200 focus:border-[#D4AF37] outline-none transition-colors rounded-none"></textarea>
                 <button className="w-full py-4 bg-[#0F172A] text-white font-bold hover:bg-[#D4AF37] transition-colors rounded-none">GÖNDER</button>
              </form>
           </div>
        </div>
      </div>
    </main>
  );
}
