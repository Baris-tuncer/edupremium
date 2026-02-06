import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import { Award, ArrowRight } from 'lucide-react';

async function getFeaturedTeachers() {
  const supabase = createClient();
  const now = new Date().toISOString();

  // Teacher Profiles tablosundan veriyi çek
  const { data: profiles, error } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('is_verified', true)
    .gte('featured_until', now);

  if (error) {
    console.error('Veri Hatası:', error);
    return [];
  }

  // VERİYİ GARANTİYE ALAN DÖNÜŞÜM (Mapping)
  const mappedTeachers = (profiles || []).map(p => {
    // 1. DERSLERİ BUL (subjects, tags veya lesson_types olabilir)
    let finalSubjects = [];
    if (p.subjects && p.subjects.length > 0) finalSubjects = p.subjects;
    else if (p.tags && p.tags.length > 0) finalSubjects = p.tags;
    else if (p.featured_category) finalSubjects = [p.featured_category];
    else finalSubjects = ['Genel'];

    // 2. FİYATI BUL - Veliye gösterilecek fiyat (hourly_rate_display)
    // Önce hourly_rate_display, yoksa eski alanlardan hesaplama
    const finalPrice = p.hourly_rate_display || p.hourly_rate || p.base_price || p.price || p.rate || 0;

    // 3. ÜNİVERSİTEYİ BUL
    const finalUniversity = p.university || p.school || p.university_name || null;

    return {
      id: p.id,
      user_id: p.user_id,
      name: p.full_name,
      surname: '',
      title: p.featured_headline || p.title || 'Eğitmen',
      biography: p.biography,
      image_url: p.avatar_url,

      // --- FİYAT DÜZELTMESİ ---
      hourly_rate: finalPrice,

      rating: p.rating,
      review_count: p.review_count || 0,
      location: p.location,
      experience_years: p.experience_years,

      // --- BİLGİ DÜZELTMESİ ---
      university: finalUniversity,
      // CategoryShowcase ve TeacherCard için branches formatı
      branches: finalSubjects.map((s: string) => ({ branch: { name: s } })),

      // Kategoriye göre gruplama için
      featured_category: p.featured_category,

      verified: p.is_verified,
      slug: p.slug || p.id,
    };
  });

  return mappedTeachers;
}

const FeaturedTeachers = async () => {
  const teachers = await getFeaturedTeachers();

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
          <h2 className="text-4xl md:text-6xl font-bold text-white font-serif mb-6">Öne Çıkan <span className="text-[#D4AF37]">Eğitmenler</span></h2>
          <p className="text-slate-300 text-lg font-light">Seçkin eğitmenlerimizi branşlarına göre inceleyin.</p>
        </div>

        <CategoryShowcase teachers={teachers} />

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
