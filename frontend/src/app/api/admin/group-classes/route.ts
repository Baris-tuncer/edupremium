// /api/admin/group-classes
// Admin: Tüm grup derslerini listeler

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Prevent static generation
export const dynamic = 'force-dynamic';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase();

  try {
    // Tüm grup derslerini al
    const { data: classes, error } = await supabase
      .from('group_classes')
      .select(`
        *,
        teacher:teacher_id (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin group classes fetch error:', error);
      return NextResponse.json({ error: 'Sınıflar yüklenemedi' }, { status: 500 });
    }

    // Her sınıf için kayıtlı öğrenci sayısını ve toplam geliri hesapla
    const classesWithStats = await Promise.all(
      (classes || []).map(async (gc) => {
        const { data: enrollments, count } = await supabase
          .from('group_class_enrollments')
          .select('amount_paid, payment_status, status', { count: 'exact' })
          .eq('group_class_id', gc.id)
          .eq('payment_status', 'completed')
          .eq('status', 'enrolled');

        const totalRevenue = (enrollments || []).reduce((sum, e) => sum + (e.amount_paid || 0), 0);
        const teacherEarnings = (count || 0) * gc.net_price;

        return {
          ...gc,
          enrolled_count: count || 0,
          spots_left: gc.max_capacity - (count || 0),
          total_revenue: totalRevenue,
          teacher_earnings: teacherEarnings,
          platform_earnings: totalRevenue - teacherEarnings,
        };
      })
    );

    // İstatistikler
    const stats = {
      total_classes: classesWithStats.length,
      open_classes: classesWithStats.filter(c => c.status === 'open').length,
      confirmed_classes: classesWithStats.filter(c => c.status === 'confirmed').length,
      completed_classes: classesWithStats.filter(c => c.status === 'completed').length,
      cancelled_classes: classesWithStats.filter(c => c.status === 'cancelled').length,
      total_students: classesWithStats.reduce((sum, c) => sum + c.enrolled_count, 0),
      total_revenue: classesWithStats.reduce((sum, c) => sum + c.total_revenue, 0),
      total_teacher_earnings: classesWithStats.reduce((sum, c) => sum + c.teacher_earnings, 0),
      total_platform_earnings: classesWithStats.reduce((sum, c) => sum + c.platform_earnings, 0),
    };

    return NextResponse.json({
      classes: classesWithStats,
      stats,
    });
  } catch (error: any) {
    console.error('Admin group classes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
