/**
 * Voice AI STT Service - Guided Arabic & Child Tajwid Speech Recognition
 * Provides speech-to-text, real-time Arabic phonetic alignment, and recitation evaluation.
 */

export interface AyahWordEvaluation {
  wordIndex: number;
  targetWord: string;
  spokenWord?: string;
  status: 'matched' | 'variance' | 'missing' | 'extra';
  confidence: number;
}

export interface VoiceEvaluationResult {
  accuracyScore: number; // 0 - 100
  matchedWordCount: number;
  totalWordCount: number;
  grade: 'mumtaz' | 'jayyid_jiddan' | 'jayyid' | 'perlu_ulang';
  gradeTitle: string;
  gradeBadge: string;
  encouragement: string;
  wordEvaluations: AyahWordEvaluation[];
  spokenTranscript: string;
  makhrajTips: string[];
}

// Remove Arabic diacritics / harakat and normalize letter variants
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    // Remove Quranic signs and ayah stop symbols
    .replace(/[\u06D6-\u06ED]/g, '')
    // Remove harakat / tashkeel (fathah, kasrah, dhammah, sukun, shaddah, tanwin)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alef variants
    .replace(/[إأآٱ]/g, 'ا')
    // Normalize Ta Marbutah to Ha
    .replace(/ة/g, 'ه')
    // Normalize Ya / Alif Maqsura
    .replace(/ى/g, 'ي')
    // Remove non-Arabic punctuation
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

// Check Levenshtein distance for fuzzy matching Arabic child pronunciation
function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export class VoiceSttService {
  /**
   * Check if the browser supports Speech Recognition
   */
  static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  /**
   * Create and configure a SpeechRecognition instance for Arabic recitation
   */
  static createRecognition(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    lang: string = 'ar-SA'
  ): any | null {
    if (!this.isSupported()) {
      onError('Browser Anda belum mendukung Web Speech Recognition. Gunakan Google Chrome atau Edge.');
      return null;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang; // Arabic (Saudi Arabia) for Quranic phonetics

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const combined = (finalTranscript + interimTranscript).trim();
      onResult(combined, !!finalTranscript);
    };

    recognition.onerror = (event: any) => {
      console.warn('[Voice STT Error]', event.error);
      onError(event.error || 'Terjadi kendala perekaman suara');
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  }

  /**
   * Evaluates spoken transcript against the authentic Quranic target ayah.
   * Performs word-by-word token analysis with fuzzy makhraj alignment.
   */
  static evaluateRecitation(
    targetAyahText: string,
    spokenTranscript: string
  ): VoiceEvaluationResult {
    const rawTargetWords = targetAyahText.trim().split(/\s+/).filter(Boolean);
    const normalizedTargetWords = rawTargetWords.map(normalizeArabicText);

    const normalizedSpokenWords = normalizeArabicText(spokenTranscript)
      .split(/\s+/)
      .filter(Boolean);

    const wordEvaluations: AyahWordEvaluation[] = [];
    let matchedCount = 0;
    const spokenUsed = new Set<number>();

    // Step 1: Match target words against spoken tokens
    for (let tIdx = 0; tIdx < rawTargetWords.length; tIdx++) {
      const targetNorm = normalizedTargetWords[tIdx];
      let bestMatchIdx = -1;
      let minDistance = 999;

      // Look in nearby spoken window
      const searchStart = Math.max(0, tIdx - 2);
      const searchEnd = Math.min(normalizedSpokenWords.length, tIdx + 3);

      for (let sIdx = searchStart; sIdx < searchEnd; sIdx++) {
        if (spokenUsed.has(sIdx)) continue;
        const spokenNorm = normalizedSpokenWords[sIdx];
        if (!spokenNorm) continue;

        if (spokenNorm === targetNorm) {
          bestMatchIdx = sIdx;
          minDistance = 0;
          break;
        }

        const dist = getLevenshteinDistance(targetNorm, spokenNorm);
        if (dist < minDistance && dist <= 2) {
          minDistance = dist;
          bestMatchIdx = sIdx;
        }
      }

      if (bestMatchIdx !== -1 && minDistance === 0) {
        spokenUsed.add(bestMatchIdx);
        matchedCount++;
        wordEvaluations.push({
          wordIndex: tIdx,
          targetWord: rawTargetWords[tIdx],
          spokenWord: normalizedSpokenWords[bestMatchIdx],
          status: 'matched',
          confidence: 1.0,
        });
      } else if (bestMatchIdx !== -1 && minDistance <= 2) {
        spokenUsed.add(bestMatchIdx);
        matchedCount += 0.75;
        wordEvaluations.push({
          wordIndex: tIdx,
          targetWord: rawTargetWords[tIdx],
          spokenWord: normalizedSpokenWords[bestMatchIdx],
          status: 'variance',
          confidence: 0.75,
        });
      } else {
        wordEvaluations.push({
          wordIndex: tIdx,
          targetWord: rawTargetWords[tIdx],
          status: 'missing',
          confidence: 0.0,
        });
      }
    }

    const totalWords = rawTargetWords.length || 1;
    const rawAccuracy = Math.round((matchedCount / totalWords) * 100);
    const accuracyScore = Math.min(100, Math.max(0, rawAccuracy));

    let grade: VoiceEvaluationResult['grade'] = 'perlu_ulang';
    let gradeTitle = 'Perlu Diulang';
    let gradeBadge = '🤲';
    let encouragement = 'Ayo dengarkan kembali qari dan ulangi lafalnya dengan tenang!';

    if (accuracyScore >= 90) {
      grade = 'mumtaz';
      gradeTitle = 'Mumtaz (Istimewa)';
      gradeBadge = '🌟';
      encouragement = 'MasyaAllah, bacaanmu sangat fasih, tartil, dan mutqin!';
    } else if (accuracyScore >= 80) {
      grade = 'jayyid_jiddan';
      gradeTitle = 'Jayyid Jiddan (Sangat Baik)';
      gradeBadge = '✨';
      encouragement = 'Alhamdulillah! Sebagian besar ayat sudah dibaca dengan sangat baik.';
    } else if (accuracyScore >= 70) {
      grade = 'jayyid';
      gradeTitle = 'Jayyid (Baik)';
      gradeBadge = '👍';
      encouragement = 'Bagus! Perhatikan sedikit ketukan mad dan makhraj huruf yang terlewat.';
    }

    const makhrajTips: string[] = [];
    const missingWords = wordEvaluations.filter((w) => w.status === 'missing');
    const varianceWords = wordEvaluations.filter((w) => w.status === 'variance');

    if (missingWords.length > 0) {
      makhrajTips.push(
        `Ada ${missingWords.length} kata yang belum terdengar jelas: "${missingWords.slice(0, 2).map((w) => w.targetWord).join(', ')}". Latih dengan memperjelas artikulasi.`
      );
    }
    if (varianceWords.length > 0) {
      makhrajTips.push(
        `Perhatikan ketukan panjang mad pada kata "${varianceWords[0].targetWord}" agar tidak terburu-buru.`
      );
    }
    if (makhrajTips.length === 0) {
      makhrajTips.push('Makharijul huruf dan sifatul huruf sudah tepat dan terdengar jelas.');
      makhrajTips.push('Pertahankan ketenangan saat waqaf dan washal.');
    }

    return {
      accuracyScore,
      matchedWordCount: Math.round(matchedCount),
      totalWordCount: totalWords,
      grade,
      gradeTitle,
      gradeBadge,
      encouragement,
      wordEvaluations,
      spokenTranscript,
      makhrajTips,
    };
  }
}
