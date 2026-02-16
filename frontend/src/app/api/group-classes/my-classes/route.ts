// /api/group-classes/my-classes
// Öğrencinin kayıtlı olduğu grup derslerini listeler

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

    // Öğrencinin kayıtlarını al
    const { data: enrollments, error } = await supabase
      .from('group_class_enrollments')
      .select(`
        *,
        group_class:group_class_id (
          *,
          teacher:teacher_id (
            id,
            full_name,
            profile_photo_url
          )
        )
      `)
      .eq('student_id', user.id)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('My classes fetch error:', error);
      return NextResponse.json({ error: 'Dersler yüklenemedi' }, { status: 500 });
    }

    // Aktif ve geçmiş dersler olarak ayır
    const now = new Date();
    const activeClasses = (enrollments || []).filter(e =>
      e.status === 'enrolled' &&
      new Date(e.group_class.scheduled_at) > now &&
      e.group_class.status !== 'cancelled'
    );

    const pastClasses = (enrollments || []).filter(e =>
      e.status !== 'enrolled' ||
      new Date(e.group_class.scheduled_at) <= now ||
      e.group_class.status === 'cancelled'
    );

    return NextResponse.json({
      activeClasses,
      pastClasses,
      totalEnrolled: activeClasses.length,
    });
  } catch (error: any) {
    console.error('My classes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
