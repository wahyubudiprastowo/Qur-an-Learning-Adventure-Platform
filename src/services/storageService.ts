import {
  ChildProfile,
  UserAccount,
  ChildBlockProgress,
  ChildAyahProgress,
  PointsLedgerEntry,
  AyahRecording,
  PracticeSessionItem,
  PointsEventType,
} from '../types';
import { getLevelForXp } from '../data/levelsAndAchievements';

const STORAGE_KEYS = {
  USER_ACCOUNT: 'cahaya_tahfiz_user_account',
  CHILDREN_PROFILES: 'cahaya_tahfiz_children_profiles',
  ACTIVE_CHILD_ID: 'cahaya_tahfiz_active_child_id',
  LAST_SESSION: 'cahaya_tahfiz_last_session_',
  BLOCKS_PREFIX: 'cahaya_tahfiz_blocks_',
  AYAHS_PREFIX: 'cahaya_tahfiz_ayahs_',
  LEDGER_PREFIX: 'cahaya_tahfiz_ledger_',
  RECORDINGS_PREFIX: 'cahaya_tahfiz_recordings_',
  SESSIONS_PREFIX: 'cahaya_tahfiz_sessions_',
  IQRA_PREFIX: 'cahaya_tahfiz_iqra_',
  TAJWID_PREFIX: 'cahaya_tahfiz_tajwid_',
  VOCAB_PREFIX: 'cahaya_tahfiz_vocab_',
  STORIES_PREFIX: 'cahaya_tahfiz_stories_',
  TAFSIR_PREFIX: 'cahaya_tahfiz_tafsir_',
  GAMES_PREFIX: 'cahaya_tahfiz_games_',
  SETTINGS_PREFIX: 'cahaya_tahfiz_settings_',
};

// Initial default parent and child profiles
const DEFAULT_USER: UserAccount = {
  id: 'usr-parent-1',
  email: 'orangtua@cahayatahfiz.id',
  parentName: 'Bunda Sarah',
  activeChildId: 'child-aisyah',
  pin: '2026',
  entitlement: 'free',
  planTier: 'free',
  isRegistered: false,
  entitlementExpiry: '2027-12-31',
  createdAt: '2026-01-15T00:00:00.000Z',
};

