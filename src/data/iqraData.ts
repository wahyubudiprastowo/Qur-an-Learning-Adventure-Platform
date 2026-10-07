import { IqraItem } from '../types';

export const IQRA_CURRICULUM: IqraItem[] = [
  // Jilid A - Huruf Hijaiyah Tunggal
  { id: 'iqra-a-1', jilid: 'A', title: 'Huruf Alif & Ba', arabic: 'ا - ب', latin: 'Alif - Ba', harakat: 'Dasar', soundExample: 'A - Ba', description: 'Mengenal bentuk alif yang tegak lurus dan ba dengan titik di bawah satu.' },
  { id: 'iqra-a-2', jilid: 'A', title: 'Huruf Ta & Tsa', arabic: 'ت - ث', latin: 'Ta - Tsa', harakat: 'Dasar', soundExample: 'Ta - Tsa', description: 'Ta memiliki dua titik di atas, Tsa memiliki tiga titik di atas dengan ujung lidah keluar sedikit.' },
  { id: 'iqra-a-3', jilid: 'A', title: 'Huruf Jim, Ha, Kha', arabic: 'ج - ح - خ', latin: 'Jim - Ha - Kha', harakat: 'Dasar', soundExample: 'Ja - Ha - Kha', description: 'Jim titik di tengah, Ha bersih tanpa titik dari tenggorokan tengah, Kha bertitik di atas bersuara parau.' },
  { id: 'iqra-a-4', jilid: 'A', title: 'Huruf Dal & Dzal', arabic: 'د - ذ', latin: 'Dal - Dzal', harakat: 'Dasar', soundExample: 'Da - Dza', description: 'Dal tidak ada titik, Dzal ada satu titik di atas dibaca lembut dengan ujung lidah.' },
  { id: 'iqra-a-5', jilid: 'A', title: 'Huruf Ro & Zai', arabic: 'ر - ز', latin: 'Ra - Zai', harakat: 'Dasar', soundExample: 'Ra - Za', description: 'Ra bergetar ujung lidah, Zai berdesis nyaring seperti lebah.' },
  { id: 'iqra-a-6', jilid: 'A', title: 'Huruf Sin & Syin', arabic: 'س - ش', latin: 'Sin - Syin', harakat: 'Dasar', soundExample: 'Sa - Sya', description: 'Sin berdesir tajam dengan 3 gigi, Syin ada 3 titik di atas menebarkan angin di mulut.' },
  { id: 'iqra-a-7', jilid: 'A', title: 'Huruf Shod & Dhod', arabic: 'ص - ض', latin: 'Shad - Dhad', harakat: 'Dasar', soundExample: 'Sha - Dha', description: 'Shad tebal dan menggembung, Dhad ditekan dari tepi lidah ke gigi geraham atas.' },
  { id: 'iqra-a-8', jilid: 'A', title: 'Huruf Tho & Zho', arabic: 'ط - ظ', latin: 'Tha - Zha', harakat: 'Dasar', soundExample: 'Tha - Zha', description: 'Tha huruf paling tebal dan kuat, Zha tebal dengan titik di atas.' },
  { id: 'iqra-a-9', jilid: 'A', title: 'Huruf \'Ain & Ghain', arabic: 'ع - غ', latin: "'Ain - Ghain", harakat: 'Dasar', soundExample: "'A - Gha", description: "'Ain di tengah tenggorokan bulat dan jernih, Ghain seperti berkumur." },
  { id: 'iqra-a-10', jilid: 'A', title: 'Huruf Fa & Qof', arabic: 'ف - ق', latin: 'Fa - Qaf', harakat: 'Dasar', soundExample: 'Fa - Qa', description: 'Fa bibir bawah menyentuh gigi atas, Qaf tebal di pangkal lidah belakang.' },
  { id: 'iqra-a-11', jilid: 'A', title: 'Huruf Kaf, Lam, Mim', arabic: 'ك - ل - م', latin: 'Kaf - Lam - Mim', harakat: 'Dasar', soundExample: 'Ka - La - Ma', description: 'Kaf lebih ke depan dari Qaf, Lam ujung lidah ke gusi atas, Mim merapatkan kedua bibir.' },
  { id: 'iqra-a-12', jilid: 'A', title: 'Huruf Nun, Wawu, Ha, Ya', arabic: 'ن - و - هـ - ي', latin: 'Nun - Wawu - Ha - Ya', harakat: 'Dasar', soundExample: 'Na - Wa - Ha - Ya', description: 'Empat huruf pelengkap dengan makhraj yang khas dan merdu.' },

  // Jilid 1 - Harakat Fathah
  { id: 'iqra-1-1', jilid: '1', title: 'Harakat Fathah (A)', arabic: 'بَ - تَ - ثَ', latin: 'Ba - Ta - Tsa', harakat: 'Fathah َ', soundExample: 'Ba-Ta-Tsa', description: 'Garis miring di atas huruf menghasilkan bunyi vokal "A" yang ceria.' },
  { id: 'iqra-1-2', jilid: '1', title: 'Latihan Fathah Tiga Huruf', arabic: 'دَ - رَ - سَ', latin: 'Da - Ra - Sa', harakat: 'Fathah َ', soundExample: 'Darasa', description: 'Membaca 3 huruf berurutan dengan ketukan satu harakat tanpa dipanjangkan.' },
  { id: 'iqra-1-3', jilid: '1', title: 'Latihan Fathah: Ka - Ta - Ba', arabic: 'كَ - تَ - بَ', latin: 'Ka - Ta - Ba', harakat: 'Fathah َ', soundExample: 'Kataba', description: 'Lancar membaca potongan huruf tunggal dengan harakat fathah rata.' },

  // Jilid 2 - Kasrah (I) & Dhommah (U)
  { id: 'iqra-2-1', jilid: '2', title: 'Harakat Kasrah (I)', arabic: 'بِ - تِ - ثِ', latin: 'Bi - Ti - Tsi', harakat: 'Kasrah ِ', soundExample: 'Bi - Ti - Tsi', description: 'Garis miring di bawah huruf menghasilkan bunyi vokal "I" jernih.' },
  { id: 'iqra-2-2', jilid: '2', title: 'Harakat Dhommah (U)', arabic: 'بُ - تُ - ثُ', latin: 'Bu - Tu - Tsu', harakat: 'Dhommah ُ', soundExample: 'Bu - Tu - Tsu', description: 'Bentuk seperti huruf wawu kecil di atas menghasilkan bunyi "U" dengan bibir membulat.' },
  { id: 'iqra-2-3', jilid: '2', title: 'Kombinasi A - I - U', arabic: 'رُ - سِ - لَ', latin: 'Ru - Si - La', harakat: 'Campuran', soundExample: 'Rusila', description: 'Melatih kelincahan lidah berpindah dari dhommah, kasrah, dan fathah.' },

  // Jilid 3 - Tanwin & Mad Dasar
  { id: 'iqra-3-1', jilid: '3', title: 'Tanwin (An - In - Un)', arabic: 'بً - بٍ - بٌ', latin: 'Ban - Bin - Bun', harakat: 'Tanwin ً ٍ ٌ', soundExample: 'Ban - Bin - Bun', description: 'Dua harakat yang memunculkan bunyi huruf nun sukun di akhir kata.' },
  { id: 'iqra-3-2', jilid: '3', title: 'Mad Thabi\'i (Panjang 2 Harakat)', arabic: 'بَا - بِي - بُو', latin: 'Baa - Bii - Buu', harakat: 'Mad 2 Harakat', soundExample: 'Baa - Bii - Buu', description: 'Alif setelah fathah, Ya sukun setelah kasrah, Wawu sukun setelah dhommah dibaca 2 ayunan.' },

  // Jilid 4 - Huruf Sambung, Sukun & Qalqalah
  { id: 'iqra-4-1', jilid: '4', title: 'Huruf Sambung Awal-Tengah-Akhir', arabic: 'بَسَطَ', latin: 'Basatha', harakat: 'Sambung', soundExample: 'Basatha', description: 'Melihat perubahan bentuk huruf Ba, Sin, dan Tha saat dirangkai dalam kata.' },
  { id: 'iqra-4-2', jilid: '4', title: 'Sukun & Qalqalah Memantul', arabic: 'أَبْ - أَجْ - أَدْ', latin: 'Ab - Aj - Ad', harakat: 'Sukun ْ', soundExample: 'Qalqalah', description: 'Membaca huruf sukun memantul pada 5 huruf Qalqalah (Baju Di Toko).' },

  // Jilid 5 - Alif Lam, Waqaf & Mad Panjang
  { id: 'iqra-5-1', jilid: '5', title: 'Kaidah Waqaf Akhir Ayat', arabic: 'نَسْتَعِينُ 〇', latin: 'Nasta\'iin', harakat: 'Waqaf Sukun', soundExample: 'Nasta\'iin', description: 'Kaidah mematikan huruf terakhir ketika berhenti di bulatan akhir ayat.' },
  { id: 'iqra-5-2', jilid: '5', title: 'Alif Lam & Mad Bendera (4-5 Harakat)', arabic: 'الْحَمْدُ لِلَّهِ', latin: 'Al-hamdu lillaah', harakat: 'Alif Lam & Mad', soundExample: 'Al-hamdu lillaah', description: 'Membedakan Alif Lam Qamariyah & Syamsiyah serta tanda bendera panjang.' },

  // Jilid 6 - Hukum Nun Sukun, Tanwin & Gharib
  { id: 'iqra-6-1', jilid: '6', title: 'Hukum Nun Sukun & Tanwin (Tajwid)', arabic: 'مَنْ ءَامَنَ  -  مِنۢ بَعْدِ', latin: 'Man aamana - Mim ba\'di', harakat: 'Idzhar & Iqlab', soundExample: 'Tajwid Nun Sukun', description: 'Menguasai Idzhar (jelas), Idgham (lebur), Iqlab (menjadi mim), dan Ikhfa (samar).' },
  { id: 'iqra-6-2', jilid: '6', title: 'Tanda Waqaf Mushaf & Bacaan Gharib', arabic: 'مـ  -  لا  -  ج  -  قلى  -  صلى', latin: 'Tanda-tanda Waqaf', harakat: 'Rasm Utsmani', soundExample: 'Khatam Iqra', description: 'Memahami rambu-rambu berhenti mushaf dan persiapan membaca Al-Qur\'an 30 Juz.' },
];
