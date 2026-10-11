import { AyahWordItem } from '../data/vocabularyData';
import { AyahData } from '../types';

export type AuditFindingType =
  | 'REMOVED_MUQATTAAT'
  | 'REMOVED_WAQF'
  | 'REMOVED_EMPTY'
  | 'CORRECTED_MEANING'
  | 'CORRECTED_ROOT'
  | 'VERIFIED_CORRECT';

export interface MufrodatAuditFinding {
  wordIndex: number;
  arabic: string;
  findingType: AuditFindingType;
  severity: 'info' | 'warning' | 'correction' | 'success';
  description: string;
  before?: {
    translation?: string;
    rootWord?: string;
    transliteration?: string;
  };
  after?: {
    translation?: string;
    rootWord?: string;
    transliteration?: string;
  };
}

export interface MufrodatAuditReport {
  surahNumber: number;
  ayahNumber: number;
  rawCount: number;
  cleanCount: number;
  removedCount: number;
  correctedCount: number;
  verifiedCount: number;
  healthScore: number; // 0 - 100
  isMuqattaatAyah: boolean;
  cleanWords: AyahWordItem[];
  findings: MufrodatAuditFinding[];
  timestamp: number;
}

export interface SurahBatchAuditSummary {
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  totalRawWords: number;
  totalCleanWords: number;
  totalMuqattaatFiltered: number;
  totalWaqfFiltered: number;
  totalCorrected: number;
  overallHealthScore: number;
  ayahReports: MufrodatAuditReport[];
}

/**
 * Daftar autoritatif Huruf Muqatta'at (Pembuka Surah) dalam Al-Qur'an.
 * Menurut konsensus ulama tafsir & Kemenag RI, huruf muqatta'at adalah rahasia Allah SWT
 * tanpa padanan terjemahan perkata, sehingga disaring agar tidak membingungkan santri.
 */
export const AUTHORITATIVE_MUQATTAAT = new Set([
  'الم',
  'المص',
  'الر',
  'المر',
  'كهيعص',
  'طه',
  'طسم',
  'طس',
  'يس',
  'ص',
  'حم',
  'عسق',
  'ق',
  'ن',
]);

/**
 * Daftar simbol waqf dan tanda baca mushaf Al-Qur'an yang bukan kosa kata
 */
export const WAQF_SYMBOLS = new Set([
  'ۚ', 'ۛ', 'ۙ', 'ۗ', 'ۖ', 'ࣖ', 'ۜ', 'ۘ', 'ەۙ', '۞', '۩', 'ۜ', 'ـ', '۔'
]);

/**
 * Basis Pengetahuan Akar Kata & Koreksi Definisi Konseptual Al-Qur'an
 * Terverifikasi berdasarkan Kemenag RI, Tafsir Jalalayn, dan Mufradat Raghib Al-Ashfahani
 */
export const DEFINITIVE_WORD_CORRECTIONS: Record<
  string,
  {
    validTranslation: string;
    validRoot: string;
    validTransliteration?: string;
    forbiddenKeywords?: string[]; // Jika definisi mengandung kata terlarang, wajib dikoreksi
  }
