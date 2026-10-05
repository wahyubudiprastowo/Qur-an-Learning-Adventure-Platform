import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Lock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Star,
  MapPin,
  Trophy,
  ArrowRight,
  Gift,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChildProfile } from '../../types';
import { CompanionData, WorldLand, StageConfig } from '../../types/companion';
import { WORLD_LANDS, getStageForXp } from '../../data/companionData';
import { CompanionSprite } from './CompanionSprite';
import { WorldLandVisual } from './WorldLandVisuals';
import { RewardStarVisual, RewardOrbVisual } from './ObjectVisuals';

interface AdventureTrailMapProps {
  child: ChildProfile;
  companion: CompanionData;
  onNavigateToLand: (tab: 'tahfiz' | 'alquran', subView?: string) => void;
  onSelectLandModal?: (land: WorldLand) => void;
}

// Simple Web Audio synthesizer for playful offline children's game SFX
const playChimeSound = (type: 'jump' | 'chest' | 'lock') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    if (type === 'jump') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'chest') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.25, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.3);
      });
    } else if (type === 'lock') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch {
    // Ignore audio context error if disabled in browser
  }
};

interface TrailPoint {
  id: string;
  landIndex: number;
  x: number;
  y: number;
  biomeTheme: string;
  stars: number;
}

// 10 Island Points arranged in an adventure mountain ascent (from Bottom start at Lake to Top summit Castle)
const TRAIL_POINTS: TrailPoint[] = [
  { id: 'recitation_lake', landIndex: 0, x: 190, y: 1220, biomeTheme: 'Danau Tartil', stars: 3 },
  { id: 'memory_mountain', landIndex: 1, x: 95, y: 1090, biomeTheme: 'Bukit Ziadah', stars: 3 },
  { id: 'moon_valley', landIndex: 2, x: 285, y: 960, biomeTheme: 'Lembah Malam', stars: 3 },
  { id: 'echo_cave', landIndex: 3, x: 105, y: 800, biomeTheme: 'Gua Kristal', stars: 3 },
  { id: 'iqra_village', landIndex: 4, x: 275, y: 670, biomeTheme: 'Desa Ceria', stars: 3 },
  { id: 'tajwid_forest', landIndex: 5, x: 100, y: 540, biomeTheme: 'Hutan Rindang', stars: 3 },
  { id: 'quran_river', landIndex: 6, x: 280, y: 390, biomeTheme: 'Aliran Sungai', stars: 3 },
  { id: 'word_garden', landIndex: 7, x: 110, y: 270, biomeTheme: 'Taman Bahasa', stars: 3 },
  { id: 'wisdom_library', landIndex: 8, x: 270, y: 160, biomeTheme: 'Menara Buku', stars: 3 },
  { id: 'story_camp', landIndex: 9, x: 190, y: 55, biomeTheme: 'Puncak Mahkota', stars: 3 },
];

