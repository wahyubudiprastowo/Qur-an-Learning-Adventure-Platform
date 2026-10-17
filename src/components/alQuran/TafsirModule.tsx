import React, { useState, useRef } from 'react';
import { Lightbulb, ArrowLeft, ChevronRight, BookOpen, ShieldCheck, Star, Volume2, VolumeX, Play, Square, Sparkles } from 'lucide-react';
import { SCHOLARLY_TAFSIR_DATA, TafsirSurahEntry } from '../../data/tafsirData';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { ArabicText } from '../common/ArabicText';
import { GlobalAudioManager } from '../../services/audioService';
import { SoundEffects } from '../../services/soundEffects';
import { getAyahAudioUrl } from '../../data/recitersData';
import { StorageService } from '../../services/storageService';

interface TafsirModuleProps {
  childId: string;
  onBack: () => void;
}

export const TafsirModule: React.FC<TafsirModuleProps> = ({ childId, onBack }) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number>(1);
  const [isPlayingAyahAudio, setIsPlayingAyahAudio] = useState<boolean>(false);
  const [isNarratingTafsir, setIsNarratingTafsir] = useState<boolean>(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopAllAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    setIsPlayingAyahAudio(false);
    SoundEffects.stopSpeaking();
    setIsNarratingTafsir(false);
  };

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

  const toggleNarrateTafsir = (tafsirText: string, hikmahText: string, surahName: string, ayahNum: number) => {
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

  const tafsirSurah = selectedSurahNumber ? SCHOLARLY_TAFSIR_DATA[selectedSurahNumber] : null;

  // --- Render 1: Detailed Tafsir Ayah Reader ---
  if (selectedSurahNumber && tafsirSurah) {
    const currentAyahTafsir =
      tafsirSurah.ayahTafsirs.find((a) => a.ayahNumber === selectedAyahNumber) ||
      tafsirSurah.ayahTafsirs[0];

    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        {/* Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedSurahNumber(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#164C68] hover:text-[#08B9EF]"
          >
            <ArrowLeft size={16} />
            <span>Daftar Surah Tafsir</span>
          </button>
          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
            Tafsir Kemenag
          </span>
        </div>

        {/* Surah Header Card */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-3xl p-4.5 shadow-xs space-y-1">
          <h2 className="text-xl font-black text-[#164C68] font-heading">
            Surah {tafsirSurah.surahName}
          </h2>
          <p className="text-xs text-[#8C9BA7] font-medium">
            {tafsirSurah.shortOverview}
          </p>

          {/* Scholarly Attribution Badge */}
          <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
            <span>Sumber: {tafsirSurah.sourceAttribution}</span>
          </div>
        </div>

        {/* Ayah Navigation Tabs */}
        <div className="flex gap-1.5 p-1 bg-white border border-[#C9E1ED] rounded-2xl shadow-xs overflow-x-auto">
          {tafsirSurah.ayahTafsirs.map((a) => (
            <button
              key={a.ayahNumber}
              onClick={() => setSelectedAyahNumber(a.ayahNumber)}
              className={`min-w-[44px] h-10 rounded-xl text-xs font-bold transition-all ${
                selectedAyahNumber === a.ayahNumber
                  ? 'bg-[#FFD83E] text-[#164C68] shadow-xs scale-105'
                  : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d9effc]'
              }`}
            >
              Ayat {a.ayahNumber}
            </button>
          ))}
        </div>

        {/* Ayah Detail Card */}
        {currentAyahTafsir && (
          <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <span className="text-xs font-bold text-[#8C9BA7] uppercase tracking-wider">
                AYAT {currentAyahTafsir.ayahNumber}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Audio Reciter Qari */}
                <button
                  type="button"
                  onClick={() => playAyahRecitation(selectedSurahNumber, currentAyahTafsir.ayahNumber)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    isPlayingAyahAudio
                      ? 'bg-amber-500 text-slate-950 animate-pulse font-black'
                      : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                  }`}
                  title="Dengarkan Qari Syaikh Al-Hushary Murattal"
                >
                  {isPlayingAyahAudio ? <Square size={13} className="fill-current" /> : <Play size={13} className="fill-current" />}
                  <span>{isPlayingAyahAudio ? 'Stop Tilawah' : 'Tilawah Qari'}</span>
                </button>

                {/* Voice Narration Tafsir */}
                <button
                  type="button"
                  onClick={() =>
                    toggleNarrateTafsir(
                      currentAyahTafsir.tafsirRingkas,
                      currentAyahTafsir.hikmahAnak,
                      tafsirSurah.surahName,
                      currentAyahTafsir.ayahNumber
                    )
                  }
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    isNarratingTafsir
                      ? 'bg-rose-500 text-white animate-pulse font-black'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                  title="Dengarkan suara penjelasan tafsir & hikmah untuk anak"
                >
                  {isNarratingTafsir ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  <span>{isNarratingTafsir ? 'Stop Penjelasan' : 'Dengar Tafsir 🔊'}</span>
                </button>
              </div>
            </div>

            {/* Arabic Text */}
            <div className="py-2">
              <ArabicText arabicText={currentAyahTafsir.arabicText} fontSize="large" />
            </div>

            {/* Translation */}
            <div className="p-3 bg-[#EEF8FF] rounded-2xl border border-[#C9E1ED]">
              <span className="text-[10px] font-bold text-[#8C9BA7] uppercase block mb-0.5">
                TERJEMAHAN
              </span>
              <p className="text-xs text-[#164C68] font-medium leading-relaxed">
                "{currentAyahTafsir.translation}"
              </p>
            </div>

            {/* Tafsir Ringkas */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb size={16} /> MAKNA & TAFSIR RINGKAS
              </span>
              <p className="text-xs text-[#164C68] font-medium leading-relaxed bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
                {currentAyahTafsir.tafsirRingkas}
              </p>
            </div>

            {/* Hikmah untuk Anak */}
            <div className="space-y-1.5 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                🌱 HIKMAH UNTUK ANAK
              </span>
              <p className="text-xs text-emerald-950 font-semibold leading-relaxed">
                {currentAyahTafsir.hikmahAnak}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Render 2: 15 Surahs List (Matches Screenshot 5) ---
  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-3xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#164C68] font-heading">
            Tafsir
          </h2>
          <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
            Apa pesan ayat ini? Pelajari makna tiap ayat
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#FFD83E] text-amber-800 flex items-center justify-center font-bold">
          <Lightbulb size={20} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-bold text-[#8C9BA7] px-1">
        <span>15 SURAH PILIHAN TAFSIR</span>
        <span className="text-emerald-700 font-bold flex items-center gap-1">
          <ShieldCheck size={14} /> Sumber Resmi Kemenag RI
        </span>
      </div>

      {/* Surahs List (Matches Screenshot 5) */}
      <div className="space-y-2.5">
        {SURAHS_METADATA.slice(0, 15).map((surah) => {
          const hasTafsir = Boolean(SCHOLARLY_TAFSIR_DATA[surah.number]);

          return (
            <div
              key={surah.number}
              onClick={() => {
                if (hasTafsir) {
                  setSelectedSurahNumber(surah.number);
                  setSelectedAyahNumber(1);
                } else {
                  // Fallback for demo to Al-Fatihah or Al-Ikhlas
                  setSelectedSurahNumber(1);
                  setSelectedAyahNumber(1);
                }
              }}
              className="bg-white border border-[#C9E1ED] hover:border-amber-400 rounded-3xl p-4 shadow-xs flex items-center justify-between cursor-pointer select-none group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center font-black text-xs text-amber-800 font-heading group-hover:bg-[#FFD83E] transition-colors">
                  {surah.number}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#164C68] font-heading group-hover:text-amber-800 transition-colors">
                    {surah.nameLatin}
                  </h4>
                  {/* Progress Line */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#FFD83E] h-full w-1/3 rounded-full" />
                    </div>
                    <span className="text-[10px] text-[#8C9BA7] font-bold">
                      0/{surah.ayahCount} ayat
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-quran text-xl text-amber-700">
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
