import React from 'react';
import { BookOpen, Sparkles, BookMarked, Globe2, Lightbulb, Clock, ChevronRight } from 'lucide-react';

export type AlQuranSubmodule = 'iqra' | 'tajwid' | 'tilawah' | 'bahasa' | 'tafsir' | 'asbab' | null;

interface AlQuranHubProps {
  onSelectSubmodule: (mod: AlQuranSubmodule) => void;
  iqraProgressCount: number;
  tajwidProgressCount: number;
  vocabCount: number;
  storiesCount: number;
}

export const AlQuranHub: React.FC<AlQuranHubProps> = ({
  onSelectSubmodule,
  iqraProgressCount,
  tajwidProgressCount,
  vocabCount,
  storiesCount,
}) => {
  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Friendly Motivation Greeting */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-[#C9E1ED] rounded-3xl p-5 shadow-xs flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#08B9EF] text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
          ⭐
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#164C68] font-heading">
            Mau belajar apa hari ini?
          </h2>
          <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
            Pilih salah satu menu seru di bawah ✨
          </p>
        </div>
      </div>

      {/* CATEGORY 1: BELAJAR */}
      <div className="space-y-2.5">
        <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider block px-1">
          BELAJAR
        </span>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Iqra Card (Cyan Pastel) */}
          <button
            onClick={() => onSelectSubmodule('iqra')}
            className="bg-[#08B9EF] text-white rounded-3xl p-5 shadow-md shadow-cyan-500/20 active:scale-[0.98] transition-all text-center flex flex-col items-center justify-center min-h-[145px] group cursor-pointer border-b-4 border-[#058db6]"
          >
            <span className="font-quran text-3xl mb-2 group-hover:scale-110 transition-transform">
              ا ب
            </span>
            <h3 className="text-lg font-black font-heading tracking-tight">
              Iqra'
            </h3>
            <p className="text-[11px] text-cyan-100 font-semibold mt-0.5">
              belajar baca
            </p>
          </button>

          {/* Tajwid Card (Coral / Orange Pastel) */}
          <button
            onClick={() => onSelectSubmodule('tajwid')}
            className="bg-[#FF946F] text-white rounded-3xl p-5 shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all text-center flex flex-col items-center justify-center min-h-[145px] group cursor-pointer border-b-4 border-[#e07550]"
          >
            <span className="font-quran text-3xl mb-2 group-hover:scale-110 transition-transform">
              نَّ
            </span>
            <h3 className="text-lg font-black font-heading tracking-tight">
              Tajwid
            </h3>
            <p className="text-[11px] text-orange-100 font-semibold mt-0.5">
              hukum bacaan
            </p>
          </button>
        </div>
      </div>

      {/* CATEGORY 2: BACA */}
      <div className="space-y-2.5">
        <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider block px-1">
          BACA
        </span>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Tilawah Card (Blue / Teal Pastel) */}
          <button
            onClick={() => onSelectSubmodule('tilawah')}
            className="bg-[#48CAE4] text-white rounded-3xl p-5 shadow-md shadow-sky-500/20 active:scale-[0.98] transition-all text-center flex flex-col items-center justify-center min-h-[145px] group cursor-pointer border-b-4 border-[#0096c7]"
          >
            <BookOpen size={34} className="mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black font-heading tracking-tight">
              Tilawah
            </h3>
            <p className="text-[11px] text-sky-100 font-semibold mt-0.5">
              baca mushaf
            </p>
          </button>

          {/* Bahasa Quran Card (Purple Pastel) */}
          <button
            onClick={() => onSelectSubmodule('bahasa')}
            className="bg-[#B797F6] text-white rounded-3xl p-5 shadow-md shadow-purple-500/20 active:scale-[0.98] transition-all text-center flex flex-col items-center justify-center min-h-[145px] group cursor-pointer border-b-4 border-[#956de6]"
          >
            <div className="flex items-center gap-1 text-2xl font-bold mb-2 group-hover:scale-110 transition-transform">
              <span>A</span>
              <span className="text-lg">⇄</span>
              <span className="font-quran">ب</span>
            </div>
            <h3 className="text-lg font-black font-heading tracking-tight">
              Bahasa Quran
            </h3>
            <p className="text-[11px] text-purple-100 font-semibold mt-0.5">
              arti kata
            </p>
          </button>
        </div>
      </div>

      {/* CATEGORY 3: PAHAMI */}
      <div className="space-y-2.5">
        <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider block px-1">
          PAHAMI
        </span>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Tafsir Card (Yellow Pastel) */}
          <button
            onClick={() => onSelectSubmodule('tafsir')}
            className="bg-[#FFD83E] text-[#164C68] rounded-3xl p-5 shadow-md shadow-yellow-500/20 active:scale-[0.98] transition-all text-center flex flex-col items-center justify-center min-h-[145px] group cursor-pointer border-b-4 border-[#e5be24]"
          >
            <Lightbulb size={34} className="mb-2 text-amber-700 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black font-heading tracking-tight text-[#164C68]">
              Tafsir
            </h3>
            <p className="text-[11px] text-amber-900 font-bold mt-0.5">
              makna ayat
            </p>
          </button>

          {/* Asbab Nuzul Card (Cyan/Teal Pastel) */}
          <button
            onClick={() => onSelectSubmodule('asbab')}
            className="bg-[#08B9AA] text-white rounded-3xl p-5 shadow-md shadow-teal-500/20 active:scale-[0.98] transition-all text-center flex flex-col items-center justify-center min-h-[145px] group cursor-pointer border-b-4 border-[#068f83]"
          >
            <Clock size={34} className="mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black font-heading tracking-tight">
              Asbab Nuzul
            </h3>
            <p className="text-[11px] text-teal-100 font-semibold mt-0.5">
              waktu kejadian
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
