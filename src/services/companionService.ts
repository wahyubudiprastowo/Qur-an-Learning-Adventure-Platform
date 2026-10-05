import {
  CompanionData,
  CompanionStage,
  CompanionTrait,
  DailyQuest,
  CompanionSpecies,
  PetMood,
  EmotiveExpression,
  FeedResult,
  FeedStatus,
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

        // Initialize feed tracking if missing
        if (data.foodTreatsAvailable === undefined) {
          data.foodTreatsAvailable = Math.max(1, data.surahsCompletedCount || 1);
        }
        if (data.requiredSurahsPerFeed === undefined) {
          data.requiredSurahsPerFeed = 1;
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
      surahsCompletedCount: 1,
      foodTreatsAvailable: 1, // Ready to feed right away!
      surahsSinceLastFeed: 1,
      requiredSurahsPerFeed: 1,
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

    // 3 non-punitive Daily Quests: Listen to Surah, Practice Tajwid, and Hafalan/Murojaah
    const defaultQuests: DailyQuest[] = [
      {
        id: 'quest-dengar',
        title: 'Dengarkan 1 Surah (Listen to 1 Surah)',
        subtitle: 'Dengar lantunan qari merdu di Dengar / Tilawah',
        icon: '🎧',
        current: 0,
        target: 1,
        unit: 'surah',
        completed: false,
        xpReward: 20,
        starReward: 3,
        happinessReward: 15,
        actionType: 'dengar',
      },
      {
        id: 'quest-tajwid',
        title: 'Latihan Tajwid (Practice Tajwid)',
        subtitle: 'Pelajari hukum tajwid atau kuis makhraj huruf',
        icon: '🔤',
        current: 0,
        target: 1,
        unit: 'materi',
        completed: false,
        xpReward: 25,
        starReward: 4,
        happinessReward: 15,
        actionType: 'tajwid',
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
        xpReward: 30,
        starReward: 5,
        happinessReward: 20,
        actionType: 'murojaah',
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
      // Map related actions
      const isMatch =
        q.actionType === actionType ||
        (q.id === 'quest-tajwid' && ['tajwid', 'iqra', 'vocab'].includes(actionType)) ||
        (q.id === 'quest-latihan' && ['ziadah', 'murojaah', 'hafalan'].includes(actionType)) ||
        (q.id === 'quest-dengar' && ['dengar'].includes(actionType));

      if (isMatch && !q.completed) {
        q.current = Math.min(q.target, q.current + amount);
        if (q.current >= q.target) {
          q.completed = true;
          // Award quest bonus to child points
          StorageService.recordPoints(
            childId,
            'PRACTICE_AYAH',
            q.xpReward,
            q.starReward,
            `Menyelesaikan Misi Harian: ${q.title}`
          );

          // Maintain pet's happiness and growth state directly
          const companion = this.getCompanionData(childId);
          const boost = q.happinessReward || 15;
          companion.happiness = Math.min(100, (companion.happiness ?? 80) + boost);
          companion.energy = Math.min(100, (companion.energy ?? 75) + 10);
          companion.xp = (companion.xp || 0) + (q.xpReward || 15);
          companion.mood = 'joyful';
          companion.dialogueMessage = `MasyaAllah! Misi harian "${q.title}" tuntas! ${companion.name} makin gembira (+${boost}% Bahagia), bertumbuh kuat, dan penuh berkah! 🌟💖`;
          this.saveCompanionData(companion);
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
        'Bonus Tuntas Seluruh Misi Harian'
      );
      localStorage.setItem(`bonus_claimed_${childId}_${today}`, 'true');

      // Boost companion vitals to 100% and trigger celebrating expression
      const companion = this.getCompanionData(childId);
      companion.happiness = 100;
      companion.energy = 100;
      companion.hunger = Math.min(100, (companion.hunger ?? 70) + 20);
      companion.mood = 'celebrating';
      companion.expression = 'celebrating';
      companion.dialogueMessage = `Allahu Akbar! Tabarakallah! Semua misi harian tuntas diselesaikan! ${companion.name} merayakannya dengan sukacita penuh bintang! 🎉🏆✨`;
      this.saveCompanionData(companion);

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
   * Computes the current real-time mood based on pet vitals, expressions, and sleep state
   */
  static computeMood(companion: CompanionData): PetMood {
    if (companion.isSleeping) return 'sleeping';
    if (companion.expression) return companion.expression;
    const hunger = companion.hunger ?? 80;
    const energy = companion.energy ?? 80;
    const happiness = companion.happiness ?? 80;

    if (hunger < 35) return 'hungry';
    if (energy < 30) return 'sleepy';
    if (happiness >= 85) return 'joyful';
    if ((companion.surahsCompletedCount || 0) > 0 && happiness >= 70) return 'proud';
    return 'content';
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
    companion.mood = this.computeMood(companion);
    this.saveCompanionData(companion);

    return { message: randomMsg };
  }

  /**
   * Checks if companion can be fed and how many treats are available from completed surahs
   */
  static canFeedCompanion(childId: string): FeedStatus {
    const companion = this.getCompanionData(childId);
    const treats = companion.foodTreatsAvailable ?? 1;
    const required = companion.requiredSurahsPerFeed || 1;
    const surahsDone = companion.surahsCompletedCount || 0;
    const surahsNeeded = treats > 0 ? 0 : 1;

    return {
      canFeed: treats > 0 && !companion.isSleeping,
      treatsAvailable: treats,
      surahsCompletedCount: surahsDone,
      surahsNeededForNext: surahsNeeded,
      requiredSurahsPerFeed: required,
      isSleeping: !!companion.isSleeping,
    };
  }

  /**
   * Tamagotchi: Feed the companion nutritious Kurma / Madu after completing a set number of surahs.
   * Consumes a food treat earned from completed surahs, triggering a joyful animation and increasing the happiness bar.
   */
  static feedCompanion(
    childId: string,
    foodType: 'kurma' | 'madu' = 'kurma'
  ): FeedResult {
    const companion = this.getCompanionData(childId);

    // Sleep check
    if (companion.isSleeping) {
      return {
        success: false,
        message: `Ssshh... ${companion.name} sedang tidur nyenyak. Bangunkan terlebih dahulu untuk makan! 🌙`,
        happinessGained: 0,
        newHappiness: companion.happiness ?? 70,
        newHunger: companion.hunger ?? 70,
        treatsRemaining: companion.foodTreatsAvailable ?? 0,
        isJoyful: false,
      };
    }

    const availableTreats = companion.foodTreatsAvailable ?? 1;
    if (availableTreats <= 0) {
      const required = companion.requiredSurahsPerFeed || 1;
      return {
        success: false,
        message: `${companion.name} butuh hidangan dari hafalanmu! Selesaikan setoran 1 surah lagi untuk memetik Kurma Berkah dari surga! 📖✨`,
        happinessGained: 0,
        newHappiness: companion.happiness ?? 70,
        newHunger: companion.hunger ?? 70,
        treatsRemaining: 0,
        isJoyful: false,
        surahsNeeded: required,
      };
    }

    // Deduct 1 feast treat earned from completing surahs
    companion.foodTreatsAvailable = Math.max(0, availableTreats - 1);
    companion.surahsSinceLastFeed = 0;

    // Significant Happiness Bar surge! (+25% up to 100)
    const oldHappiness = companion.happiness ?? 75;
    const happinessGained = Math.min(25, 100 - oldHappiness);
    companion.happiness = Math.min(100, oldHappiness + 25);

    // Hunger and Energy boosted
    companion.hunger = Math.min(100, (companion.hunger ?? 65) + 35);
    companion.energy = Math.min(100, (companion.energy ?? 70) + 20);
    companion.mood = 'joyful';
    companion.lastFedAt = new Date().toISOString();

    const foodName = foodType === 'kurma' ? 'Kurma Ajwa Manis' : 'Madu Murni Berkah';
    const message = `Alhamdulillah! Nyam nyam nyam... ${companion.name} lahap sekali menikmati ${foodName}! Kebahagiaan melonjak drastis (+${happinessGained}% Bahagia) 🥰💖!`;
    companion.dialogueMessage = message;

    this.saveCompanionData(companion);

    StorageService.recordPoints(
      childId,
      'PRACTICE_AYAH',
      10,
      1,
      `Memberi makan ${companion.name} dari hidangan surah`
    );

    return {
      success: true,
      message,
      happinessGained,
      newHappiness: companion.happiness,
      newHunger: companion.hunger,
      treatsRemaining: companion.foodTreatsAvailable,
      isJoyful: true,
    };
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
    companion.mood = this.computeMood(companion);
    this.saveCompanionData(companion);

    StorageService.recordPoints(childId, 'PRACTICE_AYAH', 5, 1, `Menyucikan & merawat ${companion.name}`);
    return { success: true, message };
  }

  /**
   * Tamagotchi: Toggle Sleep / Rest state for companion
   */
  static toggleSleep(childId: string): { isSleeping: boolean; message: string } {
    const companion = this.getCompanionData(childId);
    const currentlySleeping = !!companion.isSleeping;

    if (!currentlySleeping) {
      // Put pet to sleep to rest and recharge
      companion.isSleeping = true;
      companion.mood = 'sleeping';
      const message = `Ssshh... ${companion.name} sedang tidur nyenyak diiringi lantunan ayat suci. Zzz... Semoga mimpi indah dalam naungan Al-Qur'an! 🌙`;
      companion.dialogueMessage = message;
      this.saveCompanionData(companion);
      return { isSleeping: true, message };
    } else {
      // Wake pet up
      companion.isSleeping = false;
      companion.energy = Math.min(100, (companion.energy ?? 50) + 40);
      companion.happiness = Math.min(100, (companion.happiness ?? 70) + 15);
      companion.mood = 'joyful';
      const message = `Alhamdulillah! ${companion.name} sudah bangun dengan bugar dan bersemangat! Yuk mulai tilawah lagi! ✨`;
      companion.dialogueMessage = message;
      this.saveCompanionData(companion);
      return { isSleeping: false, message };
    }
  }

  /**
   * Stateful reaction: Called on child daily login
   * Decreases hunger naturally with time, wakes up sleeping pet, gives warm morning greeting
   */
  static onChildDailyLogin(childId: string): { isNewDay: boolean; companion: CompanionData } {
    const companion = this.getCompanionData(childId);
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = companion.lastLoginDate !== today;

    if (isNewDay) {
      companion.lastLoginDate = today;
      // Natural overnight decay (non-punitive, encourages breakfast kurma)
      companion.hunger = Math.max(45, (companion.hunger ?? 85) - 25);
      companion.energy = Math.max(60, (companion.energy ?? 80) - 15);
      companion.happiness = Math.min(100, (companion.happiness ?? 80) + 10); // Happy that child returned!

      // Wake up if was sleeping
      if (companion.isSleeping) {
        companion.isSleeping = false;
      }

      companion.dialogueMessage = `Assalamu'alaikum! Senang sekali kamu kembali hari ini. Perut ${companion.name} agak lapar, yuk sarapan kurma dan mulai tartil! ☀️`;
      companion.mood = this.computeMood(companion);
      this.saveCompanionData(companion);
    }

    return { isNewDay, companion };
  }

  /**
   * Stateful reaction: Called when a surah or tahfiz block is completed
   * Companion feels immense pride, joy, spiritual nourishment, and energy boost!
   */
  static onSurahCompleted(childId: string, surahName?: string): { companion: CompanionData; message: string } {
    const companion = this.getCompanionData(childId);

    // If sleeping, wake up joyfully to celebrate
    companion.isSleeping = false;
    companion.happiness = 100; // Peak happiness!
    companion.energy = Math.min(100, (companion.energy ?? 70) + 25);
    companion.hunger = Math.min(100, (companion.hunger ?? 70) + 15); // Nourished by barakah!
    companion.surahsCompletedCount = (companion.surahsCompletedCount || 0) + 1;
    companion.surahsSinceLastFeed = (companion.surahsSinceLastFeed || 0) + 1;
    companion.foodTreatsAvailable = (companion.foodTreatsAvailable || 0) + 1; // Award 1 delicious meal treat!
    companion.mood = 'celebrating';
    companion.expression = 'celebrating';

    const targetName = surahName ? `Surah ${surahName}` : 'Hafalan Qur\'an';
    const message = `Allahu Akbar! Tabarakallah! ${targetName} berhasil dituntaskan dengan tartil! ${companion.name} merayakan keberhasilanmu dengan takbir & sukacita! 🎉🏆 Cahaya hafalanmu membuka 1 Hidangan Kurma Berkah 🍯 untuk memberi makan ${companion.name}! 🌟`;
    companion.dialogueMessage = message;

    // Automatically mark today's garden bloomed
    const dayIdx = getTodayDayIndex();
    if (!companion.gardenDays) {
      companion.gardenDays = [false, false, false, false, false, false, false];
    }
    companion.gardenDays[dayIdx] = true;

    this.saveCompanionData(companion);
    return { companion, message };
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
    companion.happiness = Math.min(100, (companion.happiness ?? 80) + 15);
    companion.mood = this.computeMood(companion);
    this.saveCompanionData(companion);

    StorageService.recordPoints(childId, 'PRACTICE_AYAH', 15, 2, 'Menyiram Kebun Belajar Mingguan');
    return {
      success: true,
      bloomed: !alreadyBloomed,
      message: 'MasyaAllah! Kebun telah disiram air doa & tartil. Bunga belajar hari ini mekar bercahaya! (+1 Benih Cahaya & +15 XP)',
    };
  }

  /**
   * Weekly Garden: Check if weekly harvest trophy bonus has been claimed
   */
  static isWeeklyGardenHarvestClaimed(childId: string, weekId?: string): boolean {
    const targetWeekId = weekId || getCurrentWeekId();
    return localStorage.getItem(`cahaya_garden_harvest_${childId}_${targetWeekId}`) === 'true';
  }

  /**
   * Weekly Garden: Claim the Golden Harvest Trophy & Rewards (150 XP + 5 Stars)
   */
  static claimWeeklyGardenHarvest(childId: string): {
    success: boolean;
    xpEarned: number;
    starsEarned: number;
    message: string;
  } {
    const companion = this.getCompanionData(childId);
    const weekId = companion.gardenWeekId || getCurrentWeekId();

    if (this.isWeeklyGardenHarvestClaimed(childId, weekId)) {
      return {
        success: false,
        xpEarned: 0,
        starsEarned: 0,
        message: 'Hadiah Panen Raya Mingguan pekan ini sudah diklaim!',
      };
    }

    const bloomedCount = (companion.gardenDays || []).filter(Boolean).length;
    if (bloomedCount < 5) {
      return {
        success: false,
        xpEarned: 0,
        starsEarned: 0,
        message: `Belum cukup mekar! Butuh minimal 5 hari mekar dalam sepekan (saat ini ${bloomedCount}/7 hari). Tetap istiqomah ya!`,
      };
    }

    // Award grand weekly prize
    const xpReward = 150;
    const starReward = 5;
    StorageService.recordPoints(
      childId,
      'COMPLETE_BLOCK',
      xpReward,
      starReward,
      `Panen Raya Kebun Belajar Mingguan (${bloomedCount}/7 Hari)`
    );

    localStorage.setItem(`cahaya_garden_harvest_${childId}_${weekId}`, 'true');

    // Boost companion vitals to 100%
    companion.happiness = 100;
    companion.energy = 100;
    companion.hunger = 100;
    companion.mood = 'proud';
    companion.dialogueMessage = `MasyaAllah Tabarakallah! Panen raya kebun mingguan berhasil! ${companion.name} sangat bersyukur dan bangga atas keistiqomahanmu! 🏆`;
    this.saveCompanionData(companion);

    return {
      success: true,
      xpEarned: xpReward,
      starsEarned: starReward,
      message: `Alhamdulillah! Selamat atas Panen Raya Mingguan! Mendapatkan +${xpReward} XP dan +${starReward} ⭐ Bintang Kebaikan!`,
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
    companion.mood = this.computeMood(companion);
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

  /**
   * Directly sets an emotive expression on the companion pet
   */
  static setEmotiveExpression(
    childId: string,
    expression: EmotiveExpression,
    customDialogue?: string
  ): CompanionData {
    const companion = this.getCompanionData(childId);
    companion.expression = expression;
    companion.mood = expression;

    if (expression === 'sleeping') {
      companion.isSleeping = true;
    } else if (companion.isSleeping) {
      companion.isSleeping = false;
    }

    if (customDialogue) {
      companion.dialogueMessage = customDialogue;
    } else {
      if (expression === 'celebrating') {
        companion.dialogueMessage = `Allahu Akbar! Tabarakallah! Merayakan keberhasilan tuntasnya surah dengan sukacita dan sujud syukur! 🎉🏆`;
      } else if (expression === 'thoughtful') {
        companion.dialogueMessage = `${companion.name} sedang terdiam khusyuk mentadabburi keagungan ayat Al-Qur'an... Indah sekali maknanya! 📖🤔`;
      } else if (expression === 'sleeping') {
        companion.dialogueMessage = `Ssshh... Karena suasana hening dan tenang, ${companion.name} tertidur pulas dalam naungan doa. Zzz... 🌙`;
      } else if (expression === 'joyful') {
        companion.dialogueMessage = `Alhamdulillah! Hati ${companion.name} berseri-seri penuh kegembiraan! ✨`;
      }
    }

    this.saveCompanionData(companion);
    return companion;
  }

  /**
   * Emotive Reaction: Browsing Quran Modules triggers thoughtful contemplation
   */
  static onBrowsingQuran(childId: string, submoduleName?: string): CompanionData {
    const companion = this.getCompanionData(childId);
    companion.isSleeping = false;
    companion.expression = 'thoughtful';
    companion.mood = 'thoughtful';

    if (submoduleName === 'tafsir') {
      companion.dialogueMessage = `${companion.name} khusyuk merenungi tafsir ayat dan hikmah mendalamnya... Sungguh agung firman Allah! 📖✨`;
    } else if (submoduleName === 'tajwid') {
      companion.dialogueMessage = `${companion.name} sedang fokus mencermati hukum tajwid dan ketepatan makhraj huruf! 🧐`;
    } else if (submoduleName === 'asbab') {
      companion.dialogueMessage = `${companion.name} takjub mendengarkan sejarah asbabun nuzul turunnya ayat suci! 📜`;
    } else if (submoduleName === 'bahasa') {
      companion.dialogueMessage = `${companion.name} senang sekali memperdalam kosakata bahasa Al-Qur'an! 🌟`;
    } else {
      companion.dialogueMessage = `${companion.name} sedang khusyuk menyimak dan mentadabburi lembaran ayat suci Al-Qur'an... 📖💭`;
    }

    this.saveCompanionData(companion);
    return companion;
  }

  /**
   * Emotive Reaction: App is idle for a long time, companion peacefully falls asleep
   */
  static onAppIdle(childId: string): CompanionData {
    const companion = this.getCompanionData(childId);
    if (!companion.isSleeping) {
      companion.isSleeping = true;
      companion.expression = 'sleeping';
      companion.mood = 'sleeping';
      companion.dialogueMessage = `Ssshh... Karena suasana tenang dan hening cukup lama, ${companion.name} tertidur pulas ditemani lantunan dzikir. Zzz... 🌙`;
      this.saveCompanionData(companion);
    }
    return companion;
  }
}
