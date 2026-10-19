import { LearningNode, LearningNodeKind, TajwidTopic } from '../types';
import { DuelQuestion, DUEL_QUESTIONS_CATALOG } from '../data/duelQuestionsData';
import { StorageService } from './storageService';
import { ALL_LEARNING_NODES_LIST, ALL_LEARNING_NODES_MAP } from '../data/learningGraphData';
import { TAJWID_CURRICULUM } from '../data/tajwidData';
import { QURAN_VOCABULARY_LIST } from '../data/vocabularyData';
import { SURAHS_METADATA } from '../data/surahsMetadata';
import { VERIFIED_QURAN_DATA } from '../data/quranData';
import { getDeterministicHiddenIndices } from './murojaahHiding';
import { IQRA_1_PAGES } from '../data/iqraBook1Data';
import { IQRA_2_PAGES } from '../data/iqraBook2Data';
import { MEMORIZATION_BLOCKS } from '../data/blocksData';

// -------------------------------------------------------------
// QUESTION INTERFACES FOR ALL 8 GAMES
// -------------------------------------------------------------

export interface ContinueAyahQuestion {
  id: string;
  nodeId: string;
  surah: string;
  surahNumber: number;
  ayahNumber: number;
  firstPart: string;
  options: string[];
  correctIndex: number;
  fullArabic: string;
  audioInfo: { surah: number; ayah: number };
  meaning: string;
  sourceLabel: string;
}

export interface ArrangeAyahQuestion {
  id: string;
  nodeId: string;
  surah: string;
  surahNumber: number;
  ayahNumber: number;
  correctWords: string[];
  scrambledWords: string[];
  fullArabic: string;
  audioInfo: { surah: number; ayah: number };
  meaning: string;
  sourceLabel: string;
}

export interface MissingWordQuestion {
  id: string;
  nodeId: string;
  surah: string;
  surahNumber: number;
  ayahNumber: number;
  prompt: string;
  missingWord: string;
  options: string[];
  correctIndex: number;
  fullArabic: string;
  audioInfo: { surah: number; ayah: number };
  hint: string;
  sourceLabel: string;
}

export interface MatchingPair {
  id: number;
  arabic: string;
  meaning: string;
  translit?: string;
  nodeId?: string;
}

export interface MatchingRound {
  title: string;
  nodeId: string;
  sourceLabel: string;
  pairs: MatchingPair[];
}

export interface HijaiyahSoundOption {
  letter: string;
  name: string;
  correct: boolean;
}

export interface HijaiyahSoundQuestion {
  letter: string;
  letterName: string;
  makhrajHint: string;
  soundPrompt: string;
  options: HijaiyahSoundOption[];
  nodeId: string;
  sourceLabel: string;
}

export interface AudioGuessOption {
  arabic: string;
  latin: string;
  isCorrect: boolean;
}

export interface AudioGuessAyahQuestion {
  surahName: string;
  audioInfo: { surah: number; ayah: number };
  promptText: string;
  options: AudioGuessOption[];
  meaning: string;
  nodeId: string;
  sourceLabel: string;
}

export interface HarakatVoiceItem {
  surahName: string;
  fullArabic: string;
  transliteration: string;
  meaning: string;
  audioInfo: { surah: number; ayah: number };
  keyRules: string[];
  nodeId: string;
  sourceLabel: string;
}

export interface TajwidBucketOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface TajwidBasketQuestion {
  arabicText: string;
  question: string;
  buckets: TajwidBucketOption[];
  explanation: string;
  nodeId: string;
  sourceLabel: string;
}

export interface DetectiveSurahQuestion {
  clue1: string;
  clue2: string;
  clue3: string;
  options: string[];
  correctIndex: number;
  surahName: string;
  audioInfo: { surah: number; ayah: number };
  nodeId: string;
  sourceLabel: string;
}

// -------------------------------------------------------------
// QUESTION FACTORY (Urutan 4)
// Central engine generating unlimited questions calibrated per child
// -------------------------------------------------------------
export class QuestionFactory {
  /**
   * Helper: Get active hafalan surah numbers for a child.
   * If child has no active blocks, falls back to starter Juz 30 surahs.
   */
  static getActiveHafalanSurahs(childId?: string): { surahNumbers: number[]; isCustomHafalan: boolean } {
    const blocks = childId ? StorageService.getBlockProgress(childId) : [];
    const activeFromBlocks = Array.from(new Set(blocks.map((b) => b.surahNumber))).filter(
      (sNum) => VERIFIED_QURAN_DATA[sNum] && VERIFIED_QURAN_DATA[sNum].length > 0
    );

    if (activeFromBlocks.length > 0) {
      return { surahNumbers: activeFromBlocks, isCustomHafalan: true };
    }

    // Check learning graph
    const graph = StorageService.getLearningGraph(childId);
    const graphActiveSurahs: number[] = [];
    Object.values(graph.nodes).forEach((n) => {
      if (n.kind === 'hafalan_block' && n.surah) {
        const state = graph.userProgress[n.nodeId];
        if (state && (state.mastery > 0 || state.status === 'in_progress' || state.status === 'mastered')) {
          if (!graphActiveSurahs.includes(n.surah)) {
            graphActiveSurahs.push(n.surah);
          }
        }
      }
    });

    if (graphActiveSurahs.length > 0) {
      return { surahNumbers: graphActiveSurahs, isCustomHafalan: true };
    }

    // Default starter surahs from Juz 30
    return {
      surahNumbers: [112, 1, 114, 113, 108, 103, 107, 109, 106, 105],
      isCustomHafalan: false,
    };
  }

