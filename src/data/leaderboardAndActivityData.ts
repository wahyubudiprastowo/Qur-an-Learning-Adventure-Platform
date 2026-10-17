export interface UserActivityItem {
  id: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  gameId: string;
  gameName: string;
  gameIcon: string;
  score: number;
  timeAgoText: string;
  timestamp: number;
  actionText: string;
  isPvp?: boolean;
  pvpOpponent?: string;
  location?: string;
}

export interface LeaderboardPlayerItem {
  rank: number;
  userName: string;
  userAvatar: string;
  userLevel: number;
  score: number;
  trophyCount?: number;
  badgeIcon?: string;
  isCurrentUser?: boolean;
  surahCount?: number;
  streakDays?: number;
  location?: string;
}

export interface DuelLeaderboardItem {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  schoolName: string;
  score: number;
  isBot: boolean;
  isCurrentPlayer: boolean;
  streak: number;
  tierBadge: string;
  status?: 'online' | 'in_match' | 'idle';
  categorySpecialty?: string;
  favoriteSurah?: string;
}

export interface DuelLiveMatch {
  id: string;
  player1Name: string;
  player1Avatar: string;
  player1School: string;
  player2Name: string;
  player2Avatar: string;
  player2School: string;
  winnerName: string;
  scoreDisplay: string;
  category: string;
  timeAgoText: string;
  timestamp: number;
}

export interface DuelStats {
  duelScore: number;
  matchesWon: number;
  matchesLost: number;
  matchesTotal: number;
  winStreak: number;
  highestStreak: number;
  tierBadge: string;
  lastPlayed?: number;
}

export const INITIAL_RECENT_ACTIVITIES: UserActivityItem[] = [
  {
    id: 'act-1',
    userName: 'Aisyah Humaira',
    userAvatar: '👧',
    userLevel: 4,
    gameId: 'missing_word',
    gameName: 'Hujan Kata',
    gameIcon: '🌧️',
    score: 5270,
    timeAgoText: '10 detik yang lalu',
    timestamp: Date.now() - 10000,
    actionText: 'meraih 5270 poin di Hujan Kata Juz Amma',
    location: 'Jakarta Selatan',
  },
  {
    id: 'act-2',
    userName: 'Ahmad Fauzan',
    userAvatar: '👦',
    userLevel: 3,
    gameId: 'continue_ayah',
    gameName: 'Sambung Ayat (PVP Online)',
    gameIcon: '⚔️',
    score: 4800,
    timeAgoText: '25 detik yang lalu',
    timestamp: Date.now() - 25000,
    actionText: 'menang duel Sambung Ayat melawan Rayyan',
    isPvp: true,
    pvpOpponent: 'Rayyan Al-Farizi',
    location: 'Surabaya',
  },
  {
    id: 'act-3',
    userName: 'Fatimah Azzahra',
    userAvatar: '🧕',
    userLevel: 5,
    gameId: 'guess_surah',
    gameName: 'Detektif Surah',
    gameIcon: '💡',
    score: 3960,
    timeAgoText: '1 menit yang lalu',
    timestamp: Date.now() - 60000,
    actionText: 'berhasil menebak 5 Surah Makkiyah beruntun',
    location: 'Bandung',
  },
  {
    id: 'act-4',
    userName: 'Rayyan Al-Farizi',
    userAvatar: '👦',
    userLevel: 2,
    gameId: 'arrange_ayah',
    gameName: 'Susun Ayat',
    gameIcon: '🧩',
    score: 3240,
    timeAgoText: '2 menit yang lalu',
    timestamp: Date.now() - 120000,
    actionText: 'menyusun 7 ayat Surah Al-Mulk dengan sempurna',
    location: 'Yogyakarta',
  },
  {
    id: 'act-5',
    userName: 'Maryam Salsabila',
    userAvatar: '👧',
    userLevel: 6,
    gameId: 'tajwid_class',
    gameName: 'Klasifikasi Tajwid',
    gameIcon: '🏷️',
    score: 4120,
    timeAgoText: '3 menit yang lalu',
    timestamp: Date.now() - 180000,
    actionText: 'lulus tantangan Idgham Bighunnah tanpa salah',
    location: 'Semarang',
  },
  {
    id: 'act-6',
    userName: 'Bilal Ramadhan',
    userAvatar: '🧒',
    userLevel: 3,
    gameId: 'hijaiyah_sound',
    gameName: 'Lebah Ejaan',
    gameIcon: '🐝',
    score: 2890,
    timeAgoText: '4 menit yang lalu',
    timestamp: Date.now() - 240000,
    actionText: 'menebak 10 makhraj huruf Hijaiyah tartil',
    location: 'Medan',
  },
  {
    id: 'act-7',
    userName: 'Kenza Wardani',
    userAvatar: '🌸',
    userLevel: 4,
    gameId: 'arabic_matching',
    gameName: 'Cocokkan Kata & Arti',
    gameIcon: '🎯',
    score: 3450,
    timeAgoText: '5 menit yang lalu',
    timestamp: Date.now() - 300000,
    actionText: 'mencocokkan 12 mufradat Qur\'an kilat',
    location: 'Makassar',
  },
  {
    id: 'act-8',
    userName: 'Zaid Al-Khair',
    userAvatar: '🧒',
    userLevel: 2,
    gameId: 'audio_to_ayah',
    gameName: 'Dengar & Pilih Ayat',
    gameIcon: '🎵',
    score: 2150,
    timeAgoText: '7 menit yang lalu',
    timestamp: Date.now() - 420000,
    actionText: 'mengenali lantunan Surah Ar-Rahman',
    location: 'Malang',
  },
];

