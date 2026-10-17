import { Achievement } from '../types';

export interface LevelConfig {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  badge: string;
  color: string;
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, title: 'Bintang Pemula', minXp: 0, maxXp: 99, badge: '🌟', color: '#08B9EF' },
  { level: 2, title: 'Penghafal Cilik', minXp: 100, maxXp: 249, badge: '🌱', color: '#81E850' },
  { level: 3, title: 'Penjaga Kalam', minXp: 250, maxXp: 499, badge: '🌿', color: '#B797F6' },
  { level: 4, title: 'Bintang Qur\'an', minXp: 500, maxXp: 999, badge: '💫', color: '#FF946F' },
  { level: 5, title: 'Hafiz Teladan', minXp: 1000, maxXp: 1999, badge: '👑', color: '#FFD83E' },
  { level: 6, title: 'Pecinta Mushaf', minXp: 2000, maxXp: 3499, badge: '💎', color: '#08B9AA' },
  { level: 7, title: 'Duta Mahir Qur\'an', minXp: 3500, maxXp: 99999, badge: '🏆', color: '#164C68' },
];

export function getLevelForXp(xp: number): LevelConfig {
  for (let i = LEVEL_CONFIGS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_CONFIGS[i].minXp) {
      return LEVEL_CONFIGS[i];
    }
  }
  return LEVEL_CONFIGS[0];
}

export const ACHIEVEMENTS_CATALOG: Achievement[] = [
  {
    id: 'hafalan-pertama',
    title: 'Hafalan Pertama',
    description: 'Menghafal blok pertama surah dengan tuntas',
    icon: '✨',
    requiredCount: 1,
    category: 'hafalan',
  },
  {
    id: 'tujuh-hari-belajar',
    title: '7 Hari Belajar',
    description: 'Menjaga streak belajar selama 7 hari berturut-turut',
    icon: '🔥',
    requiredCount: 7,
    category: 'streak',
  },
  {
    id: 'sepuluh-blok-hafal',
    title: '10 Blok Hafal',
    description: 'Menyelesaikan 10 blok hafalan dengan sempurna',
    icon: '📚',
    requiredCount: 10,
    category: 'hafalan',
  },
  {
    id: 'surah-pertama',
    title: 'Surah Pertama',
    description: 'Menghafal 1 surah penuh dari awal sampai akhir',
    icon: '🎉',
    requiredCount: 1,
    category: 'hafalan',
  },
  {
    id: 'seratus-ayat',
    title: '100 Ayat Dilafalkan',
    description: 'Mendengar dan melafalkan 100 ayat Al-Qur\'an',
    icon: '📖',
    requiredCount: 100,
    category: 'hafalan',
  },
  {
    id: 'seribu-bintang',
    title: '1000 Bintang',
    description: 'Mengumpulkan 1000 bintang kebaikan',
    icon: '⭐',
    requiredCount: 1000,
    category: 'stars',
  },
  {
    id: 'iqra-explorer',
    title: 'Iqra Explorer',
    description: 'Menuntaskan seluruh materi huruf hijaiyah dan harakat',
    icon: '🚀',
    category: 'iqra',
    requiredCount: 15,
  },
  {
    id: 'tajwid-master',
    title: 'Tajwid Master',
    description: 'Memahami hukum nun mati, qalqalah, dan makharijul huruf',
    icon: '🎓',
    category: 'tajwid',
    requiredCount: 5,
  },
];

export interface SessionMedalDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';
  sessionsMilestone: number;
  perkReward: { stars: number; xp: number; title: string };
  badgeColor: string;
  glowColor: string;
}

