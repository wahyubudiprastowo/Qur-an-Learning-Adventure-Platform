import React from 'react';
import { Mic, RefreshCw, ChevronRight, Play, Sparkles } from 'lucide-react';
import { ChildBlockProgress } from '../../types';

interface LatihanMenuProps {
  onSelectZiadah: () => void;
  onSelectMurojaah: () => void;
  lastSession: {
    surahNumber: number;
    surahName: string;
    blockNumber: number;
    mode: string;
  };
  learningBlocksCount: number;
  memorizedBlocksCount: number;
  onResumeLastPractice: () => void;
}

export const LatihanMenu: React.FC<LatihanMenuProps> = ({
  onSelectZiadah,
  onSelectMurojaah,
  lastSession,
  learningBlocksCount,
  memorizedBlocksCount,
  onResumeLastPractice,
}) => {
  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Friendly Motivation Banner */}
      <div className="bg-[#FFF5EB] border border-orange-200 rounded-3xl p-5 shadow-xs flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl shrink-0">
          ⭐
        </div>
        <div>
          <h3 className="text-base font-extrabold text-[#164C68] font-heading">
            Ucapkan hafalanmu!
          </h3>
          <p className="text-xs text-[#8C9BA7] font-medium mt-0.5 leading-snug">
            Baca dengan suara, teks dibuka sedikit demi sedikit 🎙️
          </p>
        </div>
      </div>

      <div className="pt-2">
        <span className="text-xs font-black text-[#8C9BA7] tracking-wider uppercase">
          PILIH MODE
        </span>
      </div>

      {/* Two Large Modes */}
      <div className="space-y-3.5">
        {/* Ziadah Card */}
        <button
          onClick={onSelectZiadah}
          className="w-full bg-gradient-to-r from-[#81E850] to-[#72d741] text-[#164C68] rounded-3xl p-5 shadow-md shadow-green-500/20 active:scale-[0.99] transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/90 text-green-700 flex items-center justify-center shadow-xs shrink-0 text-2xl">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-black font-heading text-[#164C68]">
                  Ziadah
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-white/70 text-[10px] font-bold text-green-900">
                  + Mulai di sini
                </span>
              </div>
              <p className="text-xs text-[#164C68]/80 font-semibold mt-1">
                Latih hafalan baru
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/50 text-[11px] font-bold text-[#164C68]">
                <span>{learningBlocksCount} sedang dihafal</span>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-[#164C68] group-hover:translate-x-1 transition-transform">
            <ChevronRight size={22} strokeWidth={2.5} />
          </div>
        </button>

        {/* Murojaah Card */}
        <button
          onClick={onSelectMurojaah}
          className="w-full bg-gradient-to-r from-[#B797F6] to-[#a07ced] text-white rounded-3xl p-5 shadow-md shadow-purple-500/20 active:scale-[0.99] transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/90 text-purple-600 flex items-center justify-center shadow-xs shrink-0 text-2xl">
              ⏱️
            </div>
            <div>
              <h4 className="text-xl font-black font-heading text-white">
                Murojaah
              </h4>
              <p className="text-xs text-purple-100 font-semibold mt-1">
                Latih hafalan lama biar makin nempel
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold text-white">
                <span>{memorizedBlocksCount} sudah hafal</span>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
            <ChevronRight size={22} strokeWidth={2.5} />
          </div>
        </button>
      </div>

      {/* Terakhir Kamu Latih Section */}
      <div className="pt-4 space-y-2">
        <span className="text-xs font-black text-[#8C9BA7] tracking-wider uppercase">
          TERAKHIR KAMU LATIH
        </span>

        <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-600 border border-green-200 flex items-center justify-center text-xl shrink-0">
              🌱
            </div>
            <div>
              <h5 className="text-sm font-bold text-[#164C68] font-heading">
                {lastSession.surahName} • {lastSession.mode === 'ziadah' ? 'Ziadah' : 'Murojaah'}
              </h5>
              <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
                Blok {lastSession.blockNumber} • Hari ini
              </p>
            </div>
          </div>

          <button
            onClick={onResumeLastPractice}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EEF8FF] hover:bg-[#d8eefc] text-[#08B9EF] font-bold text-xs active:scale-95 transition-all cursor-pointer border border-[#C9E1ED]"
          >
            <Mic size={14} />
            <span>Latih Lagi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
