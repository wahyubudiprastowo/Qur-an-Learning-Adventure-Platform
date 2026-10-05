import React from 'react';
import { Sparkles, Star, Award, Heart, CheckCircle2 } from 'lucide-react';
import { StageConfig } from '../../types/companion';
import { Button } from '../common/Button';
import { CompanionSprite } from './CompanionSprite';
import { RewardStarVisual } from './ObjectVisuals';

interface MilestoneCelebrationModalProps {
  isOpen: boolean;
  type: 'hatch' | 'stage_up' | 'level_up';
  stage: StageConfig;
  level: number;
  bonusStars?: number;
  onClose: () => void;
}

export const MilestoneCelebrationModal: React.FC<MilestoneCelebrationModalProps> = ({
  isOpen,
  type,
  stage,
  level,
  bonusStars = 100,
  onClose,
}) => {
  if (!isOpen) return null;

  const title =
    type === 'hatch'
      ? '🎉 TELUR TELAH MENETAS!'
      : type === 'stage_up'
      ? '🌟 EVOLUSI SAHABAT CAHAYA!'
      : '✨ LEVEL UP! MAKIN MAHIR!';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-white via-cyan-50/50 to-white rounded-3xl p-6 shadow-2xl border-4 border-[#FFD83E] text-center space-y-4 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Decorative rays */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
          <Sparkles size={14} className="fill-current text-amber-500" />
          <span>{title}</span>
        </div>

        {/* Animated Avatar Icon */}
        <div className="py-2 flex flex-col items-center justify-center">
          <div className="animate-bounce filter drop-shadow-xl inline-block">
            <CompanionSprite stage={stage.id} mood="celebrating" size={135} />
          </div>
          <h2 className="text-xl font-black text-[#164C68] font-heading mt-2">
            {stage.name} (Tingkat {level})
          </h2>
          <p className="text-xs text-[#08B9EF] font-bold mt-0.5">{stage.subtitle}</p>
        </div>

        {/* Story Quote */}
        <div className="bg-white border border-[#C9E1ED] rounded-2xl p-3 shadow-xs text-xs text-[#164C68] font-semibold italic leading-relaxed">
          "{stage.storyQuote}"
        </div>

        {/* Unlocked Reward Box */}
        <div className="bg-gradient-to-r from-amber-50 to-cyan-50 border border-amber-200 rounded-2xl p-3.5 space-y-1.5 text-xs text-left">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <Award size={16} className="text-amber-500" />
            <span>KEMAMPUAN BARU DIBUKA:</span>
          </div>
          <p className="text-[11px] text-[#164C68] font-medium">
            {stage.unlockedAbility}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-black text-amber-800 pt-1 border-t border-amber-200/50">
            <Star size={14} className="fill-amber-400 text-amber-500" />
            <span>Bonus Milestone: +{bonusStars} ⭐ Bintang Belajar</span>
          </div>
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={onClose} icon={<CheckCircle2 size={18} />}>
          Alhamdulillah! Lanjut Belajar
        </Button>
      </div>
    </div>
  );
};
