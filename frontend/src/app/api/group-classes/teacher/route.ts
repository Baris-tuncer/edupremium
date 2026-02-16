// /api/group-classes/teacher
// Öğretmenin kendi grup derslerini listeler

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase();

  try {
    // Auth kontrolü
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Geçersiz oturum' }, { status: 401 });
    }

    // Öğretmenin sınıflarını al
    const { data: classes, error } = await supabase
      .from('group_classes')
      .select('*')
      .eq('teacher_id', user.id)
      .order('scheduled_at', { ascending: false });

    if (error) {
      console.error('Teacher classes fetch error:', error);
      return NextResponse.json({ error: 'Sınıflar yüklenemedi' }, { status: 500 });
    }

    // Her sınıf için kayıtlı öğrenci sayısını hesapla
    const classesWithCount = await Promise.all(
      (classes || []).map(async (gc) => {
        const { count } = await supabase
          .from('group_class_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('group_class_id', gc.id)
          .eq('payment_status', 'completed')
          .eq('status', 'enrolled');

        // Toplam kazanç hesapla
        const earnings = (count || 0) * gc.net_price;

        return {
          ...gc,
          enrolled_count: count || 0,
          spots_left: gc.max_capacity - (count || 0),
          total_earnings: earnings,
        };
      })
    );

    // İstatistikler
    const stats = {
      total_classes: classesWithCount.length,
      open_classes: classesWithCount.filter(c => c.status === 'open').length,
      confirmed_classes: classesWithCount.filter(c => c.status === 'confirmed').length,
      completed_classes: classesWithCount.filter(c => c.status === 'completed').length,
      total_students: classesWithCount.reduce((sum, c) => sum + c.enrolled_count, 0),
      total_earnings: classesWithCount.reduce((sum, c) => sum + c.total_earnings, 0),
    };

    return NextResponse.json({
      classes: classesWithCount,
      stats,
    });
  } catch (error: any) {
    console.error('Teacher classes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
