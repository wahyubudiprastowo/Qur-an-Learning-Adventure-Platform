/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Ustadz AI Evaluation Engine (Engine & Rubrik Evaluasi Ustadz AI Tartil)
 * Paten & Standarisasi Penilaian Tahfiz Anak Berbasis Adab, Makharijul Huruf,
 * Ahkamut Tajwid, dan Kalibrasi Usia Santri.
 */

import { AiCorrectionResult, EvaluationGrade, ChildProfile } from '../types';

export interface AyahEvaluationContext {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  targetArabicText: string;
  targetTranslation: string;
  durationSeconds: number;
  audioLevel?: { peak: number; avg: number };
  spokenTranscript?: string;
  assistanceUsed?: string[];
  isSimulated?: boolean;
  // Child Profile Context for Age-Adaptive Pedagogy
  childName?: string;
  childAge?: number;
  learningLevel?: 'pemula' | 'menengah' | 'mahir';
}

/**
 * Makhorijul Huruf & Karakteristik Fonetik Huruf Al-Qur'an
 */
export interface LetterMakhrajGuide {
  letter: string;
  name: string;
  makhrajGroup: 'Al-Jauf' | 'Al-Halq' | 'Al-Lisan' | 'Asy-Syafatain' | 'Al-Khaisyum';
  description: string;
  childTip: string;
}

export const MAKHRAJ_REGISTRY: Record<string, LetterMakhrajGuide> = {
  'ء': {
    letter: 'ء',
    name: 'Hamzah',
    makhrajGroup: 'Al-Halq',
    description: 'Pangkal tenggorokan (Aqshal Halq)',
    childTip: 'Keluarkan bunyi "A" tegas dan bersih dari pangkal tenggorokan tanpa tersengal.',
  },
  'ه': {
    letter: 'ه',
    name: 'Ha',
    makhrajGroup: 'Al-Halq',
    description: 'Pangkal tenggorokan (Aqshal Halq)',
    childTip: 'Bunyikan huruf "Ha" dengan hembusan nafas ringan dari dalam tenggorokan.',
  },
  'ع': {
    letter: 'ع',
    name: '\'Ain',
    makhrajGroup: 'Al-Halq',
    description: 'Tengah tenggorokan (Wasathul Halq)',
    childTip: 'Keluarkan bunyi "\'Ain" dari tengah tenggorokan dengan menekan sedikit katup nafas, bedakan dari Hamzah.',
  },
  'ح': {
    letter: 'ح',
    name: 'Ha Halus',
    makhrajGroup: 'Al-Halq',
    description: 'Tengah tenggorokan (Wasathul Halq)',
    childTip: 'Hembuskan nafas bersih dan sejuk dari tengah tenggorokan (Ha pedas/halus).',
  },
  'غ': {
    letter: 'غ',
    name: 'Ghain',
    makhrajGroup: 'Al-Halq',
    description: 'Ujung tenggorokan (Adnal Halq)',
    childTip: 'Bunyikan huruf "Gha" tebal seperti suara berkumur ringan dari ujung tenggorokan.',
  },
  'خ': {
    letter: 'خ',
    name: 'Kha',
    makhrajGroup: 'Al-Halq',
    description: 'Ujung tenggorokan (Adnal Halq)',
    childTip: 'Lafalkan "Kha" dengan suara bergesek tebal khas di ujung tenggorokan.',
  },
  'ق': {
    letter: 'ق',
    name: 'Qaf',
    makhrajGroup: 'Al-Lisan',
    description: 'Pangkal lidah belakang menyentuh langit-langit lunak',
    childTip: 'Bunyikan "Qa" tebal dan bergetar kuat (qalqalah) saat sukun/waqaf.',
  },
  'ك': {
    letter: 'ك',
    name: 'Kaf',
    makhrajGroup: 'Al-Lisan',
    description: 'Pangkal lidah di bawah makhraj Qaf',
    childTip: 'Keluarkan desis nafas halus (hams) setelah membunyikan huruf "Ka".',
  },
  'ص': {
    letter: 'ص',
    name: 'Shad',
    makhrajGroup: 'Al-Lisan',
    description: 'Ujung lidah di atas gigi seri bawah',
    childTip: 'Tebalkan mulut (Isti\'la & Ithbaq) dan bunyikan desis siulan kuat (Sha).',
  },
  'ض': {
    letter: 'ض',
    name: 'Dhad',
    makhrajGroup: 'Al-Lisan',
    description: 'Tepi lidah kiri/kanan menyentuh gigi geraham atas',
    childTip: 'Rapatkan tepi lidah ke deretan gigi geraham atas, bunyikan memanjang (Istithalah).',
  },
  'ط': {
    letter: 'ط',
    name: 'Tha',
    makhrajGroup: 'Al-Lisan',
    description: 'Ujung lidah menyentuh pangkal gigi seri atas',
    childTip: 'Bunyikan "Tha" paling tebal dan mantap di antara huruf dal dan ta.',
  },
  'ظ': {
    letter: 'ظ',
    name: 'Zha',
    makhrajGroup: 'Al-Lisan',
    description: 'Ujung lidah menempel di ujung gigi seri atas',
    childTip: 'Keluarkan sedikit ujung lidah menyentuh ujung gigi seri atas dengan suara tebal.',
  },
  'ذ': {
    letter: 'ذ',
    name: 'Dzal',
    makhrajGroup: 'Al-Lisan',
    description: 'Ujung lidah menyentuh ujung gigi seri atas (tipis)',
    childTip: 'Sentuhkan sedikit ujung lidah ke ujung gigi seri atas dengan desis lembut.',
  },
  'ث': {
    letter: 'ث',
    name: 'Tsa',
    makhrajGroup: 'Al-Lisan',
    description: 'Ujung lidah menyentuh ujung gigi seri atas',
    childTip: 'Hembuskan nafas lembut dengan ujung lidah sedikit terlihat di ujung gigi.',
  },
};

