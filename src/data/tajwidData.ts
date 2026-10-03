import { TajwidTopic } from '../types';

export const TAJWID_CURRICULUM: TajwidTopic[] = [
  // 1. Nun Mati & Tanwin
  {
    id: 'izhar',
    category: 'Nun Mati & Tanwin',
    name: 'Izhar Halqi',
    arabicName: 'إظهار حلقي',
    meaning: 'Jelas di Tenggorokan',
    explanation: 'Bila Nun sukun (نْ) atau Tanwin (ــًــٍــٌ) bertemu dengan salah satu dari 6 huruf tenggorokan, dibaca jelas tanpa mendengung.',
    letters: ['ء', 'هـ', 'ع', 'ح', 'غ', 'خ'],
    examples: [
      { surahName: 'Al-Falaq', ayahNumber: 3, arabicText: 'غَاسِقٍ إِذَا', highlight: 'قٍ إِ', explanation: 'Kasratain bertemu Alif/Hamzah, dibaca jelas: Gāsiqin iżā.' },
      { surahName: 'Al-Kautsar', ayahNumber: 2, arabicText: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ', highlight: 'نْحَ', explanation: 'Nun sukun bertemu Ha (ح), dibaca jelas: Wan-ḥar.' },
    ],
    quiz: {
      question: 'Bagaimana cara membaca hukum Izhar Halqi?',
      options: ['Jelas tanpa dengung', 'Samar dan berdengung', 'Memantul kuat', 'Mengubah suara jadi M'],
      correctIndex: 0,
      explanation: 'Izhar artinya jelas dan terang, sehingga bunyi huruf nun dibaca tegas tanpa dengung.',
    },
  },
  {
    id: 'idgham-bighunnah',
    category: 'Nun Mati & Tanwin',
    name: 'Idgham Bighunnah',
    arabicName: 'إدغام بغنة',
    meaning: 'Melebur dengan Dengung',
    explanation: 'Bila Nun sukun atau Tanwin bertemu salah satu huruf Ya, Nun, Mim, Wawu (ي - ن - م - و), suaranya dimasukkan dan didengungkan selama 2 harakat.',
    letters: ['ي', 'ن', 'م', 'و'],
    examples: [
      { surahName: 'Al-Masad', ayahNumber: 1, arabicText: 'أَبِي لَهَبٍ وَتَبَّ', highlight: 'بٍ وَ', explanation: 'Kasratain bertemu Wawu (و), dibaca melebur berdengung: Lahabiw-wa tabb.' },
      { surahName: 'Al-Humazah', ayahNumber: 2, arabicText: 'مَالًا وَعَدَّدَهُ', highlight: 'لًا وَ', explanation: 'Fathatain bertemu Wawu, dibaca berdengung: Mālaw-wa ‘addadah.' },
    ],
    quiz: {
      question: 'Berapa jumlah harakat dengung pada Idgham Bighunnah?',
      options: ['1 harakat', '2 harakat', '4 harakat', '6 harakat'],
      correctIndex: 1,
      explanation: 'Dengung (Ghunnah) ditahan selama 2 harakat (kira-kira dua ketukan ayunan).',
    },
  },
  {
    id: 'idgham-bilaghunnah',
    category: 'Nun Mati & Tanwin',
    name: 'Idgham Bilaghunnah',
    arabicName: 'إدغام بغير غنة',
    meaning: 'Melebur Tanpa Dengung',
    explanation: 'Bila Nun sukun atau Tanwin bertemu huruf Lam (ل) atau Ra (ر), suaranya langsung dimasukkan sepenuhnya tanpa dengung.',
    letters: ['ل', 'ر'],
    examples: [
      { surahName: 'Al-Ikhlas', ayahNumber: 4, arabicText: 'وَلَمْ يَكُن لَّهُ', highlight: 'ن لَّ', explanation: 'Nun sukun bertemu Lam, suara nun hilang langsung masuk ke lam: Yakul-lahū.' },
      { surahName: 'Al-Humazah', ayahNumber: 1, arabicText: 'وَيْلٌ لِّكُلِّ', highlight: 'لٌ لِّ', explanation: 'Dhommatain bertemu Lam: Wailul-likulli.' },
    ],
    quiz: {
      question: 'Huruf apa saja yang termasuk Idgham Bilaghunnah?',
      options: ['Lam (ل) dan Ra (ر)', 'Ya dan Nun', 'Ba dan Mim', 'Kaf dan Qaf'],
      correctIndex: 0,
      explanation: 'Hanya ada 2 huruf: Lam (ل) dan Ra (ر).',
    },
  },
  {
    id: 'iqlab',
    category: 'Nun Mati & Tanwin',
    name: 'Iqlab',
    arabicName: 'إقلاب',
    meaning: 'Mengganti Bunyi menjadi Mim',
    explanation: 'Bila Nun sukun atau Tanwin bertemu dengan huruf Ba (ب), bunyi nun diganti menjadi suara Mim (م) yang dirapatkan bibirnya dan didengungkan.',
    letters: ['ب'],
    examples: [
      { surahName: 'Al-Balad', ayahNumber: 2, arabicText: 'حِلٌّ بِهَٰذَا', highlight: 'لٌّ بِ', explanation: 'Dhommatain bertemu Ba, di mushaf sering ada tanda mim kecil (مـ).' },
      { surahName: 'Al-Alaq', ayahNumber: 15, arabicText: 'لَنَسْفَعًا بِالنَّاصِيَةِ', highlight: 'عًا بِ', explanation: 'Tanwin bertemu Ba dibaca: Lanasfa‘am-bin-nāṣiyah.' },
    ],
    quiz: {
      question: 'Bunyi nun sukun atau tanwin pada hukum Iqlab diubah menjadi huruf apa?',
      options: ['Mim (م)', 'Wawu (و)', 'Alif (ا)', 'Ta (ت)'],
      correctIndex: 0,
      explanation: 'Iqlab membalik/menukar bunyi nun menjadi huruf Mim (م) diiringi dengung.',
    },
  },
  {
    id: 'ikhfa',
    category: 'Nun Mati & Tanwin',
    name: 'Ikhfa\' Haqiqi',
    arabicName: 'إخفاء حقيقي',
    meaning: 'Menyamarkan Bunyi',
    explanation: 'Bila Nun sukun atau Tanwin bertemu 15 huruf Ikhfa, dibaca samar antara izhar dan idgham dengan dengung lembut.',
    letters: ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'],
    examples: [
      { surahName: 'An-Nas', ayahNumber: 4, arabicText: 'مِن شَرِّ', highlight: 'ن شَ', explanation: 'Nun sukun bertemu Syin (ش), dibaca samar: Min syarr.' },
      { surahName: 'Al-Falaq', ayahNumber: 2, arabicText: 'مِن شَرِّ مَا خَلَقَ', highlight: 'ن شَ', explanation: 'Nun sukun bertemu Syin, disamarkan suaranya.' },
    ],
    quiz: {
      question: 'Berapakah jumlah huruf Ikhfa\' Haqiqi?',
      options: ['15 huruf', '6 huruf', '4 huruf', '2 huruf'],
      correctIndex: 0,
      explanation: 'Huruf Ikhfa ada 15, di antaranya Ta, Tsa, Jim, Dal, Dzal, Sin, Kaf, dll.',
    },
  },

  // 2. Qalqalah
  {
    id: 'qalqalah',
    category: 'Qalqalah',
    name: 'Hukum Qalqalah',
    arabicName: 'قلقلة',
    meaning: 'Memantulkan Bunyi',
    explanation: 'Memantulkan suara ketika huruf sukun dibaca. Ada dua tingkatan: Qalqalah Sughra (pantulan kecil di tengah kata) dan Qalqalah Kubra (pantulan kuat di akhir ayat/waqaf).',
    letters: ['ق', 'ط', 'ب', 'ج', 'د'],
    examples: [
      { surahName: 'Al-Ikhlas', ayahNumber: 1, arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ', highlight: 'دٌ (دْ)', explanation: 'Huruf Dal di akhir ayat dibaca mantul kuat: Aḥad.' },
      { surahName: 'Al-Falaq', ayahNumber: 1, arabicText: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', highlight: 'قِ (قْ)', explanation: 'Huruf Qaf di akhir ayat dibaca memantul tebal: Al-Falaq.' },
    ],
    quiz: {
      question: 'Manakah singkatan populer untuk mengingat 5 huruf Qalqalah?',
      options: ['Baju Ditoko (ب - ج - د - ط - ق)', 'Yarmaluna', 'Halqiyah', 'Idgham'],
      correctIndex: 0,
      explanation: 'Singkatan mudah diingat anak: Ba-Jim-Dal-Tha-Qaf ("Baju Ditoko").',
    },
  },

  // 3. Makharijul Huruf (Tempat Keluar Huruf)
  {
    id: 'makharij',
    category: 'Makharijul Huruf',
    name: '5 Muara Makharijul Huruf',
    arabicName: 'مخارج الحروف',
    meaning: 'Tempat Keluarnya Huruf Hijaiyah',
    explanation: 'Al-Qur\'an dibaca fasih jika huruf keluar tepat dari tempatnya: 1. Al-Jauf (Rongga Mulut), 2. Al-Halq (Tenggorokan), 3. Al-Lisan (Lidah), 4. Asy-Syafatain (Dua Bibir), 5. Al-Khaisyum (Pangkal Hidung).',
    letters: ['الجوف', 'الحلق', 'اللسان', 'الشفتان', 'الخيشوم'],
    examples: [
      { surahName: 'Al-Fatihah', ayahNumber: 1, arabicText: 'الْجَوْف - ا و ي', highlight: 'حروف المد', explanation: 'Al-Jauf: Rongga mulut dan kerongkongan untuk huruf mad (Alif, Wawu, Ya).' },
      { surahName: 'Al-Ikhlas', ayahNumber: 2, arabicText: 'الشَّفَتَان - ب م و ف', highlight: 'ب م', explanation: 'Asy-Syafatain: Bibir untuk huruf Ba, Mim, Wawu, dan Fa.' },
    ],
    quiz: {
      question: 'Makhraj huruf Al-Halq berada di bagian mana?',
      options: ['Tenggorokan', 'Dua bibir', 'Rongga hidung', 'Gigi geraham'],
      correctIndex: 0,
      explanation: 'Al-Halq (الحلق) artinya adalah tenggorokan, tempat keluarnya huruf Hamzah, Ha, Ain, Ha, Ghain, Kha.',
    },
  },
];
