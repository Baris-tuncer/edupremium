import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Prevent static generation - this route requires runtime env vars
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Supabase client'ı route çağrıldığında oluştur (build time'da değil)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  // Vercel Cron güvenlik kontrolü
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Secret tanımlıysa ve eşleşmiyorsa reddet
    if (process.env.CRON_SECRET) {
      console.error('Unauthorized cron access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const now = new Date().toISOString();
    const results = { expired: 0, errors: [] as string[] };

    // Süresi dolmuş featured öğretmenleri bul
    // is_featured = true VE featured_until < şu an
    const { data: expiredTeachers, error: fetchError } = await supabase
      .from('teacher_profiles')
      .select('id, full_name, featured_until')
      .eq('is_featured', true)
      .lt('featured_until', now);

    if (fetchError) {
      console.error('Error fetching expired featured teachers:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!expiredTeachers || expiredTeachers.length === 0) {
      console.log('No expired featured teachers found');
      return NextResponse.json({
        success: true,
        message: 'No expired featured teachers',
        results
      });
    }

    console.log(`Found ${expiredTeachers.length} expired featured teacher(s)`);

    // Her birini pasife al
    for (const teacher of expiredTeachers) {
      try {
        const { error: updateError } = await supabase
          .from('teacher_profiles')
          .update({
            is_featured: false,
            featured_until: null,
            featured_category: null,
            featured_headline: null,
          })
          .eq('id', teacher.id);

        if (updateError) {
          results.errors.push(`${teacher.id}: ${updateError.message}`);
          console.error(`Failed to update teacher ${teacher.id}:`, updateError);
        } else {
          results.expired++;
          console.log(`Deactivated featured status for: ${teacher.full_name} (${teacher.id})`);
        }
      } catch (err: any) {
        results.errors.push(`${teacher.id}: ${err.message}`);
      }
    }

    console.log('Check featured completed:', results);

    return NextResponse.json({
      success: true,
      message: `Deactivated ${results.expired} expired featured teacher(s)`,
      results,
    });

  } catch (error: any) {
    console.error('Cron check-featured error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
