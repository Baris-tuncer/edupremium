'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

const MAX_COMPARISON = 3;

export interface ComparisonTeacher {
  id: string;
  name: string;
  avatar_url: string | null;
  rating: number | null;
  experience_years: number | null;
  university: string | null;
  subjects: string[];
  title: string | null;
  hourly_rate: number;
  slug: string;
}

interface ComparisonContextValue {
  selectedTeachers: ComparisonTeacher[];
  addTeacher: (teacher: ComparisonTeacher) => void;
  removeTeacher: (teacherId: string) => void;
  clearAll: () => void;
  isSelected: (teacherId: string) => boolean;
  canAdd: boolean;
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selectedTeachers, setSelectedTeachers] = useState<ComparisonTeacher[]>([]);

  const isSelected = (teacherId: string) =>
    selectedTeachers.some(t => t.id === teacherId);

  const addTeacher = (teacher: ComparisonTeacher) => {
    if (selectedTeachers.length < MAX_COMPARISON && !isSelected(teacher.id)) {
      setSelectedTeachers(prev => [...prev, teacher]);
    }
  };

  const removeTeacher = (teacherId: string) => {
    setSelectedTeachers(prev => prev.filter(t => t.id !== teacherId));
  };

  const clearAll = () => setSelectedTeachers([]);

  const canAdd = selectedTeachers.length < MAX_COMPARISON;

  return (
    <ComparisonContext.Provider value={{
      selectedTeachers,
      addTeacher,
      removeTeacher,
      clearAll,
      isSelected,
      canAdd,
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
}
