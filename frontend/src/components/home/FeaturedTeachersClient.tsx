'use client';

import { useState } from 'react';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import ComparisonBar from '@/components/comparison/ComparisonBar';
import ComparisonModal from '@/components/comparison/ComparisonModal';

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
  university?: string | null;
}

interface FeaturedTeachersClientProps {
  teachers: Teacher[];
}

export default function FeaturedTeachersClient({ teachers }: FeaturedTeachersClientProps) {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <ComparisonProvider>
      <CategoryShowcase teachers={teachers} />

      <ComparisonBar onCompare={() => setShowComparison(true)} />

      {showComparison && (
        <ComparisonModal onClose={() => setShowComparison(false)} />
      )}
    </ComparisonProvider>
  );
}
