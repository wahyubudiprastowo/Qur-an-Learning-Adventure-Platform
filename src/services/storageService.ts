import {
  ChildProfile,
  UserAccount,
  ChildBlockProgress,
  ChildAyahProgress,
  PointsLedgerEntry,
  AyahRecording,
  TeacherEvaluation,
  PracticeSessionItem,
  PointsEventType,
  PaymentTransaction,
  AudioAuditFlag,
  AudioStorageSettings,
  AudioStorageStats,
  AudioRetentionDays,
  AffiliateReferralRecord,
} from '../types';
import { getLevelForXp } from '../data/levelsAndAchievements';
import {
  UserActivityItem,
  LeaderboardPlayerItem,
  INITIAL_RECENT_ACTIVITIES,
  INITIAL_LEADERBOARD_PLAYERS,
} from '../data/leaderboardAndActivityData';
import { AudioDatabaseService } from './audioDatabaseService';
import { SURAHS_METADATA } from '../data/surahsMetadata';

const STORAGE_KEYS = {
  USER_ACCOUNT: 'cahaya_tahfiz_user_account',
  ALL_USERS: 'cahaya_tahfiz_all_users',
  PAYMENT_HISTORY: 'cahaya_tahfiz_payment_history',
  RECENT_ACTIVITIES: 'cahaya_tahfiz_recent_activities',
  LEADERBOARD: 'cahaya_tahfiz_leaderboard',
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
  AUDIO_AUDIT_FLAGS: 'cahaya_tahfiz_audio_audit_flags',
  AUDIO_STORAGE_SETTINGS: 'cahaya_tahfiz_audio_storage_settings',
  AFFILIATE_REFERRALS: 'cahaya_tahfiz_affiliate_referrals',
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
  affiliateEnabled: true,
  affiliateCode: 'SARAH828',
  affiliateCommissionRate: 10,
  affiliateTotalEarnings: 59800,
  affiliatePendingBalance: 59800,
};

