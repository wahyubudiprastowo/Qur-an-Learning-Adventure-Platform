import React from 'react';
import { WordToken } from '../../types';
import { toArabicNumeral } from '../../data/quranData';

interface ArabicTextProps {
  arabicText: string;
  ayahNumber?: number;
  words?: WordToken[];
  activeWordIndex?: number | null;
  hiddenWordIndices?: Set<number>;
  onWordClick?: (index: number) => void;
  fontSize?: 'normal' | 'large' | 'xl';
  fontFamily?: 'noto' | 'amiri';
  className?: string;
  showWordMasking?: boolean;
  mode?: 'mushaf' | 'words';
}

export const ArabicText: React.FC<ArabicTextProps> = ({
  arabicText,
  ayahNumber,
  words,
  activeWordIndex = null,
  hiddenWordIndices = new Set(),
  onWordClick,
  fontSize = 'large',
  fontFamily = 'noto',
  className = '',
  showWordMasking = false,
  mode,
}) => {
  const fontClass = fontFamily === 'amiri' ? 'font-serif' : 'font-quran';

  const sizeClasses = {
    normal: 'text-2xl leading-[2.2]',
    large: 'text-3xl sm:text-4xl leading-[2.3]',
    xl: 'text-4xl sm:text-5xl leading-[2.4]',
  };

  // If in words mode (interactive practice, audio word tracking, or recall masking)
  const isInteractiveWordMode =
    mode === 'words' ||
    showWordMasking ||
    (activeWordIndex !== null && words && words.length > 0);

  if (isInteractiveWordMode && words && words.length > 0) {
    return (
      <div
        dir="rtl"
        className={`w-full text-right ${fontClass} ${sizeClasses[fontSize]} text-[#164C68] ${className}`}
      >
        {words.map((w, idx) => {
          const isHidden = showWordMasking && hiddenWordIndices.has(idx);
          const isActive = activeWordIndex === idx;

          if (isHidden) {
            return (
              <span
                key={idx}
                onClick={() => onWordClick?.(idx)}
                className="inline-block mx-1.5 px-3 py-0.5 rounded-xl border-2 border-dashed border-[#B797F6] bg-[#B797F6]/15 text-[#B797F6] cursor-pointer select-none transition-all hover:bg-[#B797F6]/25 align-middle"
                title="Sentuh untuk bantuan"
              >
                ••••
              </span>
            );
          }

          return (
            <span
              key={idx}
              onClick={() => onWordClick?.(idx)}
              className={`inline-block mx-0.5 px-1.5 py-0.5 rounded-xl transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#FFD83E] text-[#164C68] scale-105 shadow-sm font-bold ring-2 ring-amber-400'
                  : 'hover:bg-[#EEF8FF]'
              }`}
            >
              {w.arabic}
            </span>
          );
        })}
        {ayahNumber !== undefined && (
          <span className="inline-flex items-center justify-center mx-2 text-[#08B9EF] font-bold text-[0.8em] select-none align-middle font-quran">
            ۝{toArabicNumeral(ayahNumber)}
          </span>
        )}
      </div>
    );
  }

  // Mushaf mode: continuous, authentic Quranic calligraphy
  return (
    <p
      dir="rtl"
      className={`w-full text-right ${fontClass} ${sizeClasses[fontSize]} text-[#164C68] tracking-normal ${className}`}
    >
      <span>{arabicText}</span>
      {ayahNumber !== undefined && (
        <span className="inline-flex items-center justify-center mx-2 text-[#08B9EF] font-bold text-[0.85em] select-none align-baseline font-quran">
          ۝{toArabicNumeral(ayahNumber)}
        </span>
      )}
    </p>
  );
};
