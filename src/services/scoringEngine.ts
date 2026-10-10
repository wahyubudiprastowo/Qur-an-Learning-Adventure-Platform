import { AyahData } from '../types';

export interface ScoreAnalysisResult {
  overallScore: number;
  wordCoverageScore: number;
  timingScore: number;
  fluencyScore: number;
  missingWords: string[];
  extraWords: string[];
  durationSeconds: number;
  referenceDurationSeconds: number;
  needsReview: boolean;
  scoreLabel: string;
}

export interface AudioScoringContext {
  peakVolume?: number;
  avgVolume?: number;
  spokenTranscript?: string;
  isSimulated?: boolean;
}

/**
 * Child-friendly scoring engine evaluating recitation coverage,
 * acoustic dynamics, pacing duration vs target reference Qari, and fluency.
 */
export function analyzeAyahRecitation(
  childDurationSeconds: number,
  ayah: AyahData,
  assistanceUsed: string[] = [],
  audioInfo?: AudioScoringContext
): ScoreAnalysisResult {
  const words = ayah.words || [];
  const wordCount = words.length > 0 ? words.length : (ayah.arabicText.split(' ').length || 4);

  // Approximate reference duration based on words count (averages 1.3s per word in Tartil)
  const referenceDurationSeconds = Math.max(3, Math.round(wordCount * 1.3));

  // 1. Strict Simulation Check (Mic was not active)
  if (audioInfo?.isSimulated) {
    return {
      overallScore: 35,
      wordCoverageScore: 30,
      timingScore: 35,
      fluencyScore: 35,
      missingWords: [],
      extraWords: [],
      durationSeconds: childDurationSeconds,
      referenceDurationSeconds,
      needsReview: true,
      scoreLabel: 'Mode Simulasi (Gunakan Mikrofon Asli)',
    };
  }

  // 2. Strict Silence & Audio Signal Check (peak volume < 12 means empty/no speech)
  if (audioInfo?.peakVolume !== undefined && audioInfo.peakVolume < 12) {
    return {
      overallScore: 25,
      wordCoverageScore: 20,
      timingScore: 25,
      fluencyScore: 25,
      missingWords: words.map((w) => w.arabic || ''),
      extraWords: [],
      durationSeconds: childDurationSeconds,
      referenceDurationSeconds,
      needsReview: true,
      scoreLabel: 'Suara Tidak Terdengar (Mikrofon Hening)',
    };
  }

  // 3. Strict Speech Recognition Sanity Check (if child chatted in Indonesian/English/noise)
  if (audioInfo?.spokenTranscript && audioInfo.spokenTranscript.trim().length > 3) {
    const transcript = audioInfo.spokenTranscript.trim();
    const hasArabic = /[\u0600-\u06FF]/.test(transcript);
    if (!hasArabic) {
      return {
        overallScore: 25,
        wordCoverageScore: 20,
        timingScore: 25,
        fluencyScore: 25,
        missingWords: words.map((w) => w.arabic || ''),
        extraWords: [],
        durationSeconds: childDurationSeconds,
        referenceDurationSeconds,
        needsReview: true,
        scoreLabel: 'Lafal Bukan Ayat Al-Qur\'an',
      };
    }
  }

  // 4. Strict Too-Short Duration Check (e.g. 1 second click on a long ayah)
  if (childDurationSeconds < 1.8 && wordCount >= 3) {
    return {
      overallScore: 28,
      wordCoverageScore: 25,
      timingScore: 25,
      fluencyScore: 30,
      missingWords: [words[words.length - 1]?.arabic || 'kata akhir'],
      extraWords: [],
      durationSeconds: childDurationSeconds,
      referenceDurationSeconds,
      needsReview: true,
      scoreLabel: 'Durasi Terlalu Singkat (Belum Tuntas)',
    };
  }

  // Pacing / Timing similarity (ideal child pace is ±35% of reference)
  const durationRatio = childDurationSeconds / referenceDurationSeconds;
  let timingScore = 65;
  if (durationRatio < 0.45) {
    timingScore = Math.max(30, Math.round(timingScore - (0.45 - durationRatio) * 80));
  } else if (durationRatio > 2.2) {
    timingScore = Math.max(40, Math.round(timingScore - (durationRatio - 2.2) * 20));
  } else if (durationRatio >= 0.7 && durationRatio <= 1.4) {
    timingScore = Math.min(75, timingScore + 8);
  }

  // Word coverage estimation
  let wordCoverageScore = 65;
  const missingWords: string[] = [];

  if (assistanceUsed.includes('lihat_ayah')) {
    wordCoverageScore -= 18;
  } else if (assistanceUsed.includes('play_ayah')) {
    wordCoverageScore -= 12;
  } else if (assistanceUsed.includes('lihat_awalan')) {
    wordCoverageScore -= 6;
  }

  // Fluency score
  const fluencyScore = Math.min(
    70,
    Math.max(35, Math.round(timingScore * 0.5 + wordCoverageScore * 0.5))
  );

  // Initial provisional score awaiting AI verification (CANNOT be marked as passed prematurely!)
  const overallScore = Math.min(
    55,
    Math.max(30, Math.round(wordCoverageScore * 0.4 + timingScore * 0.3 + fluencyScore * 0.3))
  );

  // ALWAYS needsReview until verified by AI or Teacher/Parent
  const needsReview = true;
  const scoreLabel = 'Sedang Menganalisis dengan AI Tartil...';

  return {
    overallScore,
    wordCoverageScore,
    timingScore,
    fluencyScore,
    missingWords,
    extraWords: [],
    durationSeconds: childDurationSeconds,
    referenceDurationSeconds,
    needsReview,
    scoreLabel,
  };
}
