import {
  LearningNode,
  LearningNodeKind,
  LearningNodeStatus,
  NodeMasteryState,
  LearningGraph,
} from '../types';
import { IQRA_1_PAGES } from './iqraBook1Data';
import { IQRA_2_PAGES } from './iqraBook2Data';
import { IQRA_3_PAGES } from './iqraBook3Data';
import { IQRA_4_PAGES } from './iqraBook4Data';
import { IQRA_5_PAGES } from './iqraBook5Data';
import { IQRA_6_PAGES } from './iqraBook6Data';
import { IQRA_CURRICULUM } from './iqraData';
import { TAJWID_CURRICULUM } from './tajwidData';
import { MEMORIZATION_BLOCKS } from './blocksData';
import { QURAN_VOCABULARY_LIST, MUFRODAT_LEVELS } from './vocabularyData';
import { SURAHS_METADATA } from './surahsMetadata';

// -------------------------------------------------------------
// 1. IQRA PAGES & MILESTONES (182 Pages + 6 Jilid Milestones)
// -------------------------------------------------------------
const allIqraBooks = [
  { jilid: 1, pages: IQRA_1_PAGES, difficulty: 1 as const },
  { jilid: 2, pages: IQRA_2_PAGES, difficulty: 2 as const },
  { jilid: 3, pages: IQRA_3_PAGES, difficulty: 2 as const },
  { jilid: 4, pages: IQRA_4_PAGES, difficulty: 3 as const },
  { jilid: 5, pages: IQRA_5_PAGES, difficulty: 4 as const },
  { jilid: 6, pages: IQRA_6_PAGES, difficulty: 5 as const },
];

const generatedIqraPageNodes: LearningNode[] = [];

// Jilid Milestone nodes
export const IQRA_JILID_MILESTONES: LearningNode[] = [
  {
    nodeId: 'iqra-jilid-1',
    kind: 'iqra_page',
    title: 'Milestone Khatam Iqra 1',
    subtitle: '32 Halaman Tuntas',
    description: 'Menguasai seluruh huruf tunggal Hijaiyah berharakat fathah dengan lancar dan tegas.',
    difficulty: 1,
    bookNumber: 1,
    prereq: ['iqra-1-p32'],
    category: 'Iqra Milestone',
    tags: ['khatam', 'iqra1', 'fathah'],
    xpReward: 150,
    starsReward: 15,
  },
  {
    nodeId: 'iqra-jilid-2',
    kind: 'iqra_page',
    title: 'Milestone Khatam Iqra 2',
    subtitle: '30 Halaman Tuntas',
    description: 'Menguasai huruf sambung 2-3 huruf dan pengenalan bacaan panjang Mad Fathah (Alif maddiyyah 2 harakat).',
    difficulty: 2,
    bookNumber: 2,
    prereq: ['iqra-2-p30'],
    category: 'Iqra Milestone',
    tags: ['khatam', 'iqra2', 'sambung', 'mad-fathah'],
    xpReward: 200,
    starsReward: 20,
  },
  {
    nodeId: 'iqra-jilid-3',
    kind: 'iqra_page',
    title: 'Milestone Khatam Iqra 3',
    subtitle: '30 Halaman Tuntas',
    description: 'Menguasai harakat Kasrah, Dhommah, Mad Wawu, Mad Ya, serta Tanwin (An-In-Un).',
    difficulty: 2,
    bookNumber: 3,
    prereq: ['iqra-3-p30'],
    category: 'Iqra Milestone',
    tags: ['khatam', 'iqra3', 'kasrah', 'dhommah', 'tanwin'],
    xpReward: 250,
    starsReward: 25,
  },
  {
    nodeId: 'iqra-jilid-4',
    kind: 'iqra_page',
    title: 'Milestone Khatam Iqra 4',
    subtitle: '30 Halaman Tuntas',
    description: 'Menguasai sukun, pantulan qalqalah (Baju Di Toko), dan huruf sambung variatif.',
    difficulty: 3,
    bookNumber: 4,
    prereq: ['iqra-4-p30'],
    category: 'Iqra Milestone',
    tags: ['khatam', 'iqra4', 'sukun', 'qalqalah'],
    xpReward: 300,
    starsReward: 30,
  },
  {
    nodeId: 'iqra-jilid-5',
    kind: 'iqra_page',
    title: 'Milestone Khatam Iqra 5',
    subtitle: '30 Halaman Tuntas',
    description: 'Menguasai Alif Lam Qamariyah & Syamsiyah, tanda bendera mad 4-5 harakat, dan waqaf.',
    difficulty: 4,
    bookNumber: 5,
    prereq: ['iqra-5-p30'],
    category: 'Iqra Milestone',
    tags: ['khatam', 'iqra5', 'aliflam', 'waqaf'],
    xpReward: 350,
    starsReward: 35,
  },
  {
    nodeId: 'iqra-jilid-6',
    kind: 'iqra_page',
    title: 'Milestone Khatam Iqra 6 (Wisuda)',
    subtitle: '30 Halaman Tuntas - Siap Baca Mushaf',
    description: 'Menguasai hukum tajwid nun sukun/tanwin, rambu waqaf Rasm Utsmani, dan ayat gharib.',
    difficulty: 5,
    bookNumber: 6,
    prereq: ['iqra-6-p30'],
    category: 'Iqra Milestone',
    tags: ['wisuda', 'iqra6', 'khatam-total', 'siap-mushaf'],
    xpReward: 500,
    starsReward: 50,
  },
];

