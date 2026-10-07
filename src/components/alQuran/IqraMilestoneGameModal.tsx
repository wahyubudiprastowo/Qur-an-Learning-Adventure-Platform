import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Sparkles,
  Trophy,
  Volume2,
  CheckCircle2,
  RotateCcw,
  PartyPopper,
  Zap,
  HelpCircle,
  Flame,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IQRA_1_PAGES } from '../../data/iqraBook1Data';
import { IQRA_2_PAGES } from '../../data/iqraBook2Data';
import { IQRA_3_PAGES } from '../../data/iqraBook3Data';
import { IQRA_4_PAGES } from '../../data/iqraBook4Data';
import { IQRA_5_PAGES } from '../../data/iqraBook5Data';
import { IQRA_6_PAGES } from '../../data/iqraBook6Data';

export type GameMode = 'flash' | 'mystery' | 'puzzle' | 'tajwid';

interface IqraMilestoneGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeJilid: string; // '1' | '2' | '3' | '4' | '5' | '6'
  pageNumber: number;
  childId: string;
  onEarnReward: (stars: number, xp: number) => void;
  speakArabic: (text: string) => void;
}

interface QuestionItem {
  prompt: string;
  targetArabic: string;
  targetLatin?: string;
  options: { arabic: string; latin?: string }[];
  correctIndex: number;
  explanation?: string;
  puzzleParts?: string[]; // For word assemble game
}

