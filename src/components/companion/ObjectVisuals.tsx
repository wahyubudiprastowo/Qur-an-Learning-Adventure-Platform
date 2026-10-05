import React from 'react';

interface VisualProps {
  size?: number;
  className?: string;
}

/**
 * 3D Golden Star Reward (Modeled after 22_reward_star.png)
 */
export const RewardStarVisual: React.FC<VisualProps> = ({ size = 28, className = '' }) => (
  <svg
    viewBox="0 0 100 100"
    style={{ width: size, height: size }}
    className={`inline-block filter drop-shadow-sm select-none ${className}`}
  >
    <defs>
      <linearGradient id="starBodyGrad" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="#FFF59D" />
        <stop offset="35%" stopColor="#FFD54F" />
        <stop offset="70%" stopColor="#FFB300" />
        <stop offset="100%" stopColor="#FF8F00" />
      </linearGradient>
      <radialGradient id="starHighlight" cx="35%" cy="30%" r="45%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
        <stop offset="60%" stopColor="#FFF59D" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#FFA000" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Puffy 3D Star */}
    <path
      d="M50 8 L61 34 L89 36 L67 55 L74 83 L50 68 L26 83 L33 55 L11 36 L39 34 Z"
      fill="url(#starBodyGrad)"
      stroke="#FF8F00"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Soft 3D Gloss Layer */}
    <path
      d="M50 12 L59 34 L82 36 L64 52 L69 76 L50 64 L31 76 L36 52 L18 36 L41 34 Z"
      fill="url(#starHighlight)"
    />
    <circle cx="40" cy="32" r="5" fill="#FFFFFF" opacity="0.7" />
  </svg>
);

/**
 * 3D Iridescent XP Orb (Modeled after 23_xp_orb_reward.png)
 */
export const RewardOrbVisual: React.FC<VisualProps> = ({ size = 28, className = '' }) => (
  <svg
    viewBox="0 0 100 100"
    style={{ width: size, height: size }}
    className={`inline-block filter drop-shadow-sm select-none ${className}`}
  >
    <defs>
      <radialGradient id="orbGlass" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="25%" stopColor="#E0E7FF" />
        <stop offset="55%" stopColor="#818CF8" />
        <stop offset="85%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#312E81" />
      </radialGradient>
      <linearGradient id="orbSwirl" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#C084FC" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#F472B6" stopOpacity="0.7" />
      </linearGradient>
    </defs>
    {/* Outer Energy Halo */}
    <circle cx="50" cy="50" r="44" fill="#818CF8" opacity="0.15" />
    {/* Glass Orb Body */}
    <circle cx="50" cy="50" r="38" fill="url(#orbGlass)" />
    {/* Inner Cosmic Swirl */}
    <path
      d="M25 55 Q45 25 75 45 Q55 75 35 65 Z"
      fill="url(#orbSwirl)"
      opacity="0.85"
    />
    {/* Top Glass Highlight */}
    <ellipse cx="40" cy="32" rx="14" ry="7" fill="#FFFFFF" opacity="0.65" transform="rotate(-25 40 32)" />
    <circle cx="68" cy="65" r="3" fill="#FFFFFF" opacity="0.6" />
    {/* Magical Sparkles */}
    <polygon points="80,22 82,28 88,30 82,32 80,38 78,32 72,30 78,28" fill="#38BDF8" />
    <polygon points="18,65 20,70 25,72 20,74 18,79 16,74 11,72 16,70" fill="#F472B6" />
  </svg>
);

/**
 * 3D Rolled Prayer Rug / Sajadah (Modeled after 20_prayer_rug_object.png)
 */