const DEFAULT_CHILDREN: ChildProfile[] = [
  {
    id: 'child-aisyah',
    name: 'Aisyah',
    avatar: '👧',
    birthYear: 2018,
    age: 8,
    learningLevel: 'pemula',
    targetSurahNumber: 114,
    targetSurahName: 'An-Nas',
    lastPracticedAyah: 1,
    dailyTargetAyahs: 3,
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
    age: 10,
    learningLevel: 'menengah',
    targetSurahNumber: 18,
    targetSurahName: 'Al-Kahf',
    lastPracticedAyah: 25,
    dailyTargetAyahs: 5,
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
  // --- Multi-User Account Management ---
  static getAllUsers(): UserAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    if (!raw) {
      const initial = [DEFAULT_USER];
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [DEFAULT_USER];
    }
  }

  static saveUserToRegistry(account: UserAccount) {
    const users = this.getAllUsers();
    const idx = users.findIndex((u) => u.id === account.id || u.email === account.email);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...account };
    } else {
      users.push(account);
    }
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
  }

  static switchAccount(userId: string): UserAccount {
    const users = this.getAllUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(target));
      if (target.activeChildId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CHILD_ID, target.activeChildId);
      }
      return target;
    }
    return this.getUserAccount();
  }

  static getUserAccount(): UserAccount {
    const data = localStorage.getItem(STORAGE_KEYS.USER_ACCOUNT);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(DEFAULT_USER));
      this.saveUserToRegistry(DEFAULT_USER);
      return DEFAULT_USER;
    }
    try {
      const parsed: UserAccount = JSON.parse(data);
      if (!parsed.affiliateCode) {
        parsed.affiliateCode = this.generateAffiliateCode(parsed);
        parsed.affiliateCommissionRate = 10;
        parsed.affiliateEnabled = true;
        localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(parsed));
        this.saveUserToRegistry(parsed);
      }
      return parsed;
    } catch {
      return DEFAULT_USER;
    }
  }

  static updateUserAccount(updates: Partial<UserAccount>): UserAccount {
    const current = this.getUserAccount();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(updated));
    this.saveUserToRegistry(updated);
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
    const newUserId = 'usr-' + Date.now().toString(36);
    const updated: UserAccount = {
      ...current,
      id: newUserId,
      parentName: name.trim() || current.parentName,
      email: email.trim().toLowerCase() || current.email,
      whatsapp: whatsapp?.trim() || current.whatsapp,
      targetGoal: targetGoal?.trim() || current.targetGoal,
      isRegistered: true,
      authProvider: 'email',
    };
    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(updated));
    this.saveUserToRegistry(updated);

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

  static loginWithProvider(
    identifier: string,
    provider: 'email' | 'whatsapp' | 'google' | 'apple',
    parentName?: string
  ): UserAccount {
    const users = this.getAllUsers();
    const isEmail = identifier.includes('@');
    const existing = users.find(
      (u) =>
        (isEmail && u.email.toLowerCase() === identifier.toLowerCase()) ||
        (!isEmail && u.whatsapp === identifier) ||
        (provider === 'google' && u.email.toLowerCase() === identifier.toLowerCase())
    );

    if (existing) {
      const updated: UserAccount = {
        ...existing,
        isRegistered: true,
        authProvider: provider,
        parentName: parentName || existing.parentName,
      };
      localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(updated));
      this.saveUserToRegistry(updated);
      return updated;
    }

    // New user registration via provider
    const newAccount: UserAccount = {
      id: 'usr-' + Date.now().toString(36),
      email: isEmail ? identifier.trim().toLowerCase() : `${identifier.replace(/\D/g, '')}@whatsapp.user`,
      whatsapp: !isEmail ? identifier.trim() : '',
      parentName: parentName || (provider === 'google' ? 'Pengguna Google' : provider === 'whatsapp' ? 'Sahabat WhatsApp' : 'Bunda Sarah'),
      activeChildId: 'child-aisyah',
      pin: '2026',
      entitlement: 'free',
      planTier: 'free',
      isRegistered: true,
      authProvider: provider,
      entitlementExpiry: '2027-12-31',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(newAccount));
    this.saveUserToRegistry(newAccount);
    return newAccount;
  }

  static logoutUser(): UserAccount {
    const guestUser: UserAccount = {
      ...DEFAULT_USER,
      id: 'guest-' + Date.now().toString(36),
      parentName: 'Tamu / Belum Masuk',
      email: '',
      isRegistered: false,
      planTier: 'free',
      entitlement: 'free',
    };
    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(guestUser));
    return guestUser;
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
    this.saveUserToRegistry(updated);
    return updated;
  }

  // --- AI Correction Access & Daily Quota ---
  static getDailyAiUsageCount(childId: string): number {
    const today = new Date().toISOString().split('T')[0];
    const key = `cahaya_tahfiz_ai_usage_${childId}_${today}`;
    const raw = localStorage.getItem(key);
    return raw ? parseInt(raw, 10) : 0;
  }

  static incrementDailyAiUsage(childId: string): number {
    const today = new Date().toISOString().split('T')[0];
    const key = `cahaya_tahfiz_ai_usage_${childId}_${today}`;
    const current = this.getDailyAiUsageCount(childId);
    const updated = current + 1;
    localStorage.setItem(key, String(updated));
    return updated;
  }

  static checkAiEvaluationAccess(childId: string): {
    allowed: boolean;
    isPro: boolean;
    usedToday: number;
    dailyLimit: number;
    remainingDaily: number;
    tokenBalance: number;
    hasCustomApiKey: boolean;
    source: 'daily' | 'token_balance' | 'byok' | 'none';
    reason: 'ok' | 'need_upgrade_or_token' | 'pro_daily_exceeded_need_token';
  } {
    const account = this.getUserAccount();
    const hasCustomApiKey = Boolean(account.customGeminiApiKey && account.customGeminiApiKey.trim().length > 10);
    const isPro = account.planTier === 'pro' || account.entitlement === 'active';
    const usedToday = this.getDailyAiUsageCount(childId);
    const tokenBalance = account.aiTokensBalance || 0;

    // 1. BYOK (Bring Your Own Key) - completely free & unlimited from user's personal Google key
    if (hasCustomApiKey) {
      return {
        allowed: true,
        isPro,
        usedToday,
        dailyLimit: 9999,
        remainingDaily: 9999,
        tokenBalance,
        hasCustomApiKey: true,
        source: 'byok',
        reason: 'ok',
      };
    }

    // 2. Free vs Pro Daily Quota:
    // Free: 1x kuota per hari (uji coba awal aman biaya server)
    // Pro: 20x kuota per hari (Fair Usage Policy untuk melindungi kapasitas token server)
    const dailyLimit = isPro ? (account.dailyAiQuota || 20) : (account.dailyAiQuota || 1);
    const remainingDaily = Math.max(0, dailyLimit - usedToday);

    if (remainingDaily > 0) {
      return {
        allowed: true,
        isPro,
        usedToday,
        dailyLimit,
        remainingDaily,
        tokenBalance,
        hasCustomApiKey: false,
        source: 'daily',
        reason: 'ok',
      };
    }

    // 3. If daily quota exhausted, check purchased Top-Up AI Token Balance
    if (tokenBalance > 0) {
      return {
        allowed: true,
        isPro,
        usedToday,
        dailyLimit,
        remainingDaily: 0,
        tokenBalance,
        hasCustomApiKey: false,
        source: 'token_balance',
        reason: 'ok',
      };
    }

    // 4. Exhausted
    return {
      allowed: false,
      isPro,
      usedToday,
      dailyLimit,
      remainingDaily: 0,
      tokenBalance: 0,
      hasCustomApiKey: false,
      source: 'none',
      reason: isPro ? 'pro_daily_exceeded_need_token' : 'need_upgrade_or_token',
    };
  }

  static consumeAiEvaluation(childId: string): {
    success: boolean;
    source: 'daily' | 'token_balance' | 'byok' | 'none';
  } {
    const access = this.checkAiEvaluationAccess(childId);
    if (!access.allowed) {
      return { success: false, source: 'none' };
    }

    if (access.source === 'byok') {
      return { success: true, source: 'byok' };
    }

    if (access.source === 'daily') {
      this.incrementDailyAiUsage(childId);
      return { success: true, source: 'daily' };
    }

    if (access.source === 'token_balance') {
      const account = this.getUserAccount();
      const current = account.aiTokensBalance || 0;
      if (current > 0) {
        account.aiTokensBalance = current - 1;
        this.updateUserAccount({ aiTokensBalance: account.aiTokensBalance });
      }
      return { success: true, source: 'token_balance' };
    }

    return { success: true, source: 'daily' };
  }

  static addAiTokens(tokens: number, packageName?: string): UserAccount {
    const account = this.getUserAccount();
    const newBalance = (account.aiTokensBalance || 0) + tokens;
    const updated = this.updateUserAccount({ aiTokensBalance: newBalance });

    this.addActivity({
      userName: account.parentName,
      actionText: `berhasil top-up ${tokens} Token Koreksi AI Guru${packageName ? ` (${packageName})` : ''}!`,
      score: 300,
    });
    return updated;
  }

  static setCustomGeminiApiKey(apiKey: string): UserAccount {
    return this.updateUserAccount({ customGeminiApiKey: apiKey.trim() });
  }

  // --- Payment History & Transactions ---
  static getPaymentHistory(): PaymentTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENT_HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static recordPayment(tx: PaymentTransaction) {
    const history = this.getPaymentHistory();
    history.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_HISTORY, JSON.stringify(history));

    // Automatically elevate user to PRO
    this.setPlanTier('pro');

    // Add activity record
    this.addActivity({
      userName: StorageService.getUserAccount().parentName,
      actionText: `berhasil mengaktifkan ${tx.planName}!`,
      score: 1000,
    });
  }

  // --- Affiliate & Referral System (Sahabat Syiar 10%) ---
  static getAffiliateReferrals(userId: string): AffiliateReferralRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AFFILIATE_REFERRALS);
    if (!raw) {
      // Seed initial sample referrals for immediate delight & transparency
      const sample: AffiliateReferralRecord[] = [
        {
          id: 'ref-sample-1',
          affiliateUserId: userId,
          referralCode: 'SARAH828',
          referredUserName: 'Keluarga Ananda Zaidan',
          referredUserEmail: 'zaidan.tahfiz@gmail.com',
          planName: 'Cahaya Tahfiz Premium 1 Tahun',
          transactionAmountIdr: 299000,
          commissionPercent: 10,
          commissionEarnedIdr: 29900,
          status: 'ready_to_claim',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          isRenewal: false,
        },
        {
          id: 'ref-sample-2',
          affiliateUserId: userId,
          referralCode: 'SARAH828',
          referredUserName: 'Ustadzah Fatimah (Santri Rumah Quran)',
          referredUserEmail: 'fatimah.rq@gmail.com',
          planName: 'Perpanjangan Paket 1 Tahun (Renewal)',
          transactionAmountIdr: 299000,
          commissionPercent: 10,
          commissionEarnedIdr: 29900,
          status: 'ready_to_claim',
          createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          isRenewal: true,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.AFFILIATE_REFERRALS, JSON.stringify(sample));
      return sample.filter((r) => r.affiliateUserId === userId);
    }
    try {
      const all: AffiliateReferralRecord[] = JSON.parse(raw);
      return all.filter((r) => r.affiliateUserId === userId);
    } catch {
      return [];
    }
  }

  static toggleAffiliateProgram(enabled: boolean): UserAccount {
    const account = this.getUserAccount();
    if (!account.affiliateCode) {
      account.affiliateCode = this.generateAffiliateCode(account);
    }
    return this.updateUserAccount({
      affiliateEnabled: enabled,
      affiliateCode: account.affiliateCode,
      affiliateCommissionRate: 10,
    });
  }

  static generateAffiliateCode(user: UserAccount): string {
    const cleanName = (user.parentName || 'TAHFIZ')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6) || 'SYIAR';
    const rand = Math.floor(100 + Math.random() * 900);
    return `${cleanName}${rand}`;
  }

  static recordReferralCommission(
    referralCode: string,
    planName: string,
    amountIdr: number,
    studentName: string,
    isRenewal: boolean = false
  ): boolean {
    const cleanCode = referralCode.trim().toUpperCase();
    const users = this.getAllUsers();
    let owner = users.find((u) => u.affiliateCode?.toUpperCase() === cleanCode);
    const currentUser = this.getUserAccount();
    if (!owner && currentUser.affiliateCode?.toUpperCase() === cleanCode) {
      owner = currentUser;
    }
    if (!owner) return false;

    const commissionPercent = owner.affiliateCommissionRate || 10;
    const commissionEarnedIdr = Math.round((amountIdr * commissionPercent) / 100);

    const record: AffiliateReferralRecord = {
      id: `aff-ref-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      affiliateUserId: owner.id,
      referralCode: cleanCode,
      referredUserName: studentName,
      planName: isRenewal ? `${planName} (Perpanjangan/Renewal)` : planName,
      transactionAmountIdr: amountIdr,
      commissionPercent,
      commissionEarnedIdr,
      status: 'ready_to_claim',
      createdAt: new Date().toISOString(),
      isRenewal,
    };

    const raw = localStorage.getItem(STORAGE_KEYS.AFFILIATE_REFERRALS);
    let allRecords: AffiliateReferralRecord[] = [];
    if (raw) {
      try {
        allRecords = JSON.parse(raw);
      } catch {}
    }
    allRecords.unshift(record);
    localStorage.setItem(STORAGE_KEYS.AFFILIATE_REFERRALS, JSON.stringify(allRecords));

    // Update owner balances
    const newTotal = (owner.affiliateTotalEarnings || 0) + commissionEarnedIdr;
    const newPending = (owner.affiliatePendingBalance || 0) + commissionEarnedIdr;
    owner.affiliateTotalEarnings = newTotal;
    owner.affiliatePendingBalance = newPending;
    this.saveUserToRegistry(owner);

    if (currentUser.id === owner.id) {
      this.updateUserAccount({
        affiliateTotalEarnings: newTotal,
        affiliatePendingBalance: newPending,
      });
    }

    this.addActivity({
      userName: owner.parentName,
      actionText: isRenewal
        ? `mendapatkan komisi 10% Sahabat Syiar (Rp ${commissionEarnedIdr.toLocaleString('id-ID')}) dari perpanjangan (renewal) santri PRO! 🔄`
        : `mendapatkan komisi 10% Sahabat Syiar (Rp ${commissionEarnedIdr.toLocaleString('id-ID')}) dari pendaftaran santri baru! 🎓`,
      score: 500,
    });

    return true;
  }

  static updateParentPin(newPin: string): UserAccount {
    return this.updateUserAccount({ pin: newPin.trim() });
  }

  // --- Live Activity Feed & Leaderboard ---
  static getRecentActivities(): UserActivityItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_ACTIVITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECENT_ACTIVITIES, JSON.stringify(INITIAL_RECENT_ACTIVITIES));
      return INITIAL_RECENT_ACTIVITIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_RECENT_ACTIVITIES;
    }
  }

  static addActivity(item: Partial<UserActivityItem>) {
    const activities = this.getRecentActivities();
    const activeChild = this.getActiveChild();
    const newAct: UserActivityItem = {
      id: 'act-' + Date.now(),
      userName: item.userName || activeChild?.name || 'Santri Cilik',
      userAvatar: item.userAvatar || activeChild?.avatar || '🌟',
      userLevel: item.userLevel || activeChild?.level || 1,
      gameId: item.gameId || 'tahfiz',
      gameName: item.gameName || 'Hafalan Qur\'an',
      gameIcon: item.gameIcon || '⭐',
      score: item.score || 100,
      timeAgoText: 'Baru saja',
      timestamp: Date.now(),
      actionText: item.actionText || `meraih ${item.score || 100} poin`,
    };
    activities.unshift(newAct);
    localStorage.setItem(STORAGE_KEYS.RECENT_ACTIVITIES, JSON.stringify(activities.slice(0, 30)));
  }

  static getLeaderboard(): LeaderboardPlayerItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    const activeChild = this.getActiveChild();
    let players: LeaderboardPlayerItem[] = INITIAL_LEADERBOARD_PLAYERS;

    if (raw) {
      try {
        players = JSON.parse(raw);
      } catch {
        players = INITIAL_LEADERBOARD_PLAYERS;
      }
    }

    if (activeChild) {
      const exists = players.some((p) => p.userName.toLowerCase() === activeChild.name.toLowerCase());
      if (!exists) {
        players.push({
          rank: players.length + 1,
          userName: `${activeChild.name} (Kamu)`,
          userAvatar: activeChild.avatar,
          userLevel: activeChild.level,
          score: activeChild.totalXp * 10,
          isCurrentUser: true,
        });
      }
    }

    return players;
  }

  static getChildren(): ChildProfile[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHILDREN_PROFILES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CHILDREN_PROFILES, JSON.stringify(DEFAULT_CHILDREN));
      this.seedInitialChildProgress('child-aisyah');
      this.seedInitialChildProgress('child-ahmad');
      return DEFAULT_CHILDREN;
    }
    try {
      const parsed: ChildProfile[] = JSON.parse(data);
      let updated = false;
      const currentYear = new Date().getFullYear();
      const enriched = parsed.map((c) => {
        const calcAge = c.age || (c.birthYear ? currentYear - c.birthYear : 8);
        const targetSurah = c.targetSurahNumber || (c.id === 'child-ahmad' ? 18 : 114);
        const targetName = c.targetSurahName || (c.id === 'child-ahmad' ? 'Al-Kahf' : 'An-Nas');
        const lastAyah = c.lastPracticedAyah || (c.id === 'child-ahmad' ? 25 : 1);

        if (!c.age || !c.targetSurahNumber || !c.lastPracticedAyah) {
          updated = true;
          return {
            ...c,
            age: calcAge,
            targetSurahNumber: targetSurah,
            targetSurahName: targetName,
            lastPracticedAyah: lastAyah,
          };
        }
        return c;
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.CHILDREN_PROFILES, JSON.stringify(enriched));
      }
      return enriched;
    } catch {
      return DEFAULT_CHILDREN;
    }
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

  static createChild(
    name: string,
    avatar: string,
    learningLevel: ChildProfile['learningLevel'],
    birthYear?: number,
    targetSurahNumber: number = 114,
    targetSurahName: string = 'An-Nas'
  ): ChildProfile {
    const children = this.getChildren();
    const currentYear = new Date().getFullYear();
    const age = birthYear ? currentYear - birthYear : 8;
    const newChild: ChildProfile = {
      id: `child-${Date.now()}`,
      name,
      avatar,
      birthYear,
      age,
      learningLevel,
      targetSurahNumber,
      targetSurahName,
      lastPracticedAyah: 1,
      dailyTargetAyahs: 3,
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
    this.seedInitialChildProgress(newChild.id);
    return newChild;
  }

  static updateChild(childId: string, updates: Partial<ChildProfile>): ChildProfile {
    const children = this.getChildren();
    const idx = children.findIndex((c) => c.id === childId);
    if (idx !== -1) {
      const currentYear = new Date().getFullYear();
      const updatedBirthYear = updates.birthYear !== undefined ? updates.birthYear : children[idx].birthYear;
      const updatedAge = updates.age !== undefined
        ? updates.age
        : updatedBirthYear
        ? currentYear - updatedBirthYear
        : children[idx].age || 8;

      children[idx] = {
        ...children[idx],
        ...updates,
        age: updatedAge,
        updatedAt: new Date().toISOString(),
      };
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

    // Seed recent practice session specific to child profile
    const isAhmad = childId === 'child-ahmad';
    const lastSession = {
      surahNumber: isAhmad ? 18 : 114,
      surahName: isAhmad ? 'Al-Kahf' : 'An-Nas',
      blockNumber: isAhmad ? 12 : 1,
      startAyah: isAhmad ? 25 : 1,
      endAyah: isAhmad ? 26 : 3,
      mode: isAhmad ? 'ziadah' : 'hafalan',
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.LAST_SESSION + childId, JSON.stringify(lastSession));
  }

  // --- Last Learning Session ---
  static getLastSession(childId: string) {
    const data = localStorage.getItem(STORAGE_KEYS.LAST_SESSION + childId);
    if (!data) {
      const children = this.getChildren();
      const child = children.find((c) => c.id === childId);
      const isAhmad = childId === 'child-ahmad' || child?.name?.toLowerCase().includes('ahmad');
      const targetSurah = child?.targetSurahNumber || (isAhmad ? 18 : 114);
      const targetAyah = child?.lastPracticedAyah || (isAhmad ? 25 : 1);
      const meta = SURAHS_METADATA.find((s) => s.number === targetSurah) || SURAHS_METADATA[0];
      const initialSession = {
        surahNumber: targetSurah,
        surahName: meta.nameLatin,
        blockNumber: isAhmad ? 12 : 1,
        startAyah: targetAyah,
        endAyah: Math.min(targetAyah + 2, meta.ayahCount),
        mode: isAhmad ? 'ziadah' : 'hafalan',
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.LAST_SESSION + childId, JSON.stringify(initialSession));
      return initialSession;
    }
    try {
      return JSON.parse(data);
    } catch {
      return {
        surahNumber: 114,
        surahName: 'An-Nas',
        blockNumber: 1,
        startAyah: 1,
        endAyah: 3,
        mode: 'hafalan' as const,
        timestamp: new Date().toISOString(),
      };
    }
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

  static getRecordingByAyah(childId: string, surahNumber: number, ayahNumber: number): AyahRecording | undefined {
    const list = this.getRecordings(childId);
    return list.find((r) => r.surahNumber === surahNumber && r.ayahNumber === ayahNumber);
  }

  static saveRecording(recording: AyahRecording): void {
    const list = this.getRecordings(recording.childId);
    const existingIdx = list.findIndex(
      (r) => r.id === recording.id || (r.surahNumber === recording.surahNumber && r.ayahNumber === recording.ayahNumber)
    );
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...recording };
    } else {
      list.unshift(recording);
    }
    localStorage.setItem(STORAGE_KEYS.RECORDINGS_PREFIX + recording.childId, JSON.stringify(list));
  }

  static updateRecordingEvaluation(
    childId: string,
    recordingId: string,
    evaluation: TeacherEvaluation
  ): AyahRecording | null {
    const list = this.getRecordings(childId);
    const idx = list.findIndex((r) => r.id === recordingId);
    if (idx >= 0) {
      list[idx].evaluation = evaluation;
      localStorage.setItem(STORAGE_KEYS.RECORDINGS_PREFIX + childId, JSON.stringify(list));
      return list[idx];
    }
    return null;
  }

  static deleteRecording(childId: string, recordingId: string): void {
    let list = this.getRecordings(childId);
    list = list.filter((r) => r.id !== recordingId);
    localStorage.setItem(STORAGE_KEYS.RECORDINGS_PREFIX + childId, JSON.stringify(list));
    AudioDatabaseService.deleteAudio(recordingId).catch(() => {});
  }

  static deleteRecordingByAyah(childId: string, surahNumber: number, ayahNumber: number): void {
    let list = this.getRecordings(childId);
    const toDelete = list.filter((r) => r.surahNumber === surahNumber && r.ayahNumber === ayahNumber);
    list = list.filter((r) => !(r.surahNumber === surahNumber && r.ayahNumber === ayahNumber));
    localStorage.setItem(STORAGE_KEYS.RECORDINGS_PREFIX + childId, JSON.stringify(list));
    for (const rec of toDelete) {
      AudioDatabaseService.deleteAudio(rec.id).catch(() => {});
    }
  }

  // --- Audio Storage Settings & Retention Policy ---
  static getAudioStorageSettings(): AudioStorageSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIO_STORAGE_SETTINGS);
    if (!raw) {
      const defaultSettings: AudioStorageSettings = {
        retentionDays: 30, // Default 30 hari otomatis dibersihkan
        autoCleanupEnabled: true,
        saveToDeviceEnabled: true,
      };
      localStorage.setItem(STORAGE_KEYS.AUDIO_STORAGE_SETTINGS, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        retentionDays: 30,
        autoCleanupEnabled: true,
        saveToDeviceEnabled: true,
      };
    }
  }

  static updateAudioStorageSettings(updates: Partial<AudioStorageSettings>): AudioStorageSettings {
    const current = this.getAudioStorageSettings();
    const updated: AudioStorageSettings = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.AUDIO_STORAGE_SETTINGS, JSON.stringify(updated));
    return updated;
  }

  /**
   * Automatically cleans up recordings older than retentionDays (e.g. 7 or 30 days)
   * to ensure device and browser database storage does not fill up in multi-user settings.
   */
  static runAutoCleanupRecordings(childId?: string): { deletedCount: number; remainingCount: number } {
    const settings = this.getAudioStorageSettings();
    if (!settings.autoCleanupEnabled || settings.retentionDays <= 0) {
      const currentList = childId ? this.getRecordings(childId) : [];
      return { deletedCount: 0, remainingCount: currentList.length };
    }

    const cutoffMs = Date.now() - settings.retentionDays * 24 * 60 * 60 * 1000;
    let totalDeleted = 0;

    const childrenToClean: string[] = childId ? [childId] : this.getChildren().map((c) => c.id);

    for (const cId of childrenToClean) {
      const list = this.getRecordings(cId);
      const toKeep: AyahRecording[] = [];
      const toDeleteIds: string[] = [];

      for (const rec of list) {
        const recTime = new Date(rec.createdAt).getTime();
        if (recTime < cutoffMs) {
          toDeleteIds.push(rec.id);
        } else {
          toKeep.push(rec);
        }
      }

      if (toDeleteIds.length > 0) {
        totalDeleted += toDeleteIds.length;
        localStorage.setItem(STORAGE_KEYS.RECORDINGS_PREFIX + cId, JSON.stringify(toKeep));
        AudioDatabaseService.deleteMultipleAudio(toDeleteIds).catch(() => {});
      }
    }

    this.updateAudioStorageSettings({ lastCleanupTimestamp: new Date().toISOString() });

    const remaining = childId ? this.getRecordings(childId).length : 0;
    return { deletedCount: totalDeleted, remainingCount: remaining };
  }

  /**
   * Deletes all recordings for a child, or optionally for a specific surah.
   */
  static deleteAllRecordings(childId: string, surahNumber?: number): number {
    const list = this.getRecordings(childId);
    let toDeleteIds: string[] = [];
    let toKeep: AyahRecording[] = [];

    if (surahNumber !== undefined) {
      for (const rec of list) {
        if (rec.surahNumber === surahNumber) {
          toDeleteIds.push(rec.id);
        } else {
          toKeep.push(rec);
        }
      }
    } else {
      toDeleteIds = list.map((r) => r.id);
      toKeep = [];
    }

    localStorage.setItem(STORAGE_KEYS.RECORDINGS_PREFIX + childId, JSON.stringify(toKeep));
    if (toDeleteIds.length > 0) {
      AudioDatabaseService.deleteMultipleAudio(toDeleteIds).catch(() => {});
    }
    return toDeleteIds.length;
  }

  /**
   * Computes storage metrics for a child's recordings.
   */
  static getAudioStorageStats(childId: string): AudioStorageStats {
    const list = this.getRecordings(childId);
    const totalRecordings = list.length;
    let totalDurationSeconds = 0;
    let estimatedSizeBytes = 0;
    let pendingCount = 0;
    let evaluatedCount = 0;

    let oldestMs: number | null = null;
    let newestMs: number | null = null;

    for (const rec of list) {
      totalDurationSeconds += rec.durationSeconds || 0;
      if (rec.evaluation?.status === 'evaluated') {
        evaluatedCount++;
      } else {
        pendingCount++;
      }

      // If dataUrl exists, count its byte length; otherwise estimate ~16KB per second of voice
      if (rec.audioDataUrl) {
        estimatedSizeBytes += rec.audioDataUrl.length;
      } else {
        estimatedSizeBytes += Math.max(8192, (rec.durationSeconds || 5) * 16000);
      }

      const t = new Date(rec.createdAt).getTime();
      if (!isNaN(t)) {
        if (oldestMs === null || t < oldestMs) oldestMs = t;
        if (newestMs === null || t > newestMs) newestMs = t;
      }
    }

    let estimatedSizeFormatted = '0 KB';
    if (estimatedSizeBytes > 1024 * 1024) {
      estimatedSizeFormatted = `${(estimatedSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (estimatedSizeBytes > 0) {
      estimatedSizeFormatted = `${Math.round(estimatedSizeBytes / 1024)} KB`;
    }

    return {
      totalRecordings,
      totalDurationSeconds,
      estimatedSizeBytes,
      estimatedSizeFormatted,
      oldestRecordingDate: oldestMs ? new Date(oldestMs).toISOString() : null,
      newestRecordingDate: newestMs ? new Date(newestMs).toISOString() : null,
      pendingCount,
      evaluatedCount,
    };
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

  // --- Audio Audit Center Flags ---
  static getAudioAuditFlags(): Record<string, AudioAuditFlag> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIO_AUDIT_FLAGS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static saveAudioAuditFlag(flag: AudioAuditFlag): void {
    try {
      const current = this.getAudioAuditFlags();
      current[flag.id] = flag;
      localStorage.setItem(STORAGE_KEYS.AUDIO_AUDIT_FLAGS, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to save audio audit flag:', e);
    }
  }

  static removeAudioAuditFlag(flagId: string): void {
    try {
      const current = this.getAudioAuditFlags();
      delete current[flagId];
      localStorage.setItem(STORAGE_KEYS.AUDIO_AUDIT_FLAGS, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to remove audio audit flag:', e);
    }
  }

  static clearAudioAuditFlags(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUDIO_AUDIT_FLAGS);
    } catch (e) {
      console.warn('Failed to clear audio audit flags:', e);
    }
  }

  // --- Voice Gender Preference (Ustadz / Ustadzah) ---
  static getPreferredVoiceGender(): 'male' | 'female' {
    try {
      const saved =
        localStorage.getItem('cahaya_tahfiz_iqra_voice_gender') ||
        localStorage.getItem('iqra_voice_gender');
      if (saved === 'male' || saved === 'female') return saved;
    } catch {}
    return 'female';
  }

  static setPreferredVoiceGender(gender: 'male' | 'female'): void {
    try {
      localStorage.setItem('cahaya_tahfiz_iqra_voice_gender', gender);
      localStorage.setItem('iqra_voice_gender', gender);
    } catch (e) {
      console.warn('Failed to save preferred voice gender:', e);
    }
  }
}
