import React from 'react';
import Link from 'next/link';
import { Calculator, Atom, FlaskConical, Dna, BookOpen, Languages, Trophy, GraduationCap, ArrowRight } from 'lucide-react';

const subjects = [
  {
    id: 'matematik',
    title: 'Matematik',
    icon: <Calculator className="w-8 h-8" />,
    description: "Analitik düşünme becerilerinizi geliştirin."
  },
  {
    id: 'fizik',
    title: 'Fizik',
    icon: <Atom className="w-8 h-8" />,
    description: "Evrenin temel yasalarını keşfedin."
  },
  {
    id: 'kimya',
    title: 'Kimya',
    icon: <FlaskConical className="w-8 h-8" />,
    description: "Maddenin yapısını ve dönüşümünü inceleyin."
  },
  {
    id: 'biyoloji',
    title: 'Biyoloji',
    icon: <Dna className="w-8 h-8" />,
    description: "Yaşamın yapı taşlarını öğrenin."
  },
  {
    id: 'turkce',
    title: 'Türkçe',
    icon: <BookOpen className="w-8 h-8" />,
    description: "Dil bilgisi ve edebi yetkinlik kazanın."
  },
  {
    id: 'ingilizce',
    title: 'İngilizce',
    icon: <Languages className="w-8 h-8" />,
    description: "Dünya diliyle sınırları kaldırın."
  },
  {
    id: 'lgs',
    title: 'LGS Hazırlık',
    icon: <Trophy className="w-8 h-8" />,
    description: "Hayalinizdeki liseye giden en kısa yol."
  },
  {
    id: 'tyt-ayt',
    title: 'TYT-AYT',
    icon: <GraduationCap className="w-8 h-8" />,
    description: "Üniversite hedefinize emin adımlarla ilerleyin."
  }
];

const SubjectCategoriesPremium = () => {
  return (
    <section className="relative py-24 overflow-hidden">

      {/* --- ARKA PLAN (AYNI KÜTÜPHANE TEMASI) --- */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2672&auto=format&fit=crop')` }}
        />
        {/* Beyaz Perde (%60 Opaklık - Diğerleriyle aynı) */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">

        {/* ÜST KISIM (BAŞLIK & BUTON) */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="text-[#D4AF37] font-bold tracking-widest text-xs uppercase mb-3 block">BRANŞLAR</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif mb-4">
              Tüm Dersler İçin Uzman Öğretmenler
            </h2>
            <p className="text-slate-700 text-lg font-medium">
              İhtiyacınız olan her alanda, sınavlara hazırlıkta ve okul takviyesinde yanınızdayız.
            </p>
          </div>

          <Link href="/subjects" className="hidden md:inline-flex items-center gap-2 text-[#0F172A] font-bold uppercase tracking-wider hover:text-[#D4AF37] transition-colors group">
            Tüm Branşları Gör
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* BRANŞ KARTLARI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/subjects/${subject.id}`}
              className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 hover:bg-white hover:shadow-xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1 transition-all duration-500 flex flex-col h-full"
            >

              {/* İKON VE BAŞLIK SATIRI */}
              <div className="flex items-center gap-4 mb-4">
                {/* İkon Kutusu */}
                <div className="w-12 h-12 rounded-xl bg-[#0F172A]/5 text-[#0F172A] flex items-center justify-center border border-[#0F172A]/5 group-hover:bg-[#0F172A] group-hover:text-[#D4AF37] transition-all duration-300">
                  {subject.icon}
                </div>

                {/* Başlık */}
                <h3 className="text-xl font-bold text-[#0F172A] font-serif group-hover:text-[#D4AF37] transition-colors">
                  {subject.title}
                </h3>
              </div>

              {/* AÇIKLAMA */}
              <p className="text-slate-600 text-sm leading-relaxed font-medium mt-auto">
                {subject.description}
              </p>
            </Link>
          ))}
        </div>

        {/* MOBİL İÇİN BUTON (ALTTA) */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/subjects" className="inline-flex items-center gap-2 text-[#0F172A] font-bold uppercase tracking-wider hover:text-[#D4AF37] transition-colors">
            Tüm Branşları Gör <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default SubjectCategoriesPremium;