// Populate 182 Iqra page nodes with sequential prerequisites
allIqraBooks.forEach((book, bookIdx) => {
  book.pages.forEach((page, pageIdx) => {
    const prereq: string[] = [];
    if (pageIdx > 0) {
      prereq.push(book.pages[pageIdx - 1].id);
    } else if (bookIdx > 0) {
      // First page of Jilid 2+ requires the previous Jilid milestone
      prereq.push(IQRA_JILID_MILESTONES[bookIdx - 1].nodeId);
    }

    generatedIqraPageNodes.push({
      nodeId: page.id,
      kind: 'iqra_page',
      title: `Iqra ${book.jilid} : Halaman ${page.pageNumber}`,
      subtitle: page.title,
      description: page.instruction || `Latihan membaca Iqra jilid ${book.jilid} halaman ${page.pageNumber}`,
      difficulty: book.difficulty,
      bookNumber: book.jilid,
      pageNumber: page.pageNumber,
      prereq,
      category: `Iqra Jilid ${book.jilid}`,
      arabic: page.headerPreview?.arabic || (page.focusLetters ? page.focusLetters.join(' - ') : undefined),
      transliteration: page.headerPreview?.latin,
      tags: ['iqra', `jilid-${book.jilid}`, `hal-${page.pageNumber}`],
      xpReward: 30 + book.jilid * 5,
      starsReward: 3,
    });
  });
});

// Letter nodes from Iqra Curriculum (Jilid A basics)
const iqraLetterNodes: LearningNode[] = IQRA_CURRICULUM.map((item, idx) => ({
  nodeId: item.nodeId || `iqra-item-${item.id}`,
  kind: 'iqra_letter',
  title: item.title,
  subtitle: item.latin,
  description: item.description,
  difficulty: (item.difficulty as 1 | 2 | 3 | 4 | 5) || 1,
  prereq: item.prereq || (idx > 0 ? [IQRA_CURRICULUM[idx - 1].nodeId || `iqra-item-${IQRA_CURRICULUM[idx - 1].id}`] : []),
  category: `Iqra Dasar ${item.jilid}`,
  arabic: item.arabic,
  transliteration: item.soundExample,
  tags: ['iqra-letter', item.harakat],
  xpReward: 25,
  starsReward: 2,
}));

// -------------------------------------------------------------
// 2. TAJWID TOPICS (7 Existing + 5 Expansion = 12 Topics)
// -------------------------------------------------------------
const baseTajwidNodes: LearningNode[] = TAJWID_CURRICULUM.map((topic) => ({
  nodeId: topic.nodeId || `tajwid-${topic.id}`,
  kind: 'tajwid_topic',
  title: topic.name,
  subtitle: topic.meaning,
  description: topic.explanation,
  difficulty: (topic.difficulty as 1 | 2 | 3 | 4 | 5) || 2,
  prereq: topic.prereq || ['iqra-jilid-3'],
  topicId: topic.id,
  category: topic.category,
  arabic: topic.arabicName,
  tags: ['tajwid', topic.category.toLowerCase().replace(/[^a-z0-9]/g, '-')],
  xpReward: 80,
  starsReward: 8,
}));

