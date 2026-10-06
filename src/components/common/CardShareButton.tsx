import React from 'react';
import { Share2 } from 'lucide-react';

interface CardShareButtonProps {
  onShare: (e: React.MouseEvent) => void;
  title?: string;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'floating' | 'inline';
}

export const CardShareButton: React.FC<CardShareButtonProps> = ({
  onShare,
  title = 'Bagikan kartu ini',
  className = '',
  size = 'sm',
  variant = 'floating',
}) => {
  const isFloating = variant === 'floating';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onShare(e);
      }}
      title={title}
      aria-label={title}
      className={`
        ${
          isFloating
            ? 'absolute top-2 right-2 z-20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-all duration-200'
            : 'inline-flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity'
        }
        bg-black/40 hover:bg-black/65 text-white active:scale-95
        backdrop-blur-md rounded-full border border-white/25 shadow-xs
        cursor-pointer flex items-center justify-center
        ${size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'}
        ${className}
      `}
    >
      <Share2 size={size === 'sm' ? 13 : 15} className="text-white drop-shadow-xs" />
    </button>
  );
};
