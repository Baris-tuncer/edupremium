import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import { Award, ArrowRight } from 'lucide-react';

async function getFeaturedTeachers() {
  const supabase = createClient();
  const now = new Date().toISOString();

  // 1. ESKİ (ÇALIŞAN) TABLODAN VERİYİ ÇEKİYORUZ
  const { data: profiles, error } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('is_verified', true)
    // Eğer featured_until sütunu varsa süresi dolanları gizle
    // Yoksa bu satırı silebilirsin: .gte('featured_until', now);
    .gte('featured_until', now);

  if (error) {
    console.error('Veri Hatası:', error);
    return [];
  }

  // 2. ESKİ VERİYİ YENİ KARTA UYUMLU HALE GETİRİYORUZ
  const mappedTeachers = (profiles || []).map(p => {

    // Konu Etiketlerini (Matematik, Fizik) Ayarla
    let displayBranches = [];
    if (p.subjects && Array.isArray(p.subjects) && p.subjects.length > 0) {
      // Eski tablodaki 'subjects' dizisini al
      displayBranches = p.subjects.map((s: string) => ({ branch: { name: s } }));
    } else {
      // Yoksa kategoriyi kullan
      displayBranches = [{ branch: { name: p.featured_category || 'Genel' } }];
    }

    return {
      id: p.id,
      user_id: p.user_id,
      name: p.full_name, // İsim
      surname: '',
      // KARTTAKİ TURUNCU SÖZ (HEADLINE) BURAYA GELİYOR
      title: p.featured_headline || 'Eğitmen',
      biography: p.biography,
      image_url: p.avatar_url,
      hourly_rate: p.hourly_rate,
      rating: p.rating,
      review_count: p.review_count || 0,
      location: p.location,
      experience_years: p.experience_years, // Deneyim Yılı

      // --- ESKİ KARTTAKİ KRİTİK BİLGİLER ---
      university: p.university, // Üniversite Bilgisi
      branches: displayBranches, // Ders Etiketleri (Matematik, Fizik...)
      // ------------------------------------

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
          <h2 className="text-4xl md:text-6xl font-bold text-white font-serif mb-6">Akademik <span className="text-[#D4AF37]">Kadro</span></h2>
          <p className="text-slate-300 text-lg font-light">Seçkin eğitmenlerimizi branşlarına göre inceleyin.</p>
        </div>

        {/* KATEGORİLİ GÖSTERİM (NETFLIX MODELİ) */}
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