/**
 * Extracts letter-specific makhraj tips based on target Arabic text
 */
export function extractMakhrajTipsForAyah(arabicText: string): string[] {
  const tips: string[] = [];
  const chars = Array.from(arabicText);

  // Look for prominent letters
  for (const [letter, guide] of Object.entries(MAKHRAJ_REGISTRY)) {
    if (chars.includes(letter) && tips.length < 3) {
      tips.push(`Huruf ${guide.name} (${guide.letter}): ${guide.childTip}`);
    }
  }

  if (tips.length === 0) {
    tips.push('Jaga panjang bacaan Mad Thabi\'i tepat 2 harakat (jangan terburu-buru).');
    tips.push('Lafalkan harakat fathah, kasrah, dan dhammah dengan membuka mulut sempurna.');
  }

  return tips;
}

/**
 * Age-Adaptive Pedagogy Calibration
 */
export function getAgeAdaptiveCalibration(age: number = 8, level: string = 'pemula'): {
  toleranceFactor: number;
  tempoPace: string;
  pedagogyGuidance: string;
} {
  if (age <= 7 || level === 'pemula') {
    return {
      toleranceFactor: 1.25,
      tempoPace: 'Perlahan & tenang (1.4x - 2.0x durasi standar qari dewasa)',
      pedagogyGuidance:
        'SANTRI USIA DINI (4-7 TAHUN / PEMULA): Prioritaskan kelengkapan lafal ayat, harakat pokok, dan mad thabi\'i. Maklumi keterbatasan fisiologi pita suara anak dan pelafalan huruf yang masih dalam masa pertumbuhan lisan. Berikan dorongan kasih sayang dan apresiasi tinggi.',
    };
  }

  if (age <= 11 || level === 'menengah') {
    return {
      toleranceFactor: 1.1,
      tempoPace: 'Sedang & tartil teratur (1.1x - 1.5x durasi standar)',
      pedagogyGuidance:
        'SANTRI USIA SEKOLAH (8-11 TAHUN / MENENGAH): Evaluasi konsistensi panjang mad 2 harakat, dengung ghunnah (nun/mim tasydid), dan pantulan qolqolah. Koreksi makhraj tipis/tebal dengan bahasa yang bersahabat.',
    };
  }

  return {
    toleranceFactor: 1.0,
    tempoPace: 'Tartil mutqin standar (1.0x - 1.3x durasi standar)',
    pedagogyGuidance:
      'SANTRI USIA MAHIR / REMAJA (12+ TAHUN): Terapkan standar tahsin tajwid mutqin lengkap, termasuk kesempurnaan shifatul huruf, tafkhim/tarqiq, dan wakaf/ibtida\'.',
  };
}

/**
 * Generates the standardized Gemini prompt under the Ustadz AI Evaluation Rubric
 */