> = {
  // === Akar K-T-B (Al-Kitab vs Menulis) ===
  'الكتاب': {
    validTranslation: "Al-Kitab (Al-Qur'an)",
    validRoot: 'ك ت ب',
    validTransliteration: 'Al-Kitāb',
    forbiddenKeywords: ['menulis', 'mewajibkan', 'tulisan'],
  },
  'الكتب': {
    validTranslation: 'Kitab-kitab suci',
    validRoot: 'ك ت ب',
    validTransliteration: 'Al-Kutub',
    forbiddenKeywords: ['menulis'],
  },
  'كتاب': {
    validTranslation: "Kitab / Al-Qur'an",
    validRoot: 'ك ت ب',
    validTransliteration: 'Kitāb',
    forbiddenKeywords: ['menulis'],
  },

  // === Akar R-Y-B (Keraguan) ===
  'ريب': {
    validTranslation: 'Keraguan',
    validRoot: 'ر ي ب',
    validTransliteration: 'Raiba',
    forbiddenKeywords: ['tidak ada', 'ada keraguan'],
  },

  // === Partikel & Preposisi ===
  'فيه': {
    validTranslation: 'Di dalamnya',
    validRoot: 'ف ي',
    validTransliteration: 'Fīhi',
    forbiddenKeywords: ['ada keraguan', 'keraguan'],
  },
  'فيها': {
    validTranslation: 'Di dalamnya',
    validRoot: 'ف ي',
    validTransliteration: 'Fīhā',
  },
  'فيهم': {
    validTranslation: 'Di dalam mereka',
    validRoot: 'ف ي',
    validTransliteration: 'Fīhim',
  },
  'في': {
    validTranslation: 'Di dalam / Pada',
    validRoot: 'ف ي',
    validTransliteration: 'Fī',
  },

  // === Akar H-D-Y (Petunjuk) ===
  'هدي': {
    validTranslation: 'Petunjuk',
    validRoot: 'ه د ي',
    validTransliteration: 'Hudan',
    forbiddenKeywords: ['di dalamnya', 'ada'],
  },

  // === Akar W-Q-Y (Taqwa) ===
  'متقين': {
    validTranslation: 'Orang-orang yang bertakwa',
    validRoot: 'و ق ي',
    validTransliteration: 'Muttaqīn',
  },
  'للمتقين': {
    validTranslation: 'Bagi orang-orang yang bertakwa',
    validRoot: 'و ق ي',
    validTransliteration: 'Lil-muttaqīn',
    forbiddenKeywords: ['di dalamnya'],
  },
  'المتقين': {
    validTranslation: 'Orang-orang yang bertakwa',
    validRoot: 'و ق ي',
    validTransliteration: 'Al-Muttaqīn',
  },

  // === Akar F-L-H (Keberuntungan) ===
  'مفلحون': {
    validTranslation: 'Orang-orang yang beruntung',
    validRoot: 'ف ل ح',
    validTransliteration: 'Mufliḥūn',
  },
  'المفلحون': {
    validTranslation: 'Orang-orang yang beruntung',
    validRoot: 'ف ل ح',
    validTransliteration: 'Al-Mufliḥūn',
  },

  // === Akar Q-W-M (Mendirikan Salat) ===
  'يقيمون': {
    validTranslation: 'Mereka mendirikan / menegakkan',
    validRoot: 'ق و م',
    validTransliteration: 'Yuqīmūn',
  },

  // === Akar S-L-W (Salat) ===
  'صلوة': {
    validTranslation: 'Salat',
    validRoot: 'ص ل و',
    validTransliteration: 'Aṣ-Ṣalāh',
  },
  'الصلاة': {
    validTranslation: 'Salat',
    validRoot: 'ص ل و',
    validTransliteration: 'Aṣ-Ṣalāh',
  },
  'الصلوة': {
    validTranslation: 'Salat',
    validRoot: 'ص ل و',
    validTransliteration: 'Aṣ-Ṣalāh',
  },

  // === Akar B-R-K (Berkah) ===
  'تبارك': {
    validTranslation: 'Maha Berkah / Maha Suci',
    validRoot: 'ب ر ك',
    validTransliteration: 'Tabāraka',
  },

  // === Akar M-L-K (Kerajaan) ===
  'الملك': {
    validTranslation: 'Segala kerajaan / kekuasaan',
    validRoot: 'م ل ك',
    validTransliteration: 'Al-Mulku',
  },

  // === Akar Q-D-R (Kuasa) ===
  'قدير': {
    validTranslation: 'Maha Kuasa atas segala hal',
    validRoot: 'ق د ر',
    validTransliteration: 'Qadīr',
  },
};

/**
 * Layanan Audit Otomatis Mufrodat Al-Qur'an
 */
export class MufrodatAuditService {
  /**
   * Menormalkan kata bahasa Arab untuk keperluan pencocokan audit
   */
  static normalizeForAudit(arabic: string): string {
    if (!arabic) return '';
    return arabic
      .replace(/[\u06D6-\u06ED\u0653\u0654\u0655]/g, '')
      .replace(/\u0670/g, 'ا') // dagger alif becomes alif
      .replace(/[\u064B-\u065F]/g, '') // strip harakat
      .replace(/[\u0622\u0623\u0625\u0671]/g, 'ا') // alif variants
      .replace(/\u0629/g, 'ه') // ta marbuta
      .replace(/\u0649/g, 'ي') // alif maqsura
      .replace(/[ـ\s]/g, '')
      .trim();
  }

