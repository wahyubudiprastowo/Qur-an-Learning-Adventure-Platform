import React, { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { CompanionData } from '../../types/companion';
import { getStageForXp } from '../../data/companionData';

import { CompanionSprite } from './CompanionSprite';

interface SubtleCompanionReactionProps {
  companion: CompanionData;
  pulseTrigger?: number; // whenever this number changes, trigger gentle micro celebration
  message?: string;
}

export const SubtleCompanionReaction: React.FC<SubtleCompanionReactionProps> = ({
  companion,
  pulseTrigger = 0,
  message,
}) => {
  const [showPulse, setShowPulse] = useState(false);
  const stageConfig = getStageForXp(companion.xp);

  useEffect(() => {
    if (pulseTrigger > 0) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [pulseTrigger]);

  return (
    <div className="fixed bottom-20 right-4 z-30 pointer-events-none select-none flex items-center gap-2">
      {/* Micro Encouragement bubble */}
      {showPulse && (
        <div className="bg-white/95 backdrop-blur-md border border-[#C9E1ED] text-[#164C68] text-[11px] font-bold py-1 px-2.5 rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-400 fill-current" />
          <span>{message || 'Alhamdulillah! +1 🐾'}</span>
        </div>
      )}

      {/* Floating subtle mascot badge */}
      <div
        className={`w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-md border-2 shadow-md flex items-center justify-center transition-all duration-300 overflow-hidden ${
          showPulse
            ? 'scale-110 border-[#81E850] ring-4 ring-emerald-200'
            : 'border-[#C9E1ED] hover:scale-105'
        }`}
        title={`Teman Belajarmu: ${companion.name} (${stageConfig.name})`}
      >
        <CompanionSprite
          species={companion.species || 'lumi'}
          stage={stageConfig.id}
          mood={companion.mood || 'content'}
          size={42}
        />
      </div>
    </div>
  );
};
