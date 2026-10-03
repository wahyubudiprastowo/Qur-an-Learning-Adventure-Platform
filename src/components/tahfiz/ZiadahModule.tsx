import React, { useState, useMemo } from 'react';
import { Mic, CheckCircle2, ChevronRight, ArrowLeft, Filter, Sparkles, AlertCircle } from 'lucide-react';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { getBlocksForSurah } from '../../data/blocksData';
import { ChildBlockProgress, MemorizationBlock, SurahMetadata } from '../../types';
import { Button } from '../common/Button';

interface ZiadahModuleProps {
  childId: string;
  blockProgressList: ChildBlockProgress[];
  onStartPractice: (config: {
    surahNumber: number;
    selectedBlocks: MemorizationBlock[];
    ayahRepeats: number;
    blockRepeats: number;
  }) => void;
  onMarkBlocksMemorized: (surahNumber: number, blockNumbers: number[]) => void;
  onBack: () => void;
}

export const ZiadahModule: React.FC<ZiadahModuleProps> = ({
  childId,
  blockProgressList,
  onStartPractice,
  onMarkBlocksMemorized,
  onBack,
}) => {
  // If null, we are showing the Surah list; if set, we are showing that Surah's detail block config
  const [selectedSurah, setSelectedSurah] = useState<SurahMetadata | null>(null);

  // Surah List Filter: 'menghafal' | 'sedang' | 'mushaf' | 'juz'
  const [surahFilter, setSurahFilter] = useState<'menghafal' | 'sedang' | 'mushaf' | 'juz'>('menghafal');

  // Detail View: Selected block IDs (multi-selection allowed!)
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [blockStatusFilter, setBlockStatusFilter] = useState<'all' | 'learning' | 'not_started'>('all');

  // Repetition settings
  const [ayahRepeats, setAyahRepeats] = useState<number>(3);
  const [blockRepeats, setBlockRepeats] = useState<number>(3); // -1 for infinity

  // Confirmation modal state for marking memorized
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Calculate progress stats for each surah
  const surahsWithProgress = useMemo(() => {
    return SURAHS_METADATA.map((s) => {
      const sBlocks = getBlocksForSurah(s.number, s.ayahCount);
      const childBlocksForSurah = blockProgressList.filter((b) => b.surahNumber === s.number);
      const memorizedCount = childBlocksForSurah.filter((b) => b.state === 'MEMORIZED').length;
      const isLearning = childBlocksForSurah.some((b) => b.state === 'LEARNING');
      const totalRepeats = childBlocksForSurah.reduce((acc, curr) => acc + (curr.repeatCount || 0), 0);

      return {
        ...s,
        totalBlocks: sBlocks.length,
        memorizedBlocks: memorizedCount,
        isLearning,
        totalRepeats,
      };
    });
  }, [blockProgressList]);

  // Filtered surahs list
  const filteredSurahs = useMemo(() => {
    if (surahFilter === 'sedang') {
      return surahsWithProgress.filter((s) => s.isLearning || s.memorizedBlocks > 0);
    }
    if (surahFilter === 'juz') {
      return surahsWithProgress.filter((s) => s.juzNumber === 30);
    }
    // Default: prioritize Juz 30 and surahs in progress
    return [...surahsWithProgress].sort((a, b) => {
      if (a.juzNumber === 30 && b.juzNumber !== 30) return -1;
      if (b.juzNumber === 30 && a.juzNumber !== 30) return 1;
      return a.number - b.number;
    });
  }, [surahsWithProgress, surahFilter]);

  // Selected surah's blocks
  const surahBlocks = useMemo(() => {
    if (!selectedSurah) return [];
    return getBlocksForSurah(selectedSurah.number, selectedSurah.ayahCount);
  }, [selectedSurah]);

  // Filtered blocks inside the selected surah
  const displayedBlocks = useMemo(() => {
    if (!selectedSurah) return [];
    return surahBlocks.filter((b) => {
      const p = blockProgressList.find((item) => item.surahNumber === selectedSurah.number && item.blockNumber === b.blockNumber);
      const isMemorized = p?.state === 'MEMORIZED';
      const isLearning = p?.state === 'LEARNING';

      if (blockStatusFilter === 'learning') return isLearning;
      if (blockStatusFilter === 'not_started') return !isMemorized && !isLearning;
      return true;
    });
  }, [surahBlocks, selectedSurah, blockStatusFilter, blockProgressList]);

  const handleSelectSurah = (surah: SurahMetadata) => {
    setSelectedSurah(surah);
    const blocks = getBlocksForSurah(surah.number, surah.ayahCount);
    // By default, select the first incomplete block or block 1
    const unmemorized = blocks.find((b) => {
      const p = blockProgressList.find((item) => item.surahNumber === surah.number && item.blockNumber === b.blockNumber);
      return p?.state !== 'MEMORIZED';
    });
    setSelectedBlockIds([unmemorized ? unmemorized.id : blocks[0]?.id || '1-1']);
  };

  const toggleBlockSelection = (blockId: string) => {
    setSelectedBlockIds((prev) =>
      prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]
    );
  };

  const handleStart = () => {
    if (!selectedSurah || selectedBlockIds.length === 0) return;
    const blocksToPractice = surahBlocks.filter((b) => selectedBlockIds.includes(b.id));
    onStartPractice({
      surahNumber: selectedSurah.number,
      selectedBlocks: blocksToPractice,
      ayahRepeats,
      blockRepeats,
    });
  };

  const handleConfirmMarkMemorized = () => {
    if (!selectedSurah || selectedBlockIds.length === 0) return;
    const blockNumbers = surahBlocks
      .filter((b) => selectedBlockIds.includes(b.id))
      .map((b) => b.blockNumber);
    onMarkBlocksMemorized(selectedSurah.number, blockNumbers);
    setShowConfirmModal(false);
  };

  // --- Render 1: Detail Surah & Block Configuration ---
  if (selectedSurah) {
    const selectedBlocksCount = selectedBlockIds.length;

    return (
      <div className="space-y-4 pb-28 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedSurah(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#164C68] hover:text-[#08B9EF]"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Daftar</span>
          </button>
          <span className="font-quran text-xl text-[#08B9EF]">
            {selectedSurah.nameArabic}
          </span>
        </div>

        {/* Surah Summary Card */}
        <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-xl font-black text-[#164C68] font-heading">
              {selectedSurah.nameLatin} ({selectedSurah.number})
            </h2>
            <span className="text-xs text-[#8C9BA7] font-semibold">
              Juz {selectedSurah.juzNumber} • {selectedSurah.ayahCount} ayat
            </span>
          </div>
          <p className="text-xs text-[#8C9BA7] font-medium">
            Arti: {selectedSurah.translation} ({selectedSurah.revelationType})
          </p>
        </div>

        {/* Block Selection Header & Filter Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8C9BA7] tracking-wider uppercase">
              PILIH BLOK (BOLEH &gt; 1)
            </span>
            <span className="text-xs text-[#08B9EF] font-bold">
              {selectedBlocksCount} dipilih
            </span>
          </div>

          <div className="flex gap-1.5 p-1 bg-[#EEF8FF] rounded-2xl border border-[#C9E1ED]">
            <button
              onClick={() => setBlockStatusFilter('all')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                blockStatusFilter === 'all'
                  ? 'bg-white text-[#164C68] shadow-xs'
                  : 'text-[#8C9BA7] hover:text-[#164C68]'
              }`}
            >
              Semua {surahBlocks.length}
            </button>
            <button
              onClick={() => setBlockStatusFilter('learning')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                blockStatusFilter === 'learning'
                  ? 'bg-white text-[#164C68] shadow-xs'
                  : 'text-[#8C9BA7] hover:text-[#164C68]'
              }`}
            >
              Sedang
            </button>
            <button
              onClick={() => setBlockStatusFilter('not_started')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                blockStatusFilter === 'not_started'
                  ? 'bg-white text-[#164C68] shadow-xs'
                  : 'text-[#8C9BA7] hover:text-[#164C68]'
              }`}
            >
              Belum
            </button>
          </div>
        </div>

        {/* Blocks List */}
        <div className="space-y-2.5">
          {displayedBlocks.map((block) => {
            const isChecked = selectedBlockIds.includes(block.id);
            const progress = blockProgressList.find(
              (p) => p.surahNumber === selectedSurah.number && p.blockNumber === block.blockNumber
            );
            const isMemorized = progress?.state === 'MEMORIZED';

            return (
              <div
                key={block.id}
                onClick={() => toggleBlockSelection(block.id)}
                className={`w-full bg-white border-2 rounded-2xl p-3.5 transition-all flex items-center justify-between cursor-pointer select-none ${
                  isChecked
                    ? 'border-[#08B9EF] shadow-sm bg-cyan-50/20'
                    : 'border-[#C9E1ED] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // Handled by container
                    className="w-5 h-5 rounded-md text-[#08B9EF] focus:ring-0 cursor-pointer accent-[#08B9EF]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#164C68] font-heading">
                        {block.name}
                      </span>
                      {isMemorized && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          ✓ hafal
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#8C9BA7] font-medium">
                      diulang {progress?.repeatCount || 0}x
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Repetition Settings */}
        <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs space-y-3">
          <div>
            <label className="text-xs font-bold text-[#8C9BA7] uppercase tracking-wider block mb-1.5">
              ULANG TIAP AYAT
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 5, 7].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setAyahRepeats(cnt)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    ayahRepeats === cnt
                      ? 'bg-[#08B9EF] text-white shadow-xs'
                      : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefb]'
                  }`}
                >
                  {cnt}x
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#8C9BA7] uppercase tracking-wider block mb-1.5">
              ULANG BLOK
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[3, 5, 7, 10, -1].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setBlockRepeats(cnt)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    blockRepeats === cnt
                      ? 'bg-[#08B9EF] text-white shadow-xs'
                      : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefb]'
                  }`}
                >
                  {cnt === -1 ? '∞' : `${cnt}x`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleStart}
            disabled={selectedBlocksCount === 0}
            icon={<Mic size={20} />}
          >
            Mulai Latihan ({selectedBlocksCount})
          </Button>

          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={() => setShowConfirmModal(true)}
            disabled={selectedBlocksCount === 0}
            icon={<CheckCircle2 size={18} className="text-emerald-500" />}
          >
            Tandai block terpilih hafal
          </Button>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white border border-[#C9E1ED] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <h3 className="text-lg font-bold text-[#164C68] font-heading">
                Tandai Sudah Hafal?
              </h3>
              <p className="text-xs text-[#8C9BA7] leading-relaxed">
                Apakah anak sudah benar-benar hafal {selectedBlocksCount} blok terpilih tanpa melihat mushaf?
              </p>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" fullWidth onClick={() => setShowConfirmModal(false)}>
                  Batal
                </Button>
                <Button variant="green" fullWidth onClick={handleConfirmMarkMemorized}>
                  Ya, Sudah Hafal
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Render 2: Surah List View ---
  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-[#C9E1ED] rounded-3xl p-4.5 shadow-xs">
        <h2 className="text-lg font-black text-[#164C68] font-heading">
          Ziadah — Latihan
        </h2>
        <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
          Lafalkan dengan suara • teks dibuka bertahap
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-white border border-[#C9E1ED] rounded-2xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setSurahFilter('menghafal')}
          className={`flex-1 min-w-[75px] py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            surahFilter === 'menghafal'
              ? 'bg-[#08B9EF] text-white shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          Menghafal
        </button>
        <button
          onClick={() => setSurahFilter('sedang')}
          className={`flex-1 min-w-[75px] py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            surahFilter === 'sedang'
              ? 'bg-[#08B9EF] text-white shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          Sedang Dihafal
        </button>
        <button
          onClick={() => setSurahFilter('juz')}
          className={`flex-1 min-w-[75px] py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            surahFilter === 'juz'
              ? 'bg-[#08B9EF] text-white shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          Juz 30
        </button>
        <button
          onClick={() => setSurahFilter('mushaf')}
          className={`flex-1 min-w-[75px] py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            surahFilter === 'mushaf'
              ? 'bg-[#08B9EF] text-white shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          114 Surah
        </button>
      </div>

      {/* Surah List Header */}
      <div className="flex items-center justify-between text-xs font-bold text-[#8C9BA7] px-1">
        <span>JUZ {surahFilter === 'juz' ? '30' : 'SEMUA'}</span>
        <span>{filteredSurahs.length} surat</span>
      </div>

      {/* Surah Cards List (Matches Screenshot) */}
      <div className="space-y-2.5">
        {filteredSurahs.map((surah) => {
          return (
            <div
              key={surah.number}
              onClick={() => handleSelectSurah(surah)}
              className="bg-white border border-[#C9E1ED] hover:border-[#08B9EF] rounded-3xl p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer select-none group"
            >
              <div className="flex items-center gap-3">
                {/* Number / Mic Avatar */}
                <div className="w-11 h-11 rounded-2xl bg-[#EEF8FF] border border-[#C9E1ED] flex items-center justify-center font-black text-[#164C68] font-heading shrink-0 group-hover:bg-[#08B9EF] group-hover:text-white transition-colors">
                  {surah.number}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-[#164C68] font-heading group-hover:text-[#08B9EF] transition-colors">
                      {surah.nameLatin}
                    </h3>
                    {surah.isLearning && (
                      <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100 px-2 py-0.2 rounded-full">
                        lanjut
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8C9BA7] font-medium mt-0.5">
                    <span>
                      {surah.memorizedBlocks}/{surah.totalBlocks} blok
                    </span>
                    <span>•</span>
                    <span>Juz {surah.juzNumber}</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200">
                      ↻ {surah.totalRepeats}x diulang
                    </span>
                  </div>
                </div>
              </div>

              {/* Arabic Name & Chevron */}
              <div className="flex items-center gap-2">
                <span className="font-quran text-xl text-[#08B9EF]">
                  {surah.nameArabic}
                </span>
                <ChevronRight size={18} className="text-[#8C9BA7] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
