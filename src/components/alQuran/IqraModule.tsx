import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  CheckCircle2,
  Star,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Square,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Trophy,
  Award,
  BookmarkCheck,
  Zap,
  SlidersHorizontal,
  X,
  Target,
  PartyPopper,
  GraduationCap,
  Headphones,
  Radio,
} from 'lucide-react';
import { IQRA_CURRICULUM } from '../../data/iqraData';
import { IQRA_1_PAGES, IqraBookPage, IqraPageItem } from '../../data/iqraBook1Data';
import { IQRA_2_PAGES } from '../../data/iqraBook2Data';
import { StorageService } from '../../services/storageService';
import { IqraItem } from '../../types';

interface IqraModuleProps {
  childId: string;
  onBack: () => void;
}

type JilidType = '1' | '2' | 'A' | '3' | '4';

// Helper for Arabic transliteration when latin text is not explicitly provided
function getArabicLatinGuide(arabic: string): string {
  if (!arabic) return '';
  if (arabic.includes('=') || arabic.includes(':')) {
    return arabic;
  }

  const clean = arabic.trim();
  const directMap: Record<string, string> = {
    'أَ': 'A', 'إِ': 'I', 'أُ': 'U', 'بَ': 'Ba', 'تَ': 'Ta', 'ثَ': 'Tsa',
    'جَ': 'Ja', 'حَ': 'Ha', 'خَ': 'Kha', 'دَ': 'Da', 'ذَ': 'Dza', 'رَ': 'Ra',
    'زَ': 'Za', 'سَ': 'Sa', 'شَ': 'Sya', 'صَ': 'Sha', 'ضَ': 'Dha', 'طَ': 'Tha',
    'ظَ': 'Zha', 'عَ': "'A", 'غَ': 'Gha', 'فَ': 'Fa', 'قَ': 'Qa', 'كَ': 'Ka',
    'لَ': 'La', 'مَ': 'Ma', 'نَ': 'Na', 'وَ': 'Wa', 'هَ': 'Ha', 'يَ': 'Ya',
    'بَا': 'Baa', 'تَا': 'Taa', 'ثَا': 'Tsaa', 'جَا': 'Jaa', 'حَا': 'Haa',
    'خَا': 'Khaa', 'دَا': 'Daa', 'ذَا': 'Dzaa', 'رَا': 'Raa', 'زَا': 'Zaa',
    'سَا': 'Saa', 'شَا': 'Syaa', 'صَا': 'Shaa', 'ضَا': 'Dhaa', 'طَا': 'Thaa',
    'ظَا': 'Zhaa', 'عَا': "'Aaa", 'غَا': 'Ghaa', 'فَا': 'Faa', 'قَا': 'Qaa',
    'كَا': 'Kaa', 'لَا': 'Laa', 'مَا': 'Maa', 'نَا': 'Naa', 'وَا': 'Waa',
    'هَا': 'Haa', 'يَا': 'Yaa', 'ءَا': 'Aa', 'دَنَى': 'Danaa', 'يَدَى': 'Yadaa',
    'رَنَى': 'Ranaa', 'فَتَى': 'Fataa', 'يَتَامَى': 'Yataamaa', 'فَطَغَى': 'Fathaghaa',
  };

  if (directMap[clean]) {
    return directMap[clean];
  }

  // Tokenize by space if multi-token
  if (clean.includes(' ')) {
    return clean
      .split(/\s+/)
      .map((part) => directMap[part] || part)
      .join(' - ');
  }

  return clean;
}

// Gentle audio synthesizer for friendly feedback chime
function playChime(freq = 659.25) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch {
    // Ignore audio context autoplay limitations
  }
}

// Celebratory chime when finishing page or answering quiz correctly
function playSuccessFanfare() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.1;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch {}
}

