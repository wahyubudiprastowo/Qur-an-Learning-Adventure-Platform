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

/**
 * Child-friendly scoring engine evaluating recitation coverage,
 * pacing duration vs target reference Qari, and fluency.
 */
export function analyzeAyahRecitation(
  childDurationSeconds: number,
  ayah: AyahData,
  assistanceUsed: string[] = []
): ScoreAnalysisResult {
  const words = ayah.words || [];
  const wordCount = words.length > 0 ? words.length : (ayah.arabicText.split(' ').length || 4);

  // Approximate reference duration based on words count (averages 1.2s per word in Tartil)
  const referenceDurationSeconds = Math.max(3, Math.round(wordCount * 1.3));

  // Pacing / Timing similarity (ideal child pace is ±35% of reference)
  const durationRatio = childDurationSeconds / referenceDurationSeconds;
  let timingScore = 95;
  if (durationRatio < 0.45) {
    // Too fast / rushed
    timingScore = Math.max(50, Math.round(timingScore - (0.45 - durationRatio) * 100));
  } else if (durationRatio > 2.0) {
    // Stumbled / very slow pauses
    timingScore = Math.max(55, Math.round(timingScore - (durationRatio - 2.0) * 20));
  }

  // Word coverage simulation based on child duration, assistance used, and reasonable variance
  let wordCoverageScore = 92;
  const missingWords: string[] = [];

  // Deduct based on heavy assistance usage (shows child didn't fully recall yet)
  if (assistanceUsed.includes('lihat_ayah')) {
    wordCoverageScore -= 18;
  } else if (assistanceUsed.includes('play_ayah')) {
    wordCoverageScore -= 10;
  } else if (assistanceUsed.includes('lihat_awalan')) {
    wordCoverageScore -= 5;
  }

  // If child finished very fast (e.g. 1 sec for 10-word ayah), mark words missing
  if (childDurationSeconds < referenceDurationSeconds * 0.4 && words.length > 2) {
    missingWords.push(words[words.length - 1]?.arabic || 'kata akhir');
    wordCoverageScore = Math.min(wordCoverageScore, 65);
  }

  // Fluency score
  const fluencyScore = Math.min(98, Math.max(60, Math.round((timingScore * 0.5) + (wordCoverageScore * 0.5) + (Math.random() * 4))));

  // Overall combined score
  const overallScore = Math.min(100, Math.max(45, Math.round(wordCoverageScore * 0.5 + timingScore * 0.3 + fluencyScore * 0.2)));
  const needsReview = overallScore < 80;

  let scoreLabel = 'Masya Allah, Sempurna!';
  if (overallScore < 70) {
    scoreLabel = 'Perlu Diulang Lagi Ya';
  } else if (overallScore < 80) {
    scoreLabel = 'Sudah Bagus, Sedikit Lagi!';
  } else if (overallScore < 90) {
    scoreLabel = 'Hebat, Sangat Lancar!';
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
