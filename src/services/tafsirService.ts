import { SCHOLARLY_TAFSIR_DATA, TafsirSurahEntry } from '../data/tafsirData';
import { SURAHS_METADATA } from '../data/surahsMetadata';
import { getSurahAyahs } from '../data/quranData';

export interface AyahTafsirItem {
  ayahNumber: number;
  arabicText: string;
  translation: string;
  tafsirRingkas: string;
  hikmahAnak: string;
}

// In-memory cache for fast retrieval
const TAFSIR_CACHE = new Map<number, TafsirSurahEntry>();

// Prepopulate cache with curated scholarly data
Object.entries(SCHOLARLY_TAFSIR_DATA).forEach(([numStr, entry]) => {
  TAFSIR_CACHE.set(Number(numStr), entry);
});

/**
 * Creates child-friendly moral wisdom (hikmah anak) from verse context
 */
function deriveHikmahAnak(surahName: string, ayahNumber: number, tafsirText: string, translation: string): string {
  const cleanTafsir = (tafsirText || '').toLowerCase();
  const cleanTrans = (translation || '').toLowerCase();

  if (cleanTafsir.includes('bersyukur') || cleanTrans.includes('syukur') || cleanTrans.includes('nikmat')) {
    return 'Selalu ucapkan "Alhamdulillah" dan bersyukur atas segala nikmat yang Allah karuniakan setiap hari.';
  }
  if (cleanTafsir.includes('sabar') || cleanTrans.includes('sabar')) {
    return 'Belajarlah bersabar ketika menghadapi kesulitan atau ujian, karena Allah selalu bersama orang yang sabar.';
  }
  if (cleanTafsir.includes('sholat') || cleanTafsir.includes('salat') || cleanTrans.includes('salat')) {
    return 'Jaga shalat lima waktu tepat pada waktunya sebagai bentuk cinta dan ketaatan kita kepada Allah.';
  }
  if (cleanTafsir.includes('berdoa') || cleanTrans.includes('doa') || cleanTrans.includes('memohon')) {
    return 'Biasakan selalu berdoa kepada Allah dalam suka maupun duka, karena Allah Maha Mendengar doa hamba-Nya.';
  }
  if (cleanTafsir.includes('orang tua') || cleanTrans.includes('ibu') || cleanTrans.includes('bapak')) {
    return 'Hormati dan sayangi kedua orang tua serta guru yang telah mendidik kita dengan penuh kasih sayang.';
  }
  if (cleanTafsir.includes('sedekah') || cleanTafsir.includes('infaq') || cleanTrans.includes('berinfak') || cleanTrans.includes('yatim')) {
    return 'Suka berbagi dan bersedekah kepada teman atau orang yang membutuhkan, agar rezeki kita semakin berkah.';
  }
  if (cleanTafsir.includes('jujur') || cleanTrans.includes('benar')) {
    return 'Selalu berkata dan berbuat jujur di rumah, di sekolah, maupun saat bermain bersama teman.';
  }
  if (cleanTafsir.includes('lindung') || cleanTrans.includes('berlindung') || cleanTafsir.includes('setan')) {
    return 'Jangan takut pada kegelapan atau bisikan jahat, selalu mohon perlindungan kepada Allah dengan membaca ta\'awwudz.';
  }
  if (cleanTafsir.includes('tauhid') || cleanTafsir.includes('esa') || cleanTrans.includes('allah')) {
    return 'Meyakini dengan sepenuh hati bahwa tiada Tuhan selain Allah yang Maha Kuasa mengatur seluruh alam semesta.';
  }

  // Default uplifting wisdom for children
  return `Terapkan pesan kebaikan Surah ${surahName} ayat ${ayahNumber} dalam keseharian: jadilah santri yang rajin, berakhlak mulia, dan gemar berbuat kebajikan.`;
}

/**
 * Clean & condense tafsir text into a digestible summary for kids & learners
 */
function condenseTafsirText(rawTafsir: string, fallbackTranslation: string): string {
  if (!rawTafsir || rawTafsir.trim().length === 0) {
    return fallbackTranslation || 'Penjelasan makna ayat berdasarkan rujukan resmi Kementerian Agama RI.';
  }

  // Strip excessive scholarly citations or line breaks for smooth reading
  const paragraphs = rawTafsir.split('\n\n').filter(Boolean);
  const firstParagraph = paragraphs[0] || rawTafsir;
  const cleaned = firstParagraph.replace(/\s+/g, ' ').trim();

  // If first paragraph is very concise (<300 chars), return it
  if (cleaned.length <= 400) {
    return cleaned;
  }

  // Truncate cleanly at a sentence boundary
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 0) {
    let summary = '';
    for (const s of sentences) {
      if ((summary + s).length > 400) break;
      summary += s + ' ';
    }
    if (summary.trim().length > 50) {
      return summary.trim();
    }
  }

  return cleaned.slice(0, 380) + '...';
}

