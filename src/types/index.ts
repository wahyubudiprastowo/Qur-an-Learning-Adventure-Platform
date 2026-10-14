export type NavigationTab = 'beranda' | 'tahfiz' | 'alquran' | 'ibadah' | 'game' | 'akun';

export type LearningLevel = 'pemula' | 'menengah' | 'mahir';

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  birthYear?: number;
  age?: number;
  learningLevel: LearningLevel;
  totalStars: number;
  totalXp: number;
  level: number;
  streakDays: number;
  targetSurahNumber?: number;
  targetSurahName?: string;
  lastPracticedAyah?: number;
  dailyTargetAyahs?: number;
  lastActiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export type PlanTier = 'free' | 'pro';

export type AccountTier = 'guest' | 'free' | 'pro';

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userWhatsapp?: string;
  planId: string;
  planName: string;
  amountUsd: number;
  amountIdr: number;
  paymentMethod: 'card' | 'paypal' | 'qris' | 'bank_va' | 'ewallet' | 'bank_transfer_manual' | 'admin_manual';
  paymentMethodDetails?: string;
  cardLast4?: string;
  cardBrand?: string;
  status: 'success' | 'pending' | 'failed';
  invoiceNumber: string;
  createdAt: string;
  referralCode?: string;
  discountApplied?: number;
  transferBankName?: string;
  transferProofUrl?: string;
  senderAccountName?: string;
  senderBankName?: string;
  senderAccountNumber?: string;
  transferRrn?: string;
  fraudAnalysis?: FraudAnalysisResult;
  verifiedByAdminName?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
  assignedByAdmin?: boolean;
}

export interface FraudAnalysisResult {
  authenticityScore: number; // 0-100%
  status: 'verified_real' | 'suspicious' | 'confirmed_fake' | 'unverified';
  indicators: string[];
  mutationMatched: boolean;
  bankRefNumber?: string;
  senderAccountName?: string;
  matchedMutationTime?: string;
  notes?: string;
}

export interface BankMutationItem {
  id: string;
  bankName: string;
  accountNumber: string;
  timestamp: string;
  type: 'CR' | 'DB';
  amount: number;
  description: string;
  senderName: string;
  referenceNumber: string;
  isClaimed?: boolean;
}

export interface AdminManualAssignPayload {
  userId: string;
  planId: string;
  planName: string;
  durationMonths: number; // 1, 3, 6, 12, 999 for lifetime
  amountIdr: number;
  paymentSource: string;
  transferRefNumber?: string;
  adminNotes?: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminId?: string;
  action:
    | 'assign_pro'
    | 'toggle_tier'
    | 'verify_payment'
    | 'reject_payment'
    | 'custom_affiliate_link'
    | 'update_user'
    | 'payout_commission'
    | 'change_password'
    | 'change_admin_pin'
    | 'flag_fake_transfer'
    | 'suspend_user'
    | 'reactivate_user'
    | 'admin_login_2fa';
  targetUserId?: string;
  targetUserName?: string;
  targetUserEmail?: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
}

export interface UserLoginRecord {
  id: string;
  timestamp: string;
  ipAddress: string;
  device: string; // e.g. "Chrome 128 / Windows 11"
  location: string; // e.g. "Jakarta, Indonesia"
  status: 'success' | 'failed_wrong_pin' | 'suspicious_ip';
  isSuspicious?: boolean;
}

export interface UserAccount {
  id: string;
  email: string;
  parentName: string;
  studentName?: string;
  studentAge?: number;
  whatsapp?: string;
  targetGoal?: string;
  activeChildId: string;
  pin: string;
  password?: string;
  lastPasswordChange?: string;
  mustChangePasswordOnNextLogin?: boolean;
  accountStatus?: 'active' | 'suspended' | 'banned';
  suspendedReason?: string;
  suspendedAt?: string;
  twoFactorEnabled?: boolean;
  twoFactorMethod?: 'totp' | 'email';
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  twoFactorActivatedAt?: string;
  lastLogin?: {
    timestamp: string;
    ipAddress: string;
    device: string;
    location: string;
  };
  loginHistory?: UserLoginRecord[];
  affiliateCustomSlug?: string;
  entitlement: 'trial' | 'active' | 'lifetime' | 'free' | 'pro';
  planTier: PlanTier;
  entitlementExpiry: string;
  createdAt: string;
  isRegistered?: boolean;
  authProvider?: 'email' | 'whatsapp' | 'google' | 'apple';
  role?: 'admin' | 'user' | 'affiliate';
  aiTokensBalance?: number;
  dailyAiQuota?: number;
  customGeminiApiKey?: string;
  affiliateEnabled?: boolean;
  affiliateCode?: string;
  affiliateCommissionRate?: number; // 10%
  affiliateTotalEarnings?: number;
  affiliatePendingBalance?: number;
  affiliateBankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  affiliateLinkPrefix?: 'reff' | 'aff' | 'ref';
  referredByCode?: string;
}

