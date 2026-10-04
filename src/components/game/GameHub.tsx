import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Volume2,
  Trophy,
  Mic,
  MicOff,
  AlertCircle,
  HelpCircle,
  Shuffle,
  ChevronRight,
  Music,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StorageService } from '../../services/storageService';
import { CompanionService } from '../../services/companionService';
import { getAyahAudioUrl } from '../../data/recitersData';
import { GlobalAudioManager } from '../../services/audioService';
import { Button } from '../common/Button';
import { RewardModal } from '../common/RewardModal';
import { WorldMapView } from '../companion/WorldMapView';

export type GameType =
  | 'continue_ayah'
  | 'arrange_ayah'
  | 'missing_word'
  | 'arabic_matching'
  | 'hijaiyah_sound'
  | 'audio_to_ayah'
  | 'tajwid_class'
  | 'guess_surah'
  | null;

interface GameHubProps {
  childId: string;
  initialTab?: 'map' | 'games' | 'room' | 'collection';
  onNavigateToLand?: (tab: 'tahfiz' | 'alquran', subView?: string) => void;
}

export function removeHarakat(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
}

export const GameHub: React.FC<GameHubProps> = ({ childId, initialTab, onNavigateToLand }) => {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [score, setScore] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [companionStateVersion, setCompanionStateVersion] = useState<number>(0);

  // Common Question Pointer
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // --- 1. Sambung Ayat state ---
  const [sambungSelected, setSambungSelected] = useState<number | null>(null);
  const [sambungFeedback, setSambungFeedback] = useState<'correct' | 'wrong' | null>(null);

  // --- 2. Susun Ayat state ---
  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [arrangeFeedback, setArrangeFeedback] = useState<'correct' | 'wrong' | null>(null);

  // --- 3. Kata Hilang state ---
  const [missingSelected, setMissingSelected] = useState<number | null>(null);
  const [missingFeedback, setMissingFeedback] = useState<'correct' | 'wrong' | null>(null);

  // --- 4. Cocokkan Kata & Arti state ---
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [selectedArabicIndex, setSelectedArabicIndex] = useState<number | null>(null);
  const [selectedMeaningIndex, setSelectedMeaningIndex] = useState<number | null>(null);
  const [matchingError, setMatchingError] = useState<boolean>(false);

  // --- 5. Tebak Suara Huruf state ---
  const [hijaiyahSelected, setHijaiyahSelected] = useState<number | null>(null);
  const [hijaiyahFeedback, setHijaiyahFeedback] = useState<'correct' | 'wrong' | null>(null);

  // --- 6. Harakat Hilang & Setoran Suara state ---
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTimer, setRecordingTimer] = useState<number>(0);
  const [harakatRevealed, setHarakatRevealed] = useState<boolean>(false);
  const [showCorrection, setShowCorrection] = useState<boolean>(false);
  const [harakatFeedback, setHarakatFeedback] = useState<'success' | 'correction' | null>(null);
  const recordingIntervalRef = useRef<any>(null);

  // --- 7. Klasifikasi Tajwid state ---
  const [tajwidFeedback, setTajwidFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedTajwidBucket, setSelectedTajwidBucket] = useState<string | null>(null);

  // --- 8. Detektif Surah state ---
  const [unlockedClues, setUnlockedClues] = useState<number>(1);
  const [surahGuessSelected, setSurahGuessSelected] = useState<number | null>(null);
  const [surahGuessFeedback, setSurahGuessFeedback] = useState<'correct' | 'wrong' | null>(null);

  const activeChild = StorageService.getActiveChild();
  const companion = CompanionService.getCompanionData(childId);

  // Trigger celebration pop
  const triggerPopConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#08B9EF', '#81E850', '#FFD83E', '#FF946F', '#B797F6'],
      });
    } catch (e) {}
  };

  const handleFinishGame = (bonusScore: number = 20) => {
    setScore((prev) => prev + bonusScore);
    const earnedXp = CompanionService.getGameXpReward(childId);
    const earnedStars = 5;

    StorageService.recordPoints(
      childId,
      'GAME',
      earnedXp,
      earnedStars,
      `Bermain game Qur'an: ${activeGame}`,
      'game',
      activeGame || 'game'
    );

    CompanionService.recordActivity(childId, 'game', earnedXp, earnedStars);
    setCompanionStateVersion((v) => v + 1);
    triggerPopConfetti();
    setShowCelebration(true);
  };

  // -------------------------------------------------------------
  // DATA FOR 8 GAMES
  // -------------------------------------------------------------

  // 1. Sambung Ayat items
  const continueAyahItems = [
    {
      surah: 'Al-Ikhlas',
      firstPart: 'قُلْ هُوَ اللّٰهُ',
      options: ['اَحَدٌ ۚ', 'الصَّمَدُ ۚ', 'الْفَلَقِ ۙ', 'الرَّحِيْمِ ۙ'],
      correctIndex: 0,
      fullArabic: 'قُلْ هُوَ اللّٰهُ اَحَدٌ ۚ',
      audioInfo: { surah: 112, ayah: 1 },
      meaning: 'Katakanlah (Muhammad), Dialah Allah, Yang Maha Esa.',
    },
    {
      surah: 'Al-Fatihah',
      firstPart: 'اِيَّاكَ نَعْبُدُ وَاِيَّاكَ',
      options: ['نَسْتَعِيْنُ ۗ', 'الْمُسْتَقِيْمَ ۙ', 'الرَّحِيْمِ ۙ', 'الدِّيْنِ ۗ'],
      correctIndex: 0,
      fullArabic: 'اِيَّاكَ نَعْبُدُ وَاِيَّاكَ نَسْتَعِيْنُ ۗ',
      audioInfo: { surah: 1, ayah: 5 },
      meaning: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan.',
    },
    {
      surah: 'An-Nas',
      firstPart: 'مِنْ شَرِّ الْوَسْوَاسِ',
      options: ['الْخَنَّاسِ ۙ', 'النَّاسِ ۙ', 'الْفَلَقِ ۙ', 'الْعَصْرِ ۙ'],
      correctIndex: 0,
      fullArabic: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۙ',
      audioInfo: { surah: 114, ayah: 4 },
      meaning: 'Dari kejahatan (bisikan) setan yang bersembunyi.',
    },
  ];

  // 2. Susun Ayat items
  const arrangeAyahItems = [
    {
      surah: 'Al-Fatihah Ayat 2',
      correctWords: ['اَلْحَمْدُ', 'لِلّٰهِ', 'رَبِّ', 'الْعٰلَمِيْنَ ۙ'],
      scrambledWords: ['رَبِّ', 'الْعٰلَمِيْنَ ۙ', 'اَلْحَمْدُ', 'لِلّٰهِ'],
      fullArabic: 'اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ ۙ',
      audioInfo: { surah: 1, ayah: 2 },
      meaning: 'Segala puji bagi Allah, Tuhan seluruh alam.',
    },
    {
      surah: 'Al-Kausar Ayat 1',
      correctWords: ['اِنَّآ', 'اَعْطَيْنٰكَ', 'الْكَوْثَرَ ۗ'],
      scrambledWords: ['الْكَوْثَرَ ۗ', 'اِنَّآ', 'اَعْطَيْنٰكَ'],
      fullArabic: 'اِنَّآ اَعْطَيْنٰكَ الْكَوْثَرَ ۗ',
      audioInfo: { surah: 108, ayah: 1 },
      meaning: 'Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak.',
    },
  ];

  // 3. Kata Hilang items
  const missingWordItems = [
    {
      surah: 'Al-Ikhlas Ayat 2',
      prompt: 'اَللّٰهُ [ ... ]',
      missingWord: 'الصَّمَدُ ۚ',
      options: ['الصَّمَدُ ۚ', 'الْاَحَدُ ۚ', 'الرَّحْمٰنُ ۚ', 'الْعَلِيْمُ ۚ'],
      correctIndex: 0,
      fullArabic: 'اَللّٰهُ الصَّمَدُ ۚ',
      audioInfo: { surah: 112, ayah: 2 },
      hint: 'Artinya: Allah tempat meminta segala sesuatu.',
    },
    {
      surah: 'Quraisy Ayat 3',
      prompt: 'فَلْيَعْبُدُوْا رَبَّ هٰذَا [ ... ]',
      missingWord: 'الْبَيْتِ ۙ',
      options: ['الْبَيْتِ ۙ', 'الْبَلَدِ ۙ', 'الْقَوْمِ ۙ', 'النَّاسِ ۙ'],
      correctIndex: 0,
      fullArabic: 'فَلْيَعْبُدُوْا رَبَّ هٰذَا الْبَيْتِ ۙ',
      audioInfo: { surah: 106, ayah: 3 },
      hint: 'Artinya: Maka hendaklah mereka menyembah Tuhan (pemilik) rumah ini (Ka‘bah).',
    },
  ];

  // 4. Cocokkan Kata & Arti items (Interactive 2-column matching)
  const matchingPairs = [
    { id: 0, arabic: 'رَبِّ', meaning: 'Tuhan Pemelihara', translit: 'Rabbi' },
    { id: 1, arabic: 'الصِّرَاطَ', meaning: 'Jalan yang Lurus', translit: 'Ash-Shiraath' },
    { id: 2, arabic: 'الْفَلَقِ', meaning: 'Waktu Subuh / Fajar', translit: 'Al-Falaq' },
    { id: 3, arabic: 'النَّاسِ', meaning: 'Manusia', translit: 'An-Naas' },
  ];

  // 5. Tebak Suara Huruf items (Hijaiyah Sound)
  const hijaiyahSoundItems = [
    {
      audioUrl: 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/114001.mp3', // Audio prompt
      letterName: 'Ba (ب)',
      makhrajHint: 'Bibir tertutup rapat lalu dibuka ringan.',
      soundPrompt: 'Dengarkan suara huruf: "Ba"',
      options: [
        { letter: 'ب', name: 'Ba', correct: true },
        { letter: 'ت', name: 'Ta', correct: false },
        { letter: 'ث', name: 'Tsa', correct: false },
        { letter: 'ن', name: 'Nun', correct: false },
      ],
    },
    {
      audioUrl: 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/113001.mp3',
      letterName: 'Jim (ج)',
      makhrajHint: 'Tengah lidah menyentuh langit-langit mulut.',
      soundPrompt: 'Dengarkan suara huruf: "Ja"',
      options: [
        { letter: 'ج', name: 'Jim', correct: true },
        { letter: 'ح', name: 'Ha', correct: false },
        { letter: 'خ', name: 'Kha', correct: false },
        { letter: 'د', name: 'Dal', correct: false },
      ],
    },
  ];

  // 6. Harakat Hilang & Setoran Suara items
  const harakatVoiceItems = [
    {
      surahName: 'Al-Ikhlas Ayat 1',
      fullArabic: 'قُلْ هُوَ اللّٰهُ اَحَدٌ ۚ',
      transliteration: 'Qul huwallāhu aḥad',
      meaning: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa."',
      audioInfo: { surah: 112, ayah: 1 },
      keyRules: ['Qul: Dammah di Qaf & Sukun di Lam', 'Huwal-laah: Fathah di Wawu', 'Ahad: Fathah & Tanwin'],
    },
    {
      surahName: 'Al-Falaq Ayat 1',
      fullArabic: 'قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِ ۙ',
      transliteration: 'Qul a‘ūżu birabbil-falaq',
      meaning: 'Katakanlah, "Aku berlindung kepada Tuhan yang menguasai subuh (fajar)."',
      audioInfo: { surah: 113, ayah: 1 },
      keyRules: ['A‘uudzu: Fathah di Hamzah, Dammah Mad di ‘Ain', 'Bi-rabbi: Kasrah di Ba & Tasydid Kasrah di Ra'],
    },
    {
      surahName: 'An-Nas Ayat 1',
      fullArabic: 'قُلْ اَعُوْذُ بِرَبِّ النَّاسِ ۙ',
      transliteration: 'Qul a‘ūżu birabbin-nās',
      meaning: 'Katakanlah, "Aku berlindung kepada Tuhannya manusia."',
      audioInfo: { surah: 114, ayah: 1 },
      keyRules: ['Bin-naas: Idgham Syamsiyah & Ghunnah di Nun bertasydid'],
    },
  ];

  // 7. Klasifikasi Tajwid items (Basket Sorter)
  const tajwidBasketItems = [
    {
      arabicText: 'مِنْ شَرِّ',
      question: 'Manakah hukum bacaan Nun Sukun pada ayat di atas?',
      buckets: [
        { id: 'ikhfa', label: 'Ikhfa Haqiqi (Samar & Dengung)', isCorrect: true },
        { id: 'izhar', label: 'Izhar Halqi (Jelas Tanpa Dengung)', isCorrect: false },
      ],
      explanation: 'Nun sukun bertemu huruf Syin (ش) dibaca samar dengan dengung 2 harakat (Ikhfa Haqiqi).',
    },
    {
      arabicText: 'مَنْ اٰمَنَ',
      question: 'Manakah hukum bacaan Nun Sukun pada ayat di atas?',
      buckets: [
        { id: 'ikhfa', label: 'Ikhfa Haqiqi (Samar)', isCorrect: false },
        { id: 'izhar', label: 'Izhar Halqi (Jelas & Terang)', isCorrect: true },
      ],
      explanation: 'Nun sukun bertemu huruf Alif/Hamzah (ء) dibaca jelas dan tegas tanpa dengung (Izhar Halqi).',
    },
    {
      arabicText: 'مِنْ بَعْدِ',
      question: 'Manakah hukum bacaan Nun Sukun pada kata di atas?',
      buckets: [
        { id: 'iqlab', label: 'Iqlab (Berubah Jadi Mim)', isCorrect: true },
        { id: 'idgham', label: 'Idgham Bighunnah', isCorrect: false },
      ],
      explanation: 'Nun sukun bertemu huruf Ba (ب) dibaca Iqlab, suaranya berubah menjadi bunyi Mim samar disertai dengung.',
    },
  ];

  // 8. Detektif Surah items (Clue Guessing)
  const detectiveSurahItems = [
    {
      clue1: 'Surah ini terdiri dari 5 ayat dan tergolong Makkiyah.',
      clue2: 'Menceritakan kehancuran tentara bergajah yang dipimpin Raja Abrahah.',
      clue3: 'Ayat pertama diawali dengan: "اَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ..."',
      options: ['Al-Fil (Gajah)', 'Quraisy', 'Al-Kafirun', 'Al-Maun'],
      correctIndex: 0,
      surahName: 'Al-Fil',
      audioInfo: { surah: 105, ayah: 1 },
    },
    {
      clue1: 'Surah ini memiliki 3 ayat dan merupakan surah terpendek dalam Al-Qur\'an.',
      clue2: 'Menyebutkan telaga nikmat yang melimpah dan perintah shalat serta berkurban.',
      clue3: 'Ayat pertama berbunyi: "اِنَّآ اَعْطَيْنٰكَ الْكَوْثَرَ ۗ"',
      options: ['Al-Kausar', 'An-Nasr', 'Al-Ikhlas', 'Al-Asr'],
      correctIndex: 0,
      surahName: 'Al-Kausar',
      audioInfo: { surah: 108, ayah: 1 },
    },
  ];

  // Start selected game
  const handleStartGame = (gameId: GameType) => {
    setActiveGame(gameId);
    setCurrentQuestionIndex(0);
    setScore(0);

    // Reset sub-states
    setSambungSelected(null);
    setSambungFeedback(null);
    setMissingSelected(null);
    setMissingFeedback(null);
    setMatchedPairs(new Set());
    setSelectedArabicIndex(null);
    setSelectedMeaningIndex(null);
    setMatchingError(false);
    setHijaiyahSelected(null);
    setHijaiyahFeedback(null);
    setHarakatRevealed(false);
    setShowCorrection(false);
    setHarakatFeedback(null);
    setIsRecording(false);
    setTajwidFeedback(null);
    setSelectedTajwidBucket(null);
    setUnlockedClues(1);
    setSurahGuessSelected(null);
    setSurahGuessFeedback(null);

    // Init Susun Ayat
    if (gameId === 'arrange_ayah') {
      const item = arrangeAyahItems[0];
      setPlacedWords([]);
      setAvailableWords([...item.scrambledWords]);
      setArrangeFeedback(null);
    }
  };

  const playQariAudio = (surah: number, ayah: number) => {
    const url = getAyahAudioUrl('alafasy', surah, ayah);
    const audio = new Audio(url);
    GlobalAudioManager.registerRawAudio(audio);
    GlobalAudioManager.notifyPlayStarted(audio);
    audio.play().catch(() => {});
    audio.onended = () => {
      GlobalAudioManager.unregisterRawAudio(audio);
    };
  };

  // -------------------------------------------------------------
  // HANDLERS FOR EACH GAME
  // -------------------------------------------------------------

  // 1. Sambung Ayat Handler
  const handleSelectSambung = (idx: number, item: any) => {
    if (sambungFeedback) return;
    setSambungSelected(idx);
    if (idx === item.correctIndex) {
      setSambungFeedback('correct');
      setScore((s) => s + 15);
      triggerPopConfetti();
      playQariAudio(item.audioInfo.surah, item.audioInfo.ayah);
    } else {
      setSambungFeedback('wrong');
    }
  };

  // 2. Susun Ayat Handlers
  const handleAddWordToSlot = (word: string, index: number) => {
    if (arrangeFeedback === 'correct') return;
    setPlacedWords((prev) => [...prev, word]);
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
    setArrangeFeedback(null);
  };

  const handleRemoveWordFromSlot = (word: string, index: number) => {
    if (arrangeFeedback === 'correct') return;
    setPlacedWords((prev) => prev.filter((_, i) => i !== index));
    setAvailableWords((prev) => [...prev, word]);
    setArrangeFeedback(null);
  };

  const handleCheckArrangement = (item: any) => {
    const isCorrect = placedWords.join(' ') === item.correctWords.join(' ');
    if (isCorrect) {
      setArrangeFeedback('correct');
      setScore((s) => s + 20);
      triggerPopConfetti();
      playQariAudio(item.audioInfo.surah, item.audioInfo.ayah);
    } else {
      setArrangeFeedback('wrong');
    }
  };

  // 3. Kata Hilang Handler
  const handleSelectMissing = (idx: number, item: any) => {
    if (missingFeedback) return;
    setMissingSelected(idx);
    if (idx === item.correctIndex) {
      setMissingFeedback('correct');
      setScore((s) => s + 15);
      triggerPopConfetti();
      playQariAudio(item.audioInfo.surah, item.audioInfo.ayah);
    } else {
      setMissingFeedback('wrong');
    }
  };

  // 4. Cocokkan Kata Handlers
  const handleSelectArabicMatch = (idx: number) => {
    if (matchedPairs.has(idx)) return;
    setSelectedArabicIndex(idx);
    setMatchingError(false);

    // If meaning is already selected, verify pair
    if (selectedMeaningIndex !== null) {
      if (idx === selectedMeaningIndex) {
        setMatchedPairs((prev) => new Set([...prev, idx]));
        setScore((s) => s + 10);
        setSelectedArabicIndex(null);
        setSelectedMeaningIndex(null);
        triggerPopConfetti();
        if (matchedPairs.size + 1 === matchingPairs.length) {
          setTimeout(() => handleFinishGame(25), 800);
        }
      } else {
        setMatchingError(true);
        setTimeout(() => {
          setSelectedArabicIndex(null);
          setSelectedMeaningIndex(null);
          setMatchingError(false);
        }, 800);
      }
    }
  };

  const handleSelectMeaningMatch = (idx: number) => {
    if (matchedPairs.has(idx)) return;
    setSelectedMeaningIndex(idx);
    setMatchingError(false);

    if (selectedArabicIndex !== null) {
      if (selectedArabicIndex === idx) {
        setMatchedPairs((prev) => new Set([...prev, idx]));
        setScore((s) => s + 10);
        setSelectedArabicIndex(null);
        setSelectedMeaningIndex(null);
        triggerPopConfetti();
        if (matchedPairs.size + 1 === matchingPairs.length) {
          setTimeout(() => handleFinishGame(25), 800);
        }
      } else {
        setMatchingError(true);
        setTimeout(() => {
          setSelectedArabicIndex(null);
          setSelectedMeaningIndex(null);
          setMatchingError(false);
        }, 800);
      }
    }
  };

  // 5. Tebak Suara Huruf Handler
  const handleSelectHijaiyah = (idx: number, item: any) => {
    if (hijaiyahFeedback) return;
    setHijaiyahSelected(idx);
    if (item.options[idx].correct) {
      setHijaiyahFeedback('correct');
      setScore((s) => s + 15);
      triggerPopConfetti();
    } else {
      setHijaiyahFeedback('wrong');
    }
  };

  // 6. Harakat Hilang & Setoran Suara Handlers
  const handleToggleVoiceRecord = (item: any) => {
    if (!isRecording) {
      // Start recording simulation
      setIsRecording(true);
      setRecordingTimer(0);
      setHarakatFeedback(null);
      setShowCorrection(false);
      setHarakatRevealed(false);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTimer((prev) => prev + 1);
      }, 1000);
    } else {
      // Stop recording
      setIsRecording(false);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);

      // Child spoke: trigger vibrant harakat pop animation!
      setHarakatRevealed(true);
      setHarakatFeedback('success');
      setScore((s) => s + 25);
      triggerPopConfetti();

      // Play audio confirmation
      playQariAudio(item.audioInfo.surah, item.audioInfo.ayah);
    }
  };

  // 7. Klasifikasi Tajwid Handler
  const handleSelectTajwidBucket = (bucketId: string, item: any) => {
    if (tajwidFeedback) return;
    setSelectedTajwidBucket(bucketId);
    const chosen = item.buckets.find((b: any) => b.id === bucketId);
    if (chosen?.isCorrect) {
      setTajwidFeedback('correct');
      setScore((s) => s + 15);
      triggerPopConfetti();
    } else {
      setTajwidFeedback('wrong');
    }
  };

  // 8. Detektif Surah Handler
  const handleSelectSurahGuess = (idx: number, item: any) => {
    if (surahGuessFeedback) return;
    setSurahGuessSelected(idx);
    if (idx === item.correctIndex) {
      setSurahGuessFeedback('correct');
      const bonus = unlockedClues === 1 ? 25 : unlockedClues === 2 ? 15 : 10;
      setScore((s) => s + bonus);
      triggerPopConfetti();
      playQariAudio(item.audioInfo.surah, item.audioInfo.ayah);
    } else {
      setSurahGuessFeedback('wrong');
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  // -------------------------------------------------------------
  // RENDER INTERACTIVE ARENA FOR ACTIVE GAME
  // -------------------------------------------------------------
  if (activeGame) {
    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveGame(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#164C68] hover:text-[#08B9EF] bg-white border border-[#C9E1ED] px-3 py-1.5 rounded-2xl shadow-xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Pilih Game Lain</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-yellow-50 border border-yellow-200 text-amber-800 font-black text-xs shadow-xs">
            <Star size={14} className="fill-yellow-400 text-yellow-500" />
            <span>Skor: {score}</span>
          </div>
        </div>

        {/* 1. SAMBUNG AYAT (Verse Connector) */}
        {activeGame === 'continue_ayah' && (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>🔗</span> Sambung Ayat
              </span>
              <span>Soal {currentQuestionIndex + 1} dari {continueAyahItems.length}</span>
            </div>

            <h3 className="text-base font-extrabold text-[#164C68] font-heading">
              Pilih potongan ayat untuk menyambung surah {continueAyahItems[currentQuestionIndex].surah}:
            </h3>

            {/* Starting Ayah Card */}
            <div className="bg-gradient-to-r from-sky-50 to-cyan-50 border-2 border-[#08B9EF]/40 rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-[#08B9EF] uppercase tracking-wider block mb-1">
                Potongan Awal
              </span>
              <p dir="rtl" className="font-quran text-3xl text-[#164C68] font-bold leading-relaxed">
                {continueAyahItems[currentQuestionIndex].firstPart} ...
              </p>
            </div>

            {/* Continuation Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {continueAyahItems[currentQuestionIndex].options.map((opt, idx) => {
                const isSelected = sambungSelected === idx;
                const isCorrect = idx === continueAyahItems[currentQuestionIndex].correctIndex;

                let cardStyle = 'bg-white border-[#C9E1ED] hover:border-[#08B9EF] text-[#164C68]';
                if (sambungFeedback && isSelected) {
                  cardStyle = isCorrect
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300'
                    : 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-300';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectSambung(idx, continueAyahItems[currentQuestionIndex])}
                    disabled={sambungFeedback !== null}
                    className={`p-4 rounded-2xl border-2 text-right transition-all cursor-pointer shadow-xs ${cardStyle}`}
                  >
                    <p dir="rtl" className="font-quran text-2xl font-bold">
                      ... {opt}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next */}
            {sambungFeedback && (
              <div className="space-y-3 animate-in fade-in pt-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                    sambungFeedback === 'correct'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  <p className="font-bold mb-1">
                    {sambungFeedback === 'correct' ? '✨ Masya Allah, Sambungan Tepat!' : '❌ Belum tepat.'}
                  </p>
                  <p dir="rtl" className="font-quran text-lg my-1">
                    {continueAyahItems[currentQuestionIndex].fullArabic}
                  </p>
                  <p className="text-[11px] text-[#8C9BA7]">
                    "{continueAyahItems[currentQuestionIndex].meaning}"
                  </p>
                </div>

                <Button
                  variant="green"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    if (currentQuestionIndex < continueAyahItems.length - 1) {
                      setCurrentQuestionIndex((prev) => prev + 1);
                      setSambungSelected(null);
                      setSambungFeedback(null);
                    } else {
                      handleFinishGame(20);
                    }
                  }}
                  icon={<CheckCircle2 size={18} />}
                >
                  {currentQuestionIndex < continueAyahItems.length - 1 ? 'Soal Berikutnya' : 'Selesai & Lihat Skor'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 2. SUSUN AYAT (Interactive Puzzle Arrange) */}
        {activeGame === 'arrange_ayah' && (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>🧩</span> Susun Kata Menjadi Ayat
              </span>
              <span>{arrangeAyahItems[currentQuestionIndex].surah}</span>
            </div>

            <h3 className="text-base font-extrabold text-[#164C68] font-heading">
              Ketuk kata-kata di bawah untuk menyusun urutan ayat yang benar:
            </h3>

            {/* Placed Word Target Slots */}
            <div className="min-h-[90px] p-4 bg-[#EEF8FF] border-2 border-dashed border-[#08B9EF] rounded-3xl flex flex-wrap items-center justify-center gap-2" dir="rtl">
              {placedWords.length === 0 ? (
                <span className="text-xs text-[#8C9BA7] font-semibold italic select-none">
                  (Ketuk kata di bawah untuk memasukkan ke sini)
                </span>
              ) : (
                placedWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRemoveWordFromSlot(word, idx)}
                    className="px-3.5 py-2 rounded-2xl bg-white border-2 border-[#08B9EF] text-[#164C68] font-quran text-2xl font-bold shadow-xs hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer animate-in zoom-in-75"
                    title="Ketuk untuk membatalkan"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Available Word Bank */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-3xl space-y-2">
              <span className="text-[10px] font-bold text-[#8C9BA7] uppercase tracking-wider block">
                Pilihan Kata:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2" dir="rtl">
                {availableWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddWordToSlot(word, idx)}
                    className="px-4 py-2.5 rounded-2xl bg-white border-2 border-[#C9E1ED] hover:border-[#08B9EF] text-[#164C68] font-quran text-2xl font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Check Button */}
            {placedWords.length > 0 && arrangeFeedback !== 'correct' && (
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => handleCheckArrangement(arrangeAyahItems[currentQuestionIndex])}
                icon={<CheckCircle2 size={16} />}
              >
                Periksa Urutan Ayat
              </Button>
            )}

            {/* Feedback */}
            {arrangeFeedback && (
              <div className="space-y-3 animate-in fade-in pt-1">
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                    arrangeFeedback === 'correct'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  <p className="font-bold mb-1">
                    {arrangeFeedback === 'correct' ? '🎉 Hebat Sekali! Susunan Ayatmu Benar!' : '⚠️ Urutan belum sesuai, coba tukar posisi katanya.'}
                  </p>
                  <p className="text-[11px] text-[#8C9BA7]">
                    "{arrangeAyahItems[currentQuestionIndex].meaning}"
                  </p>
                </div>

                {arrangeFeedback === 'correct' && (
                  <Button
                    variant="green"
                    size="lg"
                    fullWidth
                    onClick={() => {
                      if (currentQuestionIndex < arrangeAyahItems.length - 1) {
                        const nextIdx = currentQuestionIndex + 1;
                        setCurrentQuestionIndex(nextIdx);
                        const nextItem = arrangeAyahItems[nextIdx];
                        setPlacedWords([]);
                        setAvailableWords([...nextItem.scrambledWords]);
                        setArrangeFeedback(null);
                      } else {
                        handleFinishGame(25);
                      }
                    }}
                  >
                    {currentQuestionIndex < arrangeAyahItems.length - 1 ? 'Soal Susun Berikutnya' : 'Selesai & Buka Hadiah'}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. KATA YANG HILANG (Missing Word Detective) */}
        {activeGame === 'missing_word' && (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>🔍</span> Kata yang Hilang
              </span>
              <span>{missingWordItems[currentQuestionIndex].surah}</span>
            </div>

            <h3 className="text-base font-extrabold text-[#164C68] font-heading">
              Isi kata yang hilang pada ayat berikut:
            </h3>

            {/* Prompt with gap */}
            <div className="bg-amber-50/60 border-2 border-amber-300 rounded-3xl p-5 shadow-xs">
              <p dir="rtl" className="font-quran text-3xl text-[#164C68] font-bold leading-relaxed">
                {missingWordItems[currentQuestionIndex].prompt}
              </p>
              <p className="text-xs text-amber-800 font-semibold mt-2">
                💡 {missingWordItems[currentQuestionIndex].hint}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {missingWordItems[currentQuestionIndex].options.map((opt, idx) => {
                const isSelected = missingSelected === idx;
                const isCorrect = idx === missingWordItems[currentQuestionIndex].correctIndex;

                let style = 'bg-white border-[#C9E1ED] hover:border-[#08B9EF] text-[#164C68]';
                if (missingFeedback && isSelected) {
                  style = isCorrect
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300'
                    : 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-300';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectMissing(idx, missingWordItems[currentQuestionIndex])}
                    disabled={missingFeedback !== null}
                    className={`p-3.5 rounded-2xl border-2 font-quran text-2xl font-bold transition-all shadow-xs cursor-pointer ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {missingFeedback && (
              <div className="space-y-3 animate-in fade-in pt-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                    missingFeedback === 'correct'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  <p className="font-bold">
                    {missingFeedback === 'correct' ? '🌟 Masya Allah, Tepat Sekali!' : 'Belum tepat.'}
                  </p>
                  <p dir="rtl" className="font-quran text-xl my-1">
                    {missingWordItems[currentQuestionIndex].fullArabic}
                  </p>
                </div>

                <Button
                  variant="green"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    if (currentQuestionIndex < missingWordItems.length - 1) {
                      setCurrentQuestionIndex((prev) => prev + 1);
                      setMissingSelected(null);
                      setMissingFeedback(null);
                    } else {
                      handleFinishGame(20);
                    }
                  }}
                >
                  {currentQuestionIndex < missingWordItems.length - 1 ? 'Soal Berikutnya' : 'Selesai Permainan'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 4. COCOKKAN KATA & ARTI (2-Column Memory Matcher) */}
        {activeGame === 'arabic_matching' && (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>🎯</span> Cocokkan Kata Arab & Artinya
              </span>
              <span>
                {matchedPairs.size} dari {matchingPairs.length} Terpasang
              </span>
            </div>

            <p className="text-xs text-[#8C9BA7] font-semibold text-center">
              Ketuk satu kata Arab di kolom kiri, lalu ketuk arti Indonesianya di kolom kanan!
            </p>

            {matchingError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold text-center animate-in shake">
                Pasangan belum cocok, coba lagi ya!
              </div>
            )}

            {/* 2-Column Matching Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Left Column: Arabic */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#8C9BA7] uppercase tracking-wider block text-center">
                  Kata Arab
                </span>
                {matchingPairs.map((p) => {
                  const isMatched = matchedPairs.has(p.id);
                  const isSelected = selectedArabicIndex === p.id;

                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectArabicMatch(p.id)}
                      disabled={isMatched}
                      className={`w-full p-3 rounded-2xl border-2 text-center transition-all cursor-pointer shadow-xs select-none ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60'
                          : isSelected
                          ? 'bg-cyan-50 border-[#08B9EF] ring-2 ring-cyan-200'
                          : 'bg-white border-[#C9E1ED] hover:border-[#08B9EF]'
                      }`}
                    >
                      <span className="font-quran text-2xl font-bold text-[#164C68] block">
                        {p.arabic}
                      </span>
                      <span className="text-[10px] text-[#08B9EF] font-bold">
                        ({p.translit})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Indonesian Meaning */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#8C9BA7] uppercase tracking-wider block text-center">
                  Arti Bahasa
                </span>
                {matchingPairs.map((p) => {
                  const isMatched = matchedPairs.has(p.id);
                  const isSelected = selectedMeaningIndex === p.id;

                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectMeaningMatch(p.id)}
                      disabled={isMatched}
                      className={`w-full p-3 rounded-2xl border-2 text-center transition-all cursor-pointer shadow-xs select-none min-h-[64px] flex items-center justify-center ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60'
                          : isSelected
                          ? 'bg-cyan-50 border-[#08B9EF] ring-2 ring-cyan-200'
                          : 'bg-white border-[#C9E1ED] hover:border-[#08B9EF]'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#164C68]">
                        {p.meaning}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5. TEBAK SUARA HURUF (Hijaiyah Phonics Lab) */}
        {activeGame === 'hijaiyah_sound' && (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>🎧</span> Tebak Suara Huruf
              </span>
              <span>Soal {currentQuestionIndex + 1} dari {hijaiyahSoundItems.length}</span>
            </div>

            <h3 className="text-base font-extrabold text-[#164C68] font-heading">
              Dengarkan lantunan makhraj lalu pilih huruf hijaiyah yang benar:
            </h3>

            {/* Audio Listening Center */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center space-y-2">
              <button
                onClick={() => {
                  const audio = new Audio(hijaiyahSoundItems[currentQuestionIndex].audioUrl);
                  audio.play().catch(() => {});
                }}
                className="w-16 h-16 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Putar Suara Huruf"
              >
                <Volume2 size={32} />
              </button>
              <p className="text-xs font-bold text-amber-900">
                {hijaiyahSoundItems[currentQuestionIndex].soundPrompt}
              </p>
              <p className="text-[11px] text-amber-700">
                Petunjuk Makhraj: {hijaiyahSoundItems[currentQuestionIndex].makhrajHint}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {hijaiyahSoundItems[currentQuestionIndex].options.map((opt, idx) => {
                const isSelected = hijaiyahSelected === idx;
                const isCorrect = opt.correct;

                let style = 'bg-white border-[#C9E1ED] hover:border-amber-400 text-[#164C68]';
                if (hijaiyahFeedback && isSelected) {
                  style = isCorrect
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300'
                    : 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-300';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectHijaiyah(idx, hijaiyahSoundItems[currentQuestionIndex])}
                    disabled={hijaiyahFeedback !== null}
                    className={`p-4 rounded-2xl border-2 text-center transition-all shadow-xs cursor-pointer ${style}`}
                  >
                    <span className="font-quran text-4xl font-bold block mb-1">
                      {opt.letter}
                    </span>
                    <span className="text-xs font-bold text-[#8C9BA7]">
                      {opt.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {hijaiyahFeedback && (
              <div className="space-y-3 animate-in fade-in pt-2">
                <Button
                  variant="green"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    if (currentQuestionIndex < hijaiyahSoundItems.length - 1) {
                      setCurrentQuestionIndex((prev) => prev + 1);
                      setHijaiyahSelected(null);
                      setHijaiyahFeedback(null);
                    } else {
                      handleFinishGame(20);
                    }
                  }}
                >
                  {currentQuestionIndex < hijaiyahSoundItems.length - 1 ? 'Soal Huruf Berikutnya' : 'Selesai & Buka Bintang'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 6. HARAKAT HILANG & SETORAN SUARA (Exact User Request) */}
        {activeGame === 'audio_to_ayah' && (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>🎙️</span> Tantangan Harakat Hilang (Setoran Suara)
              </span>
              <span>Soal {currentQuestionIndex + 1} dari {harakatVoiceItems.length}</span>
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-200 rounded-3xl p-4 text-xs text-rose-900 leading-relaxed">
              <strong>Tantangan Anak Hebat:</strong> Harakat pada ayat ini telah disembunyikan!
              Tekan tombol mikrofon, lafalkan ayatnya dengan lantang. Jika betul, harakat akan langsung muncul dengan animasi pop!
            </div>

            {/* Ayah Card (Gundul vs Harakat Revealed) */}
            <div className="bg-[#EEF8FF] border-2 border-[#08B9EF]/40 rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all duration-300">
              <span className="text-[10px] font-bold text-[#08B9EF] uppercase tracking-wider block mb-2">
                {harakatVoiceItems[currentQuestionIndex].surahName}
              </span>

              {/* Dynamic Text: Gundul if not revealed, Full with pop if revealed */}
              <p
                dir="rtl"
                className={`font-quran text-3xl sm:text-4xl text-[#164C68] font-bold leading-relaxed transition-all duration-300 ${
                  harakatRevealed
                    ? 'text-emerald-700 animate-in zoom-in-95 scale-105 filter drop-shadow-sm'
                    : 'text-slate-800'
                }`}
              >
                {harakatRevealed
                  ? harakatVoiceItems[currentQuestionIndex].fullArabic
                  : removeHarakat(harakatVoiceItems[currentQuestionIndex].fullArabic)}
              </p>

              {harakatRevealed && (
                <div className="mt-3 text-xs text-emerald-800 font-bold animate-in fade-in flex items-center justify-center gap-1.5">
                  <Sparkles size={16} className="text-emerald-500 animate-spin" />
                  <span>Harakat Terbuka Sempurna!</span>
                </div>
              )}
            </div>

            {/* Live Audio Recite Mic Button */}
            <div className="py-2 flex flex-col items-center justify-center space-y-2">
              <button
                onClick={() => handleToggleVoiceRecord(harakatVoiceItems[currentQuestionIndex])}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl shadow-xl transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500 animate-pulse ring-8 ring-rose-200 scale-105'
                    : 'bg-gradient-to-tr from-[#08B9EF] to-[#0496c4] hover:scale-105 active:scale-95'
                }`}
              >
                {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
              </button>

              <span className="text-xs font-black text-[#164C68]">
                {isRecording
                  ? `Sedang Merekam... (${recordingTimer} dtk) • Ketuk jika selesai`
                  : 'Ketuk Mikrofon untuk Membaca'}
              </span>
            </div>

            {/* Pop Animation & Success / Correction UI */}
            {harakatFeedback === 'success' && (
              <div className="space-y-3 animate-in zoom-in-90 pt-1">
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-3xl text-emerald-900 text-xs font-semibold space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm font-black text-emerald-700">
                    <span>🎉</span>
                    <span>Masya Allah, Pelafalan Benar!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    "{harakatVoiceItems[currentQuestionIndex].meaning}"
                  </p>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() =>
                        playQariAudio(
                          harakatVoiceItems[currentQuestionIndex].audioInfo.surah,
                          harakatVoiceItems[currentQuestionIndex].audioInfo.ayah
                        )
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-200 text-emerald-900 text-xs font-bold hover:bg-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 size={14} /> Dengar Suara Qari
                    </button>
                    <button
                      onClick={() => setShowCorrection(!showCorrection)}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      {showCorrection ? 'Tutup Koreksi' : 'Lihat Tampilan Koreksi'}
                    </button>
                  </div>
                </div>

                {/* Tampilan Koreksi Detailed Comparison */}
                {showCorrection && (
                  <div className="p-4 bg-white border-2 border-[#C9E1ED] rounded-3xl text-left space-y-2 animate-in fade-in">
                    <h4 className="text-xs font-black text-[#164C68] flex items-center gap-1.5">
                      <AlertCircle size={15} className="text-[#08B9EF]" />
                      <span>Tampilan Koreksi & Penjelasan Harakat:</span>
                    </h4>
                    <div className="text-[11px] text-[#8C9BA7] space-y-1">
                      <p>
                        <strong>Teks Gundul:</strong>{' '}
                        <span dir="rtl" className="font-quran text-sm text-[#164C68]">
                          {removeHarakat(harakatVoiceItems[currentQuestionIndex].fullArabic)}
                        </span>
                      </p>
                      <p>
                        <strong>Harakat Sempurna:</strong>{' '}
                        <span dir="rtl" className="font-quran text-sm text-emerald-700 font-bold">
                          {harakatVoiceItems[currentQuestionIndex].fullArabic}
                        </span>
                      </p>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-[#164C68] block mb-1">
                        Poin Tajwid & Harakat Penting:
                      </span>
                      <ul className="list-disc list-inside text-[10px] text-[#8C9BA7] space-y-0.5">
                        {harakatVoiceItems[currentQuestionIndex].keyRules.map((rule, rIdx) => (
                          <li key={rIdx}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <Button
                  variant="green"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    if (currentQuestionIndex < harakatVoiceItems.length - 1) {
                      setCurrentQuestionIndex((prev) => prev + 1);
                      setHarakatRevealed(false);
                      setHarakatFeedback(null);
                      setShowCorrection(false);
                    } else {
                      handleFinishGame(30);
                    }
                  }}
                  icon={<CheckCircle2 size={18} />}
                >
                  {currentQuestionIndex < harakatVoiceItems.length - 1 ? 'Tantangan Ayat Berikutnya' : 'Selesai & Buka Hadiah'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 7. KLASIFIKASI TAJWID (Basket Sorter) */}
        {activeGame === 'tajwid_class' && (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>🏷️</span> Klasifikasi Hukum Tajwid
              </span>
              <span>Soal {currentQuestionIndex + 1} dari {tajwidBasketItems.length}</span>
            </div>

            <h3 className="text-base font-extrabold text-[#164C68] font-heading">
              {tajwidBasketItems[currentQuestionIndex].question}
            </h3>

            {/* Target Snippet */}
            <div className="bg-teal-50 border-2 border-teal-300 rounded-3xl p-5 shadow-xs">
              <p dir="rtl" className="font-quran text-4xl text-teal-900 font-bold leading-relaxed">
                {tajwidBasketItems[currentQuestionIndex].arabicText}
              </p>
            </div>

            {/* 2 Target Baskets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {tajwidBasketItems[currentQuestionIndex].buckets.map((b) => {
                const isSelected = selectedTajwidBucket === b.id;
                let bStyle = 'bg-white border-[#C9E1ED] hover:border-teal-400 text-[#164C68]';
                if (tajwidFeedback && isSelected) {
                  bStyle = b.isCorrect
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300'
                    : 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-300';
                }

                return (
                  <button
                    key={b.id}
                    onClick={() => handleSelectTajwidBucket(b.id, tajwidBasketItems[currentQuestionIndex])}
                    disabled={tajwidFeedback !== null}
                    className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer shadow-xs ${bStyle}`}
                  >
                    <span className="text-2xl block mb-1">📥</span>
                    <span className="text-xs font-bold block">{b.label}</span>
                  </button>
                );
              })}
            </div>

            {tajwidFeedback && (
              <div className="space-y-3 animate-in fade-in pt-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                    tajwidFeedback === 'correct'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  <p className="font-bold mb-0.5">
                    {tajwidFeedback === 'correct' ? '✅ Jawaban Tepat!' : '❌ Belum tepat.'}
                  </p>
                  <p>{tajwidBasketItems[currentQuestionIndex].explanation}</p>
                </div>

                <Button
                  variant="green"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    if (currentQuestionIndex < tajwidBasketItems.length - 1) {
                      setCurrentQuestionIndex((prev) => prev + 1);
                      setSelectedTajwidBucket(null);
                      setTajwidFeedback(null);
                    } else {
                      handleFinishGame(20);
                    }
                  }}
                >
                  {currentQuestionIndex < tajwidBasketItems.length - 1 ? 'Soal Tajwid Berikutnya' : 'Selesai Permainan'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 8. DETEKTIF SURAH (Clue Guessing) */}
        {activeGame === 'guess_surah' && (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>💡</span> Detektif Surah Rahasia
              </span>
              <span>Soal {currentQuestionIndex + 1} dari {detectiveSurahItems.length}</span>
            </div>

            <h3 className="text-base font-extrabold text-[#164C68] font-heading">
              Buka petunjuk rahasia dan tebak nama surahnya:
            </h3>

            {/* Clues Stack */}
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-[#164C68] font-semibold text-left">
                🔍 <strong>Petunjuk 1:</strong> {detectiveSurahItems[currentQuestionIndex].clue1}
              </div>

              {unlockedClues >= 2 ? (
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-2xl text-xs text-[#164C68] font-semibold text-left animate-in fade-in">
                  📜 <strong>Petunjuk 2:</strong> {detectiveSurahItems[currentQuestionIndex].clue2}
                </div>
              ) : (
                <button
                  onClick={() => setUnlockedClues(2)}
                  className="w-full p-2.5 bg-slate-50 border border-dashed border-[#C9E1ED] rounded-2xl text-xs text-[#8C9BA7] hover:text-[#164C68] font-bold cursor-pointer"
                >
                  🔓 Buka Petunjuk 2 (Bonus Skor Lebih Rendah)
                </button>
              )}

              {unlockedClues >= 3 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-[#164C68] font-semibold text-left animate-in fade-in">
                  🎵 <strong>Petunjuk 3:</strong> {detectiveSurahItems[currentQuestionIndex].clue3}
                </div>
              ) : (
                unlockedClues === 2 && (
                  <button
                    onClick={() => setUnlockedClues(3)}
                    className="w-full p-2.5 bg-slate-50 border border-dashed border-[#C9E1ED] rounded-2xl text-xs text-[#8C9BA7] hover:text-[#164C68] font-bold cursor-pointer"
                  >
                    🔓 Buka Petunjuk 3 (Potongan Lafaz)
                  </button>
                )
              )}
            </div>

            {/* Candidate Options */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {detectiveSurahItems[currentQuestionIndex].options.map((opt, idx) => {
                const isSelected = surahGuessSelected === idx;
                const isCorrect = idx === detectiveSurahItems[currentQuestionIndex].correctIndex;

                let style = 'bg-white border-[#C9E1ED] hover:border-blue-400 text-[#164C68]';
                if (surahGuessFeedback && isSelected) {
                  style = isCorrect
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300'
                    : 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-300';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectSurahGuess(idx, detectiveSurahItems[currentQuestionIndex])}
                    disabled={surahGuessFeedback !== null}
                    className={`p-3.5 rounded-2xl border-2 text-center text-xs font-black transition-all shadow-xs cursor-pointer ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {surahGuessFeedback && (
              <div className="space-y-3 animate-in fade-in pt-2">
                <Button
                  variant="green"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    if (currentQuestionIndex < detectiveSurahItems.length - 1) {
                      setCurrentQuestionIndex((prev) => prev + 1);
                      setUnlockedClues(1);
                      setSurahGuessSelected(null);
                      setSurahGuessFeedback(null);
                    } else {
                      handleFinishGame(25);
                    }
                  }}
                >
                  {currentQuestionIndex < detectiveSurahItems.length - 1 ? 'Soal Detektif Berikutnya' : 'Selesai & Buka Hadiah'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Celebration Modal */}
        <RewardModal
          isOpen={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            setActiveGame(null);
          }}
          title="Permainan Selesai!"
          message={`Skor akhir kamu: ${score}. Terus jelajahi arena game Qur'an lainnya!`}
          starsEarned={5}
          xpEarned={20}
          nextLabel="Kembali ke Arena & Peta Dunia"
          onNext={() => {
            setShowCelebration(false);
            setActiveGame(null);
          }}
        />
      </div>
    );
  }

  // Default: Main World Map View
  return (
    <WorldMapView
      child={activeChild}
      companion={companion}
      initialTab={initialTab}
      onNavigateToLand={(tab, subView) => {
        onNavigateToLand?.(tab, subView);
      }}
      onRefreshCompanion={() => setCompanionStateVersion((v) => v + 1)}
      onLaunchMiniGame={(gameId) => handleStartGame(gameId as GameType)}
    />
  );
};
