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
