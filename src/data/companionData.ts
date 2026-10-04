import {
  CompanionStage,
  StageConfig,
  RoomDecoration,
  WorldLand,
  SurahKnowledgeCard,
  CompanionSpecies,
  CompanionSpeciesConfig,
} from '../types/companion';

/**
 * 5 Distinct Tamagotchi Companions with unique traits and Islamic values
 */
export const COMPANION_SPECIES_LIST: CompanionSpeciesConfig[] = [
  {
    id: 'lumi',
    name: 'Kucing Cahaya',
    defaultName: 'Lumi',
    avatarIcon: '🐱',
    color: 'from-cyan-400 to-blue-500',
    description: 'Suka nada tartil merdu dan selalu berputar riang saat mendengar bacaan surah Al-Qur\'an.',
    nature: 'Penyayang & Suka Tartil',
    favoriteFood: 'Kurma Ajwa Manis',
  },
  {
    id: 'buraq',
    name: 'Buraq Bintang',
    defaultName: 'Buraq Cilik',
    avatarIcon: '🦄',
    color: 'from-amber-400 to-orange-500',
    description: 'Kuda bersayap bintang dengan derap langkah cepat, semangat menambah baris hafalan baru!',
    nature: 'Semangat Tinggi & Cepat',
    favoriteFood: 'Buah Tin Surga',
  },
  {
    id: 'fajr',
    name: 'Burung Bulbul Subuh',
    defaultName: 'Fajr',
    avatarIcon: '🐦',
    color: 'from-emerald-400 to-teal-500',
    description: 'Burung kicau fajar yang mencintai keindahan tajwid, makhraj fasih, dan qari tartil.',
    nature: 'Ahli Makhraj & Nada',
    favoriteFood: 'Biji Delima Berkah',
  },
  {
    id: 'kibo',
    name: 'Panda Kaligrafi',
    defaultName: 'Kibo',
    avatarIcon: '🐼',
    color: 'from-purple-400 to-indigo-500',
    description: 'Panda setia yang tenang dan sabar, paling suka menemani sesi murojaah dan pengulangan berkali-kali.',
    nature: 'Sabar & Kokoh Murojaah',
    favoriteFood: 'Rebung Segar Zamzam',
  },
  {
    id: 'dino',
    name: 'Dino Nur Penjelajah',
    defaultName: 'Dino Nur',
    avatarIcon: '🦕',
    color: 'from-rose-400 to-pink-500',
    description: 'Dinosaurus kecil yang gemar mendengarkan kisah nabi, sejarah asbabun nuzul, dan hikmah Al-Qur\'an.',
    nature: 'Rasa Ingin Tahu & Ceria',
    favoriteFood: 'Daun Rindang Zaitun',
  },
];

export function getCompanionSpeciesConfig(species?: CompanionSpecies): CompanionSpeciesConfig {
  const found = COMPANION_SPECIES_LIST.find((s) => s.id === species);
  return found || COMPANION_SPECIES_LIST[0];
}

export function getSpeciesStageAvatar(species: CompanionSpecies = 'lumi', stageId: CompanionStage): string {
  if (stageId === 'egg') return '🥚';
  if (stageId === 'master') return '👑';
  if (stageId === 'guardian') return '✨';

  if (species === 'buraq') {
    if (stageId === 'hatchling') return '🦄';
    if (stageId === 'little') return '🐎';
    return '🌟';
  }
  if (species === 'fajr') {
    if (stageId === 'hatchling') return '🐣';
    if (stageId === 'little') return '🐦';
    return '🕊️';
  }
  if (species === 'kibo') {
    if (stageId === 'hatchling') return '🐼';
    if (stageId === 'little') return '🐾';
    return '🎋';
  }
  if (species === 'dino') {
    if (stageId === 'hatchling') return '🦖';
    if (stageId === 'little') return '🦕';
    return '🌴';
  }
  // Default Lumi (Kucing)
  if (stageId === 'hatchling') return '🐱';
  if (stageId === 'little') return '🐾';
  return '🌟';
}

/**
 * 6 Stages of Companion Evolution based on meaningful learning progress
 * Egg (0-100 XP) -> Hatchling (100-350) -> Little (350-900) -> Explorer (900-2000) -> Guardian (2000-4000) -> Master (4000+)
 */
