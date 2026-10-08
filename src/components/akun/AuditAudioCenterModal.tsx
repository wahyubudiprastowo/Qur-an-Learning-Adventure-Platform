import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Copy,
  Check,
  RotateCcw,
  Headphones,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
  Tag,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { AudioAuditFlag } from '../../types';
import { StorageService } from '../../services/storageService';
import { IQRA_CURRICULUM } from '../../data/iqraData';
import { IQRA_1_PAGES } from '../../data/iqraBook1Data';
import { IQRA_2_PAGES } from '../../data/iqraBook2Data';
import { IQRA_3_PAGES } from '../../data/iqraBook3Data';
import { IQRA_4_PAGES } from '../../data/iqraBook4Data';
import { IQRA_5_PAGES } from '../../data/iqraBook5Data';
import { IQRA_6_PAGES } from '../../data/iqraBook6Data';

interface AuditAudioCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AuditItem {
  id: string;
  jilid: string;
  pageNumber: number;
  rowIdx?: number;
  itemIdx?: number;
  arabic: string;
  latin: string;
  note?: string;
  isRed?: boolean;
}

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1.0] as const;

// Transliteration helper for items without manual latin
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
    '\u064E': 'a',
    '\u0650': 'i',
    '\u064F': 'u',
    '\u064B': 'an',
    '\u064D': 'in',
    '\u064C': 'un',
    '\u0652': '',
    '\u0670': 'aa',
  };

  let transliterated = '';
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const nextCh = clean[i + 1] || '';
    const next2Ch = clean[i + 2] || '';

    if (letters[ch]) {
      let lStr = letters[ch];
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

  return clean;
}