const DEFAULT_CHILDREN: ChildProfile[] = [
  {
    id: 'child-aisyah',
    name: 'Aisyah',
    avatar: '👧',
    birthYear: 2018,
    learningLevel: 'pemula',
    totalStars: 245,
    totalXp: 420,
    level: 2,
    streakDays: 4,
    lastActiveDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'child-ahmad',
    name: 'Ahmad',
    avatar: '👦',
    birthYear: 2016,
    learningLevel: 'menengah',
    totalStars: 580,
    totalXp: 950,
    level: 3,
    streakDays: 8,
    lastActiveDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
];

export class StorageService {
  // --- Account & Profiles ---
  static getUserAccount(): UserAccount {
    const data = localStorage.getItem(STORAGE_KEYS.USER_ACCOUNT);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(data);
  }

  static updateUserAccount(updates: Partial<UserAccount>): UserAccount {
    const current = this.getUserAccount();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(updated));
    return updated;
  }

  static registerUser(
    name: string,
    email: string,
    whatsapp?: string,
    childName?: string,
    targetGoal?: string
  ): UserAccount {
    const current = this.getUserAccount();
    const updated: UserAccount = {
      ...current,
      parentName: name.trim() || current.parentName,
      email: email.trim().toLowerCase() || current.email,
      whatsapp: whatsapp?.trim() || current.whatsapp,
      targetGoal: targetGoal?.trim() || current.targetGoal,
      isRegistered: true,
    };
    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(updated));

    // If childName provided, customize active child or create profile
    if (childName && childName.trim()) {
      const activeChild = this.getActiveChild();
      if (activeChild) {
        this.updateChild(activeChild.id, {
          name: childName.trim(),
        });
      }
    }

    return updated;
  }

  static loginUser(identifier: string, parentName?: string): UserAccount {
    const current = this.getUserAccount();
    const isEmail = identifier.includes('@');
    const updated: UserAccount = {
      ...current,
      email: isEmail ? identifier.trim().toLowerCase() : current.email,
      whatsapp: !isEmail ? identifier.trim() : current.whatsapp,
      parentName: parentName ? parentName.trim() : current.parentName,
      isRegistered: true,
    };
    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(updated));
    return updated;
  }

  static setPlanTier(tier: 'free' | 'pro'): UserAccount {
    const current = this.getUserAccount();
    const updated: UserAccount = {
      ...current,
      planTier: tier,
      entitlement: tier === 'pro' ? 'active' : 'free',
      entitlementExpiry: tier === 'pro' ? '2027-12-31' : '2099-12-31',
    };
    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(updated));
    return updated;
  }

  static getChildren(): ChildProfile[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHILDREN_PROFILES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CHILDREN_PROFILES, JSON.stringify(DEFAULT_CHILDREN));
      this.seedInitialChildProgress('child-aisyah');
      return DEFAULT_CHILDREN;
    }
    return JSON.parse(data);
  }

  static getActiveChildId(): string {
    const user = this.getUserAccount();
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CHILD_ID) || user.activeChildId || DEFAULT_CHILDREN[0].id;
  }

  static setActiveChildId(childId: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHILD_ID, childId);
    this.updateUserAccount({ activeChildId: childId });
  }

  static getActiveChild(): ChildProfile {
    const activeId = this.getActiveChildId();
    const children = this.getChildren();
    const found = children.find((c) => c.id === activeId);
    return found || children[0] || DEFAULT_CHILDREN[0];
  }

  static createChild(name: string, avatar: string, learningLevel: ChildProfile['learningLevel'], birthYear?: number): ChildProfile {
    const children = this.getChildren();
    const newChild: ChildProfile = {
      id: `child-${Date.now()}`,
      name,
      avatar,
      birthYear,
      learningLevel,
      totalStars: 20,
      totalXp: 30,
      level: 1,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    children.push(newChild);
    localStorage.setItem(STORAGE_KEYS.CHILDREN_PROFILES, JSON.stringify(children));
    this.setActiveChildId(newChild.id);
    return newChild;
  }

  static updateChild(childId: string, updates: Partial<ChildProfile>): ChildProfile {
    const children = this.getChildren();
    const idx = children.findIndex((c) => c.id === childId);
    if (idx !== -1) {
      children[idx] = { ...children[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.CHILDREN_PROFILES, JSON.stringify(children));
      return children[idx];
    }
    throw new Error('Child not found');
  }

  static deleteChild(childId: string): void {
    let children = this.getChildren();
    children = children.filter((c) => c.id !== childId);
    if (children.length === 0) {
      children = DEFAULT_CHILDREN;
    }
    localStorage.setItem(STORAGE_KEYS.CHILDREN_PROFILES, JSON.stringify(children));
    this.setActiveChildId(children[0].id);

    // Clean up child data
    localStorage.removeItem(STORAGE_KEYS.BLOCKS_PREFIX + childId);
    localStorage.removeItem(STORAGE_KEYS.AYAHS_PREFIX + childId);
    localStorage.removeItem(STORAGE_KEYS.LEDGER_PREFIX + childId);
    localStorage.removeItem(STORAGE_KEYS.RECORDINGS_PREFIX + childId);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS_PREFIX + childId);
  }

  // --- Seed Initial Child Progress ---
  private static seedInitialChildProgress(childId: string) {
    // Seed initial memorized surahs & blocks for Aisyah
    const blocks: ChildBlockProgress[] = [
      { id: '1-1', childId, surahNumber: 1, blockNumber: 1, state: 'MEMORIZED', repeatCount: 15, lastPracticedAt: new Date().toISOString() },
      { id: '1-2', childId, surahNumber: 1, blockNumber: 2, state: 'MEMORIZED', repeatCount: 12, lastPracticedAt: new Date().toISOString() },
      { id: '18-1', childId, surahNumber: 18, blockNumber: 1, state: 'MEMORIZED', repeatCount: 20, lastPracticedAt: new Date().toISOString() },
      { id: '18-2', childId, surahNumber: 18, blockNumber: 2, state: 'MEMORIZED', repeatCount: 18, lastPracticedAt: new Date().toISOString() },
      { id: '18-3', childId, surahNumber: 18, blockNumber: 3, state: 'MEMORIZED', repeatCount: 14, lastPracticedAt: new Date().toISOString() },
      { id: '18-12', childId, surahNumber: 18, blockNumber: 12, state: 'LEARNING', repeatCount: 6, lastPracticedAt: new Date().toISOString() },
      { id: '114-1', childId, surahNumber: 114, blockNumber: 1, state: 'LEARNING', repeatCount: 4, lastPracticedAt: new Date().toISOString() },
    ];
    localStorage.setItem(STORAGE_KEYS.BLOCKS_PREFIX + childId, JSON.stringify(blocks));

    const ayahs: ChildAyahProgress[] = [
      { childId, surahNumber: 1, ayahNumber: 1, memorized: true, score: 98, lastTestedAt: new Date().toISOString(), needsReview: false },
      { childId, surahNumber: 1, ayahNumber: 2, memorized: true, score: 95, lastTestedAt: new Date().toISOString(), needsReview: false },
      { childId, surahNumber: 1, ayahNumber: 3, memorized: true, score: 96, lastTestedAt: new Date().toISOString(), needsReview: false },
      { childId, surahNumber: 1, ayahNumber: 4, memorized: true, score: 94, lastTestedAt: new Date().toISOString(), needsReview: false },
      { childId, surahNumber: 1, ayahNumber: 5, memorized: true, score: 92, lastTestedAt: new Date().toISOString(), needsReview: false },
      { childId, surahNumber: 1, ayahNumber: 6, memorized: true, score: 91, lastTestedAt: new Date().toISOString(), needsReview: false },
      { childId, surahNumber: 1, ayahNumber: 7, memorized: true, score: 88, lastTestedAt: new Date().toISOString(), needsReview: true },
      { childId, surahNumber: 18, ayahNumber: 25, memorized: false, score: 84, lastTestedAt: new Date().toISOString(), needsReview: false },
      { childId, surahNumber: 18, ayahNumber: 26, memorized: false, score: 72, lastTestedAt: new Date().toISOString(), needsReview: true },
    ];
    localStorage.setItem(STORAGE_KEYS.AYAHS_PREFIX + childId, JSON.stringify(ayahs));

    // Seed recent practice session
    const lastSession = {
      surahNumber: 18,
      surahName: 'Al-Kahf',
      blockNumber: 12,
      startAyah: 25,
      endAyah: 26,
      mode: 'ziadah',
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.LAST_SESSION + childId, JSON.stringify(lastSession));
  }

  // --- Last Learning Session ---
  static getLastSession(childId: string) {
    const data = localStorage.getItem(STORAGE_KEYS.LAST_SESSION + childId);
    if (!data) {
      return {
        surahNumber: 18,
        surahName: 'Al-Kahf',
        blockNumber: 12,
        startAyah: 25,
        endAyah: 26,
        mode: 'ziadah' as const,
        timestamp: new Date().toISOString(),
      };
    }
    return JSON.parse(data);
  }

  static setLastSession(childId: string, sessionData: any) {
    localStorage.setItem(STORAGE_KEYS.LAST_SESSION + childId, JSON.stringify(sessionData));
  }

  // --- Blocks Progress ---
  static getBlockProgress(childId: string): ChildBlockProgress[] {
    const data = localStorage.getItem(STORAGE_KEYS.BLOCKS_PREFIX + childId);
    return data ? JSON.parse(data) : [];
  }

  static setBlockState(childId: string, surahNumber: number, blockNumber: number, state: ChildBlockProgress['state']): ChildBlockProgress {
    const blocks = this.getBlockProgress(childId);
    const existing = blocks.find((b) => b.surahNumber === surahNumber && b.blockNumber === blockNumber);
    const now = new Date().toISOString();

    if (existing) {
      existing.state = state;
      existing.lastPracticedAt = now;
      if (state === 'MEMORIZED') existing.memorizedAt = now;
    } else {
      blocks.push({
        id: `${surahNumber}-${blockNumber}`,
        childId,
        surahNumber,
        blockNumber,
        state,
        repeatCount: 1,
        lastPracticedAt: now,
        memorizedAt: state === 'MEMORIZED' ? now : undefined,
      });
    }

    localStorage.setItem(STORAGE_KEYS.BLOCKS_PREFIX + childId, JSON.stringify(blocks));
    return existing || blocks[blocks.length - 1];
  }

  static incrementBlockRepeat(childId: string, surahNumber: number, blockNumber: number): number {
    const blocks = this.getBlockProgress(childId);
    const existing = blocks.find((b) => b.surahNumber === surahNumber && b.blockNumber === blockNumber);
    if (existing) {
      existing.repeatCount = (existing.repeatCount || 0) + 1;
      existing.lastPracticedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.BLOCKS_PREFIX + childId, JSON.stringify(blocks));
      return existing.repeatCount;
    } else {
      blocks.push({
        id: `${surahNumber}-${blockNumber}`,
        childId,
        surahNumber,
        blockNumber,
        state: 'LEARNING',
        repeatCount: 1,
        lastPracticedAt: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEYS.BLOCKS_PREFIX + childId, JSON.stringify(blocks));
      return 1;
    }
  }

  // --- Ayah Progress ---
  static getAyahProgress(childId: string): ChildAyahProgress[] {
    const data = localStorage.getItem(STORAGE_KEYS.AYAHS_PREFIX + childId);
    return data ? JSON.parse(data) : [];
  }

  static saveAyahScore(childId: string, surahNumber: number, ayahNumber: number, score: number, memorized: boolean): void {
    const ayahs = this.getAyahProgress(childId);
    const existing = ayahs.find((a) => a.surahNumber === surahNumber && a.ayahNumber === ayahNumber);
    const now = new Date().toISOString();
    const needsReview = score < 80;

    if (existing) {
      existing.score = score;
      existing.memorized = memorized;
      existing.lastTestedAt = now;
      existing.needsReview = needsReview;
    } else {
      ayahs.push({
        childId,
        surahNumber,
        ayahNumber,
        memorized,
        score,
        lastTestedAt: now,
        needsReview,
      });
    }

    localStorage.setItem(STORAGE_KEYS.AYAHS_PREFIX + childId, JSON.stringify(ayahs));
  }

  // --- Points & Stars Ledger ---
  static getLedger(childId: string): PointsLedgerEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.LEDGER_PREFIX + childId);
    return data ? JSON.parse(data) : [];
  }

  static recordPoints(
    childId: string,
    eventType: PointsEventType,
    points: number,
    stars: number,
    description: string,
    referenceType?: string,
    referenceId?: string
  ): PointsLedgerEntry {
    const ledger = this.getLedger(childId);
    const entry: PointsLedgerEntry = {
      id: `ledg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      childId,
      eventType,
      points,
      stars,
      description,
      referenceType,
      referenceId,
      createdAt: new Date().toISOString(),
    };
    ledger.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.LEDGER_PREFIX + childId, JSON.stringify(ledger));

    // Update child profile total XP & Stars
    const child = this.getActiveChild();
    if (child.id === childId) {
      const newXp = child.totalXp + points;
      const newStars = child.totalStars + stars;
      const lvlConfig = getLevelForXp(newXp);
      this.updateChild(childId, {
        totalXp: newXp,
        totalStars: newStars,
        level: lvlConfig.level,
      });
    }

    return entry;
  }

  // --- Recordings ---
  static getRecordings(childId: string): AyahRecording[] {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDINGS_PREFIX + childId);
    return data ? JSON.parse(data) : [];
  }

  static saveRecording(recording: AyahRecording): void {
    const list = this.getRecordings(recording.childId);
    list.unshift(recording);
    localStorage.setItem(STORAGE_KEYS.RECORDINGS_PREFIX + recording.childId, JSON.stringify(list));
  }

  static deleteRecording(childId: string, recordingId: string): void {
    let list = this.getRecordings(childId);
    list = list.filter((r) => r.id !== recordingId);
    localStorage.setItem(STORAGE_KEYS.RECORDINGS_PREFIX + childId, JSON.stringify(list));
  }

  // --- Iqra & Tajwid & Vocab Progress ---
  static getCompletedIqra(childId: string): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.IQRA_PREFIX + childId);
    return data ? JSON.parse(data) : ['iqra-a-1', 'iqra-a-2', 'iqra-a-3'];
  }

  static toggleIqraMastery(childId: string, itemId: string): boolean {
    const list = this.getCompletedIqra(childId);
    const idx = list.indexOf(itemId);
    let nowCompleted = false;
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(itemId);
      nowCompleted = true;
      this.recordPoints(childId, 'IQRA_LESSON', 10, 2, 'Lulus latihan huruf Iqra', 'iqra', itemId);
    }
    localStorage.setItem(STORAGE_KEYS.IQRA_PREFIX + childId, JSON.stringify(list));
    return nowCompleted;
  }

  static getCompletedTajwid(childId: string): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.TAJWID_PREFIX + childId);
    return data ? JSON.parse(data) : ['izhar'];
  }

  static markTajwidCompleted(childId: string, topicId: string): void {
    const list = this.getCompletedTajwid(childId);
    if (!list.includes(topicId)) {
      list.push(topicId);
      localStorage.setItem(STORAGE_KEYS.TAJWID_PREFIX + childId, JSON.stringify(list));
      this.recordPoints(childId, 'TAJWID_LESSON', 15, 3, 'Kuasai hukum Tajwid', 'tajwid', topicId);
    }
  }

  static getMasteredVocab(childId: string): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.VOCAB_PREFIX + childId);
    return data ? JSON.parse(data) : ['vocab-1', 'vocab-2'];
  }

  static toggleVocabMastery(childId: string, vocabId: string): boolean {
    const list = this.getMasteredVocab(childId);
    const idx = list.indexOf(vocabId);
    let isMastered = false;
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(vocabId);
      isMastered = true;
      this.recordPoints(childId, 'VOCABULARY', 5, 1, 'Kuasai kosakata Qur\'an', 'vocab', vocabId);
    }
    localStorage.setItem(STORAGE_KEYS.VOCAB_PREFIX + childId, JSON.stringify(list));
    return isMastered;
  }

  static getCompletedStories(childId: string): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.STORIES_PREFIX + childId);
    return data ? JSON.parse(data) : ['asbab-1'];
  }

  static markStoryRead(childId: string, storyId: string): void {
    const list = this.getCompletedStories(childId);
    if (!list.includes(storyId)) {
      list.push(storyId);
      localStorage.setItem(STORAGE_KEYS.STORIES_PREFIX + childId, JSON.stringify(list));
      this.recordPoints(childId, 'VOCABULARY', 10, 2, 'Membaca kisah Asbabun Nuzul', 'story', storyId);
    }
  }

  // --- Settings ---
  static getSettings(childId: string) {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS_PREFIX + childId);
    return data
      ? JSON.parse(data)
      : {
          reciterId: 'alafasy',
          arabicFont: 'noto', // 'noto' | 'amiri'
          fontSize: 'large', // 'normal' | 'large' | 'xl'
          showTranslation: true,
          audioSpeed: 1.0,
        };
  }

  static updateSettings(childId: string, updates: any) {
    const current = this.getSettings(childId);
    const next = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS_PREFIX + childId, JSON.stringify(next));
    return next;
  }
}