export const COMPANION_STAGES: StageConfig[] = [
  {
    id: 'egg',
    name: 'Telur Misterius',
    subtitle: 'Menyimpan cahaya kehangatan ayat',
    minXp: 0,
    maxXp: 99,
    avatarIcon: '🥚',
    badgeColor: '#08B9EF',
    storyQuote: 'Telur ini bercahaya lembut setiap kali kamu mendengarkan ayat Al-Qur\'an...',
    unlockedAbility: 'Dengarkan ayat pertama untuk membantu telur ini menetas!',
  },
  {
    id: 'hatchling',
    name: 'Bayi Lumi (Hatchling)',
    subtitle: 'Baru menetas & suka suara tartil',
    minXp: 100,
    maxXp: 349,
    avatarIcon: '🐣',
    badgeColor: '#81E850',
    storyQuote: 'Ciiit! Lumi telah menetas! Matanya berbinar mendengar hafalan barumu.',
    unlockedAbility: 'Membuka Akses Kamar Lumi & Penanaman Benih Cahaya.',
  },
  {
    id: 'little',
    name: 'Lumi Cilik (Companion)',
    subtitle: 'Teman setia di setiap langkah hafalan',
    minXp: 350,
    maxXp: 899,
    avatarIcon: '🐾',
    badgeColor: '#B797F6',
    storyQuote: 'Lumi melompat riang! Telinganya bersinar saat kamu melafalkan makhraj yang benar.',
    unlockedAbility: 'Membuka Peta Dunia: Lembah Murojaah & Hutan Tajwid.',
  },
  {
    id: 'explorer',
    name: 'Penjelajah Muda (Explorer)',
    subtitle: 'Membawa tas buku & siap menjelajah',
    minXp: 900,
    maxXp: 1999,
    avatarIcon: '🌟',
    badgeColor: '#FF946F',
    storyQuote: 'Bintang kebaikan menerangi jalan kita menuju puncak Gunung Hafalan!',
    unlockedAbility: 'Membuka Rumah Pohon Belajar & Koleksi Kartu Surah.',
  },
  {
    id: 'guardian',
    name: 'Penjaga Cahaya (Guardian)',
    subtitle: 'Aura ketenangan & hafalan kokoh',
    minXp: 2000,
    maxXp: 3999,
    avatarIcon: '✨',
    badgeColor: '#FFD83E',
    storyQuote: 'Cahaya Al-Qur\'an menjaga hatimu tetap bersih dan penuh kasih sayang.',
    unlockedAbility: 'Membuka Observatorium Bintang & Mahkota Hafiz.',
  },
  {
    id: 'master',
    name: 'Mahkota Nur (Master)',
    subtitle: 'Penjaga Kalam yang bersahaja & teladan',
    minXp: 4000,
    maxXp: 999999,
    avatarIcon: '👑',
    badgeColor: '#164C68',
    storyQuote: 'Mahkota kemuliaan tersemat indah bagi keluarga pencinta Al-Qur\'an.',
    unlockedAbility: 'Seluruh Wilayah Dunia & Koleksi Legenda Terbuka.',
  },
];

export function getStageForXp(xp: number): StageConfig {
  for (let i = COMPANION_STAGES.length - 1; i >= 0; i--) {
    if (xp >= COMPANION_STAGES[i].minXp) {
      return COMPANION_STAGES[i];
    }
  }
  return COMPANION_STAGES[0];
}

/**
 * 10 World Lands representing existing learning features
 */
