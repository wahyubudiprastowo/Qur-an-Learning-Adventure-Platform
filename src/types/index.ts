export type NavigationTab = 'beranda' | 'tahfiz' | 'alquran' | 'game' | 'akun';

export type LearningLevel = 'pemula' | 'menengah' | 'mahir';

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  birthYear?: number;
  learningLevel: LearningLevel;
  totalStars: number;
  totalXp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export type PlanTier = 'free' | 'pro';

export interface UserAccount {
  id: string;
  email: string;
  parentName: string;
  whatsapp?: string;
  targetGoal?: string;
  activeChildId: string;
  pin: string;
  entitlement: 'trial' | 'active' | 'lifetime' | 'free' | 'pro';
  planTier: PlanTier;
  entitlementExpiry: string;
  createdAt: string;
  isRegistered?: boolean;
}

export type BlockState = 'NOT_STARTED' | 'LEARNING' | 'MEMORIZED' | 'REVIEW_REQUIRED';

export interface MemorizationBlock {
  id: string;
  surahNumber: number;
  blockNumber: number;
  startAyah: number;
  endAyah: number;
  name: string;
}

export interface ChildBlockProgress {
  id: string;
  childId: string;
  surahNumber: number;
  blockNumber: number;
  state: BlockState;
  repeatCount: number;
  lastPracticedAt: string;
  memorizedAt?: string;
}

export interface ChildAyahProgress {
  childId: string;
  surahNumber: number;
  ayahNumber: number;
  memorized: boolean;
  score: number;
  lastTestedAt: string;
  needsReview: boolean;
}

export interface WordToken {
  index: number;
  arabic: string;
  transliteration: string;
  translation: string;
  startMs: number;
  endMs: number;
}

export interface AyahData {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationId: string;
  transliteration?: string;
  juz: number;
  page: number;
  audioUrl?: string;
  words?: WordToken[];
}

export interface SurahMetadata {
  number: number;
  nameArabic: string;
  nameLatin: string;
  translation: string;
  revelationType: 'Makkiyyah' | 'Madaniyyah';
  ayahCount: number;
  juzNumber: number;
  blocksCount: number;
}

export interface Reciter {
  id: string;
  name: string;
  subname: string;
  identifier: string; // EveryAyah folder name
  default?: boolean;
}

export interface PracticeSessionItem {
  id: string;
  surahNumber: number;
  blockNumber: number;
  ayahNumber: number;
  mode: 'dengar' | 'ziadah' | 'murojaah' | 'hafalan';
  completed: boolean;
  timestamp: string;
}

export interface AyahRecording {
  id: string;
  childId: string;
  surahNumber: number;
  ayahNumber: number;
  audioBlobUrl: string;
  durationSeconds: number;
  referenceDurationSeconds: number;
  score: number;
  timingScore: number;
  wordCoverageScore: number;
  fluencyScore: number;
  missingWords: string[];
  extraWords: string[];
  assistanceUsed: ('play_ayah' | 'lihat_ayah' | 'play_awalan' | 'lihat_awalan')[];
  createdAt: string;
  needsReview: boolean;
}

export type PointsEventType =
  | 'PRACTICE_AYAH'
  | 'COMPLETE_BLOCK'
  | 'MEMORIZE_BLOCK'
  | 'COMPLETE_SURAH'
  | 'MUROJAAH'
  | 'HAFALAN_TEST'
  | 'IQRA_LESSON'
  | 'TAJWID_LESSON'
  | 'VOCABULARY'
  | 'GAME';

export interface PointsLedgerEntry {
  id: string;
  childId: string;
  eventType: PointsEventType;
  points: number;
  stars: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredCount: number;
  category: 'hafalan' | 'streak' | 'iqra' | 'tajwid' | 'game' | 'stars';
}

export interface IqraItem {
  id: string;
  jilid: 'A' | '1' | '2' | '3' | '4';
  title: string;
  arabic: string;
  latin: string;
  harakat: string;
  soundExample: string;
  description: string;
}

export interface TajwidTopic {
  id: string;
  category: 'Nun Mati & Tanwin' | 'Mim Mati' | 'Mad' | 'Qalqalah' | 'Makharijul Huruf';
  name: string;
  arabicName: string;
  meaning: string;
  explanation: string;
  letters: string[];
  examples: {
    surahName: string;
    ayahNumber: number;
    arabicText: string;
    highlight: string;
    explanation: string;
  }[];
  quiz: {
    question: string;
    arabicText?: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface AsbabNuzulStory {
  id: string;
  title: string;
  type: 'Kisah di Balik Surah' | 'Sebab Turunnya Ayat';
  surahNumber: number;
  surahName: string;
  relatedAyahRange: string;
  icon: string;
  summary: string;
  story: string;
  moralLesson: string;
  reference: string;
}

export interface QuranVocabularyItem {
  id: string;
  arabic: string;
  transliteration: string;
  meaningId: string;
  rootWord: string;
  occurrencesInQuran: number;
  sampleAyah: {
    surahNumber: number;
    ayahNumber: number;
    surahName: string;
    arabicSnippet: string;
    translationSnippet: string;
  };
}
