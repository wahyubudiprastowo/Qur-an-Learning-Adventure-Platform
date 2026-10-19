import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  BookOpen,
  Bookmark,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ArrowLeft,
  ChevronRight,
  Repeat,
  RotateCcw,
  Lightbulb,
  Sparkles,
  X,
  ShieldCheck,
} from 'lucide-react';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { getSurahAyahs } from '../../data/quranData';
import { RECITERS, getAyahAudioUrl, getAyahAudioFallbackUrl } from '../../data/recitersData';
import { AyahData, SurahMetadata } from '../../types';
import { ArabicText } from '../common/ArabicText';
import { GlobalAudioManager } from '../../services/audioService';
import { SoundEffects } from '../../services/soundEffects';
import { TafsirService, AyahTafsirItem } from '../../services/tafsirService';

interface TilawahModuleProps {
  childId: string;
  onBack: () => void;
  onOpenTafsir?: (surahNumber: number, ayahNumber: number) => void;
}

export const TilawahModule: React.FC<TilawahModuleProps> = ({
  childId,
  onBack,
  onOpenTafsir,
}) => {
  // If null -> surah list; if set -> reading view
  const [activeSurah, setActiveSurah] = useState<SurahMetadata | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJuz, setSelectedJuz] = useState<number | 'all'>('all');

  // Reader state
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState<boolean>(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<number | null>(null);
  const [reciterId, setReciterId] = useState<string>('alafasy');
  const [fontFamily, setFontFamily] = useState<'noto' | 'amiri'>('noto');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('large');
  const [bookmarkedAyah, setBookmarkedAyah] = useState<number | null>(null);
  const [playMode, setPlayMode] = useState<'single' | 'continuous'>('continuous');

  // Ayah Tafsir Modal State
  const [activeTafsirModal, setActiveTafsirModal] = useState<{
    surahNumber: number;
    ayahNumber: number;
    surahName: string;
    data?: AyahTafsirItem;
    isLoading: boolean;
  } | null>(null);
  const [isNarratingTafsir, setIsNarratingTafsir] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter surahs
  const filteredSurahs = useMemo(() => {
    return SURAHS_METADATA.filter((s) => {
      const matchQuery =
        s.nameLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.number.toString() === searchQuery.trim();
      const matchJuz = selectedJuz === 'all' || s.juzNumber === selectedJuz;
      return matchQuery && matchJuz;
    });
  }, [searchQuery, selectedJuz]);

  // Load Ayahs when active surah is selected
  useEffect(() => {
    // Global stop listener: when any other module starts playing or GlobalAudioManager.stopAll() is invoked
    const unsub = GlobalAudioManager.addStopListener((source) => {
      // If the audio that started playing is this Tilawah audio itself, do not stop!
      if (source && audioRef.current && source === audioRef.current) {
        return;
      }
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        GlobalAudioManager.unregisterRawAudio(audioRef.current);
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch (e) {}
        audioRef.current = null;
      }
      setCurrentPlayingAyah(null);
    });

    if (!activeSurah) {
      handleStopAudio();
      return () => unsub();
    }

    let isMounted = true;
    setIsLoadingAyahs(true);
    getSurahAyahs(activeSurah.number).then((data) => {
      if (isMounted) {
        setAyahs(data);
        setIsLoadingAyahs(false);
      }
    });

    return () => {
      isMounted = false;
      unsub();
      handleStopAudio();
    };
  }, [activeSurah]);

  const handlePlayAyah = (
    ayahNumber: number,
    forceSingle: boolean = false,
    forceRestart: boolean = false,
    customReciter?: string
  ) => {
    if (!activeSurah) return;

    // Toggle pause if clicking already playing ayah (unless forceRestart is true)
    if (!forceRestart && currentPlayingAyah === ayahNumber && audioRef.current && !audioRef.current.paused) {
      handleStopAudio();
      return;
    }

    // Stop and unregister existing audio cleanly
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      GlobalAudioManager.unregisterRawAudio(audioRef.current);
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {}
      audioRef.current = null;
    }

    const currentReciter = customReciter || reciterId;
    const url = getAyahAudioUrl(currentReciter, activeSurah.number, ayahNumber);
    const audio = new Audio(url);
    audio.preload = 'auto';

    audioRef.current = audio;
    setCurrentPlayingAyah(ayahNumber);

    // Register with global coordinator and stop any other audio source
    GlobalAudioManager.registerRawAudio(audio);
    GlobalAudioManager.notifyPlayStarted(audio);

    // Auto-scroll into view smoothly
    setTimeout(() => {
      const el = document.getElementById(`ayah-${ayahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);

    audio.onerror = () => {
      if (audioRef.current !== audio) return;
      console.warn('Audio primary URL failed, trying fallback URL');
      const fallbackUrl = getAyahAudioFallbackUrl(currentReciter, activeSurah.number, ayahNumber);
      if (audio.src !== fallbackUrl) {
        audio.src = fallbackUrl;
        audio.load();
        audio.play().catch(() => {
          GlobalAudioManager.unregisterRawAudio(audio);
          if (audioRef.current === audio) {
            audioRef.current = null;
            setCurrentPlayingAyah(null);
          }
        });
      } else {
        GlobalAudioManager.unregisterRawAudio(audio);
        if (audioRef.current === audio) {
          audioRef.current = null;
          setCurrentPlayingAyah(null);
        }
      }
    };

    audio.onended = () => {
      GlobalAudioManager.unregisterRawAudio(audio);
      if (audioRef.current !== audio) {
        return;
      }

      if (playMode === 'single' || forceSingle) {
        audioRef.current = null;
        setCurrentPlayingAyah(null);
        return;
      }

      // Continuous play: play next ayah if available and not stopped
      const nextNum = ayahNumber + 1;
      if (nextNum <= activeSurah.ayahCount) {
        handlePlayAyah(nextNum);
      } else {
        audioRef.current = null;
        setCurrentPlayingAyah(null);
      }
    };

    audio.play().catch((err) => {
      console.warn('Playback error or waiting user interaction:', err);
    });
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      GlobalAudioManager.unregisterRawAudio(audioRef.current);
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {}
      audioRef.current = null;
    }
    setCurrentPlayingAyah(null);
  };

  const handleNextAyah = () => {
    if (!activeSurah) return;
    const target = currentPlayingAyah ? Math.min(currentPlayingAyah + 1, activeSurah.ayahCount) : 1;
    handlePlayAyah(target, false, true);
  };

  const handlePrevAyah = () => {
    if (!activeSurah) return;
    const target = currentPlayingAyah ? Math.max(currentPlayingAyah - 1, 1) : 1;
    handlePlayAyah(target, false, true);
  };

  const handleOpenAyahTafsir = (surahNumber: number, ayahNumber: number) => {
    const sMeta = SURAHS_METADATA.find((s) => s.number === surahNumber);
    setActiveTafsirModal({
      surahNumber,
      ayahNumber,
      surahName: sMeta?.nameLatin || `Surah ${surahNumber}`,
      isLoading: true,
    });

    TafsirService.getAyahTafsir(surahNumber, ayahNumber)
      .then((data) => {
        setActiveTafsirModal((prev) => {
          if (!prev || prev.surahNumber !== surahNumber || prev.ayahNumber !== ayahNumber) return prev;
          return {
            ...prev,
            data: data || undefined,
            isLoading: false,
          };
        });
      })
      .catch((err) => {
        console.error('Failed to load ayah tafsir:', err);
        setActiveTafsirModal((prev) => (prev ? { ...prev, isLoading: false } : null));
      });
  };

  const handleToggleNarrateAyahTafsir = (
    tafsirText: string,
    hikmahText: string,
    surahName: string,
    ayahNum: number
  ) => {
    if (isNarratingTafsir) {
      SoundEffects.stopSpeaking();
      setIsNarratingTafsir(false);
    } else {
      handleStopAudio();
      const narrative = `Tafsir Surah ${surahName} ayat ke ${ayahNum}. Makna dan penjelasan: ${tafsirText}. Hikmah untuk adik-adik santri: ${hikmahText}`;
      const started = SoundEffects.speakIndonesian(narrative, () => {
        setIsNarratingTafsir(false);
      });
      setIsNarratingTafsir(started);
    }
  };

  // --- Render 1: Mushaf Reader View ---
  if (activeSurah) {
    return (
      <div className="space-y-4 pb-32 animate-in fade-in duration-200">
        {/* Top Navigation & Settings Bar */}
        <div className="bg-white border border-[#C9E1ED] rounded-3xl p-3.5 shadow-xs flex items-center justify-between">
          <button
            onClick={() => {
              handleStopAudio();
              setActiveSurah(null);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#164C68] hover:text-[#08B9EF] cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Daftar 114 Surah</span>
          </button>

          {/* Quick Settings: Font & Qari */}
          <div className="flex items-center gap-1.5">
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as any)}
              className="bg-[#EEF8FF] border border-[#C9E1ED] text-[11px] font-bold text-[#164C68] rounded-xl px-2 py-1"
            >
              <option value="noto">Font Noto Naskh</option>
              <option value="amiri">Font Amiri</option>
            </select>

            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as any)}
              className="bg-[#EEF8FF] border border-[#C9E1ED] text-[11px] font-bold text-[#164C68] rounded-xl px-2 py-1"
            >
              <option value="normal">Kecil</option>
              <option value="large">Sedang</option>
              <option value="xl">Besar</option>
            </select>
          </div>
        </div>

        {/* Surah Header Banner */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-[#C9E1ED] rounded-3xl p-5 text-center space-y-1 shadow-xs">
          <span className="font-quran text-4xl text-[#08B9EF] block mb-1">
            {activeSurah.nameArabic}
          </span>
          <h2 className="text-xl font-black text-[#164C68] font-heading">
            Surah {activeSurah.nameLatin} ({activeSurah.translation})
          </h2>
          <p className="text-xs text-[#8C9BA7] font-semibold">
            {activeSurah.revelationType} • {activeSurah.ayahCount} Ayat • Juz {activeSurah.juzNumber}
          </p>

          {/* Bismillah Header (except At-Taubah and Al-Fatihah where it is ayah 1) */}
          {activeSurah.number !== 9 && activeSurah.number !== 1 && (
            <div className="pt-3 border-t border-[#C9E1ED]/50 my-2">
              <span dir="rtl" className="font-quran text-2xl text-[#164C68]">
                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </span>
            </div>
          )}
        </div>

        {/* Audio Player & Mode Bar */}
        <div className="bg-white border border-[#C9E1ED] rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-[#08B9EF]" />
            <span className="font-bold text-[#8C9BA7]">Qari:</span>
            <select
              value={reciterId}
              onChange={(e) => {
                const newReciter = e.target.value;
                setReciterId(newReciter);
                if (currentPlayingAyah !== null) {
                  handlePlayAyah(currentPlayingAyah, false, true, newReciter);
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlayMode(playMode === 'continuous' ? 'single' : 'continuous')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                playMode === 'single'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-[#EEF8FF] text-[#08B9EF] border border-[#C9E1ED]'
              }`}
            >
              {playMode === 'single' ? 'Mode: 1 Ayat Saja' : 'Mode: Terus Lanjut'}
            </button>

            <button
              onClick={() => handlePlayAyah(currentPlayingAyah || 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#08B9EF] text-white font-bold text-xs hover:bg-[#07a6d7] active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              {currentPlayingAyah !== null ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
              <span>{currentPlayingAyah !== null ? 'Jeda Audio' : 'Putar Surah'}</span>
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoadingAyahs && (
          <div className="space-y-4 py-6 text-center">
            <div className="inline-block animate-spin text-[#08B9EF] mb-2 text-2xl">⏳</div>
            <p className="text-xs font-bold text-[#8C9BA7]">Memuat ayat-ayat Al-Qur'an...</p>
          </div>
        )}

        {/* Ayahs List */}
        {!isLoadingAyahs && (
          <div className="space-y-4">
            {ayahs.map((ayah) => {
              const isPlaying = currentPlayingAyah === ayah.ayahNumber;
              const isBookmarked = bookmarkedAyah === ayah.ayahNumber;

              return (
                <div
                  key={ayah.ayahNumber}
                  id={`ayah-${ayah.ayahNumber}`}
                  className={`bg-white border-2 rounded-3xl p-5 shadow-xs transition-all ${
                    isPlaying
                      ? 'border-[#08B9EF] ring-3 ring-cyan-200 bg-cyan-50/20'
                      : 'border-[#C9E1ED]'
                  }`}
                >
                  {/* Ayah Header Row */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-8 h-8 rounded-full border text-xs font-black flex items-center justify-center font-heading ${
                          isPlaying
                            ? 'bg-[#08B9EF] text-white border-[#08B9EF]'
                            : 'bg-[#EEF8FF] border-[#C9E1ED] text-[#164C68]'
                        }`}
                      >
                        {ayah.ayahNumber}
                      </span>
                      <button
                        onClick={() => handlePlayAyah(ayah.ayahNumber)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-[#08B9EF] text-white shadow-xs animate-pulse'
                            : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefc]'
                        }`}
                        title={isPlaying ? 'Jeda Ayat' : 'Dengarkan Ayat Ini'}
                      >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-current ml-0.5" />}
                      </button>
                      {isPlaying && (
                        <span className="text-[11px] font-bold text-[#08B9EF] animate-pulse">
                          ▶ Sedang Membaca Ayat {ayah.ayahNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Tafsir Ayat Action Button */}
                      <button
                        onClick={() => handleOpenAyahTafsir(activeSurah.number, ayah.ayahNumber)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                        title="Pelajari Makna & Tafsir Ayat Ini"
                      >
                        <Lightbulb size={13} className="text-amber-600" />
                        <span>Tafsir Ayat</span>
                      </button>

                      <button
                        onClick={() => setBookmarkedAyah(isBookmarked ? null : ayah.ayahNumber)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isBookmarked ? 'text-[#08B9EF]' : 'text-[#8C9BA7] hover:text-[#164C68]'
                        }`}
                        title="Tandai Bacaan Terakhir"
                      >
                        <Bookmark size={18} className={isBookmarked ? 'fill-current' : ''} />
                      </button>
                    </div>
                  </div>

                  {/* Authentic Quran Text with Ayah Marker */}
                  <div className="my-2">
                    <ArabicText
                      arabicText={ayah.arabicText}
                      ayahNumber={ayah.ayahNumber}
                      fontSize={fontSize}
                      fontFamily={fontFamily}
                    />
                  </div>

                  {/* Transliteration */}
                  {ayah.transliteration && (
                    <p className="text-xs text-[#08B9EF] font-semibold italic mt-2 text-left">
                      {ayah.transliteration}
                    </p>
                  )}

                  {/* Indonesian Translation */}
                  {ayah.translationId && (
                    <p className="text-xs text-[#164C68] font-medium leading-relaxed pt-2 mt-1 border-t border-slate-100 text-left">
                      {ayah.translationId}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Mini Audio Bar while playing */}
        {currentPlayingAyah !== null && (
          <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-[#164C68] text-white rounded-2xl p-3 shadow-xl flex items-center justify-between z-40 border border-cyan-400/30 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#08B9EF] flex items-center justify-center text-white shrink-0 animate-pulse">
                <Volume2 size={18} />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold truncate">
                  {activeSurah.nameLatin} • Ayat {currentPlayingAyah}
                </h4>
                <p className="text-[10px] text-cyan-200">
                  {RECITERS.find((r) => r.id === reciterId)?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePrevAyah}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                title="Ayat Sebelumnya"
              >
                <SkipBack size={14} />
              </button>
              <button
                onClick={() => handlePlayAyah(currentPlayingAyah)}
                className="w-9 h-9 rounded-full bg-[#08B9EF] hover:bg-[#07a6d7] flex items-center justify-center text-white cursor-pointer shadow-sm"
              >
                <Pause size={16} />
              </button>
              <button
                onClick={handleNextAyah}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                title="Ayat Berikutnya"
              >
                <SkipForward size={14} />
              </button>
            </div>
          </div>
        )}
        {/* Ayah Tafsir Modal Sheet */}
        {activeTafsirModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl border-2 border-amber-300 w-full max-w-lg max-h-[85vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Lightbulb size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#164C68] font-heading">
                      Tafsir Surah {activeTafsirModal.surahName} : Ayat {activeTafsirModal.ayahNumber}
                    </h3>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck size={11} /> Rujukan Resmi Kemenag RI
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    SoundEffects.stopSpeaking();
                    setIsNarratingTafsir(false);
                    setActiveTafsirModal(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {activeTafsirModal.isLoading ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-[#8C9BA7]">Memuat tafsir Kemenag RI...</p>
                </div>
              ) : activeTafsirModal.data ? (
                <div className="space-y-3.5">
                  {/* Arabic Text */}
                  {activeTafsirModal.data.arabicText && (
                    <div className="p-3 bg-amber-50/40 rounded-2xl border border-amber-200">
                      <ArabicText
                        arabicText={activeTafsirModal.data.arabicText}
                        ayahNumber={activeTafsirModal.ayahNumber}
                        fontSize="large"
                      />
                    </div>
                  )}

                  {/* Translation */}
                  {activeTafsirModal.data.translation && (
                    <div className="p-3 bg-[#EEF8FF] rounded-2xl border border-[#C9E1ED]">
                      <span className="text-[10px] font-bold text-[#8C9BA7] uppercase tracking-wider block mb-0.5">
                        TERJEMAHAN
                      </span>
                      <p className="text-xs text-[#164C68] font-medium leading-relaxed">
                        "{activeTafsirModal.data.translation}"
                      </p>
                    </div>
                  )}

                  {/* Tafsir Ringkas */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb size={14} className="text-amber-600" />
                      <span>MAKNA & TAFSIR RINGKAS</span>
                    </span>
                    <p className="text-xs text-[#164C68] font-medium leading-relaxed bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
                      {activeTafsirModal.data.tafsirRingkas}
                    </p>
                  </div>

                  {/* Hikmah untuk Santri */}
                  <div className="space-y-1 bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
                    <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={14} className="text-emerald-600" />
                      <span>🌱 HIKMAH UNTUK SANTRI</span>
                    </span>
                    <p className="text-xs text-emerald-950 font-semibold leading-relaxed">
                      {activeTafsirModal.data.hikmahAnak}
                    </p>
                  </div>

                  {/* Action Buttons: Dengar Tafsir & Buka Modul Tafsir */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleNarrateAyahTafsir(
                          activeTafsirModal.data!.tafsirRingkas,
                          activeTafsirModal.data!.hikmahAnak,
                          activeTafsirModal.surahName,
                          activeTafsirModal.ayahNumber
                        )
                      }
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        isNarratingTafsir
                          ? 'bg-rose-500 text-white animate-pulse font-black'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isNarratingTafsir ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      <span>{isNarratingTafsir ? 'Stop Penjelasan' : 'Dengar Tafsir 🔊'}</span>
                    </button>

                    {onOpenTafsir && (
                      <button
                        type="button"
                        onClick={() => {
                          SoundEffects.stopSpeaking();
                          setIsNarratingTafsir(false);
                          const sNum = activeTafsirModal.surahNumber;
                          const aNum = activeTafsirModal.ayahNumber;
                          setActiveTafsirModal(null);
                          onOpenTafsir(sNum, aNum);
                        }}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold bg-[#08B9EF] hover:bg-[#07a6d7] text-white flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>Halaman Penuh</span>
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Render 2: 114 Surah Browser View ---
  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Search Input Bar */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C9BA7]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama atau nomor surah (misal: Al-Kahf, Yasin, 18)..."
          className="w-full bg-white border border-[#C9E1ED] focus:border-[#08B9EF] rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-[#164C68] shadow-xs focus:outline-none placeholder:text-[#8C9BA7]"
        />
      </div>

      {/* Juz Filter Pills */}
      <div className="flex gap-1.5 p-1 bg-white border border-[#C9E1ED] rounded-2xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setSelectedJuz('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedJuz === 'all'
              ? 'bg-[#08B9EF] text-white shadow-xs'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          Semua Juz (1–30)
        </button>
        {[30, 29, 1, 2, 15, 28].map((juz) => (
          <button
            key={juz}
            onClick={() => setSelectedJuz(juz)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedJuz === juz
                ? 'bg-[#08B9EF] text-white shadow-xs'
                : 'text-[#8C9BA7] hover:text-[#164C68]'
            }`}
          >
            Juz {juz}
          </button>
        ))}
      </div>

      {/* 114 Surahs Directory */}
      <div className="space-y-2.5">
        {filteredSurahs.map((surah) => (
          <div
            key={surah.number}
            onClick={() => setActiveSurah(surah)}
            className="bg-white border border-[#C9E1ED] hover:border-[#08B9EF] rounded-3xl p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer select-none group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EEF8FF] border border-[#C9E1ED] flex items-center justify-center font-black text-xs text-[#164C68] font-heading group-hover:bg-[#08B9EF] group-hover:text-white transition-colors">
                {surah.number}
              </div>
              <div>
                <h3 className="text-sm font-black text-[#164C68] font-heading group-hover:text-[#08B9EF] transition-colors">
                  {surah.nameLatin}
                </h3>
                <p className="text-[11px] text-[#8C9BA7] font-medium">
                  {surah.translation} • {surah.ayahCount} ayat • Juz {surah.juzNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-quran text-2xl text-[#08B9EF]">
                {surah.nameArabic}
              </span>
              <ChevronRight size={18} className="text-[#8C9BA7] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