export const WORLD_LANDS: WorldLand[] = [
  {
    id: 'recitation_lake',
    name: 'Danau Tilawah (Recitation Lake)',
    arabicName: 'بُحَيْرَةُ التِّلَاوَةِ',
    icon: '🎵',
    color: 'from-cyan-400 to-blue-500',
    tagline: 'Langkah 1 Tahfiz • Dengar Qari',
    description: 'Air danau jernih memantulkan nada tartil merdu para Syaikh Al-Qur\'an dunia.',
    destinationTab: 'tahfiz',
    destinationSubView: 'dengar',
    levelRequired: 1,
  },
  {
    id: 'memory_mountain',
    name: 'Bukit Ziadah (Memory Mountain)',
    arabicName: 'جَبَلُ الزِّيَادَةِ',
    icon: '🏔️',
    color: 'from-amber-400 to-orange-500',
    tagline: 'Langkah 2 Tahfiz • Hafalan Baru',
    description: 'Mendaki lereng demi lereng dengan membagi ayat ke dalam blok 3–5 ayat yang teratur.',
    destinationTab: 'tahfiz',
    destinationSubView: 'ziadah_config',
    levelRequired: 1,
  },
  {
    id: 'moon_valley',
    name: 'Lembah Murojaah (Moon Valley)',
    arabicName: 'وَادِي الْمُرَاجَعَةِ',
    icon: '🌙',
    color: 'from-indigo-400 to-purple-600',
    tagline: 'Langkah 2 Tahfiz • Teks Samar',
    description: 'Bulan sabit menyinari kata-kata yang diuji secara bertahap agar ingatan makin kokoh.',
    destinationTab: 'tahfiz',
    destinationSubView: 'murojaah',
    levelRequired: 1,
  },
  {
    id: 'echo_cave',
    name: 'Gua Gema (Echo Cave)',
    arabicName: 'كَهْفُ الصَّدَى',
    icon: '🗣️',
    color: 'from-emerald-400 to-teal-600',
    tagline: 'Langkah 3 Tahfiz • Setoran Mandiri',
    description: 'Uji hafalanmu tanpa bantuan teks dan rekam suaramu untuk dinilai ketepatannya.',
    destinationTab: 'tahfiz',
    destinationSubView: 'hafalan',
    levelRequired: 1,
  },
  {
    id: 'iqra_village',
    name: 'Desa Iqra (Iqra Village)',
    arabicName: 'قَرْيَةُ اقْرَأْ',
    icon: '📖',
    color: 'from-sky-400 to-cyan-600',
    tagline: 'Pondasi Huruf Hijaiyah & Harakat',
    description: 'Rumah-rumah panggung di mana huruf Alif sampai Ya berbunyi ceria.',
    destinationTab: 'alquran',
    destinationSubView: 'iqra',
    levelRequired: 1,
  },
  {
    id: 'tajwid_forest',
    name: 'Hutan Tajwid (Tajwid Forest)',
    arabicName: 'غَابَةُ التَّجْوِيدِ',
    icon: '🌳',
    color: 'from-lime-500 to-emerald-600',
    tagline: 'Hukum Nun Sukun, Qalqalah & Mad',
    description: 'Pepohonan rindang dengan buah-buah hukum bacaan tartil yang manis.',
    destinationTab: 'alquran',
    destinationSubView: 'tajwid',
    levelRequired: 1,
  },
  {
    id: 'quran_river',
    name: 'Sungai Mushaf (Quran River)',
    arabicName: 'نَهْرُ الْمُصْحَفِ',
    icon: '🌊',
    color: 'from-blue-400 to-indigo-500',
    tagline: 'Tilawah 114 Surah & 30 Juz',
    description: 'Aliran sungai nan berkilau tempat membuka seluruh lembar Mushaf Al-Qur\'an.',
    destinationTab: 'alquran',
    destinationSubView: 'tilawah',
    levelRequired: 1,
  },
  {
    id: 'word_garden',
    name: 'Kebun Bahasa (Word Garden)',
    arabicName: 'حَدِيقَةُ اللُّغَةِ',
    icon: '🌱',
    color: 'from-teal-400 to-emerald-500',
    tagline: 'Kamus Kosakata Al-Qur\'an',
    description: 'Bunga-bunga kata bertunas, memahami makna kata yang paling sering muncul.',
    destinationTab: 'alquran',
    destinationSubView: 'bahasa',
    levelRequired: 1,
  },
  {
    id: 'wisdom_library',
    name: 'Perpustakaan Hikmah (Wisdom Library)',
    arabicName: 'مَكْتَبَةُ الْحِكْمَةِ',
    icon: '📚',
    color: 'from-amber-500 to-yellow-600',
    tagline: 'Tafsir Ringkas Kemenag RI',
    description: 'Ruang baca penuh buku bercahaya yang menerangkan maksud firman Allah Swt.',
    destinationTab: 'alquran',
    destinationSubView: 'tafsir',
    levelRequired: 1,
  },
  {
    id: 'story_camp',
    name: 'Tenda Kisah (Story Camp)',
    arabicName: 'مُخَيَّمُ الْقِصَصِ',
    icon: '⛺',
    color: 'from-rose-400 to-pink-600',
    tagline: 'Asbabun Nuzul & Sejarah',
    description: 'Api unggun yang hangat mendengarkan kisah sejarah di balik turunnya surah.',
    destinationTab: 'alquran',
    destinationSubView: 'asbab',
    levelRequired: 1,
  },
];

