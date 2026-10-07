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
  Flame,
  ShieldCheck,
  Crown,
  Gamepad2,
} from 'lucide-react';
import { IQRA_CURRICULUM } from '../../data/iqraData';
import { IQRA_1_PAGES, IqraBookPage, IqraPageItem } from '../../data/iqraBook1Data';
import { IQRA_2_PAGES } from '../../data/iqraBook2Data';
import { IQRA_3_PAGES } from '../../data/iqraBook3Data';
import { IQRA_4_PAGES } from '../../data/iqraBook4Data';
import { IQRA_5_PAGES } from '../../data/iqraBook5Data';
import { IQRA_6_PAGES } from '../../data/iqraBook6Data';
import { IqraMilestoneGameModal } from './IqraMilestoneGameModal';
import { StorageService } from '../../services/storageService';
import { IqraItem } from '../../types';

interface IqraModuleProps {
  childId: string;
  onBack: () => void;
}

type JilidType = '1' | '2' | '3' | '4' | '5' | '6' | 'A';

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1.0, 1.25] as const;

// Helper for Arabic transliteration when latin text is not explicitly provided
function getArabicLatinGuide(arabic: string): string {
  if (!arabic) return '';

  const clean = arabic
    .replace(/〇/g, '')
    .replace(/۝/g, '')
    .trim();

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
    'بًا': 'Ban', 'تً': 'Tan', 'ثً': 'Tsan', 'جً': 'Jan', 'دًا': 'Dan', 'زًا': 'Zan',
    'فً': 'Fan', 'كً': 'Kan', 'عًا': "'An", 'ظً': 'Zhan', 'يً': 'Yan', 'لًا': 'Lan',
    'بٍ': 'Bin', 'تٍ': 'Tin', 'دٍ': 'Din', 'مٍ': 'Min', 'وٍ': 'Win', 'سٍ': 'Sin',
    'بٌ': 'Bun', 'سٌ': 'Sun', 'عَامِلٌ': "'Aamilun", 'سَابِقٌ': 'Saabiqun',
    'أَمْ': 'Am', 'لَمْ': 'Lam', 'كَمْ': 'Kam', 'هَمْ': 'Ham',
    'أَنْ': 'An', 'إِنْ': 'In', 'مَنْ': 'Man', 'عَنْ': "'An",
    'أَبْ': 'Ab (Qalqalah)', 'أَجْ': 'Aj (Qalqalah)', 'أَدْ': 'Ad (Qalqalah)',
    'أَطْ': 'Ath (Qalqalah)', 'أَقْ': 'Aq (Qalqalah)',
    // Jilid 5 & 6 Tajwid phrases
    'الْحَمْدُ': 'Alhamdu', 'وَالْعَصْرِ': "Wal-'ashr", 'وَالْفَجْرِ': 'Walfajr',
    'مَنْ ءَامَنَ': 'Man aamana (Idzhar)', 'كُفُوًا أَحَدٌ': 'Kufuwan ahad',
    'مِنۢ بَعْدِ': "Mim ba'di (Iqlab)", 'سَمِيعٌۢ بَصِيرٌ': "Samii'um bashiir",
    'مَن يَّقُولُ': 'May yaquulu (Idgham)', 'فَمَن يَّعْمَلْ': "Famay ya'mal",
    'مِّن رَّبِّهِمْ': 'Mir robbihim (Idgham Bila-ghunnah)', 'غَفُورٌ رَّحِيمٌ': 'Ghafuurur rohiim',
    'دُنْيَا': 'Dunyaa (Idzhar Mutlaq)', 'بُنْيَانٌ': 'Bunyaan', 'قِنْوَانٌ': 'Qinwaan', 'صِنْوَانٌ': 'Shinwaan',
    'مِن قَبْلُ': 'Ming qablu (Ikhfa)', 'كُنتُمْ': 'Kuntum', 'عَن صَلَاتِهِمْ': "'An shalaatihim",
    'تَرْمِيهِم بِحِجَارَةٍ': 'Tarmiihim bihijarah (Ikhfa Syafawi)',
    'أَطْعَمَهُم مِّن جُوعٍ': "Ath'amahum min juu' (Idgham Mimi)",
    'أَلَمْ تَرَ': 'Alam tara (Idzhar Syafawi)', 'لَكُمْ دِينُكُمْ': 'Lakum diinukum',
    'مَجْر۪ىٰهَا': 'Majreehaa (Imalah)', 'ءَ۬اعْجَمِيٌّ': "A-a'jamiyyun (Tashil)", 'لَا تَأْمَ۫نَّا': "Laa ta'mannaa (Isymam)",
    'قُلْ هُوَ اللَّهُ أَحَدٌ': 'Qul huwallaahu ahad', 'اللَّهُ الصَّمَدُ': 'Allaahush shamad',
  };

  if (directMap[clean]) {
    return directMap[clean];
  }

  // Handle transitions like A -> B
  if (clean.includes('->')) {
    const parts = clean.split('->').map((p) => p.trim());
    return parts.map((p) => getArabicLatinGuide(p)).join(' ➡ ');
  }

  // Tokenize by space if multi-token
  if (clean.includes(' ')) {
    const parts = clean.split(/\s+/).map((p) => directMap[p] || getArabicLatinGuide(p));
    if (parts.some((p) => p && !/[\u0600-\u06FF]/.test(p))) {
      return parts.join(' ');
    }
  }

  // Deconstruct letters and harakat for natural Indonesian phonetics
  const letters: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ء': "'", 'ئ': "'", 'ؤ': "'",
    'ب': 'b', 'ت': 't', 'ث': 'ts', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dz', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sy',
    'ص': 'sh', 'ض': 'dh', 'ط': 'th', 'ظ': 'zh', 'ع': "'", 'غ': 'gh',
    'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'و': 'w', 'ه': 'h', 'ي': 'y', 'ى': 'aa', 'ة': 'h',
  };

  const harakats: Record<string, string> = {
    '\u064E': 'a', // fathah
    '\u0650': 'i', // kasrah
    '\u064F': 'u', // dhammah
    '\u064B': 'an', // fathatayn
    '\u064D': 'in', // kasratayn
    '\u064C': 'un', // dhammatayn
    '\u0652': '',   // sukun
    '\u0670': 'aa', // dagger alif
  };

  let transliterated = '';
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const nextCh = clean[i + 1] || '';
    const next2Ch = clean[i + 2] || '';

    if (letters[ch]) {
      let lStr = letters[ch];
      // Syaddah check
      if (nextCh === '\u0651') {
        lStr = lStr + lStr;
        if (harakats[next2Ch]) {
          transliterated += lStr + harakats[next2Ch];
          i += 2;
          continue;
        }
        transliterated += lStr;
        i++;
        continue;
      }
      if (harakats[nextCh]) {
        transliterated += lStr + harakats[nextCh];
        i++;
        continue;
      }
      transliterated += lStr;
    } else if (harakats[ch]) {
      transliterated += harakats[ch];
    } else if (ch === ' ' || ch === '-') {
      transliterated += ch;
    }
  }

  if (transliterated.length > 0 && !/[\u0600-\u06FF]/.test(transliterated)) {
    return transliterated.charAt(0).toUpperCase() + transliterated.slice(1);
  }

  return '';
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
  } catch {}
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
  // Default speed set to 0.5 (calm, educational cadence as requested by user)
  const [autoSpeed, setAutoSpeed] = useState<number>(0.5);

  // Audio Playback Mode: 'character' (individual character audio) vs 'full_page' (Sync & Listen full-page recitation)
  const [audioMode, setAudioMode] = useState<'character' | 'full_page'>('character');

  // Voice Gender: 'female' (Ustadzah) vs 'male' (Ustadz) with persistence in StorageService
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>(() => {
    return StorageService.getPreferredVoiceGender();
  });

  const handleSetVoiceGender = (gender: 'male' | 'female') => {
    setVoiceGender(gender);
    StorageService.setPreferredVoiceGender(gender);
    // Auditory preview feedback
    setTimeout(() => {
      speakArabic(gender === 'female' ? 'أَهْلًا وَسَهْلًا' : 'مَرْحَبًا بِكُمْ');
    }, 120);
  };

  // Modal states
  const [showPagePicker, setShowPagePicker] = useState<boolean>(false);
  const [showGraduationModal, setShowGraduationModal] = useState<boolean>(false);
  const [showBadgeModal, setShowBadgeModal] = useState<boolean>(false);
  const [showMilestoneGameModal, setShowMilestoneGameModal] = useState<boolean>(false);

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

  // Active book pages list (Jilid 1, 2, 3, 4, 5, 6)
  const currentPages: IqraBookPage[] = useMemo(() => {
    if (activeJilid === '1') return IQRA_1_PAGES;
    if (activeJilid === '2') return IQRA_2_PAGES;
    if (activeJilid === '3') return IQRA_3_PAGES;
    if (activeJilid === '4') return IQRA_4_PAGES;
    if (activeJilid === '5') return IQRA_5_PAGES;
    if (activeJilid === '6') return IQRA_6_PAGES;
    return [];
  }, [activeJilid]);

  const maxPages = currentPages.length || 1;

  // Active page object
  const activePage: IqraBookPage | undefined = useMemo(() => {
    return currentPages.find((p) => p.pageNumber === currentPageNum) || currentPages[0];
  }, [currentPages, currentPageNum]);

  const isBookMode = ['1', '2', '3', '4', '5', '6'].includes(activeJilid);

  // Mastered count in current jilid
  const masteredPagesInJilid = useMemo(() => {
    if (isBookMode) {
      return currentPages.filter((p) => completedIds.includes(p.id)).length;
    }
    const jilidItems = IQRA_CURRICULUM.filter((item) => item.jilid === activeJilid);
    return jilidItems.filter((i) => completedIds.includes(i.id)).length;
  }, [isBookMode, activeJilid, currentPages, completedIds]);

  const totalInCurrentJilid = useMemo(() => {
    if (isBookMode) return currentPages.length;
    return IQRA_CURRICULUM.filter((item) => item.jilid === activeJilid).length;
  }, [isBookMode, activeJilid, currentPages]);

  // Overall completed Iqra pages across all books
  const totalCompletedAllIqra = useMemo(() => {
    return completedIds.filter((id) => id.startsWith('iqra-')).length;
  }, [completedIds]);

  // Dynamic Interactive Badge Title
  const currentBadgeTitle = useMemo(() => {
    if (totalCompletedAllIqra >= 150) return 'Mahkota Khatam 30 Juz 👑';
    if (totalCompletedAllIqra >= 120) return 'Panglima Nun Mati & Waqaf 🛡️';
    if (totalCompletedAllIqra >= 90) return 'Mahkota Hafizh Iqra 👑';
    if (totalCompletedAllIqra >= 60) return 'Ksatria Sukun & Qalqalah ⚡';
    if (totalCompletedAllIqra >= 40) return 'Bintang Kasrah & Dhommah 💎';
    if (totalCompletedAllIqra >= 20) return 'Penjelajah Sambung & Mad 🌿';
    if (totalCompletedAllIqra >= 5) return 'Perintis Alif Ba Ta 🌟';
    return 'Santri Cilik Berbakat ✨';
  }, [totalCompletedAllIqra]);

  // Reset pointer when page changes
  useEffect(() => {
    stopAutoPlay();
    setPointedItem({ rowIdx: 0, itemIdx: 0 });
    setIsQuizMode(false);
    setQuizTarget(null);
    setQuizFeedback('idle');
  }, [currentPageNum, activeJilid]);

  // Keep glowing pointer synchronized with viewport during recitation walk
  useEffect(() => {
    if (pointedItem && typeof document !== 'undefined') {
      const el = document.getElementById(`iqra-item-${pointedItem.rowIdx}-${pointedItem.itemIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [pointedItem]);

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

  // Pronounce Arabic text using Speech Synthesis with friendly tone, male/female selection, and 100% punctuation-free clean
  const speakArabic = (arabicText: string, speed = autoSpeed, onComplete?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean characters, waqaf circles, notes, and Latin annotations
      let clean = arabicText
        // Strip HTML entities if any
        .replace(/&[a-z0-9#]+;/gi, ' ')
        // Strip waqaf circles and quranic symbols
        .replace(/[〇۝○]/g, ' ')
        // Strip brackets and parentheses and their contents
        .replace(/\([^\u0600-\u06FF]*\)/g, ' ')
        .replace(/\[[^\u0600-\u06FF]*\]/g, ' ')
        .replace(/\{[^\u0600-\u06FF]*\}/g, ' ')
        .replace(/\([^)]*\)/g, ' ')
        .replace(/\[[^\]]*\]/g, ' ')
        .replace(/\{[^}]*\}/g, ' ');

      // Handle Waqaf symbols guide table on Iqra 6 page 17: e.g. "مـ : وَقْفٌ لَازِمٌ" -> "وَقْفٌ لَازِمٌ"
      if (clean.includes(':') && (clean.includes('مـ') || clean.includes('لا') || clean.includes('ج') || clean.includes('قلى') || clean.includes('صلى') || clean.includes('∴'))) {
        const afterColon = clean.split(':')[1];
        if (afterColon && afterColon.trim()) {
          clean = afterColon.trim();
        }
      }

      // Handle letter names on Iqra 1 page 32: e.g. "أ : الف" -> "أَلِف", "ب : باء" -> "بَاء"
      if (clean.includes(':')) {
        const parts = clean.split(':').map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          clean = parts[1];
        }
      }

      // Handle equality transformations like "بَ تَ = بَتَ" -> speak target "بَتَ"
      if (clean.includes('=')) {
        const parts = clean.split('=').map((p) => p.trim()).filter(Boolean);
        clean = parts[parts.length - 1] || clean;
      }

      // If text demonstrates transition (e.g. 'أَبَدًا -> أَبَدَا'), pronounce target form clearly
      if (clean.includes('->') || clean.includes('➡') || clean.includes('>')) {
        const parts = clean.split(/->|➡|>/).map((p) => p.trim()).filter(Boolean);
        clean = parts[parts.length - 1] || clean;
      }

      // Strip pipe separators
      if (clean.includes('|')) {
        clean = clean.replace(/\|/g, ' ');
      }

      // Strip ellipsis
      clean = clean.replace(/\.{2,}/g, ' ');

      // Handle Latin soundExample fallbacks if passed directly
      const latinToSpeechMap: Record<string, string> = {
        'A - Ba': 'أَ بَ',
        'Ta - Tsa': 'تَ ثَ',
        'Ja - Ha - Kha': 'جَ حَ خَ',
        'Da - Dza': 'دَ ذَ',
        'Ra - Za': 'رَ زَ',
        'Sa - Sya': 'سَ شَ',
        'Sha - Dha': 'صَ ضَ',
        'Tha - Zha': 'طَ ظَ',
        "'A - Gha": 'عَ غَ',
        'Fa - Qa': 'فَ قَ',
        'Ka - La - Ma': 'كَ لَ مَ',
        'Na - Wa - Ha - Ya': 'نَ وَ هَ يَ',
        'Ba-Ta-Tsa': 'بَ تَ ثَ',
        'Darasa': 'دَرَسَ',
        'Kataba': 'كَتَبَ',
        'Bi - Ti - Tsi': 'بِ تِ ثِ',
        'Bu - Tu - Tsu': 'بُ تُ ثُ',
        'Rusila': 'رُسِلَ',
        'Ban - Bin - Bun': 'بً بٍ بٌ',
        'Baa - Bii - Buu': 'بَا بِي بُو',
        'Basatha': 'بَسَطَ',
        'Khalaqaka': 'خَلَقَكَ',
        'Ab - Aj - Ad': 'أَبْ أَجْ أَدْ',
        'Qalqalah': 'أَبْ أَجْ أَدْ',
        "Nasta'iin": 'نَسْتَعِينُ',
        'Al-hamdu lillaah': 'الْحَمْدُ لِلَّهِ',
        'Tajwid Nun Sukun': 'مَنْ ءَامَنَ',
        'Khatam Iqra': 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
      };
      if (latinToSpeechMap[clean.trim()]) {
        clean = latinToSpeechMap[clean.trim()];
      }

      // Authentic Tajwid & Gharib Phonetic Adaptations for pure recitation
      clean = clean
        .replace(/مَجْر۪ىٰهَا/g, 'مَجْرَيْهَا') // Imalah (Majreehaa)
        .replace(/ءَ۬اعْجَمِيٌّ/g, 'أَأَعْجَمِيٌّ') // Tashil (A-a'jamiyyun)
        .replace(/لَا تَأْمَ۫نَّا/g, 'لَا تَأْمَنَّا') // Isymam (Laa ta'mannaa)
        .replace(/أَحَدٌ ٱللَّهُ/g, 'أَحَدُنِ اللَّهُ') // Nun Wiqayah
        .replace(/بِئْسَ الاِسْمُ/g, 'بِئْسَ لِسْمُ') // Naql
        .replace(/مِنۢ بَعْدِ/g, 'مِمْ بَعْدِ') // Iqlab
        // Mad Shilah 2-Harakat vocalization for TTS
        .replace(/هُۥ/g, 'هُو')
        .replace(/هِۦ/g, 'هِي')
        // Waslah Alif to standard Alif for speech synthesis
        .replace(/ٱ/g, 'ا')
        // Dagger Alif (Alif Khanjariyah) to regular Alif for authentic elongation
        .replace(/َـٰ/g, 'َا')
        .replace(/ـٰ/g, 'َا')
        .replace(/ـ/g, '') // Tatweel
        // Strip remaining Quranic waqaf & pause symbols not spoken aloud
        .replace(/[\u06D6-\u06ED]/g, ' ')
        // Letter name expansions for single Hijaiyah recognition
        .replace(/\bالف\b/g, 'أَلِف')
        .replace(/\bباء\b/g, 'بَاء')
        .replace(/\bتاء\b/g, 'تَاء')
        .replace(/\bثاء\b/g, 'ثَاء')
        .replace(/\bجيم\b/g, 'جِيم')
        .replace(/\bحاء\b/g, 'حَاء')
        .replace(/\bخاء\b/g, 'خَاء')
        .replace(/\bدال\b/g, 'دَال')
        .replace(/\bذال\b/g, 'ذَال')
        .replace(/\bراء\b/g, 'رَاء')
        .replace(/\bزاي\b/g, 'زَاي')
        .replace(/\bسين\b/g, 'سِين')
        .replace(/\bشين\b/g, 'شِين')
        .replace(/\bصاد\b/g, 'صَاد')
        .replace(/\bضاد\b/g, 'ضَاد')
        .replace(/\bطاء\b/g, 'طَاء')
        .replace(/\bظاء\b/g, 'ظَاء')
        .replace(/\bعين\b/g, 'عَيْن')
        .replace(/\bغين\b/g, 'غَيْن')
        .replace(/\bفاء\b/g, 'فَاء')
        .replace(/\bقاف\b/g, 'قَاف')
        .replace(/\bكاف\b/g, 'كَاف')
        .replace(/\bلام\b/g, 'لَام')
        .replace(/\bميم\b/g, 'مِيم')
        .replace(/\bنون\b/g, 'نُون')
        .replace(/\bواو\b/g, 'وَاو')
        .replace(/\bهاء\b/g, 'هَاء')
        .replace(/\bهمزة\b/g, 'هَمْزَة')
        .replace(/\bياء\b/g, 'يَاء');

      // If text is unvocalized single hijaiyah (e.g. 'ا - ب' or 'ت - ث' in Jilid A)
      if (/^[\u0621-\u064A\s\-]+$/.test(clean) && !/[\u064B-\u0652\u0670]/.test(clean)) {
        const standaloneMap: Record<string, string> = {
          'ا': 'أَلِف', 'ب': 'بَاء', 'ت': 'تَاء', 'ث': 'ثَاء', 'ج': 'جِيم',
          'ح': 'حَاء', 'خ': 'خَاء', 'د': 'دَال', 'ذ': 'ذَال', 'ر': 'رَاء',
          'ز': 'زَاي', 'س': 'سِين', 'ش': 'شِين', 'ص': 'صَاد', 'ض': 'ضَاد',
          'ط': 'طَاء', 'ظ': 'ظَاء', 'ع': 'عَيْن', 'غ': 'غَيْن', 'ف': 'فَاء',
          'ق': 'قَاف', 'ك': 'كَاف', 'ل': 'لَام', 'م': 'مِيم', 'ن': 'نُون',
          'و': 'وَاو', 'ه': 'هَاء', 'ي': 'يَاء', 'هـ': 'هَاء', 'ء': 'هَمْزَة',
        };
        clean = clean
          .split(/[\s\-]+/)
          .map((ch) => standaloneMap[ch] || ch)
          .join(' ');
      }

      // CRITICAL: Strip ALL non-Arabic letters, non-harakats, symbols, dashes, colons, semicolons
      // Keeps strictly: Arabic letters (\u0621-\u064A, \u0671), Harakat (\u064B-\u0652, \u0670), and spaces!
      clean = clean.replace(/[^ \u0621-\u064A\u0671\u064B-\u0652\u0670]/g, ' ');
      clean = clean.replace(/\s+/g, ' ').trim();

      if (!clean) {
        if (onComplete) onComplete();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'ar-SA';

      // Map speed gracefully to speech synthesis engine rate
      const mappedRate =
        speed === 0.25
          ? 0.55
          : speed === 0.5
          ? 0.72
          : speed === 0.75
          ? 0.85
          : speed === 1.0
          ? 0.95
          : 1.15;

      utterance.rate = mappedRate;

      // Select voice based on gender preference (Ustadz vs Ustadzah)
      const voices = window.speechSynthesis.getVoices();
      const arabicVoices = voices.filter(
        (v) =>
          v.lang.startsWith('ar') ||
          v.lang.includes('SA') ||
          v.name.toLowerCase().includes('arabic')
      );

      let selectedVoice: SpeechSynthesisVoice | undefined;
      if (voiceGender === 'female') {
        selectedVoice = arabicVoices.find((v) => {
          const n = v.name.toLowerCase();
          return (
            n.includes('female') ||
            n.includes('laila') ||
            n.includes('hoda') ||
            n.includes('mariam') ||
            n.includes('salma') ||
            n.includes('zariyah') ||
            n.includes('zeina') ||
            n.includes('fatima') ||
            n.includes('noor') ||
            n.includes('layla')
          );
        });
        if (!selectedVoice && arabicVoices.length > 0) {
          selectedVoice = arabicVoices[0];
        }
        utterance.pitch = 1.22; // Female teacher tone (Ustadzah)
      } else {
        selectedVoice = arabicVoices.find((v) => {
          const n = v.name.toLowerCase();
          return (
            n.includes('male') ||
            n.includes('maged') ||
            n.includes('tarik') ||
            n.includes('naayf') ||
            n.includes('hamed') ||
            n.includes('mehdi') ||
            n.includes('salman') ||
            n.includes('fahad')
          );
        });
        if (!selectedVoice && arabicVoices.length > 0) {
          selectedVoice = arabicVoices.length > 1 ? arabicVoices[1] : arabicVoices[0];
        }
        utterance.pitch = 0.88; // Male teacher tone (Ustadz)
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      let hasFinished = false;
      const notifyDone = () => {
        if (!hasFinished) {
          hasFinished = true;
          if (onComplete) onComplete();
        }
      };

      utterance.onend = notifyDone;
      utterance.onerror = notifyDone;

      playChime(620);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
      if (onComplete) onComplete();
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
      // Natural breathing pause after audio completes (calibrated by playback speed)
      const pauseAfterSpeechMs =
        autoSpeed === 0.25
          ? 1400
          : autoSpeed === 0.5
          ? 1000
          : autoSpeed === 0.75
          ? 700
          : autoSpeed === 1.0
          ? 500
          : 350;

      // Estimate natural safety fallback timeout based on Arabic text length
      const charCount = current.arabic.replace(/\s+/g, '').length;
      const rateMultiplier =
        autoSpeed === 0.25 ? 0.55 : autoSpeed === 0.5 ? 0.72 : autoSpeed === 0.75 ? 0.85 : 0.95;
      const estimatedSpeakMs = Math.max(1200, Math.round((charCount * 170) / rateMultiplier));
      const safetyTimeoutMs = estimatedSpeakMs + pauseAfterSpeechMs + 800;

      let hasAdvanced = false;
      const advanceToNext = () => {
        if (hasAdvanced) return;
        hasAdvanced = true;
        if (autoPlayTimeoutRef.current) {
          clearTimeout(autoPlayTimeoutRef.current);
          autoPlayTimeoutRef.current = null;
        }
        autoPlayTimeoutRef.current = setTimeout(() => {
          runStep(index + 1);
        }, pauseAfterSpeechMs);
      };

      // Set fallback safety timer
      autoPlayTimeoutRef.current = setTimeout(() => {
        advanceToNext();
      }, safetyTimeoutMs);

      // Play audio with onComplete synchronization
      speakArabic(current.arabic, autoSpeed, () => {
        advanceToNext();
      });
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

    // Check if finished final page of current Jilid
    if (
      itemId === 'iqra-1-p31' ||
      itemId === 'iqra-1-p32' ||
      itemId === 'iqra-2-p30' ||
      itemId === 'iqra-3-p29' ||
      itemId === 'iqra-3-p30' ||
      itemId === 'iqra-4-p29' ||
      itemId === 'iqra-4-p30'
    ) {
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#C9E1ED] text-xs font-bold text-[#164C68] hover:text-[#08B9EF] shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Menu Utama</span>
        </button>

        {/* UPGRADED INTERACTIVE IQRA BADGE */}
        <button
          type="button"
          onClick={() => setShowBadgeModal(true)}
          className="group relative flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-orange-500/15 border-2 border-amber-300 hover:border-amber-500 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
          title="Klik untuk membuka Lencana & Prestasi Iqra Santri"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-amber-950 flex items-center justify-center font-bold text-sm shadow-xs group-hover:rotate-12 transition-transform">
            🏆
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black text-amber-800 uppercase tracking-wider">
                Lencana Iqra Interaktif
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            </div>
            <span className="text-xs font-black text-[#164C68] group-hover:text-amber-900 transition-colors">
              {currentBadgeTitle}
            </span>
          </div>
          <Sparkles size={14} className="text-amber-500 group-hover:scale-125 transition-transform" />
        </button>
      </div>

      {/* Jilid Tabs Navigation (Jilid 1 to 6 & A) */}
      <div className="flex gap-1.5 p-1.5 bg-white border border-[#C9E1ED] rounded-2xl shadow-xs overflow-x-auto">
        {(['1', '2', '3', '4', '5', '6', 'A'] as const).map((jilid) => {
          const isActive = activeJilid === jilid;
          return (
            <button
              key={jilid}
              onClick={() => {
                setActiveJilid(jilid);
                setCurrentPageNum(1);
              }}
              className={`flex-1 min-w-[70px] py-2 px-2 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#08B9EF] to-[#0596c7] text-white shadow-md shadow-cyan-500/25 scale-[1.02]'
                  : 'text-[#8C9BA7] hover:text-[#164C68] hover:bg-[#EEF8FF]/60'
              }`}
            >
              <BookOpen size={12} />
              <span>
                {jilid === 'A'
                  ? 'Hijaiyah A'
                  : jilid === '1'
                  ? 'Iqra 1 (32 Hal)'
                  : jilid === '2'
                  ? 'Iqra 2 (30 Hal)'
                  : jilid === '3'
                  ? 'Iqra 3 (30 Hal)'
                  : jilid === '4'
                  ? 'Iqra 4 (30 Hal)'
                  : jilid === '5'
                  ? 'Iqra 5 (30 Hal)'
                  : 'Iqra 6 (30 Hal)'}
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
              {isBookMode ? 'Buku Standar Asli' : 'Materi Pembelajaran'}
            </span>
            <h3 className="text-base font-black text-[#164C68] font-heading">
              {activeJilid === '1'
                ? 'Buku Iqra 1: Fathah & Huruf Hijaiyah'
                : activeJilid === '2'
                ? 'Buku Iqra 2: Huruf Sambung & Mad Ashli'
                : activeJilid === '3'
                ? 'Buku Iqra 3: Kasrah, Dhommah & Mad Thabi`i'
                : activeJilid === '4'
                ? 'Buku Iqra 4: Tanwin, Lin, Sukun & Qalqalah'
                : activeJilid === '5'
                ? 'Buku Iqra 5: Alif Lam, Waqaf, Idgham & Mad Lazim'
                : activeJilid === '6'
                ? 'Buku Iqra 6: Nun/Mim Mati, Iqlab, Ikhfa & Khatam'
                : `Iqra Jilid ${activeJilid}`}
            </h3>
          </div>
          <p className="text-xs text-[#627D98] font-medium">
            {isBookMode
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
      {/* SECTION A: BOOK MODE (Jilid 1, 2, 3, 4)                  */}
      {/* ========================================================= */}
      {isBookMode && activePage && (
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

            {/* Pilihan Suara Guru: Laki-laki (Ustadz) vs Perempuan (Ustadzah) */}
            <div className="flex items-center p-1 bg-amber-50/70 border border-amber-200/80 rounded-2xl shadow-2xs">
              <span className="text-[10px] font-black uppercase text-amber-900 px-2 hidden sm:inline">
                Suara:
              </span>
              <button
                type="button"
                onClick={() => handleSetVoiceGender('female')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  voiceGender === 'female'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                    : 'text-amber-900/70 hover:text-amber-900 hover:bg-amber-100/60'
                }`}
                title="Pilih Suara Ustadzah (Perempuan • Nada Cerah & Ramah Anak)"
              >
                <span>👩</span>
                <span>Ustadzah</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetVoiceGender('male')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  voiceGender === 'male'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs'
                    : 'text-amber-900/70 hover:text-amber-900 hover:bg-amber-100/60'
                }`}
                title="Pilih Suara Ustadz (Laki-laki • Nada Mantap & Berwibawa)"
              >
                <span>👨</span>
                <span>Ustadz</span>
              </button>
            </div>

            {/* Speed Selector (0.25x, 0.5x, 0.75x, 1.0x, 1.25x) */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 px-1.5 hidden xl:inline">
                Speed:
              </span>
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => setAutoSpeed(speed)}
                  className={`px-2 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    autoSpeed === speed
                      ? 'bg-amber-400 text-amber-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title={
                    speed === 0.25
                      ? '0.25x (Sangat Santai & Lambat)'
                      : speed === 0.5
                      ? '0.5x (Santai • Paling Pas Untuk Anak)'
                      : speed === 0.75
                      ? '0.75x (Pelan)'
                      : speed === 1.0
                      ? '1.0x (Normal)'
                      : '1.25x (Lancar)'
                  }
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Quick Interactive Tool Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Mini-Game Tiap 5 Halaman */}
              <button
                onClick={() => setShowMilestoneGameModal(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentPageNum % 5 === 0
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-amber-300'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                }`}
                title="Mini-Game interaktif per tiap 5 halaman"
              >
                <Gamepad2 size={14} className={currentPageNum % 5 === 0 ? 'animate-bounce' : ''} />
                <span>{currentPageNum % 5 === 0 ? '🎉 Game Milestone!' : 'Game 5 Hal'}</span>
              </button>

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
                    Sentuh kotak mana saja untuk memulai resitasi mengalir dari kotak tersebut, atau gunakan tombol putar di samping.
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

                {/* Direct speed buttons inside banner */}
                <div className="flex items-center gap-0.5 bg-white border border-[#C9E1ED] p-0.5 rounded-xl">
                  {SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setAutoSpeed(speed)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer ${
                        autoSpeed === speed
                          ? 'bg-[#08B9EF] text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
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

            {/* Book Page Top Header with Interactive Milestone Badge */}
            <div className="relative z-10 text-center space-y-1.5 pb-4 border-b border-[#E9DFC8]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#8C7A5B]">
                <button
                  onClick={() => setShowBadgeModal(true)}
                  className="flex items-center gap-1 hover:text-amber-800 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Iqra' Jilid {activeJilid}</span>
                </button>
                <span className="font-arabic text-sm text-[#5B492B]">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
                <button
                  onClick={() => handleToggleMastery(activePage.id)}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F4EDE0] hover:bg-amber-100 text-[#5D4E37] cursor-pointer transition-colors"
                  title="Klik untuk tandai kemahiran halaman"
                >
                  <span>Halaman {activePage.pageNumber}</span>
                  {isCurrentPageMastered && <span>⭐</span>}
                </button>
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

            {/* 5-Page Milestone Mini-Game Celebration Banner */}
            {currentPageNum % 5 === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 my-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex flex-wrap items-center justify-between gap-3 shadow-md shadow-indigo-500/20 border-2 border-amber-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shrink-0 border border-white/30">
                    🏆
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.2 rounded-full">
                        ZONA GAME 5 HALAMAN ⭐
                      </span>
                      <span className="text-xs font-bold text-indigo-100">
                        Milestone Hal. {currentPageNum} (Jilid {activeJilid})
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-black mt-0.5">
                      Hebat! Mainkan Mini-Game seru untuk menguji bacaan & kumpulkan Bintang Prestasi!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMilestoneGameModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black text-xs shrink-0 shadow-md shadow-amber-400/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 border border-amber-200"
                >
                  <Gamepad2 size={15} />
                  <span>Mainkan Game Sekarang 🎮</span>
                </button>
              </motion.div>
            )}

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
              {activePage.rows.map((row, rowIdx) => {
                const colsClass =
                  row.items.length === 1
                    ? 'grid-cols-1'
                    : row.items.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : row.items.length === 3
                    ? 'grid-cols-2 sm:grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';

                return (
                  <div
                    key={rowIdx}
                    dir="rtl"
                    className={`grid ${colsClass} gap-2.5 sm:gap-3.5`}
                  >
                    {row.items.map((item, itemIdx) => {
                      const isPointed =
                        pointedItem?.rowIdx === rowIdx && pointedItem?.itemIdx === itemIdx;

                      const latinText = item.latin || getArabicLatinGuide(item.arabic);
                      const textLen = item.arabic.trim().length;
                      const fontSizeClass =
                        textLen > 40
                          ? 'text-base sm:text-lg md:text-xl py-3 px-3'
                          : textLen > 20
                          ? 'text-lg sm:text-xl md:text-2xl py-3 px-3'
                          : textLen > 10
                          ? 'text-2xl sm:text-3xl py-3 sm:py-3.5'
                          : 'text-3xl sm:text-4xl py-3 sm:py-4';

                      return (
                        <div
                          key={itemIdx}
                          id={`iqra-item-${rowIdx}-${itemIdx}`}
                          onClick={() => handlePointItem(rowIdx, itemIdx, item.arabic)}
                          className={`relative rounded-2xl ${fontSizeClass} text-center cursor-pointer select-none transition-all duration-200 border-2 ${
                            isPointed
                              ? 'bg-amber-100/90 border-amber-500 ring-4 ring-amber-400/80 shadow-[0_0_28px_rgba(251,191,36,0.75)] scale-[1.03] z-20'
                              : 'bg-white hover:bg-amber-50/50 border-[#E2D6BF] hover:border-[#08B9EF] shadow-xs'
                          }`}
                        >
                          {/* UPGRADED INTERACTIVE RADIANT POINTER BADGE */}
                          {isPointed && (
                            <motion.button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakArabic(item.arabic);
                              }}
                              initial={{ scale: 0, y: -8 }}
                              animate={{ scale: [1, 1.05, 1], y: [0, -3, 0] }}
                              transition={{ repeat: Infinity, duration: 1.8 }}
                              className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-amber-950 font-black text-[10px] px-3 py-0.5 rounded-full shadow-lg shadow-amber-500/50 whitespace-nowrap cursor-pointer border border-amber-200 active:scale-95"
                              title="Klik untuk bunyikan ulang huruf ini"
                            >
                              <span className="text-sm">👆</span>
                              <span className="tracking-wide">TUNJUK</span>
                              {/* Live Audio Visualizer Mini Bars */}
                              <span className="flex items-center gap-0.5 ml-0.5 h-3">
                                <span className="w-0.5 h-2 bg-amber-950 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-0.5 h-3 bg-amber-950 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-0.5 h-2 bg-amber-950 rounded-full animate-bounce" />
                              </span>
                            </motion.button>
                          )}

                          {/* Arabic Letter / Word */}
                          <div
                            className={`font-quran font-bold leading-normal transition-colors ${
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
              );
            })}
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
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded">
                      {autoSpeed}x
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
            (activeJilid === '2' && currentPageNum >= 30) ||
            (activeJilid === '3' && currentPageNum >= 29) ||
            (activeJilid === '4' && currentPageNum >= 29)) && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-sm text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white mx-auto flex items-center justify-center text-2xl shadow-md shadow-emerald-500/25">
                🎓
              </div>
              <h3 className="text-base font-black text-emerald-950 font-heading">
                {activeJilid === '1'
                  ? 'Ujian Evaluasi Kelulusan Iqra Jilid 1!'
                  : activeJilid === '2'
                  ? 'Ujian Evaluasi Kelulusan Iqra Jilid 2!'
                  : activeJilid === '3'
                  ? 'Ujian Evaluasi Kelulusan Iqra Jilid 3!'
                  : 'Ujian Evaluasi Kelulusan Iqra Jilid 4!'}
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
                      : activeJilid === '2'
                      ? 'Lulus Iqra 2 & Naik ke Iqra 3 🚀'
                      : activeJilid === '3'
                      ? 'Lulus Iqra 3 & Naik ke Iqra 4 🚀'
                      : 'Lulus Iqra 4 & Naik ke Iqra 5 🚀'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION B: LESSONS LIST (Jilid A)                        */}
      {/* ========================================================= */}
      {activeJilid === 'A' && (
        <div className="space-y-3">
          {IQRA_CURRICULUM.filter((item) => item.jilid === 'A').map((item) => {
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
                    onClick={() => speakArabic(item.arabic)}
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
      {/* MODAL 2: INTERACTIVE IQRA BADGES & ACHIEVEMENT MODAL       */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showBadgeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-2 border-amber-300"
            >
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-amber-950 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/90 text-amber-900 flex items-center justify-center text-2xl shadow-sm">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-base font-black font-heading leading-tight">
                      Lencana & Prestasi Iqra Santri
                    </h3>
                    <p className="text-xs text-amber-900/80 font-bold mt-0.5">
                      Pencapaian belajar membaca Al-Qur'an ananda
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBadgeModal(false)}
                  className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-amber-950 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Badges Content */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {/* Highlights Card */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-around text-center">
                  <div>
                    <span className="text-2xl font-black text-amber-700 block">
                      {totalCompletedAllIqra}
                    </span>
                    <span className="text-[11px] font-bold text-amber-900">
                      Halaman Dikuasai
                    </span>
                  </div>
                  <div className="w-px h-8 bg-amber-200" />
                  <div>
                    <span className="text-2xl font-black text-amber-700 block">
                      {totalCompletedAllIqra * 15}
                    </span>
                    <span className="text-[11px] font-bold text-amber-900">
                      Total XP Iqra
                    </span>
                  </div>
                  <div className="w-px h-8 bg-amber-200" />
                  <div>
                    <span className="text-2xl font-black text-amber-700 block">
                      {autoSpeed}x
                    </span>
                    <span className="text-[11px] font-bold text-amber-900">
                      Kecepatan Belajar
                    </span>
                  </div>
                </div>

                {/* List of Badges */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Daftar Lencana Kehormatan Santri
                  </h4>

                  {[
                    {
                      title: 'Perintis Alif Ba Ta',
                      jilid: 'Iqra Jilid 1',
                      desc: 'Mengenal huruf hijaiyah tunggal & harakat fathah',
                      icon: '🌟',
                      unlocked: totalCompletedAllIqra >= 5,
                    },
                    {
                      title: 'Penakluk Sambung & Mad Ashli',
                      jilid: 'Iqra Jilid 2',
                      desc: 'Menguasai huruf sambung dan ayunan mad 2 harakat',
                      icon: '🌿',
                      unlocked: totalCompletedAllIqra >= 25,
                    },
                    {
                      title: 'Ksatria Kasrah & Dhommah',
                      jilid: 'Iqra Jilid 3',
                      desc: 'Fasih membaca vokal I, U, dan Mad Thabi`i berangkai',
                      icon: '💎',
                      unlocked: totalCompletedAllIqra >= 50,
                    },
                    {
                      title: 'Master Sukun & Qalqalah',
                      jilid: 'Iqra Jilid 4',
                      desc: 'Menguasai tanwin, lin, mim/nun mati, dan pantulan qalqalah',
                      icon: '⚡',
                      unlocked: totalCompletedAllIqra >= 80,
                    },
                    {
                      title: 'Panglima Alif Lam & Waqaf',
                      jilid: 'Iqra Jilid 5',
                      desc: 'Menguasai Alif Lam Qamariyah/Syamsiyah, waqaf, dan mad lazim',
                      icon: '🛡️',
                      unlocked: totalCompletedAllIqra >= 110,
                    },
                    {
                      title: 'Mahkota Khatam Al-Qur\'an',
                      jilid: 'Iqra Jilid 6',
                      desc: 'Khatam seluruh kaidah tajwid & syahadah membaca mushaf 30 juz',
                      icon: '👑',
                      unlocked: totalCompletedAllIqra >= 140,
                    },
                    {
                      title: 'Bintang Game Tiap 5 Halaman',
                      jilid: 'Mini-Game Milestone',
                      desc: 'Menaklukkan mini-game seru di setiap 5 halaman',
                      icon: '🎮',
                      unlocked: totalCompletedAllIqra >= 5,
                    },
                    {
                      title: 'Penunjuk Akurat',
                      jilid: 'Kuis Tunjuk Cepat',
                      desc: 'Menjawab tantangan tunjuk cepat dengan tepat',
                      icon: '🎯',
                      unlocked: quizStreak >= 3 || totalCompletedAllIqra >= 10,
                    },
                    {
                      title: 'Pendengar Tartil',
                      jilid: 'Fitur Sync & Listen',
                      desc: 'Mendengarkan resitasi penuh halaman dengan fokus',
                      icon: '🎧',
                      unlocked: true,
                    },
                  ].map((badge, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition-all ${
                        badge.unlocked
                          ? 'bg-white border-amber-300 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shrink-0">
                        {badge.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-black text-[#164C68]">
                            {badge.title}
                          </h5>
                          {badge.unlocked && (
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">
                              Terbuka ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {badge.desc}
                        </p>
                        <span className="text-[10px] font-black text-amber-700 block mt-1">
                          {badge.jilid}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  onClick={() => setShowBadgeModal(false)}
                  className="w-full py-3 rounded-2xl bg-[#08B9EF] hover:bg-[#07a6d7] text-white font-black text-xs cursor-pointer shadow-xs transition-colors"
                >
                  Tutup & Lanjutkan Mengaji
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 3: GRADUATION CONGRATULATIONS MODAL                 */}
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
                    : activeJilid === '2'
                    ? 'Masya Allah! Ananda telah menguasai huruf sambung & bacaan mad pada Iqra Jilid 2!'
                    : activeJilid === '3'
                    ? 'Masya Allah! Ananda telah menyelesaikan harakat kasrah, dhommah, dan mad thabi`i pada Iqra Jilid 3!'
                    : activeJilid === '4'
                    ? 'Masya Allah! Ananda telah menguasai tanwin, lin, mim/nun sukun, dan qalqalah pada Iqra Jilid 4!'
                    : activeJilid === '5'
                    ? 'Masya Allah! Ananda telah menguasai Alif Lam, waqaf, idgham, dan mad lazim pada Iqra Jilid 5!'
                    : 'Mubarak! Ananda resmi KHATAM IQRA 1-6 dan siap membaca Al-Qur\'an Mushaf 30 Juz!'}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 font-bold space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-500 fill-amber-400" />
                  <span>Hadiah Prestasi: +50 XP & +5 Bintang Belajar!</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-emerald-600" />
                  <span>
                    Siap Melangkah ke:{' '}
                    {activeJilid === '1'
                      ? 'Iqra Jilid 2'
                      : activeJilid === '2'
                      ? 'Iqra Jilid 3'
                      : activeJilid === '3'
                      ? 'Iqra Jilid 4'
                      : activeJilid === '4'
                      ? 'Iqra Jilid 5'
                      : activeJilid === '5'
                      ? 'Iqra Jilid 6'
                      : 'Mushaf Al-Qur`an 30 Juz'}
                    !
                  </span>
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
                      setCurrentPageNum(1);
                    } else if (activeJilid === '3') {
                      setActiveJilid('4');
                      setCurrentPageNum(1);
                    } else if (activeJilid === '4') {
                      setActiveJilid('5');
                      setCurrentPageNum(1);
                    } else if (activeJilid === '5') {
                      setActiveJilid('6');
                      setCurrentPageNum(1);
                    } else if (activeJilid === '6') {
                      onBack();
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-101"
                >
                  <Sparkles size={16} />
                  <span>
                    {activeJilid === '1'
                      ? 'Buka Iqra Jilid 2 Sekarang 🚀'
                      : activeJilid === '2'
                      ? 'Buka Iqra Jilid 3 Sekarang 🚀'
                      : activeJilid === '3'
                      ? 'Buka Iqra Jilid 4 Sekarang 🚀'
                      : activeJilid === '4'
                      ? 'Buka Iqra Jilid 5 Sekarang 🚀'
                      : activeJilid === '5'
                      ? 'Buka Iqra Jilid 6 Sekarang 🚀'
                      : 'Buka Tilawah Mushaf Al-Qur`an 30 Juz 🚀'}
                  </span>
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

      {/* ========================================================= */}
      {/* MODAL 4: MILESTONE MINI-GAME ARENA (TIAP 5 HALAMAN)       */}
      {/* ========================================================= */}
      <IqraMilestoneGameModal
        isOpen={showMilestoneGameModal}
        onClose={() => setShowMilestoneGameModal(false)}
        activeJilid={activeJilid}
        pageNumber={currentPageNum}
        childId={childId}
        speakArabic={speakArabic}
        onEarnReward={(stars, xp) => {
          StorageService.recordPoints(
            childId,
            'IQRA_LESSON',
            xp,
            stars,
            `Juara Mini-Game Milestone Hal ${currentPageNum} (Jilid ${activeJilid})`,
            'iqra',
            `milestone-game-${activeJilid}-p${currentPageNum}`
          );
          playSuccessFanfare();
        }}
      />
    </div>
  );
};
