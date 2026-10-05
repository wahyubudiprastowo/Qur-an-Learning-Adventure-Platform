import React, { useState } from 'react';
import { Compass, CheckCircle2, Star, Sparkles, Gift } from 'lucide-react';
import { DailyQuest } from '../../types/companion';
import { CompanionService } from '../../services/companionService';

interface DailyQuestsCardProps {
  childId: string;
  onNavigateToModule: (actionType: DailyQuest['actionType']) => void;
  onQuestsUpdated: () => void;
}

export const DailyQuestsCard: React.FC<DailyQuestsCardProps> = ({
  childId,
  onNavigateToModule,
  onQuestsUpdated,
}) => {
  const quests = CompanionService.getDailyQuests(childId);
  const isBonusClaimed = CompanionService.isDailyBonusClaimed(childId);
  const allCompleted = quests.every((q) => q.completed);

  const [bonusClaimedNotice, setBonusClaimedNotice] = useState(false);

  const handleClaimBonus = () => {
    const success = CompanionService.claimDailyBonus(childId);
    if (success) {
      setBonusClaimedNotice(true);
      onQuestsUpdated();
      setTimeout(() => setBonusClaimedNotice(false), 3000);
    }
  };

  return (
    <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center text-sm shadow-xs">
            <Compass size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#164C68] font-heading">
              Petualangan Hari Ini
            </h3>
            <p className="text-[11px] text-[#8C9BA7] font-medium">
              Selesaikan misi harian tanpa beban & kumpulkan bintang
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-[#08B9EF] bg-[#EEF8FF] px-2.5 py-1 rounded-full border border-[#C9E1ED]">
          {quests.filter((q) => q.completed).length}/{quests.length} Selesai
        </span>
      </div>

      {/* Quests List */}
      <div className="space-y-2.5">
        {quests.map((quest) => {
          const progressPercent = Math.min(100, Math.round((quest.current / quest.target) * 100));

          return (
            <div
              key={quest.id}
              onClick={() => {
                if (!quest.completed) {
                  onNavigateToModule(quest.actionType);
                }
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                quest.completed
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-[#F9FCFE] border-[#C9E1ED] hover:border-[#08B9EF]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{quest.icon}</span>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        quest.completed ? 'text-emerald-800 line-through' : 'text-[#164C68]'
                      }`}
                    >
                      {quest.title}
                    </h4>
                    <p className="text-[10px] text-[#8C9BA7] font-medium">{quest.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
                  {quest.completed ? (
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-lg text-[11px]">
                      <CheckCircle2 size={13} /> Selesai
                    </span>
                  ) : (
                    <span className="text-[#8C9BA7]">
                      {quest.current}/{quest.target} {quest.unit}
                    </span>
                  )}
                </div>
              </div>

              {/* Quest Progress Bar */}
              <div className="w-full bg-[#E2EEF5] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    quest.completed ? 'bg-emerald-500' : 'bg-[#08B9EF]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Reward Pills: Star, XP, and Pet Happiness Boost */}
              <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-100/80 text-[10px] font-bold">
                <span className="text-[#8C9BA7]">Hadiah Petualangan:</span>
                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                  ⭐ +{quest.starReward}
                </span>
                <span className="bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                  ✨ +{quest.xpReward} XP
                </span>
                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                  💖 +{quest.happinessReward || 15}% Bahagia
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Bonus Reward Button */}
      {allCompleted && !isBonusClaimed && (
        <button
          onClick={handleClaimBonus}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white font-black text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer animate-pulse"
        >
          <Gift size={16} />
          <span>Klaim Bonus Petualangan: +30 ⭐ & +40 XP</span>
        </button>
      )}

      {bonusClaimedNotice && (
        <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-center text-xs font-bold animate-in fade-in">
          🎉 Alhamdulillah! Bonus 30 Bintang berhasil ditambahkan ke sakumu!
        </div>
      )}
    </div>
  );
};