/**
 * Room Decoration Furniture & Collectibles (Zero Lootbox, Clear Achievement or Star Price)
 */
export const ROOM_DECORATIONS: RoomDecoration[] = [
  {
    id: 'carpet-bintang',
    name: 'Karpet Bintang Biru',
    icon: '🛋️',
    category: 'furniture',
    costStars: 0,
    unlockRequirement: 'Tersedia saat telur pertama ditemukan',
    unlockedByDefault: true,
  },
  {
    id: 'tanaman-cahaya',
    name: 'Bunga Cahaya Pagi',
    icon: '🪴',
    category: 'plant',
    costStars: 100,
    unlockRequirement: 'Selesaikan 2 sesi belajar apa saja',
    unlockedByDefault: true,
  },
  {
    id: 'lampu-bulan',
    name: 'Lampu Bulan Sabit',
    icon: '🌙',
    category: 'light',
    costStars: 200,
    unlockRequirement: 'Selesaikan 3 sesi Murojaah',
  },
  {
    id: 'rak-hikmah',
    name: 'Rak Buku Qur\'an Mini',
    icon: '📚',
    category: 'furniture',
    costStars: 300,
    unlockRequirement: 'Pelajari 5 kosakata atau 1 hukum Tajwid',
  },
  {
    id: 'bonsai-zaitun',
    name: 'Pohon Zaitun Berkah',
    icon: '🌳',
    category: 'plant',
    costStars: 250,
    unlockRequirement: 'Selesaikan 1 blok hafalan penuh',
  },
  {
    id: 'teropong-falak',
    name: 'Teropong Bintang Falak',
    icon: '🔭',
    category: 'special',
    costStars: 450,
    unlockRequirement: 'Mencapai Level 3 (Penjaga Kalam)',
  },
  {
    id: 'jendela-langit',
    name: 'Jendela Awan & Pelangi',
    icon: '🪟',
    category: 'special',
    costStars: 350,
    unlockRequirement: 'Menjaga streak belajar selama 3 hari',
  },
  {
    id: 'kotak-murottal',
    name: 'Kotak Nada Merdu',
    icon: '🎶',
    category: 'light',
    costStars: 400,
    unlockRequirement: 'Dengarkan 10 ayat di Danau Tilawah',
  },
];

/**
 * Surah Knowledge Cards for Collection Book
 * Unlocked when child completes blocks or masters a surah
 */