export const IqraModule: React.FC<IqraModuleProps> = ({ childId, onBack }) => {
  // Current active jilid tab (Default to Jilid 1)
  const [activeJilid, setActiveJilid] = useState<JilidType>('1');

  // Page index for Book Mode (1-indexed)
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);

  // Radiant Glowing Pointer state: { rowIdx, itemIdx }
  const [pointedItem, setPointedItem] = useState<{ rowIdx: number; itemIdx: number } | null>({
    rowIdx: 0,
    itemIdx: 0,
  });

  // Auto-play / Pointer Walk state
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(1.0); // 0.75x, 1.0x, 1.25x

  // Audio Playback Mode: 'character' (individual character audio) vs 'full_page' (Sync & Listen full-page recitation)
  const [audioMode, setAudioMode] = useState<'character' | 'full_page'>('character');

  // Modal states
  const [showPagePicker, setShowPagePicker] = useState<boolean>(false);
  const [showGraduationModal, setShowGraduationModal] = useState<boolean>(false);

  // Interactive Quiz / Tantangan Tunjuk Cepat
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [quizTarget, setQuizTarget] = useState<{ rowIdx: number; itemIdx: number; arabic: string } | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [quizStreak, setQuizStreak] = useState<number>(0);

  // Completed items tracking (saved in localStorage via StorageService)
  const [completedIds, setCompletedIds] = useState<string[]>(() =>
    StorageService.getCompletedIqra(childId)
  );

  // Auto-play timer ref
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active book pages list
  const currentPages: IqraBookPage[] = useMemo(() => {
    if (activeJilid === '1') return IQRA_1_PAGES;
    if (activeJilid === '2') return IQRA_2_PAGES;
    return [];
  }, [activeJilid]);

  const maxPages = currentPages.length || 1;

  // Active page object
  const activePage: IqraBookPage | undefined = useMemo(() => {
    return currentPages.find((p) => p.pageNumber === currentPageNum) || currentPages[0];
  }, [currentPages, currentPageNum]);

  // Mastered count in current jilid
  const masteredPagesInJilid = useMemo(() => {
    if (activeJilid === '1' || activeJilid === '2') {
      return currentPages.filter((p) => completedIds.includes(p.id)).length;
    }
    const jilidItems = IQRA_CURRICULUM.filter((item) => item.jilid === activeJilid);
    return jilidItems.filter((i) => completedIds.includes(i.id)).length;
  }, [activeJilid, currentPages, completedIds]);

  const totalInCurrentJilid = useMemo(() => {
    if (activeJilid === '1' || activeJilid === '2') return currentPages.length;
    return IQRA_CURRICULUM.filter((item) => item.jilid === activeJilid).length;
  }, [activeJilid, currentPages]);

  // Reset pointer when page changes
  useEffect(() => {
    stopAutoPlay();
    setPointedItem({ rowIdx: 0, itemIdx: 0 });
    setIsQuizMode(false);
    setQuizTarget(null);
    setQuizFeedback('idle');
  }, [currentPageNum, activeJilid]);

  // Cleanup auto-play timer on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Pronounce Arabic text using Speech Synthesis with friendly tone
  const speakArabic = (arabicText: string, speed = autoSpeed) => {
    if (typeof window === 'undefined') return;

    try {
      window.speechSynthesis.cancel();

      // Clean characters
      const clean = arabicText
        .replace(/=/g, ' ')
        .replace(/:/g, ' ')
        .replace(/الف/g, 'أَلِف')
        .replace(/باء/g, 'بَاء')
        .replace(/تاء/g, 'تَاء')
        .replace(/ثاء/g, 'ثَاء')
        .replace(/جيم/g, 'جِيم')
        .replace(/حاء/g, 'حَاء')
        .replace(/خاء/g, 'خَاء')
        .replace(/دال/g, 'دَال')
        .replace(/ذال/g, 'ذَال')
        .replace(/راء/g, 'رَاء')
        .replace(/زاي/g, 'زَاي')
        .replace(/سين/g, 'سِين')
        .replace(/شين/g, 'شِين')
        .replace(/صاد/g, 'صَاد')
        .replace(/ضاد/g, 'ضَاد')
        .replace(/طاء/g, 'طَاء')
        .replace(/ظاء/g, 'ظَاء')
        .replace(/عين/g, 'عَيْن')
        .replace(/غين/g, 'غَيْن')
        .replace(/فاء/g, 'فَاء')
        .replace(/قاف/g, 'قَاف')
        .replace(/كاف/g, 'كَاف')
        .replace(/لام/g, 'لَام')
        .replace(/ميم/g, 'مِيم')
        .replace(/نون/g, 'نُون')
        .replace(/واو/g, 'وَاو')
        .replace(/هاء/g, 'هَاء')
        .replace(/همزة/g, 'هَمْزَة')
        .replace(/ياء/g, 'يَاء')
        .trim();

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'ar-SA';
      utterance.rate = Math.max(0.65, Math.min(1.2, speed * 0.85));
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(
        (v) => v.lang.startsWith('ar') || v.lang.includes('SA') || v.name.toLowerCase().includes('arabic')
      );
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      playChime(620);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
    }
  };

  // User manually points to a box
  const handlePointItem = (rowIdx: number, itemIdx: number, arabic: string) => {
    // If in quiz mode, verify answer
    if (isQuizMode && quizTarget) {
      if (quizTarget.rowIdx === rowIdx && quizTarget.itemIdx === itemIdx) {
        // Correct!
        setQuizFeedback('correct');
        playSuccessFanfare();
        setQuizStreak((s) => s + 1);
        speakArabic(arabic);
        StorageService.recordPoints(childId, 'IQRA_LESSON', 5, 1, 'Menjawab kuis tunjuk Iqra', 'iqra', activePage?.id);
        setTimeout(() => {
          generateNextQuizTarget();
        }, 1300);
      } else {
        // Incorrect
        setQuizFeedback('wrong');
        playChime(330);
        speakArabic(arabic);
        setTimeout(() => setQuizFeedback('idle'), 1200);
      }
      return;
    }

    setPointedItem({ rowIdx, itemIdx });

    if (audioMode === 'full_page') {
      // Sync & Listen Mode: tapping any box begins synchronized full-page recitation from that box onwards
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
      startFullPageRecitation(rowIdx, itemIdx);
    } else {
      // Individual character mode: only play this single character
      if (isAutoPlaying) {
        stopAutoPlay();
      }
      speakArabic(arabic);
    }
  };

  // Full-page recitation / Pointer walk logic
  const startFullPageRecitation = (startFromRow?: number, startFromItem?: number) => {
    if (!activePage || activePage.rows.length === 0) return;
    setIsAutoPlaying(true);
    setIsQuizMode(false);

    // Flatten all items on this page
    const allCoords: { rowIdx: number; itemIdx: number; arabic: string }[] = [];
    activePage.rows.forEach((row, rIdx) => {
      row.items.forEach((item, iIdx) => {
        allCoords.push({ rowIdx: rIdx, itemIdx: iIdx, arabic: item.arabic });
      });
    });

    if (allCoords.length === 0) return;

    let step = 0;
    if (typeof startFromRow === 'number' && typeof startFromItem === 'number') {
      const found = allCoords.findIndex(
        (c) => c.rowIdx === startFromRow && c.itemIdx === startFromItem
      );
      if (found >= 0) {
        step = found;
      }
    } else if (pointedItem) {
      const found = allCoords.findIndex(
        (c) => c.rowIdx === pointedItem.rowIdx && c.itemIdx === pointedItem.itemIdx
      );
      if (found >= 0 && found < allCoords.length - 1) {
        step = found;
      }
    }

    const runStep = (index: number) => {
      if (index >= allCoords.length) {
        // Finished whole page!
        setIsAutoPlaying(false);
        playSuccessFanfare();
        // Automatically mark page completed if not yet
        if (activePage && !completedIds.includes(activePage.id)) {
          handleToggleMastery(activePage.id);
        }
        return;
      }

      const current = allCoords[index];
      setPointedItem({ rowIdx: current.rowIdx, itemIdx: current.itemIdx });
      speakArabic(current.arabic, autoSpeed);

      // Duration calculation
      const delayMs = Math.round(1800 / autoSpeed);
      autoPlayTimeoutRef.current = setTimeout(() => {
        runStep(index + 1);
      }, delayMs);
    };

    runStep(step);
  };

  const startAutoPlay = () => {
    startFullPageRecitation();
  };

  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Toggle between Individual Character audio and Full-Page Recitation (Sync & Listen)
  const handleToggleAudioMode = (newMode: 'character' | 'full_page') => {
    setAudioMode(newMode);
    if (newMode === 'character') {
      stopAutoPlay();
    } else {
      // Switching to Full-Page Recitation: start from current pointed box or top
      const row = pointedItem ? pointedItem.rowIdx : 0;
      const item = pointedItem ? pointedItem.itemIdx : 0;
      startFullPageRecitation(row, item);
    }
  };

  // Toggle page / item mastery
  const handleToggleMastery = (itemId: string) => {
    StorageService.toggleIqraMastery(childId, itemId);
    const updated = StorageService.getCompletedIqra(childId);
    setCompletedIds(updated);
    playSuccessFanfare();

    // Check if finished final page of Jilid 1 or 2
    if (itemId === 'iqra-1-p31' || itemId === 'iqra-1-p32' || itemId === 'iqra-2-p30') {
      setShowGraduationModal(true);
    }
  };

  // Tantangan Tunjuk Cepat (Quiz Mode)
  const startQuizChallenge = () => {
    stopAutoPlay();
    setIsQuizMode(true);
    setQuizStreak(0);
    generateNextQuizTarget();
  };

  const generateNextQuizTarget = () => {
    if (!activePage) return;
    const allCoords: { rowIdx: number; itemIdx: number; arabic: string }[] = [];
    activePage.rows.forEach((row, rIdx) => {
      row.items.forEach((item, iIdx) => {
        allCoords.push({ rowIdx: rIdx, itemIdx: iIdx, arabic: item.arabic });
      });
    });

    if (allCoords.length === 0) return;
    const randomItem = allCoords[Math.floor(Math.random() * allCoords.length)];
    setQuizTarget(randomItem);
    setQuizFeedback('idle');
    setPointedItem(null);

    // Pronounce the challenge
    setTimeout(() => {
      speakArabic(randomItem.arabic);
    }, 200);
  };

  // Navigating Pages
  const handlePrevPage = () => {
    if (currentPageNum > 1) {
      setCurrentPageNum((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageNum < maxPages) {
      setCurrentPageNum((p) => p + 1);
    }
  };

  // Currently pointed item data
  const currentPointedData = useMemo(() => {
    if (!activePage || !pointedItem) return null;
    const row = activePage.rows[pointedItem.rowIdx];
    if (!row) return null;
    const item = row.items[pointedItem.itemIdx];
    if (!item) return null;
    return {
      arabic: item.arabic,
      latin: item.latin || getArabicLatinGuide(item.arabic),
      isRed: item.isRed,
    };
  }, [activePage, pointedItem]);

  const isCurrentPageMastered = activePage ? completedIds.includes(activePage.id) : false;

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#C9E1ED] text-xs font-bold text-[#164C68] hover:text-[#08B9EF] shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Menu Utama</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles size={13} />
            <span>Sistem Tunjuk & Suara</span>
          </span>
        </div>
      </div>

      {/* Jilid Tabs Navigation */}
      <div className="flex gap-1.5 p-1.5 bg-white border border-[#C9E1ED] rounded-2xl shadow-xs overflow-x-auto">
        {(['1', '2', 'A', '3', '4'] as const).map((jilid) => {
          const isActive = activeJilid === jilid;
          return (
            <button
              key={jilid}
              onClick={() => {
                setActiveJilid(jilid);
                setCurrentPageNum(1);
              }}
              className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#08B9EF] to-[#0596c7] text-white shadow-md shadow-cyan-500/25 scale-[1.02]'
                  : 'text-[#8C9BA7] hover:text-[#164C68] hover:bg-[#EEF8FF]/60'
              }`}
            >
              <BookOpen size={13} />
              <span>
                {jilid === 'A'
                  ? 'Hijaiyah A'
                  : jilid === '1'
                  ? 'Iqra 1 (32 Hal)'
                  : jilid === '2'
                  ? 'Iqra 2 (30 Hal)'
                  : `Jilid ${jilid}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Jilid Progress Summary Card */}
      <div className="bg-gradient-to-r from-cyan-50/90 via-sky-50 to-blue-50/60 border border-[#C9E1ED] rounded-3xl p-4.5 shadow-xs flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#08B9EF] text-white text-[10px] font-black uppercase">
              {activeJilid === '1' || activeJilid === '2' ? 'Buku Standar Asli' : 'Materi Pembelajaran'}
            </span>
            <h3 className="text-base font-black text-[#164C68] font-heading">
              {activeJilid === '1'
                ? 'Buku Iqra 1: Fathah & Huruf Hijaiyah'
                : activeJilid === '2'
                ? 'Buku Iqra 2: Huruf Sambung & Mad'
                : `Iqra Jilid ${activeJilid}`}
            </h3>
          </div>
          <p className="text-xs text-[#627D98] font-medium">
            {activeJilid === '1' || activeJilid === '2'
              ? `${masteredPagesInJilid} dari ${totalInCurrentJilid} halaman telah dikuasai`
              : `${masteredPagesInJilid} dari ${totalInCurrentJilid} topik selesai`}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="w-28 bg-white h-2.5 rounded-full overflow-hidden border border-[#C9E1ED] shadow-inner">
            <div
              className="bg-gradient-to-r from-[#81E850] to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${
                  totalInCurrentJilid > 0 ? (masteredPagesInJilid / totalInCurrentJilid) * 100 : 0
                }%`,
              }}
            />
          </div>
          <span className="text-[11px] font-black text-emerald-600">
            {Math.round(totalInCurrentJilid > 0 ? (masteredPagesInJilid / totalInCurrentJilid) * 100 : 0)}% Selesai
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION A: BOOK MODE (Jilid 1 & Jilid 2)                 */}
      {/* ========================================================= */}
      {(activeJilid === '1' || activeJilid === '2') && activePage && (
        <div className="space-y-4">
          {/* Page Top Action Bar */}
          <div className="bg-white border border-[#C9E1ED] rounded-2xl p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
            {/* Page Navigation & Picker */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevPage}
                disabled={currentPageNum <= 1}
                className="p-2 rounded-xl bg-[#EEF8FF] text-[#164C68] hover:bg-[#d9effc] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => setShowPagePicker(true)}
                className="px-3 py-1.5 rounded-xl bg-[#EEF8FF] hover:bg-[#d8eefc] text-[#164C68] font-black text-xs border border-[#C9E1ED] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Halaman {currentPageNum} / {maxPages}</span>
                <SlidersHorizontal size={13} className="text-[#08B9EF]" />
              </button>

              <button
                onClick={handleNextPage}
                disabled={currentPageNum >= maxPages}
                className="p-2 rounded-xl bg-[#EEF8FF] text-[#164C68] hover:bg-[#d9effc] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Halaman Berikutnya"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* SYNC & LISTEN TOGGLE SWITCH */}
            <div className="flex items-center p-1 bg-[#EEF8FF] border border-[#C9E1ED] rounded-2xl shadow-2xs">
              <span className="text-[10px] font-black uppercase text-[#164C68] px-2 hidden md:inline">
                Mode Audio:
              </span>
              <button
                type="button"
                onClick={() => handleToggleAudioMode('character')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  audioMode === 'character'
                    ? 'bg-white text-[#164C68] shadow-xs border border-[#C9E1ED]'
                    : 'text-[#627D98] hover:text-[#164C68]'
                }`}
                title="Putar audio per karakter (satu huruf saja saat disentuh)"
              >
                <span>🔤</span>
                <span>Per Karakter</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleAudioMode('full_page')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  audioMode === 'full_page'
                    ? 'bg-gradient-to-r from-[#08B9EF] to-[#0596c7] text-white shadow-xs'
                    : 'text-[#627D98] hover:text-[#164C68]'
                }`}
                title="Sync & Listen: Resitasi mengalir satu halaman penuh dengan penunjuk bercahaya sinkron"
              >
                <Headphones size={13} className={audioMode === 'full_page' && isAutoPlaying ? 'animate-bounce' : ''} />
                <span>Sync & Listen (Halaman Penuh)</span>
                {audioMode === 'full_page' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                )}
              </button>
            </div>

            {/* Quick Interactive Tool Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Tantangan Tunjuk Cepat (Quiz) */}
              <button
                onClick={isQuizMode ? () => setIsQuizMode(false) : startQuizChallenge}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isQuizMode
                    ? 'bg-amber-500 text-amber-950 ring-2 ring-amber-400 font-black'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                <Target size={14} className={isQuizMode ? 'animate-spin' : ''} />
                <span>{isQuizMode ? 'Keluar Kuis' : 'Tantangan Tunjuk'}</span>
              </button>

              {/* Tandai Mahir Button */}
              <button
                onClick={() => handleToggleMastery(activePage.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCurrentPageMastered
                    ? 'bg-emerald-500 text-white shadow-xs font-black'
                    : 'bg-[#EEF8FF] hover:bg-[#d8eefc] text-[#164C68] border border-[#C9E1ED]'
                }`}
              >
                <CheckCircle2 size={15} />
                <span>{isCurrentPageMastered ? 'Halaman Mahir ✓' : 'Tandai Mahir'}</span>
              </button>
            </div>
          </div>

          {/* Sync & Listen Full-Page Recitation Banner */}
          {audioMode === 'full_page' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-cyan-50 via-sky-50 to-emerald-50 border-2 border-cyan-300/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#08B9EF] to-[#0284c7] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Headphones size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#164C68]">Mode Sync & Listen Aktif</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{isAutoPlaying ? 'Resitasi Mengalir...' : 'Siap Mulai'}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-[#627D98] font-medium">
                    Sentuh kotak mana saja untuk memulai resitasi mengalir dari kotak tersebut, atau tekan tombol putar di samping.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={isAutoPlaying ? stopAutoPlay : () => startFullPageRecitation()}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    isAutoPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                      : 'bg-[#08B9EF] hover:bg-[#07a6d7] text-white'
                  }`}
                >
                  {isAutoPlaying ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
                  <span>{isAutoPlaying ? 'Jeda Resitasi' : 'Putar Seluruh Halaman'}</span>
                </button>

                {isAutoPlaying && (
                  <button
                    onClick={stopAutoPlay}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Hentikan Resitasi"
                  >
                    <Square size={13} fill="currentColor" />
                  </button>
                )}

                <button
                  onClick={() => setAutoSpeed((s) => (s === 0.75 ? 1.0 : s === 1.0 ? 1.25 : 0.75))}
                  className="px-2.5 py-1.5 rounded-xl bg-white text-[#164C68] text-[11px] font-black border border-[#C9E1ED] hover:bg-slate-50 cursor-pointer"
                  title="Ubah Kecepatan Resitasi"
                >
                  {autoSpeed}x
                </button>
              </div>
            </motion.div>
          )}

          {/* Individual Character Mode Helper Banner */}
          {audioMode === 'character' && (
            <div className="bg-[#FAF9F5] border border-[#E8DFC9] rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs text-[#8C7A5B]">
              <div className="flex items-center gap-2">
                <span>🔤</span>
                <span className="font-semibold">
                  <strong>Mode Per Karakter:</strong> Sentuh kotak mana pun pada halaman buku untuk mendengar lafal 1 karakter tersebut secara individual.
                </span>
              </div>
              <button
                onClick={() => handleToggleAudioMode('full_page')}
                className="text-[11px] font-black text-[#08B9EF] hover:underline cursor-pointer shrink-0"
              >
                Ganti ke Sync & Listen ➡
              </button>
            </div>
          )}

          {/* Quiz Challenge Notification Banner */}
          {isQuizMode && quizTarget && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-4 text-center border-2 transition-all shadow-md ${
                quizFeedback === 'correct'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                  : quizFeedback === 'wrong'
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target size={18} className="text-amber-600" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Tantangan Tunjuk Cepat • Skor: {quizStreak} Bintang ⭐
                </span>
              </div>
              <p className="text-sm font-bold">
                {quizFeedback === 'correct'
                  ? '🎉 MASYA ALLAH BENAR! Tunjukan tepat sekali (+5 Bintang)!'
                  : quizFeedback === 'wrong'
                  ? '⚠️ Belum tepat, ayo coba dengarkan lagi dan tunjuk kotak yang benar!'
                  : 'Dengarkan suara di bawah, lalu SENTUH KOTAK yang sesuai!'}
              </p>
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <button
                  onClick={() => speakArabic(quizTarget.arabic)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Volume2 size={16} />
                  <span>Dengarkan Ulang Suara</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* THE AUTHENTIC IQRA BOOK SHEET (SISTEM BUKU KLASIK)         */}
          {/* ========================================================= */}
          <div className="relative bg-[#FFFDF7] border-2 border-[#D8C7A5] rounded-3xl p-4 sm:p-7 shadow-lg shadow-amber-950/5 overflow-hidden transition-all">
            {/* Authentic Ornate Book Border Decoration */}
            <div className="absolute inset-1.5 sm:inset-2.5 border border-[#E9DFC8] rounded-2xl pointer-events-none" />

            {/* Book Page Top Header */}
            <div className="relative z-10 text-center space-y-1.5 pb-4 border-b border-[#E9DFC8]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#8C7A5B]">
                <span>Iqra' Jilid {activeJilid}</span>
                <span className="font-arabic text-sm text-[#5B492B]">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
                <span>Halaman {activePage.pageNumber}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-[#2B3E48] font-heading tracking-tight">
                {activePage.title}
              </h2>

              {/* Teacher Guidance / Instruction */}
              {activePage.instruction && (
                <div className="inline-block bg-[#F4EDE0] border border-[#DDD0B7] rounded-xl px-3 py-1 text-xs text-[#5D4E37] font-semibold max-w-xl">
                  💡 {activePage.instruction}
                </div>
              )}
            </div>

            {/* Header Preview / Large Letter Example Box */}
            {activePage.headerPreview && (
              <div className="relative z-10 my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-[#FAF4E6] to-amber-50 border-2 border-[#DFD1B3] text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E7B33] block mb-1">
                  CONTOH UTAMA HALAMAN INI (SENTUH UNTUK DENGAR)
                </span>
                <button
                  onClick={() => speakArabic(activePage.headerPreview!.arabic)}
                  className="group inline-flex flex-col items-center cursor-pointer transition-transform hover:scale-102 active:scale-98"
                >
                  <span
                    dir="rtl"
                    className="font-quran text-4xl sm:text-5xl text-[#C53030] font-bold tracking-widest block leading-relaxed drop-shadow-xs"
                  >
                    {activePage.headerPreview.arabic}
                  </span>
                  <span className="text-xs font-black text-[#523F1C] mt-1 bg-white/80 border border-[#DDD0B7] px-3 py-0.5 rounded-full shadow-2xs flex items-center gap-1.5">
                    <Volume2 size={13} className="text-amber-600" />
                    <span>{activePage.headerPreview.latin}</span>
                  </span>
                </button>
              </div>
            )}

            {/* Rows of Reading Items (RTL / Kanan ke Kiri) */}
            <div className="relative z-10 space-y-3 mt-4">
              {activePage.rows.map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  dir="rtl"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5"
                >
                  {row.items.map((item, itemIdx) => {
                    const isPointed =
                      pointedItem?.rowIdx === rowIdx && pointedItem?.itemIdx === itemIdx;

                    const latinText = item.latin || getArabicLatinGuide(item.arabic);

                    return (
                      <div
                        key={itemIdx}
                        onClick={() => handlePointItem(rowIdx, itemIdx, item.arabic)}
                        className={`relative rounded-2xl p-3 sm:p-4 text-center cursor-pointer select-none transition-all duration-200 border-2 ${
                          isPointed
                            ? 'bg-amber-100/90 border-amber-500 ring-4 ring-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.7)] scale-[1.03] z-20'
                            : 'bg-white hover:bg-amber-50/50 border-[#E2D6BF] hover:border-[#08B9EF] shadow-xs'
                        }`}
                      >
                        {/* THE RADIANT GLOWING POINTER BADGE (👉 TUNJUK) */}
                        {isPointed && (
                          <motion.div
                            initial={{ scale: 0, y: -6 }}
                            animate={{ scale: 1, y: 0 }}
                            className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md shadow-amber-500/40 whitespace-nowrap pointer-events-none"
                          >
                            <span className="text-sm animate-bounce">👆</span>
                            <span>TUNJUK</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-200 animate-ping" />
                          </motion.div>
                        )}

                        {/* Arabic Letter / Word */}
                        <div
                          className={`font-quran text-3xl sm:text-4xl font-bold leading-normal transition-colors ${
                            item.isRed ? 'text-[#C53030]' : 'text-[#1B3644]'
                          }`}
                        >
                          {item.arabic}
                        </div>

                        {/* Latin Pronunciation Subtitle */}
                        {latinText && (
                          <div
                            dir="ltr"
                            className={`text-[11px] font-bold mt-1 transition-colors ${
                              isPointed ? 'text-amber-900 font-black' : 'text-[#8C7A5B]'
                            }`}
                          >
                            {latinText}
                          </div>
                        )}

                        {/* Audio speaker micro-indicator */}
                        <div
                          dir="ltr"
                          className="absolute bottom-1 right-1.5 opacity-40 hover:opacity-100 transition-opacity"
                        >
                          <Volume2 size={12} className={isPointed ? 'text-amber-700' : 'text-[#A0937D]'} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Bottom Page Footer inside sheet */}
            <div className="relative z-10 mt-6 pt-3 border-t border-[#E9DFC8] flex items-center justify-between text-xs text-[#8C7A5B] font-bold">
              <span>Buku Iqra Digital Santri</span>
              <div className="flex items-center gap-1 text-emerald-700">
                {isCurrentPageMastered && (
                  <span className="flex items-center gap-1 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 size={13} />
                    <span>Halaman Sudah Dikuasai</span>
                  </span>
                )}
              </div>
              <span>Halaman {activePage.pageNumber}</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* FLOATING ACTION DOCK / CURRENT POINTER CONTROLS           */}
          {/* ========================================================= */}
          {currentPointedData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-amber-300 rounded-3xl p-3.5 shadow-md flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-quran text-2xl font-bold shrink-0">
                  {currentPointedData.arabic}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      KOTAK SEDANG DITUNJUK
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {audioMode === 'full_page' ? '🎧 Sync & Listen' : '🔤 Per Karakter'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-[#164C68]">
                    {currentPointedData.latin || currentPointedData.arabic}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {audioMode === 'full_page' && (
                  <button
                    onClick={isAutoPlaying ? stopAutoPlay : () => startFullPageRecitation(pointedItem?.rowIdx, pointedItem?.itemIdx)}
                    className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer ${
                      isAutoPlaying
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-[#08B9EF] hover:bg-[#07a6d7] text-white'
                    }`}
                  >
                    {isAutoPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                    <span>{isAutoPlaying ? 'Jeda Resitasi' : 'Lanjut Resitasi'}</span>
                  </button>
                )}

                <button
                  onClick={() => speakArabic(currentPointedData.arabic)}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Ulangi Bunyi</span>
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={currentPageNum >= maxPages}
                  className="px-3 py-2 rounded-xl bg-[#EEF8FF] hover:bg-[#d8eefc] text-[#164C68] font-bold text-xs flex items-center gap-1 disabled:opacity-30 cursor-pointer"
                >
                  <span>Berikutnya</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Evaluation / Graduation prompt on end pages */}
          {((activeJilid === '1' && currentPageNum >= 31) ||
            (activeJilid === '2' && currentPageNum >= 30)) && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-sm text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white mx-auto flex items-center justify-center text-2xl shadow-md shadow-emerald-500/25">
                🎓
              </div>
              <h3 className="text-base font-black text-emerald-950 font-heading">
                {activeJilid === '1'
                  ? 'Ujian Evaluasi Kelulusan Iqra Jilid 1!'
                  : 'Ujian Evaluasi Kelulusan Iqra Jilid 2!'}
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                Jika ananda telah lancar membaca seluruh baris pada halaman ini tanpa tersendat,
                berikan tanda mahir dan ananda berhak naik tingkat ke jilid berikutnya!
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    handleToggleMastery(activePage.id);
                    setShowGraduationModal(true);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-md shadow-emerald-500/25 cursor-pointer flex items-center gap-2 transition-transform hover:scale-102"
                >
                  <Award size={16} />
                  <span>
                    {activeJilid === '1'
                      ? 'Lulus Iqra 1 & Naik ke Iqra 2 🚀'
                      : 'Lulus Iqra 2 & Naik ke Iqra 3 🚀'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION B: LESSONS LIST (Jilid A, 3, 4)                  */}
      {/* ========================================================= */}
      {(activeJilid === 'A' || activeJilid === '3' || activeJilid === '4') && (
        <div className="space-y-3">
          {IQRA_CURRICULUM.filter((item) => item.jilid === activeJilid).map((item) => {
            const isMastered = completedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white border-2 rounded-3xl p-5 shadow-xs transition-all ${
                  isMastered ? 'border-emerald-200 bg-emerald-50/20' : 'border-[#C9E1ED]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#08B9EF] uppercase tracking-wider block">
                      {item.harakat}
                    </span>
                    <h4 className="text-base font-black text-[#164C68] font-heading mt-0.5">
                      {item.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => speakArabic(item.soundExample)}
                    className="w-10 h-10 rounded-2xl bg-[#EEF8FF] text-[#08B9EF] hover:bg-[#d8eefc] flex items-center justify-center transition-colors active:scale-95 cursor-pointer border border-[#C9E1ED]"
                    title="Dengarkan Pelafalan"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                {/* Large Arabic Item Display */}
                <div
                  onClick={() => speakArabic(item.arabic)}
                  className="my-4 py-3 bg-[#EEF8FF]/60 rounded-2xl text-center border border-[#C9E1ED]/60 cursor-pointer hover:bg-cyan-50/70 transition-colors"
                >
                  <span dir="rtl" className="font-quran text-4xl text-[#164C68] font-bold">
                    {item.arabic}
                  </span>
                  <p className="text-xs text-[#8C9BA7] font-bold mt-1">
                    Pelafalan: {item.latin}
                  </p>
                </div>

                <p className="text-xs text-[#8C9BA7] font-medium leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Mastery Action Button */}
                <button
                  onClick={() => handleToggleMastery(item.id)}
                  className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isMastered
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-[#EEF8FF] hover:bg-[#d9effc] text-[#164C68] border border-[#C9E1ED]'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>{isMastered ? 'Sudah Bisa ✓ (+10 XP)' : 'Tandai Sudah Bisa'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: PAGE SELECTOR GRID MODAL                         */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showPagePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#164C68] font-heading">
                    Pilih Halaman Iqra Jilid {activeJilid}
                  </h3>
                  <p className="text-xs text-[#8C9BA7] font-medium">
                    Total {currentPages.length} halaman tersedia lengkap
                  </p>
                </div>
                <button
                  onClick={() => setShowPagePicker(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Grid of Pages */}
              <div className="p-4 overflow-y-auto space-y-2 flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {currentPages.map((page) => {
                    const isCurrent = page.pageNumber === currentPageNum;
                    const isCompleted = completedIds.includes(page.id);

                    return (
                      <button
                        key={page.id}
                        onClick={() => {
                          setCurrentPageNum(page.pageNumber);
                          setShowPagePicker(false);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[80px] ${
                          isCurrent
                            ? 'bg-[#08B9EF] text-white border-[#08B9EF] shadow-md shadow-cyan-500/25 scale-[1.02]'
                            : isCompleted
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-black ${
                              isCurrent ? 'text-white' : 'text-[#08B9EF]'
                            }`}
                          >
                            Hal. {page.pageNumber}
                          </span>
                          {isCompleted && (
                            <span className="text-emerald-500 text-xs">⭐ Mahir</span>
                          )}
                        </div>

                        <div className="mt-1">
                          <p
                            className={`text-xs font-bold line-clamp-1 ${
                              isCurrent ? 'text-cyan-100' : 'text-slate-700'
                            }`}
                          >
                            {page.title}
                          </p>
                          {page.focusLetters && page.focusLetters.length > 0 && (
                            <span
                              dir="rtl"
                              className={`font-quran text-sm block mt-0.5 ${
                                isCurrent ? 'text-white' : 'text-amber-700'
                              }`}
                            >
                              {page.focusLetters.slice(0, 2).join(' ')}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  onClick={() => setShowPagePicker(false)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 2: GRADUATION CONGRATULATIONS MODAL                 */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showGraduationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border-2 border-amber-300"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-amber-950 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-amber-400/40 animate-bounce">
                👑
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-[#164C68] font-heading">
                  Alhamdulillah! Selamat Ananda Telah Lulus!
                </h3>
                <p className="text-xs text-[#627D98] leading-relaxed">
                  {activeJilid === '1'
                    ? 'Masya Allah! Ananda telah berhasil menyelesaikan seluruh materi & evaluasi pada Iqra Jilid 1!'
                    : 'Masya Allah! Ananda telah menguasai huruf sambung & bacaan mad pada Iqra Jilid 2!'}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 font-bold space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-500 fill-amber-400" />
                  <span>Hadiah Prestasi: +50 XP & +5 Bintang Belajar!</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-emerald-600" />
                  <span>Siap Melangkah ke: Iqra Jilid {activeJilid === '1' ? '2' : '3'}!</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setShowGraduationModal(false);
                    if (activeJilid === '1') {
                      setActiveJilid('2');
                      setCurrentPageNum(1);
                    } else if (activeJilid === '2') {
                      setActiveJilid('3');
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-101"
                >
                  <Sparkles size={16} />
                  <span>Buka Iqra Jilid {activeJilid === '1' ? '2' : '3'} Sekarang</span>
                </button>

                <button
                  onClick={() => setShowGraduationModal(false)}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Kembali ke Halaman Saat Ini
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
