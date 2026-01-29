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
