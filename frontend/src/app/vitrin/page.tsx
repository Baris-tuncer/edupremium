import { createClient } from '@/utils/supabase/server';
import VitrinClient from '@/components/vitrin/VitrinClient';
import { VitrinTeacher } from '@/contexts/ComparisonContext';
import { Award, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Öne Çıkan Öğretmenler | EduPremium',
  description: 'EduPremium\'un seçkin öğretmenlerini keşfedin ve karşılaştırın.',
};

export const dynamic = 'force-dynamic';

export default async function VitrinPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Sponsorlu öğretmenleri çek
  const { data: teachers, error } = await supabase
    .from('teacher_profiles')
    .select(`
      id,
      full_name,
      avatar_url,
      rating,
      experience_years,
      university,
      subjects,
      featured_headline,
      featured_category,
      hourly_rate_net,
      commission_rate,
      is_verified,
      slug
    `)
    .eq('is_featured', true)
    .eq('is_verified', true)
    .gte('featured_until', now)
    .order('rating', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Vitrin fetch error:', error);
  }

  const vitrinTeachers: VitrinTeacher[] = (teachers || []).map(t => ({
    id: t.id,
    full_name: t.full_name || '',
    avatar_url: t.avatar_url,
    rating: t.rating,
    experience_years: t.experience_years,
    university: t.university,
    subjects: t.subjects || [],
    featured_headline: t.featured_headline,
    featured_category: t.featured_category,
    hourly_rate_net: t.hourly_rate_net,
    commission_rate: t.commission_rate,
    is_verified: t.is_verified || false,
    slug: t.slug,
  }));

  // Benzersiz kategorileri çıkar
  const categories = [...new Set(
    vitrinTeachers
      .map(t => t.featured_category)
      .filter((c): c is string => c !== null && c !== undefined)
  )];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Bölüm */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
        {/* Dekoratif elementler */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-[#D4AF37]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Rozet */}
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 text-[#D4AF37] px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">Premium Vitrin</span>
            </div>

            {/* Başlık */}
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Öne Çıkan{' '}
              <span className="text-[#D4AF37]">Öğretmenler</span>
            </h1>

            {/* Alt başlık */}
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Alanında uzman, deneyimli ve öğrenci memnuniyeti yüksek öğretmenlerimizi keşfedin.
              Karşılaştırarak size en uygun eğitmeni bulun.
            </p>

            {/* İstatistik */}
            <div className="flex items-center justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-sm">{vitrinTeachers.length} Seçkin Öğretmen</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Onaylı Profiller</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alt dalga */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" className="w-full">
            <path
              d="M0 50L60 45.7C120 41 240 33 360 35.3C480 38 600 51 720 55.8C840 61 960 58 1080 51.7C1200 46 1320 36 1380 30.8L1440 26V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </div>

      {/* İçerik */}
      <div className="container mx-auto px-4 py-12">
        {vitrinTeachers.length > 0 ? (
          <VitrinClient teachers={vitrinTeachers} categories={categories} />
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-3">Henüz Öne Çıkan Öğretmen Yok</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Şu anda vitrin sayfasında gösterilecek öğretmen bulunmuyor.
              Lütfen daha sonra tekrar kontrol edin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
