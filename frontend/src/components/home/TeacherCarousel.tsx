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

  return (
    <div className="relative group/carousel w-full">
      <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-[#0F172A] border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center rounded-full hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all duration-300 -ml-4 opacity-0 group-hover/carousel:opacity-100 shadow-xl"><ChevronLeft className="w-6 h-6" /></button>
      <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-[#0F172A] border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center rounded-full hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all duration-300 -mr-4 opacity-0 group-hover/carousel:opacity-100 shadow-xl"><ChevronRight className="w-6 h-6" /></button>
      <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto py-4 px-4 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {teachers.map((teacher) => (
          <div key={teacher.id} className="flex-shrink-0 snap-start">
            <TeacherCard teacher={teacher} />
          </div>
        ))}
      </div>
    </div>
  );
};
export default TeacherCarousel;
