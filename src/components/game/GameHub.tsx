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
import { SoundEffects } from '../../services/soundEffects';
import { getAyahAudioUrl } from '../../data/recitersData';
import { GlobalAudioManager } from '../../services/audioService';
import { Button } from '../common/Button';
import { RewardModal } from '../common/RewardModal';
import { WorldMapView } from '../companion/WorldMapView';
import { SantriDuelArena } from './SantriDuelArena';
import { VoiceSttModal } from '../voice/VoiceSttModal';
import { UserAccount } from '../../types';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import {
  QuestionFactory,
  ContinueAyahQuestion,
  ArrangeAyahQuestion,
  MissingWordQuestion,
  MatchingRound,
  HijaiyahSoundQuestion,
  AudioGuessAyahQuestion,
  HarakatVoiceItem,
  TajwidBasketQuestion,
  DetectiveSurahQuestion,
} from '../../services/questionFactory';

export type GameType =
  | 'santri_duel'
  | 'voice_stt'
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
  const [showVoiceSttModal, setShowVoiceSttModal] = useState<boolean>(false);
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
    const earnedStars = CompanionService.getGameStarReward(childId);
    const today = new Date().toISOString().split('T')[0];

    StorageService.recordPoints(
      childId,
      'GAME',
      earnedXp,
      earnedStars,
      `Bermain game Qur'an: ${activeGame}`,
      'game_session',
      `${activeGame || 'game'}_${today}_${Date.now()}`
    );

    const gameTitles: Record<string, string> = {
      santri_duel: 'Duel Kuis Santri ⚔️',
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
    SoundEffects.playFanfareSound();
    triggerPopConfetti();
    setShowCelebration(true);
  };

  // -------------------------------------------------------------
  // DYNAMIC QUESTIONS (Urutan 4: QuestionFactory)
  // Generated from unified Learning Graph, spaced repetition & vocabulary
  // -------------------------------------------------------------
  const [continueAyahItems, setContinueAyahItems] = useState<ContinueAyahQuestion[]>(() =>
    QuestionFactory.generateContinueAyahQuestions(childId)
  );
  const [arrangeAyahItems, setArrangeAyahItems] = useState<ArrangeAyahQuestion[]>(() =>
    QuestionFactory.generateArrangeAyahItems(childId)
  );
  const [missingWordItems, setMissingWordItems] = useState<MissingWordQuestion[]>(() =>
    QuestionFactory.generateMissingWordQuestions(childId)
  );
  const [matchingRounds, setMatchingRounds] = useState<MatchingRound[]>(() =>
    QuestionFactory.generateArabicMatchingRounds(childId)
  );
  const [matchingRoundIndex, setMatchingRoundIndex] = useState<number>(0);
  const currentMatchingSet = matchingRounds[matchingRoundIndex] || matchingRounds[0];
  const matchingPairs = currentMatchingSet?.pairs || [];

  const [hijaiyahSoundItems, setHijaiyahSoundItems] = useState<HijaiyahSoundQuestion[]>(() =>
    QuestionFactory.generateHijaiyahSoundItems(childId)
  );
  const [audioToAyahData, setAudioToAyahData] = useState(() =>
    QuestionFactory.generateAudioToAyahItems(childId)
  );
  const audioGuessAyahItems = audioToAyahData.listenGuess;
  const harakatVoiceItems = audioToAyahData.harakatVoice;

  const [tajwidBasketItems, setTajwidBasketItems] = useState<TajwidBasketQuestion[]>(() =>
    QuestionFactory.generateTajwidClassificationItems(childId)
  );
  const [detectiveSurahItems, setDetectiveSurahItems] = useState<DetectiveSurahQuestion[]>(() =>
    QuestionFactory.generateGuessSurahItems()
  );

  const renderEmptyGameState = (title: string, desc: string) => (
    <div className="bg-white rounded-3xl border-2 border-dashed border-[#C9E1ED] p-8 text-center space-y-4 max-w-md mx-auto my-6 shadow-sm animate-in fade-in">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-xs">
        📖
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-black text-[#164C68] font-heading">
          {title}
        </h3>
        <p className="text-xs text-[#8C9BA7] leading-relaxed font-medium">
          {desc}
        </p>
      </div>
      <button
        onClick={() => {
          setActiveGame(null);
          onNavigateToLand?.('tahfiz');
        }}
        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <span>Pilih Surah untuk Dihafal</span>
        <ChevronRight size={14} />
      </button>
    </div>
  );

  // Start selected game
  const handleStartGame = (gameId: GameType) => {
    if (gameId === 'voice_stt') {
      setShowVoiceSttModal(true);
      return;
    }
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

    // Dynamically regenerate calibrated questions for chosen game
    if (gameId === 'continue_ayah') {
      const items = QuestionFactory.generateContinueAyahQuestions(childId);
      setContinueAyahItems(items);
    } else if (gameId === 'arrange_ayah') {
      const items = QuestionFactory.generateArrangeAyahItems(childId);
      setArrangeAyahItems(items);
      if (items.length > 0) {
        setPlacedWords([]);
        setAvailableWords([...items[0].scrambledWords]);
        setArrangeFeedback(null);
      }
    } else if (gameId === 'missing_word') {
      const items = QuestionFactory.generateMissingWordQuestions(childId);
      setMissingWordItems(items);
    } else if (gameId === 'arabic_matching') {
      const rounds = QuestionFactory.generateArabicMatchingRounds(childId);
      setMatchingRounds(rounds);
    } else if (gameId === 'hijaiyah_sound') {
      const items = QuestionFactory.generateHijaiyahSoundItems(childId);
      setHijaiyahSoundItems(items);
    } else if (gameId === 'audio_to_ayah') {
      const data = QuestionFactory.generateAudioToAyahItems(childId);
      setAudioToAyahData(data);
    } else if (gameId === 'tajwid_class') {
      const items = QuestionFactory.generateTajwidClassificationItems(childId);
      setTajwidBasketItems(items);
    } else if (gameId === 'guess_surah') {
      const items = QuestionFactory.generateGuessSurahItems();
      setDetectiveSurahItems(items);
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
    const isCorrect = idx === item.correctIndex;

    // Write back to unified curriculum graph
    if (item.nodeId && childId) {
      StorageService.updateNodeMastery(childId, item.nodeId, {
        score: isCorrect ? 100 : 0,
      });
    }

    if (isCorrect) {
      SoundEffects.playCorrectSound();
      SoundEffects.playRewardSound();
      setSambungFeedback('correct');
      setScore((s) => s + 15);
      triggerPopConfetti();
      playQariAudio(item.audioInfo.surah, item.audioInfo.ayah);
    } else {
      SoundEffects.playWrongSound();
      setSambungFeedback('wrong');
    }
  };

  // 2. Susun Ayat Handlers
  const handleAddWordToSlot = (word: string, index: number) => {
    if (arrangeFeedback === 'correct') return;
    SoundEffects.playClickSound();
    speakHijaiyah(word);
    setPlacedWords((prev) => [...prev, word]);
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
    setArrangeFeedback(null);
  };

  const handleRemoveWordFromSlot = (word: string, index: number) => {
    if (arrangeFeedback === 'correct') return;
    SoundEffects.playClickSound();
    setPlacedWords((prev) => prev.filter((_, i) => i !== index));
    setAvailableWords((prev) => [...prev, word]);
    setArrangeFeedback(null);
  };

  const handleShuffleArrangeWords = () => {
    if (arrangeFeedback === 'correct') return;
    SoundEffects.playClickSound();
    setAvailableWords((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleResetArrangeWords = (item: any) => {
    if (arrangeFeedback === 'correct') return;
    SoundEffects.playClickSound();
    setPlacedWords([]);
    setAvailableWords([...item.scrambledWords]);
    setArrangeFeedback(null);
  };

  const handleCheckArrangement = (item: any) => {
    const isCorrect = placedWords.join(' ') === item.correctWords.join(' ');

    if (item.nodeId && childId) {
      StorageService.updateNodeMastery(childId, item.nodeId, {
        score: isCorrect ? 100 : 0,
      });
    }

    if (isCorrect) {
      SoundEffects.playCorrectSound();
      SoundEffects.playRewardSound();
      setArrangeFeedback('correct');
      setScore((s) => s + 20);
      triggerPopConfetti();
      playQariAudio(item.audioInfo.surah, item.audioInfo.ayah);
    } else {
      SoundEffects.playWrongSound();
      setArrangeFeedback('wrong');
    }
  };

  // 3. Kata Hilang Handler
  const handleSelectMissing = (idx: number, item: any) => {
    if (missingFeedback) return;
    setMissingSelected(idx);
    const isCorrect = idx === item.correctIndex;

    if (item.nodeId && childId) {
      StorageService.updateNodeMastery(childId, item.nodeId, {
        score: isCorrect ? 100 : 0,
      });
    }

    if (isCorrect) {
      SoundEffects.playCorrectSound();
      SoundEffects.playRewardSound();
      setMissingFeedback('correct');
      setScore((s) => s + 15);
      triggerPopConfetti();
      playQariAudio(item.audioInfo.surah, item.audioInfo.ayah);
    } else {
      SoundEffects.playWrongSound();
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
        SoundEffects.playCorrectSound();
        SoundEffects.playRewardSound();
        const nextSet = new Set([...matchedPairs, idx]);
        setMatchedPairs(nextSet);
        setScore((s) => s + 10);
        setSelectedArabicIndex(null);
        setSelectedMeaningIndex(null);
        triggerPopConfetti();

        if (currentMatchingSet?.nodeId && childId) {
          StorageService.updateNodeMastery(childId, currentMatchingSet.nodeId, {
            score: 100,
          });
        }

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
        SoundEffects.playWrongSound();
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
        SoundEffects.playCorrectSound();
        SoundEffects.playRewardSound();
        const nextSet = new Set([...matchedPairs, idx]);
        setMatchedPairs(nextSet);
        setScore((s) => s + 10);
        setSelectedArabicIndex(null);
        setSelectedMeaningIndex(null);
        triggerPopConfetti();

        if (currentMatchingSet?.nodeId && childId) {
          StorageService.updateNodeMastery(childId, currentMatchingSet.nodeId, {
            score: 100,
          });
        }

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
        SoundEffects.playWrongSound();
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

    if (item.nodeId && childId) {
      StorageService.updateNodeMastery(childId, item.nodeId, {
        score: chosen.isCorrect ? 100 : 0,
      });
    }

    if (chosen.isCorrect) {
      SoundEffects.playCorrectSound();
      SoundEffects.playRewardSound();
      setAudioGuessFeedback('correct');
      setScore((s) => s + 20);
      triggerPopConfetti();
    } else {
      SoundEffects.playWrongSound();
      setAudioGuessFeedback('wrong');
    }
  };

  // 5. Tebak Suara Huruf Handler
  const handleSelectHijaiyah = (idx: number, item: any) => {
    if (hijaiyahFeedback) return;
    setHijaiyahSelected(idx);
    const isCorrect = item.options[idx].correct;

    if (item.nodeId && childId) {
      StorageService.updateNodeMastery(childId, item.nodeId, {
        score: isCorrect ? 100 : 0,
      });
    }

    if (isCorrect) {
      SoundEffects.playCorrectSound();
      SoundEffects.playRewardSound();
      setHijaiyahFeedback('correct');
      setScore((s) => s + 15);
      triggerPopConfetti();
    } else {
      SoundEffects.playWrongSound();
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
      SoundEffects.playCorrectSound();
      SoundEffects.playRewardSound();
      setScore((s) => s + 25);
      triggerPopConfetti();

      if (item.nodeId && childId) {
        StorageService.updateNodeMastery(childId, item.nodeId, {
          score: 100,
        });
      }

      // Play audio confirmation
      playQariAudio(item.audioInfo.surah, item.audioInfo.ayah);
    }
  };

  // 7. Klasifikasi Tajwid Handler
  const handleSelectTajwidBucket = (bucketId: string, item: any) => {
    if (tajwidFeedback) return;
    setSelectedTajwidBucket(bucketId);
    const chosen = item.buckets.find((b: any) => b.id === bucketId);
    const isCorrect = chosen?.isCorrect ?? false;

    if (item.nodeId && childId) {
      StorageService.updateNodeMastery(childId, item.nodeId, {
        score: isCorrect ? 100 : 0,
      });
    }

    if (isCorrect) {
      SoundEffects.playCorrectSound();
      SoundEffects.playRewardSound();
      setTajwidFeedback('correct');
      setScore((s) => s + 15);
      triggerPopConfetti();
    } else {
      SoundEffects.playWrongSound();
      setTajwidFeedback('wrong');
    }
  };

  // 8. Detektif Surah Handler
  const handleSelectSurahGuess = (idx: number, item: any) => {
    if (surahGuessFeedback) return;
    setSurahGuessSelected(idx);
    const isCorrect = idx === item.correctIndex;

    if (item.nodeId && childId) {
      StorageService.updateNodeMastery(childId, item.nodeId, {
        score: isCorrect ? 100 : 0,
      });
    }

    if (isCorrect) {
      SoundEffects.playCorrectSound();
      SoundEffects.playRewardSound();
      setSurahGuessFeedback('correct');
      const bonus = unlockedClues === 1 ? 25 : unlockedClues === 2 ? 15 : 10;
      setScore((s) => s + bonus);
      triggerPopConfetti();
      playQariAudio(item.audioInfo.surah, item.audioInfo.ayah);
    } else {
      SoundEffects.playWrongSound();
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
  if (activeGame === 'santri_duel') {
    return (
      <SantriDuelArena
        childId={childId}
        onBack={() => setActiveGame(null)}
        onFinish={(finalScore) => {
          setScore(finalScore);
          setShowCelebration(true);
        }}
      />
    );
  }

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
          continueAyahItems.length === 0 ? (
            renderEmptyGameState(
              'Belum Ada Blok Hafalan Aktif',
              'Game Sambung Ayat men-drill hafalan aktifmu. Yuk pilih surah yang ingin kamu hafal terlebih dahulu!'
            )
          ) : (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>🔗</span> Sambung Ayat
              </span>
              <span>Soal {currentQuestionIndex + 1} dari {continueAyahItems.length}</span>
            </div>

            {/* Source Label Badge */}
            {continueAyahItems[currentQuestionIndex]?.sourceLabel && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-xs">
                <Sparkles size={12} className="text-emerald-600" />
                <span>{continueAyahItems[currentQuestionIndex].sourceLabel}</span>
              </div>
            )}

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
          )
        )}

        {/* 2. SUSUN AYAT (Interactive Puzzle Arrange) */}
        {activeGame === 'arrange_ayah' && (
          arrangeAyahItems.length === 0 ? (
            renderEmptyGameState(
              'Belum Ada Materi Susun Ayat',
              'Game Susun Ayat melatih urutan hafalanmu. Yuk pilih surah untuk dihafal terlebih dahulu!'
            )
          ) : (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>🧩</span> Susun Kata Menjadi Ayat
              </span>
              <span>{arrangeAyahItems[currentQuestionIndex].surah}</span>
            </div>

            {/* Source Label Badge */}
            {arrangeAyahItems[currentQuestionIndex]?.sourceLabel && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-xs">
                <Sparkles size={12} className="text-emerald-600" />
                <span>{arrangeAyahItems[currentQuestionIndex].sourceLabel}</span>
              </div>
            )}

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
          )
        )}

        {/* 3. KATA YANG HILANG (Missing Word Detective) */}
        {activeGame === 'missing_word' && (
          missingWordItems.length === 0 ? (
            renderEmptyGameState(
              'Belum Ada Materi Kata Hilang',
              'Game Kata Hilang men-drill ingatan spaced repetition hafalanmu. Yuk pilih surah untuk dihafal terlebih dahulu!'
            )
          ) : (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>🔍</span> Kata yang Hilang
              </span>
              <span>{missingWordItems[currentQuestionIndex].surah}</span>
            </div>

            {/* Source Label Badge */}
            {missingWordItems[currentQuestionIndex]?.sourceLabel && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-xs">
                <Sparkles size={12} className="text-emerald-600" />
                <span>{missingWordItems[currentQuestionIndex].sourceLabel}</span>
              </div>
            )}

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
          )
        )}

        {/* 4. COCOKKAN KATA & ARTI (2-Column Memory Matcher) */}
        {activeGame === 'arabic_matching' && (
          matchingPairs.length === 0 ? (
            renderEmptyGameState(
              'Belum Ada Materi Cocokkan Kata',
              'Game ini melatih kosakata dan nama surah Al-Qur\'an. Yuk mulai materi belajar terlebih dahulu!'
            )
          ) : (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>🎯</span> Cocokkan Kata Arab & Artinya
              </span>
              <span>
                {matchedPairs.size} dari {matchingPairs.length} Terpasang
              </span>
            </div>

            {/* Source Label Badge */}
            {currentMatchingSet?.sourceLabel && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-xs">
                <Sparkles size={12} className="text-emerald-600" />
                <span>{currentMatchingSet.sourceLabel}</span>
              </div>
            )}

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
          )
        )}

        {/* 5. TEBAK SUARA HURUF (Hijaiyah Phonics Lab) */}
        {activeGame === 'hijaiyah_sound' && (
          hijaiyahSoundItems.length === 0 ? (
            renderEmptyGameState(
              'Belum Ada Materi Suara Hijaiyah',
              'Game ini melatih makharijul huruf dari materi Iqra. Yuk mulai bacaan Iqra terlebih dahulu!'
            )
          ) : (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>🎧</span> Tebak Suara Huruf
              </span>
              <span>Soal {currentQuestionIndex + 1} dari {hijaiyahSoundItems.length}</span>
            </div>

            {/* Source Label Badge */}
            {hijaiyahSoundItems[currentQuestionIndex]?.sourceLabel && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-xs">
                <Sparkles size={12} className="text-emerald-600" />
                <span>{hijaiyahSoundItems[currentQuestionIndex].sourceLabel}</span>
              </div>
            )}

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
          )
        )}

        {/* 6. DENGAR & PILIH AYAT / TANTANGAN HARAKAT HILANG */}
        {activeGame === 'audio_to_ayah' && (
          (audioToAyahMode === 'listen_guess' ? audioGuessAyahItems : harakatVoiceItems).length === 0 ? (
            renderEmptyGameState(
              'Belum Ada Materi Audio Ayat',
              'Game ini melatih ketajaman menyimak bacaan tartil Qari. Yuk pilih surah Juz 30 terlebih dahulu!'
            )
          ) : (
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

            {/* Source Label Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-xs">
              <Sparkles size={12} className="text-emerald-600" />
              <span>
                {audioToAyahMode === 'listen_guess'
                  ? audioGuessAyahItems[currentQuestionIndex]?.sourceLabel || 'Dari: Juz 30 Audio Tartil'
                  : harakatVoiceItems[currentQuestionIndex]?.sourceLabel || 'Dari: Juz 30 Tartil & Tajwid'}
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
          )
        )}

        {/* 7. KLASIFIKASI TAJWID (Basket Sorter) */}
        {activeGame === 'tajwid_class' && (
          tajwidBasketItems.length === 0 ? (
            renderEmptyGameState(
              'Belum Ada Materi Tajwid Aktif',
              'Game Klasifikasi Tajwid melatih hukum bacaan yang sedang kamu pelajari. Yuk buka materi Tajwid terlebih dahulu!'
            )
          ) : (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>🏷️</span> Klasifikasi Hukum Tajwid
              </span>
              <span>Soal {currentQuestionIndex + 1} dari {tajwidBasketItems.length}</span>
            </div>

            {/* Source Label Badge */}
            {tajwidBasketItems[currentQuestionIndex]?.sourceLabel && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-xs">
                <Sparkles size={12} className="text-emerald-600" />
                <span>{tajwidBasketItems[currentQuestionIndex].sourceLabel}</span>
              </div>
            )}

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
          )
        )}

        {/* 8. DETEKTIF SURAH (Clue Guessing) */}
        {activeGame === 'guess_surah' && (
          detectiveSurahItems.length === 0 ? (
            renderEmptyGameState(
              'Belum Ada Materi Detektif Surah',
              'Game Detektif Surah mengambil informasi dari 114 Surah Al-Qur\'an.'
            )
          ) : (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-xs text-[#8C9BA7]">
              <span className="font-heading font-extrabold text-[#164C68] flex items-center gap-1.5">
                <span>💡</span> Detektif Surah Rahasia
              </span>
              <span>Soal {currentQuestionIndex + 1} dari {detectiveSurahItems.length}</span>
            </div>

            {/* Source Label Badge */}
            {detectiveSurahItems[currentQuestionIndex]?.sourceLabel && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-xs">
                <Sparkles size={12} className="text-emerald-600" />
                <span>{detectiveSurahItems[currentQuestionIndex].sourceLabel}</span>
              </div>
            )}

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
          )
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
    <>
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

      {/* Guided Voice AI Speech-to-Text Modal */}
      <VoiceSttModal
        isOpen={showVoiceSttModal}
        onClose={() => setShowVoiceSttModal(false)}
        childId={childId}
      />
    </>
  );
};
