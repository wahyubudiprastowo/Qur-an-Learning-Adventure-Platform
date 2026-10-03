import { Reciter } from '../types';

export const RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    name: 'Misyari Rasyid Al-Afasi',
    subname: 'Murattal - Jernih, Merdu & Mudah Diikuti',
    identifier: 'Alafasy_128kbps',
    default: true,
  },
  {
    id: 'husary',
    name: 'Mahmud Khalil Al-Husary',
    subname: 'Muallim - Lambat, Jelas & Pas untuk Belajar',
    identifier: 'Husary_128kbps',
  },
  {
    id: 'sudais',
    name: 'Abdurrahman As-Sudais',
    subname: 'Imam Masjidil Haram - Tartil Mantap & Khusyuk',
    identifier: 'Abdurrahmaan_As-Sudais_192kbps',
  },
  {
    id: 'ghamadi',
    name: 'Saad Al-Ghamdi',
    subname: 'Murattal - Lembut, Tenang & Mengalir',
    identifier: 'Ghamadi_40kbps',
  },
  {
    id: 'minshawy',
    name: 'Mohamed Siddiq Al-Minshawi',
    subname: 'Tartil Klasik - Tajwid Sangat Akurat & Tartil',
    identifier: 'Minshawy_Murattal_128kbps',
  },
];

/**
 * Returns authentic, high-quality Quran recitation audio URL for a specific ayah.
 * Uses official EveryAyah CDN with Access-Control-Allow-Origin: * for 100% reliable iframe/browser audio.
 */
export function getAyahAudioUrl(reciterId: string, surahNumber: number, ayahNumber: number): string {
  const sStr = surahNumber.toString().padStart(3, '0');
  const aStr = ayahNumber.toString().padStart(3, '0');

  const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  return `https://everyayah.com/data/${reciter.identifier}/${sStr}${aStr}.mp3`;
}

/**
 * Alternate fallback URL in case of network restriction on primary CDN
 */
export function getAyahAudioFallbackUrl(reciterId: string, surahNumber: number, ayahNumber: number): string {
  const sStr = surahNumber.toString().padStart(3, '0');
  const aStr = ayahNumber.toString().padStart(3, '0');

  if (reciterId === 'husary') {
    return `https://everyayah.com/data/Husary_Muallim_128kbps/${sStr}${aStr}.mp3`;
  }
  if (reciterId === 'sudais') {
    return `https://cdn.equran.id/audio-partial/Abdurrahman-as-Sudais/${sStr}${aStr}.mp3`;
  }
  return `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${sStr}${aStr}.mp3`;
}
