import React, { useState } from 'react';
import { BookMarked, Globe2, Sparkles, Volume2, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { QURAN_VOCABULARY_LIST } from '../../data/vocabularyData';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { StorageService } from '../../services/storageService';
import { QuranVocabularyItem } from '../../types';
import { Button } from '../common/Button';

interface BahasaQuranModuleProps {
  childId: string;
  onBack: () => void;
}

export const BahasaQuranModule: React.FC<BahasaQuranModuleProps> = ({ childId, onBack }) => {
  const [viewMode, setViewMode] = useState<'hub' | 'kamus'>('hub');
  const [masteredVocabIds, setMasteredVocabIds] = useState<string[]>(() =>
    StorageService.getMasteredVocab(childId)
  );

  const handleToggleVocab = (vocabId: string) => {
    StorageService.toggleVocabMastery(childId, vocabId);
    setMasteredVocabIds(StorageService.getMasteredVocab(childId));
  };

  const handlePlayVoice = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ar-SA';
        window.speechSynthesis.speak(u);
      }
    } catch (e) {}
  };

  // --- Render: Kamus Kecilku Flashcards View ---
  if (viewMode === 'kamus') {
    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewMode('hub')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#164C68] hover:text-[#08B9EF]"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Jalur Belajar</span>
          </button>
          <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
            {masteredVocabIds.length} kata dikuasai
          </span>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-3xl p-5">
          <h2 className="text-xl font-black text-[#164C68] font-heading">
            Kamus Kecilku 📖
          </h2>
          <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
            Kumpulan kosakata bahasa Al-Qur'an yang telah dipelajari
          </p>
        </div>

        {/* Vocabulary Cards */}
        <div className="space-y-3">
          {QURAN_VOCABULARY_LIST.map((item) => {
            const isMastered = masteredVocabIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white border-2 rounded-3xl p-5 shadow-xs transition-all ${
                  isMastered ? 'border-emerald-200 bg-emerald-50/15' : 'border-[#C9E1ED]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-right flex-1">
                    <span dir="rtl" className="font-quran text-3xl font-bold text-[#164C68]">
                      {item.arabic}
                    </span>
                    <p className="text-xs text-[#08B9EF] font-bold mt-0.5">
                      {item.transliteration}
                    </p>
                  </div>

                  <button
                    onClick={() => handlePlayVoice(item.arabic)}
                    className="w-10 h-10 rounded-2xl bg-[#EEF8FF] text-[#08B9EF] hover:bg-[#d8eefc] flex items-center justify-center transition-colors active:scale-95 cursor-pointer border border-[#C9E1ED] ml-3"
                    title="Dengar Bunyi Kata"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#164C68]">
                      Arti: {item.meaningId}
                    </span>
                    <span className="text-[11px] text-[#8C9BA7]">
                      Akar: <strong className="font-quran">{item.rootWord}</strong>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#EEF8FF]/60 text-xs border border-[#C9E1ED]/50">
                    <span className="text-[10px] font-bold text-[#08B9EF] block mb-0.5">
                      Contoh Surah {item.sampleAyah.surahName} : {item.sampleAyah.ayahNumber}
                    </span>
                    <p dir="rtl" className="font-quran text-base text-[#164C68] text-right">
                      {item.sampleAyah.arabicSnippet}
                    </p>
                    <p className="text-[11px] text-[#8C9BA7] font-medium mt-1">
                      "{item.sampleAyah.translationSnippet}"
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleVocab(item.id)}
                  className={`w-full mt-3 py-2 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isMastered
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-[#EEF8FF] hover:bg-[#d9effc] text-[#164C68] border border-[#C9E1ED]'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>{isMastered ? 'Sudah Dikuasai ✓' : 'Tandai Dikuasai (+5 XP)'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Render: Main Bahasa Quran Hub (Matches Screenshot 5) ---
  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-3xl p-4.5 shadow-xs">
        <h2 className="text-lg font-black text-[#164C68] font-heading">
          Bahasa Quran
        </h2>
        <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
          Pahami arti kata demi kata dalam Al-Qur'an
        </p>
      </div>

      {/* Top 2 Cards: Kamus Kecilku & Terjemahan */}
      <div className="grid grid-cols-2 gap-3">
        {/* Kamus Kecilku Card */}
        <button
          onClick={() => setViewMode('kamus')}
          className="bg-white border-2 border-[#C9E1ED] hover:border-[#B797F6] rounded-3xl p-4 shadow-xs text-left group transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-2">
            <BookMarked size={20} />
          </div>
          <h3 className="text-sm font-black text-[#164C68] font-heading group-hover:text-purple-600 transition-colors">
            Kamus Kecilku
          </h3>
          <p className="text-[11px] text-[#8C9BA7] font-semibold mt-0.5">
            {masteredVocabIds.length} kata dikuasai
          </p>
        </button>

        {/* Terjemahan Card */}
        <button
          onClick={() => setViewMode('kamus')}
          className="bg-white border-2 border-[#C9E1ED] hover:border-[#08B9EF] rounded-3xl p-4 shadow-xs text-left group transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#08B9EF] mb-2">
            <Globe2 size={20} />
          </div>
          <h3 className="text-sm font-black text-[#164C68] font-heading group-hover:text-[#08B9EF] transition-colors">
            Terjemahan
          </h3>
          <p className="text-[11px] text-[#8C9BA7] font-semibold mt-0.5">
            semua 114 surah
          </p>
        </button>
      </div>

      {/* JALUR BELAJAR Section */}
      <div className="pt-2 space-y-2.5">
        <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider block px-1">
          JALUR BELAJAR
        </span>

        {/* Surahs Progress List */}
        <div className="space-y-2.5">
          {SURAHS_METADATA.slice(0, 10).map((surah) => (
            <div
              key={surah.number}
              onClick={() => setViewMode('kamus')}
              className="bg-white border border-[#C9E1ED] hover:border-[#B797F6] rounded-3xl p-4 shadow-xs flex items-center justify-between cursor-pointer select-none group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EEF8FF] border border-[#C9E1ED] flex items-center justify-center font-black text-xs text-[#164C68] font-heading group-hover:bg-[#B797F6] group-hover:text-white transition-colors">
                  {surah.number}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#164C68] font-heading group-hover:text-purple-600 transition-colors">
                    {surah.nameLatin}
                  </h4>
                  {/* Progress Line */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#B797F6] h-full w-1/4 rounded-full" />
                    </div>
                    <span className="text-[10px] text-[#8C9BA7] font-bold">
                      0/{surah.ayahCount} ayat
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-quran text-xl text-[#B797F6]">
                  {surah.nameArabic}
                </span>
                <ChevronRight size={18} className="text-[#8C9BA7] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
