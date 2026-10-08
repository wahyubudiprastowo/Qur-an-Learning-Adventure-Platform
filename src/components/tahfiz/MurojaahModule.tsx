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
  Mic,
  MicOff,
  Sparkles,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { getBlocksForSurah } from '../../data/blocksData';
import { getSurahAyahs } from '../../data/quranData';
import { RECITERS } from '../../data/recitersData';
import { QuranAudioPlayer, PlaybackState, GlobalAudioManager } from '../../services/audioService';
import { RECALL_MODES, RecallMode, getDeterministicHiddenIndices } from '../../services/murojaahHiding';
import { StorageService } from '../../services/storageService';
import { AyahData, MemorizationBlock } from '../../types';
import { ArabicText } from '../common/ArabicText';
import { Button } from '../common/Button';
import { RewardModal } from '../common/RewardModal';
import { CompanionService } from '../../services/companionService';
import { SubtleCompanionReaction } from '../companion/SubtleCompanionReaction';

function removeHarakat(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
}

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

  // Mode selection: 'bertahap' (progressive text masking) vs 'harakat_voice' (Uji Harakat Hilang dengan Setoran Suara)
  const [murojaahTab, setMurojaahTab] = useState<'bertahap' | 'harakat_voice'>('bertahap');
  const [voiceIsRecording, setVoiceIsRecording] = useState<boolean>(false);
  const [voiceTimer, setVoiceTimer] = useState<number>(0);
  const [voiceHarakatRevealed, setVoiceHarakatRevealed] = useState<boolean>(false);
  const [voiceShowCorrection, setVoiceShowCorrection] = useState<boolean>(false);
  const [voiceSuccess, setVoiceSuccess] = useState<boolean | null>(null);
  const voiceIntervalRef = useRef<any>(null);

  const triggerPopConfetti = () => {
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#08B9EF', '#81E850', '#FFD83E', '#B797F6'],
      });
    } catch (e) {}
  };

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
        setVoiceHarakatRevealed(false);
        setVoiceSuccess(null);
        setVoiceShowCorrection(false);
      }
    };

    const unsubStop = GlobalAudioManager.addStopListener((source) => {
      if (source && playerRef.current && source === playerRef.current) {
        return;
      }
      setPlaybackState('IDLE');
    });

    return () => {
      unsubStop();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current);
      GlobalAudioManager.stopAll();
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
    CompanionService.onSurahCompleted(childId, surahMeta.nameLatin);
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

      {/* 2 Modes: Mode Teks Bertahap vs Mode Uji Harakat Hilang (Setoran Suara) */}
      <div className="flex bg-[#EEF8FF] p-1 rounded-2xl border border-[#C9E1ED] text-xs font-bold shadow-xs">
        <button
          onClick={() => {
            setMurojaahTab('bertahap');
            setVoiceIsRecording(false);
          }}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            murojaahTab === 'bertahap'
              ? 'bg-[#B797F6] text-white shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          📖 Bantuan Teks Bertahap
        </button>
        <button
          onClick={() => {
            setMurojaahTab('harakat_voice');
            setVoiceHarakatRevealed(false);
            setVoiceSuccess(null);
            setVoiceShowCorrection(false);
          }}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            murojaahTab === 'harakat_voice'
              ? 'bg-[#08B9EF] text-white shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <span>🎙️</span>
          <span>Uji Harakat Hilang (Setoran Suara)</span>
        </button>
      </div>

      {/* MODE 1: PROGRESSIVE TEXT MASKING */}
      {murojaahTab === 'bertahap' && (
        <>
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
        </>
      )}

      {/* MODE 2: UJI HARAKAT HILANG & SETORAN SUARA (Gundul to Pop Harakat) */}
      {murojaahTab === 'harakat_voice' && (
        <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-6 shadow-sm space-y-4 text-center animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-[#8C9BA7] font-semibold">
            <span className="font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span>🎙️</span> AYAT {currentAyah?.ayahNumber || activeBlock.startAyah} (TEKS GUNDUL)
            </span>
            <span className="text-[11px] text-[#08B9EF] font-bold">
              Setoran Suara
            </span>
          </div>

          <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-3 text-xs text-rose-900 leading-relaxed text-left">
            💡 <strong>Tantangan Setoran:</strong> Harakat pada ayat ini dihilangkan. Tekan tombol mikrofon, lafalkan ayatnya! Jika betul, harakat akan langsung muncul dengan animasi pop!
          </div>

          {/* Ayah Card: Gundul vs Harakat Revealed */}
          <div className="py-6 bg-[#EEF8FF] border-2 border-[#08B9EF]/40 rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all duration-300">
            {currentAyah ? (
              <p
                dir="rtl"
                className={`font-quran text-3xl sm:text-4xl text-[#164C68] font-bold leading-relaxed transition-all duration-300 ${
                  voiceHarakatRevealed
                    ? 'text-emerald-700 scale-105 filter drop-shadow-xs animate-in zoom-in-95'
                    : 'text-slate-800'
                }`}
              >
                {voiceHarakatRevealed
                  ? currentAyah.arabicText
                  : removeHarakat(currentAyah.arabicText)}
              </p>
            ) : (
              <p className="text-slate-400">Memuat...</p>
            )}

            {voiceHarakatRevealed && (
              <div className="mt-3 text-xs text-emerald-800 font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                <Sparkles size={16} className="text-emerald-500 animate-spin" />
                <span>Harakat Terbuka Sempurna!</span>
              </div>
            )}
          </div>

          {/* Big Record Voice Button */}
          <div className="py-2 flex flex-col items-center justify-center space-y-2">
            <button
              onClick={() => {
                if (!voiceIsRecording) {
                  setVoiceIsRecording(true);
                  setVoiceTimer(0);
                  setVoiceSuccess(null);
                  setVoiceShowCorrection(false);
                  setVoiceHarakatRevealed(false);

                  voiceIntervalRef.current = setInterval(() => {
                    setVoiceTimer((t) => t + 1);
                  }, 1000);
                } else {
                  setVoiceIsRecording(false);
                  if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current);

                  // Recitation completed: trigger pop animation!
                  setVoiceHarakatRevealed(true);
                  setVoiceSuccess(true);
                  triggerPopConfetti();

                  // Play reference audio
                  if (playerRef.current && currentAyah) {
                    playerRef.current.jumpToAyah(currentAyah.ayahNumber, true);
                  }
                }
              }}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl shadow-xl transition-all cursor-pointer ${
                voiceIsRecording
                  ? 'bg-rose-500 animate-pulse ring-8 ring-rose-200 scale-105'
                  : 'bg-gradient-to-tr from-[#08B9EF] to-[#0496c4] hover:scale-105 active:scale-95'
              }`}
            >
              {voiceIsRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </button>

            <span className="text-xs font-black text-[#164C68]">
              {voiceIsRecording
                ? `Merekam Setoran... (${voiceTimer} dtk) • Ketuk jika selesai`
                : 'Ketuk Mikrofon untuk Setoran'}
            </span>
          </div>

          {/* Success / Correction Bar */}
          {voiceSuccess && (
            <div className="space-y-3 animate-in zoom-in-95 pt-2">
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-3xl text-emerald-900 text-xs font-semibold space-y-2 text-left">
                <div className="flex items-center gap-2 text-sm font-black text-emerald-700">
                  <span>🎉</span>
                  <span>Masya Allah, Setoran Diterima!</span>
                </div>
                {currentAyah?.translationId && (
                  <p className="text-[11px] text-emerald-800 italic">
                    "{currentAyah.translationId}"
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (playerRef.current && currentAyah) {
                        playerRef.current.jumpToAyah(currentAyah.ayahNumber, true);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-200 text-emerald-900 text-xs font-bold hover:bg-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 size={14} /> Dengar Suara Qari
                  </button>
                  <button
                    onClick={() => setVoiceShowCorrection(!voiceShowCorrection)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    {voiceShowCorrection ? 'Tutup Koreksi' : 'Lihat Tampilan Koreksi'}
                  </button>
                </div>
              </div>

              {/* Tampilan Koreksi */}
              {voiceShowCorrection && currentAyah && (
                <div className="p-4 bg-white border-2 border-[#C9E1ED] rounded-3xl text-left space-y-2 animate-in fade-in">
                  <h4 className="text-xs font-black text-[#164C68] flex items-center gap-1.5">
                    <AlertCircle size={15} className="text-[#08B9EF]" />
                    <span>Tampilan Koreksi & Penjelasan Harakat:</span>
                  </h4>
                  <div className="text-[11px] space-y-1">
                    <p className="text-[#8C9BA7]">
                      <strong>Teks Tanpa Harakat:</strong>{' '}
                      <span dir="rtl" className="font-quran text-sm text-[#164C68]">
                        {removeHarakat(currentAyah.arabicText)}
                      </span>
                    </p>
                    <p className="text-emerald-700">
                      <strong>Harakat Lengkap:</strong>{' '}
                      <span dir="rtl" className="font-quran text-base font-bold">
                        {currentAyah.arabicText}
                      </span>
                    </p>
                  </div>
                  <p className="text-[10px] text-[#8C9BA7] pt-1 border-t border-slate-100">
                    Pastikan mad (panjang 2 harakat), tasydid, dan harakat akhir dibaca dengan tartil sesuai makhraj.
                  </p>
                </div>
              )}

              {/* Next Ayah in Murojaah */}
              {currentAyahIndex < ayahs.length - 1 && (
                <Button
                  variant="green"
                  size="md"
                  fullWidth
                  onClick={handleNext}
                  icon={<CheckCircle2 size={16} />}
                >
                  Lanjut ke Ayat {currentAyahIndex + 2}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

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