  // -----------------------------------------------------------
  // 1. GAME: SAMBUNG AYAT (continue_ayah)
  // -----------------------------------------------------------
  static generateContinueAyahQuestions(childId?: string, count: number = 8): ContinueAyahQuestion[] {
    const { surahNumbers, isCustomHafalan } = this.getActiveHafalanSurahs(childId);
    const questions: ContinueAyahQuestion[] = [];

    // Distractor endings pool from various surahs
    const distractorEndingsPool: string[] = [
      'الصَّمَدُ ۚ',
      'الْفَلَقِ ۙ',
      'الرَّحِيْمِ ۙ',
      'الْمُسْتَقِيْمَ ۙ',
      'الدِّيْنِ ۗ',
      'نَسْتَعِيْنُ ۗ',
      'الْخَنَّاسِ ۙ',
      'الْعَالَمِيْنَ ۙ',
      'الْكَوْثَرَ ۗ',
      'الْاَبْتَرَ ۗ',
      'لَفِيْ خُسْرٍ ۙ',
      'الْكٰفِرُوْنَ ۙ',
      'بِالدِّيْنِ ۗ',
      'مَا خَلَقَ ۙ',
      'اَحَدٌ ۚ',
      'الصَّلٰوةِ ۗ',
    ];

    for (const sNum of surahNumbers) {
      const ayahs = VERIFIED_QURAN_DATA[sNum];
      if (!ayahs || ayahs.length === 0) continue;
      const meta = SURAHS_METADATA.find((m) => m.number === sNum);
      const surahName = meta?.nameLatin || `Surah ${sNum}`;

      for (const ayah of ayahs) {
        if (questions.length >= count) break;
        const words = (ayah.arabicText || '').split(/\s+/).filter(Boolean);
        if (words.length < 2) continue;

        // Split roughly at 60%
        const splitIdx = Math.max(1, Math.min(words.length - 1, Math.ceil(words.length * 0.55)));
        const firstPart = words.slice(0, splitIdx).join(' ');
        const correctEnding = words.slice(splitIdx).join(' ');

        // Pick 3 distractors
        const otherDistractors = distractorEndingsPool
          .filter((d) => d.trim() !== correctEnding.trim())
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const options = [correctEnding, ...otherDistractors].sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(correctEnding);

        const sourceLabel = isCustomHafalan
          ? `Dari: ${surahName} · blok hafalanmu`
          : `Dari: ${surahName} · Surah Pilihan`;

        questions.push({
          id: `cont-${sNum}-${ayah.ayahNumber}`,
          nodeId: `hafalan-block-surah-${sNum}-1`,
          surah: surahName,
          surahNumber: sNum,
          ayahNumber: ayah.ayahNumber,
          firstPart,
          options,
          correctIndex,
          fullArabic: ayah.arabicText,
          audioInfo: { surah: sNum, ayah: ayah.ayahNumber },
          meaning: ayah.translationId,
          sourceLabel,
        });
      }
      if (questions.length >= count) break;
    }

    return questions.sort(() => Math.random() - 0.5);
  }

  // -----------------------------------------------------------
  // 2. GAME: SUSUN AYAT (arrange_ayah)
  // -----------------------------------------------------------
  static generateArrangeAyahItems(childId?: string, count: number = 6): ArrangeAyahQuestion[] {
    const { surahNumbers, isCustomHafalan } = this.getActiveHafalanSurahs(childId);
    const questions: ArrangeAyahQuestion[] = [];

    for (const sNum of surahNumbers) {
      const ayahs = VERIFIED_QURAN_DATA[sNum];
      if (!ayahs || ayahs.length === 0) continue;
      const meta = SURAHS_METADATA.find((m) => m.number === sNum);
      const surahName = meta?.nameLatin || `Surah ${sNum}`;

      for (const ayah of ayahs) {
        if (questions.length >= count) break;
        const words = (ayah.arabicText || '').split(/\s+/).filter(Boolean);
        // Best fit for puzzle is 2 to 6 words
        if (words.length < 2 || words.length > 7) continue;

        const correctWords = [...words];
        let scrambledWords = [...words].sort(() => Math.random() - 0.5);
        // Ensure scrambled does not accidentally equal correct
        if (words.length > 2 && scrambledWords.join(' ') === correctWords.join(' ')) {
          scrambledWords.reverse();
        }

        const sourceLabel = isCustomHafalan
          ? `Dari: ${surahName} · blok hafalanmu`
          : `Dari: ${surahName} · Surah Pilihan`;

        questions.push({
          id: `arr-${sNum}-${ayah.ayahNumber}`,
          nodeId: `hafalan-block-surah-${sNum}-1`,
          surah: `${surahName} Ayat ${ayah.ayahNumber}`,
          surahNumber: sNum,
          ayahNumber: ayah.ayahNumber,
          correctWords,
          scrambledWords,
          fullArabic: ayah.arabicText,
          audioInfo: { surah: sNum, ayah: ayah.ayahNumber },
          meaning: ayah.translationId,
          sourceLabel,
        });
      }
      if (questions.length >= count) break;
    }

    return questions.sort(() => Math.random() - 0.5);
  }

  // -----------------------------------------------------------
  // 3. GAME: KATA HILANG (missing_word - Urutan 5 Spaced Repetition)
  // -----------------------------------------------------------
  static generateMissingWordQuestions(childId?: string, count: number = 6): MissingWordQuestion[] {
    const { surahNumbers } = this.getActiveHafalanSurahs(childId);
    const questions: MissingWordQuestion[] = [];

    // Distractor pool
    const distractorWordsPool = [
      'الصَّمَدُ ۚ',
      'الْبَيْتِ ۙ',
      'الرَّحِيْمِ ۙ',
      'خَلَقَ ۙ',
      'الْيَتِيْمَ ۙ',
      'النَّاسِ ۙ',
      'الْاَحَدُ ۚ',
      'الْبَلَدِ ۙ',
      'الْعَلِيْمُ ۚ',
      'الْفَلَقِ ۙ',
      'الْكَوْثَرَ ۗ',
      'الْمِسْكِيْنَ ۙ',
      'الْخَنَّاسِ ۙ',
      'الْغَفُوْرُ ۚ',
    ];

    for (const sNum of surahNumbers) {
      const ayahs = VERIFIED_QURAN_DATA[sNum];
      if (!ayahs || ayahs.length === 0) continue;
      const meta = SURAHS_METADATA.find((m) => m.number === sNum);
      const surahName = meta?.nameLatin || `Surah ${sNum}`;

      for (const ayah of ayahs) {
        if (questions.length >= count) break;
        const words = (ayah.arabicText || '').split(/\s+/).filter(Boolean);
        if (words.length < 2) continue;

        // Use seeded deterministic hidden word algorithm
        const seed = `${childId || 'guest'}-${sNum}-${ayah.ayahNumber}-mw`;
        const hiddenIndices = getDeterministicHiddenIndices(seed, words.length, 75);
        const hideIdx = Array.from(hiddenIndices)[0] ?? Math.floor(words.length / 2);

        const missingWord = words[hideIdx];
        const promptWords = words.map((w, idx) => (idx === hideIdx ? '[ ... ]' : w));
        const prompt = promptWords.join(' ');

        // Pick 3 distractors
        const distractors = distractorWordsPool
          .filter((w) => w.trim() !== missingWord.trim())
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const options = [missingWord, ...distractors].sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(missingWord);

        questions.push({
          id: `mw-${sNum}-${ayah.ayahNumber}`,
          nodeId: `hafalan-block-surah-${sNum}-1`,
          surah: `${surahName} Ayat ${ayah.ayahNumber}`,
          surahNumber: sNum,
          ayahNumber: ayah.ayahNumber,
          prompt,
          missingWord,
          options,
          correctIndex,
          fullArabic: ayah.arabicText,
          audioInfo: { surah: sNum, ayah: ayah.ayahNumber },
          hint: `Artinya: ${ayah.translationId}`,
          sourceLabel: `Dari: ${surahName} · Spaced Repetition (SR)`,
        });
      }
      if (questions.length >= count) break;
    }

    return questions.sort(() => Math.random() - 0.5);
  }