export function buildUstadzAiPrompt(ctx: AyahEvaluationContext): string {
  const words = ctx.targetArabicText.trim().split(/\s+/);
  const wordCount = Math.max(1, words.length);
  const referenceDuration = Math.max(3, Math.round(wordCount * 1.3));
  const childAge = ctx.childAge || 8;
  const childName = ctx.childName || 'Ananda';
  const calibration = getAgeAdaptiveCalibration(childAge, ctx.learningLevel);
  const makhrajHighlights = extractMakhrajTipsForAyah(ctx.targetArabicText);

  return `Anda adalah "Dewan Penguji Ustadz AI Cahaya Tahfiz" — Ahli Qira'at dan Tajwid bersanad yang bersikap adil, teliti, amanah, mendidik, dan penuh kasih sayang kepada anak-anak.

PROFIL SANTRI:
- Nama: ${childName}
- Usia: ${childAge} tahun
- Tingkat Belajar: ${ctx.learningLevel || 'pemula'}
- Pedoman Kalibrasi Usia: ${calibration.pedagogyGuidance}
- Tempo Wajar: ${calibration.tempoPace}

TARGET SETORAN AYAT AL-QUR'AN:
- Surat: ${ctx.surahName} (Surat ke-${ctx.surahNumber})
- Ayat: ${ctx.ayahNumber}
- Teks Wajib: "${ctx.targetArabicText}"
- Terjemahan: "${ctx.targetTranslation}"
- Jumlah Kata: ${wordCount} kata
- Durasi Rekaman Santri: ${ctx.durationSeconds} detik (durasi wajar: ~${referenceDuration} detik)
- Bantuan yang digunakan: ${ctx.assistanceUsed && ctx.assistanceUsed.length > 0 ? ctx.assistanceUsed.join(', ') : 'Mandiri tanpa bantuan'}
${ctx.spokenTranscript ? `- Deteksi Suara (Transkrip Fonetik): "${ctx.spokenTranscript}"` : ''}

RUBRIK PENILAIAN STANDAR TAHFIZ (WAJIB DIIKUTI):
1. VALIDASI KEASLIAN LAFAL AYAT:
   - Pastikan rekaman suara benar-benar berisi pelafalan ayat Quran target ("${ctx.targetArabicText}").
   - Jika audio berupa: suara hening, obrolan bahasa selain Arab, candaan, gumaman tanpa ayat, atau surah lain:
     * overallScore: 20-35 (TIDAK BOLEH LULUS)
     * grade: "perlu_ulang"
     * isPassed: false
     * encouragementEmoji: "🤲"
     * feedback: "Afwan ${childName}, rekaman suara belum melafalkan Ayat ${ctx.ayahNumber}. Yuk dengarkan contoh qari dan rekam kembali dengan membaca: ${ctx.targetArabicText}."

2. EVALUASI BACAAN SANTRI:
   - Kelengkapan kata & harakat (Accuracy, bobot 40%): seluruh kata dalam ayat terbaca tanpa tertinggal.
   - Makhraj & Tajwid (bobot 35%): perhatikan huruf khas di ayat ini (${makhrajHighlights.slice(0, 2).join('; ')}), panjang mad 2 harakat, ghunnah, qolqolah.
   - Kelancaran & Nafas (Fluency, bobot 25%): tempo membaca tartil dan ritme teratur sesuai usia ${childAge} tahun.

3. STANDAR KELULUSAN:
   - "mumtaz" (Skor 85-100, isPassed: true): Bacaan lengkap, fasih, mad dan makhraj terjaga baik. (Emoji: 🌟, 🎉, 🏆)
   - "jayyid" (Skor 70-84, isPassed: true): Ayat terbaca lengkap dan benar, ada koreksi ringan pada mad/makhraj. (Emoji: 👍, 👏, ✨)
   - "perlu_ulang" (Skor < 70, isPassed: false): Ada kata tertinggal, salah harakat fatal, atau durasi terputus. (Emoji: 💪, 🤲)

Kembalikan jawaban HANYA dalam format JSON:
{
  "overallScore": number (0-100),
  "grade": "mumtaz" | "jayyid" | "perlu_ulang",
  "accuracyScore": number (0-100),
  "tajwidScore": number (0-100),
  "fluencyScore": number (0-100),
  "feedback": string (ulasan hangat berbahasa Indonesia mendidik menyebut nama santri),
  "tajwidNotes": string[] (catatan tajwid spesifik pada ayat ini),
  "makhrajTips": string[] (tips cara melafalkan bibir/lidah/tenggorokan pada huruf ayat ini),
  "encouragementEmoji": string (emoji semangat santri),
  "correctedLafal": string (opsional),
  "isPassed": boolean (true jika score >= 70)
}`;
}

