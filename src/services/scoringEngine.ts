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

  // 1. Strict Silence & Audio Signal Check
  if (audioInfo?.peakVolume !== undefined && audioInfo.peakVolume < 10) {
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

  // 2. Strict Speech Recognition Sanity Check
  if (audioInfo?.spokenTranscript && audioInfo.spokenTranscript.trim().length > 3) {
    const transcript = audioInfo.spokenTranscript.trim();
    const hasArabic = /[\u0600-\u06FF]/.test(transcript);
    if (!hasArabic) {
      // Child spoke Latin language (Indonesian/English) or noise
      return {
        overallScore: 28,
        wordCoverageScore: 20,
        timingScore: 35,
        fluencyScore: 30,
        missingWords: words.map((w) => w.arabic || ''),
        extraWords: [],
        durationSeconds: childDurationSeconds,
        referenceDurationSeconds,
        needsReview: true,
        scoreLabel: 'Lafal Belum Sesuai Ayat Al-Qur\'an',
      };
    }
  }

  // 3. Strict Too-Short Duration Check (e.g. 1 second click on a long ayah)
  if (childDurationSeconds < 1.8 && wordCount >= 3) {
    return {
      overallScore: 32,
      wordCoverageScore: 25,
      timingScore: 30,
      fluencyScore: 35,
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
  let timingScore = 78;
  if (durationRatio < 0.45) {
    timingScore = Math.max(40, Math.round(timingScore - (0.45 - durationRatio) * 80));
  } else if (durationRatio > 2.0) {
    timingScore = Math.max(50, Math.round(timingScore - (durationRatio - 2.0) * 20));
  } else if (durationRatio >= 0.7 && durationRatio <= 1.4) {
    timingScore = Math.min(88, timingScore + 6);
  }

  // Word coverage simulation
  let wordCoverageScore = 75;
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
    90,
    Math.max(45, Math.round(timingScore * 0.5 + wordCoverageScore * 0.5))
  );

  // Overall combined score (realistic baseline before AI evaluation)
  const overallScore = Math.min(
    88,
    Math.max(30, Math.round(wordCoverageScore * 0.5 + timingScore * 0.3 + fluencyScore * 0.2))
  );
  const needsReview = overallScore < 75;

  let scoreLabel = 'Bagus, Menunggu Koreksi AI...';
  if (overallScore < 50) {
    scoreLabel = 'Perlu Diulang Lagi Ya';
  } else if (overallScore < 70) {
    scoreLabel = 'Cukup Baik, Latih Lagi';
  } else if (overallScore >= 85) {
    scoreLabel = 'Masya Allah, Sangat Lancar!';
  }

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
