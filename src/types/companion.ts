export type CompanionStage = 'egg' | 'hatchling' | 'little' | 'explorer' | 'guardian' | 'master';

export type CompanionTrait = 'hafiz' | 'tartil' | 'reader' | 'scholar' | 'explorer';

export interface CompanionData {
  childId: string;
  name: string;
  stage: CompanionStage;
  xp: number;
  level: number;
  traits: Record<CompanionTrait, number>;
  roomItems: string[]; // IDs of currently placed decorations in room
  unlockedItems: string[]; // IDs of purchased / unlocked room decorations
  unlockedCards: string[]; // Surah Knowledge Card IDs
  gardenDays: boolean[]; // 7 days of current week (Mon-Sun: [true, false, ...])
  gardenWeekId: string; // e.g. "2026-W40"
  seedsCount: number; // Benih Cahaya collected
  lastActiveDate: string;
  lastPetAt?: string;
  dialogueMessage?: string;
}

export interface StageConfig {
  id: CompanionStage;
  name: string;
  subtitle: string;
  minXp: number;
  maxXp: number;
  avatarIcon: string;
  badgeColor: string;
  storyQuote: string;
  unlockedAbility: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  current: number;
  target: number;
  unit: string;
  completed: boolean;
  xpReward: number;
  starReward: number;
  actionType: 'murojaah' | 'dengar' | 'ziadah' | 'hafalan' | 'iqra' | 'tajwid' | 'vocab' | 'game';
}

export interface RoomDecoration {
  id: string;
  name: string;
  icon: string;
  category: 'plant' | 'furniture' | 'light' | 'special';
  costStars: number;
  unlockRequirement: string;
  unlockedByDefault?: boolean;
}

export interface WorldLand {
  id: string;
  name: string;
  arabicName: string;
  icon: string;
  color: string;
  tagline: string;
  description: string;
  destinationTab: 'tahfiz' | 'alquran';
  destinationSubView?: string;
  levelRequired: number;
}

export interface SurahKnowledgeCard {
  id: string;
  surahNumber: number;
  surahName: string;
  surahArabic: string;
  icon: string;
  ayahCount: number;
  revelationType: 'Makkiyyah' | 'Madaniyyah';
  badgeTitle: string;
  keyWisdom: string;
  moralLesson: string;
}
