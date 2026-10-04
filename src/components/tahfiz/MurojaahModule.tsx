import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  Star,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { getBlocksForSurah } from '../../data/blocksData';
import { getSurahAyahs } from '../../data/quranData';
import { RECITERS } from '../../data/recitersData';
import { QuranAudioPlayer, PlaybackState } from '../../services/audioService';
import { RECALL_MODES, RecallMode, getDeterministicHiddenIndices } from '../../services/murojaahHiding';
import { StorageService } from '../../services/storageService';
import { AyahData, MemorizationBlock } from '../../types';
import { ArabicText } from '../common/ArabicText';
import { Button } from '../common/Button';
import { RewardModal } from '../common/RewardModal';
import { CompanionService } from '../../services/companionService';
import { SubtleCompanionReaction } from '../companion/SubtleCompanionReaction';

interface MurojaahModuleProps {
  childId: string;
  initialSurahNumber?: number;
  initialBlockNumber?: number;
  onFinishMurojaah: () => void;
  onBack: () => void;
}

export const MurojaahModule: React.FC<MurojaahModuleProps> = ({
  childId,
  initialSurahNumber = 1,
  initialBlockNumber = 1,
  onFinishMurojaah,
}) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(initialSurahNumber);
  const [selectedBlockNumber, setSelectedBlockNumber] = useState<number>(initialBlockNumber);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [ayahs, setAyahs] = useState<AyahData[]>([]);

  // Progressive Recall Mode: 100%, 90%, 80%, 70%, 50%, 30%, 0%
  const [recallMode, setRecallMode] = useState<RecallMode>('100%');

  // Temporary hint reveals
  const [revealedWordIndices, setRevealedWordIndices] = useState<Set<number>>(new Set());

  // Audio Player
  const [reciterId, setReciterId] = useState<string>('alafasy');
  const [playbackState, setPlaybackState] = useState<PlaybackState>('IDLE');

  // Reward Modal
  const [rewardModalOpen, setRewardModalOpen] = useState<boolean>(false);
  const [companionPulseTrigger, setCompanionPulseTrigger] = useState<number>(0);
  const companion = CompanionService.getCompanionData(childId);

  const playerRef = useRef<QuranAudioPlayer | null>(null);
  const ayahsRef = useRef<AyahData[]>([]);
  ayahsRef.current = ayahs;

  const surahMeta = useMemo(
    () => SURAHS_METADATA.find((s) => s.number === selectedSurahNumber) || SURAHS_METADATA[0],
    [selectedSurahNumber]
  );
  const blocks = useMemo(() => getBlocksForSurah(surahMeta.number, surahMeta.ayahCount), [surahMeta]);
  const activeBlock = useMemo(
    () => blocks.find((b) => b.blockNumber === selectedBlockNumber) || blocks[0],
    [blocks, selectedBlockNumber]
  );

  // Initialize Player once on mount
  useEffect(() => {
    const player = new QuranAudioPlayer();
    playerRef.current = player;
    player.onStateChange = (state) => setPlaybackState(state);
    player.onAyahChange = (num) => {
      const list = ayahsRef.current;
      const idx = list.findIndex((a) => a.ayahNumber === num);
      if (idx !== -1) {
        setCurrentAyahIndex(idx);
        setRevealedWordIndices(new Set());
      }
    };

    return () => {
      player.destroy();
    };
  }, []);

  // Load Ayahs
  useEffect(() => {
    if (!activeBlock) return;
    let isMounted = true;
    getSurahAyahs(selectedSurahNumber).then((data) => {
      if (!isMounted) return;
      const filtered = data.filter(
        (a) => a.ayahNumber >= activeBlock.startAyah && a.ayahNumber <= activeBlock.endAyah
      );
      setAyahs(filtered);
      setCurrentAyahIndex(0);
      setRevealedWordIndices(new Set());

      if (playerRef.current && filtered.length > 0) {
        playerRef.current.setConfiguration({
          reciterId,
          surahNumber: selectedSurahNumber,
          startAyah: activeBlock.startAyah,
          endAyah: activeBlock.endAyah,
          ayahRepeats: 1,
          blockRepeats: 1,
        });
        playerRef.current.loadCurrentAyah();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber, activeBlock, reciterId]);

  const currentAyah = ayahs[currentAyahIndex];

  // Seeded deterministic hidden words for this attempt
  const hiddenWordIndices = useMemo(() => {
    if (!currentAyah || !currentAyah.words) return new Set<number>();
    const modeConfig = RECALL_MODES.find((m) => m.mode === recallMode) || RECALL_MODES[0];
    const seed = `${childId}-${selectedSurahNumber}-${currentAyah.ayahNumber}-${recallMode}`;
    const calculatedHidden = getDeterministicHiddenIndices(
      seed,
      currentAyah.words.length,
      modeConfig.visiblePercent
    );

    // Subtract words that child tapped to reveal
    const remaining = new Set<number>();
    calculatedHidden.forEach((idx) => {
      if (!revealedWordIndices.has(idx)) {
        remaining.add(idx);
      }
    });
    return remaining;
  }, [currentAyah, recallMode, revealedWordIndices, childId, selectedSurahNumber]);

  const handleWordHintClick = (idx: number) => {
    setRevealedWordIndices((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  };

  const handlePlayPause = () => {
    playerRef.current?.togglePlayPause();
  };

  const handleNext = () => {
    if (currentAyahIndex < ayahs.length - 1) {
      setCurrentAyahIndex((prev) => prev + 1);
      setRevealedWordIndices(new Set());
      if (playerRef.current && ayahs[currentAyahIndex + 1]) {
        playerRef.current.jumpToAyah(ayahs[currentAyahIndex + 1].ayahNumber);
      }
    }
  };

  const handlePrev = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex((prev) => prev - 1);
      setRevealedWordIndices(new Set());
      if (playerRef.current && ayahs[currentAyahIndex - 1]) {
        playerRef.current.jumpToAyah(ayahs[currentAyahIndex - 1].ayahNumber);
      }
    }
  };

  const handleFinishMurojaah = () => {
    playerRef.current?.pause();

    // Mark as reviewed
    StorageService.setBlockState(childId, selectedSurahNumber, activeBlock.blockNumber, 'MEMORIZED');
    StorageService.incrementBlockRepeat(childId, selectedSurahNumber, activeBlock.blockNumber);

    StorageService.recordPoints(
      childId,
      'MUROJAAH',
      20,
      4,
      `Muroja'ah ${activeBlock.name} Surah ${surahMeta.nameLatin} (${recallMode})`,
      'murojaah',
      activeBlock.id
    );

    // Record activity in Companion service for Hafiz trait and quest progression
    CompanionService.recordActivity(childId, 'murojaah', 20, 4);
    setCompanionPulseTrigger((prev) => prev + 1);

    setRewardModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Header & Surah Selector */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-3.5 shadow-xs flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#8C9BA7]">Surah:</label>
          <select
            value={selectedSurahNumber}
            onChange={(e) => {
              const num = Number(e.target.value);
              setSelectedSurahNumber(num);
              setSelectedBlockNumber(1);
            }}
            className="bg-[#EEF8FF] border border-[#C9E1ED] text-xs font-bold text-[#164C68] rounded-xl px-2.5 py-1.5 focus:outline-[#B797F6]"
          >
            {SURAHS_METADATA.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.nameLatin} ({s.nameArabic})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#8C9BA7]">Blok:</label>
          <select
            value={activeBlock.blockNumber}
            onChange={(e) => {
              setSelectedBlockNumber(Number(e.target.value));
            }}
            className="bg-[#EEF8FF] border border-[#C9E1ED] text-xs font-bold text-[#164C68] rounded-xl px-2.5 py-1.5 focus:outline-[#B797F6]"
          >
            {blocks.map((b) => (
              <option key={b.id} value={b.blockNumber}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ayahs In Block Direct Chip Bar */}
      {ayahs.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {ayahs.map((a, idx) => {
            const isSelected = idx === currentAyahIndex;
            return (
              <button
                key={a.ayahNumber}
                onClick={() => {
                  setCurrentAyahIndex(idx);
                  setRevealedWordIndices(new Set());
                  if (playerRef.current) {
                    playerRef.current.jumpToAyah(a.ayahNumber);
                  }
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#B797F6] text-white shadow-xs scale-105'
                    : 'bg-white border border-[#C9E1ED] text-[#164C68] hover:bg-[#EEF8FF]'
                }`}
              >
                Ayat {a.ayahNumber}
              </button>
            );
          })}
        </div>
      )}

      {/* Progressive Text Hiding Segmented Selector (Matches Screenshot!) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-[#8C9BA7] uppercase tracking-wider block px-1">
          BANTUAN TEKS DIKURANGI BERTAHAP
        </label>
        <div className="flex gap-1.5 p-1 bg-white border border-[#C9E1ED] rounded-2xl shadow-xs overflow-x-auto">
          {RECALL_MODES.map((item) => (
            <button
              key={item.mode}
              onClick={() => {
                setRecallMode(item.mode);
                setRevealedWordIndices(new Set());
              }}
              className={`flex-1 min-w-[65px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
                recallMode === item.mode
                  ? 'bg-[#08B9EF] text-white shadow-xs'
                  : 'text-[#8C9BA7] hover:text-[#164C68]'
              }`}
            >
              <div>{item.label}</div>
              <div className="text-[10px] opacity-80 font-normal">
                {item.visiblePercent}% kata
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Quran Card with Progressive Masked Arabic Words */}
      <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-6 shadow-sm min-h-[260px] flex flex-col justify-between text-center relative overflow-hidden">
        {/* Ayah Title & Hint prompt */}
        <div className="flex items-center justify-between text-xs text-[#8C9BA7] font-semibold mb-2">
          <span className="font-bold uppercase tracking-wider bg-[#EEF8FF] text-[#08B9EF] px-2.5 py-0.5 rounded-full">
            AYAT {currentAyah?.ayahNumber || activeBlock.startAyah}
          </span>
          {recallMode !== '100%' && (
            <span className="text-[11px] text-[#B797F6] font-bold flex items-center gap-1">
              <Eye size={13} /> Sentuh •••• untuk intip
            </span>
          )}
        </div>

        {/* Masked Arabic Words Display */}
        <div className="py-6">
          {currentAyah ? (
            <ArabicText
              arabicText={currentAyah.arabicText}
              ayahNumber={currentAyah.ayahNumber}
              words={currentAyah.words}
              hiddenWordIndices={hiddenWordIndices}
              onWordClick={handleWordHintClick}
              showWordMasking={recallMode !== '100%'}
              fontSize="large"
            />
          ) : (
            <p className="text-[#8C9BA7] font-medium text-sm">Memuat ayat...</p>
          )}

          {recallMode === '100%' && currentAyah?.translationId && (
            <p className="text-xs text-[#164C68] font-medium italic border-t border-slate-100 pt-3 mt-4">
              "{currentAyah.translationId}"
            </p>
          )}
        </div>

        {/* Progress Footer */}
        <div className="flex items-center justify-between text-[11px] text-[#8C9BA7] font-semibold pt-2 border-t border-slate-100">
          <span>
            Ayat {currentAyahIndex + 1} dari {ayahs.length || 1}
          </span>
          <span className="text-purple-600 font-bold">
            {recallMode === '0%' ? 'Tantangan Penuh: Tanpa Teks' : `Bantuan ${recallMode}`}
          </span>
        </div>
      </div>

      {/* Audio Player Controls */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#8C9BA7]">
          <Volume2 size={16} className="text-[#08B9EF]" />
          <select
            value={reciterId}
            onChange={(e) => {
              setReciterId(e.target.value);
              if (playerRef.current) {
                playerRef.current.reciterId = e.target.value;
                playerRef.current.loadCurrentAyah();
              }
            }}
            className="bg-[#EEF8FF] text-[#164C68] font-bold rounded-lg px-2 py-1 border border-[#C9E1ED] max-w-[170px] truncate"
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentAyahIndex === 0}
            className="w-11 h-11 rounded-2xl bg-[#EEF8FF] text-[#164C68] disabled:opacity-40 flex items-center justify-center hover:bg-[#d8eefc] active:scale-95 transition-all cursor-pointer"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-14 h-14 rounded-full bg-[#B797F6] text-white flex items-center justify-center shadow-lg shadow-purple-400/30 hover:bg-[#a682ec] active:scale-95 transition-all cursor-pointer"
          >
            {playbackState === 'PLAYING' ? <Pause size={24} className="fill-white" /> : <Play size={24} className="fill-white ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            disabled={currentAyahIndex === ayahs.length - 1}
            className="w-11 h-11 rounded-2xl bg-[#EEF8FF] text-[#164C68] disabled:opacity-40 flex items-center justify-center hover:bg-[#d8eefc] active:scale-95 transition-all cursor-pointer"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      {/* Complete Murojaah Button */}
      <Button
        variant="purple"
        size="lg"
        fullWidth
        onClick={handleFinishMurojaah}
        icon={<CheckCircle2 size={20} />}
      >
        Selesai Muroja'ah Blok Ini
      </Button>

      {/* Celebratory Reward Modal */}
      <RewardModal
        isOpen={rewardModalOpen}
        onClose={() => setRewardModalOpen(false)}
        title="Muroja'ah Berhasil!"
        message={`Hebat! Kamu telah mereview ${activeBlock.name} Surah ${surahMeta.nameLatin}.`}
        starsEarned={4}
        xpEarned={20}
        nextLabel="Selesai"
        onNext={() => {
          setRewardModalOpen(false);
          onFinishMurojaah();
        }}
      />

      {/* Subtle Companion Mascot in corner */}
      <SubtleCompanionReaction
        companion={companion}
        pulseTrigger={companionPulseTrigger}
        message="Lumi bangga! Ingatanmu makin kokoh ✨"
      />
    </div>
  );
};
