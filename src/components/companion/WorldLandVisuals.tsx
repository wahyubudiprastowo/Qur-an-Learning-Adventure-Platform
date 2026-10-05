import React from 'react';

interface WorldLandVisualProps {
  landId: string;
  size?: number;
  className?: string;
  isLocked?: boolean;
}

/**
 * 3D Diorama Visuals & Icons strictly matching user's uploaded assets:
 * 09_home_environment.png: Pulau Rumah (Cozy cottage, palm trees, lantern)
 * 10_forest_environment.png: Hutan Air Terjun (Cascade waterfall, pines, daisies)
 * 11_garden_environment.png: Kebun Gazebo (Marble turquoise dome gazebo, flowers)
 * 12_mountain_environment.png: Puncak Salju (Snow-capped mountain peaks in clouds)
 * 13_lake_environment.png: Danau Tenang (Clear lake, wooden pier dock, mountains)
 * 14_mosque_library_building.png: Pustaka Masjid (Emerald domes, golden minaret)
 * 15_iqra_house_building.png: Rumah Iqra (Cyan dome, warm glowing entrance)
 * 16_story_camp_building.png: Tenda Kisah (Desert tent, campfire, crescent moon)
 * 17_quran_book_object.png: Mushaf Al-Qur'an (Emerald & gold book on rehal stand)
 * 18_lantern_object.png: Lentera Fanous Emas (Glowing brass Islamic lantern)
 * 29_audio_icon.png: Audio Speaker 3D (Glossy cyan sound-waves button)
 * 30_recording_icon.png: Microphone Rekaman 3D (Glowing coral-red mic button)
 * 31_bookmark_icon.png: Pita Bookmark Emas 3D (Golden ribbon with star tassel)
 */

