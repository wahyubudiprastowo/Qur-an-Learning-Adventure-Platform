import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  Volume2,
  Star,
} from 'lucide-react';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { getSurahAyahs } from '../../data/quranData';
import { RECITERS } from '../../data/recitersData';
import { QuranAudioPlayer, PlaybackState, AudioProgressInfo, GlobalAudioManager } from '../../services/audioService';
import { StorageService } from '../../services/storageService';
import { AyahData, MemorizationBlock } from '../../types';
import { ArabicText } from '../common/ArabicText';
import { Button } from '../common/Button';
import { RewardModal } from '../common/RewardModal';
import { CompanionService } from '../../services/companionService';
import { SubtleCompanionReaction } from '../companion/SubtleCompanionReaction';

interface ZiadahPlayerProps {
  childId: string;
  surahNumber: number;
  selectedBlocks: MemorizationBlock[];
  ayahRepeats: number;
  blockRepeats: number;
  onFinishSession: () => void;
  onBack: () => void;
}

export const ZiadahPlayer: React.FC<ZiadahPlayerProps> = ({
  childId,
  surahNumber,
  selectedBlocks,
  ayahRepeats,
  blockRepeats,
  onFinishSession,
}) => {
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [ayahs, setAyahs] = useState<AyahData[]>([]);

  const [reciterId, setReciterId] = useState<string>('alafasy');
  const [playbackState, setPlaybackState] = useState<PlaybackState>('IDLE');
  const [progressInfo, setProgressInfo] = useState<AudioProgressInfo | null>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  // Reward modal state
  const [rewardModalOpen, setRewardModalOpen] = useState<boolean>(false);
  const [companionPulseTrigger, setCompanionPulseTrigger] = useState<number>(0);
  const companion = CompanionService.getCompanionData(childId);
  const [rewardData, setRewardData] = useState<{ stars: number; xp: number; title: string; message: string }>({
    stars: 5,
    xp: 25,
    title: 'Masya Allah! Blok Hafal!',
    message: 'Hebat sekali! Hafalan blok ini sudah berhasil diselesaikan.',
  });

  const playerRef = useRef<QuranAudioPlayer | null>(null);
  const ayahsRef = useRef<AyahData[]>([]);
  ayahsRef.current = ayahs;

  const currentAyahIndexRef = useRef<number>(0);
  currentAyahIndexRef.current = currentAyahIndex;

  const activeBlock = selectedBlocks[currentBlockIndex] || selectedBlocks[0];
  const surahMeta = useMemo(() => {
    return SURAHS_METADATA.find((s) => s.number === surahNumber) || SURAHS_METADATA[0];
  }, [surahNumber]);

  // Initialize Player once on mount
  useEffect(() => {
    const player = new QuranAudioPlayer();
    playerRef.current = player;

    player.onStateChange = (state) => setPlaybackState(state);
    player.onProgressUpdate = (info) => {
      setProgressInfo(info);
      const list = ayahsRef.current;
      const idx = currentAyahIndexRef.current;
      if (list[idx]?.words) {
        const words = list[idx].words!;
        const curMs = info.currentTimeMs;
        const found = words.findIndex((w) => curMs >= w.startMs && curMs < w.endMs);
        setActiveWordIndex(found !== -1 ? found : null);
      }
    };
    player.onAyahChange = (ayahNum) => {
      const list = ayahsRef.current;
      const idx = list.findIndex((a) => a.ayahNumber === ayahNum);
      if (idx !== -1) {
        setCurrentAyahIndex(idx);
        setActiveWordIndex(null);
        setCompanionPulseTrigger((prev) => prev + 1);
      }
    };

    const unsubStop = GlobalAudioManager.addStopListener(() => {
      setPlaybackState('PAUSED');
      setActiveWordIndex(null);
    });

    return () => {
      unsubStop();
      player.destroy();
    };
  }, []);

  // Load Ayahs for current block
  useEffect(() => {
    if (!activeBlock) return;

    let isMounted = true;
    getSurahAyahs(surahNumber).then((data) => {
      if (!isMounted) return;
      const filtered = data.filter(
        (a) => a.ayahNumber >= activeBlock.startAyah && a.ayahNumber <= activeBlock.endAyah
      );
      setAyahs(filtered);
      setCurrentAyahIndex(0);
      setActiveWordIndex(null);

      // Reconfigure player
      if (playerRef.current && filtered.length > 0) {
        playerRef.current.setConfiguration({
          reciterId,
          surahNumber,
          startAyah: activeBlock.startAyah,
          endAyah: activeBlock.endAyah,
          ayahRepeats,
          blockRepeats,
        });
        playerRef.current.loadCurrentAyah();
      }

      // Persist ongoing session continuously
      StorageService.setLastSession(childId, {
        surahNumber,
        surahName: surahMeta.nameLatin,
        blockNumber: activeBlock.blockNumber,
        startAyah: activeBlock.startAyah,
        endAyah: activeBlock.endAyah,
        mode: 'ziadah',
        timestamp: new Date().toISOString(),
      });
    });

    return () => {
      isMounted = false;
    };
  }, [surahNumber, activeBlock, reciterId, ayahRepeats, blockRepeats, childId, surahMeta.nameLatin]);

  const currentAyah = ayahs[currentAyahIndex];

  const handlePlayPause = () => {
    playerRef.current?.togglePlayPause();
  };

  const handleNext = () => {
    playerRef.current?.nextAyah();
  };

  const handlePrev = () => {
    playerRef.current?.previousAyah();
  };

  const handleSelectAyah = (index: number) => {
    setCurrentAyahIndex(index);
    setActiveWordIndex(null);
    if (playerRef.current && ayahs[index]) {
      playerRef.current.jumpToAyah(ayahs[index].ayahNumber);
    }
  };

  // Mark Current Block Memorized
  const handleMarkMemorized = () => {
    playerRef.current?.pause();

    // Update block state in storage
    StorageService.setBlockState(childId, surahNumber, activeBlock.blockNumber, 'MEMORIZED');
    StorageService.incrementBlockRepeat(childId, surahNumber, activeBlock.blockNumber);

    // Record in ledger
    StorageService.recordPoints(
      childId,
      'MEMORIZE_BLOCK',
      25,
      5,
      `Hafal Blok ${activeBlock.blockNumber} Surah ${surahMeta.nameLatin}`,
      'block',
      activeBlock.id
    );

    // Record activity in Companion service for Hafiz trait and quest progression
    CompanionService.recordActivity(childId, 'ziadah', 25, 5);
    setCompanionPulseTrigger((prev) => prev + 1);

    setRewardData({
      stars: 5,
      xp: 25,
      title: 'Masya Allah, Hebat!',
      message: `Selamat! Kamu telah menyelesaikan ${activeBlock.name} Surah ${surahMeta.nameLatin}.`,
    });
    setRewardModalOpen(true);
  };

  const handleNextAfterReward = () => {
    setRewardModalOpen(false);
    if (currentBlockIndex < selectedBlocks.length - 1) {
      setCurrentBlockIndex((prev) => prev + 1);
    } else {
      onFinishSession();
    }
  };

  const totalBlocks = selectedBlocks.length;
  const currentBlockNum = currentBlockIndex + 1;
  const totalAyahsInBlock = ayahs.length;
  const currentAyahNum = currentAyahIndex + 1;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Live Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#8C9BA7]">
          <span className="text-[#164C68] font-heading font-extrabold text-sm">
            {surahMeta.nameLatin} ({surahMeta.nameArabic}) • {activeBlock.name}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-amber-700 font-black">
            <Star size={14} className="fill-yellow-400 text-yellow-500" />
            <span>+5</span>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-[#C9E1ED]/50 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#08B9EF] h-full transition-all duration-300 rounded-full"
            style={{
              width: `${Math.round(((currentBlockIndex * totalAyahsInBlock + currentAyahNum) / Math.max(1, totalBlocks * totalAyahsInBlock)) * 100)}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8C9BA7] font-semibold">
          <span>
            blok {currentBlockNum}/{totalBlocks} • ayat {currentAyahNum}/{totalAyahsInBlock || 1}
          </span>
          <span>
            Pengulangan: {progressInfo?.currentAyahRepeat || 1}/{ayahRepeats}
          </span>
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
                onClick={() => handleSelectAyah(idx)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#08B9EF] text-white shadow-xs scale-105'
                    : 'bg-white border border-[#C9E1ED] text-[#164C68] hover:bg-[#EEF8FF]'
                }`}
              >
                Ayat {a.ayahNumber}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Quran Card with Large Arabic Typography */}
      <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-6 shadow-sm min-h-[260px] flex flex-col justify-between text-center relative overflow-hidden">
        {/* Ayah Number Header */}
        <div className="text-center">
          <span className="text-[11px] font-black tracking-widest text-[#08B9EF] uppercase bg-[#EEF8FF] px-3 py-1 rounded-full">
            AYAT {currentAyah?.ayahNumber || activeBlock.startAyah}
          </span>
        </div>

        {/* Arabic Display with Synced Word Highlight */}
        <div className="py-6 flex items-center justify-center">
          {currentAyah ? (
            <ArabicText
              arabicText={currentAyah.arabicText}
              ayahNumber={currentAyah.ayahNumber}
              words={currentAyah.words}
              activeWordIndex={activeWordIndex}
              fontSize="large"
            />
          ) : (
            <p className="text-[#8C9BA7] font-medium text-sm">Memuat ayat...</p>
          )}
        </div>

        {/* Translation Snippet */}
        {currentAyah?.translationId && (
          <p className="text-xs text-[#164C68] font-medium italic border-t border-slate-100 pt-3">
            "{currentAyah.translationId}"
          </p>
        )}
      </div>

      {/* Audio Player Controls */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-sm space-y-3">
        {/* Playback Buttons */}
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={handlePrev}
            aria-label="Ayat Sebelumnya"
            className="w-12 h-12 rounded-2xl bg-[#EEF8FF] text-[#164C68] flex items-center justify-center hover:bg-[#d9effc] active:scale-95 transition-all cursor-pointer"
          >
            <SkipBack size={22} />
          </button>

          <button
            onClick={handlePlayPause}
            aria-label={playbackState === 'PLAYING' ? 'Jeda' : 'Putar'}
            className="w-16 h-16 rounded-full bg-[#08B9EF] text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:bg-[#07a6d7] active:scale-95 transition-all cursor-pointer"
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
            className="w-12 h-12 rounded-2xl bg-[#EEF8FF] text-[#164C68] flex items-center justify-center hover:bg-[#d9effc] active:scale-95 transition-all cursor-pointer"
          >
            <SkipForward size={22} />
          </button>

          <button
            onClick={() => {
              if (playerRef.current) {
                playerRef.current.currentAyahRepeat = 1;
                playerRef.current.loadCurrentAyah();
                playerRef.current.play();
              }
            }}
            aria-label="Ulangi"
            className="w-10 h-10 rounded-xl bg-[#EEF8FF] text-[#164C68] flex items-center justify-center hover:bg-[#d9effc] active:scale-95 transition-all cursor-pointer"
            title="Ulangi Ayat Ini"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Qari Selector info */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100 text-xs text-[#8C9BA7]">
          <Volume2 size={14} className="text-[#08B9EF]" />
          <span>Qari:</span>
          <select
            value={reciterId}
            onChange={(e) => {
              setReciterId(e.target.value);
              if (playerRef.current) {
                playerRef.current.reciterId = e.target.value;
                playerRef.current.loadCurrentAyah();
              }
            }}
            className="bg-[#EEF8FF] text-[#164C68] font-bold rounded-lg px-2 py-0.5 border border-[#C9E1ED]"
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary CTA: Sudah Hafal Block Ini */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleMarkMemorized}
        icon={<CheckCircle2 size={20} />}
      >
        Sudah Hafal Blok Ini
      </Button>

      {/* Celebratory Reward Modal */}
      <RewardModal
        isOpen={rewardModalOpen}
        onClose={() => setRewardModalOpen(false)}
        title={rewardData.title}
        message={rewardData.message}
        starsEarned={rewardData.stars}
        xpEarned={rewardData.xp}
        nextLabel={currentBlockIndex < selectedBlocks.length - 1 ? 'Lanjut Blok Berikutnya' : 'Selesai Latihan'}
        onNext={handleNextAfterReward}
      />

      {/* Subtle Companion Presence in corner (never intrusive) */}
      <SubtleCompanionReaction
        companion={companion}
        pulseTrigger={companionPulseTrigger}
        message="Lumi tersenyum! +1 🐾"
      />
    </div>
  );
};
