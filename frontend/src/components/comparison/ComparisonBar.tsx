'use client';

import { useComparison } from '@/contexts/ComparisonContext';
import { X, GitCompare } from 'lucide-react';

interface ComparisonBarProps {
  onCompare: () => void;
}

export default function ComparisonBar({ onCompare }: ComparisonBarProps) {
  const { selectedTeachers, removeTeacher, clearAll } = useComparison();

  if (selectedTeachers.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#0F172A]/95 backdrop-blur-xl border-t border-[#D4AF37]/30 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Seçili öğretmenler */}
            <div className="flex items-center gap-3 flex-1 overflow-x-auto">
              <span className="text-white/60 text-sm whitespace-nowrap flex-shrink-0">
                Karşılaştır ({selectedTeachers.length}/3):
              </span>

              {selectedTeachers.map(teacher => (
                <div
                  key={teacher.id}
                  className="flex items-center gap-2 bg-white/10 rounded-full pl-1 pr-3 py-1 flex-shrink-0"
                >
                  {teacher.avatar_url ? (
                    <img
                      src={teacher.avatar_url}
                      alt={teacher.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0F172A] text-xs font-bold">
                      {teacher.name?.charAt(0)}
                    </div>
                  )}
                  <span className="text-white text-sm font-medium truncate max-w-[100px]">
                    {teacher.name?.split(' ')[0]}
                  </span>
                  <button
                    onClick={() => removeTeacher(teacher.id)}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Aksiyon butonları */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={clearAll}
                className="text-white/60 hover:text-white text-sm font-medium transition-colors"
              >
                Temizle
              </button>

              <button
                onClick={onCompare}
                disabled={selectedTeachers.length < 2}
                className="flex items-center gap-2 bg-[#D4AF37] text-[#0F172A] px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GitCompare className="w-4 h-4" />
                Karşılaştır
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