export const SURAH_KNOWLEDGE_CARDS: SurahKnowledgeCard[] = [
  {
    id: 'card-1',
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    surahArabic: 'الفاتحة',
    icon: '🌟',
    ayahCount: 7,
    revelationType: 'Makkiyyah',
    badgeTitle: 'Induk Al-Qur\'an (Ummul Kitab)',
    keyWisdom: 'Tujuh ayat yang selalu diulang dalam setiap rakaat shalat, berisi pujian kepada Allah Sang Maha Pengasih dan doa memohon jalan lurus.',
    moralLesson: 'Selalu bersyukur dan memohon pertolongan hanya kepada Allah di setiap awal langkah.',
  },
  {
    id: 'card-18',
    surahNumber: 18,
    surahName: 'Al-Kahf',
    surahArabic: 'الكهف',
    icon: '⛰️',
    ayahCount: 110,
    revelationType: 'Makkiyyah',
    badgeTitle: 'Cahaya Pelindung Hari Jumat',
    keyWisdom: 'Kisah para pemuda beriman yang tertidur di dalam gua selama ratusan tahun demi mempertahankan keyakinan kepada Allah.',
    moralLesson: 'Keteguhan iman dan kejujuran akan selalu dijaga oleh Allah dalam keadaan apapun.',
  },
  {
    id: 'card-67',
    surahNumber: 67,
    surahName: 'Al-Mulk',
    surahArabic: 'الملك',
    icon: '👑',
    ayahCount: 30,
    revelationType: 'Makkiyyah',
    badgeTitle: 'Penyelamat Malam Hari',
    keyWisdom: 'Keindahan penciptaan tujuh langit tanpa celah dan kuasa Allah atas kehidupan serta kematian untuk menguji siapa yang terbaik amalnya.',
    moralLesson: 'Merenungi ciptaan Allah dan senantiasa berbuat baik dengan ikhlas.',
  },
  {
    id: 'card-105',
    surahNumber: 105,
    surahName: 'Al-Fil',
    surahArabic: 'الفيل',
    icon: '🐘',
    ayahCount: 5,
    revelationType: 'Makkiyyah',
    badgeTitle: 'Pasukan Gajah & Burung Ababil',
    keyWisdom: 'Kisah gagalnya Raja Abrahah dan pasukan gajah yang hendak meruntuhkan Ka\'bah, dihancurkan oleh burung Ababil pembawa batu sijjil.',
    moralLesson: 'Kesombongan akan hancur dan Allah Maha Melindungi tempat-tempat yang suci.',
  },
  {
    id: 'card-108',
    surahNumber: 108,
    surahName: 'Al-Kausar',
    surahArabic: 'الكوثر',
    icon: '⛲',
    ayahCount: 3,
    revelationType: 'Makkiyyah',
    badgeTitle: 'Telaga Nikmat yang Berlimpah',
    keyWisdom: 'Kabar gembira telaga surga Al-Kausar untuk Rasulullah saw. dan perintah untuk tetap mendirikan shalat serta berkurban.',
    moralLesson: 'Mensyukuri nikmat kebaikan dengan rajin berbagi dan beribadah.',
  },
  {
    id: 'card-112',
    surahNumber: 112,
    surahName: 'Al-Ikhlas',
    surahArabic: 'الإخلاص',
    icon: '💎',
    ayahCount: 4,
    revelationType: 'Makkiyyah',
    badgeTitle: 'Sepertiga Al-Qur\'an',
    keyWisdom: 'Menegaskan keesaan mutlak Allah Swt: tidak beranak, tidak diperanakkan, dan tiada satupun yang setara dengan-Nya.',
    moralLesson: 'Kemurnian tauhid dan keikhlasan hati dalam beribadah hanya kepada Allah.',
  },
  {
    id: 'card-113',
    surahNumber: 113,
    surahName: 'Al-Falaq',
    surahArabic: 'الفلق',
    icon: '🌅',
    ayahCount: 5,
    revelationType: 'Makkiyyah',
    badgeTitle: 'Pelindung Waktu Subuh',
    keyWisdom: 'Doa perlindungan kepada Tuhan Pemilik waktu subuh dari kejahatan makhluk, malam gelap gulita, dan orang-orang yang dengki.',
    moralLesson: 'Hati menjadi tenang saat bersandar memohon perlindungan Allah.',
  },
  {
    id: 'card-114',
    surahNumber: 114,
    surahName: 'An-Nas',
    surahArabic: 'الناس',
    icon: '🛡️',
    ayahCount: 6,
    revelationType: 'Makkiyyah',
    badgeTitle: 'Perisai Manusia',
    keyWisdom: 'Memohon perlindungan kepada Raja dan Sembahan Manusia dari bisikan jahat yang bersembunyi dalam dada manusia.',
    moralLesson: 'Selalu berzikir agar hati senantiasa terjaga dari bisikan was-was.',
  },
];

/**
 * Friendly speech lines from Lumi based on learning state
 */
export const COMPANION_DIALOGUES = {
  greeting: [
    'Assalamu\'alaikum! Hari ini kita mau menjelajah ke mana?',
    'Wah, senang sekali kamu datang! Lumi siap mendengarkan lantunanmu.',
    'Al-Qur\'an membuat hati kita sejuk dan terang benderang!',
    'Lumi sudah menyiapkan tas buku! Ayo kita belajar!',
  ],
  encourageTahfiz: [
    'Satu ayat yang kamu baca menghadirkan sepuluh kebaikan, lho!',
    'Blok hafalan ini akan menjadi bekal indah di surga nanti.',
    'Pelan-pelan saja, tajwid yang tartil lebih disukai Allah.',
    'Lumi bangga sekali melihat kegigihanmu melafalkan ayat ini!',
  ],
  murojaahNudge: [
    'Ada ayat yang rindu dikunjungi lagi nih. Murojaah sebentar yuk?',
    'Ingatan kita seperti kebun bunga, perlu disiram murojaah setiap hari!',
    'Yuk kita kuatkan ayat-ayat kemarin, Lumi bantu ingatkan ya!',
  ],
  petted: [
    'Hehe, geli! Terima kasih sudah mengelus Lumi! ✨',
    'Purrr... Lumi makin bersemangat menemanimu!',
    'Cahaya kehangatan terasa di sekitar kita!',
  ],
};
