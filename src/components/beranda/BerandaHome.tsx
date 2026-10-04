import React from 'react';
import {
  Sparkles,
  Flame,
  Star,
  Play,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookOpen,
  Headphones,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { ChildProfile, ChildBlockProgress, ChildAyahProgress } from '../../types';
import { CompanionData } from '../../types/companion';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { LivingCompanionCard } from '../companion/LivingCompanionCard';
import { DailyQuestsCard } from '../companion/DailyQuestsCard';

interface BerandaHomeProps {
  child: ChildProfile;
  companion: CompanionData;
  lastSession: {
    surahNumber: number;
    surahName: string;
    blockNumber: number;
    startAyah: number;
    endAyah: number;
    mode: string;
  };
  blockProgressList: ChildBlockProgress[];
  ayahProgressList: ChildAyahProgress[];
  onNavigateToTahfizStep: (step: 'dengar' | 'latihan' | 'hafalan') => void;
  onResumeLastSession: () => void;
  onOpenMurojaahDue: () => void;
  onOpenRoom: () => void;
  onOpenWorldMap: () => void;
  onRefreshCompanion: () => void;
  onNavigateToModule: (actionType: string) => void;
}

export const BerandaHome: React.FC<BerandaHomeProps> = ({
  child,
  companion,
  lastSession,
  blockProgressList,
  ayahProgressList,
  onNavigateToTahfizStep,
  onResumeLastSession,
  onOpenMurojaahDue,
  onOpenRoom,
  onOpenWorldMap,
  onRefreshCompanion,
  onNavigateToModule,
}) => {
  const memorizedBlocksCount = blockProgressList.filter((b) => b.state === 'MEMORIZED').length;
  const learningBlocksCount = blockProgressList.filter((b) => b.state === 'LEARNING').length;
  const memorizedAyahsCount = ayahProgressList.filter((a) => a.memorized).length;
  const weakAyahsCount = ayahProgressList.filter((a) => a.needsReview).length;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* 1. Living Companion Card (Hero with Lumi, Emotion, Garden Streak, Spaced Repetition Advice) */}
      <LivingCompanionCard
        child={child}
        companion={companion}
        ayahProgressList={ayahProgressList}
        blockProgressList={blockProgressList}
        onOpenRoom={onOpenRoom}
        onOpenWorldMap={onOpenWorldMap}
        onRefreshCompanion={onRefreshCompanion}
      />

      {/* 2. Continue Learning Last Session Card */}
      <div className="bg-gradient-to-r from-[#FF7A50] to-[#FF946F] text-white rounded-3xl p-5 shadow-md shadow-orange-500/25 flex items-center justify-between">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/25 text-[11px] font-bold">
            ↻ Lanjutkan Belajar
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black font-heading tracking-tight">
              {lastSession.surahName}
            </h3>
            <span className="font-quran text-xl text-white/95">
              {SURAHS_METADATA.find((s) => s.number === lastSession.surahNumber)?.nameArabic || 'الكهف'}
            </span>
          </div>
          <p className="text-xs text-orange-100 font-semibold">
            Blok {lastSession.blockNumber} (Ayat {lastSession.startAyah}–{lastSession.endAyah}) • Hari ini
          </p>
        </div>

        <button
          onClick={onResumeLastSession}
          className="w-14 h-14 rounded-full bg-white text-[#FF7A50] flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-orange-50 cursor-pointer shrink-0"
          title="Lanjutkan Sesi Belajar"
        >
          <Play size={26} className="fill-[#FF7A50] ml-1" />
        </button>
      </div>

      {/* 3. Daily Quests Adventure Card (Petualangan Hari Ini) */}
      <DailyQuestsCard
        childId={child.id}
        onNavigateToModule={onNavigateToModule as any}
        onQuestsUpdated={onRefreshCompanion}
      />

      {/* 4. Murojaah Due Alert (if any weak ayahs exist) */}
      {weakAyahsCount > 0 && (
        <div
          onClick={onOpenMurojaahDue}
          className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 shadow-xs flex items-center justify-between cursor-pointer hover:bg-amber-100/50 transition-all select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shrink-0">
              ⏱️
            </div>
            <div>
              <h4 className="text-sm font-black text-[#164C68] font-heading">
                Murojaah Diperlukan
              </h4>
              <p className="text-xs text-[#8C9BA7] font-semibold mt-0.5">
                Ada {weakAyahsCount} ayat yang perlu disegarkan hafalannya
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-amber-700" />
        </div>
      )}

      {/* 5. Current Memorization Multi-Metric Grid */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider block px-1">
          PERKEMBANGAN HAFALAN ANAK
        </span>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-[#C9E1ED] rounded-3xl p-3.5 text-center shadow-xs">
            <span className="text-2xl font-black text-[#81E850] font-heading block">
              {memorizedBlocksCount}
            </span>
            <span className="text-[11px] font-bold text-[#164C68] block mt-0.5">
              Blok Hafal
            </span>
          </div>

          <div className="bg-white border border-[#C9E1ED] rounded-3xl p-3.5 text-center shadow-xs">
            <span className="text-2xl font-black text-[#08B9EF] font-heading block">
              {learningBlocksCount}
            </span>
            <span className="text-[11px] font-bold text-[#164C68] block mt-0.5">
              Sedang Dilatih
            </span>
          </div>

          <div className="bg-white border border-[#C9E1ED] rounded-3xl p-3.5 text-center shadow-xs">
            <span className="text-2xl font-black text-purple-600 font-heading block">
              {memorizedAyahsCount}
            </span>
            <span className="text-[11px] font-bold text-[#164C68] block mt-0.5">
              Ayat Tuntas
            </span>
          </div>
        </div>
      </div>

      {/* 6. Quick Launch Cards to 3 Steps */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider block px-1">
          AKSES CEPAT TAHFIZ (3-LANGKAH)
        </span>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => onNavigateToTahfizStep('dengar')}
            className="bg-white border border-[#C9E1ED] hover:border-amber-300 rounded-3xl p-3.5 text-center flex flex-col items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Headphones size={20} />
            </div>
            <span className="text-xs font-bold text-[#164C68]">Dengar</span>
          </button>

          <button
            onClick={() => onNavigateToTahfizStep('latihan')}
            className="bg-white border border-[#C9E1ED] hover:border-purple-300 rounded-3xl p-3.5 text-center flex flex-col items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <RotateCcw size={20} />
            </div>
            <span className="text-xs font-bold text-[#164C68]">Latihan</span>
          </button>

          <button
            onClick={() => onNavigateToTahfizStep('hafalan')}
            className="bg-white border border-[#C9E1ED] hover:border-cyan-300 rounded-3xl p-3.5 text-center flex flex-col items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#08B9EF] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award size={20} />
            </div>
            <span className="text-xs font-bold text-[#164C68]">Setoran</span>
          </button>
        </div>
      </div>
    </div>
  );
};
