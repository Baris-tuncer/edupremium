import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createTeacherMeetingToken, createStudentMeetingToken } from '@/lib/daily';

export async function POST(request: Request) {
  try {
    const { lessonId } = await request.json();

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId gerekli' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Kullanıcıyı kontrol et
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    // Dersi getir
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      console.error('Lesson fetch error:', lessonError);
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
    }

    // Öğretmen ve öğrenci isimlerini ayrı sorgula
    let teacherName = 'Öğretmen';
    let studentName = 'Öğrenci';

    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('full_name')
      .eq('id', lesson.teacher_id)
      .single();
    if (teacherProfile) teacherName = teacherProfile.full_name;

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('full_name')
      .eq('id', lesson.student_id)
      .single();
    if (studentProfile) studentName = studentProfile.full_name;

    // Meeting link'ten room name çıkar
    if (!lesson.meeting_link) {
      return NextResponse.json({ error: 'Bu dersin video linki yok' }, { status: 400 });
    }

    const roomName = lesson.meeting_link.split('/').pop();
    if (!roomName) {
      return NextResponse.json({ error: 'Geçersiz video linki' }, { status: 400 });
    }

    // Kullanıcının bu derse katılma yetkisi var mı kontrol et
    const isTeacher = user.id === lesson.teacher_id;
    const isStudent = user.id === lesson.student_id;

    if (!isTeacher && !isStudent) {
      return NextResponse.json({ error: 'Bu derse katılma yetkiniz yok' }, { status: 403 });
    }

    // Role'e göre token oluştur
    let token: string | null;
    if (isTeacher) {
      token = await createTeacherMeetingToken(roomName, teacherName);
    } else {
      token = await createStudentMeetingToken(roomName, studentName);
    }

    if (!token) {
      return NextResponse.json({ error: 'Token oluşturulamadı' }, { status: 500 });
    }

    // Token'lı URL döndür
    const meetingUrl = `${lesson.meeting_link}?t=${token}`;

    return NextResponse.json({
      success: true,
      meetingUrl,
      role: isTeacher ? 'teacher' : 'student',
      autoRecording: isTeacher // Öğretmen girince kayıt başlar
    });
  } catch (error: any) {
    console.error('Meeting token error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