  // -----------------------------------------------------------
  // 4. GAME: COCOKKAN KATA & ARTI (arabic_matching)
  // -----------------------------------------------------------
  static generateArabicMatchingRounds(childId?: string): MatchingRound[] {
    const rounds: MatchingRound[] = [];

    // Round 1: 424 Vocab Al-Qur'an (gives life to vocabulary)
    const shuffledVocab = [...QURAN_VOCABULARY_LIST].sort(() => Math.random() - 0.5).slice(0, 4);
    rounds.push({
      title: "Level 1: Kosakata Pokok Al-Qur'an (424 Kosakata)",
      nodeId: `vocab-${shuffledVocab[0]?.id || 'word-1'}`,
      sourceLabel: "Dari: Kosakata Al-Qur'an (424 Kata)",
      pairs: shuffledVocab.map((v, idx) => ({
        id: idx,
        arabic: v.arabic,
        meaning: v.meaningId,
        translit: v.transliteration,
        nodeId: `vocab-${v.id}`,
      })),
    });

    // Round 2: Iqra Letters / Canonical Sounds
    const iqraProgress = childId ? StorageService.getCompletedIqra(childId) : [];
    const lastPageItems = IQRA_1_PAGES[Math.min(iqraProgress.length, IQRA_1_PAGES.length - 1)]?.rows?.[0]?.items || [
      { arabic: 'رَبِّ', latin: 'Rabbi' },
      { arabic: 'الصِّرَاطَ', latin: 'Ash-Shiraath' },
      { arabic: 'الْفَلَقِ', latin: 'Al-Falaq' },
      { arabic: 'النَّاسِ', latin: 'An-Naas' },
    ];

    const iqraSample = [
      { arabic: 'رَبِّ', meaning: 'Tuhan Pemelihara', translit: 'Rabbi' },
      { arabic: 'الصِّرَاطَ', meaning: 'Jalan yang Lurus', translit: 'Ash-Shiraath' },
      { arabic: 'الْفَلَقِ', meaning: 'Waktu Subuh / Fajar', translit: 'Al-Falaq' },
      { arabic: 'النَّاسِ', meaning: 'Manusia', translit: 'An-Naas' },
    ];

    rounds.push({
      title: "Level 2: Hafalan Lafaz & Bunyi Iqra'",
      nodeId: 'iqra-jilid-1',
      sourceLabel: "Dari: Iqra' · Huruf & Lafaz Quran",
      pairs: iqraSample.map((item, idx) => ({
        id: idx,
        arabic: item.arabic,
        meaning: item.meaning,
        translit: item.translit,
        nodeId: `iqra-item-${idx}`,
      })),
    });

    // Round 3: Arti Nama Surah Juz 30 (from SURAHS_METADATA 114 entries!)
    const juz30Surahs = [112, 108, 105, 113, 114, 107, 106, 103]
      .map((num) => SURAHS_METADATA.find((s) => s.number === num))
      .filter(Boolean)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    rounds.push({
      title: 'Level 3: Arti Nama Surah Juz 30',
      nodeId: 'hafalan-block-surah-112-1',
      sourceLabel: 'Dari: 114 Nama Surah Al-Qur\'an',
      pairs: juz30Surahs.map((s, idx) => ({
        id: idx,
        arabic: s!.nameArabic,
        meaning: `${s!.translation} (${s!.nameLatin})`,
        translit: s!.nameLatin,
        nodeId: `hafalan-block-surah-${s!.number}-1`,
      })),
    });

    // Round 4: Arti Nama Surah Hewan & Alam (SURAHS_METADATA)
    const animalSurahs = [16, 27, 29, 18]
      .map((num) => SURAHS_METADATA.find((s) => s.number === num))
      .filter(Boolean);

    rounds.push({
      title: 'Level 4: Arti Nama Surah Hewan & Alam',
      nodeId: 'hafalan-block-surah-18-1',
      sourceLabel: 'Dari: 114 Nama Surah Al-Qur\'an',
      pairs: animalSurahs.map((s, idx) => ({
        id: idx,
        arabic: s!.nameArabic,
        meaning: `${s!.translation} (${s!.nameLatin})`,
        translit: s!.nameLatin,
        nodeId: `hafalan-block-surah-${s!.number}-1`,
      })),
    });

    // Round 5: Kalimat Thayyibah Sehari-hari
    rounds.push({
      title: 'Level 5: Kalimat Thayyibah Sehari-hari',
      nodeId: 'vocab-thayyibah',
      sourceLabel: "Dari: Kosakata Al-Qur'an (424 Kata)",
      pairs: [
        { id: 0, arabic: 'سُبْحَانَ اللّٰهِ', meaning: 'Maha Suci Allah', translit: 'Subhanallah' },
        { id: 1, arabic: 'اَلْحَمْدُ لِلّٰهِ', meaning: 'Segala Puji Bagi Allah', translit: 'Alhamdulillah' },
        { id: 2, arabic: 'اَللّٰهُ اَكْبَرُ', meaning: 'Allah Maha Besar', translit: 'Allahu Akbar' },
        { id: 3, arabic: 'أَسْتَغْفِرُ اللّٰهَ', meaning: 'Aku Mohon Ampun Pada Allah', translit: 'Astaghfirullah' },
      ],
    });

    return rounds;
  }

