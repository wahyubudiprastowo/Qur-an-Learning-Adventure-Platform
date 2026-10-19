import { MemorizationBlock } from '../types';

export const MEMORIZATION_BLOCKS: Record<number, MemorizationBlock[]> = {
  // Al-Fatihah (7 ayahs)
  1: [
    { id: '1-1', surahNumber: 1, blockNumber: 1, startAyah: 1, endAyah: 4, name: 'Blok 1 (Ayat 1–4)' },
    { id: '1-2', surahNumber: 1, blockNumber: 2, startAyah: 5, endAyah: 7, name: 'Blok 2 (Ayat 5–7)' },
  ],
  // Al-Kahf (110 ayahs) - matches the product screenshot specifications!
  18: [
    { id: '18-1', surahNumber: 18, blockNumber: 1, startAyah: 1, endAyah: 4, name: 'Blok 1 (Ayat 1–4)' },
    { id: '18-2', surahNumber: 18, blockNumber: 2, startAyah: 5, endAyah: 7, name: 'Blok 2 (Ayat 5–7)' },
    { id: '18-3', surahNumber: 18, blockNumber: 3, startAyah: 8, endAyah: 10, name: 'Blok 3 (Ayat 8–10)' },
    { id: '18-4', surahNumber: 18, blockNumber: 4, startAyah: 11, endAyah: 13, name: 'Blok 4 (Ayat 11–13)' },
    { id: '18-5', surahNumber: 18, blockNumber: 5, startAyah: 14, endAyah: 16, name: 'Blok 5 (Ayat 14–16)' },
    { id: '18-6', surahNumber: 18, blockNumber: 6, startAyah: 17, endAyah: 18, name: 'Blok 6 (Ayat 17–18)' },
    { id: '18-7', surahNumber: 18, blockNumber: 7, startAyah: 19, endAyah: 20, name: 'Blok 7 (Ayat 19–20)' },
    { id: '18-8', surahNumber: 18, blockNumber: 8, startAyah: 21, endAyah: 21, name: 'Blok 8 (Ayat 21)' },
    { id: '18-9', surahNumber: 18, blockNumber: 9, startAyah: 22, endAyah: 22, name: 'Blok 9 (Ayat 22)' },
    { id: '18-10', surahNumber: 18, blockNumber: 10, startAyah: 23, endAyah: 24, name: 'Blok 10 (Ayat 23–24)' },
    { id: '18-11', surahNumber: 18, blockNumber: 11, startAyah: 25, endAyah: 25, name: 'Blok 11 (Ayat 25)' },
    { id: '18-12', surahNumber: 18, blockNumber: 12, startAyah: 26, endAyah: 26, name: 'Blok 12 (Ayat 26)' },
    { id: '18-13', surahNumber: 18, blockNumber: 13, startAyah: 27, endAyah: 28, name: 'Blok 13 (Ayat 27–28)' },
    { id: '18-14', surahNumber: 18, blockNumber: 14, startAyah: 29, endAyah: 31, name: 'Blok 14 (Ayat 29–31)' },
    { id: '18-15', surahNumber: 18, blockNumber: 15, startAyah: 32, endAyah: 34, name: 'Blok 15 (Ayat 32–34)' },
    { id: '18-16', surahNumber: 18, blockNumber: 16, startAyah: 35, endAyah: 37, name: 'Blok 16 (Ayat 35–37)' },
    { id: '18-17', surahNumber: 18, blockNumber: 17, startAyah: 38, endAyah: 40, name: 'Blok 17 (Ayat 38–40)' },
    { id: '18-18', surahNumber: 18, blockNumber: 18, startAyah: 41, endAyah: 43, name: 'Blok 18 (Ayat 41–43)' },
    { id: '18-19', surahNumber: 18, blockNumber: 19, startAyah: 44, endAyah: 46, name: 'Blok 19 (Ayat 44–46)' },
    { id: '18-20', surahNumber: 18, blockNumber: 20, startAyah: 47, endAyah: 49, name: 'Blok 20 (Ayat 47–49)' },
    { id: '18-21', surahNumber: 18, blockNumber: 21, startAyah: 50, endAyah: 52, name: 'Blok 21 (Ayat 50–52)' },
    { id: '18-22', surahNumber: 18, blockNumber: 22, startAyah: 53, endAyah: 55, name: 'Blok 22 (Ayat 53–55)' },
    { id: '18-23', surahNumber: 18, blockNumber: 23, startAyah: 56, endAyah: 58, name: 'Blok 23 (Ayat 56–58)' },
    { id: '18-24', surahNumber: 18, blockNumber: 24, startAyah: 59, endAyah: 61, name: 'Blok 24 (Ayat 59–61)' },
    { id: '18-25', surahNumber: 18, blockNumber: 25, startAyah: 62, endAyah: 64, name: 'Blok 25 (Ayat 62–64)' },
    { id: '18-26', surahNumber: 18, blockNumber: 26, startAyah: 65, endAyah: 68, name: 'Blok 26 (Ayat 65–68)' },
    { id: '18-27', surahNumber: 18, blockNumber: 27, startAyah: 69, endAyah: 72, name: 'Blok 27 (Ayat 69–72)' },
    { id: '18-28', surahNumber: 18, blockNumber: 28, startAyah: 73, endAyah: 76, name: 'Blok 28 (Ayat 73–76)' },
    { id: '18-29', surahNumber: 18, blockNumber: 29, startAyah: 77, endAyah: 80, name: 'Blok 29 (Ayat 77–80)' },
    { id: '18-30', surahNumber: 18, blockNumber: 30, startAyah: 81, endAyah: 83, name: 'Blok 30 (Ayat 81–83)' },
    { id: '18-31', surahNumber: 18, blockNumber: 31, startAyah: 84, endAyah: 87, name: 'Blok 31 (Ayat 84–87)' },
    { id: '18-32', surahNumber: 18, blockNumber: 32, startAyah: 88, endAyah: 91, name: 'Blok 32 (Ayat 88–91)' },
    { id: '18-33', surahNumber: 18, blockNumber: 33, startAyah: 92, endAyah: 95, name: 'Blok 33 (Ayat 92–95)' },
    { id: '18-34', surahNumber: 18, blockNumber: 34, startAyah: 96, endAyah: 99, name: 'Blok 34 (Ayat 96–99)' },
    { id: '18-35', surahNumber: 18, blockNumber: 35, startAyah: 100, endAyah: 103, name: 'Blok 35 (Ayat 100–103)' },
    { id: '18-36', surahNumber: 18, blockNumber: 36, startAyah: 104, endAyah: 106, name: 'Blok 36 (Ayat 104–106)' },
    { id: '18-37', surahNumber: 18, blockNumber: 37, startAyah: 107, endAyah: 110, name: 'Blok 37 (Ayat 107–110)' },
  ],
  // An-Nas (6 ayahs)
  114: [
    { id: '114-1', surahNumber: 114, blockNumber: 1, startAyah: 1, endAyah: 3, name: 'Blok 1 (Ayat 1–3)' },
    { id: '114-2', surahNumber: 114, blockNumber: 2, startAyah: 4, endAyah: 6, name: 'Blok 2 (Ayat 4–6)' },
  ],
  // Al-Falaq (5 ayahs)
  113: [
    { id: '113-1', surahNumber: 113, blockNumber: 1, startAyah: 1, endAyah: 5, name: 'Blok 1 (Ayat 1–5)' },
  ],
  // Al-Ikhlas (4 ayahs)
  112: [
    { id: '112-1', surahNumber: 112, blockNumber: 1, startAyah: 1, endAyah: 4, name: 'Blok 1 (Ayat 1–4)' },
  ],
  // Al-Masad (5 ayahs)
  111: [
    { id: '111-1', surahNumber: 111, blockNumber: 1, startAyah: 1, endAyah: 3, name: 'Blok 1 (Ayat 1–3)' },
    { id: '111-2', surahNumber: 111, blockNumber: 2, startAyah: 4, endAyah: 5, name: 'Blok 2 (Ayat 4–5)' },
  ],
  // An-Nasr (3 ayahs)
  110: [
    { id: '110-1', surahNumber: 110, blockNumber: 1, startAyah: 1, endAyah: 3, name: 'Blok 1 (Ayat 1–3)' },
  ],
  // Al-Kafirun (6 ayahs)
  109: [
    { id: '109-1', surahNumber: 109, blockNumber: 1, startAyah: 1, endAyah: 3, name: 'Blok 1 (Ayat 1–3)' },
    { id: '109-2', surahNumber: 109, blockNumber: 2, startAyah: 4, endAyah: 6, name: 'Blok 2 (Ayat 4–6)' },
  ],
  // Al-Kawthar (3 ayahs)
  108: [
    { id: '108-1', surahNumber: 108, blockNumber: 1, startAyah: 1, endAyah: 3, name: 'Blok 1 (Ayat 1–3)' },
  ],
  // Al-Ma'un (7 ayahs)
  107: [
    { id: '107-1', surahNumber: 107, blockNumber: 1, startAyah: 1, endAyah: 3, name: 'Blok 1 (Ayat 1–3)' },
    { id: '107-2', surahNumber: 107, blockNumber: 2, startAyah: 4, endAyah: 7, name: 'Blok 2 (Ayat 4–7)' },
  ],
  // Quraysh (4 ayahs)
  106: [
    { id: '106-1', surahNumber: 106, blockNumber: 1, startAyah: 1, endAyah: 4, name: 'Blok 1 (Ayat 1–4)' },
  ],
  // Al-Fil (5 ayahs)
  105: [
    { id: '105-1', surahNumber: 105, blockNumber: 1, startAyah: 1, endAyah: 3, name: 'Blok 1 (Ayat 1–3)' },
    { id: '105-2', surahNumber: 105, blockNumber: 2, startAyah: 4, endAyah: 5, name: 'Blok 2 (Ayat 4–5)' },
  ],
  // Al-Humazah (9 ayahs)
  104: [
    { id: '104-1', surahNumber: 104, blockNumber: 1, startAyah: 1, endAyah: 4, name: 'Blok 1 (Ayat 1–4)' },
    { id: '104-2', surahNumber: 104, blockNumber: 2, startAyah: 5, endAyah: 9, name: 'Blok 2 (Ayat 5–9)' },
  ],
  // Al-'Asr (3 ayahs)
  103: [
    { id: '103-1', surahNumber: 103, blockNumber: 1, startAyah: 1, endAyah: 3, name: 'Blok 1 (Ayat 1–3)' },
  ],
  // At-Takathur (8 ayahs)
  102: [
    { id: '102-1', surahNumber: 102, blockNumber: 1, startAyah: 1, endAyah: 4, name: 'Blok 1 (Ayat 1–4)' },
    { id: '102-2', surahNumber: 102, blockNumber: 2, startAyah: 5, endAyah: 8, name: 'Blok 2 (Ayat 5–8)' },
  ],
  // Al-Qari'ah (11 ayahs)
  101: [
    { id: '101-1', surahNumber: 101, blockNumber: 1, startAyah: 1, endAyah: 5, name: 'Blok 1 (Ayat 1–5)' },
    { id: '101-2', surahNumber: 101, blockNumber: 2, startAyah: 6, endAyah: 11, name: 'Blok 2 (Ayat 6–11)' },
  ],
  // Al-Adiyat (11 ayahs)
  100: [
    { id: '100-1', surahNumber: 100, blockNumber: 1, startAyah: 1, endAyah: 5, name: 'Blok 1 (Ayat 1–5)' },
    { id: '100-2', surahNumber: 100, blockNumber: 2, startAyah: 6, endAyah: 11, name: 'Blok 2 (Ayat 6–11)' },
  ],
  // Az-Zalzalah (8 ayahs)
  99: [
    { id: '99-1', surahNumber: 99, blockNumber: 1, startAyah: 1, endAyah: 4, name: 'Blok 1 (Ayat 1–4)' },
    { id: '99-2', surahNumber: 99, blockNumber: 2, startAyah: 5, endAyah: 8, name: 'Blok 2 (Ayat 5–8)' },
  ],
  // Al-Bayyinah (8 ayahs)
  98: [
    { id: '98-1', surahNumber: 98, blockNumber: 1, startAyah: 1, endAyah: 4, name: 'Blok 1 (Ayat 1–4)' },
    { id: '98-2', surahNumber: 98, blockNumber: 2, startAyah: 5, endAyah: 8, name: 'Blok 2 (Ayat 5–8)' },
  ],
  // Al-Qadr (5 ayahs)
  97: [
    { id: '97-1', surahNumber: 97, blockNumber: 1, startAyah: 1, endAyah: 3, name: 'Blok 1 (Ayat 1–3)' },
    { id: '97-2', surahNumber: 97, blockNumber: 2, startAyah: 4, endAyah: 5, name: 'Blok 2 (Ayat 4–5)' },
  ],
  // Al-'Alaq (19 ayahs)
  96: [
    { id: '96-1', surahNumber: 96, blockNumber: 1, startAyah: 1, endAyah: 5, name: 'Blok 1 (Ayat 1–5)' },
    { id: '96-2', surahNumber: 96, blockNumber: 2, startAyah: 6, endAyah: 10, name: 'Blok 2 (Ayat 6–10)' },
    { id: '96-3', surahNumber: 96, blockNumber: 3, startAyah: 11, endAyah: 14, name: 'Blok 3 (Ayat 11–14)' },
    { id: '96-4', surahNumber: 96, blockNumber: 4, startAyah: 15, endAyah: 19, name: 'Blok 4 (Ayat 15–19)' },
  ],
  // At-Tin (8 ayahs)
  95: [
    { id: '95-1', surahNumber: 95, blockNumber: 1, startAyah: 1, endAyah: 4, name: 'Blok 1 (Ayat 1–4)' },
    { id: '95-2', surahNumber: 95, blockNumber: 2, startAyah: 5, endAyah: 8, name: 'Blok 2 (Ayat 5–8)' },
  ],
  // Al-Insyirah (8 ayahs)
  94: [
    { id: '94-1', surahNumber: 94, blockNumber: 1, startAyah: 1, endAyah: 4, name: 'Blok 1 (Ayat 1–4)' },
    { id: '94-2', surahNumber: 94, blockNumber: 2, startAyah: 5, endAyah: 8, name: 'Blok 2 (Ayat 5–8)' },
  ],
  // Ad-Duha (11 ayahs)
  93: [
    { id: '93-1', surahNumber: 93, blockNumber: 1, startAyah: 1, endAyah: 5, name: 'Blok 1 (Ayat 1–5)' },
    { id: '93-2', surahNumber: 93, blockNumber: 2, startAyah: 6, endAyah: 11, name: 'Blok 2 (Ayat 6–11)' },
  ],
  // Al-Mulk (30 ayahs)
  67: [
    { id: '67-1', surahNumber: 67, blockNumber: 1, startAyah: 1, endAyah: 3, name: 'Blok 1 (Ayat 1–3)' },
    { id: '67-2', surahNumber: 67, blockNumber: 2, startAyah: 4, endAyah: 6, name: 'Blok 2 (Ayat 4–6)' },
    { id: '67-3', surahNumber: 67, blockNumber: 3, startAyah: 7, endAyah: 10, name: 'Blok 3 (Ayat 7–10)' },
    { id: '67-4', surahNumber: 67, blockNumber: 4, startAyah: 11, endAyah: 14, name: 'Blok 4 (Ayat 11–14)' },
    { id: '67-5', surahNumber: 67, blockNumber: 5, startAyah: 15, endAyah: 19, name: 'Blok 5 (Ayat 15–19)' },
    { id: '67-6', surahNumber: 67, blockNumber: 6, startAyah: 20, endAyah: 23, name: 'Blok 6 (Ayat 20–23)' },
    { id: '67-7', surahNumber: 67, blockNumber: 7, startAyah: 24, endAyah: 27, name: 'Blok 7 (Ayat 24–27)' },
    { id: '67-8', surahNumber: 67, blockNumber: 8, startAyah: 28, endAyah: 30, name: 'Blok 8 (Ayat 28–30)' },
  ],
};

