export interface PlanFeatureItem {
  id: string;
  category: string;
  name: string;
  description: string;
  freeValue: string;
  proValue: string;
  isProHighlight?: boolean;
}

export const PLAN_FEATURES: PlanFeatureItem[] = [
  {
    id: 'surah_coverage',
    category: 'Materi & Hafalan Al-Qur\'an',
    name: 'Cakupan Surah & Ayat',
    description: 'Jumlah surah dan ayat yang dapat diakses untuk latihan dan hafalan harian',
    freeValue: 'Juz 30 (37 Surah Lengkap)',
    proValue: '30 Juz Penuh (114 Surah Al-Qur\'an)',
    isProHighlight: true,
  },
  {
    id: 'ai_voice',
    category: 'Teknologi AI & Interaktif',
    name: 'Pengenal Suara AI & Koreksi Makhraj',
    description: 'Deteksi kecerdasan buatan untuk menguji keakuratan bacaan tartil anak',
    freeValue: '10 Sesi Deteksi Suara / Hari',
    proValue: 'Unlimited (Tanpa Batas Deteksi AI)',
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
