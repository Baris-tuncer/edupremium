// /api/group-classes/[id]/meeting-token
// Grup dersi için Daily.co meeting token'ı oluşturur

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createTeacherMeetingToken, createStudentMeetingToken } from '@/lib/daily';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id: groupClassId } = await params;

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

    // Sınıf bilgisi
    const { data: groupClass, error: classError } = await supabase
      .from('group_classes')
      .select(`
        *,
        teacher:teacher_id (
          id,
          full_name
        )
      `)
      .eq('id', groupClassId)
      .single();

    if (classError || !groupClass) {
      return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
    }

    // Meeting link kontrolü
    if (!groupClass.meeting_link) {
      return NextResponse.json({
        error: 'Bu sınıf için henüz toplantı linki oluşturulmamış'
      }, { status: 400 });
    }

    // Durum kontrolü
    if (groupClass.status !== 'confirmed') {
      return NextResponse.json({
        error: 'Bu sınıf henüz onaylanmamış veya tamamlanmış'
      }, { status: 400 });
    }

    // Kullanıcı rolünü belirle
    const isTeacher = user.id === groupClass.teacher_id;

    // Öğrenci ise kayıt kontrolü
    if (!isTeacher) {
      const { data: enrollment } = await supabase
        .from('group_class_enrollments')
        .select('id')
        .eq('group_class_id', groupClassId)
        .eq('student_id', user.id)
        .eq('payment_status', 'completed')
        .eq('status', 'enrolled')
        .single();

      if (!enrollment) {
        return NextResponse.json({
          error: 'Bu derse katılma yetkiniz yok'
        }, { status: 403 });
      }
    }

    // Room name'i URL'den çıkar
    const roomName = groupClass.meeting_link.split('/').pop();

    if (!roomName) {
      return NextResponse.json({ error: 'Geçersiz toplantı linki' }, { status: 400 });
    }

    // Kullanıcı adını al
    let userName = 'Katılımcı';

    if (isTeacher) {
      userName = groupClass.teacher.full_name;
    } else {
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (studentProfile) {
        userName = studentProfile.full_name;
      }
    }

    // Token oluştur
    let meetingToken: string | null;

    if (isTeacher) {
      meetingToken = await createTeacherMeetingToken(roomName, userName);
    } else {
      meetingToken = await createStudentMeetingToken(roomName, userName);
    }

    if (!meetingToken) {
      return NextResponse.json({
        error: 'Toplantı token\'ı oluşturulamadı'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      meetingUrl: `${groupClass.meeting_link}?t=${meetingToken}`,
      isTeacher,
      autoRecording: isTeacher, // Sadece öğretmen girişinde kayıt başlar
    });
  } catch (error: any) {
    console.error('Group class meeting token error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
