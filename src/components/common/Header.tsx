import React from 'react';
import { ArrowLeft, Flame, Star } from 'lucide-react';
import { ChildProfile } from '../../types';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  activeChild?: ChildProfile;
  onSelectChild?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  activeChild,
  onSelectChild,
  rightAction,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#EEF8FF]/90 backdrop-blur-md px-4 py-2.5 border-b border-[#C9E1ED]/60 flex items-center justify-between min-h-[56px]">
      {/* Zone 1: Left Action / Child Avatar */}
      <div className="flex items-center gap-2">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Kembali"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#C9E1ED] text-[#164C68] hover:bg-[#EEF8FF] active:scale-95 transition-all shadow-xs"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
        ) : activeChild ? (
          <button
            onClick={onSelectChild}
            aria-label="Ganti Profil Anak"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white border border-[#C9E1ED] hover:border-[#08B9EF] active:scale-98 transition-all shadow-xs"
          >
            <span className="text-xl" role="img" aria-label="Avatar">
              {activeChild.avatar}
            </span>
            <span className="text-xs font-bold text-[#164C68] max-w-[80px] truncate">
              {activeChild.name}
            </span>
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Zone 2: Title */}
      <div className="flex-1 px-2 text-center overflow-hidden">
        <h1 className="text-base font-bold text-[#164C68] truncate font-heading tracking-tight">
          {title || 'Cahaya Tahfiz'}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-[#8C9BA7] font-medium truncate -mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Zone 3: Right Stats & Badges */}
      <div className="flex items-center gap-1.5">
        {rightAction ? (
          rightAction
        ) : activeChild ? (
          <div className="flex items-center gap-1.5">
            {/* Streak */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-600 text-xs font-bold shadow-2xs">
              <Flame size={14} className="fill-orange-500 text-orange-500" />
              <span>{activeChild.streakDays}</span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-200/80 text-amber-700 text-xs font-bold shadow-2xs">
              <Star size={14} className="fill-yellow-400 text-yellow-500" />
              <span>{activeChild.totalStars}</span>
            </div>
          </div>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  );
};
