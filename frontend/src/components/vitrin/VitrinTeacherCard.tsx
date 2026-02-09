'use client';

import Link from 'next/link';
import { useComparison, VitrinTeacher } from '@/contexts/ComparisonContext';
import { Award, Check, Star } from 'lucide-react';

interface VitrinTeacherCardProps {
  teacher: VitrinTeacher;
}

// Fiyat hesaplama (mevcut sistemle uyumlu)
function calculateDisplayPrice(netPrice: number, commissionRate: number): number {
  if (!netPrice || netPrice <= 0) return 0;
  const stopaj = netPrice * 0.20;
  const komisyon = netPrice * (commissionRate || 0.25);
  const araToplam = netPrice + stopaj + komisyon;
  const kdv = araToplam * 0.20;
  const total = araToplam + kdv;
  return Math.round(total / 50) * 50;
}

export default function VitrinTeacherCard({ teacher }: VitrinTeacherCardProps) {
  const { isSelected, addTeacher, removeTeacher, canAdd } = useComparison();
  const selected = isSelected(teacher.id);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selected) {
      removeTeacher(teacher.id);
    } else if (canAdd) {
      addTeacher(teacher);
    }
  };

  const price = calculateDisplayPrice(
    teacher.hourly_rate_net || 0,
    teacher.commission_rate || 0.25
  );

  const initials = teacher.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2) || '??';

  return (
    <div className={`relative group transition-all duration-300 ${selected ? 'ring-2 ring-[#D4AF37] ring-offset-2 rounded-2xl' : ''}`}>
      {/* Karşılaştırma Checkbox */}
      <button
        onClick={handleCheckboxClick}
        disabled={!selected && !canAdd}
        className={`absolute top-4 right-4 z-20 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
          selected
            ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0F172A]'
            : canAdd
            ? 'bg-white/90 border-slate-300 hover:border-[#D4AF37] text-transparent hover:text-[#D4AF37]/50'
            : 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-50'
        }`}
        title={selected ? 'Karşılaştırmadan Çıkar' : canAdd ? 'Karşılaştırmaya Ekle' : 'Maksimum 3 öğretmen'}
      >
        <Check className="w-4 h-4" />
      </button>

      {/* Kart İçeriği */}
      <Link href={`/teachers/${teacher.id}`}>
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          {/* Editörün Seçimi Rozeti */}
          <div className="flex items-center gap-1.5 text-[#D4AF37] mb-4">
            <Award className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Editörün Seçimi</span>
          </div>

          {/* Profil */}
          <div className="flex items-center gap-3 mb-3">
            {teacher.avatar_url ? (
              <img
                src={teacher.avatar_url}
                alt={teacher.full_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37]/30"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center text-white font-bold text-lg">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-[#0F172A] text-base leading-tight truncate">
                {teacher.full_name}
              </h3>
              {teacher.featured_headline && (
                <p className="text-xs text-slate-500 truncate italic mt-0.5">
                  "{teacher.featured_headline}"
                </p>
              )}
            </div>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <p className="font-bold text-[#0F172A] text-sm">{teacher.experience_years || '-'}</p>
              <p className="text-[10px] text-slate-500">Yıl Deneyim</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <p className="font-bold text-[#0F172A] text-xs truncate">
                {teacher.university || (teacher.is_verified ? 'Onaylı' : '-')}
              </p>
              <p className="text-[10px] text-slate-500">{teacher.university ? 'Mezun' : 'Durum'}</p>
            </div>
          </div>

          {/* Dersler */}
          <div className="flex flex-wrap gap-1.5 mb-4 min-h-[28px]">
            {(teacher.subjects || []).slice(0, 2).map((subject, i) => {
              const parts = subject.split(':');
              const displayName = parts.length > 1 ? parts[1] : subject;
              return (
                <span key={i} className="bg-[#0F172A]/5 text-[#0F172A] text-[11px] font-medium px-2.5 py-1 rounded-full">
                  {displayName}
                </span>
              );
            })}
            {(teacher.subjects || []).length > 2 && (
              <span className="text-[11px] text-slate-400 px-1">
                +{teacher.subjects.length - 2}
              </span>
            )}
          </div>

          {/* Fiyat ve CTA */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Saatlik</p>
                <p className="text-lg font-bold text-[#0F172A]">
                  {price > 0 ? `${price.toLocaleString('tr-TR')} TL` : '-'}
                </p>
              </div>
              {teacher.rating && teacher.rating > 0 && (
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-sm text-amber-700">{teacher.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="w-full py-2.5 bg-[#0F172A] text-white text-center text-sm font-semibold rounded-xl group-hover:bg-[#D4AF37] group-hover:text-[#0F172A] transition-colors">
              Profili İncele
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
