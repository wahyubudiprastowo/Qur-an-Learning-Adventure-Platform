/**
 * Seeded deterministic word-hiding algorithm for Murojaah progressive recall.
 * Prevents gaps from re-randomizing or flickering on re-renders.
 */

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Pseudo-random generator with seed
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type RecallMode = '100%' | '90%' | '80%' | '70%' | '50%' | '30%' | '0%';

export const RECALL_MODES: { label: string; mode: RecallMode; visiblePercent: number }[] = [
  { label: 'Lengkap', mode: '100%', visiblePercent: 100 },
  { label: '90%', mode: '90%', visiblePercent: 90 },
  { label: '80%', mode: '80%', visiblePercent: 80 },
  { label: '70%', mode: '70%', visiblePercent: 70 },
  { label: '50%', mode: '50%', visiblePercent: 50 },
  { label: '30%', mode: '30%', visiblePercent: 30 },
  { label: '0%', mode: '0%', visiblePercent: 0 },
];

/**
 * Computes deterministic hidden word indices.
 * @param attemptSeed Unique key e.g. `${childId}-${surahNumber}-${ayahNumber}-${mode}`
 * @param totalWords Number of words in the ayah
 * @param visiblePercent Target visible percentage (0 to 100)
 */
export function getDeterministicHiddenIndices(
  attemptSeed: string,
  totalWords: number,
  visiblePercent: number
): Set<number> {
  if (visiblePercent >= 100 || totalWords <= 0) {
    return new Set<number>();
  }
  if (visiblePercent <= 0) {
    const all = new Set<number>();
    for (let i = 0; i < totalWords; i++) all.add(i);
    return all;
  }

  const hideCount = Math.max(1, Math.round(totalWords * (1 - visiblePercent / 100)));
  const rand = mulberry32(simpleHash(attemptSeed));

  // Shuffled indices using Fisher-Yates with seeded PRNG
  const indices = Array.from({ length: totalWords }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Take the first hideCount indices to hide
  const hidden = new Set<number>(indices.slice(0, hideCount));
  return hidden;
}