export const SESSION_MEDALS_CATALOG: SessionMedalDefinition[] = [
  {
    id: 'medal-hafiz-cilik-5',
    title: 'Hafiz Cilik',
    description: 'Menyelesaikan 5 sesi latihan hafalan penuh dengan tekun dan disiplin',
    icon: '🏅',
    tier: 'bronze',
    sessionsMilestone: 5,
    perkReward: { stars: 15, xp: 50, title: 'Bonus Medali Perunggu Hafiz Cilik' },
    badgeColor: '#CD7F32',
    glowColor: 'rgba(205, 127, 50, 0.4)',
  },
  {
    id: 'medal-pembaca-tartil-10',
    title: 'Pembaca Tartil',
    description: 'Menyelesaikan 10 sesi hafalan penuh dengan bacaan indah, jelas, dan tartil',
    icon: '🥈',
    tier: 'silver',
    sessionsMilestone: 10,
    perkReward: { stars: 25, xp: 100, title: 'Bonus Medali Perak Pembaca Tartil' },
    badgeColor: '#C0C0C0',
    glowColor: 'rgba(192, 192, 192, 0.5)',
  },
  {
    id: 'medal-bintang-murojaah-15',
    title: 'Bintang Murojaah',
    description: 'Menyelesaikan 15 sesi hafalan penuh serta istiqomah mengulang ayat Al-Qur\'an',
    icon: '🌟',
    tier: 'gold',
    sessionsMilestone: 15,
    perkReward: { stars: 35, xp: 150, title: 'Bonus Medali Emas Bintang Murojaah' },
    badgeColor: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.5)',
  },
  {
    id: 'medal-penjaga-ayat-20',
    title: 'Penjaga Ayat',
    description: 'Menyelesaikan 20 sesi hafalan penuh menjaga kemurnian ayat-ayat suci Allah',
    icon: '🥇',
    tier: 'gold',
    sessionsMilestone: 20,
    perkReward: { stars: 50, xp: 200, title: 'Bonus Medali Emas Penjaga Ayat' },
    badgeColor: '#E6A100',
    glowColor: 'rgba(230, 161, 0, 0.5)',
  },
  {
    id: 'medal-ksatria-mutqin-25',
    title: 'Ksatria Mutqin',
    description: 'Menyelesaikan 25 sesi hafalan penuh hingga bacaan dan ingatan kuat mutqin',
    icon: '👑',
    tier: 'diamond',
    sessionsMilestone: 25,
    perkReward: { stars: 70, xp: 300, title: 'Bonus Medali Berlian Ksatria Mutqin' },
    badgeColor: '#08B9EF',
    glowColor: 'rgba(8, 185, 239, 0.5)',
  },
  {
    id: 'medal-duta-quran-30',
    title: 'Duta Hafiz Qur\'ani',
    description: 'Menyelesaikan 30 sesi hafalan penuh menjadi panutan dan kebanggaan keluarga',
    icon: '💎',
    tier: 'diamond',
    sessionsMilestone: 30,
    perkReward: { stars: 90, xp: 400, title: 'Bonus Medali Berlian Duta Hafiz Qur\'ani' },
    badgeColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.5)',
  },
  {
    id: 'medal-muhaffizh-istiqomah-35',
    title: 'Muhaffizh Istiqomah',
    description: 'Menyelesaikan 35 sesi hafalan penuh membuktikan kesabaran & cinta Al-Qur\'an',
    icon: '🏆',
    tier: 'master',
    sessionsMilestone: 35,
    perkReward: { stars: 120, xp: 500, title: 'Bonus Medali Kehormatan Muhaffizh Istiqomah' },
    badgeColor: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.5)',
  },
  {
    id: 'medal-mahkota-cahaya-40',
    title: 'Mahkota Cahaya',
    description: 'Menyelesaikan 40 sesi hafalan penuh persembahan mahkota cahaya terindah di surga',
    icon: '🏵️',
    tier: 'master',
    sessionsMilestone: 40,
    perkReward: { stars: 150, xp: 750, title: 'Bonus Medali Tertinggi Mahkota Cahaya' },
    badgeColor: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.5)',
  },
];

export function getNextMedalMilestone(currentSessionCount: number): {
  nextMedal: SessionMedalDefinition;
  previousMilestone: number;
  remaining: number;
  progressPercent: number;
} {
  for (const medal of SESSION_MEDALS_CATALOG) {
    if (currentSessionCount < medal.sessionsMilestone) {
      const prev = medal.sessionsMilestone - 5;
      const countInCycle = Math.max(0, currentSessionCount - prev);
      const remaining = medal.sessionsMilestone - currentSessionCount;
      const progressPercent = Math.min(100, Math.round((countInCycle / 5) * 100));
      return { nextMedal: medal, previousMilestone: prev, remaining, progressPercent };
    }
  }

  // If exceeded 40 sessions, generate repeating master tier every 5 sessions
  const nextTarget = Math.ceil((currentSessionCount + 1) / 5) * 5;
  const genericMaster: SessionMedalDefinition = {
    id: `medal-master-${nextTarget}`,
    title: `Bintang Istiqomah Level ${Math.floor(nextTarget / 5)}`,
    description: `Menyelesaikan ${nextTarget} sesi hafalan penuh dengan keteladanan agung`,
    icon: '🌟',
    tier: 'master',
    sessionsMilestone: nextTarget,
    perkReward: { stars: 100, xp: 500, title: `Bonus Medali Sesi ${nextTarget}` },
    badgeColor: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.5)',
  };

  const prev = nextTarget - 5;
  const countInCycle = Math.max(0, currentSessionCount - prev);
  const remaining = nextTarget - currentSessionCount;
  const progressPercent = Math.min(100, Math.round((countInCycle / 5) * 100));
  return { nextMedal: genericMaster, previousMilestone: prev, remaining, progressPercent };
}

