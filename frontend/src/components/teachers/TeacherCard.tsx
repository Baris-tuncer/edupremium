import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, GraduationCap, Award } from 'lucide-react';

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
  university?: string | null;
}

interface TeacherCardProps {
  teacher: Teacher;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher }) => {
  const fullName = `${teacher.name || ''} ${teacher.surname || ''}`.trim() || 'İsimsiz Eğitmen';

  // İsim baş harfleri
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Ders etiketlerini çıkar (ilk 2)
  const subjectTags = teacher.branches
    ?.map(b => {
      const name = b.branch?.name || '';
      const parts = name.split(':');
      return parts.length > 1 ? parts[1] : name;
    })
    .filter(Boolean)
    .slice(0, 2) || [];

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-[320px] flex flex-col">

      {/* Editörün Seçimi Badge */}
      <div className="flex items-center gap-1.5 text-[#D4AF37] mb-4">
        <Award className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Editörün Seçimi</span>
      </div>

      {/* Avatar ve İsim */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-shrink-0">
          {teacher.image_url ? (
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#D4AF37]/30">
              <img
                src={teacher.image_url}
                alt={fullName}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#0F172A] flex items-center justify-center border-2 border-[#D4AF37]/30">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
          )}
          {teacher.verified && (
            <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-[#0F172A] p-1 rounded-full">
              <ShieldCheck className="w-3 h-3" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-[#0F172A] text-base leading-tight truncate">{fullName}</h3>
          <p className="text-[#D4AF37] text-[11px] font-semibold uppercase tracking-wide truncate">
            {teacher.title || 'Eğitmen'}
          </p>
        </div>
      </div>

      {/* Deneyim ve Üniversite */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5">
            <Clock className="w-3 h-3" />
          </div>
          <p className="font-bold text-[#0F172A] text-sm">
            {teacher.experience_years || '-'}
          </p>
          <p className="text-[10px] text-slate-500">Yıl Deneyim</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5">
            <GraduationCap className="w-3 h-3" />
          </div>
          <p className="font-bold text-[#0F172A] text-xs truncate">
            {teacher.university || '-'}
          </p>
          <p className="text-[10px] text-slate-500">Mezun</p>
        </div>
      </div>

      {/* Ders Etiketleri */}
      {subjectTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {subjectTags.map((tag, i) => (
            <span key={i} className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Alt Kısım: Fiyat ve Buton */}
      <div className="mt-auto pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-slate-400 uppercase">Saatlik</p>
            <p className="text-lg font-bold text-[#0F172A]">
              {teacher.hourly_rate ? `₺${teacher.hourly_rate.toLocaleString('tr-TR')}` : '-'}
            </p>
            {teacher.hourly_rate && <p className="text-[9px] text-slate-400">(KDV Dahil)</p>}
          </div>
        </div>
        <Link
          href={`/teachers/${teacher.slug}`}
          className="block w-full py-2.5 bg-[#0F172A] text-white text-center text-sm font-semibold rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-colors"
        >
          Profili İncele
        </Link>
      </div>
    </div>
  );
};

export default TeacherCard;
