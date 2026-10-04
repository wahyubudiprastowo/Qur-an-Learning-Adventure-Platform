import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Heart,
  Compass,
  Home,
  ChevronRight,
  Award,
  Apple,
  Droplet,
  MessageCircle,
  RefreshCw,
  Info,
  Calendar,
  Zap,
  Smile,
  Shield,
  X,
  CheckCircle2,
  Moon,
  Sun,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChildProfile, ChildAyahProgress, ChildBlockProgress } from '../../types';
import { CompanionData, StageConfig, CompanionSpecies, PetMood } from '../../types/companion';
import {
  getStageForXp,
  COMPANION_STAGES,
  COMPANION_SPECIES_LIST,
  getCompanionSpeciesConfig,
  getSpeciesStageAvatar,
} from '../../data/companionData';
import { CompanionService } from '../../services/companionService';

interface LivingCompanionCardProps {
  child: ChildProfile;
  companion: CompanionData;
  ayahProgressList: ChildAyahProgress[];
  blockProgressList: ChildBlockProgress[];
  onOpenRoom: () => void;
  onOpenWorldMap: () => void;
  onRefreshCompanion: () => void;
}

// Gentle pleasant synthesizer sounds for offline Tamagotchi care
const playTamagotchiSound = (type: 'eat' | 'pet' | 'wash' | 'water' | 'sleep' | 'wake' | 'joyful') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    if (type === 'eat') {
      [330, 440, 550].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.1);
      });
    } else if (type === 'pet') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'wash' || type === 'water') {
      [600, 750, 900, 1050].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.15, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.2);
      });
    } else if (type === 'sleep') {
      [523.25, 440, 349.23, 261.63].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.14);
        gain.gain.setValueAtTime(0.12, now + i * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.005, now + i * 0.14 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.14);
        osc.stop(now + i * 0.14 + 0.3);
      });
    } else if (type === 'wake') {
      [261.63, 329.63, 392, 523.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.15, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.09 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.2);
      });
    } else if (type === 'joyful') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    }
  } catch {
    // Ignore audio context error
  }
};