export const PrayerRugVisual: React.FC<VisualProps> = ({ size = 64, className = '' }) => (
  <svg viewBox="0 0 160 120" style={{ width: size, height: size * 0.75 }} className={`select-none ${className}`}>
    <defs>
      <linearGradient id="rugTeal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#08B9EF" />
        <stop offset="50%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
      <linearGradient id="rugGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Main Flat Carpet Surface */}
    <polygon points="20,50 110,20 150,60 60,95" fill="url(#rugTeal)" stroke="#0369A1" strokeWidth="2" />
    {/* Golden Inlay Borders */}
    <polygon points="30,52 105,28 138,60 65,86" fill="none" stroke="url(#rugGold)" strokeWidth="3" />
    <polygon points="40,54 100,34 126,60 68,78" fill="none" stroke="url(#rugGold)" strokeWidth="1.5" />
    {/* Center Arabesque Arch Motif */}
    <path d="M75 58 Q88 42 102 54" stroke="url(#rugGold)" strokeWidth="2.5" fill="none" />
    {/* Front Rolled Cylinder */}
    <g transform="translate(10, 40) rotate(-18)">
      <ellipse cx="20" cy="30" rx="14" ry="24" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
      <ellipse cx="20" cy="30" rx="9" ry="17" fill="url(#rugGold)" opacity="0.8" />
      <rect x="20" y="6" width="60" height="48" fill="url(#rugTeal)" stroke="#0369A1" strokeWidth="2" />
      {/* Golden Bands around roll */}
      <line x1="38" y1="6" x2="38" y2="54" stroke="url(#rugGold)" strokeWidth="4" />
      <line x1="65" y1="6" x2="65" y2="54" stroke="url(#rugGold)" strokeWidth="4" />
    </g>
    {/* Soft Fringe Tassels */}
    <g stroke="#08B9EF" strokeWidth="3" strokeLinecap="round">
      <line x1="18" y1="52" x2="12" y2="56" />
      <line x1="26" y1="60" x2="20" y2="64" />
      <line x1="36" y1="70" x2="30" y2="74" />
      <line x1="48" y1="82" x2="42" y2="86" />
      <line x1="58" y1="92" x2="52" y2="96" />
    </g>
  </svg>
);

/**
 * 3D Islamic Gold & Turquoise Lantern (Modeled after 18_lantern_object.png)
 */
export const LanternVisual: React.FC<VisualProps> = ({ size = 64, className = '' }) => (
  <svg viewBox="0 0 100 140" style={{ width: size * 0.72, height: size }} className={`select-none ${className}`}>
    <defs>
      <linearGradient id="lanternBrass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="45%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="lanternDome" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#08B9EF" />
        <stop offset="100%" stopColor="#0F766E" />
      </linearGradient>
      <radialGradient id="lanternLight" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="50%" stopColor="#FEF08A" />
        <stop offset="85%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </radialGradient>
    </defs>
    {/* Top Hanging Ring */}
    <ellipse cx="50" cy="14" rx="10" ry="10" fill="none" stroke="url(#lanternBrass)" strokeWidth="4.5" />
    {/* Turquoise Islamic Dome */}
    <path d="M26 40 C26 24 50 18 50 18 C50 18 74 24 74 40 Z" fill="url(#lanternDome)" stroke="url(#lanternBrass)" strokeWidth="2.5" />
    <rect x="22" y="38" width="56" height="8" rx="2" fill="url(#lanternBrass)" />
    {/* Glowing Glass Chamber */}
    <rect x="26" y="46" width="48" height="58" fill="url(#lanternLight)" />
    {/* Arch Windows & Brass Pillars */}
    <path d="M30 46 L30 104" stroke="url(#lanternBrass)" strokeWidth="4" />
    <path d="M43 46 L43 104" stroke="url(#lanternBrass)" strokeWidth="3" />
    <path d="M57 46 L57 104" stroke="url(#lanternBrass)" strokeWidth="3" />
    <path d="M70 46 L70 104" stroke="url(#lanternBrass)" strokeWidth="4" />
    {/* Arched Window cutouts */}
    <path d="M32 60 Q36 50 41 60 L41 100 L32 100 Z" fill="#FFFBEB" opacity="0.65" />
    <path d="M45 60 Q50 48 55 60 L55 100 L45 100 Z" fill="#FFFBEB" opacity="0.85" />
    <path d="M59 60 Q64 50 69 60 L69 100 L59 100 Z" fill="#FFFBEB" opacity="0.65" />
    {/* Brass Base */}
    <rect x="20" y="104" width="60" height="9" rx="2" fill="url(#lanternBrass)" />
    <polygon points="26,113 74,113 70,124 30,124" fill="url(#lanternDome)" stroke="url(#lanternBrass)" strokeWidth="2" />
    <rect x="24" y="122" width="52" height="6" rx="2" fill="url(#lanternBrass)" />
  </svg>
);

