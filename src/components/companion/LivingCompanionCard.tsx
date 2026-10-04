import React, { useState } from 'react';
import { Sparkles, Heart, Compass, Home, ChevronRight, Award } from 'lucide-react';
import { ChildProfile, ChildAyahProgress, ChildBlockProgress } from '../../types';
import { CompanionData, StageConfig } from '../../types/companion';
import { getStageForXp, COMPANION_STAGES } from '../../data/companionData';
import { CompanionService } from '../../services/companionService';

interface LivingCompanionCardProps {
  child: ChildProfile;
  companion: CompanionData;
  ayahProgressList: ChildAyahProgress[];
  blockProgressList: ChildBlockProgress[];
  onOpenRoom: () => void;
  onOpenWorldMap: () => void;
  onRefreshCompanion: () => void;
}

export const LivingCompanionCard: React.FC<LivingCompanionCardProps> = ({
  child,
  companion,
  ayahProgressList,
  blockProgressList,
  onOpenRoom,
  onOpenWorldMap,
  onRefreshCompanion,
}) => {
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [dialogue, setDialogue] = useState(companion.dialogueMessage || 'Ayo kita lanjutkan petualangan Al-Qur\'an hari ini!');

  const stageConfig = getStageForXp(companion.xp);
  const nextStageIdx = COMPANION_STAGES.findIndex((s) => s.id === stageConfig.id) + 1;
  const nextStage = COMPANION_STAGES[nextStageIdx] || stageConfig;

  const xpInStage = companion.xp - stageConfig.minXp;
  const xpNeededForNext = nextStage.minXp - stageConfig.minXp || 100;
  const progressPercent = Math.min(100, Math.max(10, Math.round((xpInStage / xpNeededForNext) * 100)));

  // Spaced repetition intelligent recommendation from Lumi
  const weakAyahs = ayahProgressList.filter((a) => a.needsReview);
  let intelligentAdvice = 'Ingatan kita seperti kebun bunga, disiram murojaah setiap hari agar mekar indah!';
  if (weakAyahs.length > 0) {
    intelligentAdvice = `Lumi mendeteksi ada ${weakAyahs.length} ayat yang rindu kita latih lagi. Yuk murojaah sebentar! 🌙`;
  } else if (companion.stage === 'egg') {
    intelligentAdvice = 'Telur misterius ini terasa hangat saat mendengar suara tartil. Ayo dengarkan ayat pertama!';
  } else if (companion.stage === 'hatchling') {
    intelligentAdvice = 'Lumi senang sekali sudah menetas! Telinga Lumi suka sekali mendengar nada qari merdu.';
  }

  const handlePet = () => {
    setShowHeartAnim(true);
    const res = CompanionService.petCompanion(child.id);
    setDialogue(res.message);
    setTimeout(() => setShowHeartAnim(false), 1200);
    onRefreshCompanion();
  };

  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const gardenDays = companion.gardenDays || [true, false, false, false, false, false, false];

  return (
    <div className="bg-gradient-to-b from-[#F0FAFF] via-[#E4F5FD] to-[#D5EEFB] border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm relative overflow-hidden space-y-4">
      {/* Decorative Pastel Meadow Backdrop Layer */}
      <div className="absolute top-0 right-0 left-0 h-28 bg-gradient-to-b from-cyan-100/40 to-transparent pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-[#81E850]/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -top-8 -left-8 w-36 h-36 bg-[#08B9EF]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header: Child Greeting & Companion Level */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#C9E1ED] shadow-xs flex items-center justify-center text-xl shrink-0">
            {child.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#8C9BA7] uppercase tracking-wider">
                Teman Perjalanan
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#81E850] animate-pulse" />
            </div>
            <h3 className="text-base font-black text-[#164C68] font-heading">
              {companion.name} ({stageConfig.name})
            </h3>
          </div>
        </div>

        {/* Level Badge */}
        <div className="flex items-center gap-1.5 bg-white/90 border border-[#C9E1ED] rounded-2xl px-3 py-1 shadow-xs">
          <Sparkles size={14} className="text-[#FFD83E] fill-current" />
          <span className="text-xs font-black text-[#164C68]">Lv. {companion.level}</span>
        </div>
      </div>

      {/* Interactive Companion Living Habitat */}
      <div className="bg-white/80 backdrop-blur-xs border border-[#C9E1ED] rounded-3xl p-4 relative z-10 flex flex-col sm:flex-row items-center gap-4">
        {/* Companion Interactive Sprite with Soft Floating Animation */}
        <div
          onClick={handlePet}
          className="relative cursor-pointer select-none group flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-white to-cyan-50/50 border border-cyan-100 shadow-xs hover:scale-105 active:scale-95 transition-all"
          title="Sentuh untuk menyapa Lumi!"
        >
          {/* Floating Heart animation on click */}
          {showHeartAnim && (
            <div className="absolute -top-3 text-red-500 animate-bounce flex items-center gap-1 z-20 bg-white px-2 py-0.5 rounded-full border border-red-200 shadow-sm text-xs font-bold">
              <Heart size={14} className="fill-current text-red-500" />
              <span>Sayang Lumi!</span>
            </div>
          )}

          <div className="text-6xl animate-pulse filter drop-shadow-md py-1">
            {stageConfig.avatarIcon}
          </div>

          <span className="text-[10px] font-bold text-[#08B9EF] mt-1 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
            {stageConfig.subtitle}
          </span>
        </div>

        {/* Speech Bubble & Spaced Repetition Advice */}
        <div className="flex-1 space-y-2 text-left">
          <div className="bg-white border border-[#C9E1ED] rounded-2xl p-3 shadow-xs relative">
            <p className="text-xs text-[#164C68] font-semibold leading-relaxed">
              "{dialogue}"
            </p>
            <p className="text-[10px] text-[#8C9BA7] font-medium mt-1 flex items-center gap-1">
              <span>💡</span> {intelligentAdvice}
            </p>
          </div>

          {/* XP Progress to Next Stage */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#164C68]">
              <span>Progres Tumbuh: {companion.xp} XP</span>
              <span className="text-[#8C9BA7]">
                Menuju {nextStage.name} ({nextStage.minXp} XP)
              </span>
            </div>
            <div className="w-full bg-[#E2EEF5] h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-[#08B9EF] to-[#81E850] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Non-Punitive Weekly Learning Garden (Streak Tanaman) */}
      <div className="bg-white/80 border border-[#C9E1ED] rounded-2xl p-3 relative z-10">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-[#164C68] flex items-center gap-1.5">
            <span>🌱</span> Kebun Belajar Mingguan
          </span>
          <span className="text-[10px] text-[#8C9BA7] font-semibold">
            {gardenDays.filter(Boolean).length}/7 Hari Mekar
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {dayNames.map((day, idx) => {
            const isBloomed = gardenDays[idx];
            return (
              <div
                key={day}
                className={`py-1.5 px-1 rounded-xl border transition-all ${
                  isBloomed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span className="text-[10px] font-bold block">{day}</span>
                <span className="text-base block mt-0.5">
                  {isBloomed ? ['🌱', '🌿', '🌷', '🌳', '🌼', '✨', '🏆'][idx] : '○'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Shortcuts: Kamar Lumi & Peta Petualangan */}
      <div className="grid grid-cols-2 gap-2.5 relative z-10 pt-1">
        <button
          onClick={onOpenRoom}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white border border-[#C9E1ED] hover:border-[#08B9EF] text-[#164C68] font-bold text-xs shadow-xs hover:bg-cyan-50/50 transition-all cursor-pointer"
        >
          <Home size={16} className="text-[#08B9EF]" />
          <span>Kamar Lumi</span>
        </button>

        <button
          onClick={onOpenWorldMap}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#08B9EF] to-[#07a6d7] text-white font-bold text-xs shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Compass size={16} />
          <span>Peta Dunia</span>
        </button>
      </div>
    </div>
  );
};
