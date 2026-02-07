'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Star, GraduationCap, Presentation, LifeBuoy, ChevronDown, ChevronUp, Search, CreditCard, Calendar, Video, MessageCircle, Shield, Clock, CheckCircle, XCircle, Wallet, FileText, Users } from 'lucide-react'

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<'student' | 'teacher' | null>(null);

  const studentGuide = [
    {
      icon: Search,
      title: '1. Öğretmen Bulma',
      content: `• Ana sayfadaki "Öğretmenler" bölümünden veya üst menüden tüm öğretmenleri görüntüleyebilirsiniz.
• Ders kategorisine göre filtreleme yapabilirsiniz (Matematik, Fizik, İngilizce vb.).
• Her öğretmenin profilinde deneyimi, eğitimi, uzmanlık alanları ve öğrenci yorumlarını inceleyebilirsiniz.
• Saatlik ücretler öğretmen profilinde açıkça belirtilmiştir.`
    },
    {
      icon: Calendar,
      title: '2. Ders Rezervasyonu',
      content: `• Beğendiğiniz öğretmenin profiline girin ve "Ders Al" butonuna tıklayın.
• Öğretmenin müsait olduğu gün ve saatleri takvimden seçin.
• Ders süresini belirleyin (genellikle 1 saat).
• Ders konusu veya özel notlarınızı ekleyebilirsiniz.`
    },
    {
      icon: CreditCard,
      title: '3. Güvenli Ödeme',
      content: `• Ödeme işlemleri Paratika altyapısı ile 256-bit SSL şifreleme ile korunmaktadır.
• Kredi kartı veya banka kartı ile ödeme yapabilirsiniz.
• Ödemeniz onaylandıktan sonra ders rezervasyonunuz kesinleşir.
• Fatura bilgileriniz e-posta adresinize gönderilir.`
    },
    {
      icon: Video,
      title: '4. Online Derse Katılım',
      content: `• Ders saatinden 10 dakika önce "Derslerim" sayfasından derse katılabilirsiniz.
• Görüntülü görüşme için kamera ve mikrofon izni vermeniz gerekir.
• Ders sırasında ekran paylaşımı ve beyaz tahta özellikleri kullanılabilir.
• İnternet bağlantınızın stabil olduğundan emin olun.`
    },
    {
      icon: XCircle,
      title: '5. İptal ve İade Politikası',
      content: `• Dersten 24 saat öncesine kadar ücretsiz iptal yapabilirsiniz.
• 24 saatten az kalan iptallerde ücret iadesi yapılmaz.
• Öğretmen dersi iptal ederse tam iade alırsınız.
• Teknik sorunlar nedeniyle gerçekleşmeyen dersler için tam iade yapılır.
• İade işlemleri 3-5 iş günü içinde kartınıza yansır.`
    },
    {
      icon: MessageCircle,
      title: '6. Destek ve İletişim',
      content: `• Herhangi bir sorun yaşarsanız "İletişim" sayfasından bize ulaşabilirsiniz.
• WhatsApp destek hattımız: +90 533 295 13 03
• E-posta: info@visserr.com
• Mesai saatleri içinde en geç 2 saat içinde dönüş yapılır.`
    }
  ];

  const teacherGuide = [
    {
      icon: FileText,
      title: '1. Başvuru ve Kayıt',
      content: `• "Eğitmen Ol" sayfasından başvuru formunu doldurun.
• Davet kodunuz yoksa WhatsApp üzerinden bizimle iletişime geçin.
• Özgeçmişinizi ve diploma/sertifikalarınızı sisteme yükleyin.
• Başvurunuz 24-48 saat içinde değerlendirilir.
• Onay sonrası hesabınız aktif edilir.`
    },
    {
      icon: Users,
      title: '2. Profil Oluşturma',
      content: `• Profil fotoğrafınızı yükleyin (profesyonel ve güler yüzlü bir fotoğraf tercih edin).
• Eğitim geçmişinizi ve deneyimlerinizi detaylı yazın.
• Uzmanlık alanlarınızı ve verdiğiniz dersleri seçin.
• Kendinizi tanıtan kısa bir video ekleyebilirsiniz.
• Saatlik ücretinizi belirleyin (net olarak cebinize geçecek tutar).`
    },
    {
      icon: Calendar,
      title: '3. Müsaitlik Takvimi',
      content: `• "Müsaitlik" sayfasından haftalık programınızı ayarlayın.
• Ders verebileceğiniz gün ve saatleri işaretleyin.
• Tatil veya izin günlerinizi önceden kapatın.
• Takvimi düzenli güncellemek öğrenci memnuniyetini artırır.`
    },
    {
      icon: Video,
      title: '4. Ders Verme',
      content: `• Rezervasyon yapıldığında e-posta ve bildirim alırsınız.
• Ders saatinde "Derslerim" sayfasından görüşmeye başlayın.
• Ekran paylaşımı ile sunum veya doküman gösterebilirsiniz.
• Beyaz tahta özelliğini problem çözümlerinde kullanabilirsiniz.
• Ders sonunda öğrenciye kısa geri bildirim verin.`
    },
    {
      icon: Wallet,
      title: '5. Kazanç ve Ödeme',
      content: `• Belirlediğiniz saatlik ücret, net olarak cebinize geçecek tutardır.
• Platform komisyonu ve vergiler bu tutarın üzerine eklenerek veliye yansıtılır.
• Kazançlarınızı "Kazançlarım" sayfasından takip edebilirsiniz.
• Ödemeler her ayın sonunda banka hesabınıza aktarılır.`
    },
    {
      icon: Shield,
      title: '6. Kurallar ve Politikalar',
      content: `• Derslere zamanında katılım zorunludur.
• İptal durumunda en az 24 saat önce bildirim yapın.
• Öğrencilerle platform dışı iletişim yasaktır.
• Profesyonel ve saygılı bir iletişim dili kullanın.
• 3 kez olumsuz değerlendirme hesap askıya alınmasına neden olabilir.`
    }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen relative bg-[#FDFBF7]/80 backdrop-blur-xl overflow-hidden">

        {/* --- ARKA PLAN --- */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')`
            }}
          ></div>
          <div className="absolute inset-0 bg-[#FDFBF7]/60 backdrop-blur-[6px]"></div>
        </div>

        <div className="relative z-10 pt-28 pb-20 px-4">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F172A]/10 text-[#0F172A] text-xs font-bold uppercase tracking-widest mb-6 bg-white/40 backdrop-blur-md shadow-sm">
                <LifeBuoy className="w-3 h-3 text-[#D4AF37]" /> Destek
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">Yardım Merkezi</h1>
              <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
                Size nasıl yardımcı olabiliriz?
              </p>
            </div>

            {/* Kartlar */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => setActiveSection(activeSection === 'student' ? null : 'student')}
                className={`group text-left bg-white/80 backdrop-blur-xl border rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5 hover:bg-white hover:scale-[1.01] transition-all duration-300 ${activeSection === 'student' ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20' : 'border-white/50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${activeSection === 'student' ? 'bg-[#D4AF37]' : 'bg-[#0F172A] group-hover:bg-[#D4AF37]'}`}>
                    <GraduationCap className={`w-7 h-7 transition-colors ${activeSection === 'student' ? 'text-[#0F172A]' : 'text-[#D4AF37] group-hover:text-[#0F172A]'}`} />
                  </div>
                  {activeSection === 'student' ? <ChevronUp className="w-6 h-6 text-[#D4AF37]" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-2">Öğrenci Rehberi</h3>
                <p className="text-slate-600">Ders alma, ödeme ve iptal süreçleri.</p>
              </button>

              <button
                onClick={() => setActiveSection(activeSection === 'teacher' ? null : 'teacher')}
                className={`group text-left bg-white/80 backdrop-blur-xl border rounded-3xl p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5 hover:bg-white hover:scale-[1.01] transition-all duration-300 ${activeSection === 'teacher' ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20' : 'border-white/50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${activeSection === 'teacher' ? 'bg-[#D4AF37]' : 'bg-[#0F172A] group-hover:bg-[#D4AF37]'}`}>
                    <Presentation className={`w-7 h-7 transition-colors ${activeSection === 'teacher' ? 'text-[#0F172A]' : 'text-[#D4AF37] group-hover:text-[#0F172A]'}`} />
                  </div>
                  {activeSection === 'teacher' ? <ChevronUp className="w-6 h-6 text-[#D4AF37]" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-2">Öğretmen Rehberi</h3>
                <p className="text-slate-600">Profil oluşturma, ders verme ve ödeme alma.</p>
              </button>
            </div>

            {/* Öğrenci Rehberi İçeriği */}
            {activeSection === 'student' && (
              <div className="bg-white/90 backdrop-blur-xl border border-[#D4AF37]/20 rounded-3xl p-6 md:p-10 shadow-2xl shadow-[#0F172A]/5 animate-in slide-in-from-top-4 duration-300">
                <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-8 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-[#D4AF37]" />
                  Öğrenci Rehberi
                </h2>
                <div className="space-y-6">
                  {studentGuide.map((item, index) => (
                    <div key={index} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-[#FDFBF7] border border-[#D4AF37]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#0F172A] mb-2">{item.title}</h3>
                          <p className="text-slate-600 whitespace-pre-line leading-relaxed">{item.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Öğretmen Rehberi İçeriği */}
            {activeSection === 'teacher' && (
              <div className="bg-white/90 backdrop-blur-xl border border-[#D4AF37]/20 rounded-3xl p-6 md:p-10 shadow-2xl shadow-[#0F172A]/5 animate-in slide-in-from-top-4 duration-300">
                <h2 className="text-2xl font-bold text-[#0F172A] font-serif mb-8 flex items-center gap-3">
                  <Presentation className="w-8 h-8 text-[#D4AF37]" />
                  Öğretmen Rehberi
                </h2>
                <div className="space-y-6">
                  {teacherGuide.map((item, index) => (
                    <div key={index} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-[#FDFBF7] border border-[#D4AF37]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#0F172A] mb-2">{item.title}</h3>
                          <p className="text-slate-600 whitespace-pre-line leading-relaxed">{item.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SSS Yönlendirme */}
            <div className="mt-8 text-center">
              <p className="text-slate-500 mb-4">Aradığınızı bulamadınız mı?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/faq"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl text-[#0F172A] font-semibold hover:border-[#D4AF37] hover:bg-white transition-all"
                >
                  Sık Sorulan Sorular
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0F172A] rounded-xl text-white font-semibold hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Bize Ulaşın
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
