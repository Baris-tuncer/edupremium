'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, GraduationCap, Award, Check } from 'lucide-react';
import { useComparison, ComparisonTeacher } from '@/contexts/ComparisonContext';

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
  enableComparison?: boolean;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, enableComparison = true }) => {
  const comparison = useComparison();
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

  // Karşılaştırma için öğretmen verisi
  const comparisonTeacher: ComparisonTeacher = {
    id: teacher.id,
    name: fullName,
    avatar_url: teacher.image_url,
    rating: teacher.rating,
    experience_years: teacher.experience_years,
    university: teacher.university || null,
    subjects: teacher.branches?.map(b => b.branch?.name || '').filter(Boolean) || [],
    title: teacher.title,
    hourly_rate: teacher.hourly_rate || 0,
    slug: teacher.slug,
  };

  const isSelected = comparison?.isSelected(teacher.id) || false;
  const canAdd = comparison?.canAdd || false;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!comparison) return;

    if (isSelected) {
      comparison.removeTeacher(teacher.id);
    } else if (canAdd) {
      comparison.addTeacher(comparisonTeacher);
    }
  };

  return (
    <div className={`relative bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-[320px] flex flex-col ${isSelected ? 'ring-2 ring-[#D4AF37] ring-offset-2' : ''}`}>

      {/* Karşılaştırma Checkbox */}
      {enableComparison && comparison && (
        <button
          onClick={handleCheckboxClick}
          disabled={!isSelected && !canAdd}
          className={`absolute top-4 right-4 z-20 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0F172A]'
              : canAdd
              ? 'bg-white/90 border-slate-300 hover:border-[#D4AF37] text-transparent hover:text-[#D4AF37]/50'
              : 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-50'
          }`}
          title={isSelected ? 'Karşılaştırmadan Çıkar' : canAdd ? 'Karşılaştırmaya Ekle' : 'Maksimum 3 öğretmen'}
        >
          <Check className="w-4 h-4" />
        </button>
      )}

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
