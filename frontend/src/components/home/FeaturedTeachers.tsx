'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import TeacherCard from '@/components/teachers/TeacherCard';
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
        const { data } = await supabase
          .from('teachers')
          .select(`
            id, user_id, name, surname, title, biography, image_url, hourly_rate, rating, review_count, location, experience_years, verified, slug,
            branches:teacher_branches(branch:branches(name))
          `)
          .eq('is_featured', true)
          .order('rating', { ascending: false })
          .limit(4);
        setTeachers(data || []);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <section className="relative py-24 overflow-hidden">

      {/* --- YENİ ARKA PLAN (Kütüphane + Koyu Perde) --- */}
      <div className="absolute inset-0 z-0">
        {/* Landing Page Görseli */}
        <div
           className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
           style={{ backgroundImage: `url('/hero-library.jpg')` }}
        />
        {/* Lacivert Filtre (Kartlar patlasın diye) */}
        <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-[2px]"></div>
        {/* Altın Parıltı */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.15),_transparent_70%)]"></div>
      </div>
      {/* ------------------------------------------------ */}

      <div className="container mx-auto px-4 relative z-10">

        {/* Başlık */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-6 bg-[#D4AF37]/5 backdrop-blur-sm">
            <Award className="w-4 h-4" /> Editörün Seçimi
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white font-serif mb-6 leading-tight">
            Seçkin <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#FDFBF7]">Eğitmenler</span>
          </h2>
          <p className="text-slate-300 text-lg font-light max-w-2xl mx-auto">
            Alanında uzman, titizlikle seçilmiş ve öğrenci başarısını kanıtlamış eğitmenlerimiz.
          </p>
        </div>

        {/* Kartlar Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : teachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">Yakında seçkin eğitmenlerimiz burada yer alacak.</p>
          </div>
        )}

        {/* Alt Buton */}
        <div className="text-center mt-16">
          <Link
            href="/teachers"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#D4AF37] text-[#0F172A] font-bold rounded-full hover:bg-white transition-colors shadow-xl"
          >
            Tüm Eğitmenleri Gör
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturedTeachers;