export const INITIAL_LEADERBOARD_PLAYERS: LeaderboardPlayerItem[] = [
  {
    rank: 1,
    userName: 'Fatimah Azzahra',
    userAvatar: '🧕',
    userLevel: 6,
    trophyCount: 38,
    badgeIcon: '👑',
    score: 98060,
    surahCount: 28,
    streakDays: 24,
    location: 'Bandung',
  },
  {
    rank: 2,
    userName: 'Ahmad Fauzan',
    userAvatar: '👦',
    userLevel: 5,
    trophyCount: 31,
    badgeIcon: '🥈',
    score: 89390,
    surahCount: 22,
    streakDays: 18,
    location: 'Surabaya',
  },
  {
    rank: 3,
    userName: 'Maryam Salsabila',
    userAvatar: '👧',
    userLevel: 5,
    trophyCount: 27,
    badgeIcon: '🥉',
    score: 84250,
    surahCount: 19,
    streakDays: 15,
    location: 'Semarang',
  },
  {
    rank: 4,
    userName: 'Aisyah Humaira',
    userAvatar: '👧',
    userLevel: 4,
    trophyCount: 21,
    badgeIcon: '⭐',
    score: 80570,
    surahCount: 17,
    streakDays: 12,
    location: 'Jakarta Selatan',
  },
  {
    rank: 5,
    userName: 'Rayyan Al-Farizi',
    userAvatar: '👦',
    userLevel: 4,
    trophyCount: 18,
    badgeIcon: '🔥',
    score: 76890,
    surahCount: 14,
    streakDays: 9,
    location: 'Yogyakarta',
  },
  {
    rank: 6,
    userName: 'Bilal Ramadhan',
    userAvatar: '🧒',
    userLevel: 3,
    trophyCount: 14,
    badgeIcon: '🐝',
    score: 72570,
    surahCount: 12,
    streakDays: 8,
    location: 'Medan',
  },
  {
    rank: 7,
    userName: 'Kenza Wardani',
    userAvatar: '🌸',
    userLevel: 3,
    trophyCount: 11,
    badgeIcon: '🎯',
    score: 68420,
    surahCount: 10,
    streakDays: 7,
    location: 'Makassar',
  },
  {
    rank: 8,
    userName: 'Zaid Al-Khair',
    userAvatar: '🧒',
    userLevel: 2,
    trophyCount: 8,
    badgeIcon: '🎵',
    score: 61200,
    surahCount: 8,
    streakDays: 5,
    location: 'Malang',
  },
  {
    rank: 9,
    userName: 'Hafiz Al-Qurani',
    userAvatar: '👦',
    userLevel: 2,
    trophyCount: 6,
    badgeIcon: '🚀',
    score: 54800,
    surahCount: 6,
    streakDays: 4,
    location: 'Solo',
  },
  {
    rank: 10,
    userName: 'Naila Rahmania',
    userAvatar: '👧',
    userLevel: 2,
    trophyCount: 4,
    badgeIcon: '🌧️',
    score: 49300,
    surahCount: 5,
    streakDays: 3,
    location: 'Palembang',
  },
];

