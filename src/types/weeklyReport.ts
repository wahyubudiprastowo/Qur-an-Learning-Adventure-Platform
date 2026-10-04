export interface DailyProgressPoint {
  dayKey: string; // '2026-09-28'
  dayName: string; // 'Senin', 'Selasa', dll.
  shortDate: string; // '28 Sep'
  ayatHafal: number; // Jumlah ayat baru dihafal (Ziadah)
  ayatMurojaah: number; // Jumlah ayat diulang (Murojaah)
  totalAyat: number; // Total ayat dilatih
  menitBelajar: number; // Estimasi durasi (menit)
  skorKelancaran: number; // Rata-rata skor pengujian (0-100)
  bintang: number; // Bintang diraih
  xp: number; // XP diraih
  targetAyat: number; // Target harian
  statusTarget?: 'achieved' | 'partial' | 'rest';
  isToday: boolean;
}

export interface WeeklySurahBreakdown {
  surahNumber: number;
  surahName: string;
  nameArabic: string;
  ayatDihafal: number;
  totalAyat: number;
  persentase: number;
  status: 'mutqin' | 'sedang_berjalan' | 'perlu_review';
}

export interface WeeklyDistributionItem {
  name: string;
  value: number;
  color: string;
  description: string;
  icon?: string;
}

export interface WeeklyReportData {
  childId: string;
  childName: string;
  avatar: string;
  weekOffset: number; // 0 = minggu ini, -1 = minggu lalu
  weekLabel: string; // 'Minggu Ini (28 Sep - 04 Okt 2026)'
  periodRange: string;
  startDate: string;
  endDate: string;

  // Aggregate Metrics
  totalAyatHafalBaru: number;
  totalAyatMurojaah: number;
  totalAyatDisentuh: number;
  totalMenitBelajar: number;
  rataRataSkor: number; // e.g. 93%
  hariAktif: number; // e.g. 5 dari 7 hari
  totalBintangMingguan: number;
  totalXpMingguan: number;
  persenKenaikanVsMingguLalu: number;

  // Chart series data
  dailyData: DailyProgressPoint[];
  distributionData: WeeklyDistributionItem[];
  surahBreakdown: WeeklySurahBreakdown[];

  // Qualitative evaluations
  titleBadge: string;
  badgeIcon: string;
  encouragementMessage: string;
  parentReviewNote: string;
  strengths: string[];
  recommendations: string[];
}