export const WorldLandVisual: React.FC<WorldLandVisualProps> = ({
  landId,
  size = 52,
  className = '',
  isLocked = false,
}) => {
  if (isLocked) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center text-slate-400 select-none ${className}`}
      >
        <span className="text-2xl filter drop-shadow-sm">🔒</span>
      </div>
    );
  }

  // Common SVG gradients
  const CommonDefs = () => (
    <defs>
      {/* 3D Grass Diorama Base */}
      <linearGradient id="dioramaGrass" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#84CC16" />
        <stop offset="50%" stopColor="#65A30D" />
        <stop offset="100%" stopColor="#365314" />
      </linearGradient>
      {/* Earth / Cliff Soil */}
      <linearGradient id="earthSoil" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#A16207" />
        <stop offset="50%" stopColor="#78350F" />
        <stop offset="100%" stopColor="#451A03" />
      </linearGradient>
      {/* 3D Crystal Water */}
      <linearGradient id="crystalWater" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#A5F3FC" />
        <stop offset="40%" stopColor="#38BDF8" />
        <stop offset="85%" stopColor="#08B9EF" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
      {/* 3D Gold Accent */}
      <linearGradient id="goldAcc" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF7A1" />
        <stop offset="40%" stopColor="#FBBF24" />
        <stop offset="80%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
      {/* Turquoise Dome */}
      <linearGradient id="turquoiseDome" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5EEAD4" />
        <stop offset="40%" stopColor="#14B8A6" />
        <stop offset="80%" stopColor="#0D9488" />
        <stop offset="100%" stopColor="#042F2E" />
      </linearGradient>
    </defs>
  );

  // =========================================================================
  // 1. DANAU TILAWAH (13_lake_environment.png & 29_audio_icon.png)
  // 3D Clear Lake with wooden pier dock, distant mountains, pines & audio badge
  // =========================================================================
  if (landId === 'recitation_lake') {
    return (
      <svg
        viewBox="0 0 140 140"
        style={{ width: size, height: size }}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        <CommonDefs />
        {/* Floating Island Base */}
        <ellipse cx="70" cy="116" rx="58" ry="18" fill="#1C3806" opacity="0.35" />
        <ellipse cx="70" cy="112" rx="56" ry="16" fill="url(#dioramaGrass)" />
        <path d="M14 112 C14 126 126 126 126 112 L126 120 C126 134 14 134 14 120 Z" fill="url(#earthSoil)" />

        {/* Distant Snow Mountains */}
        <polygon points="34,80 52,48 70,80" fill="#94A3B8" />
        <polygon points="48,54 52,48 56,54" fill="#FFFFFF" />
        <polygon points="65,80 84,42 103,80" fill="#64748B" />
        <polygon points="80,50 84,42 88,50" fill="#FFFFFF" />

        {/* Pine Trees */}
        <path d="M22 96 L28 72 L34 96 Z" fill="#15803D" />
        <path d="M106 96 L112 72 L118 96 Z" fill="#15803D" />

        {/* Crystal Turquoise Lake Basin */}
        <ellipse cx="70" cy="98" rx="42" ry="18" fill="url(#crystalWater)" />
        <ellipse cx="70" cy="95" rx="34" ry="12" fill="#E0F2FE" opacity="0.45" />

        {/* Wooden Jetty / Pier (13_lake) */}
        <polygon points="48,108 58,88 74,94 64,114" fill="#B45309" stroke="#451A03" strokeWidth="1.2" />
        <rect x="46" y="104" width="4" height="12" fill="#451A03" />
        <rect x="60" y="110" width="4" height="12" fill="#451A03" />

        {/* 3D Cyan Audio Badge Indicator (29_audio_icon) */}
        <g transform="translate(100, 32) scale(0.65)" filter="drop-shadow(0px 2px 5px rgba(2,132,199,0.5))">
          <circle cx="20" cy="20" r="18" fill="url(#crystalWater)" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M12 16 L16 16 L22 10 L22 30 L16 24 L12 24 Z" fill="#FFFFFF" />
          <path d="M26 14 Q30 20 26 26" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    );
  }

  // =========================================================================
  // 2. BUKIT ZIADAH (12_mountain_environment.png)
  // 3D Snow-capped Mountain Peaks piercing through fluffy white clouds
  // =========================================================================
  if (landId === 'memory_mountain') {
    return (
      <svg
        viewBox="0 0 140 140"
        style={{ width: size, height: size }}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        <CommonDefs />
        {/* Floating Island Base */}
        <ellipse cx="70" cy="116" rx="58" ry="18" fill="#1C3806" opacity="0.35" />
        <ellipse cx="70" cy="112" rx="56" ry="16" fill="url(#dioramaGrass)" />
        <path d="M14 112 C14 126 126 126 126 112 L126 120 C126 134 14 134 14 120 Z" fill="url(#earthSoil)" />

        {/* Left Mountain Ridge */}
        <polygon points="24,108 55,42 86,108" fill="#64748B" />
        <polygon points="46,60 55,42 64,60 55,56" fill="#FFFFFF" />

        {/* Right Mountain Ridge */}
        <polygon points="68,108 98,52 124,108" fill="#64748B" />
        <polygon points="90,66 98,52 106,66 98,62" fill="#FFFFFF" />

        {/* Main Majestic Summit Peak */}
        <polygon points="34,110 70,22 106,110" fill="#475569" stroke="#334155" strokeWidth="1" />
        {/* Snow Cap on Summit */}
        <polygon points="56,54 70,22 84,54 77,50 70,56 63,50" fill="#FFFFFF" />

        {/* Fluffy 3D Clouds Piercing Mid-Mountain */}
        <g fill="#FFFFFF" opacity="0.95" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))">
          <ellipse cx="40" cy="78" rx="14" ry="9" />
          <ellipse cx="48" cy="74" rx="12" ry="10" />
          <ellipse cx="94" cy="80" rx="15" ry="9" />
          <ellipse cx="102" cy="75" rx="11" ry="10" />
        </g>

        {/* Pine Trees on Green Base */}
        <path d="M22 108 L28 86 L34 108 Z" fill="#15803D" />
        <path d="M106 108 L112 86 L118 108 Z" fill="#15803D" />
        <path d="M70 114 L75 96 L80 114 Z" fill="#16A34A" />
      </svg>
    );
  }

  // =========================================================================
  // 3. LEMBAH MUROJAAH (31_bookmark_icon.png & 18_lantern_object.png)
  // 3D Golden Bookmark Ribbon, glowing Fanous lantern & Crescent Moon
  // =========================================================================
  if (landId === 'moon_valley') {
    return (
      <svg
        viewBox="0 0 140 140"
        style={{ width: size, height: size }}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        <CommonDefs />
        {/* Night Island Base */}
        <ellipse cx="70" cy="116" rx="58" ry="18" fill="#1E1B4B" opacity="0.35" />
        <ellipse cx="70" cy="112" rx="56" ry="16" fill="#312E81" />
        <path d="M14 112 C14 126 126 126 126 112 L126 120 C126 134 14 134 14 120 Z" fill="#1E1B4B" />

        {/* Large Glowing Crescent Moon (3D Gold) */}
        <path
          d="M92 20 C106 20 118 32 118 48 C118 64 106 76 92 76 C87 76 82 74 78 71 C89 67 96 56 96 48 C96 40 89 29 78 25 C82 22 87 20 92 20 Z"
          fill="url(#goldAcc)"
          filter="drop-shadow(0px 0px 8px rgba(251,191,36,0.6))"
        />

        {/* 3D Islamic Fanous Lantern (18_lantern) */}
        <g transform="translate(38, 48) scale(0.65)" filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.3))">
          <ellipse cx="30" cy="10" rx="6" ry="6" fill="none" stroke="url(#goldAcc)" strokeWidth="3" />
          <path d="M16 26 C16 16 30 12 30 12 C30 12 44 16 44 26 Z" fill="url(#turquoiseDome)" stroke="url(#goldAcc)" strokeWidth="1.5" />
          <rect x="14" y="24" width="32" height="5" rx="1.5" fill="url(#goldAcc)" />
          {/* Glowing Light */}
          <rect x="16" y="29" width="28" height="38" rx="2" fill="#FEF08A" />
          <circle cx="30" cy="48" r="8" fill="#FFFFFF" />
          <rect x="14" y="67" width="32" height="6" rx="1.5" fill="url(#goldAcc)" />
          <polygon points="18,73 42,73 38,82 22,82" fill="url(#turquoiseDome)" stroke="url(#goldAcc)" strokeWidth="1.5" />
        </g>

        {/* 3D Golden Bookmark Ribbon with Star Tassel (31_bookmark_icon) */}
        <g transform="translate(74, 52) scale(0.95)" filter="drop-shadow(0px 4px 8px rgba(180,83,9,0.4))">
          <path d="M12 8 L36 8 L36 58 L24 46 L12 58 Z" fill="url(#goldAcc)" stroke="#B45309" strokeWidth="1.2" />
          <circle cx="24" cy="20" r="4" fill="#FFFFFF" opacity="0.8" />
          {/* Tiny Star Ornament on Bookmark */}
          <polygon points="24,28 26,33 31,34 27,38 28,43 24,40 20,43 21,38 17,34 22,33" fill="#FFFBEB" />
        </g>
      </svg>
    );
  }

  // =========================================================================
  // 4. GUA GEMA (30_recording_icon.png)
  // 3D Coral-Red Glowing Microphone Button for voice setoran hafalan
  // =========================================================================
  if (landId === 'echo_cave') {
    return (
      <svg
        viewBox="0 0 140 140"
        style={{ width: size, height: size }}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        <defs>
          <radialGradient id="micRed" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFA4A4" />
            <stop offset="35%" stopColor="#EF4444" />
            <stop offset="75%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </radialGradient>
          <linearGradient id="micMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
        </defs>
        <CommonDefs />

        {/* Island Pedestal */}
        <ellipse cx="70" cy="116" rx="58" ry="18" fill="#1C3806" opacity="0.3" />
        <ellipse cx="70" cy="112" rx="56" ry="16" fill="url(#dioramaGrass)" />

        {/* Sound Concentric Waves around Mic */}
        <circle cx="70" cy="62" r="48" fill="none" stroke="#FCA5A5" strokeWidth="2.5" opacity="0.4" strokeDasharray="6 4" />
        <circle cx="70" cy="62" r="38" fill="none" stroke="#EF4444" strokeWidth="2.5" opacity="0.6" />

        {/* 3D Red Glossy Button Base */}
        <circle cx="70" cy="62" r="28" fill="url(#micRed)" stroke="#FFFFFF" strokeWidth="3" filter="drop-shadow(0px 6px 12px rgba(220,38,38,0.4))" />
        <ellipse cx="64" cy="50" rx="10" ry="5" fill="#FFFFFF" opacity="0.6" transform="rotate(-25 64 50)" />

        {/* 3D Microphone Body */}
        {/* Capsule */}
        <rect x="63" y="46" width="14" height="20" rx="7" fill="url(#micMetal)" stroke="#64748B" strokeWidth="1" />
        {/* Mic Grill lines */}
        <line x1="65" y1="52" x2="75" y2="52" stroke="#64748B" strokeWidth="1" />
        <line x1="65" y1="56" x2="75" y2="56" stroke="#64748B" strokeWidth="1" />
        {/* Stand U-shape */}
        <path d="M59 55 C59 70 81 70 81 55" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Stem & Base */}
        <line x1="70" y1="68" x2="70" y2="76" stroke="#FFFFFF" strokeWidth="2.5" />
        <line x1="63" y1="76" x2="77" y2="76" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // =========================================================================
  // 5. DESA IQRA (15_iqra_house_building.png)
  // 3D Miniature Iqra Learning House with cyan dome, gold crescent, glowing door
  // =========================================================================
  if (landId === 'iqra_village') {
    return (
      <svg
        viewBox="0 0 140 140"
        style={{ width: size, height: size }}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        <CommonDefs />
        {/* Island Base */}
        <ellipse cx="70" cy="116" rx="58" ry="18" fill="#1C3806" opacity="0.35" />
        <ellipse cx="70" cy="112" rx="56" ry="16" fill="url(#dioramaGrass)" />
        <path d="M14 112 C14 126 126 126 126 112 L126 120 C126 134 14 134 14 120 Z" fill="url(#earthSoil)" />

        {/* Flanking Trees */}
        <circle cx="28" cy="78" r="16" fill="#16A34A" />
        <path d="M26 108 L28 88 L30 108 Z" fill="#92400E" />
        <circle cx="112" cy="78" r="16" fill="#16A34A" />
        <path d="M110 108 L112 88 L114 108 Z" fill="#92400E" />

        {/* White House Structure */}
        <rect x="42" y="66" width="56" height="42" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="40" y="64" width="60" height="6" rx="2" fill="url(#goldAcc)" />

        {/* Turquoise Dome with Crescent */}
        <path d="M46 64 C46 36 94 36 94 64 Z" fill="url(#turquoiseDome)" stroke="url(#goldAcc)" strokeWidth="2" />
        {/* Crescent Finial */}
        <path d="M70 26 Q74 22 74 18 Q70 20 68 23 Z" fill="url(#goldAcc)" />

        {/* Arched Warm Glowing Door */}
        <path d="M58 108 L58 84 Q70 76 82 84 L82 108 Z" fill="url(#goldAcc)" stroke="#D97706" strokeWidth="1.5" />
        <circle cx="70" cy="92" r="3.5" fill="#FEF08A" />

        {/* Warm Lantern outside door */}
        <rect x="46" y="94" width="6" height="10" rx="1.5" fill="#F59E0B" />
        <circle cx="49" cy="99" r="2" fill="#FEF08A" />
      </svg>
    );
  }

  // =========================================================================
  // 6. HUTAN TAJWID (10_forest_environment.png & 19_tree_object.png)
  // 3D Cascading Waterfall into crystal pool, pine trees, daisies
  // =========================================================================
  if (landId === 'tajwid_forest') {
    return (
      <svg
        viewBox="0 0 140 140"
        style={{ width: size, height: size }}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        <CommonDefs />
        {/* Island Base */}
        <ellipse cx="70" cy="116" rx="58" ry="18" fill="#1C3806" opacity="0.35" />
        <ellipse cx="70" cy="112" rx="56" ry="16" fill="url(#dioramaGrass)" />
        <path d="M14 112 C14 126 126 126 126 112 L126 120 C126 134 14 134 14 120 Z" fill="url(#earthSoil)" />

        {/* Tall Forest Pines */}
        <path d="M22 96 L32 50 L42 96 Z" fill="#15803D" />
        <path d="M24 78 L32 40 L40 78 Z" fill="#16A34A" />
        <path d="M98 96 L108 50 L118 96 Z" fill="#15803D" />
        <path d="M100 78 L108 40 L116 78 Z" fill="#16A34A" />

        {/* Rocky Cliff */}
        <path d="M42 90 L42 66 L98 66 L98 90 Z" fill="#78716C" stroke="#57534E" strokeWidth="1.5" />
        <rect x="40" y="62" width="60" height="8" rx="2" fill="#84CC16" />

        {/* Cascading Crystal Waterfall */}
        <path d="M56 64 L54 104 L86 104 L84 64 Z" fill="url(#crystalWater)" />
        <path d="M60 64 L58 104 M70 64 L70 104 M80 64 L82 104" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.85" />

        {/* Waterfall Splash Pool */}
        <ellipse cx="70" cy="106" rx="28" ry="8" fill="#38BDF8" />
        <circle cx="70" cy="106" r="3" fill="#FFFFFF" opacity="0.85" />

        {/* Wild Daisies */}
        <circle cx="34" cy="106" r="3" fill="#FFFFFF" />
        <circle cx="34" cy="106" r="1" fill="#FBBF24" />
        <circle cx="106" cy="106" r="3" fill="#FFFFFF" />
        <circle cx="106" cy="106" r="1" fill="#FBBF24" />
      </svg>
    );
  }

  // =========================================================================
  // 7. SUNGAI MUSHAF (17_quran_book_object.png)
  // 3D Holy Qur'an with golden embossed cover on carved folding rehal stand
  // =========================================================================
  if (landId === 'quran_river') {
    return (
      <svg
        viewBox="0 0 140 140"
        style={{ width: size, height: size }}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        <defs>
          <linearGradient id="rehalWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="60%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
          <linearGradient id="quranCover" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="40%" stopColor="#059669" />
            <stop offset="85%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
        </defs>
        <CommonDefs />

        {/* Island Base */}
        <ellipse cx="70" cy="116" rx="58" ry="18" fill="#1C3806" opacity="0.35" />
        <ellipse cx="70" cy="112" rx="56" ry="16" fill="url(#dioramaGrass)" />
        <path d="M14 112 C14 126 126 126 126 112 L126 120 C126 134 14 134 14 120 Z" fill="url(#earthSoil)" />

        {/* Blue River Creek running through */}
        <path d="M26 114 Q70 94 114 114" stroke="url(#crystalWater)" strokeWidth="12" fill="none" opacity="0.8" />

        {/* Carved Wooden Rehal Stand (X-shape) */}
        <polygon points="42,106 66,74 74,74 50,106" fill="url(#rehalWood)" stroke="#451A03" strokeWidth="1" />
        <polygon points="98,106 74,74 66,74 90,106" fill="url(#rehalWood)" stroke="#451A03" strokeWidth="1" />

        {/* 3D Emerald Holy Qur'an Book resting on Rehal */}
        <g transform="translate(38, 42)">
          {/* Left open page */}
          <polygon points="32,24 6,14 6,48 32,54" fill="#FEF3C7" stroke="#CBD5E1" strokeWidth="0.8" />
          <polygon points="32,24 4,12 4,46 32,54" fill="url(#quranCover)" stroke="#042F2E" strokeWidth="1" />
          {/* Right open page */}
          <polygon points="32,24 58,14 58,48 32,54" fill="#FEF3C7" stroke="#CBD5E1" strokeWidth="0.8" />
          <polygon points="32,24 60,12 60,46 32,54" fill="url(#quranCover)" stroke="#042F2E" strokeWidth="1" />
          {/* Golden Filigree & Islamic Star on Cover */}
          <circle cx="18" cy="30" r="5" fill="none" stroke="url(#goldAcc)" strokeWidth="1.2" />
          <circle cx="46" cy="30" r="5" fill="none" stroke="url(#goldAcc)" strokeWidth="1.2" />
          {/* Golden Ribbon */}
          <path d="M32 54 L32 64 L35 60 L38 64 L38 54 Z" fill="url(#goldAcc)" />
        </g>
      </svg>
    );
  }

  // =========================================================================
  // 8. KEBUN BAHASA (11_garden_environment.png & 27_flower_plant.png)
  // 3D Turquoise Dome Marble Gazebo, blooming flowers, garden stone path
  // =========================================================================
  if (landId === 'word_garden') {
    return (
      <svg
        viewBox="0 0 140 140"
        style={{ width: size, height: size }}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        <CommonDefs />
        {/* Island Base */}
        <ellipse cx="70" cy="116" rx="58" ry="18" fill="#1C3806" opacity="0.35" />
        <ellipse cx="70" cy="112" rx="56" ry="16" fill="url(#dioramaGrass)" />
        <ellipse cx="70" cy="110" rx="46" ry="10" fill="#E2E8F0" />

        {/* Blooming colorful flowers around base */}
        <circle cx="28" cy="106" r="6" fill="#F43F5E" />
        <circle cx="28" cy="106" r="2" fill="#FEF08A" />
        <circle cx="40" cy="112" r="5" fill="#FB923C" />
        <circle cx="102" cy="108" r="6" fill="#FBBF24" />
        <circle cx="102" cy="108" r="2" fill="#FFFFFF" />
        <circle cx="114" cy="112" r="5" fill="#EC4899" />

        {/* Gazebo Marble Pillars */}
        <rect x="42" y="66" width="6" height="42" rx="2" fill="#FFFFFF" stroke="#E2E8F0" />
        <rect x="58" y="66" width="5" height="42" rx="2" fill="#FFFFFF" stroke="#E2E8F0" />
        <rect x="77" y="66" width="5" height="42" rx="2" fill="#FFFFFF" stroke="#E2E8F0" />
        <rect x="92" y="66" width="6" height="42" rx="2" fill="#FFFFFF" stroke="#E2E8F0" />

        {/* Warm Lantern glowing inside Gazebo */}
        <circle cx="70" cy="80" r="10" fill="#FEF08A" opacity="0.85" filter="drop-shadow(0px 0px 8px rgba(251,191,36,0.8))" />

        {/* Gazebo Turquoise Dome Roof */}
        <path d="M36 66 C36 34 104 34 104 66 Z" fill="url(#turquoiseDome)" stroke="url(#goldAcc)" strokeWidth="2" />
        <rect x="34" y="64" width="72" height="5" rx="2" fill="url(#goldAcc)" />
        {/* Crescent Finial */}
        <path d="M70 28 Q74 24 74 20 Q70 22 68 25 Z" fill="url(#goldAcc)" />
      </svg>
    );
  }

  // =========================================================================
  // 9. PERPUSTAKAAN HIKMAH (14_mosque_library_building.png)
  // 3D Grand Mosque Library with emerald dome, minaret & book-shaped entrance
  // =========================================================================
  if (landId === 'wisdom_library') {
    return (
      <svg
        viewBox="0 0 140 140"
        style={{ width: size, height: size }}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        <CommonDefs />
        {/* Island Base */}
        <ellipse cx="70" cy="116" rx="58" ry="18" fill="#1C3806" opacity="0.35" />
        <ellipse cx="70" cy="112" rx="56" ry="16" fill="url(#dioramaGrass)" />

        {/* Palm Trees */}
        <path d="M22 108 Q16 80 20 62 Q28 80 26 108 Z" fill="#92400E" />
        <circle cx="18" cy="58" r="14" fill="#16A34A" />

        {/* Golden Minaret Tower on Right */}
        <rect x="96" y="44" width="14" height="60" rx="3" fill="#FFFFFF" stroke="#E2E8F0" />
        <rect x="94" y="42" width="18" height="5" rx="1" fill="url(#goldAcc)" />
        <path d="M96 42 Q103 26 110 42 Z" fill="url(#goldAcc)" />
        <circle cx="103" cy="24" r="2.5" fill="url(#goldAcc)" />

        {/* Main Building Body */}
        <rect x="36" y="60" width="68" height="48" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />

        {/* Grand Emerald Dome */}
        <path d="M44 60 C44 32 96 32 96 60 Z" fill="url(#turquoiseDome)" stroke="url(#goldAcc)" strokeWidth="2" />
        <rect x="42" y="58" width="56" height="5" rx="2" fill="url(#goldAcc)" />
        <path d="M70 28 Q74 24 74 20 Q70 22 68 25 Z" fill="url(#goldAcc)" />

        {/* Grand Book-Shaped Glowing Archway Door */}
        <path d="M54 108 L54 82 Q70 72 86 82 L86 108 Z" fill="#FEF3C7" stroke="url(#goldAcc)" strokeWidth="2" />
        <g transform="translate(70, 88) scale(0.65)">
          <path d="M-14 -6 Q0 -10 0 6 Q0 -10 14 -6 L14 8 Q0 4 0 18 Q0 4 -14 8 Z" fill="url(#goldAcc)" />
        </g>
      </svg>
    );
  }

  // =========================================================================
  // 10. TENDA KISAH (16_story_camp_building.png)
  // 3D Arabian Tent, Campfire with stones, lanterns, crescent moon finial
  // =========================================================================
  if (landId === 'story_camp') {
    return (
      <svg
        viewBox="0 0 140 140"
        style={{ width: size, height: size }}
        className={`filter drop-shadow-md select-none ${className}`}
      >
        <defs>
          <linearGradient id="campTent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
          <linearGradient id="fireFlame" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
        </defs>
        <CommonDefs />

        {/* Island Base */}
        <ellipse cx="70" cy="116" rx="58" ry="18" fill="#1C3806" opacity="0.35" />
        <ellipse cx="70" cy="112" rx="56" ry="16" fill="url(#dioramaGrass)" />
        <path d="M14 112 C14 126 126 126 126 112 L126 120 C126 134 14 134 14 120 Z" fill="url(#earthSoil)" />

        {/* Pine Trees */}
        <path d="M26 95 L34 68 L42 95 Z" fill="#15803D" />
        <path d="M98 95 L106 68 L114 95 Z" fill="#15803D" />

        {/* 3D Arabian Tent Canopy */}
        <path d="M70 24 L34 94 L106 94 Z" fill="url(#campTent)" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M70 24 L52 94 L88 94 Z" fill="#F8FAFC" />
        <path d="M54 62 C58 80 62 94 62 94 L78 94 C78 94 82 80 86 62 Z" fill="url(#turquoiseDome)" />
        <path d="M64 74 L70 94 L76 74 Z" fill="#1E293B" />

        {/* Golden Crescent Moon Topper */}
        <path d="M70 12 C74 12 77 15 76 19 C74 16 71 16 68 18 C70 14 70 12 70 12 Z" fill="url(#goldAcc)" />

        {/* Warm Blazing Campfire in Foreground */}
        <g transform="translate(70, 102)">
          <ellipse cx="0" cy="8" rx="14" ry="6" fill="#64748B" stroke="#475569" strokeWidth="1" />
          <path d="M0 6 C-6 6 -8 0 -4 -6 C-2 -12 0 -16 0 -16 C0 -16 2 -12 4 -6 C8 0 6 6 0 6 Z" fill="url(#fireFlame)" />
          <circle cx="0" cy="0" r="3" fill="#FFFFFF" opacity="0.85" />
        </g>
      </svg>
    );
  }

  // =========================================================================
  // DEFAULT: PULAU RUMAH (09_home_environment.png)
  // 3D Cozy Cottage with palm trees, stone terrace, warm glowing lantern
  // =========================================================================
  return (
    <svg
      viewBox="0 0 140 140"
      style={{ width: size, height: size }}
      className={`filter drop-shadow-md select-none ${className}`}
    >
      <defs>
        <linearGradient id="cottageRoof" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>
      <CommonDefs />
      <ellipse cx="70" cy="116" rx="58" ry="18" fill="#1C3806" opacity="0.35" />
      <ellipse cx="70" cy="112" rx="56" ry="16" fill="url(#dioramaGrass)" />
      <ellipse cx="70" cy="110" rx="46" ry="10" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />

      {/* Palm Trees */}
      <path d="M24 108 Q18 78 22 56 Q30 78 28 108 Z" fill="#92400E" />
      <circle cx="20" cy="52" r="16" fill="#16A34A" />
      <path d="M116 108 Q122 78 118 56 Q110 78 112 108 Z" fill="#92400E" />
      <circle cx="120" cy="52" r="16" fill="#16A34A" />

      {/* Cottage Structure */}
      <rect x="46" y="68" width="48" height="38" rx="5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      <polygon points="40,70 70,40 100,70" fill="url(#cottageRoof)" stroke="#451A03" strokeWidth="1.5" />
      <rect x="76" y="44" width="8" height="14" fill="#78350F" />

      {/* Glowing Door */}
      <path d="M62 106 L62 86 Q70 80 78 86 L78 106 Z" fill="url(#goldAcc)" stroke="#D97706" strokeWidth="1.5" />
      <circle cx="70" cy="94" r="3" fill="#FFFBEB" />

      {/* Lantern */}
      <rect x="50" y="96" width="6" height="10" rx="1.5" fill="#F59E0B" />
      <circle cx="53" cy="101" r="2" fill="#FEF08A" />
    </svg>
  );
};
