import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShieldCheck, BookOpen } from 'lucide-react';

const FeaturedTeachers = () => {
  const teachers = [
    {
      id: 1,
      name: "Esra Yılmaz",
      branch: "İlkokul & Sınıf Öğretmeni",
      rating: 5.0,
      reviews: 24,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      bio: "15 yıllık deneyimle çocuklarınızın eğitim temelini sağlamlaştırıyorum. Okuma-yazma ve matematik odaklı.",
      tags: ["İlkokul", "Özel Eğitim"]
    },
    {
      id: 2,
      name: "Barış Tuncer",
      branch: "Matematik Dehası",
      rating: 5.0,
      reviews: 42,
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      bio: "LGS ve TYT matematik konularında ezber bozan yöntemler. Analitik düşünme becerisi kazandırıyorum.",
      tags: ["LGS Hazırlık", "Matematik"]
    },
    {
      id: 3,
      name: "Merve Kaya",
      branch: "İngilizce Öğretmeni",
      rating: 4.9,
      reviews: 18,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      bio: "Oxford müfredatına hakim, konuşma odaklı (Speaking) özel dersler. IELTS ve TOEFL hazırlık.",
      tags: ["Yabancı Dil", "IELTS"]
    },
    {
      id: 4,
      name: "Kemal Demir",
      branch: "Fizik & Fen Bilimleri",
      rating: 4.8,
      reviews: 30,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      bio: "Fen bilimlerini günlük hayatla birleştirerek öğretiyorum. LGS Fen ve TYT Fizik net garantili.",
      tags: ["Fen Bilgisi", "Lise"]
    }
  ];

  return (
    <section className="py-24 bg-[#FDFBF7] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0F172A 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#B49120] text-sm font-semibold tracking-wide mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>EDİTÖRÜN SEÇİMİ</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6 font-serif tracking-tight">
            Alanında En İyi Öğretmenler
          </h2>
          <p className="text-lg text-gray-600 font-light leading-relaxed">
            Titizlikle değerlendirilen, minimum 4.5 puan ve yüksek deneyime sahip,
            öğrenci başarısını kanıtlamış uzman eğitmenlerimiz.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {['İlkokul', 'Ortaokul', 'Lise', 'LGS Hazırlık', 'TYT-AYT', 'Yabancı Dil'].map((filter, index) => (
            <button key={index} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
              ${index === 3 ? 'bg-[#0F172A] text-white shadow-lg scale-105 ring-4 ring-[#0F172A]/10' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#D4AF37] hover:text-[#0F172A]'}`}>
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-16">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="group relative bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 hover:border-[#D4AF37]/40 hover:shadow-[0_20px_50px_-10px_rgba(212,175,55,0.15)] transition-all duration-300 mt-12 flex flex-col">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <div className="relative w-24 h-24 rounded-full p-1 bg-white shadow-lg ring-1 ring-gray-100 group-hover:ring-[#D4AF37] transition-all duration-300">
                  <Image src={teacher.image} alt={teacher.name} width={96} height={96} className="rounded-full object-cover w-full h-full" />
                  <div className="absolute bottom-0 right-0 bg-[#D4AF37] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                    {teacher.rating}
                  </div>
                </div>
              </div>
              <div className="pt-16 pb-6 px-6 flex-grow text-center">
                <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-1 group-hover:text-[#D4AF37] transition-colors">{teacher.name}</h3>
                <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-4">{teacher.branch}</p>
                <div className="flex justify-center items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(teacher.rating) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'fill-gray-200 text-gray-200'}`} />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">({teacher.reviews} ders)</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">{teacher.bio}</p>
              </div>
              <div className="px-6 pb-6 mt-auto">
                <Link href={`/teachers/${teacher.id}`} className="block w-full py-3 bg-[#0F172A] text-white text-sm font-medium rounded-xl hover:bg-[#1E293B] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#0F172A]/20">
                  Profili İncele
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTeachers;