/**
 * 3D Holy Qur'an Book (Modeled after 17_quran_book_object.png)
 */
export const QuranBookVisual: React.FC<VisualProps> = ({ size = 64, className = '' }) => (
  <svg viewBox="0 0 120 140" style={{ width: size * 0.85, height: size }} className={`select-none ${className}`}>
    <defs>
      <linearGradient id="quranCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#065F46" />
        <stop offset="50%" stopColor="#047857" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <linearGradient id="quranGoldInlay" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="pagesGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FFFBEB" />
      </linearGradient>
    </defs>
    {/* Book Pages Thickness */}
    <polygon points="32,20 102,12 108,102 38,112" fill="#E2E8F0" />
    <polygon points="38,112 108,102 102,118 32,128" fill="url(#pagesGrad)" stroke="#CBD5E1" strokeWidth="1" />
    {/* Leather Front Cover */}
    <rect x="18" y="16" width="86" height="106" rx="6" fill="url(#quranCoverGrad)" stroke="#064E3B" strokeWidth="2" transform="rotate(-6 60 70)" />
    {/* Golden Filigree Frame */}
    <g transform="rotate(-6 60 70)">
      <rect x="24" y="22" width="74" height="94" rx="4" fill="none" stroke="url(#quranGoldInlay)" strokeWidth="2" />
      {/* 8-pointed Islamic Star Medallion */}
      <g transform="translate(61, 69) scale(0.9)">
        <rect x="-14" y="-14" width="28" height="28" fill="url(#quranGoldInlay)" />
        <rect x="-14" y="-14" width="28" height="28" fill="url(#quranGoldInlay)" transform="rotate(45)" />
        <circle cx="0" cy="0" r="5" fill="#047857" />
      </g>
      {/* Corner Arabesques */}
      <circle cx="28" cy="26" r="2.5" fill="url(#quranGoldInlay)" />
      <circle cx="94" cy="26" r="2.5" fill="url(#quranGoldInlay)" />
      <circle cx="28" cy="112" r="2.5" fill="url(#quranGoldInlay)" />
      <circle cx="94" cy="112" r="2.5" fill="url(#quranGoldInlay)" />
    </g>
    {/* Golden Bookmark Ribbon */}
    <path d="M56 120 L56 135 L62 130 L68 135 L68 120 Z" fill="#F59E0B" />
  </svg>
);

/**
 * 3D Barakah Flowering Tree (Modeled after 19_tree_object.png)
 */
export const BloomingTreeVisual: React.FC<VisualProps> = ({ size = 64, className = '' }) => (
  <svg viewBox="0 0 120 130" style={{ width: size * 0.92, height: size }} className={`select-none ${className}`}>
    <defs>
      <linearGradient id="foliageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#84CC16" />
        <stop offset="60%" stopColor="#4D7C0F" />
        <stop offset="100%" stopColor="#365314" />
      </linearGradient>
      <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A16207" />
        <stop offset="100%" stopColor="#713F12" />
      </linearGradient>
    </defs>
    {/* Base Meadow & Rocks */}
    <ellipse cx="60" cy="118" rx="46" ry="10" fill="#65A30D" />
    <ellipse cx="78" cy="118" rx="8" ry="4" fill="#CBD5E1" />
    {/* Trunk */}
    <path d="M52 118 C50 90 42 75 60 70 C78 75 70 90 68 118 Z" fill="url(#trunkGrad)" />
    {/* Pillowy Foliage Clouds */}
    <circle cx="60" cy="50" r="32" fill="url(#foliageGrad)" />
    <circle cx="36" cy="60" r="22" fill="url(#foliageGrad)" />
    <circle cx="84" cy="60" r="22" fill="url(#foliageGrad)" />
    <circle cx="44" cy="38" r="20" fill="url(#foliageGrad)" />
    <circle cx="76" cy="38" r="20" fill="url(#foliageGrad)" />
    {/* Blooming White Flowers */}
    <g fill="#FFFFFF" stroke="#FEF08A" strokeWidth="0.8">
      {/* Flower 1 */}
      <circle cx="60" cy="40" r="4.5" />
      <circle cx="60" cy="40" r="2" fill="#FBBF24" />
      {/* Flower 2 */}
      <circle cx="38" cy="55" r="4" />
      <circle cx="38" cy="55" r="1.8" fill="#FBBF24" />
      {/* Flower 3 */}
      <circle cx="82" cy="52" r="4" />
      <circle cx="82" cy="52" r="1.8" fill="#FBBF24" />
      {/* Flower 4 */}
      <circle cx="62" cy="64" r="3.5" />
      <circle cx="62" cy="64" r="1.5" fill="#FBBF24" />
    </g>
  </svg>
);

