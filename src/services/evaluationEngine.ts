/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EvaluationEngine
 * Dedicated Service standardizing the AI feedback loop for 'Hafalan'.
 * Computes consistency scores for tajwid and makhraj against the profile's baseline,
 * ensuring historical performance data is consistently retrieved and updated
 * in localStorage regardless of the module or tab being accessed.
 */

import {
  AiCorrectionResult,
  BaselineComparison,
  ChildProfile,
  HistoricalEvaluationRecord,
  ProfileEvaluationBaseline,
  AyahData,
} from '../types';
import { StorageService } from './storageService';
import { AudioDatabaseService } from './audioDatabaseService';
import {
  evaluateOfflineUstadzRubric,
  extractMakhrajTipsForAyah,
} from './ustadzAiEvaluationEngine';

const STORAGE_KEYS = {
  BASELINE_PREFIX: 'cahaya_tahfiz_baseline_',
  HISTORY_PREFIX: 'cahaya_tahfiz_eval_history_',
};

export interface HafalanEvaluationInput {
  childId: string;
  blob: Blob;
  durationSeconds: number;
  ayah: AyahData;
  surahNumber: number;
  surahName: string;
  assistanceUsed?: string[];
  audioLevel?: { peak?: number; avg?: number };
  spokenTranscript?: string;
  isSimulated?: boolean;
  recordingId?: string;
  customApiKey?: string;
}

export interface HistoricalPerformanceData {
  childId: string;
  baseline: ProfileEvaluationBaseline;
  recentEvaluations: HistoricalEvaluationRecord[];
  averageTajwid: number;
  averageMakhraj: number;
  averageAccuracy: number;
  overallConsistencyScore: number;
  consistencyTrend: 'improving' | 'stable' | 'needs_practice';
  totalEvaluatedAyahs: number;
}

