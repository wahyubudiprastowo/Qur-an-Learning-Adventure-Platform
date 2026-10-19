import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Sparkles, CheckCircle2, Zap, Award, Target, Flame } from 'lucide-react';
import { Button } from './Button';

export interface RewardBreakdownItem {
  label: string;
  value: string | number;
  type?: 'accuracy' | 'speed' | 'first_try' | 'difficulty' | 'bonus';
}

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  starsEarned: number;
  xpEarned: number;
  nextLabel?: string;
  onNext?: () => void;
  sourceNodeTitle?: string;
  accuracy?: { correct: number; total: number };
  breakdownItems?: RewardBreakdownItem[];
  firstTryBonus?: number;
  speedBonus?: number;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  starsEarned,
  xpEarned,
  nextLabel = 'Lanjutkan Belajar',
  onNext,
  sourceNodeTitle,
  accuracy,
  breakdownItems,
  firstTryBonus,
  speedBonus,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#08B9EF', '#FFD83E', '#81E850', '#B797F6', '#FF946F'],
        });
      } catch (e) {
        // Fallback gracefully
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Compile active breakdown items
  const items: RewardBreakdownItem[] = [...(breakdownItems || [])];

  if (accuracy && !items.some((i) => i.type === 'accuracy')) {
    items.unshift({
      label: 'Akurasi',
      value: `Benar ${accuracy.correct}/${accuracy.total}`,
      type: 'accuracy',
    });
  }

  if (speedBonus && speedBonus > 0 && !items.some((i) => i.type === 'speed')) {
    items.push({
      label: 'Bonus kecepatan',
      value: `+${speedBonus}`,
      type: 'speed',
    });
  }

  if (firstTryBonus && firstTryBonus > 0 && !items.some((i) => i.type === 'first_try')) {
    items.push({
      label: 'Baru pertama kali',
      value: `+${firstTryBonus}`,
      type: 'first_try',
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Soft Background glow */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-yellow-100 rounded-full blur-2xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-cyan-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Badge Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-white shadow-lg shadow-yellow-500/25 mb-3 animate-bounce">
            <Star size={42} className="fill-white" />
          </div>

          {/* Node Achievement Tag */}
          {sourceNodeTitle && (
            <div className="mb-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black inline-flex items-center gap-1.5 shadow-2xs">
              <Star size={13} className="fill-amber-400 text-amber-500" />
              <span>+{starsEarned} untuk {sourceNodeTitle}</span>
            </div>
          )}

          <h2 className="text-2xl font-extrabold text-[#164C68] font-heading mb-1">
            {title}
          </h2>
          <p className="text-xs text-[#8C9BA7] mb-4 font-medium leading-relaxed">
            {message}
          </p>

          {/* Performance Breakdown Chips */}
          {items.length > 0 && (
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 mb-4 space-y-1 text-left">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                Rincian Skor Performa:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#164C68] shadow-2xs"
                  >
                    {item.type === 'accuracy' && <Target size={12} className="text-emerald-500" />}
                    {item.type === 'speed' && <Zap size={12} className="text-amber-500" />}
                    {item.type === 'first_try' && <Award size={12} className="text-purple-500" />}
                    <span>{item.label}:</span>
                    <span className="text-[#08B9EF] font-black">{item.value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reward Badges */}
          <div className="flex items-center justify-center gap-3 w-full mb-6">
            <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-2xl py-3 px-2 flex flex-col items-center">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Bintang</span>
              <div className="flex items-center gap-1 text-xl font-black text-amber-700 font-heading">
                <Star size={20} className="fill-yellow-400 text-yellow-500" />
                <span>+{starsEarned}</span>
              </div>
            </div>

            <div className="flex-1 bg-cyan-50 border border-cyan-200 rounded-2xl py-3 px-2 flex flex-col items-center">
              <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">Poin XP</span>
              <div className="flex items-center gap-1 text-xl font-black text-[#08B9EF] font-heading">
                <Sparkles size={20} />
                <span>+{xpEarned}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="green"
            size="lg"
            fullWidth
            onClick={() => {
              onClose();
              onNext?.();
            }}
            icon={<CheckCircle2 size={20} />}
          >
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