// 5 additional Tajwid topics (Urutan 3 preview to make 12 total)
export const ADDITIONAL_TAJWID_NODES: LearningNode[] = [
  {
    nodeId: 'tajwid-mad-thabii',
    kind: 'tajwid_topic',
    title: 'Mad Thabi\'i (Mad Asli)',
    subtitle: 'Panjang 2 Harakat Alami',
    description: 'Alif setelah fathah, Wawu sukun setelah dhommah, dan Ya sukun setelah kasrah dibaca 2 harakat tetap.',
    difficulty: 2,
    prereq: ['iqra-jilid-3', 'tajwid-makharij'],
    topicId: 'mad-thabii',
    category: 'Mad',
    arabic: 'المد الطبيعي',
    tags: ['tajwid', 'mad', 'mad-thabii'],
    xpReward: 90,
    starsReward: 9,
  },
  {
    nodeId: 'tajwid-mad-wajib',
    kind: 'tajwid_topic',
    title: 'Mad Wajib Muttashil & Jaiz Munfashil',
    subtitle: 'Tanda Bendera 4-5 Harakat',
    description: 'Huruf mad bertemu hamzah dalam satu kata (Wajib) atau di kata terpisah (Jaiz), dibaca 4-5 ketukan.',
    difficulty: 3,
    prereq: ['tajwid-mad-thabii', 'iqra-jilid-5'],
    topicId: 'mad-wajib',
    category: 'Mad',
    arabic: 'المد المتصل والمنفصل',
    tags: ['tajwid', 'mad', 'bendera'],
    xpReward: 100,
    starsReward: 10,
  },
  {
    nodeId: 'tajwid-ghunnah-musyaddadah',
    kind: 'tajwid_topic',
    title: 'Ghunnah Musyaddadah (Nun & Mim Tasydid)',
    subtitle: 'Dengung 2 Harakat Mantap',
    description: 'Setiap huruf Nun bertasydid (نّ) atau Mim bertasydid (مّ) wajib didengungkan 2 harakat dengan indah.',
    difficulty: 2,
    prereq: ['iqra-jilid-2', 'tajwid-makharij'],
    topicId: 'ghunnah-musyaddadah',
    category: 'Nun Mati & Tanwin',
    arabic: 'الغنة المشددة',
    tags: ['tajwid', 'ghunnah', 'tasydid'],
    xpReward: 85,
    starsReward: 8,
  },
  {
    nodeId: 'tajwid-idzhar-syafawi',
    kind: 'tajwid_topic',
    title: 'Idzhar Syafawi (Hukum Mim Mati)',
    subtitle: 'Bibir Rapat Bunyi Jelas',
    description: 'Mim sukun (مْ) bertemu huruf selain Mim dan Ba, bibir dirapatkan dan dibaca jelas tanpa dengung.',
    difficulty: 3,
    prereq: ['tajwid-makharij', 'iqra-jilid-4'],
    topicId: 'idzhar-syafawi',
    category: 'Mim Mati',
    arabic: 'إظهار شفوي',
    tags: ['tajwid', 'mim-mati', 'syafawi'],
    xpReward: 90,
    starsReward: 9,
  },
  {
    nodeId: 'tajwid-ikhfa-syafawi',
    kind: 'tajwid_topic',
    title: 'Ikhfa Syafawi & Idgham Mimi',
    subtitle: 'Mim Sukun Samar & Melebur',
    description: 'Mim sukun bertemu Ba dibaca samar bibir sedikit terbuka, bertemu sesama Mim melebur berdengung.',
    difficulty: 3,
    prereq: ['tajwid-idzhar-syafawi'],
    topicId: 'ikhfa-syafawi',
    category: 'Mim Mati',
    arabic: 'إخفاء شفوي وإدغام متماثلين',
    tags: ['tajwid', 'mim-mati', 'ikhfa-syafawi'],
    xpReward: 95,
    starsReward: 9,
  },
];

// -------------------------------------------------------------
// 3. VOCABULARY WORDS & LEVEL MILESTONES (±424 Kata Mufrodat)
// -------------------------------------------------------------
const vocabNodes: LearningNode[] = [];

// Vocabulary Level Milestones
export const VOCAB_LEVEL_MILESTONES: LearningNode[] = MUFRODAT_LEVELS.map((lvl) => ({
  nodeId: `vocab-level-${lvl.levelNumber}-milestone`,
  kind: 'vocab_word',
  title: `Milestone Mufrodat Level ${lvl.levelNumber}`,
  subtitle: lvl.title,
  description: lvl.description,
  difficulty: (lvl.levelNumber as 1 | 2 | 3 | 4 | 5),
  prereq: lvl.levelNumber === 1 ? ['iqra-jilid-1'] : [`vocab-level-${lvl.levelNumber - 1}-milestone`],
  category: 'Mufrodat Milestone',
  tags: ['mufrodat', `level-${lvl.levelNumber}`, 'milestone'],
  xpReward: 150 + lvl.levelNumber * 25,
  starsReward: 15 + lvl.levelNumber * 2,
}));

