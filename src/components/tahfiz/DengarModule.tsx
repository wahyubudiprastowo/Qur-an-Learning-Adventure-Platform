import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Headphones,
  CheckCircle,
  Volume2,
  ListMusic,
  RotateCcw,
} from 'lucide-react';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { getBlocksForSurah } from '../../data/blocksData';
import { getSurahAyahs } from '../../data/quranData';
import { RECITERS } from '../../data/recitersData';
import {
  QuranAudioPlayer,
  PlaybackState,
  AudioProgressInfo,
  GlobalAudioManager,
  getActiveWordIndexFromProgress,
} from '../../services/audioService';
import { AyahData, MemorizationBlock } from '../../types';
import { ArabicText } from '../common/ArabicText';
import { Button } from '../common/Button';
import { StorageService } from '../../services/storageService';
import { CompanionService } from '../../services/companionService';
import { SubtleCompanionReaction } from '../companion/SubtleCompanionReaction';

interface DengarModuleProps {
  initialSurahNumber?: number;
  initialBlockNumber?: number;
  onProceedToLatihan: (surahNumber: number, blockNumber: number) => void;
  onBack: () => void;
}

export const DengarModule: React.FC<DengarModuleProps> = ({
  initialSurahNumber = 1,
  initialBlockNumber = 1,
  onProceedToLatihan,
}) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(initialSurahNumber);
  const [selectedBlockNumber, setSelectedBlockNumber] = useState<number>(initialBlockNumber);
  const [currentAyahNumber, setCurrentAyahNumber] = useState<number>(1);

  const [allAyahsInSurah, setAllAyahsInSurah] = useState<AyahData[]>([]);
  const [reciterId, setReciterId] = useState<string>('alafasy');
  const [ayahRepeats, setAyahRepeats] = useState<number>(3);
  const [blockRepeats, setBlockRepeats] = useState<number>(3); // -1 for infinity
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [singleAyahMode, setSingleAyahMode] = useState<boolean>(false);

  const [playbackState, setPlaybackState] = useState<PlaybackState>('IDLE');
  const [progressInfo, setProgressInfo] = useState<AudioProgressInfo | null>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [companionPulseTrigger, setCompanionPulseTrigger] = useState<number>(0);

  const activeChildId = StorageService.getActiveChildId();
  const companion = CompanionService.getCompanionData(activeChildId);

  const playerRef = useRef<QuranAudioPlayer | null>(null);

  const surahMeta = useMemo(() => {
    return SURAHS_METADATA.find((s) => s.number === selectedSurahNumber) || SURAHS_METADATA[0];
  }, [selectedSurahNumber]);

  const blocks = useMemo(() => {
    return getBlocksForSurah(surahMeta.number, surahMeta.ayahCount);
  }, [surahMeta]);

  const activeBlock = useMemo(() => {
    return (
      blocks.find((b) => b.blockNumber === selectedBlockNumber) ||
      blocks[0] || {
        id: `${surahMeta.number}-1`,
        surahNumber: surahMeta.number,
        blockNumber: 1,
        startAyah: 1,
        endAyah: Math.min(4, surahMeta.ayahCount),
        name: 'Blok 1',
      }
    );
  }, [blocks, selectedBlockNumber, surahMeta]);

  // Ayahs belonging to active block
  const blockAyahs = useMemo(() => {
    if (allAyahsInSurah.length === 0) return [];
    return allAyahsInSurah.filter(
      (a) => a.ayahNumber >= activeBlock.startAyah && a.ayahNumber <= activeBlock.endAyah
    );
  }, [allAyahsInSurah, activeBlock]);

  // Currently focused ayah data
  const currentAyah = useMemo(() => {
    return allAyahsInSurah.find((a) => a.ayahNumber === currentAyahNumber) || blockAyahs[0] || allAyahsInSurah[0];
  }, [allAyahsInSurah, currentAyahNumber, blockAyahs]);

  const currentAyahRef = useRef(currentAyah);
  currentAyahRef.current = currentAyah;

  // Initialize Player once on mount (persistent across ayah changes)
  useEffect(() => {
    const player = new QuranAudioPlayer();
    playerRef.current = player;

    player.onStateChange = (state) => setPlaybackState(state);
    player.onProgressUpdate = (info) => {
      setProgressInfo(info);
      const curr = currentAyahRef.current;
      const found = getActiveWordIndexFromProgress(curr?.words, info.currentTimeMs, info.durationMs);
      setActiveWordIndex(found);
    };
    player.onAyahChange = (ayahNum) => {
      setCurrentAyahNumber(ayahNum);
      setActiveWordIndex(null);
      setCompanionPulseTrigger((prev) => prev + 1);
    };

    const unsubStop = GlobalAudioManager.addStopListener(() => {
      setPlaybackState('IDLE');
      setActiveWordIndex(null);
    });

    return () => {
      unsubStop();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      GlobalAudioManager.stopAll();
    };
  }, []);

  // Load Ayahs whenever Surah changes
  useEffect(() => {
    let isMounted = true;
    getSurahAyahs(selectedSurahNumber).then((data) => {
      if (!isMounted) return;
      setAllAyahsInSurah(data);

      const surahBlocks = getBlocksForSurah(selectedSurahNumber, data.length || 7);
      const firstBlock = surahBlocks[0];
      setSelectedBlockNumber(firstBlock.blockNumber);
      setCurrentAyahNumber(firstBlock.startAyah);
      setActiveWordIndex(null);

      if (playerRef.current) {
        playerRef.current.setConfiguration({
          reciterId,
          surahNumber: selectedSurahNumber,
          startAyah: firstBlock.startAyah,
          endAyah: firstBlock.endAyah,
          ayahRepeats,
          blockRepeats,
          playbackRate: playbackSpeed,
          singleAyahMode,
        });
        playerRef.current.loadCurrentAyah();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber]);

  // Update player when block changes
  const handleSelectBlock = (block: MemorizationBlock) => {
    setSelectedBlockNumber(block.blockNumber);
    setCurrentAyahNumber(block.startAyah);
    setActiveWordIndex(null);

    if (playerRef.current) {
      playerRef.current.setConfiguration({
        reciterId,
        surahNumber: selectedSurahNumber,
        startAyah: block.startAyah,
        endAyah: block.endAyah,
        ayahRepeats,
        blockRepeats,
        playbackRate: playbackSpeed,
        singleAyahMode,
      });
      playerRef.current.loadCurrentAyah();
    }
  };

  // Direct single ayah selection (allows listening one by one!)
  const handleSelectAyahDirect = (ayahNum: number, onlyThisAyah: boolean = false) => {
    setCurrentAyahNumber(ayahNum);
    setActiveWordIndex(null);

    if (playerRef.current) {
      playerRef.current.jumpToAyah(ayahNum, onlyThisAyah);
    }
  };

  const handlePlayPause = () => {
    playerRef.current?.togglePlayPause();
  };

  const handleNext = () => {
    playerRef.current?.nextAyah();
  };

  const handlePrev = () => {
    playerRef.current?.previousAyah();
  };

  const handleSpeedToggle = () => {
    const speeds = [0.75, 1.0, 1.25];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    playerRef.current?.setSpeed(nextSpeed);
  };

  const handleReciterChange = (newReciterId: string) => {
    setReciterId(newReciterId);
    if (playerRef.current) {
      playerRef.current.reciterId = newReciterId;
      playerRef.current.loadCurrentAyah();
      if (playbackState === 'PLAYING') {
        playerRef.current.play();
      }
    }
  };

  const toggleSingleAyahMode = () => {
    const newVal = !singleAyahMode;
    setSingleAyahMode(newVal);
    if (playerRef.current) {
      playerRef.current.singleAyahMode = newVal;
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Surah & Block Selector Bar */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-3.5 shadow-xs flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#8C9BA7]">Surah:</label>
          <select
            value={selectedSurahNumber}
            onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
            className="bg-[#EEF8FF] border border-[#C9E1ED] text-xs font-bold text-[#164C68] rounded-xl px-2.5 py-1.5 focus:outline-[#08B9EF]"
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
              const b = blocks.find((item) => item.blockNumber === Number(e.target.value));
              if (b) handleSelectBlock(b);
            }}
            className="bg-[#EEF8FF] border border-[#C9E1ED] text-xs font-bold text-[#164C68] rounded-xl px-2.5 py-1.5 focus:outline-[#08B9EF]"
          >
            {blocks.map((b) => (
              <option key={b.id} value={b.blockNumber}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Direct Ayah Selection Buttons (Allows listening one-by-one!) */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-3.5 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-[#164C68]">
            <ListMusic size={14} className="text-[#08B9EF]" /> PILIH AYAT LANGSUNG:
          </span>
          <button
            onClick={toggleSingleAyahMode}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              singleAyahMode
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-[#EEF8FF] text-[#08B9EF] border border-[#C9E1ED]'
            }`}
          >
            {singleAyahMode ? 'Mode: Putar 1 Ayat Saja' : 'Mode: Putar Berkelanjutan'}
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {blockAyahs.map((a) => {
            const isSelected = a.ayahNumber === currentAyahNumber;

            return (
              <button
                key={a.ayahNumber}
                onClick={() => handleSelectAyahDirect(a.ayahNumber, singleAyahMode)}
                className={`min-w-[50px] h-10 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#08B9EF] text-white shadow-sm scale-105 ring-2 ring-cyan-200'
                    : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefc]'
                }`}
              >
                Ayat {a.ayahNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reciter & Repetition Settings */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs space-y-3">
        {/* Reciter Picker */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#8C9BA7] flex items-center gap-1.5">
            <Volume2 size={16} className="text-[#08B9EF]" /> Pilihan Qari:
          </span>
          <select
            value={reciterId}
            onChange={(e) => handleReciterChange(e.target.value)}
            className="bg-[#EEF8FF] border border-[#C9E1ED] text-xs font-bold text-[#164C68] rounded-xl px-2 py-1 max-w-[210px] truncate"
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Repetition Controls */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-[11px] font-bold text-[#8C9BA7] block mb-1">
              Ulang Tiap Ayat:
            </label>
            <div className="flex gap-1">
              {[1, 3, 5, 7].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    setAyahRepeats(count);
                    if (playerRef.current) playerRef.current.targetAyahRepeats = count;
                  }}
                  className={`flex-1 py-1 rounded-xl text-xs font-bold transition-all ${
                    ayahRepeats === count
                      ? 'bg-[#08B9EF] text-white shadow-xs'
                      : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefb]'
                  }`}
                >
                  {count}x
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#8C9BA7] block mb-1">
              Ulang Blok:
            </label>
            <div className="flex gap-1">
              {[1, 3, 5, -1].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    setBlockRepeats(count);
                    if (playerRef.current) playerRef.current.targetBlockRepeats = count;
                  }}
                  className={`flex-1 py-1 rounded-xl text-xs font-bold transition-all ${
                    blockRepeats === count
                      ? 'bg-[#FF946F] text-white shadow-xs'
                      : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefb]'
                  }`}
                >
                  {count === -1 ? '∞' : `${count}x`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Quran Card with Large Authentic Arabic Typography */}
      <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-6 shadow-sm min-h-[230px] flex flex-col justify-between relative overflow-hidden">
        {/* Top Info */}
        <div className="flex items-center justify-between text-xs text-[#8C9BA7] font-semibold mb-3">
          <span className="font-heading text-[#164C68]">
            Surah {surahMeta.nameLatin} ({surahMeta.nameArabic}) • {activeBlock.name}
          </span>
          <span className="bg-[#EEF8FF] text-[#08B9EF] px-2.5 py-1 rounded-full font-bold">
            Ayat {currentAyah?.ayahNumber || activeBlock.startAyah} / {surahMeta.ayahCount}
          </span>
        </div>

        {/* Authentic Quran Text with Synchronized Word Highlight */}
        <div className="my-3 py-2">
          {currentAyah ? (
            <ArabicText
              arabicText={currentAyah.arabicText}
              ayahNumber={currentAyah.ayahNumber}
              words={currentAyah.words}
              activeWordIndex={activeWordIndex}
              fontSize="large"
            />
          ) : (
            <div className="text-center py-8 text-[#8C9BA7] font-medium">
              Memuat ayat Al-Qur'an...
            </div>
          )}

          {/* Authentic Indonesian Kemenag Translation */}
          {currentAyah?.translationId && (
            <p className="text-xs text-[#164C68] mt-4 font-medium leading-relaxed border-t border-slate-100 pt-3">
              "{currentAyah.translationId}"
            </p>
          )}
        </div>

        {/* Repetition Cycle Indicator */}
        <div className="flex items-center justify-between text-[11px] text-[#8C9BA7] font-medium pt-2 border-t border-slate-100">
          <span>
            Putaran Ayat: {progressInfo?.currentAyahRepeat || 1}/{ayahRepeats}
          </span>
          <span>
            Putaran Blok: {progressInfo?.currentBlockRepeat || 1}/{blockRepeats === -1 ? '∞' : blockRepeats}
          </span>
        </div>
      </div>

      {/* Audio Player Controls */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-sm flex items-center justify-between">
        <button
          onClick={handleSpeedToggle}
          className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#EEF8FF] text-[#164C68] font-bold text-xs hover:bg-[#d9effc] active:scale-95 transition-all"
          title="Kecepatan Bacaan"
        >
          {playbackSpeed}x
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            aria-label="Ayat Sebelumnya"
            className="w-12 h-12 rounded-2xl bg-[#EEF8FF] text-[#164C68] flex items-center justify-center hover:bg-[#d9effc] active:scale-95 transition-all"
          >
            <SkipBack size={22} />
          </button>

          <button
            onClick={handlePlayPause}
            aria-label={playbackState === 'PLAYING' ? 'Jeda' : 'Putar'}
            className="w-16 h-16 rounded-full bg-[#08B9EF] text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:bg-[#07a6d7] active:scale-95 transition-all"
          >
            {playbackState === 'PLAYING' ? (
              <Pause size={28} className="fill-white" />
            ) : (
              <Play size={28} className="fill-white ml-1" />
            )}
          </button>

          <button
            onClick={handleNext}
            aria-label="Ayat Berikutnya"
            className="w-12 h-12 rounded-2xl bg-[#EEF8FF] text-[#164C68] flex items-center justify-center hover:bg-[#d9effc] active:scale-95 transition-all"
          >
            <SkipForward size={22} />
          </button>
        </div>

        <button
          onClick={() => {
            if (playerRef.current) {
              playerRef.current.currentAyahRepeat = 1;
              playerRef.current.loadCurrentAyah();
              playerRef.current.play();
            }
          }}
          className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#EEF8FF] text-[#164C68] hover:bg-[#d9effc] active:scale-95 transition-all"
          title="Ulangi Ayat Ini"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* CTA: Ready for Step 2 Latihan */}
      <Button
        variant="purple"
        size="lg"
        fullWidth
        onClick={() => {
          playerRef.current?.pause();
          CompanionService.recordActivity(activeChildId, 'dengar', 15, 3);
          onProceedToLatihan(selectedSurahNumber, activeBlock.blockNumber);
        }}
        icon={<CheckCircle size={20} />}
      >
        Sudah Paham Nadanya? Lanjut Latihan!
      </Button>

      {/* Subtle Companion Presence in corner */}
      <SubtleCompanionReaction
        companion={companion}
        pulseTrigger={companionPulseTrigger}
        message="Lumi suka nada tartil ini 🎵"
      />
    </div>
  );
};
