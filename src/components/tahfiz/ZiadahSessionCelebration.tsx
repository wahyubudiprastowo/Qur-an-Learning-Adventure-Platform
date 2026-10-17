import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Star, Sparkles, CheckCircle2, RotateCcw, ArrowRight, Heart, Award, Medal } from 'lucide-react';
import { SoundEffects } from '../../services/soundEffects';
import { AchievementBadge } from '../../types';

interface ZiadahSessionCelebrationProps {
  isOpen: boolean;
  onClose?: () => void;
  surahName: string;
  totalBlocks: number;
  totalAyahs: number;
  starsEarned: number;
  xpEarned: number;
  companionName?: string;
  companionAvatar?: string;
  totalSessionsCount?: number;
  newBadgeUnlocked?: AchievementBadge | null;
  nextMedalTitle?: string;
  nextMedalIcon?: string;
  sessionsUntilNextMedal?: number;
  progressToNextMedalPercent?: number;
  onRepeatSession?: () => void;
  onFinish: () => void;
}

export const ZiadahSessionCelebration: React.FC<ZiadahSessionCelebrationProps> = ({
  isOpen,
  surahName,
  totalBlocks,
  totalAyahs,
  starsEarned,
  xpEarned,
  companionName = 'Lumi',
  companionAvatar = '🌟',
  totalSessionsCount = 1,
  newBadgeUnlocked,
  nextMedalTitle = 'Hafiz Cilik',
  nextMedalIcon = '🏅',
  sessionsUntilNextMedal = 4,
  progressToNextMedalPercent = 20,
  onRepeatSession,
  onFinish,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // 1. Play celebratory fanfare audio
    SoundEffects.playFanfareSound();

    // 2. Multi-wave colorful confetti cannon bursts
    try {
      // Wave 1: Center blast
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#08B9EF', '#FFD83E', '#81E850', '#B797F6', '#FF7A50'],
      });

      // Wave 2: Left cannon at 280ms
      const t1 = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0.05, y: 0.65 },
          colors: ['#FFD83E', '#81E850', '#08B9EF'],
        });
      }, 280);

      // Wave 3: Right cannon at 550ms
      const t2 = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 0.95, y: 0.65 },
          colors: ['#FF7A50', '#B797F6', '#FFD83E'],
        });
      }, 550);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } catch (e) {
      // Fallback gracefully if canvas is unavailable
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          className="bg-white border-2 border-amber-300 rounded-3xl max-w-sm sm:max-w-md w-full shadow-2xl text-center relative overflow-hidden font-sans p-6 sm:p-7 space-y-4.5"
        >
          {/* Animated Background Glow Orbs */}
          <div className="absolute -top-14 -left-14 w-36 h-36 bg-amber-200/50 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-14 -right-14 w-36 h-36 bg-cyan-200/50 rounded-full blur-3xl pointer-events-none animate-pulse" />

          {/* Floating Confetti Badges */}
          <div className="flex justify-center -space-x-2 pt-1">
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0ms' }}>🎉</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '150ms' }}>✨</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '300ms' }}>🏆</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '200ms' }}>⭐</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '400ms' }}>🎈</span>
          </div>

          {/* Trophy Badge */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 rounded-full blur-md opacity-70 animate-pulse" />
            <div className="relative w-22 h-22 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white">
              <Trophy size={42} className="text-amber-950 fill-amber-300 drop-shadow-xs" />
            </div>
            <div className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1.5 shadow-xs border border-white">
              <Sparkles size={16} />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1">
            <span className="inline-block px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-300">
              Masya Allah, Tabarakallah!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#164C68] font-heading tracking-tight">
              Sesi Hafalan Tuntas!
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Kamu telah menyelesaikan seluruh blok sesi latihan{' '}
              <strong className="text-[#164C68] font-bold">Surah {surahName}</strong>.
            </p>
          </div>

          {/* Session Summary Cards */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">Bintang</span>
              <div className="flex items-center gap-1 text-lg font-black text-amber-700 mt-0.5 font-heading">
                <Star size={18} className="fill-amber-400 text-amber-500" />
                <span>+{starsEarned}</span>
              </div>
            </div>

            <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-200 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-tight">Poin XP</span>
              <div className="flex items-center gap-1 text-lg font-black text-[#08B9EF] mt-0.5 font-heading">
                <Sparkles size={18} />
                <span>+{xpEarned}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-tight">Blok Selesai</span>
              <div className="flex items-center gap-1 text-lg font-black text-emerald-700 mt-0.5 font-heading">
                <CheckCircle2 size={18} />
                <span>{totalBlocks} Blok</span>
              </div>
            </div>
          </div>

          {/* Digital Medal Badge Achievement / Milestone Progress */}
          {newBadgeUnlocked ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="p-3.5 bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-100 rounded-2xl border-2 border-amber-400 shadow-sm text-left relative overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white flex items-center justify-center text-2xl shadow-md shrink-0 animate-bounce">
                  {newBadgeUnlocked.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white tracking-wider">
                      ✨ MEDALI DIGITAL BARU!
                    </span>
                    <span className="text-[9px] font-bold text-amber-800">
                      Sesi ke-{newBadgeUnlocked.sessionsMilestone}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-amber-950 font-heading mt-0.5">
                    {newBadgeUnlocked.title}
                  </h3>
                  <p className="text-[10px] text-amber-800 font-medium line-clamp-2">
                    {newBadgeUnlocked.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="text-base">{nextMedalIcon}</span>
                  <span>Menuju Medali: <strong className="text-slate-900">{nextMedalTitle}</strong></span>
                </span>
                <span className="font-black text-blue-600 font-mono text-[11px]">
                  {totalSessionsCount} Sesi Tuntas
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNextMedalPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Kelipatan 5 sesi hafalan</span>
                <span className="font-bold text-amber-700">Kurang {sessionsUntilNextMedal} sesi lagi! 🎯</span>
              </div>
            </div>
          )}

          {/* Companion Cheerful Message */}
          <div className="p-3 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl border border-purple-200 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-2xl bg-white border border-purple-200 flex items-center justify-center text-2xl shadow-xs shrink-0 animate-bounce">
              {companionAvatar}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider block">
                {companionName} Bersorak Gembira:
              </span>
              <p className="text-xs text-slate-700 font-semibold leading-snug">
                "Hebat sekali! Hafalanmu makin lancar dan mutqin. Ayo jaga terus semangat tilawahnya ya! 💖"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onFinish}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>Alhamdulillah, Selesai!</span>
              <ArrowRight size={18} />
            </button>

            {onRepeatSession && (
              <button
                onClick={onRepeatSession}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw size={14} />
                <span>Ulangi Sesi Latihan Ini</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
