import React from 'react';

interface WorldLandVisualProps {
  landId: string;
  size?: number;
  isLocked?: boolean;
}

export const WorldLandVisual: React.FC<WorldLandVisualProps> = ({
  landId,
  size = 50,
  isLocked = false,
}) => {
  const filterClass = isLocked ? 'grayscale opacity-60' : '';

  switch (landId) {
    case 'lembah-fatihah':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md transition-all ${filterClass}`}
        >
          {/* Valley hills */}
          <path d="M4 52C16 32 30 38 42 26C48 34 56 46 60 52H4Z" fill="#10B981" />
          <path d="M12 52C22 36 34 40 44 32C49 38 56 48 58 52H12Z" fill="#34D399" />
          {/* River */}
          <path
            d="M26 38C26 38 32 44 28 52H36C38 46 32 40 32 38"
            fill="#38BDF8"
          />
          {/* Sun */}
          <circle cx="48" cy="16" r="8" fill="#FBBF24" />
          {/* Palm trees */}
          <path d="M18 42V32" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 30C16 32 18 32 18 32C18 32 20 32 22 30" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 33C17 34 18 33 18 33C18 33 19 34 21 33" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'taman-hidayah':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md transition-all ${filterClass}`}
        >
          <circle cx="32" cy="32" r="28" fill="#ECFDF5" />
          {/* Arch */}
          <path
            d="M20 50V30C20 22 26 16 32 16C38 16 44 22 44 30V50"
            stroke="#059669"
            strokeWidth="3"
            fill="#A7F3D0"
          />
          {/* Lantern */}
          <path d="M32 22V28" stroke="#D97706" strokeWidth="1.5" />
          <polygon points="30,28 34,28 35,34 29,34" fill="#F59E0B" />
          <circle cx="32" cy="31" r="2" fill="#FEF3C7" />
          {/* Flowers */}
          <circle cx="24" cy="46" r="3" fill="#EC4899" />
          <circle cx="40" cy="46" r="3" fill="#8B5CF6" />
        </svg>
      );

    case 'bukit-tartil':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md transition-all ${filterClass}`}
        >
          {/* Mountain peaks */}
          <polygon points="8,54 32,14 48,54" fill="#6366F1" />
          <polygon points="26,54 44,22 58,54" fill="#818CF8" />
          {/* Snow / Light crest */}
          <polygon points="26,24 32,14 38,24 34,22 32,24 30,22" fill="#E0E7FF" />
          {/* Star above */}
          <polygon points="32,6 33.5,10 38,10 34.5,12.5 36,17 32,14 28,17 29.5,12.5 26,10 30.5,10" fill="#FBBF24" />
        </svg>
      );

    case 'telaga-kausar':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md transition-all ${filterClass}`}
        >
          {/* Circular Pond */}
          <ellipse cx="32" cy="38" rx="26" ry="16" fill="#0284C7" />
          <ellipse cx="32" cy="38" rx="22" ry="12" fill="#38BDF8" />
          <ellipse cx="32" cy="38" rx="14" ry="7" fill="#BAE6FD" />
          {/* Fountain Spout */}
          <path d="M32 38V18" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 18C30 12 24 14 22 18" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 18C34 12 40 14 42 18" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          {/* Sparkles */}
          <circle cx="28" cy="22" r="1.5" fill="#FFFFFF" />
          <circle cx="36" cy="20" r="1.5" fill="#FFFFFF" />
        </svg>
      );

    case 'hutan-hikmah':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md transition-all ${filterClass}`}
        >
          {/* Tree 1 */}
          <rect x="20" y="34" width="4" height="18" rx="2" fill="#78350F" />
          <circle cx="22" cy="28" r="12" fill="#059669" />
          <circle cx="22" cy="24" r="8" fill="#10B981" />
          {/* Tree 2 */}
          <rect x="40" y="30" width="4" height="22" rx="2" fill="#78350F" />
          <circle cx="42" cy="24" r="14" fill="#047857" />
          <circle cx="42" cy="20" r="10" fill="#34D399" />
          {/* Little scroll / book */}
          <rect x="28" y="44" width="10" height="8" rx="1.5" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
        </svg>
      );

    case 'lembah-furqan':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md transition-all ${filterClass}`}
        >
          {/* Canyon walls */}
          <polygon points="4,54 18,20 28,54" fill="#EA580C" />
          <polygon points="36,54 48,16 60,54" fill="#C2410C" />
          {/* Sunbeams */}
          <polygon points="32,10 26,54 38,54" fill="#FEF08A" opacity="0.6" />
          <circle cx="32" cy="14" r="6" fill="#F59E0B" />
        </svg>
      );

    case 'puncak-tajwid':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md transition-all ${filterClass}`}
        >
          {/* Crystal Mountain */}
          <polygon points="12,54 32,10 46,36 54,54" fill="#9333EA" />
          <polygon points="24,54 32,10 40,54" fill="#C084FC" />
          {/* Gem facet */}
          <polygon points="32,10 26,26 32,32 38,26" fill="#F3E8FF" />
          <circle cx="32" cy="6" r="3" fill="#FDE047" />
        </svg>
      );

    case 'kota-anshar':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md transition-all ${filterClass}`}
        >
          {/* Minaret */}
          <rect x="14" y="24" width="6" height="30" fill="#E2E8F0" />
          <polygon points="13,24 17,14 21,24" fill="#0D9488" />
          {/* Central Dome */}
          <rect x="22" y="32" width="28" height="22" rx="2" fill="#F1F5F9" />
          <ellipse cx="36" cy="32" rx="12" ry="10" fill="#0D9488" />
          {/* Gate */}
          <path d="M31 54V42C31 39 41 39 41 42V54H31Z" fill="#0F766E" />
          {/* Crescent */}
          <path d="M36 18C37.5 18 39 19 39 20.5C39 22 37.5 23 36 23C35 23 34.2 22.5 34 21.8C34.8 21.8 35.5 21.2 35.5 20.5C35.5 19.8 34.8 19.2 34 19.2C34.5 18.5 35.2 18 36 18Z" fill="#FBBF24" />
        </svg>
      );

    case 'taman-firdaus':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md transition-all ${filterClass}`}
        >
          {/* Paradise garden & golden river */}
          <circle cx="32" cy="32" r="28" fill="#FEF9C3" />
          <path d="M8 44C20 30 40 46 56 38" stroke="#10B981" strokeWidth="8" strokeLinecap="round" />
          <path d="M12 48C24 38 36 44 50 34" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          {/* Golden fruits */}
          <circle cx="20" cy="22" r="4" fill="#EF4444" />
          <circle cx="44" cy="20" r="4" fill="#F59E0B" />
          <circle cx="32" cy="14" r="5" fill="#8B5CF6" />
        </svg>
      );

    case 'istana-nur':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md transition-all ${filterClass}`}
        >
          {/* Golden palace dome */}
          <ellipse cx="32" cy="28" rx="18" ry="16" fill="#F59E0B" />
          <ellipse cx="32" cy="28" rx="14" ry="12" fill="#FBBF24" />
          <rect x="18" y="28" width="28" height="26" fill="#FEF3C7" />
          {/* Grand Arch */}
          <path d="M26 54V38C26 33 38 33 38 38V54H26Z" fill="#B45309" />
          {/* Halo / Ray of Divine Light */}
          <circle cx="32" cy="10" r="4" fill="#FDE047" />
          <line x1="32" y1="2" x2="32" y2="6" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="6" x2="27" y2="8" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="6" x2="37" y2="8" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-cyan-100 flex items-center justify-center text-2xl shadow-sm ${filterClass}`}
        >
          <span>🗺️</span>
        </div>
      );
  }
};