export interface AffiliateReferralRecord {
  id: string;
  affiliateUserId: string;
  referralCode: string;
  referredUserName: string;
  referredUserEmail?: string;
  planName: string;
  transactionAmountIdr: number;
  commissionPercent: number; // 10%
  commissionEarnedIdr: number;
  status: 'pending' | 'ready_to_claim' | 'paid';
  createdAt: string;
  isRenewal?: boolean;
}

export interface AiTokenPackage {
  id: string;
  name: string;
  tokenCount: number;
  bonusTokens?: number;
  priceIdr: number;
  priceUsd: number;
  badge?: string;
  description: string;
  isPopular?: boolean;
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

export type EvaluationGrade = 'mumtaz' | 'jayyid' | 'perlu_ulang';

export interface TeacherEvaluation {
  status: 'pending' | 'evaluated';
  grade?: EvaluationGrade;
  evaluatorRole: 'parent' | 'teacher';
  evaluatorName: string;
  notes: string;
  evaluatedAt: string;
}

export interface BaselineComparison {
  baselineTajwid: number;
  baselineMakhraj: number;
  deltaTajwid: number;
  deltaMakhraj: number;
  tajwidConsistency: number; // 0-100%
  makhrajConsistency: number; // 0-100%
  overallConsistency: number; // 0-100%
  trend: 'improving' | 'stable' | 'needs_practice';
}

export interface HistoricalEvaluationRecord {
  id: string;
  childId: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  overallScore: number;
  accuracyScore: number;
  tajwidScore: number;
  makhrajScore: number;
  fluencyScore: number;
  consistencyScore: number;
  grade: EvaluationGrade;
  isPassed: boolean;
  timestamp: string;
  feedbackPreview: string;
}

export interface ProfileEvaluationBaseline {
  childId: string;
  totalEvaluations: number;
  baselineTajwid: number;
  baselineMakhraj: number;
  baselineAccuracy: number;
  baselineFluency: number;
  baselineOverall: number;
  rollingConsistencyScore: number;
  historyCount: number;
  lastUpdatedAt: string;
  recentRecords: HistoricalEvaluationRecord[];
}

export interface AiCorrectionResult {
  overallScore: number;
  grade: EvaluationGrade;
  accuracyScore: number;
  tajwidScore: number;
  fluencyScore: number;
  feedback: string;
  tajwidNotes: string[];
  makhrajTips?: string[];
  encouragementEmoji?: string;
  correctedLafal?: string;
  isPassed: boolean;
  evaluatedAt: string;
  modelUsed?: string;
  makhrajScore?: number;
  consistencyScore?: number;
  tajwidConsistency?: number;
  makhrajConsistency?: number;
  baselineComparison?: BaselineComparison;
}

export interface AyahRecording {
  id: string;
  childId: string;
  surahNumber: number;
  surahName?: string;
  ayahNumber: number;
  audioBlobUrl: string;
  audioDataUrl?: string;
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
  studentNote?: string;
  evaluation?: TeacherEvaluation;
  aiCorrection?: AiCorrectionResult;
}

export type AudioRetentionDays = 7 | 14 | 30 | 60 | 0; // 0 = simpan selamanya (manual)

export interface AudioStorageSettings {
  retentionDays: AudioRetentionDays;
  autoCleanupEnabled: boolean;
  saveToDeviceEnabled: boolean;
  lastCleanupTimestamp?: string;
}

export interface AudioStorageStats {
  totalRecordings: number;
  totalDurationSeconds: number;
  estimatedSizeBytes: number;
  estimatedSizeFormatted: string;
  oldestRecordingDate: string | null;
  newestRecordingDate: string | null;
  pendingCount: number;
  evaluatedCount: number;
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
  | 'GAME'
  | 'ADAB_TASK';

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
  jilid: 'A' | '1' | '2' | '3' | '4' | '5' | '6';
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

export interface MufrodatWordDetail {
  id: string;
  arabic: string;
  transliteration: string;
  meaningId: string;
  rootWord: string;
  surahNumber: number;
  ayahNumber: number;
  wordIndex: number;
}

export interface MufrodatDailyTracker {
  dailyGoal: number;
  reminderTime: string;
  reminderEnabled: boolean;
  streak: number;
  lastLearnedDate: string;
  todayLearnedCount: number;
  todayWordIds: string[];
}

export interface MufrodatLearningLevel {
  id: string;
  levelNumber: number;
  title: string;
  description: string;
  badge: string;
  surahNumbers: number[];
  themeColor: string;
}

export type MufrodatMasteryStage = 1 | 2 | 3; // 1: Mulai Mengenal (Bantuan Penuh), 2: Uji Ingatan (Arti Disembunyikan), 3: Mahir (Susun Kalimat)

export interface AudioAuditFlag {
  id: string; // Key, e.g. 'iqra-1-p1-r0-i0'
  jilid: string; // 'A' | '1' | '2' | '3' | '4' | '5' | '6'
  pageNumber: number;
  arabic: string;
  latin: string;
  status: 'needs_review' | 'verified';
  affectsVoice: 'both' | 'male_only' | 'female_only';
  issueCategory?: 'harakat' | 'makhraj' | 'speed' | 'waqaf' | 'other';
  notes: string;
  flaggedAt: string;
}