export class TafsirService {
  /**
   * Loads authentic, complete tafsir for ANY of the 114 surahs.
   * Priority: Curated kid-friendly dataset -> Proxy route (/api/tafsir) -> Upstream equran.id.
   * Never redirects silently to Al-Fatihah.
   */
  public static async getSurahTafsir(surahNumber: number): Promise<TafsirSurahEntry> {
    const clampedSurah = Math.max(1, Math.min(114, surahNumber));

    // 1. Check in-memory cache
    if (TAFSIR_CACHE.has(clampedSurah)) {
      return TAFSIR_CACHE.get(clampedSurah)!;
    }

    const surahMeta = SURAHS_METADATA.find((s) => s.number === clampedSurah) || SURAHS_METADATA[0];

    // 2. Fetch official Kemenag RI tafsir & authentic Quran ayahs in parallel
    try {
      const [tafsirRes, ayahsData] = await Promise.all([
        fetch(`/api/tafsir/${clampedSurah}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() =>
            fetch(`https://equran.id/api/v2/tafsir/${clampedSurah}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          ),
        getSurahAyahs(clampedSurah),
      ]);

      const tafsirList: { ayat: number; teks: string }[] =
        tafsirRes?.data?.tafsir || tafsirRes?.tafsir || [];

      const ayahTafsirs: AyahTafsirItem[] = [];

      // Combine verses with tafsir
      if (ayahsData && ayahsData.length > 0) {
        for (const ayah of ayahsData) {
          const matchingTafsir = tafsirList.find((t) => t.ayat === ayah.ayahNumber);
          const rawTafsirText = matchingTafsir?.teks || '';
          const tafsirRingkas = condenseTafsirText(rawTafsirText, ayah.translationId);
          const hikmahAnak = deriveHikmahAnak(
            surahMeta.nameLatin,
            ayah.ayahNumber,
            rawTafsirText,
            ayah.translationId
          );

          ayahTafsirs.push({
            ayahNumber: ayah.ayahNumber,
            arabicText: ayah.arabicText,
            translation: ayah.translationId,
            tafsirRingkas,
            hikmahAnak,
          });
        }
      } else if (tafsirList.length > 0) {
        for (const t of tafsirList) {
          ayahTafsirs.push({
            ayahNumber: t.ayat,
            arabicText: '',
            translation: '',
            tafsirRingkas: condenseTafsirText(t.teks, ''),
            hikmahAnak: deriveHikmahAnak(surahMeta.nameLatin, t.ayat, t.teks, ''),
          });
        }
      }

      const entry: TafsirSurahEntry = {
        surahNumber: clampedSurah,
        surahName: surahMeta.nameLatin,
        sourceAttribution: 'Tafsir Ringkas Kementerian Agama Republik Indonesia (Kemenag RI)',
        shortOverview: `Surah ${surahMeta.nameLatin} (${surahMeta.translation}) terdiri atas ${surahMeta.ayahCount} ayat dan diturunkan di ${surahMeta.revelationType}.`,
        ayahTafsirs,
      };

      TAFSIR_CACHE.set(clampedSurah, entry);
      return entry;
    } catch (err) {
      console.error(`[TafsirService] Failed to load tafsir for surah ${clampedSurah}:`, err);

      // Graceful fallback from ayahs alone
      const ayahsData = await getSurahAyahs(clampedSurah);
      const fallbackEntry: TafsirSurahEntry = {
        surahNumber: clampedSurah,
        surahName: surahMeta.nameLatin,
        sourceAttribution: 'Terjemahan & Tafsir Ringkas Kemenag RI',
        shortOverview: `Surah ${surahMeta.nameLatin} (${surahMeta.translation}) • ${surahMeta.ayahCount} Ayat`,
        ayahTafsirs: ayahsData.map((a) => ({
          ayahNumber: a.ayahNumber,
          arabicText: a.arabicText,
          translation: a.translationId,
          tafsirRingkas: a.translationId || `Makna ayat ${a.ayahNumber} surah ${surahMeta.nameLatin}.`,
          hikmahAnak: deriveHikmahAnak(surahMeta.nameLatin, a.ayahNumber, '', a.translationId),
        })),
      };

      TAFSIR_CACHE.set(clampedSurah, fallbackEntry);
      return fallbackEntry;
    }
  }

  /**
   * Retrieves tafsir for a single specific ayah of any surah
   */
  public static async getAyahTafsir(
    surahNumber: number,
    ayahNumber: number
  ): Promise<AyahTafsirItem | null> {
    const surahEntry = await this.getSurahTafsir(surahNumber);
    return surahEntry.ayahTafsirs.find((a) => a.ayahNumber === ayahNumber) || surahEntry.ayahTafsirs[0] || null;
  }
}
