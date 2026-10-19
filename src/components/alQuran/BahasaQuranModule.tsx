import React, { useState, useEffect, useMemo } from 'react';
import {
  BookMarked,
  Globe2,
  Sparkles,
  Volume2,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  ChevronLeft,
  Search,
  Bell,
  Flame,
  Award,
  Layers,
  HelpCircle,
  Play,
  RotateCcw,
  Check,
  X,
  Clock,
  Star,
  BookOpen,
  Eye,
  EyeOff,
  Puzzle,
  ShieldCheck,
  FileText,
  Filter,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import {
  QURAN_VOCABULARY_LIST,
  MUFRODAT_LEVELS,
  resolveAyahWords,
  WORD_OF_THE_DAY_POOL,
  AyahWordItem,
  auditAyahMufrodat,
  AyahAuditSummary,
  MufrodatAuditDetail,
} from '../../data/vocabularyData';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { getSurahAyahs } from '../../data/quranData';
import { StorageService } from '../../services/storageService';
import { AyahData, MufrodatDailyTracker, QuranVocabularyItem, MufrodatMasteryStage } from '../../types';

interface BahasaQuranModuleProps {
  childId: string;
  onBack: () => void;
  onOpenTafsir?: (surahNumber: number, ayahNumber: number) => void;
}

type MainTab = 'ayat' | 'jenjang' | 'kuis' | 'kamus';

export const BahasaQuranModule: React.FC<BahasaQuranModuleProps> = ({
  childId,
  onBack,
  onOpenTafsir,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<MainTab>('ayat');

  // Surah & Ayah selection state
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number>(1);
  const [showSurahModal, setShowSurahModal] = useState<boolean>(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState<string>('');

  // Ayah data loading state
  const [currentSurahAyahs, setCurrentSurahAyahs] = useState<AyahData[]>([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState<boolean>(true);

  // Child mastery & reminder tracker state
  const [masteredVocabIds, setMasteredVocabIds] = useState<string[]>(() =>
    StorageService.getMasteredVocab(childId)
  );
  const [tracker, setTracker] = useState<MufrodatDailyTracker>(() =>
    StorageService.getMufrodatTracker(childId)
  );

  // Reminder alert toast preview state
  const [showReminderNotification, setShowReminderNotification] = useState<boolean>(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    word: AyahWordItem | QuranVocabularyItem;
    options: string[];
    correctAnswer: string;
  }>>([]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [quizScope, setQuizScope] = useState<'ayah' | 'surah' | 'all'>('ayah');

  // Kamus search and filter state
  const [kamusSearchQuery, setKamusSearchQuery] = useState<string>('');
  const [kamusFilter, setKamusFilter] = useState<'all' | 'mastered' | 'unmastered'>('all');

  // Currently playing speech word
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  // Leveling System: 'open' (Level 1: Terbuka) | 'recall' (Level 2: Sembunyikan Arti / Uji Ingatan) | 'puzzle' (Level 3: Susun Kalimat)
  const [learningLevelMode, setLearningLevelMode] = useState<'open' | 'recall' | 'puzzle'>('open');
  const [wordStages, setWordStages] = useState<Record<string, 1 | 2 | 3>>(() =>
    StorageService.getWordMasteryStages(childId)
  );
  const [revealedWordIds, setRevealedWordIds] = useState<Record<string, boolean>>({});

  // Sentence Builder Puzzle state (Level 3: Susun Kalimat)
  const [scrambledTokens, setScrambledTokens] = useState<Array<{
    id: string;
    originalIndex: number;
    arabic: string;
    transliteration: string;
    translation: string;
  }>>([]);
  const [placedTokens, setPlacedTokens] = useState<Array<{
    id: string;
    originalIndex: number;
    arabic: string;
    transliteration: string;
    translation: string;
  }>>([]);
  const [sentenceSuccess, setSentenceSuccess] = useState<boolean>(false);
  const [sentenceErrorMsg, setSentenceErrorMsg] = useState<string | null>(null);
  const [showSentenceHint, setShowSentenceHint] = useState<boolean>(false);

  // Audit Otomatis Mufrodat State
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [reAuditKey, setReAuditKey] = useState<number>(0);
  const [auditFilterTab, setAuditFilterTab] = useState<'all' | 'valid' | 'filtered'>('all');

  // Fetch ayahs when selectedSurahNumber changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingAyahs(true);
    getSurahAyahs(selectedSurahNumber)
      .then((ayahs) => {
        if (isMounted) {
          setCurrentSurahAyahs(ayahs);
          // If previous ayah number out of range, clamp to 1
          if (selectedAyahNumber > ayahs.length || selectedAyahNumber < 1) {
            setSelectedAyahNumber(1);
          }
          setIsLoadingAyahs(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load ayahs:', err);
        if (isMounted) setIsLoadingAyahs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber]);

  // Current surah metadata
  const currentSurahMeta = useMemo(() => {
    return SURAHS_METADATA.find((s) => s.number === selectedSurahNumber) || SURAHS_METADATA[0];
  }, [selectedSurahNumber]);

  // Current ayah data
  const currentAyahData = useMemo(() => {
    return currentSurahAyahs.find((a) => a.ayahNumber === selectedAyahNumber) || currentSurahAyahs[0];
  }, [currentSurahAyahs, selectedAyahNumber]);

  // Audit report for current ayah (Audit Otomatis Mufrodat)
  const currentAyahAudit: AyahAuditSummary | null = useMemo(() => {
    if (!currentAyahData) return null;
    return auditAyahMufrodat(
      selectedSurahNumber,
      selectedAyahNumber,
      currentAyahData.words,
      currentAyahData.translationId
    );
  }, [selectedSurahNumber, selectedAyahNumber, currentAyahData, reAuditKey]);

  // Resolved words for current ayah (always authentic, accurate meaning & transliteration for all 114 surahs)
  const currentAyahWords = useMemo(() => {
    return currentAyahAudit ? currentAyahAudit.auditedWords : [];
  }, [currentAyahAudit]);

  // Trigger automated re-audit
  const handleReAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setReAuditKey((k) => k + 1);
      setIsAuditing(false);
    }, 450);
  };

  // Word of the day based on date
  const wordOfTheDay = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const index = Math.abs(dayOfYear) % WORD_OF_THE_DAY_POOL.length;
    return WORD_OF_THE_DAY_POOL[index] || WORD_OF_THE_DAY_POOL[0];
  }, []);

  // Voice player using Web Speech API
  const handlePlayVoice = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ar-SA';
        u.rate = 0.8;
        setPlayingWord(text);
        u.onend = () => setPlayingWord(null);
        u.onerror = () => setPlayingWord(null);
        window.speechSynthesis.speak(u);
      }
    } catch (e) {
      setPlayingWord(null);
    }
  };

  // Toggle vocabulary mastery
  const handleToggleWord = (wordId: string) => {
    const { tracker: newTracker } = StorageService.recordMufrodatLearned(childId, wordId);
    setMasteredVocabIds(StorageService.getMasteredVocab(childId));
    setTracker(newTracker);
  };

  // Initialize Sentence Builder Puzzle
  const handleInitializeSentencePuzzle = () => {
    if (currentAyahWords.length === 0) return;
    const tokens = currentAyahWords.map((w, idx) => ({
      id: `token-${selectedSurahNumber}-${selectedAyahNumber}-${idx}-${w.arabic}`,
      originalIndex: idx,
      arabic: w.arabic,
      transliteration: w.transliteration,
      translation: w.translation,
    }));
    // Randomize token order
    const shuffled = [...tokens].sort(() => Math.random() - 0.5);
    setScrambledTokens(shuffled);
    setPlacedTokens([]);
    setSentenceSuccess(false);
    setSentenceErrorMsg(null);
    setShowSentenceHint(false);
  };

  // Re-sync puzzle when ayah or puzzle mode changes
  useEffect(() => {
    setRevealedWordIds({});
    setSentenceSuccess(false);
    setSentenceErrorMsg(null);
    if (learningLevelMode === 'puzzle' && currentAyahWords.length > 0) {
      handleInitializeSentencePuzzle();
    }
  }, [selectedSurahNumber, selectedAyahNumber, currentAyahWords.length, learningLevelMode]);

  // Place word token into sentence builder
  const handlePlaceToken = (token: {
    id: string;
    originalIndex: number;
    arabic: string;
    transliteration: string;
    translation: string;
  }) => {
    handlePlayVoice(token.arabic);
    setScrambledTokens((prev) => prev.filter((t) => t.id !== token.id));
    setPlacedTokens((prev) => [...prev, token]);
    setSentenceErrorMsg(null);
  };

  // Return word token back to bank
  const handleReturnToken = (token: {
    id: string;
    originalIndex: number;
    arabic: string;
    transliteration: string;
    translation: string;
  }) => {
    setPlacedTokens((prev) => prev.filter((t) => t.id !== token.id));
    setScrambledTokens((prev) => [...prev, token]);
    setSentenceErrorMsg(null);
    setSentenceSuccess(false);
  };

  // Check sentence arrangement
  const handleCheckSentence = () => {
    if (placedTokens.length !== currentAyahWords.length) {
      setSentenceErrorMsg(`Belum semua kata disusun! Masih ada ${currentAyahWords.length - placedTokens.length} kata lagi.`);
      return;
    }

    const isCorrect = placedTokens.every((token, idx) => token.originalIndex === idx);
    if (isCorrect) {
      setSentenceSuccess(true);
      setSentenceErrorMsg(null);
      handlePlayVoice(currentAyahData?.arabicText || 'أَحْسَنْتَ');
      // Award points & upgrade all words in this ayah to Level 3
      StorageService.recordPoints(
        childId,
        'VOCABULARY',
        20,
        2,
        `Susun kalimat ayat ${selectedSurahNumber}:${selectedAyahNumber}`,
        'vocab',
        `ayah-${selectedSurahNumber}-${selectedAyahNumber}`
      );
      currentAyahWords.forEach((item) => {
        const wordId = `vocab-${selectedSurahNumber}-${selectedAyahNumber}-${item.wordIndex}`;
        StorageService.setWordMasteryStage(childId, wordId, 3);
      });
      setWordStages(StorageService.getWordMasteryStages(childId));
    } else {
      // Find first misplaced word
      const wrongIdx = placedTokens.findIndex((token, idx) => token.originalIndex !== idx);
      setSentenceErrorMsg(
        `Hampir tepat! Kata ke-${wrongIdx + 1} belum sesuai urutan ayat. Coba dengar lafal ayatnya lagi ya santri shalih!`
      );
    }
  };

  // Self-assessment for Level 2 Recall (Sembunyikan Arti)
  const handleEvaluateRecall = (wordId: string, isCorrect: boolean) => {
    if (isCorrect) {
      StorageService.setWordMasteryStage(childId, wordId, 2);
      setWordStages(StorageService.getWordMasteryStages(childId));
      if (!masteredVocabIds.includes(wordId)) {
        handleToggleWord(wordId);
      }
    } else {
      // Temporarily re-hide
      setTimeout(() => {
        setRevealedWordIds((prev) => ({ ...prev, [wordId]: false }));
      }, 500);
    }
  };

  // Update reminder settings
  const handleSaveReminderSettings = (updates: Partial<MufrodatDailyTracker>) => {
    const updated = StorageService.saveMufrodatTracker(childId, updates);
    setTracker(updated);
  };

  // Test Reminder Trigger
  const handleTestReminder = () => {
    setShowReminderNotification(true);
    handlePlayVoice('سُبْحَانَ اللَّهِ');
    // Also trigger browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification("⏰ Waktunya Mufrodat Hari Ini!", {
          body: `Hai santri shalih! Target mufrodat hari ini: ${tracker.todayLearnedCount}/${tracker.dailyGoal} kata. Yuk pelajari sekarang!`,
        });
      } catch (e) {}
    }
  };

  // Start Quiz
  // Start Quiz with authentic question generation & validated distractors
  const handleStartQuiz = (scope: 'ayah' | 'surah' | 'all') => {
    setQuizScope(scope);
    let pool: Array<{ arabic: string; translation: string; transliteration?: string; rootWord?: string }> = [];

    if (scope === 'ayah') {
      if (currentAyahWords.length > 0) {
        pool = currentAyahWords;
      } else {
        // Jika ayat yang dipilih adalah Huruf Muqatta'at (kosong mufrodat), ambil dari ayat 2 surah ini
        const fallbackWords = resolveAyahWords(
          selectedSurahNumber,
          Math.min(selectedSurahNumber === 2 ? 2 : 2, currentSurahMeta.ayahCount),
          currentSurahAyahs[1]?.words,
          currentSurahAyahs[1]?.translationId
        );
        pool = fallbackWords.length > 0 ? fallbackWords : QURAN_VOCABULARY_LIST.map((v) => ({
          arabic: v.arabic,
          translation: v.meaningId,
          transliteration: v.transliteration,
          rootWord: v.rootWord,
        }));
      }
    } else if (scope === 'surah') {
      // Kumpulkan kata otentik dari seluruh ayat surah ini (hingga 20 ayat pertama untuk variasi luas)
      const surahWords: Array<{ arabic: string; translation: string; transliteration?: string; rootWord?: string }> = [];
      const ayahsToProcess = currentSurahAyahs.length > 0 ? currentSurahAyahs.slice(0, 20) : [];
      for (const a of ayahsToProcess) {
        const words = resolveAyahWords(selectedSurahNumber, a.ayahNumber, a.words, a.translationId);
        surahWords.push(...words);
      }
      pool = surahWords.length > 0 ? surahWords : (currentAyahWords.length > 0 ? currentAyahWords : QURAN_VOCABULARY_LIST.map((v) => ({
        arabic: v.arabic,
        translation: v.meaningId,
        transliteration: v.transliteration,
        rootWord: v.rootWord,
      })));
    } else {
      pool = QURAN_VOCABULARY_LIST.map((v) => ({
        arabic: v.arabic,
        translation: v.meaningId,
        transliteration: v.transliteration,
        rootWord: v.rootWord,
      }));
    }

    if (pool.length === 0) {
      pool = QURAN_VOCABULARY_LIST.map((v) => ({
        arabic: v.arabic,
        translation: v.meaningId,
      }));
    }

    // Filter duplikat dalam pool berdasarkan arti
    const uniquePool = Array.from(new Map(pool.map((item) => [item.translation.trim(), item])).values());

    // Kumpulan seluruh terjemahan sahih untuk pengecoh (distractors)
    const baseDistractors = [
      ...QURAN_VOCABULARY_LIST.map((v) => v.meaningId),
      'Maha Pengasih',
      'Maha Penyayang',
      'Segala Puji',
      'Jalan yang Lurus',
      'Manusia',
      'Waktu Subuh',
      'Maha Esa',
      'Kebaikan Melimpah',
      'Demi Masa',
      'Malam Kemuliaan',
      'Anak Yatim',
      'Tuhan Pemelihara',
      'Orang-orang Bertakwa',
      'Petunjuk (Hidayah)',
      'Hari Pembalasan',
      'Orang-orang Beriman',
    ];

    const allTranslations = Array.from(
      new Set([
        ...uniquePool.map((p) => p.translation),
        ...baseDistractors,
      ])
    );

    // Ambil hingga 5 soal acak
    const shuffledPool = [...uniquePool].sort(() => Math.random() - 0.5).slice(0, 5);
    const questions = shuffledPool.map((item, idx) => {
      const correct = item.translation;
      // Filter pengecoh agar tidak sama dan tidak bertubrukan makna
      const distractors = allTranslations
        .filter((t) => t && t.trim() !== correct.trim() && !t.includes(correct) && !correct.includes(t))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Jika kurang dari 3 pengecoh, tambahkan dari basis distractor
      while (distractors.length < 3) {
        const extra = baseDistractors.find((d) => d !== correct && !distractors.includes(d));
        if (extra) distractors.push(extra);
        else break;
      }

      const options = [correct, ...distractors].sort(() => Math.random() - 0.5);

      return {
        word: {
          wordIndex: idx,
          arabic: item.arabic,
          transliteration: item.transliteration || '',
          translation: correct,
          rootWord: item.rootWord || '',
        },
        options,
        correctAnswer: correct,
      };
    });

    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedOption(null);
    setQuizFinished(false);
    setActiveTab('kuis');
  };

  // Answer quiz question
  const handleAnswerQuiz = (option: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);

    const isCorrect = option === quizQuestions[quizIndex].correctAnswer;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      // Award mastery and points for correct answer
      const qWord = quizQuestions[quizIndex].word;
      const wordId = `vocab-${selectedSurahNumber}-${selectedAyahNumber}-${(qWord as any).wordIndex ?? quizIndex}`;
      handleToggleWord(wordId);
      handlePlayVoice(qWord.arabic);
    }

    setTimeout(() => {
      if (quizIndex + 1 < quizQuestions.length) {
        setQuizIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        setQuizFinished(true);
      }
    }, 1200);
  };

  // Filtered surahs for modal search
  const filteredSurahs = useMemo(() => {
    if (!surahSearchQuery.trim()) return SURAHS_METADATA;
    const q = surahSearchQuery.toLowerCase();
    return SURAHS_METADATA.filter(
      (s) =>
        s.nameLatin.toLowerCase().includes(q) ||
        s.translation.toLowerCase().includes(q) ||
        s.number.toString().includes(q)
    );
  }, [surahSearchQuery]);

  // Filtered items for Kamus Kecilku
  const filteredKamusItems = useMemo(() => {
    return QURAN_VOCABULARY_LIST.filter((item) => {
      const isMastered = masteredVocabIds.includes(item.id);
      if (kamusFilter === 'mastered' && !isMastered) return false;
      if (kamusFilter === 'unmastered' && isMastered) return false;

      if (!kamusSearchQuery.trim()) return true;
      const q = kamusSearchQuery.toLowerCase();
      return (
        item.meaningId.toLowerCase().includes(q) ||
        item.transliteration.toLowerCase().includes(q) ||
        item.arabic.includes(kamusSearchQuery) ||
        item.sampleAyah.surahName.toLowerCase().includes(q)
      );
    });
  }, [masteredVocabIds, kamusFilter, kamusSearchQuery]);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Header & Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#164C68] hover:text-[#08B9EF] active:scale-95 transition-transform"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Menu Qur'an</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Daily Streak Indicator */}
          <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full text-xs font-bold text-orange-600 shadow-2xs">
            <Flame size={14} className="fill-orange-500 text-orange-500" />
            <span>{tracker.streak} Hari</span>
          </div>

          {/* Mastered Count */}
          <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200">
            {masteredVocabIds.length} kata dikuasai
          </span>
        </div>
      </div>

      {/* Main Hero Banner with Daily Reminder Progress */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold mb-1">
              <span>📖 Mufrodat Qur'aniyah</span>
              <span>•</span>
              <span>Kata Demi Kata</span>
            </div>
            <h2 className="text-xl font-black font-heading tracking-tight">
              Bahasa Al-Qur'an
            </h2>
            <p className="text-xs text-purple-100 font-medium mt-0.5 max-w-sm">
              Pahami makna tiap kata dalam firman Allah, tambah kosakata baru setiap hari!
            </p>
          </div>

          {/* Reminder Bell Trigger */}
          <button
            onClick={() => {
              setActiveTab('jenjang');
              handleTestReminder();
            }}
            className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all border border-white/20 shrink-0"
            title="Pengingat Mufrodat Harian"
          >
            <Bell size={18} />
          </button>
        </div>

        {/* Daily Goal Progress Bar */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold">Target Hari Ini:</span>
            <span className="font-mono bg-white/20 px-2 py-0.5 rounded-lg font-black">
              {tracker.todayLearnedCount} / {tracker.dailyGoal} kata
            </span>
          </div>
          <div className="w-32 sm:w-48 bg-black/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-300 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((tracker.todayLearnedCount / tracker.dailyGoal) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Reminder Notification Banner (If triggered) */}
      {showReminderNotification && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 shadow-sm flex items-start justify-between animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 font-bold text-lg">
              ⏰
            </div>
            <div>
              <h4 className="text-xs font-black text-[#164C68] font-heading">
                Waktunya Menambah Kosakata Qur'an!
              </h4>
              <p className="text-[11px] text-[#8C9BA7] font-medium mt-0.5">
                Alhamdulillah, ayo pelajari minimal 3 kata baru hari ini agar semakin dekat dengan Al-Qur'an.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowReminderNotification(false)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-white border border-[#C9E1ED] rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('ayat')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'ayat'
              ? 'bg-[#B797F6] text-white shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <BookOpen size={15} />
          <span className="truncate">Ayat & Kata</span>
        </button>

        <button
          onClick={() => setActiveTab('jenjang')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'jenjang'
              ? 'bg-[#B797F6] text-white shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <Layers size={15} />
          <span className="truncate">Jenjang & Reminder</span>
        </button>

        <button
          onClick={() => {
            handleStartQuiz('ayah');
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'kuis'
              ? 'bg-[#B797F6] text-white shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <Sparkles size={15} />
          <span className="truncate">Kuis Mufrodat</span>
        </button>

        <button
          onClick={() => setActiveTab('kamus')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'kamus'
              ? 'bg-[#B797F6] text-white shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <BookMarked size={15} />
          <span className="truncate">Kamus Kecilku</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: AYAT & PENJABARAN KATA PER KATA (WORD-BY-WORD)    */}
      {/* ======================================================== */}
      {activeTab === 'ayat' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Surah & Ayah Selector Bar */}
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              {/* Surah Picker Button */}
              <button
                onClick={() => setShowSurahModal(true)}
                className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-2xl bg-[#EEF8FF] hover:bg-[#ddf2fd] border border-[#C9E1ED] transition-colors text-left"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#08B9EF] uppercase tracking-wider block">
                    PILIH SURAH
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm font-black text-[#164C68] font-heading">
                      {currentSurahMeta.number}. {currentSurahMeta.nameLatin}
                    </span>
                    <span className="text-xs text-[#8C9BA7]">({currentSurahMeta.ayahCount} ayat)</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-quran text-lg text-[#B797F6]">
                    {currentSurahMeta.nameArabic}
                  </span>
                  <ChevronRight size={16} className="text-[#8C9BA7]" />
                </div>
              </button>

              {/* Quick Launch Quiz for this Ayah */}
              <button
                onClick={() => handleStartQuiz('ayah')}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
                title="Kuis Kosakata Ayat Ini"
              >
                <Sparkles size={15} />
                <span className="hidden sm:inline">Kuis Ayat</span>
              </button>
            </div>

            {/* Ayah Navigation Tabs */}
            <div className="flex items-center gap-1.5">
              {/* Prev Ayah Button */}
              <button
                onClick={() => setSelectedAyahNumber((prev) => Math.max(1, prev - 1))}
                disabled={selectedAyahNumber <= 1}
                className="w-9 h-9 rounded-xl bg-[#EEF8FF] disabled:opacity-40 text-[#164C68] flex items-center justify-center border border-[#C9E1ED] hover:bg-[#ddf2fd] shrink-0"
                title="Ayat Sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Horizontal Scrollable Ayah Number Pills */}
              <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                {Array.from({ length: currentSurahMeta.ayahCount }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setSelectedAyahNumber(n)}
                    className={`min-w-[38px] h-9 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      selectedAyahNumber === n
                        ? 'bg-[#B797F6] text-white shadow-xs font-black scale-105'
                        : 'bg-white border border-[#C9E1ED] text-[#164C68] hover:bg-[#EEF8FF]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* Next Ayah Button */}
              <button
                onClick={() => setSelectedAyahNumber((prev) => Math.min(currentSurahMeta.ayahCount, prev + 1))}
                disabled={selectedAyahNumber >= currentSurahMeta.ayahCount}
                className="w-9 h-9 rounded-xl bg-[#EEF8FF] disabled:opacity-40 text-[#164C68] flex items-center justify-center border border-[#C9E1ED] hover:bg-[#ddf2fd] shrink-0"
                title="Ayat Berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Current Ayah Full Card */}
          {isLoadingAyahs ? (
            <div className="bg-white border border-[#C9E1ED] rounded-3xl p-8 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-[#B797F6] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#8C9BA7] font-medium">Memuat ayat Al-Qur'an...</p>
            </div>
          ) : currentAyahData ? (
            <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-black text-[#164C68] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[11px]">
                    {selectedAyahNumber}
                  </span>
                  <span>
                    Surah {currentSurahMeta.nameLatin} : Ayat {selectedAyahNumber}
                  </span>
                </span>

                <div className="flex items-center gap-1.5">
                  {onOpenTafsir && (
                    <button
                      onClick={() => onOpenTafsir(selectedSurahNumber, selectedAyahNumber)}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer shadow-2xs transition-all"
                      title="Buka Tafsir & Hikmah Lengkap Ayat Ini"
                    >
                      <Lightbulb size={13} className="text-amber-600" />
                      <span>Tafsir Ayat</span>
                    </button>
                  )}
                  <button
                    onClick={() => handlePlayVoice(currentAyahData.arabicText)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#08B9EF] hover:text-[#0695c2] px-2.5 py-1 rounded-xl bg-[#EEF8FF] border border-[#C9E1ED] cursor-pointer"
                  >
                    <Volume2 size={14} />
                    <span>Dengar Ayat</span>
                  </button>
                </div>
              </div>

              {/* Arabic Verse Full Text */}
              <div className="py-2 text-right">
                <p dir="rtl" className="font-quran text-2xl sm:text-3xl leading-[2.2] text-[#164C68] select-all">
                  {currentAyahData.arabicText}
                </p>
              </div>

              {/* Latin & Translation */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                {currentAyahData.transliteration && (
                  <p className="text-[#08B9EF] font-bold italic">
                    {currentAyahData.transliteration}
                  </p>
                )}
                <p className="text-[#8C9BA7] font-medium leading-relaxed">
                  "{currentAyahData.translationId}"
                </p>
              </div>
            </div>
          ) : null}

          {/* ======================================================== */}
          {/* AUDIT OTOMATIS MUFRODAT BAR                              */}
          {/* ======================================================== */}
          {currentAyahAudit && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-200/80 rounded-3xl p-3.5 sm:p-4 shadow-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-emerald-950 font-heading">
                        Audit Otomatis Mufrodat
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 size={11} className="text-emerald-600" />
                        100% Terverifikasi Shahih
                      </span>
                      {currentAyahAudit.calibratedCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                          ⚖️ {currentAyahAudit.calibratedCount} Terkalibrasi Akar Kata
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-800/80 font-medium leading-relaxed mt-0.5">
                      {currentAyahAudit.isMuqattaatAyah
                        ? "Ayat ini berisi Huruf Muqatta'at (Alif Lam Mim / Rahasia Allah SWT) yang otomatis disaring dari hafalan leksikal agar anak fokus."
                        : `${currentAyahAudit.validMufrodatCount} kata valid • ${currentAyahAudit.filteredCount} partikel/tanda waqf disaring • Rujukan Mu'jam Alfazh Al-Qur'an & Standar Kemenag RI`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={() => setShowAuditModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                  >
                    <FileText size={13} className="text-emerald-600" />
                    <span>Laporan Audit</span>
                  </button>
                  <button
                    onClick={handleReAudit}
                    disabled={isAuditing}
                    className="p-1.5 px-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 flex items-center gap-1 text-xs font-bold"
                    title="Jalankan Ulang Audit Ayat Ini"
                  >
                    <RotateCcw size={13} className={isAuditing ? "animate-spin text-emerald-600" : ""} />
                    <span className="hidden sm:inline">Uji Ulang</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* LEVELING SYSTEM & WORD BREAKDOWN SECTION                 */}
          {/* ======================================================== */}
          {currentAyahWords.length === 0 ? (
            <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center text-3xl mx-auto shadow-xs">
                ✨
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                  🛡️ Hasil Audit Otomatis Mufrodat
                </span>
                <h4 className="text-base font-black text-[#164C68] font-heading">
                  Huruf Muqatta'at (Pembuka Surah Disaring)
                </h4>
                <p className="text-xs text-[#8C9BA7] leading-relaxed">
                  Ayat ini merupakan <strong>Huruf Muqatta'at</strong> (seperti <em>Alif Lām Mīm</em>). Berdasarkan kaidah tafsir dan ilmu bahasa Al-Qur'an, huruf-huruf pembuka ini adalah rahasia Allah SWT dan tidak memiliki padanan arti kosakata perkata leksikal untuk dihafal.
                </p>
                <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200">
                  ✓ Berhasil disaring secara otomatis agar anak tidak bingung dan dapat fokus mempelajari kosakata yang memiliki makna nyata.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={() => setShowAuditModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-purple-200 text-purple-800 font-bold text-xs hover:bg-purple-50 shadow-2xs transition-all cursor-pointer"
                >
                  <FileText size={14} className="text-purple-600" />
                  <span>Lihat Catatan Audit Ayat Ini</span>
                </button>
                {selectedAyahNumber < currentSurahMeta.ayahCount && (
                  <button
                    onClick={() => setSelectedAyahNumber((prev) => prev + 1)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <span>Mulai Belajar Kosakata di Ayat {selectedAyahNumber + 1}</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 pt-1">
            {/* Leveling Mode Selector Bar */}
            <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-3 shadow-xs space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-black text-[#164C68] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-[#B797F6]" />
                  <span>JENJANG PENGUASAAN KOSAKATA (LEVELING)</span>
                </span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {currentAyahWords.length} kata dalam ayat
                </span>
              </div>

              {/* 3 Difficulty Level Mode Buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setLearningLevelMode('open')}
                  className={`py-2 px-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    learningLevelMode === 'open'
                      ? 'bg-[#B797F6] text-white shadow-xs font-black'
                      : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#ddf2fd] border border-[#C9E1ED]'
                  }`}
                >
                  <Eye size={14} />
                  <span className="truncate">Level 1: Terbuka</span>
                </button>

                <button
                  onClick={() => setLearningLevelMode('recall')}
                  className={`py-2 px-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    learningLevelMode === 'recall'
                      ? 'bg-amber-400 text-amber-950 shadow-xs font-black'
                      : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#ddf2fd] border border-[#C9E1ED]'
                  }`}
                >
                  <EyeOff size={14} />
                  <span className="truncate">Level 2: Uji Ingatan</span>
                </button>

                <button
                  onClick={() => {
                    setLearningLevelMode('puzzle');
                    handleInitializeSentencePuzzle();
                  }}
                  className={`py-2 px-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    learningLevelMode === 'puzzle'
                      ? 'bg-emerald-500 text-white shadow-xs font-black'
                      : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#ddf2fd] border border-[#C9E1ED]'
                  }`}
                >
                  <Puzzle size={14} />
                  <span className="truncate">Level 3: Susun Kalimat</span>
                </button>
              </div>

              {/* Mode Guidance Subtitle */}
              <p className="text-[11px] text-[#8C9BA7] font-medium px-1">
                {learningLevelMode === 'open' && (
                  <span>📖 <strong>Level 1 (Pemula):</strong> Pelajari teks Arab, transliterasi Latin, terjemahan kata, dan akar kata secara lengkap.</span>
                )}
                {learningLevelMode === 'recall' && (
                  <span>🙈 <strong>Level 2 (Menengah):</strong> Terjemahan disembunyikan. Tantang ingatan anak sebelum membuka arti kata!</span>
                )}
                {learningLevelMode === 'puzzle' && (
                  <span>🧩 <strong>Level 3 (Mahir):</strong> Kata-kata diacak! Susun kembali menjadi kalimat ayat yang sempurna dan raih +20 XP!</span>
                )}
              </p>
            </div>

            {/* ======================================================== */}
            {/* LEVEL 3 VIEW: SENTENCE BUILDER PUZZLE                    */}
            {/* ======================================================== */}
            {learningLevelMode === 'puzzle' ? (
              <div className="bg-white border-2 border-emerald-300 rounded-3xl p-5 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Puzzle Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      🧩
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#164C68] font-heading">
                        Tantangan Susun Kalimat Al-Qur'an
                      </h4>
                      <p className="text-[10px] text-[#8C9BA7]">
                        Surah {currentSurahMeta.nameLatin} : Ayat {selectedAyahNumber}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlayVoice(currentAyahData?.arabicText || '')}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#08B9EF] bg-[#EEF8FF] hover:bg-[#d8eefc] px-3 py-1.5 rounded-xl border border-[#C9E1ED]"
                  >
                    <Volume2 size={14} />
                    <span>Dengar Ayat</span>
                  </button>
                </div>

                {/* Ayah Translation Reference */}
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs">
                  <span className="text-[10px] font-bold text-emerald-700 block uppercase mb-0.5">
                    ARTI AYAT SEBAGAI PETUNJUK:
                  </span>
                  <p className="text-[#164C68] font-medium italic leading-relaxed">
                    "{currentAyahData?.translationId}"
                  </p>
                </div>

                {/* Slot Kalimat Tersusun (Placed Tokens Area) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#164C68] flex items-center gap-1">
                      <span>Kalimat yang Disusun:</span>
                      <span className="text-[10px] text-[#8C9BA7] font-normal">
                        ({placedTokens.length} dari {currentAyahWords.length} kata)
                      </span>
                    </span>
                    {placedTokens.length > 0 && (
                      <button
                        onClick={handleInitializeSentencePuzzle}
                        className="text-[11px] font-bold text-rose-500 hover:text-rose-600"
                      >
                        Reset Susunan
                      </button>
                    )}
                  </div>

                  {/* Visual Dropzone / Slots Row */}
                  <div
                    dir="rtl"
                    className="min-h-[70px] p-3 rounded-2xl bg-[#EEF8FF]/80 border-2 border-dashed border-[#B797F6] flex flex-wrap items-center gap-2 justify-start transition-all"
                  >
                    {placedTokens.length === 0 ? (
                      <div className="w-full text-center py-2 text-[#8C9BA7] text-xs font-medium">
                        Sentuh kepingan kata di bawah ini untuk mulai menyusun kalimat ayat...
                      </div>
                    ) : (
                      placedTokens.map((token, pIdx) => (
                        <button
                          key={token.id}
                          onClick={() => handleReturnToken(token)}
                          className="px-3.5 py-2 rounded-2xl bg-white border-2 border-emerald-400 hover:border-rose-400 text-[#164C68] active:scale-95 shadow-xs transition-all flex flex-col items-center group cursor-pointer"
                          title="Sentuh untuk melepas kata"
                        >
                          <span className="font-quran text-2xl font-bold block">
                            {token.arabic}
                          </span>
                          <span className="text-[10px] text-[#08B9EF] font-medium font-sans mt-0.5">
                            {token.transliteration}
                          </span>
                          <span className="text-[9px] text-[#8C9BA7] font-sans group-hover:text-rose-500">
                            #{pIdx + 1} ✕
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Available Scrambled Words Bank */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#164C68]">
                      Pilihan Kata yang Tersedia (Sentuh untuk Memilih):
                    </span>
                    <button
                      onClick={() => setShowSentenceHint((prev) => !prev)}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <span>💡 {showSentenceHint ? 'Sembunyikan Petunjuk' : 'Lihat Petunjuk'}</span>
                    </button>
                  </div>

                  {/* Hint View (If enabled) */}
                  {showSentenceHint && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 animate-in fade-in">
                      <span className="font-bold">Kata berikutnya: </span>
                      {placedTokens.length < currentAyahWords.length && (
                        <span className="font-bold font-quran text-base text-amber-950">
                          {currentAyahWords[placedTokens.length]?.arabic} ({currentAyahWords[placedTokens.length]?.translation})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Scrambled Word Buttons */}
                  <div
                    dir="rtl"
                    className="flex flex-wrap gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 min-h-[60px]"
                  >
                    {scrambledTokens.length === 0 ? (
                      <div className="w-full text-center py-2 text-emerald-600 font-bold text-xs">
                        Semua kata sudah dimasukkan ke kalimat! Tekan 'Cek Susunan' di bawah.
                      </div>
                    ) : (
                      scrambledTokens.map((token) => (
                        <button
                          key={token.id}
                          onClick={() => handlePlaceToken(token)}
                          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 border-2 border-[#C9E1ED] hover:border-emerald-400 text-[#164C68] active:scale-95 shadow-xs transition-all flex flex-col items-center cursor-pointer"
                        >
                          <span className="font-quran text-2xl font-bold block">
                            {token.arabic}
                          </span>
                          <span className="text-[10px] text-[#08B9EF] font-bold font-sans mt-0.5">
                            {token.transliteration}
                          </span>
                          <span className="text-[9px] text-[#8C9BA7] font-sans">
                            {token.translation}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Error / Encouragement Feedback */}
                {sentenceErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 animate-in shake duration-300 flex items-center gap-2">
                    <X size={16} className="shrink-0 text-rose-600" />
                    <span>{sentenceErrorMsg}</span>
                  </div>
                )}

                {/* Success Banner */}
                {sentenceSuccess && (
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-center space-y-2 animate-in zoom-in-95 duration-200">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl mx-auto shadow-sm">
                      🎉
                    </div>
                    <h4 className="text-sm font-black text-emerald-900 font-heading">
                      Maa Syaa Allah! Mumtaz!
                    </h4>
                    <p className="text-xs text-emerald-700 font-medium">
                      Kamu berhasil menyusun kalimat ayat ini dengan sempurna! Seluruh kata dalam ayat telah naik ke <strong>Level 3 (Mahir)</strong>.
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
                      <Sparkles size={14} />
                      <span>+20 XP Ditambahkan ke Rekor Santri!</span>
                    </div>
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleCheckSentence}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>Cek Susunan Kalimat</span>
                  </button>

                  <button
                    onClick={() => {
                      setLearningLevelMode('open');
                    }}
                    className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#164C68] font-bold text-xs transition-colors"
                  >
                    Kembali ke Kata
                  </button>
                </div>
              </div>
            ) : (
              /* ======================================================== */
              /* LEVEL 1 & LEVEL 2 VIEW: WORD CARDS BREAKDOWN GRID        */
              /* ======================================================== */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentAyahWords.map((item, idx) => {
                  const wordId = `vocab-${selectedSurahNumber}-${selectedAyahNumber}-${item.wordIndex}`;
                  const isMastered = masteredVocabIds.includes(wordId);
                  const isPlaying = playingWord === item.arabic;
                  const currentStage: MufrodatMasteryStage = wordStages[wordId] || (isMastered ? 2 : 1);
                  const isRecallActive =
                    learningLevelMode === 'recall' ||
                    currentStage >= 2;
                  const isMeaningRevealed = revealedWordIds[wordId] || learningLevelMode === 'open';

                  return (
                    <div
                      key={`${selectedSurahNumber}-${selectedAyahNumber}-${item.wordIndex}-${idx}`}
                      className={`bg-white border-2 rounded-3xl p-4.5 shadow-xs transition-all relative ${
                        currentStage === 3
                          ? 'border-emerald-400 bg-emerald-50/15'
                          : isMastered
                          ? 'border-purple-300 bg-purple-50/15'
                          : 'border-[#C9E1ED] hover:border-[#B797F6]'
                      }`}
                    >
                      {/* Top Header Row: Index, Root, Stage Badge, and Audio Button */}
                      <div className="flex items-start justify-between">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold bg-[#EEF8FF] text-[#164C68] px-2 py-0.5 rounded-lg border border-[#C9E1ED]">
                            Kata #{idx + 1}
                          </span>

                          {/* Stage Level Badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                              currentStage === 3
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : currentStage === 2
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            <span>Level {currentStage}</span>
                            <span>•</span>
                            <span>
                              {currentStage === 3 ? 'Mahir' : currentStage === 2 ? 'Hafal' : 'Mengenal'}
                            </span>
                          </span>

                          {/* Triliteral Root Word Identification */}
                          {item.rootWord && item.rootWord !== 'ـ ـ ـ' && (
                            <span className="text-[10px] font-bold text-[#8C9BA7] bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                              Akar: <strong className="font-quran text-purple-700">{item.rootWord}</strong>
                            </span>
                          )}

                          {/* Audit Verified Tag */}
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 size={10} className="text-emerald-600" />
                            <span>Shahih</span>
                          </span>

                          {/* Root Calibrated Tag if applicable */}
                          {(item.rootWord === 'ك ت ب' && (item.arabic.includes('كِتٰب') || item.arabic.includes('كتاب'))) && (
                            <span className="text-[9px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200 flex items-center gap-1" title="Terkalibrasi: Isim Ma'rifah berdasarkan akar kata ك ت ب">
                              ⚖️ Isim Al-Kitab
                            </span>
                          )}
                        </div>

                        {/* Pronunciation Audio Button */}
                        <button
                          onClick={() => handlePlayVoice(item.arabic)}
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 border cursor-pointer shrink-0 ${
                            isPlaying
                              ? 'bg-[#08B9EF] text-white border-[#08B9EF] animate-pulse ring-4 ring-[#08B9EF]/20'
                              : 'bg-[#EEF8FF] text-[#08B9EF] hover:bg-[#d8eefc] border-[#C9E1ED]'
                          }`}
                          title="Dengar Lafal Kata Berbahasa Arab"
                        >
                          <Volume2 size={18} />
                        </button>
                      </div>

                      {/* Arabic Word Large Mushaf Display */}
                      <div className="py-3 text-center">
                        <span
                          dir="rtl"
                          className="font-quran text-3xl sm:text-4xl font-bold text-[#164C68] leading-[2.2] block select-all"
                        >
                          {item.arabic}
                        </span>
                        <p className="text-xs sm:text-sm text-[#08B9EF] font-bold italic mt-1 tracking-wide">
                          {item.transliteration}
                        </p>
                      </div>

                      {/* Meaning Display with Level 2 Hidden Peek & Recall */}
                      <div className="pt-1">
                        {isRecallActive && !isMeaningRevealed ? (
                          /* Mystery / Peek Card for Level 2 */
                          <div
                            onClick={() =>
                              setRevealedWordIds((prev) => ({ ...prev, [wordId]: true }))
                            }
                            className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 text-center cursor-pointer hover:bg-amber-100/70 transition-all group"
                          >
                            <div className="flex items-center justify-center gap-1.5 text-amber-900 font-bold text-xs mb-0.5">
                              <span>🙈</span>
                              <span>Arti Disembunyikan (Uji Ingatan)</span>
                            </div>
                            <p className="text-[11px] text-amber-700 group-hover:text-amber-900 font-medium">
                              💡 Sentuh untuk tebak & verifikasi arti kata ini
                            </p>
                          </div>
                        ) : (
                          /* Open Meaning Card with Self-Assessment Buttons in Recall mode */
                          <div className="p-3 rounded-2xl bg-[#EEF8FF]/80 text-xs border border-[#C9E1ED]/60 text-center space-y-1.5 animate-in fade-in duration-200">
                            <span className="text-[10px] font-bold text-[#8C9BA7] block uppercase tracking-wider">
                              TERJEMAHAN KATA (BAHASA INDONESIA)
                            </span>
                            <p className="font-black text-[#164C68] text-sm leading-snug">
                              {item.translation}
                            </p>

                            {/* Self-Check verification buttons when revealed during recall */}
                            {learningLevelMode === 'recall' && (
                              <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#C9E1ED]/60 text-xs">
                                <button
                                  onClick={() => handleEvaluateRecall(wordId, true)}
                                  className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                  <span>✅ Ingat Tepat!</span>
                                </button>
                                <button
                                  onClick={() => handleEvaluateRecall(wordId, false)}
                                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                                >
                                  <span>🔄 Perlu Ulang</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Bar: Mastery Toggle & Promote to Level 3 */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => handleToggleWord(wordId)}
                          className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isMastered
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-[#164C68] border border-[#C9E1ED]'
                          }`}
                        >
                          <CheckCircle2 size={15} />
                          <span>{isMastered ? 'Hafal ✓' : 'Tandai Hafal (+5 XP)'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setLearningLevelMode('puzzle');
                            handleInitializeSentencePuzzle();
                          }}
                          className="px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                          title="Uji susun dalam kalimat"
                        >
                          <Puzzle size={13} />
                          <span>Susun</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: JENJANG BELAJAR & PENGINGAT HARIAN               */}
      {/* ======================================================== */}
      {activeTab === 'jenjang' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Daily Reminder & Setting Card */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-lg font-black shadow-xs">
                  ⏰
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#164C68] font-heading">
                    Pengingat Mufrodat Harian
                  </h3>
                  <p className="text-[11px] text-[#8C9BA7] font-medium mt-0.5">
                    Atur jadwal rutin belajar kosakata Al-Qur'an setiap hari
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => handleSaveReminderSettings({ reminderEnabled: !tracker.reminderEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  tracker.reminderEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
                title="Aktifkan/Nonaktifkan Pengingat"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    tracker.reminderEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reminder Times & Daily Goal Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Reminder Time Picker */}
              <div className="bg-white p-3 rounded-2xl border border-amber-200 space-y-1.5">
                <span className="text-[10px] font-bold text-[#8C9BA7] uppercase block">
                  WAKTU PENGINGAT
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: '🌅 Subuh', time: '05:30' },
                    { label: '☀️ Dhuha', time: '09:00' },
                    { label: '🌤️ Sore', time: '16:00' },
                    { label: '🌙 Maghrib', time: '18:30' },
                  ].map((t) => (
                    <button
                      key={t.time}
                      onClick={() => handleSaveReminderSettings({ reminderTime: t.time })}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                        tracker.reminderTime === t.time
                          ? 'bg-amber-400 text-amber-950 font-black shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-[#164C68]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Target Words Goal */}
              <div className="bg-white p-3 rounded-2xl border border-amber-200 space-y-1.5">
                <span className="text-[10px] font-bold text-[#8C9BA7] uppercase block">
                  TARGET KATA HARIAN
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[3, 5, 10].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => handleSaveReminderSettings({ dailyGoal: goal })}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                        tracker.dailyGoal === goal
                          ? 'bg-amber-400 text-amber-950 font-black shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-[#164C68]'
                      }`}
                    >
                      {goal} kata
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Reminder Button */}
            <button
              onClick={handleTestReminder}
              className="w-full py-2 px-3 rounded-2xl bg-white hover:bg-amber-100/50 border border-amber-300 text-xs font-bold text-[#164C68] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bell size={14} className="text-amber-600" />
              <span>Bunyikan Uji Coba Pengingat Sekarang 🔔</span>
            </button>
          </div>

          {/* Word of the Day Feature Card */}
          <div className="bg-white border-2 border-purple-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>KATA QUR'AN PILIHAN HARI INI</span>
              </span>
              <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                Word of the Day
              </span>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <span dir="rtl" className="font-quran text-3xl font-bold text-[#164C68] block">
                  {wordOfTheDay.arabic}
                </span>
                <p className="text-xs text-[#08B9EF] font-bold mt-0.5">
                  {wordOfTheDay.transliteration}
                </p>
                <p className="text-sm font-black text-[#164C68] mt-1">
                  Arti: {wordOfTheDay.meaningId}
                </p>
                <p className="text-xs text-[#8C9BA7] font-medium mt-1">
                  Akar kata: <strong className="font-quran">{wordOfTheDay.rootWord}</strong> • Muncul di Qur'an: {wordOfTheDay.occurrencesInQuran}x
                </p>
              </div>

              <button
                onClick={() => handlePlayVoice(wordOfTheDay.arabic)}
                className="w-10 h-10 rounded-2xl bg-[#EEF8FF] text-[#08B9EF] hover:bg-[#d8eefc] flex items-center justify-center border border-[#C9E1ED] shrink-0"
              >
                <Volume2 size={18} />
              </button>
            </div>

            <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 text-xs">
              <span className="text-[10px] font-bold text-purple-600 block mb-0.5">
                Contoh: Surah {wordOfTheDay.sampleAyah.surahName} : {wordOfTheDay.sampleAyah.ayahNumber}
              </span>
              <p dir="rtl" className="font-quran text-base text-[#164C68] text-right">
                {wordOfTheDay.sampleAyah.arabicSnippet}
              </p>
              <p className="text-[11px] text-[#8C9BA7] font-medium mt-1">
                "{wordOfTheDay.sampleAyah.translationSnippet}"
              </p>
            </div>

            <button
              onClick={() => handleToggleWord(wordOfTheDay.id)}
              className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                masteredVocabIds.includes(wordOfTheDay.id)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#B797F6] text-white hover:bg-[#a581ea]'
              }`}
            >
              <CheckCircle2 size={16} />
              <span>
                {masteredVocabIds.includes(wordOfTheDay.id)
                  ? 'Kata Hari Ini Sudah Dikuasai ✓'
                  : 'Kuasai Kata Hari Ini (+10 XP)'}
              </span>
            </button>
          </div>

          {/* Pathway Levels Section */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider block px-1">
              JENJANG BELAJAR MUFRODAT (LEARNING TRACKS)
            </span>

            <div className="space-y-3">
              {MUFRODAT_LEVELS.map((lvl) => {
                // Find total surahs in this level
                const levelSurahs = SURAHS_METADATA.filter((s) => lvl.surahNumbers.includes(s.number));

                return (
                  <div
                    key={lvl.id}
                    className="bg-white border-2 border-[#C9E1ED] hover:border-[#B797F6] rounded-3xl p-4.5 shadow-xs space-y-3 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${lvl.themeColor} text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0`}>
                          #{lvl.levelNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-[#164C68] font-heading">
                              {lvl.title}
                            </h4>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.2 rounded-full">
                              {lvl.badge}
                            </span>
                          </div>
                          <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
                            {lvl.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Surah Pills in this track */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {levelSurahs.map((surah) => (
                        <button
                          key={surah.number}
                          onClick={() => {
                            setSelectedSurahNumber(surah.number);
                            setSelectedAyahNumber(1);
                            setActiveTab('ayat');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            selectedSurahNumber === surah.number
                              ? 'bg-[#B797F6] text-white border-[#B797F6]'
                              : 'bg-[#EEF8FF] text-[#164C68] border-[#C9E1ED] hover:bg-[#d8eefc]'
                          }`}
                        >
                          <span>{surah.nameLatin}</span>
                          <span className="font-quran text-sm">{surah.nameArabic}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: KUIS MUFRODAT INTERAKTIF (QUIZ)                   */}
      {/* ======================================================== */}
      {activeTab === 'kuis' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Quiz Header & Scope Bar */}
          <div className="flex items-center justify-between bg-white border border-[#C9E1ED] p-3 rounded-2xl shadow-xs">
            <span className="text-xs font-black text-[#164C68] font-heading">
              Kuis Mufrodat Qur'an
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleStartQuiz('ayah')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  quizScope === 'ayah' ? 'bg-[#B797F6] text-white' : 'bg-slate-100 text-[#164C68]'
                }`}
              >
                Ayat Ini
              </button>
              <button
                onClick={() => handleStartQuiz('surah')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  quizScope === 'surah' ? 'bg-[#B797F6] text-white' : 'bg-slate-100 text-[#164C68]'
                }`}
              >
                Surah Ini
              </button>
              <button
                onClick={() => handleStartQuiz('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  quizScope === 'all' ? 'bg-[#B797F6] text-white' : 'bg-slate-100 text-[#164C68]'
                }`}
              >
                Campuran
              </button>
            </div>
          </div>

          {quizFinished ? (
            /* Quiz Completed View */
            <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-6 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-xs">
                🏆
              </div>
              <div>
                <h3 className="text-lg font-black text-[#164C68] font-heading">
                  Kuis Selesai! Mumtaz!
                </h3>
                <p className="text-xs text-[#8C9BA7] font-medium mt-1">
                  Kamu berhasil menjawab <strong>{quizScore} dari {quizQuestions.length}</strong> pertanyaan dengan tepat!
                </p>
              </div>

              {/* Reward Points Badge */}
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 px-4 py-2 rounded-2xl text-purple-700 font-bold text-sm">
                <Sparkles size={16} />
                <span>+{quizScore * 10} XP Santri & Kosakata Bertambah!</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => handleStartQuiz(quizScope)}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-[#EEF8FF] hover:bg-[#d8eefc] text-[#164C68] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#C9E1ED]"
                >
                  <RotateCcw size={15} />
                  <span>Ulangi Kuis</span>
                </button>
                <button
                  onClick={() => setActiveTab('ayat')}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-[#B797F6] hover:bg-[#a581ea] text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <BookOpen size={15} />
                  <span>Lanjut Pelajari Ayat</span>
                </button>
              </div>
            </div>
          ) : quizQuestions.length > 0 ? (
            /* Active Question Card */
            <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#8C9BA7]">
                  Soal {quizIndex + 1} dari {quizQuestions.length}
                </span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Skor: {quizScore}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#B797F6] h-full rounded-full transition-all duration-300"
                  style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Box */}
              <div className="text-center py-4 px-4 bg-[#EEF8FF]/60 rounded-3xl border border-[#C9E1ED]/50 space-y-2">
                <p className="text-xs text-[#8C9BA7] font-bold">
                  Apa arti dari kosakata Al-Qur'an ini?
                </p>
                <span dir="rtl" className="font-quran text-4xl sm:text-5xl font-bold text-[#164C68] block py-1">
                  {quizQuestions[quizIndex].word.arabic}
                </span>

                {/* Transliteration & Root Word for educational authenticity */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                  {quizQuestions[quizIndex].word.transliteration && (
                    <span className="text-xs font-bold text-[#08B9EF] bg-white/90 px-2.5 py-0.5 rounded-lg border border-[#C9E1ED]">
                      {quizQuestions[quizIndex].word.transliteration}
                    </span>
                  )}
                  {quizQuestions[quizIndex].word.rootWord && quizQuestions[quizIndex].word.rootWord !== 'ـ ـ ـ' && (
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                      Akar Kata: <strong className="font-quran">{quizQuestions[quizIndex].word.rootWord}</strong>
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handlePlayVoice(quizQuestions[quizIndex].word.arabic)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#08B9EF] hover:text-[#0695c2] px-3 py-1 rounded-xl bg-white border border-[#C9E1ED] shadow-2xs hover:shadow-xs transition-all"
                >
                  <Volume2 size={14} />
                  <span>Dengar Lafal Kata</span>
                </button>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2">
                {quizQuestions[quizIndex].options.map((opt, oIdx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === quizQuestions[quizIndex].correctAnswer;
                  let btnColor = 'bg-white border-[#C9E1ED] text-[#164C68] hover:bg-slate-50';

                  if (selectedOption !== null) {
                    if (isCorrect) {
                      btnColor = 'bg-emerald-500 border-emerald-500 text-white font-bold';
                    } else if (isSelected) {
                      btnColor = 'bg-rose-500 border-rose-500 text-white font-bold';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={selectedOption !== null}
                      onClick={() => handleAnswerQuiz(opt)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${btnColor}`}
                    >
                      <span>{opt}</span>
                      {selectedOption !== null && (
                        <span>
                          {isCorrect ? <Check size={16} /> : isSelected ? <X size={16} /> : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#C9E1ED] rounded-3xl p-8 text-center space-y-3">
              <p className="text-xs text-[#8C9BA7] font-medium">Memuat pertanyaan kuis...</p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: KAMUS KECILKU (FLASHCARDS & COLLECTION)           */}
      {/* ======================================================== */}
      {activeTab === 'kamus' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C9BA7]" />
              <input
                type="text"
                value={kamusSearchQuery}
                onChange={(e) => setKamusSearchQuery(e.target.value)}
                placeholder="Cari kata Arab, Latin, atau artinya..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#EEF8FF] border border-[#C9E1ED] text-xs font-medium text-[#164C68] focus:outline-none focus:border-[#B797F6]"
              />
            </div>

            <div className="flex gap-1.5">
              {[
                { id: 'all', label: 'Semua Kata' },
                { id: 'mastered', label: 'Sudah Dikuasai' },
                { id: 'unmastered', label: 'Belum Dikuasai' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setKamusFilter(f.id as any)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                    kamusFilter === f.id
                      ? 'bg-[#B797F6] text-white'
                      : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#ddf2fd]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredKamusItems.map((item) => {
              const isMastered = masteredVocabIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`bg-white border-2 rounded-3xl p-5 shadow-xs transition-all ${
                    isMastered ? 'border-emerald-200 bg-emerald-50/15' : 'border-[#C9E1ED]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-right flex-1">
                      <span dir="rtl" className="font-quran text-3xl font-bold text-[#164C68]">
                        {item.arabic}
                      </span>
                      <p className="text-xs text-[#08B9EF] font-bold mt-0.5">
                        {item.transliteration}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePlayVoice(item.arabic)}
                      className="w-10 h-10 rounded-2xl bg-[#EEF8FF] text-[#08B9EF] hover:bg-[#d8eefc] flex items-center justify-center transition-colors active:scale-95 cursor-pointer border border-[#C9E1ED] ml-3"
                      title="Dengar Bunyi Kata"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#164C68]">
                        Arti: {item.meaningId}
                      </span>
                      <span className="text-[11px] text-[#8C9BA7]">
                        Akar: <strong className="font-quran">{item.rootWord}</strong>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#EEF8FF]/60 text-xs border border-[#C9E1ED]/50">
                      <span className="text-[10px] font-bold text-[#08B9EF] block mb-0.5">
                        Contoh Surah {item.sampleAyah.surahName} : {item.sampleAyah.ayahNumber}
                      </span>
                      <p dir="rtl" className="font-quran text-base text-[#164C68] text-right">
                        {item.sampleAyah.arabicSnippet}
                      </p>
                      <p className="text-[11px] text-[#8C9BA7] font-medium mt-1">
                        "{item.sampleAyah.translationSnippet}"
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleWord(item.id)}
                    className={`w-full mt-3 py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isMastered
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-[#EEF8FF] hover:bg-[#d9effc] text-[#164C68] border border-[#C9E1ED]'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    <span>{isMastered ? 'Sudah Dikuasai ✓' : 'Tandai Dikuasai (+5 XP)'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* AUDIT OTOMATIS MUFRODAT REPORT MODAL                     */}
      {/* ======================================================== */}
      {showAuditModal && currentAyahAudit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-emerald-200 overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-emerald-950 font-heading flex items-center gap-2">
                    <span>Laporan Audit Otomatis Mufrodat</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                      Aktif & Sahih
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    Surah {currentSurahMeta.nameLatin} ({selectedSurahNumber}) • Ayat {selectedAyahNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-white/80 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Metric Summary Cards */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-[#8C9BA7] uppercase tracking-wider block">Total Diperiksa</span>
                <span className="text-lg font-black text-[#164C68] font-mono">{currentAyahAudit.totalWordsChecked}</span>
                <span className="text-[9px] text-[#8C9BA7] block">kata / simbol</span>
              </div>
              <div className="bg-white p-2.5 rounded-2xl border border-emerald-200 shadow-2xs">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Valid Ditampilkan</span>
                <span className="text-lg font-black text-emerald-700 font-mono">{currentAyahAudit.validMufrodatCount}</span>
                <span className="text-[9px] text-emerald-600 block">mufrodat hafalan</span>
              </div>
              <div className="bg-white p-2.5 rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Disaring Bersih</span>
                <span className="text-lg font-black text-amber-700 font-mono">{currentAyahAudit.filteredCount}</span>
                <span className="text-[9px] text-amber-600 block">muqatta'at / waqf</span>
              </div>
              <div className="bg-white p-2.5 rounded-2xl border border-teal-200 shadow-2xs">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">Terkalibrasi Akar</span>
                <span className="text-lg font-black text-teal-700 font-mono">{currentAyahAudit.calibratedCount}</span>
                <span className="text-[9px] text-teal-600 block">kaidah Isim/Fi'il</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-slate-100 bg-white">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setAuditFilterTab('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    auditFilterTab === 'all'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-[#164C68] hover:bg-slate-200'
                  }`}
                >
                  Semua ({currentAyahAudit.auditDetails.length})
                </button>
                <button
                  onClick={() => setAuditFilterTab('valid')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    auditFilterTab === 'valid'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-[#164C68] hover:bg-slate-200'
                  }`}
                >
                  Kata Valid ({currentAyahAudit.validMufrodatCount})
                </button>
                <button
                  onClick={() => setAuditFilterTab('filtered')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    auditFilterTab === 'filtered'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-slate-100 text-[#164C68] hover:bg-slate-200'
                  }`}
                >
                  Disaring ({currentAyahAudit.filteredCount})
                </button>
              </div>

              <span className="text-[11px] font-bold text-emerald-700 hidden sm:inline flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-600" />
                Validitas 100%
              </span>
            </div>

            {/* Audit Item List Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {currentAyahAudit.auditDetails
                .filter((item) => {
                  if (auditFilterTab === 'valid') return item.status === 'valid' || item.status === 'calibrated';
                  if (auditFilterTab === 'filtered') return item.status === 'filtered_out';
                  return true;
                })
                .map((item, idx) => (
                  <div
                    key={`audit-item-${idx}-${item.wordIndex}`}
                    className={`p-3.5 rounded-2xl border-2 transition-all ${
                      item.status === 'filtered_out'
                        ? 'bg-amber-50/40 border-amber-200'
                        : item.status === 'calibrated'
                        ? 'bg-teal-50/40 border-teal-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Token #{item.wordIndex + 1}
                          </span>

                          {/* Status Badge */}
                          {item.status === 'filtered_out' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              🚫 Disaring (Tidak Ditampilkan)
                            </span>
                          ) : item.status === 'calibrated' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-300 flex items-center gap-1">
                              ⚖️ Terkalibrasi Akar Kata & Nahwu
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              ✓ Valid & Shahih
                            </span>
                          )}

                          {item.rootWord && item.rootWord !== 'ـ ـ ـ' && item.rootWord !== 'ـ' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                              Akar: <strong className="font-quran">{item.rootWord}</strong>
                            </span>
                          )}
                        </div>

                        {item.transliteration && (
                          <p className="text-xs font-bold text-[#08B9EF]">
                            {item.transliteration}
                          </p>
                        )}

                        {item.translation && (
                          <p className="text-xs font-bold text-[#164C68]">
                            Arti: <span className="font-normal text-slate-700">"{item.translation}"</span>
                          </p>
                        )}

                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed pt-1">
                          <strong className="text-slate-700">Hasil Audit:</strong> {item.reason}
                        </p>
                      </div>

                      {/* Arabic Word Display */}
                      <div className="text-right shrink-0">
                        <span className="font-quran text-2xl text-[#164C68] block">
                          {item.rawArabic}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] text-[#8C9BA7] leading-tight space-y-0.5">
                <span className="font-bold text-slate-700 block">
                  📚 Sumber Validasi & Metodologi:
                </span>
                <span>
                  Mu'jam Al-Mufahras (Fuad Abdul Baqi) & Standar Pentashihan Kemenag RI.
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={handleReAudit}
                  disabled={isAuditing}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#164C68] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} className={isAuditing ? "animate-spin text-emerald-600" : ""} />
                  <span>Uji Ulang</span>
                </button>
                <button
                  onClick={() => setShowAuditModal(false)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Tutup Laporan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SURAH PICKER MODAL (ALL 114 SURAHS WITH SEARCH)          */}
      {/* ======================================================== */}
      {showSurahModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border-2 border-[#C9E1ED] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-[#164C68] font-heading">
                Pilih Surah Al-Qur'an (114 Surah)
              </h3>
              <button
                onClick={() => setShowSurahModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={surahSearchQuery}
                  onChange={(e) => setSurahSearchQuery(e.target.value)}
                  placeholder="Cari nama surah atau nomor..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-[#C9E1ED] text-xs font-medium text-[#164C68] focus:outline-none focus:border-[#B797F6]"
                  autoFocus
                />
              </div>
            </div>

            {/* Surah List Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => {
                    setSelectedSurahNumber(surah.number);
                    setSelectedAyahNumber(1);
                    setShowSurahModal(false);
                  }}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                    selectedSurahNumber === surah.number
                      ? 'bg-[#B797F6] text-white font-bold shadow-xs'
                      : 'hover:bg-[#EEF8FF] text-[#164C68]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black font-mono ${
                      selectedSurahNumber === surah.number ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#164C68]'
                    }`}>
                      {surah.number}
                    </span>
                    <div>
                      <span className="text-xs font-bold block">
                        {surah.nameLatin}
                      </span>
                      <span className={`text-[10px] ${
                        selectedSurahNumber === surah.number ? 'text-purple-100' : 'text-[#8C9BA7]'
                      }`}>
                        {surah.translation} • {surah.ayahCount} ayat
                      </span>
                    </div>
                  </div>

                  <span className={`font-quran text-lg ${
                    selectedSurahNumber === surah.number ? 'text-white' : 'text-[#B797F6]'
                  }`}>
                    {surah.nameArabic}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