export const AuditAudioCenterModal: React.FC<AuditAudioCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Navigation & filter states
  const [selectedJilid, setSelectedJilid] = useState<string>('1');
  const [selectedPage, setSelectedPage] = useState<number | 'all'>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_review' | 'verified' | 'unflagged'>('all');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.5);

  // Audio Playback states
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const [playingGender, setPlayingGender] = useState<'male' | 'female' | null>(null);
  const [isABTestingId, setIsABTestingId] = useState<string | null>(null);

  // Flags from Storage
  const [flags, setFlags] = useState<Record<string, AudioAuditFlag>>(() =>
    StorageService.getAudioAuditFlags()
  );

  // Expandable active item for editing review notes
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [draftCategory, setDraftCategory] = useState<'harakat' | 'makhraj' | 'speed' | 'waqaf' | 'other'>('harakat');
  const [draftAffects, setDraftAffects] = useState<'both' | 'male_only' | 'female_only'>('both');
  const [draftNotes, setDraftNotes] = useState<string>('');

  // Toast / Copy notification
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Audio ref for timeout cancellations
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preferred voice preference sync
  const [globalVoiceGender, setGlobalVoiceGender] = useState<'male' | 'female'>(() =>
    StorageService.getPreferredVoiceGender()
  );

  const handleSetGlobalVoiceGender = (gender: 'male' | 'female') => {
    setGlobalVoiceGender(gender);
    StorageService.setPreferredVoiceGender(gender);
    setCopyToast(
      `Suara default aplikasi diubah ke ${gender === 'female' ? 'Ustadzah (Perempuan)' : 'Ustadz (Laki-laki)'} ✓`
    );
    setTimeout(() => setCopyToast(null), 3000);
  };

  // Refresh flags and voice gender from localStorage when opened
  useEffect(() => {
    if (isOpen) {
      setFlags(StorageService.getAudioAuditFlags());
      setGlobalVoiceGender(StorageService.getPreferredVoiceGender());
    }
  }, [isOpen]);

  // Clean speech helper (Strict Zero-Punctuation Regex Whitelist & Complete Phonetic Normalization)
  const cleanArabicText = useCallback((arabicText: string): string => {
    if (!arabicText) return '';

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
    if (
      clean.includes(':') &&
      (clean.includes('مـ') ||
        clean.includes('لا') ||
        clean.includes('ج') ||
        clean.includes('قلى') ||
        clean.includes('صلى') ||
        clean.includes('∴'))
    ) {
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

    // Tajwid adaptations
    clean = clean
      .replace(/مَجْر۪ىٰهَا/g, 'مَجْرَيْهَا')
      .replace(/ءَ۬اعْجَمِيٌّ/g, 'أَأَعْجَمِيٌّ')
      .replace(/لَا تَأْمَ۫نَّا/g, 'لَا تَأْمَنَّا')
      .replace(/أَحَدٌ ٱللَّهُ/g, 'أَحَدُنِ اللَّهُ')
      .replace(/بِئْسَ الاِسْمُ/g, 'بِئْسَ لِسْمُ')
      .replace(/مِنۢ بَعْدِ/g, 'مِمْ بَعْدِ') // Iqlab
      .replace(/هُۥ/g, 'هُو')
      .replace(/هِۦ/g, 'هِي')
      .replace(/ٱ/g, 'ا')
      .replace(/َـٰ/g, 'َا')
      .replace(/ـٰ/g, 'َا')
      .replace(/ـ/g, '')
      .replace(/[\u06D6-\u06ED]/g, ' ');

    const nameMap: Record<string, string> = {
      'الف': 'أَلِف',
      'باء': 'بَاء',
      'تاء': 'تَاء',
      'ثاء': 'ثَاء',
      'جيم': 'جِيم',
      'حاء': 'حَاء',
      'خاء': 'خَاء',
      'دال': 'دَال',
      'ذال': 'ذَال',
      'راء': 'رَاء',
      'زاي': 'زَاي',
      'سين': 'سِين',
      'شين': 'شِين',
      'صاد': 'صَاد',
      'ضاد': 'ضَاد',
      'طاء': 'طَاء',
      'ظاء': 'ظَاء',
      'عين': 'عَيْن',
      'غين': 'غَيْن',
      'فاء': 'فَاء',
      'قاف': 'قَاف',
      'كاف': 'كَاف',
      'لام': 'لَام',
      'ميم': 'مِيم',
      'نون': 'نُون',
      'واو': 'وَاو',
      'هاء': 'هَاء',
      'همزة': 'هَمْزَة',
      'ياء': 'يَاء',
    };

    for (const [k, v] of Object.entries(nameMap)) {
      const regex = new RegExp(`\\b${k}\\b`, 'g');
      clean = clean.replace(regex, v);
    }

    // Single Hijaiyah names if unvocalized
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

    // STRICT: Only Arabic letters, Harakat, and spaces!
    clean = clean.replace(/[^ \u0621-\u064A\u0671\u064B-\u0652\u0670]/g, ' ');
    clean = clean.replace(/\s+/g, ' ').trim();
    return clean;
  }, []);

  // Play audio in specific gender with completion callback
  const playArabicAudio = useCallback(
    (
      text: string,
      gender: 'male' | 'female',
      speed: number = playbackSpeed,
      onComplete?: () => void
    ) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        if (onComplete) onComplete();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const clean = cleanArabicText(text);

        if (!clean) {
          if (onComplete) onComplete();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = 'ar-SA';

        const mappedRate =
          speed === 0.25
            ? 0.35
            : speed === 0.5
            ? 0.55
            : speed === 0.75
            ? 0.75
            : speed === 1.0
            ? 0.95
            : 1.25;

        utterance.rate = mappedRate;

        const voices = window.speechSynthesis.getVoices();
        const arabicVoices = voices.filter(
          (v) =>
            v.lang.startsWith('ar') ||
            v.lang.includes('SA') ||
            v.name.toLowerCase().includes('arabic')
        );

        let selectedVoice: SpeechSynthesisVoice | undefined;
        if (gender === 'female') {
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
          utterance.pitch = 1.22;
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
          utterance.pitch = 0.88;
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        let done = false;
        const finish = () => {
          if (!done) {
            done = true;
            if (onComplete) onComplete();
          }
        };

        utterance.onend = finish;
        utterance.onerror = finish;

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
        if (onComplete) onComplete();
      }
    },
    [cleanArabicText, playbackSpeed]
  );

  // Play single voice
  const handlePlayVoice = (item: AuditItem, gender: 'male' | 'female') => {
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
      audioTimeoutRef.current = null;
    }
    setIsABTestingId(null);
    setPlayingItemId(item.id);
    setPlayingGender(gender);

    playArabicAudio(item.arabic, gender, playbackSpeed, () => {
      setPlayingItemId((cur) => (cur === item.id ? null : cur));
      setPlayingGender(null);
    });
  };

  // Side-by-side A/B Test (Plays Ustadzah, waits pause, then plays Ustadz)
  const handleABTest = (item: AuditItem) => {
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
      audioTimeoutRef.current = null;
    }
    setIsABTestingId(item.id);
    setPlayingItemId(item.id);
    setPlayingGender('female');

    // 1. Play Ustadzah
    playArabicAudio(item.arabic, 'female', playbackSpeed, () => {
      setPlayingGender(null);
      // Pause 750ms before Ustadz
      audioTimeoutRef.current = setTimeout(() => {
        setPlayingGender('male');
        // 2. Play Ustadz
        playArabicAudio(item.arabic, 'male', playbackSpeed, () => {
          setPlayingItemId(null);
          setPlayingGender(null);
          setIsABTestingId(null);
        });
      }, 750);
    });
  };

  // Stop playback when modal closes or unmounts
  useEffect(() => {
    return () => {
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Compile full items list for active Jilid
  const allJilidItems: AuditItem[] = useMemo(() => {
    if (selectedJilid === 'A') {
      const curriculumA = IQRA_CURRICULUM.filter((c) => c.jilid === 'A');
      return curriculumA.map((item, idx) => ({
        id: `iqra-a-item-${idx}`,
        jilid: 'A',
        pageNumber: 1,
        arabic: item.arabic,
        latin: item.latin,
        note: `${item.title} • ${item.description}`,
      }));
    }

    const getPagesForJilid = (jilid: string) => {
      switch (jilid) {
        case '1': return IQRA_1_PAGES;
        case '2': return IQRA_2_PAGES;
        case '3': return IQRA_3_PAGES;
        case '4': return IQRA_4_PAGES;
        case '5': return IQRA_5_PAGES;
        case '6': return IQRA_6_PAGES;
        default: return IQRA_1_PAGES;
      }
    };

    const pages = getPagesForJilid(selectedJilid);
    const list: AuditItem[] = [];

    pages.forEach((page) => {
      // Header preview as reference item if present
      if (page.headerPreview) {
        list.push({
          id: `${page.id}-header`,
          jilid: selectedJilid,
          pageNumber: page.pageNumber,
          arabic: page.headerPreview.arabic,
          latin: page.headerPreview.latin,
          note: `Contoh Utama: ${page.title}`,
        });
      }

      // Rows items
      page.rows.forEach((row, rIdx) => {
        row.items.forEach((item, iIdx) => {
          list.push({
            id: `${page.id}-r${rIdx}-i${iIdx}`,
            jilid: selectedJilid,
            pageNumber: page.pageNumber,
            rowIdx: rIdx,
            itemIdx: iIdx,
            arabic: item.arabic,
            latin: item.latin || getArabicLatinGuide(item.arabic),
            note: row.note || (page.instruction ? `Kaidah: ${page.instruction}` : undefined),
            isRed: item.isRed,
          });
        });
      });
    });

    return list;
  }, [selectedJilid]);

  // Available pages for current Jilid
  const availablePages = useMemo(() => {
    if (selectedJilid === 'A') return [1];
    const set = new Set<number>();
    allJilidItems.forEach((it) => set.add(it.pageNumber));
    return Array.from(set).sort((a, b) => a - b);
  }, [selectedJilid, allJilidItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return allJilidItems.filter((item) => {
      // Page filter
      if (selectedPage !== 'all' && item.pageNumber !== selectedPage) {
        return false;
      }

      // Status filter
      const flag = flags[item.id];
      if (statusFilter === 'needs_review' && flag?.status !== 'needs_review') {
        return false;
      }
      if (statusFilter === 'verified' && flag?.status !== 'verified') {
        return false;
      }
      if (statusFilter === 'unflagged' && flag !== undefined) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchArabic = item.arabic.includes(q);
        const matchLatin = item.latin.toLowerCase().includes(q);
        const matchNote = item.note ? item.note.toLowerCase().includes(q) : false;
        const matchFlagNotes = flag?.notes ? flag.notes.toLowerCase().includes(q) : false;
        if (!matchArabic && !matchLatin && !matchNote && !matchFlagNotes) {
          return false;
        }
      }

      return true;
    });
  }, [allJilidItems, selectedPage, statusFilter, searchQuery, flags]);

  // Statistics
  const stats = useMemo(() => {
    const totalFlags = Object.values(flags);
    const needsReviewCount = totalFlags.filter((f) => f.status === 'needs_review').length;
    const verifiedCount = totalFlags.filter((f) => f.status === 'verified').length;
    return {
      totalFlagsCount: totalFlags.length,
      needsReviewCount,
      verifiedCount,
      totalCurrentListed: filteredItems.length,
    };
  }, [flags, filteredItems]);

  // Quick flag as Verified
  const handleMarkVerified = (item: AuditItem) => {
    const newFlag: AudioAuditFlag = {
      id: item.id,
      jilid: item.jilid,
      pageNumber: item.pageNumber,
      arabic: item.arabic,
      latin: item.latin,
      status: 'verified',
      affectsVoice: 'both',
      notes: 'Lafal telah diverifikasi akurat oleh penguji.',
      flaggedAt: new Date().toISOString(),
    };
    StorageService.saveAudioAuditFlag(newFlag);
    setFlags((prev) => ({ ...prev, [item.id]: newFlag }));
    setEditingItemId(null);
  };

  // Open / toggle review editor
  const handleOpenReviewEditor = (item: AuditItem) => {
    if (editingItemId === item.id) {
      setEditingItemId(null);
      return;
    }
    const existing = flags[item.id];
    setDraftCategory(existing?.issueCategory || 'harakat');
    setDraftAffects(existing?.affectsVoice || 'both');
    setDraftNotes(existing?.notes || '');
    setEditingItemId(item.id);
  };

  // Save review note flag
  const handleSaveReviewFlag = (item: AuditItem) => {
    const newFlag: AudioAuditFlag = {
      id: item.id,
      jilid: item.jilid,
      pageNumber: item.pageNumber,
      arabic: item.arabic,
      latin: item.latin,
      status: 'needs_review',
      issueCategory: draftCategory,
      affectsVoice: draftAffects,
      notes: draftNotes.trim() || 'Perlu evaluasi makhraj / harakat pada lafal ini.',
      flaggedAt: new Date().toISOString(),
    };
    StorageService.saveAudioAuditFlag(newFlag);
    setFlags((prev) => ({ ...prev, [item.id]: newFlag }));
    setEditingItemId(null);
  };

  // Remove flag completely
  const handleRemoveFlag = (itemId: string) => {
    StorageService.removeAudioAuditFlag(itemId);
    setFlags((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setEditingItemId(null);
  };

  // Copy full audit report summary to clipboard
  const handleCopyReport = () => {
    const flaggedList = Object.values(flags).filter((f) => f.status === 'needs_review');
    if (flaggedList.length === 0) {
      setCopyToast('Belum ada item yang ditandai perlu review.');
      setTimeout(() => setCopyToast(null), 3000);
      return;
    }

    const reportText = [
      '==========================================',
      '📋 LAPORAN AUDIT AUDIO IQRA (CAHAYA TAHFIZ)',
      `Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`,
      `Total Item Perlu Evaluasi: ${flaggedList.length} item`,
      '==========================================\n',
      ...flaggedList.map((f, i) => {
        const affects =
          f.affectsVoice === 'male_only'
            ? 'Hanya Ustadz'
            : f.affectsVoice === 'female_only'
            ? 'Hanya Ustadzah'
            : 'Kedua Suara';
        return `${i + 1}. [Jilid ${f.jilid} - Hal. ${f.pageNumber}]
Teks Arab: ${f.arabic}
Latin: ${f.latin}
Kategori: ${f.issueCategory || 'Umum'}
Suara Terdampak: ${affects}
Catatan Reviewer: ${f.notes || '-'}
------------------------------------------`;
      }),
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(reportText);
      setCopyToast(`Laporan ${flaggedList.length} item tersalin ke clipboard! ✓`);
      setTimeout(() => setCopyToast(null), 3500);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-5xl bg-[#FFFDF7] border-2 border-[#D8C7A5] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Top Header */}
          <div className="relative bg-gradient-to-r from-[#164C68] via-[#103a50] to-[#0c2e3f] text-white p-5 border-b border-cyan-800/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 flex items-center justify-center text-2xl font-black shadow-md shrink-0">
                🎧
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black font-heading tracking-tight">
                    Audit Audio Center
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                    Kalibrasi Suara
                  </span>
                </div>
                <p className="text-xs text-cyan-200 font-medium mt-0.5 max-w-xl">
                  Bandingkan pelafalan Ustadz & Ustadzah secara berdampingan, uji kecepatan santai, dan tandai lafal yang perlu penyesuaian.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
                title="Salin rekap item yang ditandai evaluasi"
              >
                <Copy size={14} />
                <span>Salin Laporan ({stats.needsReviewCount})</span>
              </button>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Statistics & Notification Bar */}
          <div className="bg-[#FAF6EC] border-b border-[#E8DFC9] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-[#5B492B]">
                Total Tercakup: <strong>{stats.totalCurrentListed} lafal</strong>
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} />
                Tervalidasi: <strong>{stats.verifiedCount}</strong>
              </span>
              <span>•</span>
              <span className="text-amber-800 font-bold flex items-center gap-1">
                <AlertTriangle size={13} className="text-amber-600" />
                Perlu Evaluasi: <strong>{stats.needsReviewCount}</strong>
              </span>
            </div>

            {copyToast && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5"
              >
                <Check size={12} />
                <span>{copyToast}</span>
              </motion.div>
            )}

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Preferred Global Voice Default */}
              <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-xl border border-[#DDD0B7]">
                <span className="text-[10px] font-black text-[#8C7A5B] uppercase">
                  Suara Utama:
                </span>
                <button
                  type="button"
                  onClick={() => handleSetGlobalVoiceGender('female')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                    globalVoiceGender === 'female'
                      ? 'bg-pink-600 text-white shadow-2xs font-black'
                      : 'text-pink-900 hover:bg-pink-50'
                  }`}
                  title="Pilih Suara Ustadzah (Perempuan) sebagai suara utama aplikasi"
                >
                  <span>👩</span>
                  <span>Ustadzah</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetGlobalVoiceGender('male')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                    globalVoiceGender === 'male'
                      ? 'bg-emerald-600 text-white shadow-2xs font-black'
                      : 'text-emerald-900 hover:bg-emerald-50'
                  }`}
                  title="Pilih Suara Ustadz (Laki-laki) sebagai suara utama aplikasi"
                >
                  <span>👨</span>
                  <span>Ustadz</span>
                </button>
              </div>

              {/* Playback Speed Quick Control */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black text-[#8C7A5B] uppercase mr-1">
                  Speed:
                </span>
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                      playbackSpeed === speed
                        ? 'bg-[#164C68] text-white shadow-2xs'
                        : 'bg-white text-[#5B492B] border border-[#DDD0B7] hover:bg-amber-100/50'
                    }`}
                    title={`${speed}x kecepatan`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Control Filter Bar */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#E8DFC9] space-y-3">
            {/* Jilid Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {(['1', '2', '3', '4', '5', '6', 'A'] as const).map((jilid) => {
                const isSelected = selectedJilid === jilid;
                return (
                  <button
                    key={jilid}
                    onClick={() => {
                      setSelectedJilid(jilid);
                      setSelectedPage(1);
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#08B9EF] to-[#0284c7] text-white shadow-md shadow-cyan-500/20'
                        : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefc] border border-[#C9E1ED]'
                    }`}
                  >
                    <span>{jilid === 'A' ? 'Jilid A (Hijaiyah)' : `Iqra' Jilid ${jilid}`}</span>
                  </button>
                );
              })}
            </div>

            {/* Secondary Controls: Page picker, Search, Status Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              {/* Page Selector */}
              {selectedJilid !== 'A' && (
                <div className="sm:col-span-4 flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (typeof selectedPage === 'number' && selectedPage > 1) {
                        setSelectedPage(selectedPage - 1);
                      }
                    }}
                    disabled={selectedPage === 1 || selectedPage === 'all'}
                    className="p-2 rounded-xl bg-[#FAF6EC] border border-[#E8DFC9] text-[#5B492B] hover:bg-amber-100/60 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <select
                    value={selectedPage}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedPage(val === 'all' ? 'all' : parseInt(val, 10));
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DFC9] text-xs font-bold text-[#5B492B] focus:outline-hidden focus:ring-2 focus:ring-[#08B9EF] cursor-pointer"
                  >
                    <option value="all">Semua Halaman (Jilid {selectedJilid})</option>
                    {availablePages.map((pageNum) => (
                      <option key={pageNum} value={pageNum}>
                        Halaman {pageNum}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      if (
                        typeof selectedPage === 'number' &&
                        selectedPage < availablePages[availablePages.length - 1]
                      ) {
                        setSelectedPage(selectedPage + 1);
                      }
                    }}
                    disabled={
                      selectedPage === availablePages[availablePages.length - 1] ||
                      selectedPage === 'all'
                    }
                    className="p-2 rounded-xl bg-[#FAF6EC] border border-[#E8DFC9] text-[#5B492B] hover:bg-amber-100/60 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Search input */}
              <div className={`${selectedJilid === 'A' ? 'sm:col-span-8' : 'sm:col-span-5'} relative`}>
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari huruf Arab, transliterasi Latin, kata..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DFC9] text-xs text-[#5B492B] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#08B9EF]"
                />
              </div>

              {/* Status Filter */}
              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6EC] border border-[#E8DFC9] text-xs font-bold text-[#5B492B] focus:outline-hidden focus:ring-2 focus:ring-[#08B9EF] cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="needs_review">⚠️ Perlu Evaluasi</option>
                  <option value="verified">✓ Tervalidasi</option>
                  <option value="unflagged">Belum Ditandai</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items Comparison List Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[#FFFDF7]">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#DDD0B7] space-y-2">
                <span className="text-3xl block">🔍</span>
                <h4 className="text-sm font-bold text-[#5B492B]">Tidak Ada Lafal yang Cocok</h4>
                <p className="text-xs text-[#8C7A5B] max-w-sm mx-auto">
                  Coba ubah kata kunci pencarian, filter halaman, atau pilih kategori status evaluasi lainnya.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const flag = flags[item.id];
                const isItemPlaying = playingItemId === item.id;
                const isEditing = editingItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-3xl p-4 sm:p-5 border-2 transition-all shadow-xs ${
                      flag?.status === 'needs_review'
                        ? 'border-amber-400 bg-amber-50/20'
                        : flag?.status === 'verified'
                        ? 'border-emerald-400/80 bg-emerald-50/15'
                        : 'border-[#E2D6BF] hover:border-[#08B9EF]'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Arabic Script & Phonetic Guide */}
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          dir="rtl"
                          className="min-w-[120px] max-w-[280px] p-3 rounded-2xl bg-[#FFFDF7] border border-[#E2D6BF] text-center select-none shadow-2xs"
                        >
                          <span
                            className={`font-quran text-3xl sm:text-4xl font-bold leading-relaxed block ${
                              item.isRed ? 'text-[#C53030]' : 'text-[#164C68]'
                            }`}
                          >
                            {item.arabic}
                          </span>
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.2 rounded-full">
                              Jilid {item.jilid} • Hal. {item.pageNumber}
                            </span>

                            {flag?.status === 'needs_review' && (
                              <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-200 px-2 py-0.2 rounded-full flex items-center gap-1">
                                <AlertTriangle size={11} className="text-amber-800" />
                                <span>Perlu Evaluasi</span>
                              </span>
                            )}

                            {flag?.status === 'verified' && (
                              <span className="text-[10px] font-black uppercase text-emerald-900 bg-emerald-200 px-2 py-0.2 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={11} className="text-emerald-700" />
                                <span>Tervalidasi ✓</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-black text-[#164C68] font-heading">
                            {item.latin}
                          </h3>

                          {item.note && (
                            <p className="text-xs text-[#8C7A5B] font-medium line-clamp-2">
                              💡 {item.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Side-by-Side Male/Female Audio Player & A/B Contrast */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {/* 1. Suara Ustadzah (Perempuan) */}
                        <button
                          type="button"
                          onClick={() => handlePlayVoice(item, 'female')}
                          className={`px-3 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border ${
                            isItemPlaying && playingGender === 'female'
                              ? 'bg-pink-600 text-white border-pink-700 ring-2 ring-pink-300 scale-102'
                              : 'bg-pink-50 hover:bg-pink-100 text-pink-900 border-pink-200'
                          }`}
                          title="Dengarkan Suara Ustadzah (Perempuan - Nada Cerah & Lembut)"
                        >
                          <span className="text-base">👩</span>
                          <span>Ustadzah</span>
                          {isItemPlaying && playingGender === 'female' ? (
                            <span className="flex items-center gap-0.5 ml-1 h-3">
                              <span className="w-0.5 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                              <span className="w-0.5 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                              <span className="w-0.5 h-2 bg-white rounded-full animate-bounce" />
                            </span>
                          ) : (
                            <Volume2 size={14} className="text-pink-600 ml-0.5" />
                          )}
                        </button>

                        {/* 2. Suara Ustadz (Laki-laki) */}
                        <button
                          type="button"
                          onClick={() => handlePlayVoice(item, 'male')}
                          className={`px-3 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border ${
                            isItemPlaying && playingGender === 'male'
                              ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300 scale-102'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                          }`}
                          title="Dengarkan Suara Ustadz (Laki-laki - Nada Mantap & Berwibawa)"
                        >
                          <span className="text-base">👨</span>
                          <span>Ustadz</span>
                          {isItemPlaying && playingGender === 'male' ? (
                            <span className="flex items-center gap-0.5 ml-1 h-3">
                              <span className="w-0.5 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                              <span className="w-0.5 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                              <span className="w-0.5 h-2 bg-white rounded-full animate-bounce" />
                            </span>
                          ) : (
                            <Volume2 size={14} className="text-emerald-600 ml-0.5" />
                          )}
                        </button>

                        {/* 3. A/B Test Button (Plays both consecutively) */}
                        <button
                          type="button"
                          onClick={() => handleABTest(item)}
                          className={`px-3 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border ${
                            isABTestingId === item.id
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-700 animate-pulse'
                              : 'bg-[#EEF8FF] hover:bg-[#d8eefc] text-[#164C68] border-[#C9E1ED]'
                          }`}
                          title="Bandingkan langsung: Putar Ustadzah, jeda sesaat, lalu putar Ustadz secara otomatis"
                        >
                          <RefreshCw size={13} className={isABTestingId === item.id ? 'animate-spin' : ''} />
                          <span>A/B Uji Cepat</span>
                        </button>

                        {/* 4. Action: Mark Verified / Review */}
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            type="button"
                            onClick={() => handleMarkVerified(item)}
                            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              flag?.status === 'verified'
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                                : 'bg-white hover:bg-emerald-50 text-emerald-700 border-[#DDD0B7]'
                            }`}
                            title="Tandai pelafalan sudah sesuai & akurat"
                          >
                            <CheckCircle2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenReviewEditor(item)}
                            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              flag?.status === 'needs_review'
                                ? 'bg-amber-500 text-amber-950 border-amber-600 shadow-2xs'
                                : 'bg-white hover:bg-amber-50 text-amber-800 border-[#DDD0B7]'
                            }`}
                            title="Buka form catatan evaluasi lafal"
                          >
                            <AlertTriangle size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Review Notes Display (if flagged) */}
                    {flag?.status === 'needs_review' && !isEditing && (
                      <div className="mt-3 pt-3 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">📝 Catatan Evaluator:</span>
                          <span className="italic">"{flag.notes}"</span>
                          <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                            Kategori: {flag.issueCategory}
                          </span>
                          <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-bold">
                            Suara:{' '}
                            {flag.affectsVoice === 'male_only'
                              ? 'Hanya Ustadz'
                              : flag.affectsVoice === 'female_only'
                              ? 'Hanya Ustadzah'
                              : 'Kedua Suara'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenReviewEditor(item)}
                            className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                          >
                            Ubah Catatan
                          </button>
                          <button
                            onClick={() => handleRemoveFlag(item.id)}
                            className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                          >
                            Hapus Tanda
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expandable Review Editor Form */}
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3.5 pt-3.5 border-t border-[#DDD0B7] space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs font-black text-[#5B492B]">
                          <span>Form Evaluasi Pelafalan & Makhraj</span>
                          <span className="text-[10px] font-semibold text-[#8C7A5B]">
                            Item: {item.arabic} ({item.latin})
                          </span>
                        </div>

                        {/* Category Selector */}
                        <div>
                          <label className="text-[11px] font-bold text-[#5B492B] block mb-1">
                            Kategori Masalah Pelafalan:
                          </label>
                          <div className="flex gap-1.5 flex-wrap">
                            {[
                              { id: 'harakat', label: 'Harakat Kurang Pas' },
                              { id: 'makhraj', label: 'Makhraj Huruf' },
                              { id: 'waqaf', label: 'Kaidah Waqaf / Tajwid' },
                              { id: 'speed', label: 'Kecepatan / Pacing' },
                              { id: 'other', label: 'Lainnya' },
                            ].map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setDraftCategory(cat.id as any)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  draftCategory === cat.id
                                    ? 'bg-amber-500 text-amber-950 ring-2 ring-amber-300 font-black'
                                    : 'bg-[#FAF6EC] text-[#5B492B] border border-[#DDD0B7] hover:bg-amber-100/50'
                                }`}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Voice Affected */}
                        <div>
                          <label className="text-[11px] font-bold text-[#5B492B] block mb-1">
                            Suara yang Perlu Disesuaikan:
                          </label>
                          <div className="flex gap-1.5 flex-wrap">
                            {[
                              { id: 'both', label: 'Kedua Suara (Ustadz & Ustadzah)' },
                              { id: 'female_only', label: 'Hanya Suara Ustadzah' },
                              { id: 'male_only', label: 'Hanya Suara Ustadz' },
                            ].map((v) => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => setDraftAffects(v.id as any)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  draftAffects === v.id
                                    ? 'bg-[#164C68] text-white font-black'
                                    : 'bg-[#FAF6EC] text-[#5B492B] border border-[#DDD0B7] hover:bg-amber-100/50'
                                }`}
                              >
                                {v.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Notes input & Quick tags */}
                        <div>
                          <label className="text-[11px] font-bold text-[#5B492B] block mb-1">
                            Detail Catatan Evaluasi:
                          </label>
                          <textarea
                            rows={2}
                            value={draftNotes}
                            onChange={(e) => setDraftNotes(e.target.value)}
                            placeholder="Contoh: Bunyi kasrah kurang tajam, vokal agak tertahan, atau mad perlu lebih panjang 2 ketukan..."
                            className="w-full p-2.5 rounded-xl bg-white border border-[#DDD0B7] text-xs text-[#5B492B] focus:outline-hidden focus:ring-2 focus:ring-amber-400 placeholder-slate-400"
                          />

                          {/* Quick suggestions */}
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-[#8C7A5B]">Template Cepat:</span>
                            {[
                              'Bunyi kasrah kurang tajam',
                              'Makhraj huruf kurang jelas',
                              'Ghunnah dengung kurang 2 ketukan',
                              'Sukun memantul qalqalah',
                              'Waqaf akhir ayat disukunkan',
                            ].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() =>
                                  setDraftNotes((cur) => (cur ? `${cur}. ${tag}` : tag))
                                }
                                className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-100/70 hover:bg-amber-200 text-amber-900 font-semibold cursor-pointer"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Save & Cancel buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          {flag && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFlag(item.id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              Hapus Evaluasi
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingItemId(null)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveReviewFlag(item)}
                            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs shadow-xs cursor-pointer"
                          >
                            Simpan Catatan Evaluasi 💾
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Footer Action Bar */}
          <div className="bg-[#FAF6EC] border-t border-[#E8DFC9] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#5B492B]">
              <Headphones size={15} className="text-[#08B9EF]" />
              <span className="font-semibold">
                Audit Audio Center tersinkronisasi otomatis dengan preferensi suara modul Iqra.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="px-4 py-2 rounded-2xl bg-white border border-[#DDD0B7] hover:bg-amber-50 text-[#5B492B] font-bold cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Copy size={14} />
                <span>Salin Rekap Catatan ({stats.needsReviewCount})</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-2xl bg-[#164C68] hover:bg-[#103a50] text-white font-black cursor-pointer shadow-xs transition-all"
              >
                Tutup Audit Center
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