export const LivingCompanionCard: React.FC<LivingCompanionCardProps> = ({
  child,
  companion,
  ayahProgressList,
  blockProgressList,
  onOpenRoom,
  onOpenWorldMap,
  onRefreshCompanion,
}) => {
  const [actionFeedback, setActionFeedback] = useState<{
    icon: string;
    text: string;
  } | null>(null);
  const [dialogue, setDialogue] = useState(
    companion.dialogueMessage || 'Assalamu\'alaikum! Senang sekali belajar Al-Qur\'an bersamamu!'
  );
  const [showPetPicker, setShowPetPicker] = useState<boolean>(false);
  const [showGardenModal, setShowGardenModal] = useState<boolean>(false);
  const [selectedGardenDay, setSelectedGardenDay] = useState<number | null>(null);
  const [isJoyfulFeeding, setIsJoyfulFeeding] = useState<boolean>(false);
  const [happinessSurge, setHappinessSurge] = useState<number | null>(null);

  const species = companion.species || 'lumi';
  const speciesConfig = getCompanionSpeciesConfig(species);
  const stageConfig = getStageForXp(companion.xp);
  const currentAvatar = getSpeciesStageAvatar(species, stageConfig.id);

  const nextStageIdx = COMPANION_STAGES.findIndex((s) => s.id === stageConfig.id) + 1;
  const nextStage = COMPANION_STAGES[nextStageIdx] || stageConfig;
  const xpInStage = companion.xp - stageConfig.minXp;
  const xpNeededForNext = nextStage.minXp - stageConfig.minXp || 100;
  const progressPercent = Math.min(100, Math.max(10, Math.round((xpInStage / xpNeededForNext) * 100)));

  // Tamagotchi Vitals
  const hunger = companion.hunger ?? 85;
  const happiness = companion.happiness ?? 90;
  const cleanliness = companion.cleanliness ?? 95;
  const energy = companion.energy ?? 85;

  // Spaced repetition intelligent advice
  const weakAyahs = ayahProgressList.filter((a) => a.needsReview);
  let intelligentAdvice = 'Ingatan kita seperti kebun bunga, disiram murojaah setiap hari agar mekar indah!';
  if (weakAyahs.length > 0) {
    intelligentAdvice = `${companion.name} mendeteksi ada ${weakAyahs.length} ayat yang rindu kita latih lagi. Yuk murojaah sebentar! 🌙`;
  } else if (stageConfig.id === 'egg') {
    intelligentAdvice = 'Telur misterius ini terasa hangat saat mendengar suara tartil. Ayo dengarkan ayat pertama!';
  } else if (stageConfig.id === 'hatchling') {
    intelligentAdvice = `${companion.name} senang sekali sudah menetas! Suka sekali mendengar nada qari yang tartil.`;
  }

  // Tamagotchi Actions
  const handlePet = () => {
    playTamagotchiSound('pet');
    setActionFeedback({ icon: '💖', text: `Sayang ${companion.name}!` });
    const res = CompanionService.petCompanion(child.id);
    setDialogue(res.message);
    setTimeout(() => setActionFeedback(null), 1500);
    onRefreshCompanion();
  };

  const handleFeed = () => {
    if (companion.isSleeping) {
      setActionFeedback({ icon: '🌙', text: 'Bangunkan sahabat dulu!' });
      setDialogue(`Ssshh... ${companion.name} sedang tidur nyenyak. Bangunkan terlebih dahulu untuk makan! 🌙`);
      setTimeout(() => setActionFeedback(null), 2000);
      return;
    }

    const res = CompanionService.feedCompanion(child.id, 'kurma');
    if (res.success) {
      playTamagotchiSound('eat');
      setTimeout(() => playTamagotchiSound('joyful'), 220);
      try {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#F43F5E', '#FB7185', '#F59E0B', '#10B981', '#38BDF8'],
        });
      } catch {
        // Ignore
      }

      setIsJoyfulFeeding(true);
      setHappinessSurge(res.happinessGained);
      setActionFeedback({ icon: '🍯', text: `Nyam! +${res.happinessGained}% Bahagia!` });
      setDialogue(res.message);

      setTimeout(() => {
        setIsJoyfulFeeding(false);
        setHappinessSurge(null);
      }, 3000);

      setTimeout(() => setActionFeedback(null), 2200);
      onRefreshCompanion();
    } else {
      playTamagotchiSound('pet');
      setActionFeedback({ icon: '📖', text: 'Selesaikan 1 Surah!' });
      setDialogue(res.message);
      setTimeout(() => setActionFeedback(null), 2800);
    }
  };

  const handleClean = () => {
    playTamagotchiSound('wash');
    setActionFeedback({ icon: '🫧', text: 'Bersih & Suci Air Wudhu!' });
    const res = CompanionService.cleanCompanion(child.id);
    setDialogue(res.message);
    setTimeout(() => setActionFeedback(null), 1800);
    onRefreshCompanion();
  };

  const handleToggleSleep = () => {
    const willSleep = !companion.isSleeping;
    playTamagotchiSound(willSleep ? 'sleep' : 'wake');
    const res = CompanionService.toggleSleep(child.id);
    setActionFeedback({
      icon: willSleep ? '🌙' : '☀️',
      text: willSleep ? 'Tidur Nyenyak Zzz...' : 'Bangun Segar!',
    });
    setDialogue(res.message);
    setTimeout(() => setActionFeedback(null), 2000);
    onRefreshCompanion();
  };

  const handleWaterGarden = () => {
    playTamagotchiSound('water');
    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#81E850', '#08B9EF', '#FFD83E'],
      });
    } catch {
      // Ignore
    }
    const res = CompanionService.waterGarden(child.id);
    setDialogue(res.message);
    setActionFeedback({ icon: '💧', text: 'Kebun Berhasil Disiram!' });
    setTimeout(() => setActionFeedback(null), 2000);
    onRefreshCompanion();
  };

  const handleClaimWeeklyHarvest = () => {
    const res = CompanionService.claimWeeklyGardenHarvest(child.id);
    if (res.success) {
      playTamagotchiSound('pet');
      try {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFD83E', '#81E850', '#08B9EF', '#FF946F'],
        });
      } catch {
        // Ignore
      }
      setActionFeedback({ icon: '🏆', text: '+150 XP & 5 ⭐!' });
    }
    setDialogue(res.message);
    setTimeout(() => setActionFeedback(null), 2500);
    onRefreshCompanion();
  };

  const handleSelectSpecies = (newSpecies: CompanionSpecies) => {
    const config = getCompanionSpeciesConfig(newSpecies);
    CompanionService.setCompanionSpecies(child.id, newSpecies, config.defaultName);
    setShowPetPicker(false);
    onRefreshCompanion();
  };

  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const gardenDays = companion.gardenDays || [true, false, false, false, false, false, false];
  const bloomedCount = gardenDays.filter(Boolean).length;
  const currentDayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const isWeeklyHarvestClaimed = CompanionService.isWeeklyGardenHarvestClaimed(child.id, companion.gardenWeekId);

  // Plant icons for each day
  const plantIcons = ['🌱', '🌿', '🌷', '🌻', '🌸', '🌼', '🏆'];

  // Current Mood & Emotive Expression State
  const mood = companion.expression || companion.mood || CompanionService.computeMood(companion);
  const moodMap: Record<PetMood, { label: string; color: string }> = {
    celebrating: { label: '🎉 Takbir! Merayakan!', color: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 border-amber-400 font-black animate-bounce shadow-xs' },
    thoughtful: { label: '🤔 Mentadabburi Ayat...', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold shadow-xs' },
    sleeping: { label: '🌙 Istirahat Zzz', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs' },
    hungry: { label: '🍎 Sedang Lapar', color: 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse' },
    sleepy: { label: '🥱 Mengantuk', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    joyful: { label: '✨ Sangat Bahagia', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    proud: { label: '👑 Bangga Hafalan', color: 'bg-amber-50 text-amber-700 border-amber-300' },
    content: { label: '😊 Riang Tartil', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  };
  const moodInfo = moodMap[mood as PetMood] || moodMap.content;

  return (
    <div className="bg-gradient-to-b from-[#F0FAFF] via-[#E4F5FD] to-[#D5EEFB] border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm relative overflow-hidden space-y-4">
      {/* Decorative Pastel Meadow Backdrop Layer */}
      <div className="absolute top-0 right-0 left-0 h-32 bg-gradient-to-b from-cyan-100/50 to-transparent pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-[#81E850]/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -top-8 -left-8 w-36 h-36 bg-[#08B9EF]/15 rounded-full blur-2xl pointer-events-none" />

      {/* --- 1. TOP HEADER: Pet Identity, Level & Species Switcher --- */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white border border-[#C9E1ED] shadow-xs flex items-center justify-center text-2xl shrink-0">
            {child.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-[#08B9EF] uppercase tracking-wider">
                Sahabat Tamagotchi
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#81E850] animate-pulse" />
            </div>
            <h3 className="text-base font-black text-[#164C68] font-heading flex items-center gap-1.5">
              <span>{companion.name}</span>
              <span className="text-xs text-[#8C9BA7] font-bold">({speciesConfig.name})</span>
            </h3>
          </div>
        </div>

        {/* Level & Switch Pet Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowPetPicker(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-[#C9E1ED] text-[11px] font-extrabold text-[#164C68] hover:border-[#08B9EF] shadow-xs cursor-pointer active:scale-95 transition-all"
            title="Ganti Sahabat / Pet"
          >
            <RefreshCw size={12} className="text-[#08B9EF]" />
            <span className="hidden sm:inline">Pilih Pet</span>
          </button>
          <div className="flex items-center gap-1 bg-[#FFD83E]/20 border border-amber-300 rounded-xl px-2.5 py-1 text-amber-800 text-xs font-black">
            <Sparkles size={13} className="text-amber-500 fill-current" />
            <span>Lv. {companion.level}</span>
          </div>
        </div>
      </div>

      {/* --- 2. INTERACTIVE TAMAGOTCHI HABITAT & SPRITE --- */}
      <div className="bg-white/85 backdrop-blur-md border border-[#C9E1ED] rounded-3xl p-4 relative z-10 flex flex-col md:flex-row items-center gap-4">
        {/* Tamagotchi Mascot Sprite with Emotive Animations and Transitions */}
        <div className="flex flex-col items-center shrink-0">
          <div
            onClick={companion.isSleeping || mood === 'sleeping' ? handleToggleSleep : handlePet}
            className={`relative cursor-pointer select-none group flex flex-col items-center justify-center p-3 rounded-2xl border shadow-sm hover:scale-105 active:scale-95 transition-all duration-300 w-32 h-32 ${
              mood === 'celebrating'
                ? 'bg-gradient-to-b from-amber-100/90 via-yellow-50 to-white border-amber-400 ring-4 ring-amber-300/50 shadow-lg shadow-amber-300/30'
                : mood === 'thoughtful'
                ? 'bg-gradient-to-b from-emerald-50 via-teal-50/60 to-white border-emerald-300 ring-2 ring-emerald-200/60 shadow-md shadow-emerald-500/10'
                : (companion.isSleeping || mood === 'sleeping')
                ? 'bg-gradient-to-b from-indigo-950/20 via-sky-900/10 to-indigo-100/40 border-indigo-300 ring-2 ring-indigo-200/50'
                : hunger < 35
                ? 'bg-gradient-to-b from-amber-50/80 to-white border-amber-300'
                : 'bg-gradient-to-b from-white to-cyan-50/60 border-cyan-200'
            }`}
            title={
              companion.isSleeping || mood === 'sleeping'
                ? 'Sahabat sedang tidur nyenyak. Ketuk untuk membangunkan!'
                : mood === 'celebrating'
                ? 'Sedang merayakan tuntasnya surah! Ketuk untuk merayakan bersama!'
                : mood === 'thoughtful'
                ? 'Sedang mentadabburi Al-Qur\'an. Ketuk untuk mendengar hikmahnya!'
                : 'Ketuk untuk menyapa sahabatmu!'
            }
          >
            {/* Sleeping Floating Zzz animation */}
            {(companion.isSleeping || mood === 'sleeping') && (
              <div className="absolute top-2 right-3 pointer-events-none">
                <motion.span
                  animate={{ y: [0, -18], opacity: [0, 1, 0], x: [0, 6, 12] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
                  className="text-sm font-black text-indigo-500 block"
                >
                  💤
                </motion.span>
              </div>
            )}

            {/* Feedback Pop Message */}
            <AnimatePresence>
              {actionFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -10, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -top-3 z-30 bg-white border-2 border-[#08B9EF] text-[#164C68] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1"
                >
                  <span>{actionFeedback.icon}</span>
                  <span>{actionFeedback.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Living Avatar with Frame-based animations & Transitions */}
            <motion.div
              animate={
                isJoyfulFeeding
                  ? {
                      y: [0, -30, 4, -22, 2, -10, 0],
                      scale: [1, 1.35, 0.9, 1.25, 0.95, 1.1, 1],
                      rotate: [0, -14, 14, -8, 8, -4, 0],
                    }
                  : mood === 'celebrating'
                  ? {
                      y: [0, -28, 4, -22, 2, -10, 0],
                      scale: [1, 1.35, 0.95, 1.25, 1],
                      rotate: [0, -18, 18, -12, 12, 0],
                    }
                  : mood === 'thoughtful'
                  ? {
                      y: [0, -6, 0],
                      rotate: [0, -6, 0, 6, 0],
                      scale: [1, 1.05, 1],
                    }
                  : companion.isSleeping || mood === 'sleeping'
                  ? {
                      y: [0, 4, 0],
                      scale: [1, 0.96, 1],
                      rotate: [-2, 2, -2],
                    }
                  : hunger < 35
                  ? { y: [0, -5, 0], x: [-1, 1, -1] }
                  : { y: [0, -6, 0] }
              }
              transition={
                isJoyfulFeeding
                  ? { duration: 2, repeat: 1, ease: 'easeOut' }
                  : mood === 'celebrating'
                  ? { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
                  : mood === 'thoughtful'
                  ? { repeat: Infinity, duration: 3.2, ease: 'easeInOut' }
                  : { repeat: Infinity, duration: (companion.isSleeping || mood === 'sleeping') ? 3.5 : 2.4, ease: 'easeInOut' }
              }
              className={`text-6xl filter drop-shadow-md py-1 relative ${
                (companion.isSleeping || mood === 'sleeping') ? 'opacity-85' : ''
              }`}
            >
              {currentAvatar}

              {/* Celebrating floating particles & crown */}
              {mood === 'celebrating' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <motion.span
                    animate={{ y: [-15, -45], opacity: [0, 1, 0], scale: [0.8, 1.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
                    className="absolute -top-4 text-2xl"
                  >
                    👑
                  </motion.span>
                  <motion.span
                    animate={{ x: [-20, -45], y: [0, -35], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: 0.2 }}
                    className="absolute text-xl"
                  >
                    🎉
                  </motion.span>
                  <motion.span
                    animate={{ x: [20, 45], y: [0, -35], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: 0.4 }}
                    className="absolute text-xl"
                  >
                    🌟
                  </motion.span>
                </div>
              )}

              {/* Thoughtful contemplation thought bubble & Quran glow */}
              {mood === 'thoughtful' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <motion.div
                    animate={{ y: [0, -8, 0], opacity: [0.85, 1, 0.85] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className="absolute -top-6 -right-5 bg-white/95 border border-emerald-300 rounded-full px-2 py-0.5 shadow-sm text-xs flex items-center gap-0.5"
                  >
                    <span>💭</span>
                    <span>📖</span>
                  </motion.div>
                </div>
              )}

              {/* Joyful Feeding floating emoji celebration */}
              {isJoyfulFeeding && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 1, 0], y: -50, scale: 1.3 }}
                    transition={{ duration: 1.8 }}
                    className="absolute -top-3 text-2xl"
                  >
                    🍯
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: -10, y: 0 }}
                    animate={{ opacity: [0, 1, 0], x: -35, y: -38, scale: 1.2 }}
                    transition={{ duration: 1.8, delay: 0.15 }}
                    className="absolute text-xl"
                  >
                    💖
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: 10, y: 0 }}
                    animate={{ opacity: [0, 1, 0], x: 35, y: -38, scale: 1.2 }}
                    transition={{ duration: 1.8, delay: 0.25 }}
                    className="absolute text-xl"
                  >
                    ✨
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0, 1, 0], y: -65, scale: 1.4 }}
                    transition={{ duration: 2, delay: 0.35 }}
                    className="absolute text-2xl"
                  >
                    🥰
                  </motion.span>
                </div>
              )}
            </motion.div>

            <span className={`text-[10px] font-extrabold mt-1 px-2 py-0.5 rounded-full border ${isJoyfulFeeding ? 'bg-rose-100 text-rose-800 border-rose-300' : moodInfo.color}`}>
              {isJoyfulFeeding ? '🥰 Sangat Bahagia & Lahap!' : moodInfo.label}
            </span>
          </div>

          {/* Quick Pet Interaction Buttons (Makan, Sayang, Wudhu, Tidur/Bangun) */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <button
              onClick={handleFeed}
              disabled={companion.isSleeping}
              className={`p-1.5 bg-white border rounded-xl text-xs font-bold text-[#164C68] shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer transition-all relative ${
                companion.isSleeping
                  ? 'opacity-40 cursor-not-allowed border-slate-200'
                  : (companion.foodTreatsAvailable ?? 1) > 0
                  ? 'border-amber-400 bg-amber-50/80 hover:bg-amber-100 ring-1 ring-amber-300'
                  : 'border-[#C9E1ED] hover:border-amber-400 hover:bg-amber-50'
              }`}
              title={
                (companion.foodTreatsAvailable ?? 1) > 0
                  ? `Beri Makan Kurma Berkah (${companion.foodTreatsAvailable ?? 1} hidangan surah tersedia)`
                  : 'Selesaikan 1 surah lagi untuk memetik Kurma Berkah dari surga'
              }
            >
              <Apple size={14} className={(companion.foodTreatsAvailable ?? 1) > 0 ? 'text-amber-600 animate-pulse' : 'text-amber-500'} />
              <span className="text-[10px]">Makan</span>
              {(companion.foodTreatsAvailable ?? 1) > 0 && (
                <span className="text-[9px] bg-amber-500 text-white font-black px-1.5 py-0.2 rounded-full -ml-0.5">
                  {companion.foodTreatsAvailable ?? 1}
                </span>
              )}
            </button>
            <button
              onClick={handlePet}
              disabled={companion.isSleeping}
              className={`p-1.5 bg-white border rounded-xl text-xs font-bold text-[#164C68] shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer transition-all ${
                companion.isSleeping ? 'opacity-40 cursor-not-allowed border-slate-200' : 'border-[#C9E1ED] hover:border-rose-400 hover:bg-rose-50'
              }`}
              title="Usap & Sayang"
            >
              <Heart size={14} className="text-rose-500 fill-rose-500" />
              <span className="text-[10px]">Sayang</span>
            </button>
            <button
              onClick={handleClean}
              disabled={companion.isSleeping}
              className={`p-1.5 bg-white border rounded-xl text-xs font-bold text-[#164C68] shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer transition-all ${
                companion.isSleeping ? 'opacity-40 cursor-not-allowed border-slate-200' : 'border-[#C9E1ED] hover:border-cyan-400 hover:bg-cyan-50'
              }`}
              title="Mandikan Air Wudhu"
            >
              <Droplet size={14} className="text-cyan-500" />
              <span className="text-[10px]">Wudhu</span>
            </button>
            <button
              onClick={handleToggleSleep}
              className={`p-1.5 bg-white border rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer transition-all ${
                companion.isSleeping
                  ? 'border-amber-400 bg-amber-50/80 text-amber-700 ring-1 ring-amber-300'
                  : 'border-[#C9E1ED] hover:border-indigo-400 hover:bg-indigo-50 text-[#164C68]'
              }`}
              title={companion.isSleeping ? 'Bangunkan Sahabat' : 'Tidurkan Sahabat untuk Istirahat'}
            >
              {companion.isSleeping ? (
                <>
                  <Sun size={14} className="text-amber-500" />
                  <span className="text-[10px]">Bangun</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-indigo-500" />
                  <span className="text-[10px]">Tidur</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Speech Bubble & Tamagotchi Status Vitals */}
        <div className="flex-1 space-y-3 w-full text-left">
          {/* Pet Dialogue Speech Bubble */}
          <div className="bg-white border border-[#C9E1ED] rounded-2xl p-3 shadow-xs relative">
            <p className="text-xs text-[#164C68] font-bold leading-relaxed">
              "{dialogue}"
            </p>
            <p className="text-[10px] text-[#8C9BA7] font-medium mt-1.5 flex items-center gap-1.5 pt-1 border-t border-slate-100">
              <span>💡</span>
              <span>{intelligentAdvice}</span>
            </p>
          </div>

          {/* Tamagotchi Vitals Gauge (Kenyang, Bahagia, Kebersihan, Energi) */}
          <div className="grid grid-cols-2 gap-2 bg-[#F6FBFF] p-2.5 rounded-2xl border border-[#C9E1ED]/70">
            {/* Hunger */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-black text-[#164C68]">
                <span className="flex items-center gap-1">
                  <span>🍎</span> Kenyang Energi
                </span>
                <span>{hunger}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${hunger}%` }}
                />
              </div>
            </div>

            {/* Happiness Bar with Joyful Surge and Animation */}
            <motion.div
              animate={
                isJoyfulFeeding
                  ? { scale: [1, 1.05, 1], backgroundColor: ['#FFF1F2', '#FFE4E6', '#FFF1F2'] }
                  : {}
              }
              transition={{ duration: 0.8, repeat: isJoyfulFeeding ? 2 : 0 }}
              className={`space-y-1 p-1 rounded-xl transition-all relative ${
                isJoyfulFeeding ? 'ring-2 ring-rose-400 bg-rose-50 shadow-xs' : ''
              }`}
            >
              {happinessSurge !== null && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: -16 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-2.5 right-0.5 text-[9px] font-black text-rose-600 bg-white border border-rose-300 px-1.5 py-0.2 rounded-full shadow-xs flex items-center gap-0.5 z-20"
                >
                  +{happinessSurge}% Bahagia! 💖
                </motion.span>
              )}

              <div className="flex items-center justify-between text-[10px] font-black text-[#164C68]">
                <span className="flex items-center gap-1">
                  <span>💖</span> Bahagia
                </span>
                <span className={isJoyfulFeeding ? 'text-rose-600 font-black' : ''}>
                  {happiness}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-rose-400 to-pink-500 h-full rounded-full transition-all duration-500"
                  animate={{ width: `${happiness}%` }}
                />
              </div>
            </motion.div>

            {/* Cleanliness */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-black text-[#164C68]">
                <span className="flex items-center gap-1">
                  <span>🫧</span> Kesucian
                </span>
                <span>{cleanliness}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${cleanliness}%` }}
                />
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-black text-[#164C68]">
                <span className="flex items-center gap-1">
                  <span>⚡</span> Semangat
                </span>
                <span>{energy}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${energy}%` }}
                />
              </div>
            </div>
          </div>

          {/* XP Progress Bar to Next Stage */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-black text-[#164C68]">
              <span>Tumbuh: {companion.xp} XP</span>
              <span className="text-[#8C9BA7]">
                Menuju {nextStage.name} ({nextStage.minXp} XP)
              </span>
            </div>
            <div className="w-full bg-[#E2EEF5] h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-[#08B9EF] to-[#81E850] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. KEBUN BELAJAR MINGGUAN (INTERACTIVE HABIT GARDEN) --- */}
      <div className="bg-white/85 border border-[#C9E1ED] rounded-2xl p-3.5 relative z-10 space-y-2.5">
        {/* Header & Purpose Tooltip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#164C68] text-xs flex items-center gap-1.5">
              <span>🌱</span> Kebun Belajar Mingguan
            </span>
            <button
              onClick={() => setShowGardenModal(true)}
              className="text-[#8C9BA7] hover:text-[#08B9EF] transition-colors cursor-pointer"
              title="Penjelasan Kebun Belajar"
            >
              <Info size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {bloomedCount}/7 Hari Mekar
            </span>
          </div>
        </div>

        {/* Clear Purpose Subtitle */}
        <p className="text-[10px] text-[#8C9BA7] leading-relaxed font-medium">
          Membiasakan hafalan harian tanpa beban. Setiap hari belajar, benih mekar jadi bunga indah. Istiqomah 5-7 hari membuka <strong>Piala Emas & Hadiah Mingguan 🏆</strong>!
        </p>

        {/* Weekly Istiqomah Progress Indicator */}
        <div className="space-y-1 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2">
          <div className="flex items-center justify-between text-[10px] font-black text-emerald-900">
            <span className="flex items-center gap-1">
              <span>🌾</span>
              <span>Progres Panen Raya Sepekan</span>
            </span>
            <span>{Math.round((bloomedCount / 7) * 100)}%</span>
          </div>
          <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(bloomedCount / 7) * 100}%` }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
            />
          </div>
          <div className="flex items-center justify-between text-[9px] text-emerald-800 font-bold pt-0.5">
            <span>{bloomedCount >= 5 ? '🎉 Target Istiqomah Tercapai!' : `Kurang ${5 - bloomedCount} hari lagi untuk Piala Panen`}</span>
            <span>Target: min. 5 Hari</span>
          </div>
        </div>

        {/* 7-Day Interactive Garden Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {dayNames.map((day, idx) => {
            const isBloomed = gardenDays[idx];
            const isToday = idx === currentDayIdx;
            const isSunday = idx === 6;

            return (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                key={day}
                onClick={() => {
                  setSelectedGardenDay(idx);
                  setShowGardenModal(true);
                }}
                className={`py-2 px-1 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col items-center justify-between min-h-[58px] ${
                  isSunday && isBloomed
                    ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-sm ring-2 ring-amber-300/40'
                    : isBloomed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                    : isToday
                    ? 'bg-cyan-50 border-[#08B9EF] text-[#164C68] ring-2 ring-cyan-200'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {/* Day name */}
                <span className="text-[10px] font-black block leading-none">{day}</span>

                {/* Plant Sprite */}
                <span className="text-xl block my-0.5">
                  {isSunday
                    ? isBloomed
                      ? '🏆'
                      : '🎁'
                    : isBloomed
                    ? plantIcons[idx]
                    : isToday
                    ? '🌱'
                    : '🌰'}
                </span>

                {/* State Tag */}
                <span className="text-[8px] font-black uppercase tracking-tight block">
                  {isSunday ? (isBloomed ? 'Piala' : 'Klaim') : isBloomed ? 'Mekar' : isToday ? 'Hari Ini' : 'Benih'}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Weekly Harvest Claim Action if eligible (5+ days) */}
        {bloomedCount >= 5 && (
          <div>
            {!isWeeklyHarvestClaimed ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleClaimWeeklyHarvest}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 font-black text-xs shadow-md shadow-amber-400/30 flex items-center justify-center gap-2 cursor-pointer border border-amber-300 ring-2 ring-amber-300/40 animate-pulse"
              >
                <Trophy size={16} className="text-amber-800" />
                <span>🏆 KLAIM PIALA PANEN RAYA! (+150 XP & 5 ⭐)</span>
              </motion.button>
            ) : (
              <div className="w-full py-2 px-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-extrabold flex items-center justify-center gap-1.5">
                <CheckCircle2 size={14} className="text-amber-600" />
                <span>Piala Panen Raya Pekan Ini Sudah Diklaim (+150 XP & 5 ⭐)</span>
              </div>
            )}
          </div>
        )}

        {/* Quick Water Button */}
        {!companion.gardenWateredToday ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleWaterGarden}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <Droplet size={14} className="fill-white" />
            <span>Siram Kebun Hari Ini (+15 XP & 1 Benih)</span>
          </motion.button>
        ) : (
          <div className="w-full py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] flex items-center justify-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Tanaman Hari Ini Sudah Segar Disiram Embun Tartil</span>
          </div>
        )}
      </div>

      {/* --- 4. ACTION SHORTCUTS: Kamar Lumi & Peta Petualangan --- */}
      <div className="grid grid-cols-2 gap-2.5 relative z-10 pt-1">
        <button
          onClick={onOpenRoom}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-white border border-[#C9E1ED] hover:border-[#08B9EF] text-[#164C68] font-bold text-xs shadow-xs hover:bg-cyan-50/50 transition-all cursor-pointer"
        >
          <Home size={16} className="text-[#08B9EF]" />
          <span>Kamar Sahabat</span>
        </button>

        <button
          onClick={onOpenWorldMap}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-r from-[#08B9EF] to-[#07a6d7] text-white font-black text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Compass size={16} />
          <span>Peta Dunia & Petualangan</span>
        </button>
      </div>

      {/* --- MODAL 1: CHOOSE / SWITCH TAMAGOTCHI PET --- */}
      <AnimatePresence>
        {showPetPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-[#C9E1ED] shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-[#08B9EF] uppercase tracking-wider block">
                    Pilih Sahabat Tamagotchi
                  </span>
                  <h3 className="text-base font-black text-[#164C68] font-heading">
                    Ganti Karakter Sahabat
                  </h3>
                </div>
                <button
                  onClick={() => setShowPetPicker(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {COMPANION_SPECIES_LIST.map((pet) => {
                  const isCurrent = (companion.species || 'lumi') === pet.id;
                  return (
                    <div
                      key={pet.id}
                      onClick={() => handleSelectSpecies(pet.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                        isCurrent
                          ? 'border-[#08B9EF] bg-cyan-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-cyan-300 bg-white'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs text-3xl flex items-center justify-center shrink-0">
                        {pet.avatarIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-[#164C68] font-heading">
                            {pet.name}
                          </h4>
                          {isCurrent && (
                            <span className="text-[9px] font-bold bg-[#08B9EF] text-white px-2 py-0.5 rounded-full">
                              Dipilih
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#08B9EF] font-bold mt-0.5">
                          {pet.nature}
                        </p>
                        <p className="text-[10px] text-[#8C9BA7] font-medium mt-0.5 leading-relaxed line-clamp-2">
                          {pet.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: DETAIL KEBUN BELAJAR MINGGUAN (PURPOSE & PARAMETERS) --- */}
      <AnimatePresence>
        {showGardenModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-[#C9E1ED] shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">
                      Panduan & Parameter
                    </span>
                    <h3 className="text-base font-black text-[#164C68] font-heading">
                      Kebun Belajar Mingguan
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowGardenModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* What is it for? (Tujuan) */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5 text-xs">
                <h4 className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-600" />
                  <span>Untuk Apa Kebun Belajar Ini?</span>
                </h4>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                  Kebun Belajar mendidik anak membangun <strong>kebiasaan istiqomah hafalan harian</strong>. Rasulullah ﷺ bersabda bahwa amalan yang paling dicintai Allah adalah yang istiqomah walaupun sedikit. Tidak perlu memaksakan hafalan banyak, cukup 5–10 menit per hari!
                </p>
              </div>

              {/* How it works & Parameters */}
              <div className="space-y-2 text-xs">
                <h4 className="font-extrabold text-[#164C68]">Parameter & Cara Kerja:</h4>
                <ul className="space-y-2 text-[11px] text-[#164C68]">
                  <li className="flex items-start gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="text-base">🌷</span>
                    <div>
                      <strong>Mekar Harian:</strong> Selesaikan minimal 1 sesi belajar (Dengar Qari, Ziyadah, Murojaah, atau Arena Game). Benih hari itu akan mekar jadi bunga.
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="text-base">💧</span>
                    <div>
                      <strong>Siram Kebun:</strong> Ketuk tombol siram setiap hari untuk menyiram tanaman, menambah +15 XP dan 1 Benih Cahaya.
                    </div>
                  </li>
                  <li className="flex items-start gap-2 bg-amber-50 p-2 rounded-xl border border-amber-200">
                    <span className="text-base">🏆</span>
                    <div>
                      <strong>Piala Panen Mingguan:</strong> Jika dalam seminggu anak istiqomah 5–7 hari, hari Minggu akan mekar <strong>Piala Emas</strong> dengan hadiah +150 XP, 5 Bintang Kebaikan, dan Kartu Hikmah Langka!
                    </div>
                  </li>
                </ul>
              </div>

              {/* Day specific status if clicked */}
              {selectedGardenDay !== null && (
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#164C68]">
                    <span>Hari {dayNames[selectedGardenDay]}</span>
                    <span>
                      {gardenDays[selectedGardenDay] ? '✅ Sudah Mekar' : '⏳ Belum Belajar'}
                    </span>
                  </div>
                  <p className="text-[10px] text-cyan-800 leading-relaxed">
                    {gardenDays[selectedGardenDay]
                      ? 'Alhamdulillah! Tanaman di hari ini sudah mekar berkat latihan hafalan yang tekun.'
                      : 'Yuk buka menu Tahfiz atau Game untuk mekarkan benih di hari ini!'}
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setShowGardenModal(false);
                  if (!companion.gardenWateredToday) {
                    handleWaterGarden();
                  }
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 cursor-pointer"
              >
                {!companion.gardenWateredToday
                  ? '💧 Siram Kebun Hari Ini (+15 XP)'
                  : 'Tutup & Lanjut Belajar'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
