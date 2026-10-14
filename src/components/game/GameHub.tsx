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
import { UserAccount } from '../../types';

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
  initialTab?: 'map' | 'games' | 'room' | 'collection' | 'leaderboard';
  onNavigateToLand?: (tab: 'tahfiz' | 'alquran', subView?: string) => void;
  userAccount?: UserAccount;
  onOpenUpgradeModal?: () => void;
  onOpenStarShop?: () => void;
}

export function removeHarakat(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
}

export const GameHub: React.FC<GameHubProps> = ({
  childId,
  initialTab,
  onNavigateToLand,
  userAccount,
  onOpenUpgradeModal,
  onOpenStarShop,
}) => {
  const currentUserAccount = userAccount || StorageService.getUserAccount();
  const accountTier = StorageService.getAccountTier(currentUserAccount);
  const isPro = accountTier === 'pro';

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

  // --- 6. Dengar & Pilih Ayat / Harakat Hilang state ---
  const [audioToAyahMode, setAudioToAyahMode] = useState<'listen_guess' | 'voice_challenge'>('listen_guess');
  const [audioGuessSelected, setAudioGuessSelected] = useState<number | null>(null);
  const [audioGuessFeedback, setAudioGuessFeedback] = useState<'correct' | 'wrong' | null>(null);
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

    const gameTitles: Record<string, string> = {
      continue_ayah: 'Sambung Ayat (PVP)',
      arrange_ayah: 'Susun Ayat',
      missing_word: 'Hujan Kata',
      hijaiyah_sound: 'Lebah Ejaan',
      arabic_matching: 'Cocokkan Kata & Arti',
      tajwid_class: 'Klasifikasi Tajwid',
      guess_surah: 'Detektif Surah',
      audio_to_ayah: 'Dengar & Pilih Ayat',
    };
    const title = activeGame ? gameTitles[activeGame] || activeGame : 'Mini-Game Qur\'an';
    StorageService.addActivity({
      userName: activeChild?.name || 'Santri Cilik',
      userAvatar: activeChild?.avatar || '🌟',
      userLevel: activeChild?.level || 1,
      gameId: activeGame || 'game',
      gameName: title,
      gameIcon: '🎮',
      score: score + bonusScore,
      actionText: `meraih ${score + bonusScore} poin di ${title}`,
    });

    CompanionService.recordActivity(childId, 'game', earnedXp, earnedStars);
    setCompanionStateVersion((v) => v + 1);
    triggerPopConfetti();
    setShowCelebration(true);
  };

  // -------------------------------------------------------------
  // DATA FOR 8 GAMES
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // DATA FOR 8 GAMES (Comprehensive & Deeply Audited)
  // -------------------------------------------------------------

    // 1. Sambung Ayat items (8 items with diversified answer choices)
  const continueAyahItems = [
    {
      surah: 'Al-Ikhlas',
      firstPart: 'قُلْ هُوَ اللّٰهُ',
      options: ['الصَّمَدُ ۚ', 'اَحَدٌ ۚ', 'الْفَلَقِ ۙ', 'الرَّحِيْمِ ۙ'],
      correctIndex: 1,
      fullArabic: 'قُلْ هُوَ اللّٰهُ اَحَدٌ ۚ',
      audioInfo: { surah: 112, ayah: 1 },
      meaning: 'Katakanlah (Muhammad), Dialah Allah, Yang Maha Esa.',
    },
    {
      surah: 'Al-Fatihah',
      firstPart: 'اِيَّاكَ نَعْبُدُ وَاِيَّاكَ',
      options: ['الْمُسْتَقِيْمَ ۙ', 'الدِّيْنِ ۗ', 'نَسْتَعِيْنُ ۗ', 'الرَّحِيْمِ ۙ'],
      correctIndex: 2,
      fullArabic: 'اِيَّاكَ نَعْبُدُ وَاِيَّاكَ نَسْتَعِيْنُ ۗ',
      audioInfo: { surah: 1, ayah: 5 },
      meaning: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan.',
    },
    {
      surah: 'An-Nas',
      firstPart: 'مِنْ شَرِّ الْوَسْوَاسِ',
      options: ['النَّاسِ ۙ', 'الْفَلَقِ ۙ', 'الْعَصْرِ ۙ', 'الْخَنَّاسِ ۙ'],
      correctIndex: 3,
      fullArabic: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۙ',
      audioInfo: { surah: 114, ayah: 4 },
      meaning: 'Dari kejahatan (bisikan) setan yang bersembunyi.',
    },
    {
      surah: 'Al-Falaq',
      firstPart: 'قُلْ اَعُوْذُ بِرَبِّ',
      options: ['الْفَلَقِ ۙ', 'النَّاسِ ۙ', 'الْعَالَمِيْنَ ۙ', 'الصَّمَدِ ۙ'],
      correctIndex: 0,
      fullArabic: 'قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِ ۙ',
      audioInfo: { surah: 113, ayah: 1 },
      meaning: 'Katakanlah, Aku berlindung kepada Tuhan yang menguasai subuh (fajar).',
    },
    {
      surah: 'Al-Kausar',
      firstPart: 'اِنَّآ اَعْطَيْنٰكَ',
      options: ['الْاَبْتَرَ ۗ', 'الْكَوْثَرَ ۗ', 'الْفَتْحَ ۗ', 'الْخَيْرَ ۗ'],
      correctIndex: 1,
      fullArabic: 'اِنَّآ اَعْطَيْنٰكَ الْكَوْثَرَ ۗ',
      audioInfo: { surah: 108, ayah: 1 },
      meaning: 'Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak.',
    },
    {
      surah: 'Al-Asr',
      firstPart: 'وَالْعَصْرِ ۙ',
      options: ['فَصَلِّ لِرَبِّكَ وَانْحَرْ ۗ', 'مَلِكِ النَّاسِ ۙ', 'اِنَّ الْاِنْسَانَ لَفِيْ خُسْرٍ ۙ', 'قُلْ هُوَ اللّٰهُ اَحَدٌ ۚ'],
      correctIndex: 2,
      fullArabic: 'وَالْعَصْرِ ۙ اِنَّ الْاِنْسَانَ لَفِيْ خُسْرٍ ۙ',
      audioInfo: { surah: 103, ayah: 1 },
      meaning: 'Demi masa, sungguh manusia berada dalam kerugian.',
    },
    {
      surah: 'Al-Kafirun',
      firstPart: 'قُلْ يٰٓاَيُّهَا',
      options: ['النَّاسُ ۙ', 'الْمُؤْمِنُوْنَ ۙ', 'الصَّابِرُوْنَ ۙ', 'الْكٰفِرُوْنَ ۙ'],
      correctIndex: 3,
      fullArabic: 'قُلْ يٰٓاَيُّهَا الْكٰفِرُوْنَ ۙ',
      audioInfo: { surah: 109, ayah: 1 },
      meaning: 'Katakanlah (Muhammad), Wahai orang-orang kafir!',
    },
    {
      surah: 'Al-Maun',
      firstPart: 'اَرَءَيْتَ الَّذِيْ يُكَذِّبُ',
      options: ['بِالدِّيْنِ ۗ', 'بِالصَّلٰوةِ ۗ', 'بِالْقُرْاٰنِ ۗ', 'بِالْحَقِّ ۗ'],
      correctIndex: 0,
      fullArabic: 'اَرَءَيْتَ الَّذِيْ يُكَذِّبُ بِالدِّيْنِ ۗ',
      audioInfo: { surah: 107, ayah: 1 },
      meaning: 'Tahukah kamu (orang) yang mendustakan agama?',
    },
  ];

  // 2. Susun Ayat items (6 items)
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
    {
      surah: 'Al-Ikhlas Ayat 1',
      correctWords: ['قُلْ', 'هُوَ', 'اللّٰهُ', 'اَحَدٌ ۚ'],
      scrambledWords: ['اَحَدٌ ۚ', 'اللّٰهُ', 'قُلْ', 'هُوَ'],
      fullArabic: 'قُلْ هُوَ اللّٰهُ اَحَدٌ ۚ',
      audioInfo: { surah: 112, ayah: 1 },
      meaning: 'Katakanlah (Muhammad), Dialah Allah, Yang Maha Esa.',
    },
    {
      surah: 'Al-Falaq Ayat 1',
      correctWords: ['قُلْ', 'اَعُوْذُ', 'بِرَبِّ', 'الْفَلَقِ ۙ'],
      scrambledWords: ['الْفَلَقِ ۙ', 'قُلْ', 'بِرَبِّ', 'اَعُوْذُ'],
      fullArabic: 'قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِ ۙ',
      audioInfo: { surah: 113, ayah: 1 },
      meaning: 'Katakanlah, Aku berlindung kepada Tuhan yang menguasai subuh.',
    },
    {
      surah: 'An-Nas Ayat 1',
      correctWords: ['قُلْ', 'اَعُوْذُ', 'بِرَبِّ', 'النَّاسِ ۙ'],
      scrambledWords: ['النَّاسِ ۙ', 'بِرَبِّ', 'قُلْ', 'اَعُوْذُ'],
      fullArabic: 'قُلْ اَعُوْذُ بِرَبِّ النَّاسِ ۙ',
      audioInfo: { surah: 114, ayah: 1 },
      meaning: 'Katakanlah, Aku berlindung kepada Tuhannya manusia.',
    },
    {
      surah: 'Al-Ikhlas Ayat 2',
      correctWords: ['اَللّٰهُ', 'الصَّمَدُ ۚ'],
      scrambledWords: ['الصَّمَدُ ۚ', 'اَللّٰهُ'],
      fullArabic: 'اَللّٰهُ الصَّمَدُ ۚ',
      audioInfo: { surah: 112, ayah: 2 },
      meaning: 'Allah tempat meminta segala sesuatu.',
    },
  ];

    // 3. Kata Hilang items (6 items with varied answer positions)
  const missingWordItems = [
    {
      surah: 'Al-Ikhlas Ayat 2',
      prompt: 'اَللّٰهُ [ ... ]',
      missingWord: 'الصَّمَدُ ۚ',
      options: ['الْاَحَدُ ۚ', 'الصَّمَدُ ۚ', 'الرَّحْمٰنُ ۚ', 'الْعَلِيْمُ ۚ'],
      correctIndex: 1,
      fullArabic: 'اَللّٰهُ الصَّمَدُ ۚ',
      audioInfo: { surah: 112, ayah: 2 },
      hint: 'Artinya: Allah tempat meminta segala sesuatu.',
    },
    {
      surah: 'Quraisy Ayat 3',
      prompt: 'فَلْيَعْبُدُوْا رَبَّ هٰذَا [ ... ]',
      missingWord: 'الْبَيْتِ ۙ',
      options: ['الْبَلَدِ ۙ', 'الْقَوْمِ ۙ', 'الْبَيْتِ ۙ', 'النَّاسِ ۙ'],
      correctIndex: 2,
      fullArabic: 'فَلْيَعْبُدُوْا رَبَّ هٰذَا الْبَيْتِ ۙ',
      audioInfo: { surah: 106, ayah: 3 },
      hint: 'Artinya: Maka hendaklah mereka menyembah Tuhan (pemilik) rumah ini (Ka‘bah).',
    },
    {
      surah: 'Al-Fatihah Ayat 1',
      prompt: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ [ ... ]',
      missingWord: 'الرَّحِيْمِ ۙ',
      options: ['الرَّحِيْمِ ۙ', 'الْعَلِيْمِ ۙ', 'الْحَكِيْمِ ۙ', 'الْقَدِيْرِ ۙ'],
      correctIndex: 0,
      fullArabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ ۙ',
      audioInfo: { surah: 1, ayah: 1 },
      hint: 'Artinya: Yang Maha Pengasih, Maha Penyayang.',
    },
    {
      surah: 'Al-Falaq Ayat 2',
      prompt: 'مِنْ شَرِّ مَا [ ... ]',
      missingWord: 'خَلَقَ ۙ',
      options: ['وَقَبَ ۙ', 'حَسَدَ ۙ', 'عَقَدَ ۙ', 'خَلَقَ ۙ'],
      correctIndex: 3,
      fullArabic: 'مِنْ شَرِّ مَا خَلَقَ ۙ',
      audioInfo: { surah: 113, ayah: 2 },
      hint: 'Artinya: Dari kejahatan (makhluk) yang Dia ciptakan.',
    },
    {
      surah: 'Al-Maun Ayat 2',
      prompt: 'فَذٰلِكَ الَّذِيْ يَدُعُّ [ ... ]',
      missingWord: 'الْيَتِيْمَ ۙ',
      options: ['الْمِسْكِيْنَ ۙ', 'الْيَتِيْمَ ۙ', 'الْغَرِيْبَ ۙ', 'الْفَقِيْرَ ۙ'],
      correctIndex: 1,
      fullArabic: 'فَذٰلِكَ الَّذِيْ يَدُعُّ الْيَتِيْمَ ۙ',
      audioInfo: { surah: 107, ayah: 2 },
      hint: 'Artinya: Maka itulah orang yang menghardik anak yatim.',
    },
    {
      surah: 'An-Nas Ayat 2',
      prompt: 'مَلِكِ [ ... ]',
      missingWord: 'النَّاسِ ۙ',
      options: ['الْخَنَّاسِ ۙ', 'الْفَلَقِ ۙ', 'النَّاسِ ۙ', 'الْكَوْثَرِ ۙ'],
      correctIndex: 2,
      fullArabic: 'مَلِكِ النَّاسِ ۙ',
      audioInfo: { surah: 114, ayah: 2 },
      hint: 'Artinya: Raja manusia.',
    },
  ];

  // 4. Cocokkan Kata & Arti progressive rounds
  const matchingRounds = [
    {
      title: 'Level 1: Kosakata Pokok Al-Qur\'an',
      pairs: [
        { id: 0, arabic: 'رَبِّ', meaning: 'Tuhan Pemelihara', translit: 'Rabbi' },
        { id: 1, arabic: 'الصِّرَاطَ', meaning: 'Jalan yang Lurus', translit: 'Ash-Shiraath' },
        { id: 2, arabic: 'الْفَلَقِ', meaning: 'Waktu Subuh / Fajar', translit: 'Al-Falaq' },
        { id: 3, arabic: 'النَّاسِ', meaning: 'Manusia', translit: 'An-Naas' },
      ],
    },
    {
      title: 'Level 2: Makna Nama Surah Populer',
      pairs: [
        { id: 0, arabic: 'الْإِخْلَاصُ', meaning: 'Kemurnian Keesaan Allah', translit: 'Al-Ikhlas' },
        { id: 1, arabic: 'الْكَوْثَرُ', meaning: 'Nikmat yang Melimpah', translit: 'Al-Kausar' },
        { id: 2, arabic: 'الْفِيلُ', meaning: 'Pasukan Bergajah', translit: 'Al-Fil' },
        { id: 3, arabic: 'الْعَصْرُ', meaning: 'Demi Waktu Masa', translit: 'Al-\'Asr' },
      ],
    },
    {
      title: 'Level 3: Kalimat Thayyibah Sehari-hari',
      pairs: [
        { id: 0, arabic: 'سُبْحَانَ اللّٰهِ', meaning: 'Maha Suci Allah', translit: 'Subhanallah' },
        { id: 1, arabic: 'اَلْحَمْدُ لِلّٰهِ', meaning: 'Segala Puji Bagi Allah', translit: 'Alhamdulillah' },
        { id: 2, arabic: 'اَللّٰهُ اَكْبَرُ', meaning: 'Allah Maha Besar', translit: 'Allahu Akbar' },
        { id: 3, arabic: 'أَسْتَغْفِرُ اللّٰهَ', meaning: 'Aku Mohon Ampun Pada Allah', translit: 'Astaghfirullah' },
      ],
    },
  ];

  // Active matching round
  const [matchingRoundIndex, setMatchingRoundIndex] = useState<number>(0);
  const currentMatchingSet = matchingRounds[matchingRoundIndex] || matchingRounds[0];
  const matchingPairs = currentMatchingSet.pairs;

    // 5. Tebak Suara Huruf items (8 items with varied positions and rich makhraj guidance)
  const hijaiyahSoundItems = [
    {
      letter: 'بَ',
      letterName: 'Ba (ب)',
      makhrajHint: 'Bibir tertutup rapat lalu dibuka ringan (Asy-Syafatain).',
      soundPrompt: 'Dengarkan suara huruf: "Ba"',
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
      soundPrompt: 'Dengarkan suara huruf: "Ja"',
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
      soundPrompt: 'Dengarkan suara huruf: "Qa"',
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
      soundPrompt: 'Dengarkan suara huruf: "Kha"',
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
      soundPrompt: 'Dengarkan suara huruf: "Ain"',
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
      soundPrompt: 'Dengarkan suara huruf: "Sha"',
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
      soundPrompt: 'Dengarkan suara huruf: "Dha"',
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
      soundPrompt: 'Dengarkan suara huruf: "Tsa"',
      options: [
        { letter: 'س', name: 'Sin', correct: false },
        { letter: 'ش', name: 'Syin', correct: false },
        { letter: 'ت', name: 'Ta', correct: false },
        { letter: 'ث', name: 'Tsa', correct: true },
      ],
    },
  ];

    // 6. Dengar & Pilih Ayat items (Mode A: Qari Audio to Ayah Matcher)
  const audioGuessAyahItems = [
    {
      surahName: 'Al-Ikhlas Ayat 1',
      audioInfo: { surah: 112, ayah: 1 },
      promptText: 'Dengarkan lantunan Syaikh Qari lalu pilih ayat yang tepat:',
      options: [
        { arabic: 'اَللّٰهُ الصَّمَدُ ۚ', latin: 'Allāhuṣ-ṣamad', isCorrect: false },
        { arabic: 'قُلْ هُوَ اللّٰهُ اَحَدٌ ۚ', latin: 'Qul huwallāhu aḥad', isCorrect: true },
        { arabic: 'لَمْ يَلِدْ وَلَمْ يُوْلَدْ ۙ', latin: 'Lam yalid wa lam yūlad', isCorrect: false },
      ],
      meaning: 'Katakanlah (Muhammad), Dialah Allah, Yang Maha Esa.',
    },
    {
      surahName: 'Al-Falaq Ayat 1',
      audioInfo: { surah: 113, ayah: 1 },
      promptText: 'Dengarkan lantunan Syaikh Qari lalu pilih ayat yang tepat:',
      options: [
        { arabic: 'مِنْ شَرِّ مَا خَلَقَ ۙ', latin: 'Min syarri mā khalaq', isCorrect: false },
        { arabic: 'وَمِنْ شَرِّ غَاسِقٍ اِذَا وَقَبَ ۙ', latin: 'Wa min syarri gāsiqin iżā waqab', isCorrect: false },
        { arabic: 'قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِ ۙ', latin: 'Qul a‘ūżu birabbil-falaq', isCorrect: true },
      ],
      meaning: 'Katakanlah, Aku berlindung kepada Tuhan yang menguasai subuh (fajar).',
    },
    {
      surahName: 'An-Nas Ayat 1',
      audioInfo: { surah: 114, ayah: 1 },
      promptText: 'Dengarkan lantunan Syaikh Qari lalu pilih ayat yang tepat:',
      options: [
        { arabic: 'قُلْ اَعُوْذُ بِرَبِّ النَّاسِ ۙ', latin: 'Qul a‘ūżu birabbin-nās', isCorrect: true },
        { arabic: 'مَلِكِ النَّاسِ ۙ', latin: 'Malikin-nās', isCorrect: false },
        { arabic: 'اِلٰهِ النَّاسِ ۙ', latin: 'Ilāhin-nās', isCorrect: false },
      ],
      meaning: 'Katakanlah, Aku berlindung kepada Tuhannya manusia.',
    },
    {
      surahName: 'Al-Kausar Ayat 1',
      audioInfo: { surah: 108, ayah: 1 },
      promptText: 'Dengarkan lantunan Syaikh Qari lalu pilih ayat yang tepat:',
      options: [
        { arabic: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ ۗ', latin: 'Faṣalli lirabbika wan-ḥar', isCorrect: false },
        { arabic: 'اِنَّآ اَعْطَيْنٰكَ الْكَوْثَرَ ۗ', latin: 'Innā a‘ṭainākal-kauṡar', isCorrect: true },
        { arabic: 'اِنَّ شَانِئَكَ هُوَ الْاَبْتَرُ ࣖ', latin: 'Inna syāni\'aka huwal-abtar', isCorrect: false },
      ],
      meaning: 'Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak.',
    },
    {
      surahName: 'Al-Fatihah Ayat 1',
      audioInfo: { surah: 1, ayah: 1 },
      promptText: 'Dengarkan lantunan Syaikh Qari lalu pilih ayat yang tepat:',
      options: [
        { arabic: 'اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ ۙ', latin: 'Al-ḥamdu lillāhi rabbil-‘ālamīn', isCorrect: false },
        { arabic: 'الرَّحْمٰنِ الرَّحِيْمِ ۙ', latin: 'Ar-raḥmānir-raḥīm', isCorrect: false },
        { arabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ ۙ', latin: 'Bismillāhir-raḥmānir-raḥīm', isCorrect: true },
      ],
      meaning: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
    },
  ];

  // Mode B: Harakat Hilang & Setoran Suara items
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

  // 7. Klasifikasi Tajwid items (8 items)
  const tajwidBasketItems = [
    {
      arabicText: 'مِنْ شَرِّ',
      question: 'Manakah hukum bacaan Nun Sukun pada kata di atas?',
      buckets: [
        { id: 'ikhfa', label: 'Ikhfa Haqiqi (Samar & Dengung)', isCorrect: true },
        { id: 'izhar', label: 'Izhar Halqi (Jelas Tanpa Dengung)', isCorrect: false },
      ],
      explanation: 'Nun sukun bertemu huruf Syin (ش) dibaca samar disertai dengung 2 harakat (Ikhfa Haqiqi).',
    },
    {
      arabicText: 'مَنْ اٰمَنَ',
      question: 'Manakah hukum bacaan Nun Sukun pada kalimat di atas?',
      buckets: [
        { id: 'ikhfa', label: 'Ikhfa Haqiqi (Samar)', isCorrect: false },
        { id: 'izhar', label: 'Izhar Halqi (Jelas & Terang)', isCorrect: true },
      ],
      explanation: 'Nun sukun bertemu huruf Hamzah/Alif (ء) dibaca jelas dan tegas tanpa dengung (Izhar Halqi).',
    },
    {
      arabicText: 'مِنْ بَعْدِ',
      question: 'Manakah hukum bacaan Nun Sukun pada kata di atas?',
      buckets: [
        { id: 'iqlab', label: 'Iqlab (Berubah Bunyi Mim)', isCorrect: true },
        { id: 'idgham', label: 'Idgham Bighunnah', isCorrect: false },
      ],
      explanation: 'Nun sukun bertemu huruf Ba (ب) dibaca Iqlab, suaranya berubah menjadi bunyi Mim samar disertai dengung.',
    },
    {
      arabicText: 'مَنْ يَّقُوْلُ',
      question: 'Manakah hukum bacaan Nun Sukun pada ayat di atas?',
      buckets: [
        { id: 'idgham_bi', label: 'Idgham Bighunnah (Masuk & Dengung)', isCorrect: true },
        { id: 'idgham_bila', label: 'Idgham Bilaghunnah (Tanpa Dengung)', isCorrect: false },
      ],
      explanation: 'Nun sukun bertemu huruf Ya (ي) adalah Idgham Bighunnah, dileburkan disertai dengung 2 harakat.',
    },
    {
      arabicText: 'مِنْ رَّبِّهِمْ',
      question: 'Manakah hukum bacaan Nun Sukun pada kata di atas?',
      buckets: [
        { id: 'idgham_bi', label: 'Idgham Bighunnah (Dengung)', isCorrect: false },
        { id: 'idgham_bila', label: 'Idgham Bilaghunnah (Tanpa Dengung)', isCorrect: true },
      ],
      explanation: 'Nun sukun bertemu huruf Ra (ر) adalah Idgham Bilaghunnah, dileburkan sempurna tanpa dengung.',
    },
    {
      arabicText: 'تَرْمِيْهِمْ بِحِجَارَةٍ',
      question: 'Manakah hukum bacaan Mim Sukun pada kata di atas?',
      buckets: [
        { id: 'ikhfa_syafawi', label: 'Ikhfa Syafawi (Samar di Bibir)', isCorrect: true },
        { id: 'izhar_syafawi', label: 'Izhar Syafawi (Jelas di Bibir)', isCorrect: false },
      ],
      explanation: 'Mim sukun bertemu huruf Ba (ب) adalah Ikhfa Syafawi, dibaca samar di kedua bibir disertai dengung.',
    },
    {
      arabicText: 'قُلْ هُوَ اللّٰهُ اَحَدٌ ۚ',
      question: 'Hukum bacaan huruf Dal di akhir ayat saat berhenti (waqaf)?',
      buckets: [
        { id: 'qalqalah_kubra', label: 'Qalqalah Kubra (Pantulan Besar)', isCorrect: true },
        { id: 'qalqalah_sugra', label: 'Qalqalah Sugra (Pantulan Kecil)', isCorrect: false },
      ],
      explanation: 'Huruf Dal yang diwaqafkan di akhir ayat dibaca memantul tebal dan jelas (Qalqalah Kubra).',
    },
    {
      arabicText: 'يَجْعَلْ كَيْدَهُمْ',
      question: 'Hukum bacaan huruf Jim Sukun (جْ) di tengah kata di atas?',
      buckets: [
        { id: 'qalqalah_kubra', label: 'Qalqalah Kubra (Besar)', isCorrect: false },
        { id: 'qalqalah_sugra', label: 'Qalqalah Sugra (Pantulan Ringan)', isCorrect: true },
      ],
      explanation: 'Huruf Jim sukun asli di tengah kata dibaca memantul ringan (Qalqalah Sugra).',
    },
  ];

    // 8. Detektif Surah items (6 items with progressive clues and randomized options)
  const detectiveSurahItems = [
    {
      clue1: 'Surah ini terdiri dari 5 ayat dan tergolong Makkiyah.',
      clue2: 'Menceritakan kehancuran tentara bergajah yang dipimpin Raja Abrahah.',
      clue3: 'Ayat pertama diawali dengan: "اَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ..."',
      options: ['Quraisy', 'Al-Fil (Gajah)', 'Al-Kafirun', 'Al-Maun'],
      correctIndex: 1,
      surahName: 'Al-Fil',
      audioInfo: { surah: 105, ayah: 1 },
    },
    {
      clue1: 'Surah ini memiliki 3 ayat dan merupakan surah terpendek dalam Al-Qur\'an.',
      clue2: 'Menyebutkan telaga nikmat yang melimpah dan perintah shalat serta berkurban.',
      clue3: 'Ayat pertama berbunyi: "اِنَّآ اَعْطَيْنٰكَ الْكَوْثَرَ ۗ"',
      options: ['An-Nasr', 'Al-Ikhlas', 'Al-Kausar', 'Al-Asr'],
      correctIndex: 2,
      surahName: 'Al-Kausar',
      audioInfo: { surah: 108, ayah: 1 },
    },
    {
      clue1: 'Surah ini bernilai sepertiga Al-Qur\'an karena menegaskan keesaan Allah yang mutlak.',
      clue2: 'Hanya terdiri dari 4 ayat dan sering dibaca bersama Al-Mu\'awwidzatain.',
      clue3: 'Ayat pertama berbunyi: "قُلْ هُوَ اللّٰهُ اَحَدٌ ۚ"',
      options: ['Al-Falaq', 'An-Nas', 'Al-Fatihah', 'Al-Ikhlas'],
      correctIndex: 3,
      surahName: 'Al-Ikhlas',
      audioInfo: { surah: 112, ayah: 1 },
    },
    {
      clue1: 'Surah ini mengajarkan memohon perlindungan dari kejahatan malam dan sihir tiupan tali.',
      clue2: 'Arti namanya adalah "Waktu Subuh" dan terdiri dari 5 ayat.',
      clue3: 'Ayat pertamanya berbunyi: "قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِ ۙ"',
      options: ['Al-Falaq', 'An-Nas', 'Al-Kafirun', 'Al-Lahab'],
      correctIndex: 0,
      surahName: 'Al-Falaq',
      audioInfo: { surah: 113, ayah: 1 },
    },
    {
      clue1: 'Surah penutup urutan ke-114 dalam mushaf Al-Qur\'an.',
      clue2: 'Memohon perlindungan dari bisikan setan penggoda yang bersembunyi (al-waswas al-khannas).',
      clue3: 'Ayat pertamanya: "قُلْ اَعُوْذُ بِرَبِّ النَّاسِ ۙ"',
      options: ['Al-Falaq', 'An-Nas', 'Al-Ikhlas', 'Al-Kafirun'],
      correctIndex: 1,
      surahName: 'An-Nas',
      audioInfo: { surah: 114, ayah: 1 },
    },
    {
      clue1: 'Surah ini menegur orang yang menghardik anak yatim dan enggan menolong fakir miskin.',
      clue2: 'Memperingatkan celakanya orang yang lalai dalam shalatnya dan riya\' (ingin dipuji).',
      clue3: 'Ayat pertamanya: "اَرَءَيْتَ الَّذِيْ يُكَذِّبُ بِالدِّيْنِ ۗ"',
      options: ['Al-Kafirun', 'Al-Asr', 'Al-Maun', 'Al-Qari\'ah'],
      correctIndex: 2,
      surahName: 'Al-Maun',
      audioInfo: { surah: 107, ayah: 1 },
    },
  ];

  // Start selected game
  const handleStartGame = (gameId: GameType) => {
    if (gameId && !StorageService.isGameUnlocked(gameId, accountTier)) {
      onOpenUpgradeModal?.();
      return;
    }
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
    setMatchingRoundIndex(0);
    setHijaiyahSelected(null);
    setHijaiyahFeedback(null);
    setAudioGuessSelected(null);
    setAudioGuessFeedback(null);
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

  // Authentic Arabic speech synthesis for Hijaiyah and Word Pronunciation
  const speakHijaiyah = (arabic: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(arabic);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.75;
      utterance.pitch = 1.15;
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find((v) => v.lang.startsWith('ar') || v.lang.includes('SA'));
      if (arVoice) utterance.voice = arVoice;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  // Auto-play audio when navigating to new questions in Hijaiyah & Qari games
  useEffect(() => {
    if (activeGame === 'hijaiyah_sound' && hijaiyahSoundItems[currentQuestionIndex]) {
      const timer = setTimeout(() => {
        speakHijaiyah(hijaiyahSoundItems[currentQuestionIndex].letter);
      }, 350);
      return () => clearTimeout(timer);
    }
    if (
      activeGame === 'audio_to_ayah' &&
      audioToAyahMode === 'listen_guess' &&
      audioGuessAyahItems[currentQuestionIndex]
    ) {
      const item = audioGuessAyahItems[currentQuestionIndex];
      const timer = setTimeout(() => {
        playQariAudio(item.audioInfo.surah, item.audioInfo.ayah);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [activeGame, currentQuestionIndex, audioToAyahMode]);

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
    speakHijaiyah(word);
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

  const handleShuffleArrangeWords = () => {
    if (arrangeFeedback === 'correct') return;
    setAvailableWords((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleResetArrangeWords = (item: any) => {
    if (arrangeFeedback === 'correct') return;
    setPlacedWords([]);
    setAvailableWords([...item.scrambledWords]);
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

  // 4. Cocokkan Kata Handlers (with pronunciation and progressive rounds)
  const handleSelectArabicMatch = (idx: number) => {
    if (matchedPairs.has(idx)) return;
    const item = matchingPairs.find((p) => p.id === idx);
    if (item) speakHijaiyah(item.arabic);

    setSelectedArabicIndex(idx);
    setMatchingError(false);

    // If meaning is already selected, verify pair
    if (selectedMeaningIndex !== null) {
      if (idx === selectedMeaningIndex) {
        const nextSet = new Set([...matchedPairs, idx]);
        setMatchedPairs(nextSet);
        setScore((s) => s + 10);
        setSelectedArabicIndex(null);
        setSelectedMeaningIndex(null);
        triggerPopConfetti();
        if (nextSet.size === matchingPairs.length) {
          if (matchingRoundIndex < matchingRounds.length - 1) {
            setTimeout(() => {
              setMatchingRoundIndex((r) => r + 1);
              setMatchedPairs(new Set());
              setSelectedArabicIndex(null);
              setSelectedMeaningIndex(null);
              triggerPopConfetti();
            }, 1000);
          } else {
            setTimeout(() => handleFinishGame(30), 800);
          }
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
        const nextSet = new Set([...matchedPairs, idx]);
        setMatchedPairs(nextSet);
        setScore((s) => s + 10);
        setSelectedArabicIndex(null);
        setSelectedMeaningIndex(null);
        triggerPopConfetti();
        if (nextSet.size === matchingPairs.length) {
          if (matchingRoundIndex < matchingRounds.length - 1) {
            setTimeout(() => {
              setMatchingRoundIndex((r) => r + 1);
              setMatchedPairs(new Set());
              setSelectedArabicIndex(null);
              setSelectedMeaningIndex(null);
              triggerPopConfetti();
            }, 1000);
          } else {
            setTimeout(() => handleFinishGame(30), 800);
          }
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

  // Dengar & Pilih Ayat (Mode A) Handler
  const handleSelectAudioGuess = (optIdx: number, item: any) => {
    if (audioGuessFeedback) return;
    setAudioGuessSelected(optIdx);
    const chosen = item.options[optIdx];
    if (chosen.isCorrect) {
      setAudioGuessFeedback('correct');
      setScore((s) => s + 20);
      triggerPopConfetti();
    } else {
      setAudioGuessFeedback('wrong');
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
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8C9BA7] uppercase tracking-wider block">
                  Pilihan Kata:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleShuffleArrangeWords}
                    className="px-2.5 py-1 rounded-xl bg-white border border-[#C9E1ED] text-[11px] font-bold text-[#164C68] hover:bg-slate-100 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    title="Acak posisi kata yang tersedia"
                  >
                    <Shuffle size={12} />
                    <span>Acak</span>
                  </button>
                  <button
                    onClick={() => handleResetArrangeWords(arrangeAyahItems[currentQuestionIndex])}
                    className="px-2.5 py-1 rounded-xl bg-white border border-[#C9E1ED] text-[11px] font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    title="Kembalikan semua kata ke bank pilihan"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
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
                  speakHijaiyah(hijaiyahSoundItems[currentQuestionIndex].letter);
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-amber-200"
                title="Dengarkan Suara Huruf"
              >
                <Volume2 size={32} className="animate-pulse" />
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
                    onClick={() => {
                      speakHijaiyah(opt.letter);
                      handleSelectHijaiyah(idx, hijaiyahSoundItems[currentQuestionIndex]);
                    }}
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

        {/* 6. DENGAR & PILIH AYAT / TANTANGAN HARAKAT HILANG */}
        {activeGame === 'audio_to_ayah' && (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            {/* Top Switcher: Mode A vs Mode B */}
            <div className="flex items-center justify-between text-xs text-[#8C9BA7] flex-wrap gap-2">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setAudioToAyahMode('listen_guess');
                    setCurrentQuestionIndex(0);
                    setAudioGuessSelected(null);
                    setAudioGuessFeedback(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    audioToAyahMode === 'listen_guess'
                      ? 'bg-white text-[#164C68] shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Volume2 size={14} className="text-[#08B9EF]" />
                  <span>Dengar & Tebak Ayat (Qari)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAudioToAyahMode('voice_challenge');
                    setCurrentQuestionIndex(0);
                    setHarakatRevealed(false);
                    setHarakatFeedback(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    audioToAyahMode === 'voice_challenge'
                      ? 'bg-white text-[#164C68] shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mic size={14} className="text-rose-500" />
                  <span>Harakat Hilang (Suara)</span>
                </button>
              </div>

              <span>
                Soal {currentQuestionIndex + 1} dari{' '}
                {audioToAyahMode === 'listen_guess'
                  ? audioGuessAyahItems.length
                  : harakatVoiceItems.length}
              </span>
            </div>

            {/* SUB-VIEW 1: LISTEN & GUESS AYAH */}
            {audioToAyahMode === 'listen_guess' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border-2 border-[#08B9EF]/40 rounded-3xl p-5 shadow-xs flex flex-col items-center justify-center space-y-2">
                  <span className="text-[10px] font-black text-[#08B9EF] uppercase tracking-wider block">
                    {audioGuessAyahItems[currentQuestionIndex].surahName}
                  </span>
                  <button
                    onClick={() =>
                      playQariAudio(
                        audioGuessAyahItems[currentQuestionIndex].audioInfo.surah,
                        audioGuessAyahItems[currentQuestionIndex].audioInfo.ayah
                      )
                    }
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#08B9EF] to-[#0496c4] text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-cyan-200"
                    title="Putar Tartil Qari"
                  >
                    <Volume2 size={32} className="animate-pulse" />
                  </button>
                  <p className="text-xs font-bold text-[#164C68]">
                    {audioGuessAyahItems[currentQuestionIndex].promptText}
                  </p>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Qari: Syaikh Misyari Rasyid Al-Afasy (Klik tombol biru untuk dengar lagi)
                  </span>
                </div>

                {/* Candidate Ayah Options */}
                <div className="space-y-2.5 pt-1 text-right">
                  {audioGuessAyahItems[currentQuestionIndex].options.map((opt, idx) => {
                    const isSelected = audioGuessSelected === idx;
                    const isCorrect = opt.isCorrect;

                    let optStyle = 'bg-white border-[#C9E1ED] hover:border-[#08B9EF] text-[#164C68]';
                    if (audioGuessFeedback && isSelected) {
                      optStyle = isCorrect
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300'
                        : 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-300';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() =>
                          handleSelectAudioGuess(idx, audioGuessAyahItems[currentQuestionIndex])
                        }
                        disabled={audioGuessFeedback !== null}
                        className={`w-full p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-xs ${optStyle}`}
                      >
                        <p dir="rtl" className="font-quran text-2xl font-bold leading-relaxed mb-1">
                          {opt.arabic}
                        </p>
                        <p dir="ltr" className="text-xs text-slate-500 font-semibold text-left">
                          {opt.latin}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback & Next */}
                {audioGuessFeedback && (
                  <div className="space-y-3 animate-in fade-in pt-1">
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                        audioGuessFeedback === 'correct'
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-rose-50 text-rose-900 border border-rose-200'
                      }`}
                    >
                      <p className="font-bold mb-1">
                        {audioGuessFeedback === 'correct'
                          ? '✨ Masya Allah, Tebakanmu Tepat Sekali!'
                          : '❌ Belum tepat, dengarkan kembali bacaan qari.'}
                      </p>
                      <p className="text-[11px] text-[#8C9BA7]">
                        "{audioGuessAyahItems[currentQuestionIndex].meaning}"
                      </p>
                    </div>

                    <Button
                      variant="green"
                      size="lg"
                      fullWidth
                      onClick={() => {
                        if (currentQuestionIndex < audioGuessAyahItems.length - 1) {
                          setCurrentQuestionIndex((prev) => prev + 1);
                          setAudioGuessSelected(null);
                          setAudioGuessFeedback(null);
                        } else {
                          handleFinishGame(25);
                        }
                      }}
                      icon={<CheckCircle2 size={18} />}
                    >
                      {currentQuestionIndex < audioGuessAyahItems.length - 1
                        ? 'Soal Ayat Berikutnya'
                        : 'Selesai & Buka Hadiah'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 2: VOICE CHALLENGE & HARAKAT HILANG */}
            {audioToAyahMode === 'voice_challenge' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-200 rounded-3xl p-4 text-xs text-rose-900 leading-relaxed">
                  <strong>Tantangan Santri Mandiri:</strong> Harakat pada ayat ini telah disembunyikan!
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
                      {currentQuestionIndex < harakatVoiceItems.length - 1
                        ? 'Tantangan Ayat Berikutnya'
                        : 'Selesai & Buka Hadiah'}
                    </Button>
                  </div>
                )}
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
      userAccount={currentUserAccount}
      onOpenUpgradeModal={onOpenUpgradeModal}
      onOpenStarShop={onOpenStarShop}
      onNavigateToLand={(tab, subView) => {
        onNavigateToLand?.(tab, subView);
      }}
      onRefreshCompanion={() => setCompanionStateVersion((v) => v + 1)}
      onLaunchMiniGame={(gameId) => handleStartGame(gameId as GameType)}
    />
  );
};