export const IqraMilestoneGameModal: React.FC<IqraMilestoneGameModalProps> = ({
  isOpen,
  onClose,
  activeJilid,
  pageNumber,
  onEarnReward,
  speakArabic,
}) => {
  // Determine default recommended game based on milestone page
  const defaultMode: GameMode = useMemo(() => {
    const mod = pageNumber % 20;
    if (mod === 5) return 'flash';
    if (mod === 10) return 'mystery';
    if (mod === 15) return 'puzzle';
    return 'tajwid';
  }, [pageNumber]);

  const [activeMode, setActiveMode] = useState<GameMode>(defaultMode);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);

  // For Puzzle Game Mode (assembled user parts)
  const [assembledParts, setAssembledParts] = useState<string[]>([]);

  // Collect pool of items from the 5 preceding pages of current Jilid
  const questionPool = useMemo(() => {
    let pages = IQRA_1_PAGES;
    if (activeJilid === '2') pages = IQRA_2_PAGES;
    if (activeJilid === '3') pages = IQRA_3_PAGES;
    if (activeJilid === '4') pages = IQRA_4_PAGES;
    if (activeJilid === '5') pages = IQRA_5_PAGES;
    if (activeJilid === '6') pages = IQRA_6_PAGES;

    // Filter pages up to current page, focusing on last 5 pages
    const startPage = Math.max(1, pageNumber - 4);
    const relevantPages = pages.filter(
      (p) => p.pageNumber >= startPage && p.pageNumber <= pageNumber
    );

    const allItems: { arabic: string; latin?: string }[] = [];
    relevantPages.forEach((p) => {
      p.rows.forEach((r) => {
        r.items.forEach((item) => {
          if (item.arabic && item.arabic.trim().length > 0 && !item.arabic.includes('=')) {
            allItems.push({ arabic: item.arabic.trim(), latin: item.latin });
          }
        });
      });
    });

    if (allItems.length < 4) {
      // Fallback items if sparse
      allItems.push(
        { arabic: 'أَ', latin: 'A' },
        { arabic: 'بَ', latin: 'Ba' },
        { arabic: 'تَ', latin: 'Ta' },
        { arabic: 'ثَ', latin: 'Tsa' },
        { arabic: 'جَ', latin: 'Ja' }
      );
    }

    return allItems;
  }, [activeJilid, pageNumber]);

  // Generate 5 structured questions based on mode
  const questions: QuestionItem[] = useMemo(() => {
    if (questionPool.length < 4) return [];

    const generated: QuestionItem[] = [];
    const poolCopy = [...questionPool].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 5; i++) {
      const target = poolCopy[i % poolCopy.length];
      const distractors = questionPool
        .filter((item) => item.arabic !== target.arabic)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const allOptions = [target, ...distractors].sort(() => Math.random() - 0.5);
      const correctIdx = allOptions.findIndex((opt) => opt.arabic === target.arabic);

      // Tailored prompts according to game mode
      let prompt = `Dengarkan dan temukan bacaan:`;
      let puzzleParts: string[] | undefined = undefined;

      if (activeMode === 'flash') {
        prompt = `Tunjuk Cepat! Manakah kotak yang berbunyi seperti ini:`;
      } else if (activeMode === 'mystery') {
        prompt = `Buka Peti Rahasia! Dengarkan suara lalu pilih peti yang tepat:`;
      } else if (activeMode === 'puzzle') {
        prompt = `Susun potongan huruf berikut menjadi kata yang benar:`;
        // Split target into syllables/characters if feasible
        const cleaned = target.arabic.replace(/\s+/g, '');
        if (cleaned.length >= 2) {
          const part1 = cleaned.slice(0, Math.ceil(cleaned.length / 2));
          const part2 = cleaned.slice(Math.ceil(cleaned.length / 2));
          puzzleParts = [part1, part2].sort(() => Math.random() - 0.5);
        } else {
          puzzleParts = [cleaned];
        }
      } else if (activeMode === 'tajwid') {
        if (activeJilid === '1') prompt = `Detektif Hijaiyah: Temukan huruf yang cocok:`;
        else if (activeJilid === '2') prompt = `Detektif Huruf Sambung: Manakah bacaan yang tepat:`;
        else if (activeJilid === '3') prompt = `Detektif Kasrah & Dhommah: Temukan bacaan ini:`;
        else if (activeJilid === '4') prompt = `Detektif Sukun & Qalqalah: Temukan bacaan ini:`;
        else if (activeJilid === '5') prompt = `Detektif Alif Lam & Waqaf: Temukan bacaan ini:`;
        else prompt = `Detektif Nun/Mim Mati & Tajwid: Temukan bacaan ini:`;
      }

      generated.push({
        prompt,
        targetArabic: target.arabic,
        targetLatin: target.latin,
        options: allOptions,
        correctIndex: correctIdx,
        puzzleParts,
      });
    }

    return generated;
  }, [questionPool, activeMode, activeJilid]);

  const currentQ = questions[currentRound] || questions[0];

  // Auto-pronounce target sound when round changes
  useEffect(() => {
    if (isOpen && currentQ && !isGameFinished) {
      const timer = setTimeout(() => {
        speakArabic(currentQ.targetArabic);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentRound, currentQ, activeMode, isGameFinished, speakArabic]);

  // Reset round state
  const resetRound = useCallback(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setAssembledParts([]);
  }, []);

  const handleStartGameMode = (mode: GameMode) => {
    setActiveMode(mode);
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setIsGameFinished(false);
    resetRound();
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
    } else {
      setStreak(0);
    }

    // Auto advance after short pause
    setTimeout(() => {
      if (currentRound + 1 < questions.length) {
        setCurrentRound((r) => r + 1);
        resetRound();
      } else {
        // Game finished!
        setIsGameFinished(true);
        const finalStars = score + (isCorrect ? 1 : 0);
        onEarnReward(finalStars, finalStars * 10);
        try {
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.5 },
          });
        } catch {}
      }
    }, 1200);
  };

  // For Puzzle Game Mode: handle clicking puzzle part bubbles
  const handlePuzzlePartClick = (part: string) => {
    if (isAnswered) return;
    const newAssembled = [...assembledParts, part];
    setAssembledParts(newAssembled);

    // If assembled all parts, check correctness
    const joined = newAssembled.join('');
    const targetClean = currentQ.targetArabic.replace(/\s+/g, '');
    if (joined === targetClean || newAssembled.length >= (currentQ.puzzleParts?.length || 1)) {
      setIsAnswered(true);
      const isCorrect = joined === targetClean;
      if (isCorrect) {
        setScore((s) => s + 1);
        setStreak((st) => st + 1);
        try {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        } catch {}
      } else {
        setStreak(0);
      }

      setTimeout(() => {
        if (currentRound + 1 < questions.length) {
          setCurrentRound((r) => r + 1);
          resetRound();
        } else {
          setIsGameFinished(true);
          const finalStars = score + (isCorrect ? 1 : 0);
          onEarnReward(finalStars, finalStars * 10);
          try {
            confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
          } catch {}
        }
      }, 1300);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border-2 border-indigo-300 relative"
        >
          {/* Top Banner Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner border border-white/30">
                🎮
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] uppercase tracking-wider">
                    Milestone Tiap 5 Halaman ⭐
                  </span>
                  <span className="text-xs font-bold text-indigo-100">
                    Halaman {pageNumber} (Jilid {activeJilid})
                  </span>
                </div>
                <h3 className="text-lg font-black font-heading leading-tight mt-0.5">
                  Zona Game & Tantangan Ceria Santri
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Game Modes Selector Tabs */}
          <div className="p-2 bg-indigo-50/70 border-b border-indigo-100 flex gap-1.5 overflow-x-auto shrink-0">
            {[
              { id: 'flash', label: '⚡ Tunjuk Kilat', icon: Zap },
              { id: 'mystery', label: '🕵️ Peti Misteri', icon: HelpCircle },
              { id: 'puzzle', label: '🧩 Susun Huruf', icon: Sparkles },
              { id: 'tajwid', label: '🎯 Detektif Tajwid', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleStartGameMode(tab.id as GameMode)}
                  className={`flex-1 min-w-[110px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                      : 'text-indigo-900/70 hover:text-indigo-900 hover:bg-indigo-100/60'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Game Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {!isGameFinished ? (
              <>
                {/* Score & Streak Header */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      Ronde {currentRound + 1} dari 5
                    </span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            i < currentRound
                              ? 'bg-emerald-500 text-white'
                              : i === currentRound
                              ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-600 font-black text-xs">
                      <Star size={15} className="fill-amber-400 text-amber-500" />
                      <span>{score} Bintang</span>
                    </div>
                    {streak > 1 && (
                      <div className="flex items-center gap-1 text-orange-600 font-black text-xs bg-orange-100 px-2 py-0.5 rounded-full animate-bounce">
                        <Flame size={14} className="fill-orange-500" />
                        <span>Streak {streak}x!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Prompt Box */}
                {currentQ && (
                  <div className="text-center space-y-3 py-1">
                    <div className="text-xs sm:text-sm font-bold text-slate-600">
                      {currentQ.prompt}
                    </div>

                    {/* Spoken target button with sound wave animation */}
                    <motion.button
                      type="button"
                      onClick={() => speakArabic(currentQ.targetArabic)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-amber-950 font-black text-sm shadow-md shadow-amber-400/30 cursor-pointer border-2 border-amber-200"
                    >
                      <Volume2 size={18} className="animate-pulse" />
                      <span>Putar Ulang Suara 🔊</span>
                    </motion.button>
                  </div>
                )}

                {/* Render Mode 1, 2, 4 (Multiple Choice Cards) */}
                {activeMode !== 'puzzle' && currentQ && (
                  <div className="grid grid-cols-2 gap-3 pt-2" dir="rtl">
                    {currentQ.options.map((option, idx) => {
                      const isChosen = selectedOption === idx;
                      const isCorrect = idx === currentQ.correctIndex;

                      let cardStyle =
                        'bg-white hover:bg-indigo-50/60 border-slate-200 hover:border-indigo-400 text-slate-800 shadow-2xs';

                      if (isAnswered) {
                        if (isCorrect) {
                          cardStyle =
                            'bg-emerald-50 border-emerald-500 text-emerald-950 ring-3 ring-emerald-400/50 scale-[1.02] shadow-md';
                        } else if (isChosen) {
                          cardStyle =
                            'bg-red-50 border-red-400 text-red-950 opacity-70';
                        } else {
                          cardStyle = 'bg-slate-50 border-slate-200 opacity-40';
                        }
                      }

                      return (
                        <motion.button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectOption(idx)}
                          disabled={isAnswered}
                          whileHover={!isAnswered ? { scale: 1.02 } : {}}
                          whileTap={!isAnswered ? { scale: 0.98 } : {}}
                          className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer select-none relative overflow-hidden ${cardStyle}`}
                        >
                          {/* Chest Icon for Mystery Mode */}
                          {activeMode === 'mystery' && !isAnswered && (
                            <div className="text-xl mb-1 text-center" dir="ltr">
                              🎁
                            </div>
                          )}

                          <div className="font-quran text-2xl sm:text-3xl font-bold leading-normal">
                            {option.arabic}
                          </div>

                          {isAnswered && isCorrect && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 left-2 text-emerald-600"
                              dir="ltr"
                            >
                              <CheckCircle2 size={18} />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Render Mode 3 (Puzzle Word Assembly) */}
                {activeMode === 'puzzle' && currentQ && (
                  <div className="space-y-4 pt-2">
                    {/* Assembly Workbench Display */}
                    <div className="bg-amber-50/80 border-2 border-dashed border-amber-300 rounded-2xl p-4 text-center min-h-[90px] flex flex-col items-center justify-center">
                      <span className="text-[11px] font-bold text-amber-800 mb-1">
                        Kotak Susun Kata:
                      </span>
                      <div className="flex items-center gap-2" dir="rtl">
                        {assembledParts.length > 0 ? (
                          assembledParts.map((p, i) => (
                            <span
                              key={i}
                              className="font-quran text-3xl font-black text-amber-950 bg-white px-3 py-1 rounded-xl shadow-xs border border-amber-300"
                            >
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Ketuk gelembung potongan huruf di bawah secara berurutan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Clickable Puzzle Bubbles */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2" dir="rtl">
                      {currentQ.puzzleParts?.map((part, pIdx) => (
                        <motion.button
                          key={pIdx}
                          type="button"
                          onClick={() => handlePuzzlePartClick(part)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.94 }}
                          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-quran text-3xl font-bold shadow-md shadow-indigo-600/30 border-2 border-indigo-400 cursor-pointer"
                        >
                          {part}
                        </motion.button>
                      ))}
                    </div>

                    <div className="text-center pt-2">
                      <button
                        onClick={() => setAssembledParts([])}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>Reset Susunan Huruf</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Victory Screen */
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4 py-4"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 text-amber-950 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-amber-400/40 animate-bounce">
                  🏆
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs uppercase tracking-wider">
                    🎉 Milestone Selesai!
                  </span>
                  <h3 className="text-2xl font-black text-[#164C68] font-heading mt-2">
                    Luar Biasa, Ananda Berhasil!
                  </h3>
                  <p className="text-xs text-[#627D98] max-w-sm mx-auto">
                    Tantangan Mini-Game Halaman {pageNumber} telah berhasil diselesaikan dengan penuh semangat!
                  </p>
                </div>

                {/* Reward Card */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 max-w-sm mx-auto text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Skor Tantangan:</span>
                    <span className="text-base font-black text-amber-700">
                      {score} dari 5 Jawaban Tepat ⭐
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Bonus XP Santri:</span>
                    <span className="text-base font-black text-emerald-600">
                      +{score * 10 + 20} XP Terkumpul 🌟
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Lencana Keberhasilan:</span>
                    <span className="text-xs font-black text-indigo-700">
                      Bintang Milestone Hal {pageNumber} 🎖️
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 max-w-sm mx-auto pt-2">
                  <button
                    onClick={() => handleStartGameMode(activeMode)}
                    className="flex-1 py-3 rounded-2xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw size={15} />
                    <span>Main Lagi</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-102"
                  >
                    <PartyPopper size={15} />
                    <span>Lanjut Mengaji 🚀</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium shrink-0">
            Mini-Game ceria hadir tiap 5 halaman untuk menjaga semangat & rasa penasaran santri 🌟
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