export const AdventureTrailMap: React.FC<AdventureTrailMapProps> = ({
  child,
  companion,
  onNavigateToLand,
  onSelectLandModal,
}) => {
  // Highest unlocked level index based on child's current level
  const highestUnlockedIndex = Math.max(
    0,
    WORLD_LANDS.findIndex((l) => l.levelRequired > child.level) === -1
      ? WORLD_LANDS.length - 1
      : WORLD_LANDS.findIndex((l) => l.levelRequired > child.level) - 1
  );

  const [activeLevelIdx, setActiveLevelIdx] = useState<number>(highestUnlockedIndex);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [openedChest, setOpenedChest] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const stageConfig: StageConfig = getStageForXp(companion.xp);
  const activeLand = WORLD_LANDS[activeLevelIdx];
  const activePoint = TRAIL_POINTS[activeLevelIdx];
  const isLandLocked = child.level < activeLand.levelRequired;

  // Trigger celebration confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#08B9EF', '#81E850', '#FFD83E', '#B797F6', '#FF946F'],
      });
    } catch {
      // Ignore
    }
  };

  const handleSelectLevel = (index: number) => {
    if (index === activeLevelIdx) return;
    setIsJumping(true);
    setActiveLevelIdx(index);

    if (child.level >= WORLD_LANDS[index].levelRequired) {
      playChimeSound('jump');
      triggerCelebration();
    } else {
      playChimeSound('lock');
      setToastMessage(`🔒 Capai Level ${WORLD_LANDS[index].levelRequired} untuk membuka wilayah ini!`);
      setTimeout(() => setToastMessage(null), 3000);
    }

    setTimeout(() => {
      setIsJumping(false);
    }, 600);
  };

  const handleStepNext = () => {
    if (activeLevelIdx < WORLD_LANDS.length - 1) {
      handleSelectLevel(activeLevelIdx + 1);
    }
  };

  const handleStepPrev = () => {
    if (activeLevelIdx > 0) {
      handleSelectLevel(activeLevelIdx - 1);
    }
  };

  const handleJumpToMyLevel = () => {
    handleSelectLevel(highestUnlockedIndex);
  };

  const handleOpenChest = (chestId: number) => {
    setOpenedChest(chestId);
    playChimeSound('chest');
    triggerCelebration();
    setToastMessage('🎉 Selamat! Kamu menemukan Peti Hadiah Kejutan (+50 XP & 1 Benih Cahaya)!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Build the continuous SVG serpentine trail path
  const buildSerpentinePath = () => {
    let d = `M ${TRAIL_POINTS[0].x} ${TRAIL_POINTS[0].y}`;
    for (let i = 0; i < TRAIL_POINTS.length - 1; i++) {
      const p1 = TRAIL_POINTS[i];
      const p2 = TRAIL_POINTS[i + 1];
      const midY = (p1.y + p2.y) / 2;
      d += ` C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-[#164C68] text-white text-xs font-bold py-2.5 px-4 rounded-2xl shadow-xl border-2 border-[#FFD83E] flex items-center gap-2 max-w-sm text-center"
          >
            <span className="text-base">🌟</span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Adventure Diorama World Canvas */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border-3 border-[#7dd3fc] select-none bg-gradient-to-b from-[#7dd3fc] via-[#bae6fd] to-[#bbf7d0]">
        {/* World Scenery: Floating Clouds, Mountains & Sun */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Glowing Sun */}
          <div className="absolute top-4 right-8 w-20 h-20 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-200 blur-[1px] shadow-[0_0_40px_rgba(251,191,36,0.6)] flex items-center justify-center text-3xl">
            ☀️
          </div>

          {/* Drifting Clouds */}
          <motion.div
            animate={{ x: [-20, 30, -20] }}
            transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
            className="absolute top-12 left-6 text-4xl opacity-80"
          >
            ☁️
          </motion.div>
          <motion.div
            animate={{ x: [30, -30, 30] }}
            transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
            className="absolute top-36 right-16 text-3xl opacity-75"
          >
            ☁️
          </motion.div>
          <motion.div
            animate={{ x: [-15, 20, -15] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
            className="absolute top-80 left-10 text-3xl opacity-70"
          >
            ☁️
          </motion.div>

          {/* Rainbow in the sky */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-72 h-36 border-t-8 border-rose-300/40 rounded-t-full pointer-events-none" />
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-68 h-34 border-t-8 border-amber-300/40 rounded-t-full pointer-events-none" />
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-32 border-t-8 border-emerald-300/40 rounded-t-full pointer-events-none" />

          {/* Mountain silhouettes in background */}
          <div className="absolute bottom-96 left-0 right-0 h-40 opacity-25 flex justify-between pointer-events-none">
            <span className="text-7xl">🏔️</span>
            <span className="text-8xl">⛰️</span>
            <span className="text-7xl">🏔️</span>
          </div>

          {/* Lush Greenery & Floral Details at Bottom */}
          <div className="absolute bottom-4 left-4 text-2xl opacity-80">🌱</div>
          <div className="absolute bottom-8 right-6 text-2xl opacity-80">🌷</div>
          <div className="absolute bottom-20 left-10 text-2xl opacity-80">🌳</div>
          <div className="absolute bottom-32 right-12 text-2xl opacity-80">🌲</div>
          <div className="absolute bottom-52 left-4 text-2xl opacity-75">🌸</div>
          <div className="absolute bottom-72 right-4 text-2xl opacity-75">🌿</div>
        </div>

        {/* Top Floating Game Dashboard HUD */}
        <div className="relative z-20 m-3 sm:m-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#08B9EF] via-[#07a6d7] to-[#81E850] flex items-center justify-center text-xl shadow-md text-white"
            >
              🧭
            </motion.div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#08B9EF]">
                  Peta Petualangan
                </span>
                <span className="bg-[#81E850] text-[#164C68] text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  Level {child.level}
                </span>
              </div>
              <h3 className="text-sm font-black font-heading text-[#164C68]">
                Jalur Khatam 10 Wilayah
              </h3>
            </div>
          </div>

          {/* Shortcut to child's level */}
          <button
            onClick={handleJumpToMyLevel}
            className="py-1 px-3 rounded-xl bg-gradient-to-r from-[#08B9EF] to-[#07a6d7] text-white font-black text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CompanionSprite species={companion.species || 'lumi'} stage={stageConfig.id} mood="content" size={20} />
            <span>Posisiku</span>
          </button>
        </div>

        {/* --- ADVENTURE TRAIL SVG CANVAS (380 x 1320 coordinate space) --- */}
        <div className="relative w-full overflow-hidden" style={{ minHeight: '1320px' }}>
          <svg
            viewBox="0 0 380 1320"
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="xMidYMin slice"
          >
            <defs>
              {/* Golden Road Gradient */}
              <linearGradient id="roadGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#81E850" />
                <stop offset="40%" stopColor="#38bdf8" />
                <stop offset="80%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              {/* Shadow Filter */}
              <filter id="roadShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#047857" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* 1. Serpentine Road Base (Ground shadow & border) */}
            <path
              d={buildSerpentinePath()}
              fill="none"
              stroke="#0f766e"
              strokeWidth="28"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
              filter="url(#roadShadow)"
            />

            {/* 2. Main Cobblestone Road Ribbon */}
            <path
              d={buildSerpentinePath()}
              fill="none"
              stroke="url(#roadGradient)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 3. Stepping Stone Dash Highlights */}
            <path
              d={buildSerpentinePath()}
              fill="none"
              stroke="#ffffff"
              strokeWidth="5"
              strokeDasharray="10 14"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Paw Prints along the trail */}
            {TRAIL_POINTS.map((pt, i) => {
              if (i === TRAIL_POINTS.length - 1) return null;
              const nextPt = TRAIL_POINTS[i + 1];
              const midX = (pt.x + nextPt.x) / 2;
              const midY = (pt.y + nextPt.y) / 2;
              return (
                <text
                  key={`paw-${i}`}
                  x={midX}
                  y={midY}
                  fontSize="12"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  opacity="0.75"
                >
                  🐾
                </text>
              );
            })}
          </svg>

          {/* Interactive Treasure Chest 1 between Level 3 & 4 */}
          <div
            className="absolute z-20"
            style={{
              left: '50%',
              top: '880px',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleOpenChest(1)}
              className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-lg flex flex-col items-center justify-center cursor-pointer relative"
              title="Peti Hadiah Kejutan Bintang!"
            >
              <div className="flex items-center justify-center">
                {openedChest === 1 ? <RewardOrbVisual size={32} /> : <RewardStarVisual size={32} />}
              </div>
              <span className="text-[9px] font-black text-[#164C68] bg-white/90 px-1 rounded-full -bottom-2 absolute border border-amber-300 shadow-xs">
                {openedChest === 1 ? 'Terbuka' : 'Bonus'}
              </span>
            </motion.button>
          </div>

          {/* Interactive Treasure Chest 2 between Level 6 & 7 */}
          <div
            className="absolute z-20"
            style={{
              left: '50%',
              top: '460px',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleOpenChest(2)}
              className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-400 to-pink-300 border-2 border-white shadow-lg flex flex-col items-center justify-center cursor-pointer relative"
              title="Peti Hadiah Kejutan Orb Cahaya!"
            >
              <div className="flex items-center justify-center">
                {openedChest === 2 ? <RewardStarVisual size={32} /> : <RewardOrbVisual size={32} />}
              </div>
              <span className="text-[9px] font-black text-[#164C68] bg-white/90 px-1 rounded-full -bottom-2 absolute border border-purple-300 shadow-xs">
                {openedChest === 2 ? 'Terbuka' : 'Bonus'}
              </span>
            </motion.button>
          </div>

          {/* START MARKER at Bottom */}
          <div
            className="absolute z-10"
            style={{
              left: `${TRAIL_POINTS[0].x}px`,
              top: `${TRAIL_POINTS[0].y + 55}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider py-1 px-3 rounded-full shadow-md border-2 border-white flex items-center gap-1">
              <span>🚀</span>
              <span>MULAI PETUALANGAN</span>
            </div>
          </div>

          {/* FINISH SUMMIT CASTLE at Top */}
          <div
            className="absolute z-10"
            style={{
              left: `${TRAIL_POINTS[9].x}px`,
              top: `${TRAIL_POINTS[9].y - 48}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-[#164C68] font-black text-[10px] uppercase tracking-wider py-1 px-3 rounded-full shadow-md border-2 border-white flex items-center gap-1">
              <span>👑</span>
              <span>PUNCAK MAHKOTA HAFIZ</span>
            </div>
          </div>

          {/* RENDER 10 ISLAND NODES */}
          {TRAIL_POINTS.map((pt, idx) => {
            const land = WORLD_LANDS[idx];
            const isLocked = child.level < land.levelRequired;
            const isSelected = activeLevelIdx === idx;
            const isCompleted = child.level >= land.levelRequired;

            // X and Y are in pixels inside the 380px grid
            // Convert to percentage of 380 so it's fully responsive on all screens
            const leftPercent = (pt.x / 380) * 100;

            return (
              <div
                key={land.id}
                className="absolute z-20"
                style={{
                  left: `${leftPercent}%`,
                  top: `${pt.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="relative flex flex-col items-center">
                  {/* Active Golden Aura Ripple */}
                  {isSelected && (
                    <motion.div
                      className="absolute -inset-3 rounded-full border-3 border-[#FFD83E] pointer-events-none"
                      animate={{
                        scale: [1, 1.25, 1],
                        opacity: [0.9, 0.2, 0.9],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.8,
                        ease: 'easeInOut',
                      }}
                    />
                  )}

                  {/* LUMI COMPANION STANDING ON THE ACTIVE ISLAND */}
                  {isSelected && (
                    <motion.div
                      layoutId="lumi-companion"
                      initial={false}
                      animate={{
                        y: isJumping ? -35 : [0, -6, 0],
                        scale: isJumping ? 1.25 : 1,
                        rotate: isJumping ? [0, -10, 10, 0] : 0,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 280,
                        damping: 18,
                        y: isJumping
                          ? { duration: 0.35 }
                          : { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
                      }}
                      className="absolute -top-16 z-30 pointer-events-none flex flex-col items-center"
                    >
                      {/* Speech Bubble */}
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/95 text-[#164C68] font-black text-[9px] px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap mb-0.5 border-2 border-[#FFD83E] flex items-center gap-1"
                      >
                        <Sparkles size={10} className="text-amber-500" />
                        <span>Ayo Belajar di Sini!</span>
                      </motion.div>

                      {/* Mascot Character Avatar */}
                      <div className="filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.35)] flex items-center justify-center">
                        <CompanionSprite species={companion.species || 'lumi'} stage={stageConfig.id} mood="content" size={46} />
                      </div>
                    </motion.div>
                  )}

                  {/* 3D ISLAND PEDESTAL BUTTON */}
                  <motion.button
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleSelectLevel(idx)}
                    className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex flex-col items-center justify-center relative shadow-xl cursor-pointer transition-all border-3 ${
                      isSelected
                        ? 'border-[#FFD83E] bg-gradient-to-tr ' +
                          land.color +
                          ' shadow-[0_8px_0_#b45309] text-white ring-4 ring-[#FFD83E]/50'
                        : isLocked
                        ? 'border-slate-300 bg-slate-100 shadow-[0_6px_0_#94a3b8] text-slate-400'
                        : 'border-white bg-gradient-to-tr ' +
                          land.color +
                          ' shadow-[0_7px_0_#0f766e] text-white'
                    }`}
                  >
                    {/* 3D Island Diorama Visual matching uploaded PNGs */}
                    <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center filter drop-shadow-sm">
                      <WorldLandVisual landId={land.id} size={50} isLocked={isLocked} />
                    </div>

                    {/* Level Number Ribbon */}
                    <div
                      className={`absolute -bottom-2.5 text-[10px] font-black px-2 py-0.5 rounded-full border shadow-sm ${
                        isSelected
                          ? 'bg-[#FFD83E] text-[#164C68] border-amber-400'
                          : isLocked
                          ? 'bg-slate-200 text-slate-600 border-slate-300'
                          : 'bg-white text-[#164C68] border-cyan-200'
                      }`}
                    >
                      #{idx + 1}
                    </div>

                    {/* Completion Checkmark */}
                    {isCompleted && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#81E850] rounded-full border-2 border-white flex items-center justify-center text-[#164C68] shadow-xs">
                        <CheckCircle2 size={12} className="stroke-[3]" />
                      </div>
                    )}
                  </motion.button>

                  {/* Island Title Card & 3 Stars */}
                  <div
                    onClick={() => handleSelectLevel(idx)}
                    className="text-center mt-3 max-w-[110px] cursor-pointer"
                  >
                    {/* 3 Stars */}
                    <div className="flex items-center justify-center gap-0.5 mb-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          size={11}
                          className={`${
                            isCompleted
                              ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                              : 'text-slate-300 fill-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <span
                      className={`text-xs block font-black leading-tight drop-shadow-sm ${
                        isSelected ? 'text-[#164C68]' : isLocked ? 'text-slate-500' : 'text-[#164C68]'
                      }`}
                    >
                      {land.name.split(' (')[0]}
                    </span>
                    <span className="font-quran text-[11px] block text-[#08B9EF] font-bold mt-0.5">
                      {land.arabicName}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Level Stepper Navigation HUD */}
      <div className="flex items-center justify-between gap-2 bg-white border border-[#C9E1ED] p-2 rounded-2xl shadow-xs">
        <button
          onClick={handleStepPrev}
          disabled={activeLevelIdx === 0}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeLevelIdx === 0
              ? 'opacity-40 bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-[#EEF8FF] text-[#164C68] hover:bg-cyan-100 active:scale-95'
          }`}
        >
          <ChevronLeft size={16} />
          <span>Level Sebelumnya</span>
        </button>

        <div className="px-3.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-[10px] font-bold text-[#8C9BA7] block">Wilayah Terpilih</span>
          <span className="text-xs font-black text-[#164C68] font-heading">
            {activeLevelIdx + 1} / {WORLD_LANDS.length}
          </span>
        </div>

        <button
          onClick={handleStepNext}
          disabled={activeLevelIdx === WORLD_LANDS.length - 1}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeLevelIdx === WORLD_LANDS.length - 1
              ? 'opacity-40 bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-[#08B9EF] text-white hover:bg-[#07a6d7] active:scale-95 shadow-xs'
          }`}
        >
          <span>Level Berikutnya</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Selected Island Detail Card (HUD Preview) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLand.id}
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className={`bg-white border-2 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden ${
            isLandLocked ? 'border-slate-200 bg-slate-50/70' : 'border-[#C9E1ED]'
          }`}
        >
          {/* Top Bar with Biome Badge & Arabic Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#EEF8FF] text-[#08B9EF]">
                Wilayah #{activeLevelIdx + 1} • {activePoint.biomeTheme}
              </span>
              {isLandLocked ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Lock size={11} /> Perlu Lv. {activeLand.levelRequired}
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Terbuka untuk Bertualang
                </span>
              )}
            </div>

            <span className="font-quran text-lg text-[#08B9EF] font-bold">
              {activeLand.arabicName}
            </span>
          </div>

          {/* Biome Identity */}
          <div className="flex items-start gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${activeLand.color} text-white flex items-center justify-center shadow-sm shrink-0 p-1`}
            >
              <WorldLandVisual landId={activeLand.id} size={46} isLocked={isLandLocked} />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-base font-black text-[#164C68] font-heading">
                {activeLand.name}
              </h4>
              <p className="text-xs text-[#08B9EF] font-bold mt-0.5">
                {activeLand.tagline}
              </p>
              <p className="text-xs text-[#8C9BA7] font-medium mt-1 leading-relaxed">
                {activeLand.description}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-1">
            {isLandLocked ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 flex items-center justify-between">
                <span>
                  Tingkatkan hafalan & murojaahmu untuk mencapai Level {activeLand.levelRequired}!
                </span>
                <span className="text-base">⭐</span>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onNavigateToLand(activeLand.destinationTab, activeLand.destinationSubView);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#08B9EF] via-[#07a6d7] to-[#164C68] text-white font-extrabold text-xs shadow-md shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass size={17} />
                <span>Masuk & Mulai Petualangan Wilayah #{activeLevelIdx + 1}</span>
                <ArrowRight size={15} />
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