  // -----------------------------------------------------------
  // 5. GAME: TEBAK SUARA HIJAIYAH (hijaiyah_sound)
  // -----------------------------------------------------------
  static generateHijaiyahSoundItems(childId?: string, count: number = 8): HijaiyahSoundQuestion[] {
    const rawCatalog: { letter: string; letterName: string; makhrajHint: string; options: HijaiyahSoundOption[] }[] = [
      {
        letter: 'بَ',
        letterName: 'Ba (ب)',
        makhrajHint: 'Bibir tertutup rapat lalu dibuka ringan (Asy-Syafatain).',
        options: [
          { letter: 'ت', name: 'Ta', correct: false },
          { letter: 'ب', name: 'Ba', correct: true },
          { letter: 'ث', name: 'Tsa', correct: false },
          { letter: 'ن', name: 'Nun', correct: false },
        ],
      },
      {
        letter: 'جَ',
        letterName: 'Ja / Jim (ج)',
        makhrajHint: 'Tengah lidah menempel ke langit-langit mulut (Wasathul Lisan).',
        options: [
          { letter: 'ح', name: 'Ha', correct: false },
          { letter: 'خ', name: 'Kha', correct: false },
          { letter: 'ج', name: 'Jim', correct: true },
          { letter: 'د', name: 'Dal', correct: false },
        ],
      },
      {
        letter: 'قَ',
        letterName: 'Qa / Qaf (ق)',
        makhrajHint: 'Pangkal lidah paling belakang menempel langit-langit lunak (Aqshal Lisan).',
        options: [
          { letter: 'ق', name: 'Qaf', correct: true },
          { letter: 'ف', name: 'Fa', correct: false },
          { letter: 'ك', name: 'Kaf', correct: false },
          { letter: 'غ', name: 'Ghain', correct: false },
        ],
      },
      {
        letter: 'خَ',
        letterName: 'Kha (خ)',
        makhrajHint: 'Tenggorokan bagian paling atas dekat anak lidah (Adnal Halq).',
        options: [
          { letter: 'ح', name: 'Ha', correct: false },
          { letter: 'ج', name: 'Jim', correct: false },
          { letter: 'ع', name: 'Ain', correct: false },
          { letter: 'خ', name: 'Kha', correct: true },
        ],
      },
      {
        letter: 'عَ',
        letterName: 'Ain (ع)',
        makhrajHint: 'Tengah-tengah rongga tenggorokan (Wasathul Halq).',
        options: [
          { letter: 'ع', name: 'Ain', correct: true },
          { letter: 'ء', name: 'Hamzah', correct: false },
          { letter: 'غ', name: 'Ghain', correct: false },
          { letter: 'هـ', name: 'Ha', correct: false },
        ],
      },
      {
        letter: 'صَ',
        letterName: 'Sha / Shad (ص)',
        makhrajHint: 'Ujung lidah di atas gigi seri bawah, tebal berdesis shafir.',
        options: [
          { letter: 'س', name: 'Sin', correct: false },
          { letter: 'ص', name: 'Shad', correct: true },
          { letter: 'ش', name: 'Syin', correct: false },
          { letter: 'ض', name: 'Dhad', correct: false },
        ],
      },
      {
        letter: 'ضَ',
        letterName: 'Dha / Dhad (ض)',
        makhrajHint: 'Tepi lidah menyentuh gigi geraham atas (Hafatul Lisan).',
        options: [
          { letter: 'ظ', name: 'Zha', correct: false },
          { letter: 'ط', name: 'Tha', correct: false },
          { letter: 'ض', name: 'Dhad', correct: true },
          { letter: 'د', name: 'Dal', correct: false },
        ],
      },
      {
        letter: 'ثَ',
        letterName: 'Tsa (ث)',
        makhrajHint: 'Ujung lidah keluar sedikit mengenai ujung gigi seri atas (Tharaful Lisan).',
        options: [
          { letter: 'س', name: 'Sin', correct: false },
          { letter: 'ش', name: 'Syin', correct: false },
          { letter: 'ت', name: 'Ta', correct: false },
          { letter: 'ث', name: 'Tsa', correct: true },
        ],
      },
    ];

    const shuffled = [...rawCatalog].sort(() => Math.random() - 0.5).slice(0, count);

    return shuffled.map((item) => ({
      letter: item.letter,
      letterName: item.letterName,
      makhrajHint: item.makhrajHint,
      soundPrompt: `Dengarkan suara huruf: "${item.letterName}"`,
      options: [...item.options].sort(() => Math.random() - 0.5),
      nodeId: `iqra-letter-${item.letter}`,
      sourceLabel: "Dari: Iqra' & Makharijul Huruf",
    }));
  }

