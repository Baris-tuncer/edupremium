// EduPremium - Ders Kategorileri ve Seviyeleri

export const EDUCATION_LEVELS = {
  ilkokul: {
    label: 'İlkokul (1-4)',
    subjects: [
      'Türkçe',
      'Matematik',
      'Fen Bilimleri',
      'Sosyal Bilgiler',
      'Din Kültürü ve Ahlak Bilgisi',
      'İngilizce',
    ],
  },
  ortaokul: {
    label: 'Ortaokul (5-8)',
    subjects: [
      'Matematik',
      'Türkçe',
      'Fen Bilimleri',
      'Sosyal Bilgiler',
      'Din Kültürü',
      'İngilizce',
    ],
  },
  lise: {
    label: 'Lise (9-12)',
    subjects: [
      'Türk Dili ve Edebiyatı',
      'Matematik',
      'Fizik',
      'Kimya',
      'Biyoloji',
      'Coğrafya',
      'Tarih',
      'Geometri',
      'Din Kültürü',
    ],
  },
  yabanci_dil: {
    label: 'Yabancı Dil',
    subjects: [
      'İngilizce',
      'Almanca',
      'Fransızca',
      'İspanyolca',
      'Rusça',
      'İtalyanca',
      'Arapça',
      'Flamenkçe',
      'Portekizce',
    ],
  },
  sinav_hazirlik: {
    label: 'Sınav Hazırlık',
    subjects: [
      'TYT',
      'AYT (Sayısal)',
      'AYT (Eşit Ağırlık)',
      'AYT (Sözel)',
      'AYT (Dil)',
      'LGS',
    ],
  },
  dil_sinavlari: {
    label: 'Dil Sınavları',
    subjects: [
      'TOEFL',
      'IELTS',
      'YDS',
      'YÖKDİL',
    ],
  },
} as const;

export type LevelKey = keyof typeof EDUCATION_LEVELS;

export function parseSubject(subject: string): { level: string; name: string } | null {
  const parts = subject.split(':');
  if (parts.length !== 2) return null;
  return { level: parts[0], name: parts[1] };
}

export function formatSubject(level: string, name: string): string {
  return level + ':' + name;
}

export function getSubjectsByLevel(subjects: string[], level: string): string[] {
  const prefix = level + ':';
  return subjects
    .filter(function(s) { return s.startsWith(prefix); })
    .map(function(s) { return s.split(':')[1]; });
}

export function getLevelsFromSubjects(subjects: string[]): string[] {
  const levels = new Set<string>();
  subjects.forEach(function(s) {
    const parsed = parseSubject(s);
    if (parsed) levels.add(parsed.level);
  });
  return Array.from(levels);
}

export function getDisplayName(subject: string): string {
  const parsed = parseSubject(subject);
  if (!parsed) return subject;
  
  const levelData = EDUCATION_LEVELS[parsed.level as LevelKey];
  if (!levelData) return subject;
  
  return parsed.name + ' (' + levelData.label + ')';
}

export const LEVEL_KEYS = Object.keys(EDUCATION_LEVELS) as LevelKey[];
