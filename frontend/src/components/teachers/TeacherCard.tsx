import React from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

interface Teacher {
  id: string;
  user_id: string;
  name: string | null;
  surname: string | null;
  title: string | null;
  biography: string | null;
  image_url: string | null;
  hourly_rate: number | null;
  rating: number | null;
  review_count: number | null;
  location: string | null;
  experience_years: number | null;
  branches: { branch: { name: string } }[];
  verified: boolean | null;
  slug: string;
}

interface TeacherCardProps {
  teacher: Teacher;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher }) => {
  const fullName = `${teacher.name || ''} ${teacher.surname || ''}`.trim() || 'İsimsiz Eğitmen';
  const mainBranch = teacher.branches?.[0]?.branch.name || 'Genel';

  return (
    <div className="group relative w-full max-w-[360px] mx-auto mt-16 mb-8">

      {/* --- 1. TAŞAN FOTOĞRAF (YUKARI FIRLAMIŞ) --- */}
      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20">
        <div className="relative">
          {/* Altın Hare (Glow) */}
          <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

          {/* Fotoğraf Çerçevesi */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FDFBF7] shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500">
            <img
              src={teacher.image_url || '/placeholder-teacher.png'}
              alt={fullName}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-teacher.png'; }}
            />
          </div>

          {/* Onay Mühürü */}
          {teacher.verified && (
            <div className="absolute bottom-1 right-1 bg-[#D4AF37] text-[#0F172A] p-1.5 rounded-full border-2 border-[#FDFBF7] shadow-lg z-30" title="Onaylı Eğitmen">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      {/* --- 2. KART GÖVDESİ --- */}
      <div className="bg-[#FDFBF7] rounded-t-[3rem] rounded-b-2xl pt-20 pb-6 px-6 shadow-2xl border border-[#D4AF37]/20 relative overflow-hidden h-full flex flex-col justify-between group-hover:-translate-y-2 transition-transform duration-500">

        {/* Dekoratif Arka Plan İzi */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#D4AF37]/5 to-transparent"></div>

        <div className="relative z-10 text-center">
          {/* İsim & Unvan */}
          <h3 className="text-xl font-bold text-[#0F172A] font-serif mb-1 group-hover:text-[#D4AF37] transition-colors">
            {fullName}
          </h3>
          <p className="text-[#D4AF37] font-medium text-xs uppercase tracking-widest mb-4">
            {teacher.title || mainBranch}
          </p>

          {/* Puan & Tecrübe Hapları */}
          <div className="flex justify-center gap-3 mb-6">
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
              <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-current" />
              <span className="font-bold text-sm text-[#0F172A]">{teacher.rating?.toFixed(1) || 'N/A'}</span>
            </div>
            {teacher.experience_years && (
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-sm text-[#0F172A]">{teacher.experience_years} Yıl</span>
              </div>
            )}
          </div>
        </div>

        {/* Alt Kısım: Fiyat & Buton */}
        <div className="flex items-center justify-between border-t border-[#D4AF37]/10 pt-4 mt-auto">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Saatlik</p>
            <p className="text-lg font-bold text-[#0F172A] font-serif">
              {teacher.hourly_rate ? `₺${teacher.hourly_rate}` : '-'}
            </p>
          </div>

          {/* MEVCUT LINK YAPISI KORUNDU */}
          <Link href={`/teachers/${teacher.slug}`} className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors shadow-lg">
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default TeacherCard;
