'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import { Award, ArrowRight } from 'lucide-react';

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

const FeaturedTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data, error } = await supabase
          .from('teachers')
          .select(`
            id, user_id, name, surname, title, biography, image_url, hourly_rate, rating, review_count, location, experience_years, verified, slug,
            branches:teacher_branches(branch:branches(name))
          `)
          .eq('is_featured', true)
          .order('rating', { ascending: false });

        if (error) { console.error('Error:', error); return; }
        setTeachers(data || []);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  if (!loading && teachers.length === 0) return null;

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: `url('/hero-library.jpg')` }} />
        <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-[2px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-6 bg-[#D4AF37]/5 backdrop-blur-sm">
            <Award className="w-4 h-4" /> Özel Koleksiyon
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white font-serif mb-6">Akademik <span className="text-[#D4AF37]">Kadro</span></h2>
          <p className="text-slate-300 text-lg font-light">Branşlara göre en iyi eğitmenlerimizi keşfedin.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <CategoryShowcase teachers={teachers} />
        )}

        <div className="text-center mt-24">
          <Link href="/teachers" className="inline-flex items-center gap-3 px-10 py-5 bg-[#D4AF37] text-[#0F172A] hover:bg-white transition-all duration-300 rounded-none text-sm font-bold uppercase tracking-widest shadow-lg">
            Tüm Kadroyu İncele <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
export default FeaturedTeachers;
