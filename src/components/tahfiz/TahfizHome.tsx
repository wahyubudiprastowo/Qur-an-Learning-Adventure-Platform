import React from 'react';
import { Headphones, Mic, Award, Play, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { ChildProfile } from '../../types';
import { SURAHS_METADATA } from '../../data/surahsMetadata';

interface TahfizHomeProps {
  activeChild: ChildProfile;
  lastSession: {
    surahNumber: number;
    surahName: string;
    blockNumber: number;
    startAyah: number;
    endAyah: number;
    mode: string;
  };
  onSelectStep: (step: 'dengar' | 'latihan' | 'hafalan') => void;
  onResumeLastSession: () => void;
}

export const TahfizHome: React.FC<TahfizHomeProps> = ({
  activeChild,
  lastSession,
  onSelectStep,
  onResumeLastSession,
}) => {
  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Hero Banner Card */}
      <div className="bg-gradient-to-r from-[#08B9EF] to-[#0496c4] text-white rounded-3xl p-5 shadow-[0_6px_20px_rgba(8,185,239,0.25)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-1 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-lg">
            ⭐
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading">Tahfiz</h2>
            <p className="text-xs text-cyan-100 font-medium">
              3 langkah menghafal — pilih caramu ✨
            </p>
          </div>
        </div>
      </div>

      {/* Continue Last Session Card (Matches Screenshot Al-Kahf) */}
      <div className="bg-gradient-to-r from-[#FF7A50] to-[#FF946F] text-white rounded-3xl p-5 shadow-[0_6px_18px_rgba(255,122,80,0.25)] relative overflow-hidden flex items-center justify-between">
        <div className="space-y-1 relative z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/25 text-[11px] font-bold tracking-tight">
            <span className="animate-spin text-[10px]">↻</span> Lanjutkan
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black font-heading tracking-tight">
              {lastSession.surahName}
            </h3>
            <span className="font-quran text-xl text-white/95">
              {SURAHS_METADATA.find((s) => s.number === lastSession.surahNumber)?.nameArabic || 'الكهف'}
            </span>
          </div>
          <p className="text-xs text-orange-100 font-medium">
            Blok {lastSession.blockNumber} (Ayat {lastSession.startAyah}–{lastSession.endAyah}) • Hari ini
          </p>
        </div>

        <button
          onClick={onResumeLastSession}
          aria-label="Lanjutkan Sesi Terakhir"
          className="w-14 h-14 rounded-full bg-white text-[#FF7A50] flex items-center justify-center shadow-lg active:scale-95 transition-transform shrink-0 hover:bg-orange-50 cursor-pointer"
        >
          <Play size={26} className="fill-[#FF7A50] ml-1" />
        </button>
      </div>

      {/* 3 Sequential Steps Section */}
      <div className="space-y-3">
        {/* Step 1: Dengar */}
        <button
          onClick={() => onSelectStep('dengar')}
          className="w-full bg-white border border-[#C9E1ED] hover:border-[#FFD83E] rounded-3xl p-4.5 shadow-xs hover:shadow-md transition-all duration-150 flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 relative shrink-0">
              <Headphones size={26} className="text-amber-500" />
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-amber-400 text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                1
              </span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-[#164C68] font-heading group-hover:text-[#08B9EF] transition-colors">
                Dengar
              </h4>
              <p className="text-xs text-[#8C9BA7] font-medium mt-0.5 leading-snug">
                Dengar murottal & ikuti bacaannya
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[#8C9BA7] group-hover:text-[#08B9EF] group-hover:translate-x-1 transition-all" />
        </button>

        {/* Step 2: Latihan */}
        <button
          onClick={() => onSelectStep('latihan')}
          className="w-full bg-white border border-[#C9E1ED] hover:border-[#B797F6] rounded-3xl p-4.5 shadow-xs hover:shadow-md transition-all duration-150 flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 relative shrink-0">
              <Mic size={26} className="text-purple-500" />
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-purple-500 text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                2
              </span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-[#164C68] font-heading group-hover:text-[#B797F6] transition-colors">
                Latihan
              </h4>
              <p className="text-xs text-[#8C9BA7] font-medium mt-0.5 leading-snug">
                Baca dengan teks dibuka bertahap
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[#8C9BA7] group-hover:text-[#B797F6] group-hover:translate-x-1 transition-all" />
        </button>

        {/* Step 3: Hafalan */}
        <button
          onClick={() => onSelectStep('hafalan')}
          className="w-full bg-white border border-[#C9E1ED] hover:border-[#08B9EF] rounded-3xl p-4.5 shadow-xs hover:shadow-md transition-all duration-150 flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#08B9EF] relative shrink-0">
              <Award size={26} className="text-[#08B9EF]" />
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[#08B9EF] text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                3
              </span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-[#164C68] font-heading group-hover:text-[#08B9EF] transition-colors">
                Hafalan
              </h4>
              <p className="text-xs text-[#8C9BA7] font-medium mt-0.5 leading-snug">
                Uji tanpa teks, rekam & beri bintang
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[#8C9BA7] group-hover:text-[#08B9EF] group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Helpful Child Guide Tip */}
      <div className="bg-[#FFF9E6] border border-amber-200/90 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
        <span className="text-amber-500 font-bold shrink-0 mt-0.5">ℹ️</span>
        <p className="leading-relaxed">
          <strong className="font-bold">Ikuti urutan:</strong> dengar dulu sampai hafal nadanya, lalu latih bertahap sampai lancar, dan rekam hafalanmu untuk dapat bintang!
        </p>
      </div>
    </div>
  );
};
