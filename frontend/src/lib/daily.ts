const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_DOMAIN = 'edupremium.daily.co';

export async function createDailyRoom(lessonId: string): Promise<string | null> {
  try {
    const roomName = `ders-${lessonId.slice(0, 8)}`;

    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          exp: Math.floor(Date.now() / 1000) + 86400, // 24 saat geçerli
          enable_chat: true,
          enable_screenshare: true,
          enable_knocking: false,
          start_video_off: false,
          start_audio_off: false,
          lang: 'tr',
          enable_recording: 'cloud', // Cloud recording aktif
        },
      }),
    });

    if (!response.ok) {
      console.error('Daily.co room creation failed:', await response.text());
      return null;
    }

    const data = await response.json();
    return `https://${DAILY_DOMAIN}/${data.name}`;
  } catch (error) {
    console.error('Daily.co error:', error);
    return null;
  }
}

// Öğretmen için otomatik kayıt başlatan meeting token oluştur
export async function createTeacherMeetingToken(roomName: string, teacherName: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          start_cloud_recording: true, // Öğretmen girince kayıt otomatik başlar
          user_name: teacherName,
          exp: Math.floor(Date.now() / 1000) + 86400, // 24 saat geçerli
        },
      }),
    });

    if (!response.ok) {
      console.error('Daily.co token creation failed:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Daily.co token error:', error);
    return null;
  }
}

// Öğrenci için normal meeting token oluştur (kayıt başlatma yetkisi yok)
export async function createStudentMeetingToken(roomName: string, studentName: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: studentName,
          exp: Math.floor(Date.now() / 1000) + 86400,
        },
      }),
    });

    if (!response.ok) {
      console.error('Daily.co token creation failed:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Daily.co token error:', error);
    return null;
  }
}

// Kayıtları getir (admin için)
export async function getRoomRecordings(roomName: string): Promise<any[]> {
  try {
    const response = await fetch(`https://api.daily.co/v1/recordings?room_name=${roomName}`, {
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to get recordings:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Get recordings error:', error);
    return [];
  }
}

// Kayıt linkini al (indirme için)
export async function getRecordingAccessLink(recordingId: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.daily.co/v1/recordings/${recordingId}/access-link`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to get recording link:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.download_link || null;
  } catch (error) {
    console.error('Get recording link error:', error);
    return null;
  }
}
