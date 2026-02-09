'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const VITRIN_CATEGORIES: Record<string, string> = {
  'ilkokul': 'İlkokul (1-4)',
  'ortaokul': 'Ortaokul (5-8)',
  'lise': 'Lise (9-12)',
  'lgs': 'LGS Hazırlık',
  'tyt-ayt': 'TYT-AYT Hazırlık',
  'yabanci-dil': 'Yabancı Dil',
};

interface CategoryTabsProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative mb-10">
      {/* Sol ok */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#0F172A] border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center rounded-full hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Sağ ok */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#0F172A] border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center rounded-full hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Tab container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-14 py-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Tümü tab */}
        <button
          onClick={() => onChange('all')}
          className={`flex-shrink-0 px-6 py-3 rounded-full font-semibold text-sm transition-all ${
            active === 'all'
              ? 'bg-[#D4AF37] text-[#0F172A] shadow-lg shadow-[#D4AF37]/30'
              : 'bg-[#0F172A]/80 text-white border border-[#D4AF37]/30 hover:border-[#D4AF37]'
          }`}
        >
          Tümünü Gör
        </button>

        {/* Kategori tab'ları */}
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex-shrink-0 px-6 py-3 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
              active === cat
                ? 'bg-[#D4AF37] text-[#0F172A] shadow-lg shadow-[#D4AF37]/30'
                : 'bg-[#0F172A]/80 text-white border border-[#D4AF37]/30 hover:border-[#D4AF37]'
            }`}
          >
            {VITRIN_CATEGORIES[cat] || cat}
          </button>
        ))}
      </div>
    </div>
  );
}
