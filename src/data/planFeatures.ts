export interface PlanFeatureItem {
  id: string;
  category: string;
  name: string;
  description: string;
  freeValue: string;
  proValue: string;
  isProHighlight?: boolean;
}

export const PLAN_LIMITS = {
  GUEST_SURAHS: 4, // Al-Fatihah, Al-Ikhlas, Al-Falaq, An-Nas
  FREE_SURAHS: 22, // 60% Juz 30 (22 Surah: Ad-Duha s/d An-Nas) + Al-Fatihah
  FREE_GAMES: 5, // 5 Game Pilihan (Lebah Ejaan, Susun Ayat, Dengar Ayat, Duel Santri, Voice STT)
  IQRA_FREE_PAGES: 32, // Iqra Jilid 1 Penuh (32 Halaman)
  PRO_SURAHS: 114, // 30 Juz Penuh (114 Surah)
  PRO_GAMES: 8, // Semua 8 Arena Game
};

export const PLAN_FEATURES: PlanFeatureItem[] = [
  {
    id: 'iqra_coverage',
    category: "Materi Iqra' & Huruf Hijaiyah",
    name: "Buku Panduan Iqra' 1-6",
    description: "Akses jilid buku Iqra' standar untuk belajar membaca Al-Qur'an dari dasar",
    freeValue: `Iqra' Jilid 1 Penuh (${PLAN_LIMITS.IQRA_FREE_PAGES} Halaman)`,
    proValue: "Iqra' Jilid 1 sampai 6 Lengkap",
    isProHighlight: true,
  },
  {
    id: 'surah_coverage',
    category: "Materi & Hafalan Al-Qur'an",
    name: "Hafalan Tahfiz & Muroja'ah",
    description: 'Jumlah surah dan ayat yang dapat diakses untuk setoran dan hafalan mandiri',
    freeValue: `60% Juz 30 (${PLAN_LIMITS.FREE_SURAHS} Surah: Ad-Duha s/d An-Nas) + Al-Fatihah`,
    proValue: `30 Juz Penuh (${PLAN_LIMITS.PRO_SURAHS} Surah Al-Qur'an)`,
    isProHighlight: true,
  },
  {
    id: 'quran_reading',
    category: "Materi & Hafalan Al-Qur'an",
    name: "Mushaf Al-Qur'an & Tilawah",
    description: "Membaca dan menyimak lantunan tartil ayat suci Al-Qur'an",
    freeValue: `Full 30 Juz (${PLAN_LIMITS.PRO_SURAHS} Surah Lengkap)`,
    proValue: 'Full 30 Juz + Audio HD Berbagai Qari',
  },
  {
    id: 'game_coverage',
    category: 'Arena Belajar & Game Edukasi',
    name: 'Mini-Game Islami Interaktif',
    description: 'Permainan edukatif asah otak hafalan dan makhraj anak',
    freeValue: `${PLAN_LIMITS.FREE_GAMES} Game Edukasi Pilihan (Termasuk Duel & Suara)`,
    proValue: `Semua ${PLAN_LIMITS.PRO_GAMES} Arena Game Lengkap`,
    isProHighlight: true,
  },
  {
    id: 'ai_voice',
    category: 'Teknologi AI & Interaktif',
    name: 'Ustadz AI Evaluasi Tartil',
    description: 'Deteksi kecerdasan buatan untuk menguji ketepatan tajwid dan makhraj anak',
    freeValue: 'Preview 1x Sesi / Hari (Standar Nilai Akurat)',
    proValue: 'Preview 1x Sesi / Hari + Opsi Token & BYOK Kunci Pribadi',
    isProHighlight: true,
  },
  {
    id: 'tamagotchi_characters',
    category: 'Sahabat Tamagotchi',
    name: 'Karakter Sahabat Belajar',
    description: 'Pilihan maskot interaktif yang menemani dan bereaksi terhadap progres anak',
    freeValue: '1 Karakter (Lumi si Kucing Tartil)',
    proValue: 'Semua 5 Karakter (Lumi, Buraq, Fajr, Kibo, Dino Nur)',
    isProHighlight: true,
  },
  {
    id: 'tamagotchi_room',
    category: 'Sahabat Tamagotchi',
    name: 'Dekorasi Kamar & Kostum Langka',
    description: 'Item kustomisasi kamar sahabat dan pakaian bertema islami',
    freeValue: 'Dekorasi Standar Toko',
    proValue: 'Semua Dekorasi VIP & Kostum Emas Eksklusif',
  },
  {
    id: 'multi_child',
    category: 'Profil & Keluarga',
    name: 'Batas Profil Anak per Akun',
    description: 'Jumlah akun profil anak terpisah dalam 1 ponsel / gadget keluarga',
    freeValue: 'Maksimal 2 Profil Anak',
    proValue: 'Hingga 5 Profil Anak Sekaligus',
    isProHighlight: true,
  },
  {
    id: 'weekly_report',
    category: 'Rapor & Analisis Mutqin',
    name: 'Laporan Perkembangan & Unduh PDF',
    description: 'Analisis mendalam sepekan untuk orang tua dan guru tahfiz',
    freeValue: 'Grafik Ringkas di Aplikasi',
    proValue: 'Rapor Detail per Ayat + Cetak & Unduh PDF Resmi',
    isProHighlight: true,
  },
  {
    id: 'offline_mode',
    category: 'Konektivitas & Audio',
    name: 'Download Offline & Audio Qari HD',
    description: 'Mendengarkan lantunan qari ternama tanpa koneksi internet / kuota',
    freeValue: 'Streaming Audio Standar',
    proValue: 'Audio HD Qari Ternama + Download Offline Penuh',
  },
  {
    id: 'ad_free',
    category: 'Kenyamanan',
    name: 'Bebas Iklan & Gangguan',
    description: 'Pengalaman belajar anak yang murni, aman, dan tanpa iklan komersial',
    freeValue: '100% Bebas Iklan',
    proValue: '100% Bebas Iklan + Dukungan Tim Pengembang',
  },
];

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Paket Dasar (Free)',
    badge: 'GRATIS SELAMANYA',
    priceText: 'Rp 0',
    periodText: 'tanpa batas waktu',
    description: 'Sangat cocok untuk anak yang baru mulai belajar melafalkan Juz 30 dan huruf hijaiyah.',
    ctaText: 'Gunakan Paket Free',
    isCurrentDefault: true,
    highlight: false,
  },
  {
    id: 'pro_monthly',
    name: 'Pro Hafiz Bulanan',
    badge: 'POPULER',
    priceText: 'Rp 29.000',
    periodText: '/ bulan',
    description: 'Akses penuh tanpa batas seluruh 30 Juz, AI voice analysis, dan semua sahabat Tamagotchi.',
    ctaText: 'Aktifkan Pro Bulanan',
    isCurrentDefault: false,
    highlight: true,
  },
  {
    id: 'pro_lifetime',
    name: 'Pro Lifetime (Seumur Hidup)',
    badge: 'HEMAT 70%',
    priceText: 'Rp 199.000',
    periodText: 'sekali bayar seumur hidup',
    description: 'Investasi jariyah berkah untuk masa depan hafalan Al-Qur\'an anak dan adik-adiknya selamanya.',
    ctaText: 'Miliki Pro Seumur Hidup',
    isCurrentDefault: false,
    highlight: false,
  },
];