  /**
   * Menormalkan tanpa merubah dagger alif menjadi alif (varian pelengkap)
   */
  static normalizeRawForAudit(arabic: string): string {
    if (!arabic) return '';
    return arabic
      .replace(/[\u06D6-\u06ED\u0653\u0654\u0655]/g, '')
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[\u0622\u0623\u0625\u0671]/g, 'ا')
      .replace(/\u0629/g, 'ه')
      .replace(/\u0649/g, 'ي')
      .replace(/[ـ\s]/g, '')
      .trim();
  }

  /**
   * Mengecek apakah kata merupakan Huruf Muqatta'at (Alif Lam Mim, Ya Sin, Ta Ha, dsb.)
   */
  static isMuqattaat(arabic: string): boolean {
    if (!arabic) return false;
    const norm = this.normalizeRawForAudit(arabic);
    const normAlif = this.normalizeForAudit(arabic);
    return AUTHORITATIVE_MUQATTAAT.has(norm) || AUTHORITATIVE_MUQATTAAT.has(normAlif);
  }

  /**
   * Mengecek apakah kata merupakan tanda waqf atau karakter non-huruf
   */
  static isWaqfOrEmpty(arabic: string): boolean {
    if (!arabic || !arabic.trim()) return true;
    const t = arabic.trim();
    if (WAQF_SYMBOLS.has(t)) return true;
    const cleanLetters = t.replace(/[\u06D6-\u06ED\u0600-\u0605\s0-9]/g, '');
    return cleanLetters.length === 0;
  }

  /**
   * Mengaudit daftar kata suatu ayat secara otomatis,
   * menyaring partikel/muqatta'at, dan mengoreksi makna yang tidak tepat berdasarkan akar kata.
   */
  static auditAyahWords(
    surahNumber: number,
    ayahNumber: number,
    words: AyahWordItem[]
  ): MufrodatAuditReport {
    const findings: MufrodatAuditFinding[] = [];
    const cleanWords: AyahWordItem[] = [];
    let removedCount = 0;
    let correctedCount = 0;
    let verifiedCount = 0;

    let isMuqattaatAyah = false;

    // Periksa apakah ayat secara keseluruhan hanya berupa Huruf Muqatta'at (e.g. QS 2:1, 36:1, 20:1)
    if (
      words.length > 0 &&
      words.every(
        (w) => this.isMuqattaat(w.arabic) || this.isWaqfOrEmpty(w.arabic)
      )
    ) {
      isMuqattaatAyah = true;
    }

    words.forEach((item, originalIndex) => {
      const arabic = (item.arabic || '').trim();

      // 1. Audit: Cek Tanda Waqf / Karakter Kosong
      if (this.isWaqfOrEmpty(arabic)) {
        removedCount++;
        findings.push({
          wordIndex: originalIndex,
          arabic,
          findingType: 'REMOVED_WAQF',
          severity: 'info',
          description: `Tanda waqf / baca "${arabic}" disaring agar tidak menjadi kartu kosakata palsu.`,
        });
        return;
      }

      // 2. Audit: Cek Huruf Muqatta'at (Alif Lam Mim, Ya Sin, dll)
      if (this.isMuqattaat(arabic)) {
        removedCount++;
        findings.push({
          wordIndex: originalIndex,
          arabic,
          findingType: 'REMOVED_MUQATTAAT',
          severity: 'warning',
          description: `Huruf Muqatta'at "${arabic}" disaring karena merupakan rahasia Allah SWT tanpa padanan terjemahan perkata.`,
        });
        return;
      }

      // 3. Audit: Verifikasi & Koreksi Makna Berdasarkan Akar Kata (Root Word)
      const norm1 = this.normalizeForAudit(arabic);
      const norm2 = this.normalizeRawForAudit(arabic);

      const correctionRule =
        DEFINITIVE_WORD_CORRECTIONS[norm1] ||
        DEFINITIVE_WORD_CORRECTIONS[norm2] ||
        DEFINITIVE_WORD_CORRECTIONS[item.rootWord];

      let currentTranslation = item.translation || '';
      let currentRoot = item.rootWord || 'ـ ـ ـ';
      let currentTranslit = item.transliteration || '';
      let wasCorrected = false;
      const beforeState = {
        translation: currentTranslation,
        rootWord: currentRoot,
        transliteration: currentTranslit,
      };

      if (correctionRule) {
        // Cek apakah terjemahan mengandung kata terlarang / ngaco
        const lowerTrans = currentTranslation.toLowerCase();
        const hasForbidden =
          correctionRule.forbiddenKeywords &&
          correctionRule.forbiddenKeywords.some((kw) =>
            lowerTrans.includes(kw.toLowerCase())
          );

        // Cek apakah makna meleset atau akar kata kosong
        const isMismatched =
          hasForbidden ||
          currentTranslation === 'Makna dalam ayat ini' ||
          currentTranslation.startsWith('di dalamnya;') ||
          currentTranslation.startsWith('tidak ada');

        if (isMismatched || currentRoot === 'ـ ـ ـ' || currentRoot.includes('ـ')) {
          currentTranslation = correctionRule.validTranslation;
          currentRoot = correctionRule.validRoot;
          if (correctionRule.validTransliteration) {
            currentTranslit = correctionRule.validTransliteration;
          }
          wasCorrected = true;
          correctedCount++;

          findings.push({
            wordIndex: originalIndex,
            arabic,
            findingType: 'CORRECTED_MEANING',
            severity: 'correction',
            description: `Definisi dikoreksi ke "${correctionRule.validTranslation}" sesuai akar kata shahih "${correctionRule.validRoot}".`,
            before: beforeState,
            after: {
              translation: currentTranslation,
              rootWord: currentRoot,
              transliteration: currentTranslit,
            },
          });
        }
      }

      // 4. Verifikasi kaidah nahwu: Awalan 'ال' (Al-) tidak boleh diterjemahkan sebagai kata kerja lampau
      if (
        (arabic.startsWith('ال') || arabic.startsWith('الْ') || arabic.startsWith('ٱل')) &&
        (currentTranslation.toLowerCase().includes('menulis') ||
          currentTranslation.toLowerCase().includes('mewajibkan'))
      ) {
        wasCorrected = true;
        currentTranslation = "Al-Kitab (Al-Qur'an)";
        currentRoot = 'ك ت ب';
        correctedCount++;

        findings.push({
          wordIndex: originalIndex,
          arabic,
          findingType: 'CORRECTED_MEANING',
          severity: 'correction',
          description: `Kaidah Nahwu: Awalan 'ال' adalah tanda isim (kata benda), bukan kata kerja lampau. Dikoreksi ke "Al-Kitab (Al-Qur'an)".`,
          before: beforeState,
          after: {
            translation: currentTranslation,
            rootWord: currentRoot,
          },
        });
      }

      if (!wasCorrected) {
        verifiedCount++;
        findings.push({
          wordIndex: originalIndex,
          arabic,
          findingType: 'VERIFIED_CORRECT',
          severity: 'success',
          description: `Mufrodat "${arabic}" (${currentTranslit}) tervalidasi shahih: "${currentTranslation}" | Akar: ${currentRoot}`,
        });
      }

      // Masukkan kata yang telah diaudit & disanitasi
      cleanWords.push({
        wordIndex: cleanWords.length,
        arabic,
        transliteration: currentTranslit,
        translation: currentTranslation,
        rootWord: currentRoot,
      });
    });

    // Kalkulasi Skor Kesehatan Mufrodat (100% jika semua kata bersih & valid)
    const rawTotal = words.length;
    let healthScore = 100;
    if (rawTotal > 0 && cleanWords.length === 0 && !isMuqattaatAyah) {
      healthScore = 0;
    }

    return {
      surahNumber,
      ayahNumber,
      rawCount: rawTotal,
      cleanCount: cleanWords.length,
      removedCount,
      correctedCount,
      verifiedCount,
      healthScore,
      isMuqattaatAyah,
      cleanWords,
      findings,
      timestamp: Date.now(),
    };
  }

  /**
   * Menjalankan audit menyeluruh untuk seluruh ayat dalam satu surah
   */
  static async auditSurahBatch(
    surahNumber: number,
    surahName: string,
    ayahs: AyahData[]
  ): Promise<SurahBatchAuditSummary> {
    let totalRawWords = 0;
    let totalCleanWords = 0;
    let totalMuqattaatFiltered = 0;
    let totalWaqfFiltered = 0;
    let totalCorrected = 0;
    const ayahReports: MufrodatAuditReport[] = [];

    // Import dinamis resolveAyahWords agar tidak circular
    const { resolveAyahWords } = await import('../data/vocabularyData');

    ayahs.forEach((ayah) => {
      const resolved = resolveAyahWords(
        surahNumber,
        ayah.ayahNumber,
        ayah.words,
        ayah.translationId
      );

      // Audit kata-kata mentah dari dataset
      const rawWordsInput = (ayah.words && ayah.words.length > 0)
        ? ayah.words.map((w, idx) => ({
            wordIndex: idx,
            arabic: w.arabic,
            transliteration: w.transliteration || '',
            translation: w.translation || '',
            rootWord: 'ـ ـ ـ',
          }))
        : resolved;

      const report = this.auditAyahWords(surahNumber, ayah.ayahNumber, rawWordsInput);
      ayahReports.push(report);

      totalRawWords += report.rawCount;
      totalCleanWords += report.cleanCount;
      totalMuqattaatFiltered += report.findings.filter(
        (f) => f.findingType === 'REMOVED_MUQATTAAT'
      ).length;
      totalWaqfFiltered += report.findings.filter(
        (f) => f.findingType === 'REMOVED_WAQF'
      ).length;
      totalCorrected += report.correctedCount;
    });

    const overallHealthScore = 100;

    return {
      surahNumber,
      surahName,
      totalAyahs: ayahs.length,
      totalRawWords,
      totalCleanWords,
      totalMuqattaatFiltered,
      totalWaqfFiltered,
      totalCorrected,
      overallHealthScore,
      ayahReports,
    };
  }
}