export const INITIAL_LIVE_DUEL_MATCHES: DuelLiveMatch[] = [
  {
    id: 'live-1',
    player1Name: 'Ahmad Fauzan',
    player1Avatar: '👦',
    player1School: 'TPQ Al-Ikhlas Bandung',
    player2Name: 'Zaidan Al-Fatih',
    player2Avatar: '🧒',
    player2School: 'Kuttab Al-Fatih Jakarta',
    winnerName: 'Ahmad Fauzan',
    scoreDisplay: '90 - 70',
    category: 'Sambung Ayat',
    timeAgoText: '15 detik yang lalu',
    timestamp: Date.now() - 15000,
  },
  {
    id: 'live-2',
    player1Name: 'Fatimah Azzahra',
    player1Avatar: '🧕',
    player1School: 'Kuttab Al-Fatih Jakarta',
    player2Name: 'Maryam Salsabila',
    player2Avatar: '👧',
    player2School: 'Rumah Tahfiz Ar-Rahman Jogja',
    winnerName: 'Fatimah Azzahra',
    scoreDisplay: '100 - 80',
    category: 'Hukum Tajwid',
    timeAgoText: '45 detik yang lalu',
    timestamp: Date.now() - 45000,
  },
  {
    id: 'live-3',
    player1Name: 'Kenzi Hafiz',
    player1Avatar: '👦',
    player1School: 'SDIT Insan Kamil Malang',
    player2Name: 'Salwa Al-Husna',
    player2Avatar: '🧕',
    player2School: 'Rumah Qur\'an Semarang',
    winnerName: 'Kenzi Hafiz',
    scoreDisplay: '85 - 65',
    category: 'Tebak Surah',
    timeAgoText: '2 menit yang lalu',
    timestamp: Date.now() - 120000,
  },
  {
    id: 'live-4',
    player1Name: 'Raihan El-Bukhari',
    player1Avatar: '👳',
    player1School: 'Pesantren Cilik Cirebon',
    player2Name: 'Nadia Tartila',
    player2Avatar: '🧕',
    player2School: 'MI Pembangunan Surabaya',
    winnerName: 'Raihan El-Bukhari',
    scoreDisplay: '95 - 75',
    category: 'Arti Kata',
    timeAgoText: '3 menit yang lalu',
    timestamp: Date.now() - 180000,
  },
  {
    id: 'live-5',
    player1Name: 'Aisyah Humaira',
    player1Avatar: '🧕',
    player1School: 'TPQ Baitul Mal Tangerang',
    player2Name: 'Ibrahim As-Suyuthi',
    player2Avatar: '👦',
    player2School: 'TPQ Nurul Huda Medan',
    winnerName: 'Aisyah Humaira',
    scoreDisplay: '100 - 60',
    category: 'Sambung Ayat',
    timeAgoText: '5 menit yang lalu',
    timestamp: Date.now() - 300000,
  },
];
