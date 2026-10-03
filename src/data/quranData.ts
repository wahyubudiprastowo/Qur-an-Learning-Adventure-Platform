import { AyahData, WordToken } from '../types';
import coreQuranJson from './verifiedJuz30AndCore.json';

const WAQF_MARKS = new Set(['ۚ', 'ۛ', 'ۙ', 'ۗ', 'ۖ', 'ࣖ', 'ۜ', 'ۘ', 'ەۙ', '۞', '۩']);

/**
 * Converts Western digits to beautiful Arabic-Indic numerals for Mushaf ayah markers (١, ٢, ٣...)
 */
export function toArabicNumeral(n: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return n
    .toString()
    .split('')
    .map((d) => arabicDigits[parseInt(d, 10)] ?? d)
    .join('');
}

/**
 * Sanitizes words to ensure waqf symbols are merged into preceding words
 * so they are never rendered as standalone blank masks or floating pills.
 */
export function sanitizeWords(words?: WordToken[], rawArabicText?: string): WordToken[] {
  if (!words || words.length === 0) {
    if (!rawArabicText) return [];
    // Generate clean word tokens from arabic text
    const rawTokens = rawArabicText.split(' ').filter(Boolean);
    const cleaned: WordToken[] = [];
    let idx = 0;
    for (const token of rawTokens) {
      if (WAQF_MARKS.has(token) && cleaned.length > 0) {
        cleaned[cleaned.length - 1].arabic += ` ${token}`;
      } else {
        cleaned.push({
          index: idx,
          arabic: token,
          transliteration: '',
          translation: '',
          startMs: idx * 600,
          endMs: (idx + 1) * 600,
        });
        idx++;
      }
    }
    return cleaned;
  }

  const result: WordToken[] = [];
  for (const w of words) {
    const text = (w.arabic || '').trim();
    if (WAQF_MARKS.has(text) && result.length > 0) {
      result[result.length - 1].arabic += ` ${text}`;
    } else {
      result.push({
        ...w,
        index: result.length,
      });
    }
  }
  return result;
}

/**
 * Normalizes an array of AyahData ensuring proper words and metadata
 */
function normalizeAyahs(ayahs: any[], surahNumber: number): AyahData[] {
  return ayahs.map((a: any) => {
    const rawArabic = a.arabicText || a.teksArab || '';
    const words = sanitizeWords(a.words, rawArabic);

    return {
      surahNumber,
      ayahNumber: Number(a.ayahNumber || a.nomorAyat),
      arabicText: rawArabic,
      translationId: a.translationId || a.teksIndonesia || '',
      transliteration: a.transliteration || a.teksLatin || '',
      juz: Number(a.juz || 1),
      page: Number(a.page || 1),
      words,
    };
  });
}

/**
 * Synchronous core dataset for Al-Fatihah, Al-Kahf, Al-Mulk, and Juz 30.
 */
export const VERIFIED_QURAN_DATA: Record<number, AyahData[]> = {};

// Initialize core cache
const FULL_QURAN_CACHE = new Map<number, AyahData[]>();

Object.entries(coreQuranJson as Record<string, any[]>).forEach(([k, v]) => {
  const sNum = Number(k);
  const normalized = normalizeAyahs(v, sNum);
  VERIFIED_QURAN_DATA[sNum] = normalized;
  FULL_QURAN_CACHE.set(sNum, normalized);
});

let isFullQuranLoaded = false;

/**
 * Loads authentic ayahs for any of the 114 surahs.
 * Fast, reliable, never falls back to wrong surah.
 */
export async function getSurahAyahs(surahNumber: number): Promise<AyahData[]> {
  // 1. Check in-memory cache first
  if (FULL_QURAN_CACHE.has(surahNumber)) {
    return FULL_QURAN_CACHE.get(surahNumber)!;
  }

  // 2. Fetch specific surah file (fast, ~5KB - 50KB)
  try {
    const res = await fetch(`/data/surahs/${surahNumber}.json`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const normalized = normalizeAyahs(data, surahNumber);
        FULL_QURAN_CACHE.set(surahNumber, normalized);
        return normalized;
      }
    }
  } catch (err) {
    console.warn(`Could not load /data/surahs/${surahNumber}.json, falling back:`, err);
  }

  // 3. Fallback: try loading from full bundled /data/quran.json
  if (!isFullQuranLoaded) {
    try {
      const res = await fetch('/data/quran.json');
      if (res.ok) {
        const fullData = await res.json();
        Object.entries(fullData).forEach(([k, v]) => {
          const sNum = Number(k);
          if (!FULL_QURAN_CACHE.has(sNum)) {
            FULL_QURAN_CACHE.set(sNum, normalizeAyahs(v as any[], sNum));
          }
        });
        isFullQuranLoaded = true;
        if (FULL_QURAN_CACHE.has(surahNumber)) {
          return FULL_QURAN_CACHE.get(surahNumber)!;
        }
      }
    } catch (e) {
      console.warn('Could not load /data/quran.json, falling back to equran API:', e);
    }
  }

  // 4. Dynamic fetch from official equran.id API as cloud fallback
  try {
    const res = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.ayat) {
        const normalized = normalizeAyahs(data.data.ayat, surahNumber);
        FULL_QURAN_CACHE.set(surahNumber, normalized);
        return normalized;
      }
    }
  } catch (err) {
    console.error(`Failed to fetch surah ${surahNumber}:`, err);
  }

  // 5. Fallback to core if exists, otherwise empty array
  return VERIFIED_QURAN_DATA[surahNumber] || [];
}
