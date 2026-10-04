import {
  CompanionData,
  CompanionStage,
  CompanionTrait,
  DailyQuest,
  CompanionSpecies,
} from '../types/companion';
import { getStageForXp, COMPANION_DIALOGUES, ROOM_DECORATIONS } from '../data/companionData';
import { StorageService } from './storageService';

const COMPANION_KEY_PREFIX = 'cahaya_tahfiz_companion_';
const QUESTS_KEY_PREFIX = 'cahaya_tahfiz_quests_';
const GAME_COUNT_PREFIX = 'cahaya_tahfiz_games_today_';

function getCurrentWeekId(): string {
  const d = new Date();
  const year = d.getFullYear();
  // Get week number
  const oneJan = new Date(year, 0, 1);
  const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  return `${year}-W${week}`;
}

function getTodayDayIndex(): number {
  // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  // We want 0 = Monday, 1 = Tuesday ... 6 = Sunday
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

export class CompanionService {
  /**
   * Retrieves or initializes Companion data for a specific child
   */
  static getCompanionData(childId: string): CompanionData {
    const raw = localStorage.getItem(COMPANION_KEY_PREFIX + childId);
    const child = StorageService.getActiveChild();
    const currentXp = child && child.id === childId ? child.totalXp : 0;
    const currentWeekId = getCurrentWeekId();

    if (raw) {
      try {
        const data: CompanionData = JSON.parse(raw);
        // Sync XP with child profile if needed
        data.xp = Math.max(data.xp || 0, currentXp);
        const stageConfig = getStageForXp(data.xp);
        data.stage = stageConfig.id;

        // Reset garden days if new week
        if (data.gardenWeekId !== currentWeekId) {
          data.gardenWeekId = currentWeekId;
          data.gardenDays = [false, false, false, false, false, false, false];
        }

        return data;
      } catch (e) {
        console.warn('Error parsing companion data:', e);
      }
    }

    // Default Companion initialization
    const initialStage = getStageForXp(currentXp).id;
    const initialGarden = [false, false, false, false, false, false, false];
    initialGarden[getTodayDayIndex()] = true;

    const initialData: CompanionData = {
      childId,
      name: 'Lumi',
      species: 'lumi',
      stage: initialStage,
      xp: currentXp,
      level: child ? child.level : 1,
      hunger: 85,
      happiness: 90,
      cleanliness: 95,
      energy: 85,
      traits: {
        hafiz: 5,
        tartil: 4,
        reader: 4,
        scholar: 3,
        explorer: 4,
      },
      roomItems: ['carpet-bintang', 'tanaman-cahaya'],
      unlockedItems: ['carpet-bintang', 'tanaman-cahaya'],
      unlockedCards: ['card-1', 'card-18', 'card-114'],
      gardenDays: initialGarden,
      gardenWeekId: currentWeekId,
      gardenWateredToday: false,
      seedsCount: 3,
      lastActiveDate: new Date().toISOString().split('T')[0],
      dialogueMessage: 'Assalamu\'alaikum! Lumi senang sekali belajar bersamamu!',
    };

    this.saveCompanionData(initialData);
    return initialData;
  }

  static saveCompanionData(data: CompanionData): void {
    localStorage.setItem(COMPANION_KEY_PREFIX + data.childId, JSON.stringify(data));
  }

  /**
   * Awards XP, updates traits, checks stage evolution, records garden bloom, and updates quests
   */
  static recordActivity(
    childId: string,
    actionType: 'murojaah' | 'dengar' | 'ziadah' | 'hafalan' | 'iqra' | 'tajwid' | 'vocab' | 'game',
    xpEarned: number,
    starsEarned: number,
    customTitle?: string
  ): {
    leveledUp: boolean;
    hatched: boolean;
    stageChanged: boolean;
    newStage?: CompanionStage;
    seedFound: boolean;
  } {
    const companion = this.getCompanionData(childId);
    const prevStage = companion.stage;
    const prevLevel = companion.level;

    // 1. Map activity to trait progression
    if (['dengar', 'ziadah', 'murojaah', 'hafalan'].includes(actionType)) {
      companion.traits.hafiz = (companion.traits.hafiz || 0) + 1;
    } else if (actionType === 'tajwid') {
      companion.traits.tartil = (companion.traits.tartil || 0) + 1;
    } else if (actionType === 'iqra') {
      companion.traits.reader = (companion.traits.reader || 0) + 1;
    } else if (actionType === 'vocab') {
      companion.traits.scholar = (companion.traits.scholar || 0) + 1;
    } else if (actionType === 'game') {
      companion.traits.explorer = (companion.traits.explorer || 0) + 1;
    }

    // 2. Mark weekly learning garden for today (non-punitive)
    const dayIdx = getTodayDayIndex();
    if (!companion.gardenDays) {
      companion.gardenDays = [false, false, false, false, false, false, false];
    }
    companion.gardenDays[dayIdx] = true;

    // 3. Add XP and check stage evolution
    companion.xp += xpEarned;
    const nextStageConfig = getStageForXp(companion.xp);
    companion.stage = nextStageConfig.id;

    // 4. Random chance for Seed of Knowledge discovery (35% probability)
    let seedFound = false;
    if (Math.random() < 0.35) {
      companion.seedsCount = (companion.seedsCount || 0) + 1;
      seedFound = true;
    }

    const hatched = prevStage === 'egg' && companion.stage !== 'egg';
    const stageChanged = prevStage !== companion.stage;
    const leveledUp = companion.level > prevLevel;

    // 5. Update daily quests progress
    this.updateDailyQuestProgress(childId, actionType, 1);

    this.saveCompanionData(companion);

    return {
      leveledUp,
      hatched,
      stageChanged,
      newStage: companion.stage,
      seedFound,
    };
  }

  /**
   * Generates or fetches today's 3 non-punitive Daily Journey quests
   */
  static getDailyQuests(childId: string): DailyQuest[] {
    const today = new Date().toISOString().split('T')[0];
    const key = `${QUESTS_KEY_PREFIX}${childId}_${today}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Error reading daily quests:', e);
      }
    }

    // 3 friendly quests
    const defaultQuests: DailyQuest[] = [
      {
        id: 'quest-dengar',
        title: 'Lentera Nada (Echo Journey)',
        subtitle: 'Dengar lantunan qari di Dengar / Tilawah',
        icon: '🎧',
        current: 0,
        target: 3,
        unit: 'ayat',
        completed: false,
        xpReward: 15,
        starReward: 3,
        actionType: 'dengar',
      },
      {
        id: 'quest-latihan',
        title: 'Penjaga Ingatan (Memory Keeper)',
        subtitle: 'Latih hafalan di Ziadah atau Murojaah',
        icon: '🌙',
        current: 0,
        target: 1,
        unit: 'sesi',
        completed: false,
        xpReward: 25,
        starReward: 5,
        actionType: 'murojaah',
      },
      {
        id: 'quest-wawasan',
        title: 'Tunas Ilmu (Growing Wisdom)',
        subtitle: 'Pelajari Iqra, Tajwid, atau Kosakata Qur\'an',
        icon: '🌱',
        current: 0,
        target: 2,
        unit: 'materi',
        completed: false,
        xpReward: 15,
        starReward: 3,
        actionType: 'vocab',
      },
    ];

    localStorage.setItem(key, JSON.stringify(defaultQuests));
    return defaultQuests;
  }

  /**
   * Increments progress on matching daily quest
   */
  static updateDailyQuestProgress(
    childId: string,
    actionType: DailyQuest['actionType'],
    amount: number = 1
  ): DailyQuest[] {
    const today = new Date().toISOString().split('T')[0];
    const key = `${QUESTS_KEY_PREFIX}${childId}_${today}`;
    const quests = this.getDailyQuests(childId);

    let changed = false;
    quests.forEach((q) => {
      // Map related actions (e.g. ziadah counts for murojaah/latihan quest; tajwid/iqra counts for wawasan)
      const isMatch =
        q.actionType === actionType ||
        (q.id === 'quest-latihan' && ['ziadah', 'murojaah', 'hafalan'].includes(actionType)) ||
        (q.id === 'quest-wawasan' && ['iqra', 'tajwid', 'vocab'].includes(actionType));

      if (isMatch && !q.completed) {
        q.current = Math.min(q.target, q.current + amount);
        if (q.current >= q.target) {
          q.completed = true;
          // Award quest bonus
          StorageService.recordPoints(
            childId,
            'PRACTICE_AYAH',
            q.xpReward,
            q.starReward,
            `Menyelesaikan Petualangan Hari Ini: ${q.title}`
          );
        }
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(key, JSON.stringify(quests));
    }
    return quests;
  }

  /**
   * Check if today's 3-quest completion bonus (30 ⭐) is claimed
   */
  static isDailyBonusClaimed(childId: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem(`bonus_claimed_${childId}_${today}`) === 'true';
  }

  static claimDailyBonus(childId: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    const quests = this.getDailyQuests(childId);
    const allDone = quests.every((q) => q.completed);

    if (allDone && !this.isDailyBonusClaimed(childId)) {
      StorageService.recordPoints(
        childId,
        'COMPLETE_BLOCK',
        40,
        30,
        'Bonus Tuntas Seluruh Petualangan Hari Ini'
      );
      localStorage.setItem(`bonus_claimed_${childId}_${today}`, 'true');
      return true;
    }
    return false;
  }

  /**
   * Unlocks a room decoration using stars (Zero lootbox, transparent reward)
   */
  static buyRoomDecoration(childId: string, decorationId: string): { success: boolean; message: string } {
    const companion = this.getCompanionData(childId);
    const item = ROOM_DECORATIONS.find((d) => d.id === decorationId);
    if (!item) return { success: false, message: 'Item tidak ditemukan' };

    if (companion.unlockedItems.includes(decorationId)) {
      // Toggle place / unplace
      if (companion.roomItems.includes(decorationId)) {
        companion.roomItems = companion.roomItems.filter((id) => id !== decorationId);
        this.saveCompanionData(companion);
        return { success: true, message: `${item.name} disimpan ke lemari.` };
      } else {
        companion.roomItems.push(decorationId);
        this.saveCompanionData(companion);
        return { success: true, message: `${item.name} dipasang di kamar!` };
      }
    }

    const child = StorageService.getActiveChild();
    if (child.totalStars < item.costStars) {
      return {
        success: false,
        message: `Bintang belum cukup! Butuh ${item.costStars} ⭐ (kamu punya ${child.totalStars} ⭐).`,
      };
    }

    // Deduct stars & unlock
    StorageService.recordPoints(
      childId,
      'PRACTICE_AYAH',
      0,
      -item.costStars,
      `Membeli dekorasi kamar: ${item.name}`
    );

    companion.unlockedItems.push(decorationId);
    if (!companion.roomItems.includes(decorationId)) {
      companion.roomItems.push(decorationId);
    }
    this.saveCompanionData(companion);

    return { success: true, message: `Alhamdulillah! ${item.name} berhasil dipasang!` };
  }

  /**
   * Gentle pet interaction gives happy response without stress
   */
  static petCompanion(childId: string): { message: string } {
    const companion = this.getCompanionData(childId);
    const messages = COMPANION_DIALOGUES.petted;
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    companion.lastPetAt = new Date().toISOString();
    companion.happiness = Math.min(100, (companion.happiness ?? 85) + 15);
    companion.dialogueMessage = randomMsg;
    this.saveCompanionData(companion);

    return { message: randomMsg };
  }

  /**
   * Tamagotchi: Feed the companion nutritious Kurma / Madu
   */
  static feedCompanion(childId: string, foodType: 'kurma' | 'madu' = 'kurma'): { success: boolean; message: string } {
    const companion = this.getCompanionData(childId);
    companion.hunger = Math.min(100, (companion.hunger ?? 70) + 30);
    companion.energy = Math.min(100, (companion.energy ?? 75) + 20);
    companion.happiness = Math.min(100, (companion.happiness ?? 80) + 15);
    companion.lastFedAt = new Date().toISOString();

    const foodName = foodType === 'kurma' ? 'Kurma Manis' : 'Madu Alami';
    const message = `Bismillah! Nyam-nyam... ${foodName} yang berkah! Energi ${companion.name} kini terisi penuh!`;
    companion.dialogueMessage = message;
    this.saveCompanionData(companion);

    StorageService.recordPoints(childId, 'PRACTICE_AYAH', 5, 1, `Memberi makan ${companion.name}`);
    return { success: true, message };
  }

  /**
   * Tamagotchi: Clean companion with water & light
   */
  static cleanCompanion(childId: string): { success: boolean; message: string } {
    const companion = this.getCompanionData(childId);
    companion.cleanliness = 100;
    companion.happiness = Math.min(100, (companion.happiness ?? 80) + 20);
    const message = `Alhamdulillah! Segar sekali disiram embun suci air wudhu. ${companion.name} kini bersih dan wangi!`;
    companion.dialogueMessage = message;
    this.saveCompanionData(companion);

    StorageService.recordPoints(childId, 'PRACTICE_AYAH', 5, 1, `Menyucikan & merawat ${companion.name}`);
    return { success: true, message };
  }

  /**
   * Weekly Garden: Water today's plant to bloom
   */
  static waterGarden(childId: string): { success: boolean; message: string; bloomed: boolean } {
    const companion = this.getCompanionData(childId);
    const dayIdx = getTodayDayIndex();
    const alreadyBloomed = companion.gardenDays[dayIdx];

    companion.gardenDays[dayIdx] = true;
    companion.gardenWateredToday = true;
    companion.seedsCount = (companion.seedsCount || 0) + 1;
    this.saveCompanionData(companion);

    StorageService.recordPoints(childId, 'PRACTICE_AYAH', 15, 2, 'Menyiram Kebun Belajar Mingguan');
    return {
      success: true,
      bloomed: !alreadyBloomed,
      message: 'MasyaAllah! Kebun telah disiram air doa & tartil. Bunga belajar hari ini mekar bercahaya! (+1 Benih Cahaya & +15 XP)',
    };
  }

  /**
   * Tamagotchi: Change / choose companion species
   */
  static setCompanionSpecies(childId: string, species: CompanionSpecies, petName?: string): void {
    const companion = this.getCompanionData(childId);
    companion.species = species;
    if (petName && petName.trim()) {
      companion.name = petName.trim();
    }
    this.saveCompanionData(companion);
  }

  /**
   * Diminishing XP for mini games to prevent mindless farming
   * First 3 games = 100% XP (10 XP), next 3 = 50% XP (5 XP), after = 0 XP
   */
  static getGameXpReward(childId: string): number {
    const today = new Date().toISOString().split('T')[0];
    const key = `${GAME_COUNT_PREFIX}${childId}_${today}`;
    const playedCount = Number(localStorage.getItem(key) || 0);

    localStorage.setItem(key, String(playedCount + 1));

    if (playedCount < 3) return 10;
    if (playedCount < 6) return 5;
    return 0; // Pure fun, no farming
  }
}
