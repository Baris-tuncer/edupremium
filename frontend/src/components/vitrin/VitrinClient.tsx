'use client';

import { useState } from 'react';
import { ComparisonProvider, VitrinTeacher } from '@/contexts/ComparisonContext';
import CategoryTabs from './CategoryTabs';
import VitrinTeacherCard from './VitrinTeacherCard';
import ComparisonBar from './ComparisonBar';
import ComparisonModal from './ComparisonModal';

interface VitrinClientProps {
  teachers: VitrinTeacher[];
  categories: string[];
}

export default function VitrinClient({ teachers, categories }: VitrinClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showComparison, setShowComparison] = useState(false);

  const filteredTeachers = activeCategory === 'all'
    ? teachers
    : teachers.filter(t => t.featured_category === activeCategory);

  return (
    <ComparisonProvider>
      {/* Kategori Tab'ları */}
      <CategoryTabs
        categories={categories}
        active={activeCategory}
        onChange={setActiveCategory}
      />

      {/* Öğretmen Kartları */}
      {filteredTeachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {filteredTeachers.map(teacher => (
            <VitrinTeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Bu kategoride öğretmen bulunamadı</h3>
          <p className="text-slate-500">Farklı bir kategori seçerek devam edebilirsiniz.</p>
        </div>
      )}

      {/* Karşılaştırma Bar */}
      <ComparisonBar onCompare={() => setShowComparison(true)} />

      {/* Karşılaştırma Modal */}
      {showComparison && (
        <ComparisonModal onClose={() => setShowComparison(false)} />
      )}
    </ComparisonProvider>
  );
}