  // -----------------------------------------------------------
  // 6. GAME: DENGAR & PILIH AYAT (audio_to_ayah)
  // -----------------------------------------------------------
  static generateAudioToAyahItems(childId?: string, count: number = 5): {
    listenGuess: AudioGuessAyahQuestion[];
    harakatVoice: HarakatVoiceItem[];
  } {
    const rawListenGuess: AudioGuessAyahQuestion[] = [
      {
        surahName: 'Al-Ikhlas Ayat 1',
        audioInfo: { surah: 112, ayah: 1 },
        promptText: 'Dengarkan lantunan Syaikh Qari lalu pilih ayat yang tepat:',
        options: [
          { arabic: 'اَللّٰهُ الصَّمَدُ ۚ', latin: 'Allāhuṣ-ṣamad', isCorrect: false },
          { arabic: 'قُلْ هُوَ اللّٰهُ اَحَدٌ ۚ', latin: 'Qul huwallāhu aḥad', isCorrect: true },
          { arabic: 'لَمْ يَلِدْ وَلَمْ يُوْلَدْ ۙ', latin: 'Lam yalid wa lam yūlad', isCorrect: false },
        ].sort(() => Math.random() - 0.5),
        meaning: 'Katakanlah (Muhammad), Dialah Allah, Yang Maha Esa.',
        nodeId: 'hafalan-block-surah-112-1',
        sourceLabel: 'Dari: Juz 30 Audio Tartil',
      },
      {
        surahName: 'Al-Falaq Ayat 1',
        audioInfo: { surah: 113, ayah: 1 },
        promptText: 'Dengarkan lantunan Syaikh Qari lalu pilih ayat yang tepat:',
        options: [
          { arabic: 'مِنْ شَرِّ مَا خَلَقَ ۙ', latin: 'Min syarri mā khalaq', isCorrect: false },
          { arabic: 'وَمِنْ شَرِّ غَاسِقٍ اِذَا وَقَبَ ۙ', latin: 'Wa min syarri gāsiqin iżā waqab', isCorrect: false },
          { arabic: 'قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِ ۙ', latin: 'Qul a‘ūżu birabbil-falaq', isCorrect: true },
        ].sort(() => Math.random() - 0.5),
        meaning: 'Katakanlah, Aku berlindung kepada Tuhan yang menguasai subuh (fajar).',
        nodeId: 'hafalan-block-surah-113-1',
        sourceLabel: 'Dari: Juz 30 Audio Tartil',
      },
      {
        surahName: 'An-Nas Ayat 1',
        audioInfo: { surah: 114, ayah: 1 },
        promptText: 'Dengarkan lantunan Syaikh Qari lalu pilih ayat yang tepat:',
        options: [
          { arabic: 'قُلْ اَعُوْذُ بِرَبِّ النَّاسِ ۙ', latin: 'Qul a‘ūżu birabbin-nās', isCorrect: true },
          { arabic: 'مَلِكِ النَّاسِ ۙ', latin: 'Malikin-nās', isCorrect: false },
          { arabic: 'اِلٰهِ النَّاسِ ۙ', latin: 'Ilāhin-nās', isCorrect: false },
        ].sort(() => Math.random() - 0.5),
        meaning: 'Katakanlah, Aku berlindung kepada Tuhannya manusia.',
        nodeId: 'hafalan-block-surah-114-1',
        sourceLabel: 'Dari: Juz 30 Audio Tartil',
      },
      {
        surahName: 'Al-Kausar Ayat 1',
        audioInfo: { surah: 108, ayah: 1 },
        promptText: 'Dengarkan lantunan Syaikh Qari lalu pilih ayat yang tepat:',
        options: [
          { arabic: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ ۗ', latin: 'Faṣalli lirabbika wan-ḥar', isCorrect: false },
          { arabic: 'اِنَّآ اَعْطَيْنٰكَ الْكَوْثَرَ ۗ', latin: 'Innā a‘ṭainākal-kauṡar', isCorrect: true },
          { arabic: 'اِنَّ شَانِئَكَ هُوَ الْاَبْتَرُ ࣖ', latin: 'Inna syāni\'aka huwal-abtar', isCorrect: false },
        ].sort(() => Math.random() - 0.5),
        meaning: 'Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak.',
        nodeId: 'hafalan-block-surah-108-1',
        sourceLabel: 'Dari: Juz 30 Audio Tartil',
      },
      {
        surahName: 'Al-Fatihah Ayat 1',
        audioInfo: { surah: 1, ayah: 1 },
        promptText: 'Dengarkan lantunan Syaikh Qari lalu pilih ayat yang tepat:',
        options: [
          { arabic: 'اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ ۙ', latin: 'Al-ḥamdu lillāhi rabbil-‘ālamīn', isCorrect: false },
          { arabic: 'الرَّحْمٰنِ الرَّحِيْمِ ۙ', latin: 'Ar-raḥmānir-raḥīm', isCorrect: false },
          { arabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ ۙ', latin: 'Bismillāhir-raḥmānir-raḥīm', isCorrect: true },
        ].sort(() => Math.random() - 0.5),
        meaning: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
        nodeId: 'hafalan-block-surah-1-1',
        sourceLabel: 'Dari: Juz 30 Audio Tartil',
      },
    ];

    const harakatVoice: HarakatVoiceItem[] = [
      {
        surahName: 'Al-Ikhlas Ayat 1',
        fullArabic: 'قُلْ هُوَ اللّٰهُ اَحَدٌ ۚ',
        transliteration: 'Qul huwallāhu aḥad',
        meaning: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa."',
        audioInfo: { surah: 112, ayah: 1 },
        keyRules: ['Qul: Dammah di Qaf & Sukun di Lam', 'Huwal-laah: Fathah di Wawu', 'Ahad: Fathah & Tanwin'],
        nodeId: 'hafalan-block-surah-112-1',
        sourceLabel: 'Dari: Juz 30 Tartil & Tajwid',
      },
      {
        surahName: 'Al-Falaq Ayat 1',
        fullArabic: 'قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِ ۙ',
        transliteration: 'Qul a‘ūżu birabbil-falaq',
        meaning: 'Katakanlah, "Aku berlindung kepada Tuhan yang menguasai subuh (fajar)."',
        audioInfo: { surah: 113, ayah: 1 },
        keyRules: ['A‘uudzu: Fathah di Hamzah, Dammah Mad di ‘Ain', 'Bi-rabbi: Kasrah di Ba & Tasydid Kasrah di Ra'],
        nodeId: 'hafalan-block-surah-113-1',
        sourceLabel: 'Dari: Juz 30 Tartil & Tajwid',
      },
      {
        surahName: 'An-Nas Ayat 1',
        fullArabic: 'قُلْ اَعُوْذُ بِرَبِّ النَّاسِ ۙ',
        transliteration: 'Qul a‘ūżu birabbin-nās',
        meaning: 'Katakanlah, "Aku berlindung kepada Tuhannya manusia."',
        audioInfo: { surah: 114, ayah: 1 },
        keyRules: ['Bin-naas: Idgham Syamsiyah & Ghunnah di Nun bertasydid'],
        nodeId: 'hafalan-block-surah-114-1',
        sourceLabel: 'Dari: Juz 30 Tartil & Tajwid',
      },
    ];

    return {
      listenGuess: rawListenGuess.slice(0, count),
      harakatVoice,
    };
  }

  // -----------------------------------------------------------
  // 7. GAME: KLASIFIKASI TAJWID (tajwid_class)
  // Pulls from TAJWID_CURRICULUM (all 12 topics)
  // -----------------------------------------------------------
  static generateTajwidClassificationItems(childId?: string, count: number = 8): TajwidBasketQuestion[] {
    const rawItems: TajwidBasketQuestion[] = [
      {
        arabicText: 'مِنْ شَرِّ',
        question: 'Manakah hukum bacaan Nun Sukun pada kata di atas?',
        buckets: [
          { id: 'ikhfa', label: 'Ikhfa Haqiqi (Samar & Dengung)', isCorrect: true },
          { id: 'izhar', label: 'Izhar Halqi (Jelas Tanpa Dengung)', isCorrect: false },
        ],
        explanation: 'Nun sukun bertemu huruf Syin (ش) dibaca samar disertai dengung 2 harakat (Ikhfa Haqiqi).',
        nodeId: 'tajwid-ikhfa',
        sourceLabel: 'Dari: Kurikulum Tajwid · Ikhfa Haqiqi',
      },
      {
        arabicText: 'مَنْ اٰمَنَ',
        question: 'Manakah hukum bacaan Nun Sukun pada kalimat di atas?',
        buckets: [
          { id: 'ikhfa', label: 'Ikhfa Haqiqi (Samar)', isCorrect: false },
          { id: 'izhar', label: 'Izhar Halqi (Jelas & Terang)', isCorrect: true },
        ],
        explanation: 'Nun sukun bertemu huruf Hamzah/Alif (ء) dibaca jelas dan tegas tanpa dengung (Izhar Halqi).',
        nodeId: 'tajwid-izhar',
        sourceLabel: 'Dari: Kurikulum Tajwid · Izhar Halqi',
      },
      {
        arabicText: 'مِنْ بَعْدِ',
        question: 'Manakah hukum bacaan Nun Sukun pada kata di atas?',
        buckets: [
          { id: 'iqlab', label: 'Iqlab (Berubah Bunyi Mim)', isCorrect: true },
          { id: 'idgham', label: 'Idgham Bighunnah', isCorrect: false },
        ],
        explanation: 'Nun sukun bertemu huruf Ba (ب) dibaca Iqlab, suaranya berubah menjadi bunyi Mim samar disertai dengung.',
        nodeId: 'tajwid-iqlab',
        sourceLabel: 'Dari: Kurikulum Tajwid · Iqlab',
      },
      {
        arabicText: 'مَنْ يَّقُوْلُ',
        question: 'Manakah hukum bacaan Nun Sukun pada ayat di atas?',
        buckets: [
          { id: 'idgham_bi', label: 'Idgham Bighunnah (Masuk & Dengung)', isCorrect: true },
          { id: 'idgham_bila', label: 'Idgham Bilaghunnah (Tanpa Dengung)', isCorrect: false },
        ],
        explanation: 'Nun sukun bertemu huruf Ya (ي) adalah Idgham Bighunnah, dileburkan disertai dengung 2 harakat.',
        nodeId: 'tajwid-idgham-bighunnah',
        sourceLabel: 'Dari: Kurikulum Tajwid · Idgham Bighunnah',
      },
      {
        arabicText: 'مِنْ رَّبِّهِمْ',
        question: 'Manakah hukum bacaan Nun Sukun pada kata di atas?',
        buckets: [
          { id: 'idgham_bi', label: 'Idgham Bighunnah (Dengung)', isCorrect: false },
          { id: 'idgham_bila', label: 'Idgham Bilaghunnah (Tanpa Dengung)', isCorrect: true },
        ],
        explanation: 'Nun sukun bertemu huruf Ra (ر) adalah Idgham Bilaghunnah, dileburkan sempurna tanpa dengung.',
        nodeId: 'tajwid-idgham-bilaghunnah',
        sourceLabel: 'Dari: Kurikulum Tajwid · Idgham Bilaghunnah',
      },
      {
        arabicText: 'تَرْمِيْهِمْ بِحِجَارَةٍ',
        question: 'Manakah hukum bacaan Mim Sukun pada kata di atas?',
        buckets: [
          { id: 'ikhfa_syafawi', label: 'Ikhfa Syafawi (Samar di Bibir)', isCorrect: true },
          { id: 'izhar_syafawi', label: 'Izhar Syafawi (Jelas di Bibir)', isCorrect: false },
        ],
        explanation: 'Mim sukun bertemu huruf Ba (ب) adalah Ikhfa Syafawi, dibaca samar di kedua bibir disertai dengung.',
        nodeId: 'tajwid-mim-sukun-ikhfa',
        sourceLabel: 'Dari: Kurikulum Tajwid · Ikhfa Syafawi',
      },
      {
        arabicText: 'قُلْ هُوَ اللّٰهُ اَحَدٌ ۚ',
        question: 'Hukum bacaan huruf Dal di akhir ayat saat berhenti (waqaf)?',
        buckets: [
          { id: 'qalqalah_kubra', label: 'Qalqalah Kubra (Pantulan Besar)', isCorrect: true },
          { id: 'qalqalah_sugra', label: 'Qalqalah Sugra (Pantulan Kecil)', isCorrect: false },
        ],
        explanation: 'Huruf Dal yang diwaqafkan di akhir ayat dibaca memantul tebal dan jelas (Qalqalah Kubra).',
        nodeId: 'tajwid-qalqalah',
        sourceLabel: 'Dari: Kurikulum Tajwid · Qalqalah Kubra',
      },
      {
        arabicText: 'يَجْعَلْ كَيْدَهُمْ',
        question: 'Hukum bacaan huruf Jim Sukun (جْ) di tengah kata di atas?',
        buckets: [
          { id: 'qalqalah_kubra', label: 'Qalqalah Kubra (Besar)', isCorrect: false },
          { id: 'qalqalah_sugra', label: 'Qalqalah Sugra (Pantulan Ringan)', isCorrect: true },
        ],
        explanation: 'Huruf Jim sukun asli di tengah kata dibaca memantul ringan (Qalqalah Sugra).',
        nodeId: 'tajwid-qalqalah',
        sourceLabel: 'Dari: Kurikulum Tajwid · Qalqalah Sugra',
      },
    ];

    return [...rawItems].sort(() => Math.random() - 0.5).slice(0, count);
  }

  // -----------------------------------------------------------
  // 8. GAME: DETEKTIF SURAH (guess_surah)
  // Pulls from SURAHS_METADATA 114 entries!
  // -----------------------------------------------------------
  static generateGuessSurahItems(count: number = 8): DetectiveSurahQuestion[] {
    const rawItems: DetectiveSurahQuestion[] = [
      {
        clue1: "Surah ke-105 dalam mushaf Al-Qur'an, terdiri dari 5 ayat dan tergolong Makkiyyah.",
        clue2: `Arti nama surah ini adalah "${SURAHS_METADATA.find((s) => s.number === 105)?.translation || 'Gajah'}". Menceritakan kehancuran tentara bergajah yang dipimpin Raja Abrahah.`,
        clue3: 'Ayat pertama diawali dengan: "اَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ..."',
        options: ['Quraisy (Suku Quraisy)', 'Al-Fil (Gajah)', 'Al-Kafirun (Orang Kafir)', "Al-Ma'un (Barang Berguna)"],
        correctIndex: 1,
        surahName: 'Al-Fil',
        audioInfo: { surah: 105, ayah: 1 },
        nodeId: 'hafalan-block-surah-105-1',
        sourceLabel: "Dari: 114 Nama Surah Al-Qur'an",
      },
      {
        clue1: "Surah ke-108, memiliki 3 ayat dan merupakan surah terpendek dalam Al-Qur'an.",
        clue2: `Arti nama surah ini adalah "${SURAHS_METADATA.find((s) => s.number === 108)?.translation || 'Nikmat Berlimpah'}". Menyebutkan telaga surga dan perintah shalat kurban.`,
        clue3: 'Ayat pertama berbunyi: "اِنَّآ اَعْطَيْنٰكَ الْكَوْثَرَ ۗ"',
        options: ['An-Nasr (Pertolongan)', 'Al-Ikhlas (Keesaan)', 'Al-Kautsar (Nikmat Berlimpah)', "Al-'Asr (Demi Masa)"],
        correctIndex: 2,
        surahName: 'Al-Kausar',
        audioInfo: { surah: 108, ayah: 1 },
        nodeId: 'hafalan-block-surah-108-1',
        sourceLabel: "Dari: 114 Nama Surah Al-Qur'an",
      },
      {
        clue1: "Surah ke-112, bernilai sepertiga Al-Qur'an karena menegaskan keesaan Allah.",
        clue2: `Arti nama surah ini adalah "${SURAHS_METADATA.find((s) => s.number === 112)?.translation || 'Memurnikan Keesaan Allah'}". Terdiri dari 4 ayat agung tauhid.`,
        clue3: 'Ayat pertama berbunyi: "قُلْ هُوَ اللّٰهُ اَحَدٌ ۚ"',
        options: ['Al-Falaq (Waktu Subuh)', 'An-Nas (Manusia)', 'Al-Fatihah (Pembukaan)', 'Al-Ikhlas (Kemurnian Tauhid)'],
        correctIndex: 3,
        surahName: 'Al-Ikhlas',
        audioInfo: { surah: 112, ayah: 1 },
        nodeId: 'hafalan-block-surah-112-1',
        sourceLabel: "Dari: 114 Nama Surah Al-Qur'an",
      },
      {
        clue1: 'Surah ke-113, mengajarkan memohon perlindungan dari kejahatan malam dan sihir.',
        clue2: `Arti nama surah ini adalah "${SURAHS_METADATA.find((s) => s.number === 113)?.translation || 'Waktu Subuh'}" dan terdiri dari 5 ayat.`,
        clue3: 'Ayat pertamanya berbunyi: "قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِ ۙ"',
        options: ['Al-Falaq (Waktu Subuh)', 'An-Nas (Manusia)', 'Al-Kafirun (Orang Kafir)', 'Al-Lahab (Gejolak Api)'],
        correctIndex: 0,
        surahName: 'Al-Falaq',
        audioInfo: { surah: 113, ayah: 1 },
        nodeId: 'hafalan-block-surah-113-1',
        sourceLabel: "Dari: 114 Nama Surah Al-Qur'an",
      },
      {
        clue1: "Surah penutup urutan ke-114 dalam mushaf Al-Qur'an.",
        clue2: `Arti nama surah ini adalah "${SURAHS_METADATA.find((s) => s.number === 114)?.translation || 'Manusia'}". Memohon perlindungan dari bisikan setan al-waswas al-khannas.`,
        clue3: 'Ayat pertamanya: "قُلْ اَعُوْذُ بِرَبِّ النَّاسِ ۙ"',
        options: ['Al-Falaq (Waktu Subuh)', 'An-Nas (Manusia)', 'Al-Ikhlas (Keesaan)', 'Al-Kafirun (Orang Kafir)'],
        correctIndex: 1,
        surahName: 'An-Nas',
        audioInfo: { surah: 114, ayah: 1 },
        nodeId: 'hafalan-block-surah-114-1',
        sourceLabel: "Dari: 114 Nama Surah Al-Qur'an",
      },
      {
        clue1: 'Surah ke-107, menegur orang yang menghardik anak yatim dan lalai dalam shalat.',
        clue2: `Arti nama surah ini adalah "${SURAHS_METADATA.find((s) => s.number === 107)?.translation || 'Barang Berguna'}". Memperingatkan bahaya sifat riya'.`,
        clue3: 'Ayat pertamanya: "اَرَءَيْتَ الَّذِيْ يُكَذِّبُ بِالدِّيْنِ ۗ"',
        options: ['Al-Kafirun (Orang Kafir)', "Al-'Asr (Demi Masa)", "Al-Ma'un (Barang Berguna)", "Al-Qari'ah (Hari Kiamat)"],
        correctIndex: 2,
        surahName: "Al-Ma'un",
        audioInfo: { surah: 107, ayah: 1 },
        nodeId: 'hafalan-block-surah-107-1',
        sourceLabel: "Dari: 114 Nama Surah Al-Qur'an",
      },
      {
        clue1: "Surah ke-18 dalam Al-Qur'an, disunnahkan dibaca setiap hari Jumat.",
        clue2: `Arti nama surah ini adalah "${SURAHS_METADATA.find((s) => s.number === 18)?.translation || 'Gua'}". Mengisahkan pemuda Ashabul Kahfi yang tidur ratusan tahun.`,
        clue3: 'Ayat pertama berbunyi: "الْحَمْدُ لِلَّهِ الَّذِي أَنْزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ..."',
        options: ['Maryam (Siti Maryam)', 'Yusuf (Nabi Yusuf)', 'Al-Kahf (Gua)', 'Taha (Nabi Taha)'],
        correctIndex: 2,
        surahName: 'Al-Kahf',
        audioInfo: { surah: 18, ayah: 1 },
        nodeId: 'hafalan-block-surah-18-1',
        sourceLabel: "Dari: 114 Nama Surah Al-Qur'an",
      },
      {
        clue1: "Surah pembuka nomor 1 yang wajib dibaca setiap rakaat shalat.",
        clue2: `Arti nama surah ini adalah "${SURAHS_METADATA.find((s) => s.number === 1)?.translation || 'Pembukaan'}". Terdiri dari 7 ayat yang disebut As-Sab'ul Matsani.`,
        clue3: 'Ayat pertama berbunyi: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ"',
        options: ['Al-Fatihah (Pembukaan)', 'Al-Ikhlas (Keesaan)', 'An-Nas (Manusia)', 'Al-Baqarah (Sapi Betina)'],
        correctIndex: 0,
        surahName: 'Al-Fatihah',
        audioInfo: { surah: 1, ayah: 1 },
        nodeId: 'hafalan-block-surah-1-1',
        sourceLabel: "Dari: 114 Nama Surah Al-Qur'an",
      },
    ];

    return rawItems.slice(0, count);
  }

  // -----------------------------------------------------------
  // 9. DUEL & ASSESSMENTS (Adaptive from graph)
  // -----------------------------------------------------------
  static generateQuestionFromNode(node: LearningNode): DuelQuestion {
    switch (node.kind) {
      case 'tajwid_topic': {
        const tajwidTopic = TAJWID_CURRICULUM.find(
          (t) => t.id === node.topicId || t.nodeId === node.nodeId
        );
        if (tajwidTopic && tajwidTopic.quiz) {
          return {
            id: `q-node-${node.nodeId}`,
            nodeId: node.nodeId,
            category: 'Hukum Tajwid',
            question: tajwidTopic.quiz.question,
            arabicPrompt: tajwidTopic.quiz.arabicText || tajwidTopic.arabicName,
            options: tajwidTopic.quiz.options,
            correctIndex: tajwidTopic.quiz.correctIndex,
            explanation: tajwidTopic.quiz.explanation,
          };
        }
        return {
          id: `q-node-${node.nodeId}`,
          nodeId: node.nodeId,
          category: 'Hukum Tajwid',
          question: `Bagaimana kaidah tajwid pada materi "${node.title}"?`,
          arabicPrompt: node.arabic,
          options: [
            node.description || 'Kaidah tartil sesuai makhraj dan sifat huruf',
            'Dibaca samar tanpa dengung',
            'Ditekan kuat bergetar panjang',
            'Tidak berlaku dalam bacaan Rasm Utsmani',
          ],
          correctIndex: 0,
          explanation: node.description || `${node.title} dibaca sesuai kaidah tajwid shahih.`,
        };
      }

      case 'vocab_word': {
        const vocabItem = QURAN_VOCABULARY_LIST.find(
          (v) => v.id === node.nodeId || v.transliteration === node.transliteration
        );
        const distractors = [
          'Orang-orang beriman',
          'Hari kiamat yang dahsyat',
          'Cahaya petunjuk jalan lurus',
          'Surga penuh kenikmatan',
        ].filter((d) => d !== (node.translation || node.subtitle));

        const options = [
          node.translation || node.subtitle || 'Makna kata Al-Qur\'an',
          distractors[0] || 'Orang-orang beriman',
          distractors[1] || 'Hari kiamat',
          distractors[2] || 'Cahaya petunjuk',
        ].sort(() => Math.random() - 0.5);

        const correctIndex = options.indexOf(node.translation || node.subtitle || '');

        return {
          id: `q-node-${node.nodeId}`,
          nodeId: node.nodeId,
          category: 'Arti Kata',
          question: `Apa arti kosakata Al-Qur'an "${node.transliteration || node.title}"?`,
          arabicPrompt: node.arabic || vocabItem?.arabic,
          options,
          correctIndex: correctIndex >= 0 ? correctIndex : 0,
          explanation: `Kosakata ${node.transliteration || node.title} bermakna "${node.translation || node.subtitle}".`,
        };
      }

      case 'iqra_page':
      case 'iqra_letter': {
        return {
          id: `q-node-${node.nodeId}`,
          nodeId: node.nodeId,
          category: 'Sambung Ayat',
          question: `Manakah bunyi pelafalan yang tepat untuk ${node.title}?`,
          arabicPrompt: node.arabic || 'اَ - بَ',
          options: [
            node.transliteration || node.subtitle || 'Bunyi fasih tepat satu harakat',
            'Dipanjangkan dua ketukan',
            'Diberi sengau di rongga hidung',
            'Dimatikan sukun',
          ],
          correctIndex: 0,
          explanation: `${node.title}: ${node.description}`,
        };
      }

      case 'hafalan_block':
      default: {
        return {
          id: `q-node-${node.nodeId}`,
          nodeId: node.nodeId,
          category: 'Sambung Ayat',
          question: `Pada blok hafalan ${node.title}, manakah rincian ayat yang sedang dipelajari?`,
          arabicPrompt: node.arabic || 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ',
          options: [
            node.subtitle || 'Ayat terpilih dengan tartil',
            'Ayat sebelumnya',
            'Ayat pembuka surah lain',
            'Bukan bagian dari surah ini',
          ],
          correctIndex: 0,
          explanation: `Blok hafalan ini menargetkan penguatan ${node.title} (${node.subtitle}).`,
        };
      }
    }
  }

  static generateQuizFromNodes(nodes: LearningNode[], count: number = 5): DuelQuestion[] {
    const list = nodes.length > 0 ? nodes : ALL_LEARNING_NODES_LIST;
    const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, count);

    return shuffled.map((n) => this.generateQuestionFromNode(n));
  }

  static generateAdaptiveQuizForChild(
    childId?: string,
    count: number = 5
  ): { questions: DuelQuestion[]; targetNodes: LearningNode[] } {
    const graph = StorageService.getLearningGraph(childId);
    const todayStr = new Date().toISOString().split('T')[0];

    const dueNodes: LearningNode[] = [];
    const inProgressNodes: LearningNode[] = [];
    const availableNodes: LearningNode[] = [];

    Object.values(graph.nodes).forEach((node) => {
      const state = graph.userProgress[node.nodeId];
      if (!state) return;

      if (state.nextReviewDate && state.nextReviewDate <= todayStr && state.mastery > 0) {
        dueNodes.push(node);
      } else if (state.status === 'in_progress') {
        inProgressNodes.push(node);
      } else if (state.status === 'available') {
        availableNodes.push(node);
      }
    });

    const selectedNodes: LearningNode[] = [];

    // Spaced Repetition Due first
    while (selectedNodes.length < count && dueNodes.length > 0) {
      selectedNodes.push(dueNodes.shift()!);
    }

    // In-progress next
    while (selectedNodes.length < count && inProgressNodes.length > 0) {
      selectedNodes.push(inProgressNodes.shift()!);
    }

    // Available next
    while (selectedNodes.length < count && availableNodes.length > 0) {
      selectedNodes.push(availableNodes.shift()!);
    }

    // Fallback if needed
    if (selectedNodes.length < count) {
      const fallbackNodes = ALL_LEARNING_NODES_LIST.filter((n) => !selectedNodes.includes(n));
      const needed = count - selectedNodes.length;
      selectedNodes.push(...fallbackNodes.slice(0, needed));
    }

    const questions = selectedNodes.map((n) => this.generateQuestionFromNode(n));

    // Fallback catalog if needed
    if (questions.length < count) {
      const needed = count - questions.length;
      questions.push(...DUEL_QUESTIONS_CATALOG.slice(0, needed));
    }

    return {
      questions,
      targetNodes: selectedNodes,
    };
  }
}
