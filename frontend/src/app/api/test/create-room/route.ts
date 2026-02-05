import { NextResponse } from 'next/server';
import { createDailyRoom } from '@/lib/daily';

// TEST ENDPOINT - Sadece geliştirme amaçlı
// Gerçek bir Daily.co odası oluşturur ve meeting_link döner
export async function POST(request: Request) {
  try {
    const { lessonId } = await request.json();

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId gerekli' }, { status: 400 });
    }

    const meetingLink = await createDailyRoom(lessonId);

    if (!meetingLink) {
      return NextResponse.json({ error: 'Daily.co odası oluşturulamadı' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      meetingLink,
      message: 'Daily.co odası başarıyla oluşturuldu'
    });
  } catch (error: any) {
    console.error('Test room creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