/**
 * 3D Astronomical Telescope on Tripod (Modeled after 21_telescope_object.png)
 */
export const TelescopeVisual: React.FC<VisualProps> = ({ size = 64, className = '' }) => (
  <svg viewBox="0 0 120 120" style={{ width: size, height: size }} className={`select-none ${className}`}>
    <defs>
      <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="purpleBarrel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="60%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#312E81" />
      </linearGradient>
      <linearGradient id="woodLeg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
    </defs>
    {/* Wooden Tripod Legs */}
    <line x1="60" y1="65" x2="32" y2="114" stroke="url(#woodLeg)" strokeWidth="6" strokeLinecap="round" />
    <line x1="60" y1="65" x2="60" y2="116" stroke="url(#woodLeg)" strokeWidth="6" strokeLinecap="round" />
    <line x1="60" y1="65" x2="88" y2="114" stroke="url(#woodLeg)" strokeWidth="6" strokeLinecap="round" />
    {/* Rubber leg tips */}
    <circle cx="32" cy="114" r="3.5" fill="#1E293B" />
    <circle cx="60" cy="116" r="3.5" fill="#1E293B" />
    <circle cx="88" cy="114" r="3.5" fill="#1E293B" />
    {/* Mount Joint */}
    <circle cx="60" cy="65" r="9" fill="url(#brassGrad)" />
    {/* Main Telescope Barrel (angled upward to stars) */}
    <g transform="rotate(-32 60 55)">
      {/* Brass Eye Piece */}
      <rect x="25" y="49" width="16" height="12" rx="2" fill="url(#brassGrad)" />
      {/* Purple Tube */}
      <rect x="41" y="47" width="48" height="16" rx="3" fill="url(#purpleBarrel)" stroke="url(#brassGrad)" strokeWidth="1.5" />
      {/* Brass Bands */}
      <rect x="52" y="47" width="5" height="16" fill="url(#brassGrad)" />
      <rect x="74" y="47" width="5" height="16" fill="url(#brassGrad)" />
      {/* Big Objective Lens Hood */}
      <rect x="89" y="44" width="16" height="22" rx="3" fill="url(#brassGrad)" />
      <ellipse cx="105" cy="55" rx="3" ry="11" fill="#38BDF8" opacity="0.8" />
    </g>
  </svg>
);

/**
 * 3D Audio Speaker Button (Modeled after 29_audio_icon.png)
 */
export const AudioIconVisual: React.FC<VisualProps> = ({ size = 36, className = '' }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className={`select-none ${className}`}>
    <defs>
      <radialGradient id="audioCyanGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#A5F3FC" />
        <stop offset="35%" stopColor="#22D3EE" />
        <stop offset="75%" stopColor="#08B9EF" />
        <stop offset="100%" stopColor="#0284C7" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="44" fill="url(#audioCyanGrad)" stroke="#FFFFFF" strokeWidth="3" filter="drop-shadow(0px 4px 8px rgba(8,185,239,0.35))" />
    <ellipse cx="42" cy="32" rx="14" ry="6" fill="#FFFFFF" opacity="0.6" transform="rotate(-20 42 32)" />
    {/* Speaker Cone */}
    <path d="M30 40 L38 40 L48 30 L48 70 L38 60 L30 60 Z" fill="#FFFFFF" />
    {/* Sound Waves */}
    <path d="M56 38 Q62 50 56 62" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M64 30 Q74 50 64 70" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
  </svg>
);

/**
 * 3D Voice Recording Microphone Button (Modeled after 30_recording_icon.png)
 */