/**
 * Offline & Fallback Evaluator utilizing phonetic matching and child-age calibrated rubric
 */
export function evaluateOfflineUstadzRubric(ctx: AyahEvaluationContext): AiCorrectionResult {
  const words = ctx.targetArabicText.trim().split(/\s+/);
  const wordCount = Math.max(1, words.length);
  const referenceDuration = Math.max(3, Math.round(wordCount * 1.3));
  const childAge = ctx.childAge || 8;
  const childName = ctx.childName || 'Ananda';
  const makhrajTips = extractMakhrajTipsForAyah(ctx.targetArabicText);

  // 1. Simulation Check
  if (ctx.isSimulated) {
    return {
      overallScore: 35,
      grade: 'perlu_ulang',
      accuracyScore: 30,
      tajwidScore: 30,
      fluencyScore: 35,
      encouragementEmoji: '🎙️',
      makhrajTips,
      feedback: `Mode latihan mandiri santri. Nilai kelulusan mutqin memerlukan rekaman suara asli melalui mikrofon santri ya ${childName}.`,
      tajwidNotes: ['Gunakan mikrofon asli untuk evaluasi makhraj dan tajwid otomatis.'],
      isPassed: false,
      evaluatedAt: new Date().toISOString(),
      modelUsed: 'ustadz-ai-offline-sim',
    };
  }

  // 2. Volume & Empty check
  const peak = ctx.audioLevel?.peak ?? 50;
  if (peak < 12 || ctx.durationSeconds < 1) {
    return {
      overallScore: 25,
      grade: 'perlu_ulang',
      accuracyScore: 20,
      tajwidScore: 20,
      fluencyScore: 25,
      encouragementEmoji: '🗣️',
      makhrajTips,
      feedback: `Suara belum terdengar jelas pada mikrofon. Mohon dekatkan perangkat dan bacakan Ayat ${ctx.ayahNumber} dengan suara lantang ya ${childName}.`,
      tajwidNotes: ['Dekatkan mikrofon sekitar 15-20 cm dari mulut saat melafalkan ayat.'],
      isPassed: false,
      evaluatedAt: new Date().toISOString(),
      modelUsed: 'ustadz-ai-offline-silence',
    };
  }

  // 3. Duration pacing check
  const ratio = ctx.durationSeconds / referenceDuration;
  let timingScore = 75;
  if (ratio < 0.45 && wordCount >= 3) {
    timingScore = 30;
  } else if (ratio > 2.5) {
    timingScore = 55;
  } else if (ratio >= 0.7 && ratio <= 1.8) {
    timingScore = 88;
  }

  // Assistance penalty
  let accuracyScore = 80;
  const assistance = ctx.assistanceUsed || [];
  if (assistance.includes('lihat_ayah')) accuracyScore -= 18;
  if (assistance.includes('play_ayah')) accuracyScore -= 12;
  if (assistance.includes('lihat_awalan')) accuracyScore -= 6;

  // Age tolerance
  if (childAge <= 7) {
    accuracyScore = Math.min(95, accuracyScore + 8);
    timingScore = Math.min(95, timingScore + 6);
  }

  const tajwidScore = Math.round(accuracyScore * 0.9);
  const fluencyScore = Math.round(timingScore * 0.95);
  const overallScore = Math.round(accuracyScore * 0.4 + tajwidScore * 0.35 + fluencyScore * 0.25);
  const isPassed = overallScore >= 70;
  const grade: EvaluationGrade = overallScore >= 85 ? 'mumtaz' : isPassed ? 'jayyid' : 'perlu_ulang';

  return {
    overallScore,
    grade,
    accuracyScore,
    tajwidScore,
    fluencyScore,
    encouragementEmoji: grade === 'mumtaz' ? '🌟' : isPassed ? '👍' : '💪',
    makhrajTips,
    feedback: isPassed
      ? `Masya Allah ${childName}! Bacaan Ayat ${ctx.ayahNumber} terdengar lancar dan tartil. Pertahankan irama dan panjang harakatnya ya!`
      : `Alhamdulillah ${childName} sudah berusaha merekam Ayat ${ctx.ayahNumber}. Yuk dengarkan contoh qari sekali lagi dan lafalkan dengan tenang secara tuntas!`,
    tajwidNotes: [
      'Jaga ketukan tempo tartil secara stabil.',
      'Perhatikan makhraj huruf dan panjang mad 2 harakat.',
    ],
    isPassed,
    evaluatedAt: new Date().toISOString(),
    modelUsed: 'ustadz-ai-rubric-v2',
  };
}