export class EvaluationEngine {
  /**
   * Retrieves or initializes the baseline evaluation profile for a child.
   * Calibrated according to child age and learning level.
   */
  static getProfileBaseline(childId: string): ProfileEvaluationBaseline {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BASELINE_PREFIX + childId);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse profile baseline, re-initializing:', e);
    }

    // Initialize sensible calibrated baseline based on child profile
    const children = StorageService.getChildren();
    const child = children.find((c) => c.id === childId) || children[0];
    const age = child?.age || (child?.birthYear ? new Date().getFullYear() - child.birthYear : 8);
    const level = child?.learningLevel || 'pemula';

    let initialTajwid = 72;
    let initialMakhraj = 72;
    let initialAccuracy = 74;
    let initialFluency = 72;
    let initialConsistency = 85;

    if (level === 'menengah' || (age >= 8 && age <= 11)) {
      initialTajwid = 78;
      initialMakhraj = 78;
      initialAccuracy = 80;
      initialFluency = 77;
      initialConsistency = 88;
    } else if (level === 'mahir' || age >= 12) {
      initialTajwid = 85;
      initialMakhraj = 84;
      initialAccuracy = 87;
      initialFluency = 84;
      initialConsistency = 92;
    }

    const newBaseline: ProfileEvaluationBaseline = {
      childId,
      totalEvaluations: 0,
      baselineTajwid: initialTajwid,
      baselineMakhraj: initialMakhraj,
      baselineAccuracy: initialAccuracy,
      baselineFluency: initialFluency,
      baselineOverall: Math.round(initialAccuracy * 0.4 + initialTajwid * 0.35 + initialFluency * 0.25),
      rollingConsistencyScore: initialConsistency,
      historyCount: 0,
      lastUpdatedAt: new Date().toISOString(),
      recentRecords: [],
    };

    try {
      localStorage.setItem(STORAGE_KEYS.BASELINE_PREFIX + childId, JSON.stringify(newBaseline));
    } catch (e) {
      // Storage quota or private mode protection
    }

    return newBaseline;
  }

  /**
   * Computes consistency scores for Tajwid and Makhraj against the child's baseline.
   */
  static computeConsistencyScores(
    childId: string,
    currentTajwid: number,
    currentMakhraj: number
  ): BaselineComparison {
    const baseline = this.getProfileBaseline(childId);

    const deltaTajwid = currentTajwid - baseline.baselineTajwid;
    const deltaMakhraj = currentMakhraj - baseline.baselineMakhraj;

    // Consistency algorithm: penalizes high variance from baseline while rewarding positive momentum
    const devTajwid = Math.abs(deltaTajwid);
    const tajwidConsistency = Math.max(
      20,
      Math.min(100, Math.round(100 - devTajwid * 1.35 + (deltaTajwid > 0 ? 4 : 0)))
    );

    const devMakhraj = Math.abs(deltaMakhraj);
    const makhrajConsistency = Math.max(
      20,
      Math.min(100, Math.round(100 - devMakhraj * 1.35 + (deltaMakhraj > 0 ? 4 : 0)))
    );

    const overallConsistency = Math.round(tajwidConsistency * 0.5 + makhrajConsistency * 0.5);

    let trend: 'improving' | 'stable' | 'needs_practice' = 'stable';
    if (deltaTajwid >= 3 && deltaMakhraj >= 3) {
      trend = 'improving';
    } else if (deltaTajwid <= -8 || deltaMakhraj <= -8) {
      trend = 'needs_practice';
    }

    return {
      baselineTajwid: baseline.baselineTajwid,
      baselineMakhraj: baseline.baselineMakhraj,
      deltaTajwid,
      deltaMakhraj,
      tajwidConsistency,
      makhrajConsistency,
      overallConsistency,
      trend,
    };
  }

  /**
   * Records a new evaluation into the child's local storage baseline and updates rolling metrics.
   */
  static recordEvaluation(
    childId: string,
    result: AiCorrectionResult,
    surahNumber: number,
    surahName: string,
    ayahNumber: number
  ): ProfileEvaluationBaseline {
    const baseline = this.getProfileBaseline(childId);
    const makhrajScore =
      result.makhrajScore ??
      Math.min(100, Math.max(20, Math.round(result.tajwidScore * 0.98 + (result.accuracyScore - result.tajwidScore) * 0.1)));

    const consistency = this.computeConsistencyScores(childId, result.tajwidScore, makhrajScore);

    const record: HistoricalEvaluationRecord = {
      id: `eval-${Date.now()}-${surahNumber}-${ayahNumber}`,
      childId,
      surahNumber,
      surahName,
      ayahNumber,
      overallScore: result.overallScore,
      accuracyScore: result.accuracyScore,
      tajwidScore: result.tajwidScore,
      makhrajScore,
      fluencyScore: result.fluencyScore,
      consistencyScore: consistency.overallConsistency,
      grade: result.grade,
      isPassed: result.isPassed,
      timestamp: new Date().toISOString(),
      feedbackPreview: result.feedback.slice(0, 80),
    };

    // Exponential smoothing update (alpha = 0.15) to maintain steady baseline calibration
    const alpha = 0.15;
    baseline.baselineTajwid = Math.round(baseline.baselineTajwid * (1 - alpha) + result.tajwidScore * alpha);
    baseline.baselineMakhraj = Math.round(baseline.baselineMakhraj * (1 - alpha) + makhrajScore * alpha);
    baseline.baselineAccuracy = Math.round(baseline.baselineAccuracy * (1 - alpha) + result.accuracyScore * alpha);
    baseline.baselineFluency = Math.round(baseline.baselineFluency * (1 - alpha) + result.fluencyScore * alpha);
    baseline.baselineOverall = Math.round(baseline.baselineOverall * (1 - alpha) + result.overallScore * alpha);
    baseline.rollingConsistencyScore = Math.round(
      baseline.rollingConsistencyScore * (1 - alpha) + consistency.overallConsistency * alpha
    );

    baseline.totalEvaluations += 1;
    baseline.historyCount += 1;
    baseline.lastUpdatedAt = new Date().toISOString();

    // Keep up to 50 recent records
    baseline.recentRecords = [record, ...(baseline.recentRecords || [])].slice(0, 50);

    try {
      localStorage.setItem(STORAGE_KEYS.BASELINE_PREFIX + childId, JSON.stringify(baseline));
      localStorage.setItem(STORAGE_KEYS.HISTORY_PREFIX + childId, JSON.stringify(baseline.recentRecords));
    } catch (e) {
      console.warn('LocalStorage error while saving baseline:', e);
    }

    return baseline;
  }

  /**
   * Retrieves unified historical performance data for the given child.
   * Can be queried anywhere in the application regardless of module or tab.
   */
  static getHistoricalPerformance(childId: string): HistoricalPerformanceData {
    const baseline = this.getProfileBaseline(childId);
    let records = baseline.recentRecords || [];

    if (records.length === 0) {
      try {
        const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY_PREFIX + childId);
        if (storedHistory) {
          records = JSON.parse(storedHistory);
        }
      } catch (e) {}
    }

    const totalEvaluatedAyahs = records.length;
    const avgTajwid =
      records.length > 0
        ? Math.round(records.reduce((acc, r) => acc + r.tajwidScore, 0) / records.length)
        : baseline.baselineTajwid;

    const avgMakhraj =
      records.length > 0
        ? Math.round(records.reduce((acc, r) => acc + r.makhrajScore, 0) / records.length)
        : baseline.baselineMakhraj;

    const avgAccuracy =
      records.length > 0
        ? Math.round(records.reduce((acc, r) => acc + r.accuracyScore, 0) / records.length)
        : baseline.baselineAccuracy;

    const overallConsistency =
      records.length > 0
        ? Math.round(records.reduce((acc, r) => acc + r.consistencyScore, 0) / records.length)
        : baseline.rollingConsistencyScore;

    // Determine general trend
    let consistencyTrend: 'improving' | 'stable' | 'needs_practice' = 'stable';
    if (records.length >= 3) {
      const recent3 = records.slice(0, 3);
      const older = records.slice(3, 8);
      const recentAvg = recent3.reduce((a, b) => a + b.overallScore, 0) / recent3.length;
      const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b.overallScore, 0) / older.length : recentAvg;
      if (recentAvg - olderAvg >= 3) consistencyTrend = 'improving';
      else if (olderAvg - recentAvg >= 6) consistencyTrend = 'needs_practice';
    }

    return {
      childId,
      baseline,
      recentEvaluations: records,
      averageTajwid: avgTajwid,
      averageMakhraj: avgMakhraj,
      averageAccuracy: avgAccuracy,
      overallConsistencyScore: overallConsistency,
      consistencyTrend,
      totalEvaluatedAyahs,
    };
  }

  /**
   * Main Standardized AI Feedback Pipeline for Hafalan Module.
   * Coordinates request payload, network evaluation, offline fallback,
   * consistency scoring against profile baseline, and storage synchronization.
   */
  static async processHafalanEvaluation(input: HafalanEvaluationInput): Promise<AiCorrectionResult> {
    const {
      childId,
      blob,
      durationSeconds,
      ayah,
      surahNumber,
      surahName,
      assistanceUsed = [],
      audioLevel = { peak: 50, avg: 35 },
      spokenTranscript = '',
      isSimulated = false,
      recordingId,
      customApiKey,
    } = input;

    // 1. Quota Check
    const access = StorageService.checkAiEvaluationAccess(childId);
    if (!access.allowed) {
      throw new Error('AI_QUOTA_EXHAUSTED');
    }

    // Retrieve active child info
    const children = StorageService.getChildren();
    const child = children.find((c) => c.id === childId) || children[0];
    const childName = child?.name || 'Ananda';
    const childAge = child?.age || (child?.birthYear ? new Date().getFullYear() - child.birthYear : 8);
    const learningLevel = child?.learningLevel || 'pemula';

    let rawResult: AiCorrectionResult;

    try {
      let audioBase64: string | undefined = undefined;
      try {
        audioBase64 = await AudioDatabaseService.blobToDataUrl(blob);
      } catch (e) {}

      const payload = {
        surahNumber,
        surahName,
        ayahNumber: ayah.ayahNumber,
        targetArabicText: ayah.arabicText,
        targetTranslation: ayah.translationId,
        audioBase64,
        mimeType: blob.type || 'audio/webm',
        durationSeconds,
        assistanceUsed,
        audioLevel,
        spokenTranscript,
        isSimulated,
        customApiKey,
        childName,
        childAge,
        learningLevel,
      };

      const response = await fetch('/api/ai-correction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey ? { 'x-gemini-api-key': customApiKey } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`AI Server error: status ${response.status}`);
      }

      rawResult = await response.json();
    } catch (networkError) {
      console.warn('EvaluationEngine: Network AI unavailable, running calibrated Ustadz AI rubric fallback:', networkError);
      rawResult = evaluateOfflineUstadzRubric({
        surahNumber,
        surahName,
        ayahNumber: ayah.ayahNumber,
        targetArabicText: ayah.arabicText,
        targetTranslation: ayah.translationId,
        durationSeconds,
        audioLevel: audioLevel
          ? { peak: audioLevel.peak ?? 0, avg: audioLevel.avg ?? 0 }
          : undefined,
        spokenTranscript,
        assistanceUsed,
        isSimulated,
        childName,
        childAge,
        learningLevel,
      });
    }

    // 2. Consume quota allowance
    StorageService.consumeAiEvaluation(childId);

    // 3. Compute Makhraj Score & Tajwid/Makhraj Consistency against profile baseline
    const makhrajScore =
      rawResult.makhrajScore ??
      Math.min(
        100,
        Math.max(
          25,
          Math.round(rawResult.tajwidScore * 0.96 + (rawResult.accuracyScore - rawResult.tajwidScore) * 0.12)
        )
      );

    const baselineComparison = this.computeConsistencyScores(childId, rawResult.tajwidScore, makhrajScore);

    // Ensure makhraj tips exist
    const makhrajTips = rawResult.makhrajTips && rawResult.makhrajTips.length > 0
      ? rawResult.makhrajTips
      : extractMakhrajTipsForAyah(ayah.arabicText);

    // 4. Construct standardized result with full consistency and baseline metadata
    const standardizedResult: AiCorrectionResult = {
      ...rawResult,
      makhrajScore,
      makhrajTips,
      consistencyScore: baselineComparison.overallConsistency,
      tajwidConsistency: baselineComparison.tajwidConsistency,
      makhrajConsistency: baselineComparison.makhrajConsistency,
      baselineComparison,
      evaluatedAt: new Date().toISOString(),
    };

    // 5. Update local storage profile baseline and historical record
    this.recordEvaluation(childId, standardizedResult, surahNumber, surahName, ayah.ayahNumber);

    // 6. Update recording item in StorageService if available
    const isPassed = !!standardizedResult.isPassed && standardizedResult.overallScore >= 70;
    const storedRec = StorageService.getRecordingByAyah(childId, surahNumber, ayah.ayahNumber);
    if (storedRec) {
      storedRec.aiCorrection = standardizedResult;
      storedRec.score = standardizedResult.overallScore;
      storedRec.needsReview = !isPassed;
      StorageService.saveRecording(storedRec);
    }

    // 7. Persist real score into child's ayah memorization database
    StorageService.saveAyahScore(
      childId,
      surahNumber,
      ayah.ayahNumber,
      standardizedResult.overallScore,
      isPassed
    );

    return standardizedResult;
  }
}
