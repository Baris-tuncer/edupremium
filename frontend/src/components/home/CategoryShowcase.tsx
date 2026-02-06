'use client';

import React, { useMemo } from 'react';
import TeacherCarousel from '@/components/home/TeacherCarousel';

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
  featured_category?: string | null;
  verified: boolean | null;
  slug: string;
}

// Kategori key -> görünen isim
const CATEGORY_LABELS: Record<string, string> = {
  'ilkokul': 'İlkokul (1-4)',
  'ortaokul': 'Ortaokul (5-8)',
  'lise': 'Lise (9-12)',
  'lgs': 'LGS Hazırlık',
  'tyt-ayt': 'TYT-AYT Hazırlık',
  'yabanci-dil': 'Yabancı Dil',
};

const CategoryShowcase = ({ teachers }: { teachers: Teacher[] }) => {
  const groupedTeachers = useMemo(() => {
    const groups: Record<string, Teacher[]> = {};
    teachers.forEach((teacher) => {
      // featured_category kullan (öğretmenin ödeme yaptığı kategori)
      const categoryKey = teacher.featured_category || 'genel';
      if (!groups[categoryKey]) groups[categoryKey] = [];
      groups[categoryKey].push(teacher);
    });
    return groups;
  }, [teachers]);

  const categories = Object.keys(groupedTeachers);
  if (categories.length === 0) return null;

  return (
    <div className="w-full space-y-20">
      {categories.map((categoryKey) => (
        <div key={categoryKey} className="relative">
          <div className="flex items-center gap-4 mb-8 px-4">
            <div className="h-10 w-1.5 bg-[#D4AF37]"></div>
            <div>
               <h3 className="text-3xl font-bold text-white font-serif tracking-tight">
                 {CATEGORY_LABELS[categoryKey] || categoryKey}
               </h3>
               <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-medium opacity-80">Özel Koleksiyon</p>
            </div>
            <div className="h-px bg-white/10 flex-grow ml-4"></div>
          </div>
          <TeacherCarousel teachers={groupedTeachers[categoryKey]} />
        </div>
      ))}
    </div>
  );
};
export default CategoryShowcase;
