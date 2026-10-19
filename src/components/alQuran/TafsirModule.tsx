import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Lightbulb,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ShieldCheck,
  Star,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { TafsirSurahEntry } from '../../data/tafsirData';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { ArabicText } from '../common/ArabicText';
import { GlobalAudioManager } from '../../services/audioService';
import { SoundEffects } from '../../services/soundEffects';
import { getAyahAudioUrl } from '../../data/recitersData';
import { TafsirService, AyahTafsirItem } from '../../services/tafsirService';

interface TafsirModuleProps {
  childId: string;
  onBack: () => void;
  initialSurahNumber?: number;
  initialAyahNumber?: number;
}

export const TafsirModule: React.FC<TafsirModuleProps> = ({
  childId,
  onBack,
  initialSurahNumber,
  initialAyahNumber,
}) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(
    initialSurahNumber || null
  );
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number>(
    initialAyahNumber || 1
  );
  const [currentSurahTafsir, setCurrentSurahTafsir] = useState<TafsirSurahEntry | null>(null);
  const [isLoadingTafsir, setIsLoadingTafsir] = useState<boolean>(false);
  const [isPlayingAyahAudio, setIsPlayingAyahAudio] = useState<boolean>(false);
  const [isNarratingTafsir, setIsNarratingTafsir] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'juz30' | 'popular'>('all');
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio whenever component changes or unmounts
  const stopAllAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    setIsPlayingAyahAudio(false);
    SoundEffects.stopSpeaking();
    setIsNarratingTafsir(false);
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // Update selection if parent props change
  useEffect(() => {
    if (initialSurahNumber) {
      setSelectedSurahNumber(initialSurahNumber);
      setSelectedAyahNumber(initialAyahNumber || 1);
    }
  }, [initialSurahNumber, initialAyahNumber]);

  // Load tafsir entry whenever selectedSurahNumber changes
  useEffect(() => {
    stopAllAudio();

    if (!selectedSurahNumber) {
      setCurrentSurahTafsir(null);
      setIsLoadingTafsir(false);
      return;
    }

    let isMounted = true;
    setIsLoadingTafsir(true);

    TafsirService.getSurahTafsir(selectedSurahNumber)
      .then((data) => {
        if (isMounted) {
          setCurrentSurahTafsir(data);
          setIsLoadingTafsir(false);
          // Clamp ayah number if out of range
          if (data.ayahTafsirs.length > 0) {
            setSelectedAyahNumber((prev) => {
              if (prev < 1 || prev > data.ayahTafsirs.length) return 1;
              return prev;
            });
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load tafsir:', err);
        if (isMounted) setIsLoadingTafsir(false);
      });

    return () => {
      isMounted = false;
      stopAllAudio();
    };
  }, [selectedSurahNumber]);

  const playAyahRecitation = (surahNum: number, ayahNum: number) => {
    stopAllAudio();
    GlobalAudioManager.stopAll();

    const audioUrl = getAyahAudioUrl('husary', surahNum, ayahNum);
    const audio = new Audio(audioUrl);
    activeAudioRef.current = audio;
    GlobalAudioManager.registerRawAudio(audio);
    setIsPlayingAyahAudio(true);

    audio.onended = () => {
      setIsPlayingAyahAudio(false);
      activeAudioRef.current = null;
      GlobalAudioManager.unregisterRawAudio(audio);
    };

    audio.onerror = () => {
      setIsPlayingAyahAudio(false);
      activeAudioRef.current = null;
      GlobalAudioManager.unregisterRawAudio(audio);
    };

    audio.play().catch(() => {
      setIsPlayingAyahAudio(false);
    });
  };

  const toggleNarrateTafsir = (
    tafsirText: string,
    hikmahText: string,
    surahName: string,
    ayahNum: number
  ) => {
    if (isNarratingTafsir) {
      SoundEffects.stopSpeaking();
      setIsNarratingTafsir(false);
    } else {
      stopAllAudio();
      const narrative = `Tafsir Surah ${surahName} ayat ke ${ayahNum}. Makna dan penjelasan: ${tafsirText}. Hikmah untuk adik-adik santri: ${hikmahText}`;
      const started = SoundEffects.speakIndonesian(narrative, () => {
        setIsNarratingTafsir(false);
      });
      setIsNarratingTafsir(started);
    }
  };

  // Filter surahs directory
  const filteredSurahs = useMemo(() => {
    return SURAHS_METADATA.filter((s) => {
      const matchQuery =
        s.nameLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.number.toString() === searchQuery.trim();

      let matchCategory = true;
      if (categoryFilter === 'juz30') {
        matchCategory = s.number >= 78 && s.number <= 114;
      } else if (categoryFilter === 'popular') {
        matchCategory = [1, 18, 36, 55, 56, 67, 112, 113, 114].includes(s.number);
      }

      return matchQuery && matchCategory;
    });
  }, [searchQuery, categoryFilter]);

  // --- RENDER 1: DETAILED TAFSIR AYAH READER ---
  if (selectedSurahNumber) {
    const selectedSurahMeta =
      SURAHS_METADATA.find((s) => s.number === selectedSurahNumber) || SURAHS_METADATA[0];

    const currentAyahTafsir: AyahTafsirItem | undefined =
      currentSurahTafsir?.ayahTafsirs.find((a) => a.ayahNumber === selectedAyahNumber) ||
      currentSurahTafsir?.ayahTafsirs[0];

    const totalAyahs = currentSurahTafsir?.ayahTafsirs.length || selectedSurahMeta.ayahCount;

    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              stopAllAudio();
              setSelectedSurahNumber(null);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#164C68] hover:text-[#08B9EF] bg-white border border-[#C9E1ED] px-3 py-1.5 rounded-2xl shadow-xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Pilih Surah Lain</span>
          </button>
          <div className="flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-200 shadow-xs">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Rujukan: Kemenag RI</span>
          </div>
        </div>

        {/* Surah Header Card */}
        <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider bg-amber-100/70 px-2.5 py-0.5 rounded-full inline-block">
              Surah ke-{selectedSurahMeta.number} • {selectedSurahMeta.revelationType}
            </span>
            <span className="font-quran text-2xl text-amber-900 font-bold">
              {selectedSurahMeta.nameArabic}
            </span>
          </div>
          <h2 className="text-xl font-black text-[#164C68] font-heading">
            Surah {selectedSurahMeta.nameLatin} ({selectedSurahMeta.translation})
          </h2>
          <p className="text-xs text-[#8C9BA7] font-medium leading-relaxed">
            {currentSurahTafsir?.shortOverview ||
              `Tafsir dan tadabbur hikmah ayat-ayat Surah ${selectedSurahMeta.nameLatin} berdasarkan penjelasan resmi Kementerian Agama RI.`}
          </p>
        </div>

        {/* Ayah Navigation Controller */}
        <div className="bg-white border-2 border-[#C9E1ED] rounded-2xl p-2.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8C9BA7] font-bold px-1">
            <span>Pilih Ayat:</span>
            <span className="text-[#164C68]">
              Ayat {selectedAyahNumber} dari {totalAyahs}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Prev Ayah Button */}
            <button
              onClick={() => setSelectedAyahNumber((prev) => Math.max(1, prev - 1))}
              disabled={selectedAyahNumber <= 1}
              className="w-9 h-9 rounded-xl bg-[#EEF8FF] disabled:opacity-40 text-[#164C68] flex items-center justify-center border border-[#C9E1ED] hover:bg-[#ddf2fd] shrink-0 cursor-pointer"
              title="Ayat Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Horizontal Scrollable Ayah Tabs */}
            <div className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {Array.from({ length: totalAyahs }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedAyahNumber(num)}
                  className={`min-w-[42px] h-9 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedAyahNumber === num
                      ? 'bg-[#FFD83E] text-[#164C68] shadow-xs font-black scale-105 ring-2 ring-amber-300'
                      : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d9effc] border border-[#C9E1ED]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Next Ayah Button */}
            <button
              onClick={() => setSelectedAyahNumber((prev) => Math.min(totalAyahs, prev + 1))}
              disabled={selectedAyahNumber >= totalAyahs}
              className="w-9 h-9 rounded-xl bg-[#EEF8FF] disabled:opacity-40 text-[#164C68] flex items-center justify-center border border-[#C9E1ED] hover:bg-[#ddf2fd] shrink-0 cursor-pointer"
              title="Ayat Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Ayah Tafsir Detail Content */}
        {isLoadingTafsir ? (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-10 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#FFD83E] border-t-amber-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#164C68]">
              Memuat tafsir Surah {selectedSurahMeta.nameLatin} ayat {selectedAyahNumber}...
            </p>
          </div>
        ) : currentAyahTafsir ? (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-xs space-y-4">
            {/* Ayah Header Bar with Audio and Voice Narration */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <span className="text-xs font-black text-[#164C68] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[11px]">
                  {currentAyahTafsir.ayahNumber}
                </span>
                <span>
                  Ayat ke-{currentAyahTafsir.ayahNumber} • Surah {selectedSurahMeta.nameLatin}
                </span>
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Tilawah Audio Button */}
                <button
                  type="button"
                  onClick={() =>
                    playAyahRecitation(selectedSurahNumber, currentAyahTafsir.ayahNumber)
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    isPlayingAyahAudio
                      ? 'bg-amber-500 text-slate-950 animate-pulse font-black'
                      : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                  }`}
                  title="Dengarkan Tilawah Syaikh Mahmud Khalil Al-Husary"
                >
                  {isPlayingAyahAudio ? (
                    <Square size={13} className="fill-current" />
                  ) : (
                    <Play size={13} className="fill-current" />
                  )}
                  <span>{isPlayingAyahAudio ? 'Stop Tilawah' : 'Tilawah Qari'}</span>
                </button>

                {/* Indonesian Voice Narration Button */}
                <button
                  type="button"
                  onClick={() =>
                    toggleNarrateTafsir(
                      currentAyahTafsir.tafsirRingkas,
                      currentAyahTafsir.hikmahAnak,
                      selectedSurahMeta.nameLatin,
                      currentAyahTafsir.ayahNumber
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    isNarratingTafsir
                      ? 'bg-rose-500 text-white animate-pulse font-black'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                  title="Dengarkan suara penjelasan tafsir & hikmah untuk santri"
                >
                  {isNarratingTafsir ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  <span>{isNarratingTafsir ? 'Stop Penjelasan' : 'Dengar Tafsir 🔊'}</span>
                </button>
              </div>
            </div>

            {/* Authentic Arabic Text with Ayah Marker */}
            {currentAyahTafsir.arabicText && (
              <div className="py-2">
                <ArabicText
                  arabicText={currentAyahTafsir.arabicText}
                  ayahNumber={currentAyahTafsir.ayahNumber}
                  fontSize="large"
                />
              </div>
            )}

            {/* Official Kemenag RI Translation */}
            {currentAyahTafsir.translation && (
              <div className="p-3.5 bg-[#EEF8FF] rounded-2xl border border-[#C9E1ED]">
                <span className="text-[10px] font-bold text-[#8C9BA7] uppercase tracking-wider block mb-0.5">
                  TERJEMAHAN KEMENAG RI
                </span>
                <p className="text-xs text-[#164C68] font-medium leading-relaxed">
                  "{currentAyahTafsir.translation}"
                </p>
              </div>
            )}

            {/* Makna & Tafsir Ringkas */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb size={16} className="text-amber-600" />
                <span>MAKNA & TAFSIR RINGKAS</span>
              </span>
              <p className="text-xs text-[#164C68] font-medium leading-relaxed bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                {currentAyahTafsir.tafsirRingkas}
              </p>
            </div>

            {/* Hikmah untuk Anak & Santri */}
            <div className="space-y-1.5 bg-emerald-50/80 p-4 rounded-2xl border-2 border-emerald-200">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={16} className="text-emerald-600" />
                <span>🌱 HIKMAH UNTUK ANAK & SANTRI</span>
              </span>
              <p className="text-xs text-emerald-950 font-semibold leading-relaxed">
                {currentAyahTafsir.hikmahAnak}
              </p>
            </div>

            {/* Bottom Step Controller */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedAyahNumber((prev) => Math.max(1, prev - 1))}
                disabled={selectedAyahNumber <= 1}
                className="px-3.5 py-2 rounded-xl bg-slate-100 disabled:opacity-40 text-xs font-bold text-[#164C68] hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Ayat Sebelumnya</span>
              </button>

              <button
                onClick={() => setSelectedAyahNumber((prev) => Math.min(totalAyahs, prev + 1))}
                disabled={selectedAyahNumber >= totalAyahs}
                className="px-3.5 py-2 rounded-xl bg-[#08B9EF] disabled:opacity-40 text-xs font-bold text-white hover:bg-[#07a6d7] flex items-center gap-1 cursor-pointer"
              >
                <span>Ayat Berikutnya</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-8 text-center space-y-2">
            <p className="text-xs text-[#8C9BA7] font-medium">Ayat tidak ditemukan.</p>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER 2: 114 SURAHS DIRECTORY ---
  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#164C68] font-heading">
            Tafsir & Hikmah Al-Qur'an
          </h2>
          <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
            Pelajari makna dan hikmah nyata setiap ayat dari 114 Surah Al-Qur'an
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#FFD83E] text-amber-900 flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
          <Lightbulb size={24} />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C9BA7]"
        />
        <input
          type="text"
          placeholder="Cari surah... (cth: Al-Kahf, An-Nas, Al-Baqarah, 18)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl border-2 border-[#C9E1ED] bg-white text-xs font-semibold text-[#164C68] focus:border-[#08B9EF] focus:outline-none shadow-xs"
        />
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center justify-between text-xs font-bold text-[#8C9BA7] gap-2 flex-wrap">
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-white text-[#164C68] shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Semua (114 Surah)
          </button>
          <button
            onClick={() => setCategoryFilter('juz30')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'juz30'
                ? 'bg-white text-emerald-800 shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Juz 30 (37 Surah)
          </button>
          <button
            onClick={() => setCategoryFilter('popular')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'popular'
                ? 'bg-white text-amber-800 shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Surah Pilihan
          </button>
        </div>
        <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
          <ShieldCheck size={13} /> Resmi Kemenag RI
        </span>
      </div>

      {/* Surahs List */}
      <div className="space-y-2.5">
        {filteredSurahs.map((surah) => {
          return (
            <div
              key={surah.number}
              onClick={() => {
                setSelectedSurahNumber(surah.number);
                setSelectedAyahNumber(1);
              }}
              className="border-2 border-[#C9E1ED] hover:border-amber-400 bg-white rounded-3xl p-4 shadow-xs flex items-center justify-between cursor-pointer select-none group transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl border-2 border-amber-200 bg-amber-50 text-amber-900 flex items-center justify-center font-black text-xs font-heading group-hover:bg-amber-100 transition-colors">
                  {surah.number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-[#164C68] font-heading group-hover:text-amber-800 transition-colors">
                      {surah.nameLatin}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-300">
                      ✓ Tersedia
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8C9BA7] font-semibold">
                    <span>{surah.translation}</span>
                    <span>•</span>
                    <span>{surah.ayahCount} ayat</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">Kemenag RI</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="font-quran text-xl text-amber-900 font-bold">
                  {surah.nameArabic}
                </span>
                <ChevronRight
                  size={18}
                  className="text-amber-600 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