// Curated words from QURAN_VOCABULARY_LIST
QURAN_VOCABULARY_LIST.forEach((word, idx) => {
  const levelNum = (idx < 10 ? 1 : idx < 20 ? 2 : idx < 30 ? 3 : 4) as 1 | 2 | 3 | 4 | 5;
  const prereq: string[] = [];
  if (idx === 0) {
    prereq.push('iqra-jilid-1');
  } else if (idx < 10) {
    prereq.push(`vocab-${idx}`); // previous vocab
  } else if (idx === 10) {
    prereq.push('vocab-level-1-milestone');
  } else {
    prereq.push(`vocab-${idx}`);
  }

  vocabNodes.push({
    nodeId: word.id,
    kind: 'vocab_word',
    title: word.transliteration,
    subtitle: word.meaningId,
    description: `Kata Al-Qur'an muncul ${word.occurrencesInQuran} kali. Contoh: Surah ${word.sampleAyah.surahName} [${word.sampleAyah.surahNumber}:${word.sampleAyah.ayahNumber}]`,
    difficulty: levelNum,
    prereq,
    surah: word.sampleAyah.surahNumber,
    ayah: word.sampleAyah.ayahNumber,
    category: `Mufrodat Level ${levelNum}`,
    arabic: word.arabic,
    transliteration: word.transliteration,
    translation: word.meaningId,
    tags: ['mufrodat', `level-${levelNum}`, word.rootWord],
    xpReward: 35,
    starsReward: 3,
  });
});

// -------------------------------------------------------------
// 4. HAFALAN BLOCKS (25 Surahs in Juz 30 + Al-Fatihah + Al-Kahf)
// -------------------------------------------------------------
const hafalanBlockNodes: LearningNode[] = [];

// Build sequential blocks across all surahs in MEMORIZATION_BLOCKS
const surahNumbers = Object.keys(MEMORIZATION_BLOCKS)
  .map(Number)
  .sort((a, b) => {
    // Priority order: 1 (Al-Fatihah) first, then short surahs descending (114 down to 93), then 67 (Al-Mulk), then 18 (Al-Kahf)
    if (a === 1) return -1;
    if (b === 1) return 1;
    if (a === 18) return 1;
    if (b === 18) return -1;
    if (a === 67) return 1;
    if (b === 67) return -1;
    return b - a; // Descending for Juz 30 (114 down to 93)
  });

let lastBlockNodeId = '';

surahNumbers.forEach((surahNum) => {
  const blocks = MEMORIZATION_BLOCKS[surahNum] || [];
  const surahMeta = SURAHS_METADATA.find((s) => s.number === surahNum);
  const surahName = surahMeta ? surahMeta.nameLatin : `Surah ${surahNum}`;

  blocks.forEach((block, bIdx) => {
    const blockNodeId = `hafalan-block-${block.id}`;
    const prereq: string[] = [];

    if (surahNum === 1 && bIdx === 0) {
      // Prompt explicitly specifies: "blok hafalan Al-Fatihah butuh 10 kata vocab level-1"
      prereq.push('vocab-1', 'vocab-2', 'vocab-3', 'iqra-jilid-1', 'tajwid-makharij');
    } else if (bIdx > 0) {
      // Next block within same surah requires previous block
      prereq.push(`hafalan-block-${blocks[bIdx - 1].id}`);
    } else if (lastBlockNodeId) {
      // First block of new surah requires last block of previous surah
      prereq.push(lastBlockNodeId);
      // Require tajwid rules as surah difficulty increases
      if (surahNum === 114) {
        prereq.push('tajwid-ikhfa');
      } else if (surahNum === 113) {
        prereq.push('tajwid-qalqalah');
      } else if (surahNum === 112) {
        prereq.push('tajwid-idgham-bilaghunnah');
      } else if (surahNum <= 105) {
        prereq.push('tajwid-idgham-bighunnah');
      }
    }

    const difficulty: 1 | 2 | 3 | 4 | 5 =
      surahNum === 1 ? 1 :
      surahNum >= 111 ? 1 :
      surahNum >= 105 ? 2 :
      surahNum >= 97 ? 3 :
      surahNum >= 93 ? 4 :
      5;

    hafalanBlockNodes.push({
      nodeId: blockNodeId,
      kind: 'hafalan_block',
      title: `${surahName} : ${block.name}`,
      subtitle: `Ayat ${block.startAyah}–${block.endAyah}`,
      description: `Menghafal dan memperkuat hafalan ${surahName} ayat ${block.startAyah} sampai ${block.endAyah} dengan tartil.`,
      difficulty,
      prereq,
      surah: surahNum,
      ayah: block.startAyah,
      ayahEnd: block.endAyah,
      category: `Hafalan ${surahName}`,
      tags: ['hafalan', `surah-${surahNum}`, `ayat-${block.startAyah}-${block.endAyah}`],
      xpReward: 60 + difficulty * 15,
      starsReward: 6 + difficulty * 2,
    });

    lastBlockNodeId = blockNodeId;
  });
});

