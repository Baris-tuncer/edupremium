// /api/group-classes/[id]/students
// Sınıfa kayıtlı öğrencilerin listesi (sadece öğretmen)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;

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

    // Sınıf bilgisi ve yetki kontrolü
    const { data: groupClass, error: classError } = await supabase
      .from('group_classes')
      .select('teacher_id')
      .eq('id', id)
      .single();

    if (classError || !groupClass) {
      return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
    }

    // Sadece öğretmen görebilir
    if (groupClass.teacher_id !== user.id) {
      return NextResponse.json({
        error: 'Bu sınıfın öğrenci listesini görüntüleme yetkiniz yok'
      }, { status: 403 });
    }

    // Kayıtlı öğrencileri al
    const { data: enrollments, error: enrollError } = await supabase
      .from('group_class_enrollments')
      .select(`
        *,
        student:student_id (
          id,
          full_name,
          email,
          phone,
          profile_photo_url
        )
      `)
      .eq('group_class_id', id)
      .order('created_at', { ascending: true });

    if (enrollError) {
      console.error('Enrollments fetch error:', enrollError);
      return NextResponse.json({ error: 'Öğrenci listesi alınamadı' }, { status: 500 });
    }

    return NextResponse.json({
      enrollments: enrollments || [],
      totalEnrolled: enrollments?.filter(e =>
        e.payment_status === 'completed' && e.status === 'enrolled'
      ).length || 0,
    });
  } catch (error: any) {
    console.error('Students list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