/**
 * Deterministically retrieves or generates memorization blocks for any surah
 */
export function getBlocksForSurah(surahNumber: number, ayahCount: number): MemorizationBlock[] {
  const existing = MEMORIZATION_BLOCKS[surahNumber];
  if (existing) {
    return existing.map((b, idx) => ({
      ...b,
      nodeId: b.nodeId || `hafalan-block-${b.id}`,
      difficulty: b.difficulty || (surahNumber === 1 ? 1 : surahNumber >= 111 ? 1 : surahNumber >= 105 ? 2 : surahNumber >= 97 ? 3 : surahNumber >= 93 ? 4 : 5),
      prereq: b.prereq || (surahNumber === 1 && idx === 0
        ? ['vocab-1', 'vocab-2', 'vocab-3', 'iqra-jilid-1', 'tajwid-makharij']
        : idx > 0
        ? [`hafalan-block-${existing[idx - 1].id}`]
        : ['hafalan-block-1-2']),
    }));
  }

  // Generates clean 3-4 ayah blocks for any of the other surahs
  const blocks: MemorizationBlock[] = [];
  const chunkSize = ayahCount <= 6 ? 3 : ayahCount <= 20 ? 4 : 5;
  let currentStart = 1;
  let blockNum = 1;

  while (currentStart <= ayahCount) {
    const end = Math.min(currentStart + chunkSize - 1, ayahCount);
    const blockId = `${surahNumber}-${blockNum}`;
    const prevBlockId = blockNum > 1 ? `${surahNumber}-${blockNum - 1}` : undefined;
    blocks.push({
      id: blockId,
      nodeId: `hafalan-block-${blockId}`,
      difficulty: surahNumber >= 100 ? 2 : surahNumber >= 78 ? 3 : 4,
      prereq: prevBlockId ? [`hafalan-block-${prevBlockId}`] : ['hafalan-block-1-2'],
      surahNumber,
      blockNumber: blockNum,
      startAyah: currentStart,
      endAyah: end,
      name: `Blok ${blockNum} (Ayat ${currentStart}${end > currentStart ? `–${end}` : ''})`,
    });
    currentStart = end + 1;
    blockNum++;
  }

  return blocks;
}