// -------------------------------------------------------------
// 5. TAFSIR AYAH NODES (Reflective insights)
// -------------------------------------------------------------
const tafsirNodes: LearningNode[] = [
  {
    nodeId: 'tafsir-1-1',
    kind: 'tafsir_ayah',
    title: 'Tafsir Al-Fatihah : Ummul Kitab',
    subtitle: 'Intisari Tauhid & Doa Teragung',
    description: 'Memahami makna mendalam 7 ayat pengantar shalat yang selalu diulang seorang mukmin.',
    difficulty: 2,
    prereq: ['hafalan-block-1-2'],
    surah: 1,
    ayah: 1,
    ayahEnd: 7,
    category: 'Tafsir Surah Pendek',
    tags: ['tafsir', 'al-fatihah', 'ummul-kitab'],
    xpReward: 75,
    starsReward: 7,
  },
  {
    nodeId: 'tafsir-112-1',
    kind: 'tafsir_ayah',
    title: 'Tafsir Al-Ikhlas : Kemurnian Tauhid',
    subtitle: 'Sepertiga Al-Qur\'an',
    description: 'Mengapa Surah Al-Ikhlas setara dengan sepertiga Al-Qur\'an dan mengenalkan As-Shamad.',
    difficulty: 2,
    prereq: ['hafalan-block-112-1'],
    surah: 112,
    ayah: 1,
    ayahEnd: 4,
    category: 'Tafsir Surah Pendek',
    tags: ['tafsir', 'al-ikhlas', 'tauhid'],
    xpReward: 75,
    starsReward: 7,
  },
  {
    nodeId: 'tafsir-114-1',
    kind: 'tafsir_ayah',
    title: 'Tafsir Al-Mu\'awwidzatain (An-Nas & Al-Falaq)',
    subtitle: 'Benteng Perlindungan Mukmin',
    description: 'Mengenal rahasia perlindungan dari was-was bisikan setan dan kejahatan makhluk di waktu subuh.',
    difficulty: 2,
    prereq: ['hafalan-block-114-2'],
    surah: 114,
    ayah: 1,
    ayahEnd: 6,
    category: 'Tafsir Surah Pendek',
    tags: ['tafsir', 'an-nas', 'al-falaq', 'benteng'],
    xpReward: 80,
    starsReward: 8,
  },
];

// -------------------------------------------------------------
// ALL NODES AGGREGATION & INDEX
// -------------------------------------------------------------
export const ALL_LEARNING_NODES_LIST: LearningNode[] = [
  ...iqraLetterNodes,
  ...generatedIqraPageNodes,
  ...IQRA_JILID_MILESTONES,
  ...baseTajwidNodes,
  ...VOCAB_LEVEL_MILESTONES,
  ...vocabNodes,
  ...hafalanBlockNodes,
  ...tafsirNodes,
];

export const ALL_LEARNING_NODES_MAP: Record<string, LearningNode> = {};
ALL_LEARNING_NODES_LIST.forEach((node) => {
  ALL_LEARNING_NODES_MAP[node.nodeId] = node;
});

// Helper Query Functions
export function getLearningNode(nodeId: string): LearningNode | undefined {
  return ALL_LEARNING_NODES_MAP[nodeId];
}

export function getNodesByKind(kind: LearningNodeKind): LearningNode[] {
  return ALL_LEARNING_NODES_LIST.filter((n) => n.kind === kind);
}

export function getNodesByDifficulty(diff: 1 | 2 | 3 | 4 | 5): LearningNode[] {
  return ALL_LEARNING_NODES_LIST.filter((n) => n.difficulty === diff);
}

export function getPrerequisiteNodes(nodeId: string): LearningNode[] {
  const node = ALL_LEARNING_NODES_MAP[nodeId];
  if (!node) return [];
  return node.prereq.map((id) => ALL_LEARNING_NODES_MAP[id]).filter(Boolean) as LearningNode[];
}

export function getDependentNodes(nodeId: string): LearningNode[] {
  return ALL_LEARNING_NODES_LIST.filter((n) => n.prereq.includes(nodeId));
}