export const RecordingIconVisual: React.FC<VisualProps> = ({ size = 36, className = '' }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className={`select-none ${className}`}>
    <defs>
      <radialGradient id="recRedGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#FFA4A4" />
        <stop offset="35%" stopColor="#EF4444" />
        <stop offset="75%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#991B1B" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="44" fill="url(#recRedGrad)" stroke="#FFFFFF" strokeWidth="3" filter="drop-shadow(0px 4px 8px rgba(239,68,68,0.4))" />
    <ellipse cx="42" cy="32" rx="14" ry="6" fill="#FFFFFF" opacity="0.6" transform="rotate(-20 42 32)" />
    {/* Capsule */}
    <rect x="43" y="32" width="14" height="22" rx="7" fill="#FFFFFF" />
    {/* Stand U */}
    <path d="M38 43 C38 60 62 60 62 43" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
    <line x1="50" y1="56" x2="50" y2="68" stroke="#FFFFFF" strokeWidth="3" />
    <line x1="42" y1="68" x2="58" y2="68" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/**
 * 3D Golden Bookmark Ribbon (Modeled after 31_bookmark_icon.png)
 */
export const BookmarkIconVisual: React.FC<VisualProps> = ({ size = 36, className = '' }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className={`select-none ${className}`}>
    <defs>
      <linearGradient id="bmkGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF7A1" />
        <stop offset="40%" stopColor="#FBBF24" />
        <stop offset="80%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
    </defs>
    <path d="M28 16 L72 16 L72 84 L50 66 L28 84 Z" fill="url(#bmkGold)" stroke="#B45309" strokeWidth="2" filter="drop-shadow(0px 4px 8px rgba(180,83,9,0.35))" />
    <circle cx="50" cy="36" r="8" fill="#FFFBEB" opacity="0.9" />
    <polygon points="50,44 52,50 58,51 53,55 55,61 50,57 45,61 47,55 42,51 48,50" fill="#FBBF24" />
  </svg>
);

/**
 * 3D Progress Dial Achievement (Modeled after 32_progress_icon.png)
 */
export const ProgressIconVisual: React.FC<VisualProps> = ({ size = 36, className = '' }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className={`select-none ${className}`}>
    <circle cx="50" cy="50" r="42" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="6" />
    <path d="M50 8 A 42 42 0 1 1 14 68" stroke="#10B981" strokeWidth="7" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="50" r="28" fill="#10B981" opacity="0.15" />
    <polygon points="50,30 55,42 67,44 58,52 61,64 50,58 39,64 42,52 33,44 45,42" fill="#10B981" />
  </svg>
);

/**
 * 3D Daily Schedule Calendar (Modeled after 33_schedule_icon.png)
 */
export const ScheduleIconVisual: React.FC<VisualProps> = ({ size = 36, className = '' }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className={`select-none ${className}`}>
    <rect x="18" y="24" width="64" height="60" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.1))" />
    <rect x="18" y="24" width="64" height="18" rx="8" fill="#08B9EF" />
    <rect x="18" y="34" width="64" height="8" fill="#08B9EF" />
    {/* Binder rings */}
    <rect x="30" y="16" width="6" height="14" rx="3" fill="#64748B" />
    <rect x="64" y="16" width="6" height="14" rx="3" fill="#64748B" />
    {/* Checkmark */}
    <path d="M36 60 L46 70 L66 48" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/**
 * 3D Prestigious Gold Medal Badge (Modeled after 24_badge_reward.png)
 */
export const BadgeRewardVisual: React.FC<VisualProps> = ({ size = 36, className = '' }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className={`select-none ${className}`}>
    {/* Ribbons */}
    <polygon points="40,50 32,88 44,80 50,88 46,50" fill="#0D9488" />
    <polygon points="60,50 68,88 56,80 50,88 54,50" fill="#0F766E" />
    {/* Medal */}
    <circle cx="50" cy="44" r="28" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" filter="drop-shadow(0px 3px 6px rgba(180,83,9,0.3))" />
    <circle cx="50" cy="44" r="22" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.5" />
    <polygon points="50,28 53,37 63,38 55,44 57,54 50,49 43,54 45,44 37,38 47,37" fill="#F59E0B" />
  </svg>
);

