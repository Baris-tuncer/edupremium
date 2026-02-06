'use client';

import React, { useRef } from 'react';
import TeacherCard from '@/components/teachers/TeacherCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const TeacherCarousel = ({ teachers }: { teachers: Teacher[] }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (teachers.length === 0) return null;

  return (
    <div className="relative w-full px-14">
      {/* Sol Ok - Her zaman görünür */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-[#0F172A] border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center rounded-full hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all duration-300 shadow-xl"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Sağ Ok - Her zaman görünür */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-[#0F172A] border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center rounded-full hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all duration-300 shadow-xl"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Kart Listesi */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto py-4 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {teachers.map((teacher) => (
          <div key={teacher.id} className="flex-shrink-0">
            <TeacherCard teacher={teacher} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherCarousel;
