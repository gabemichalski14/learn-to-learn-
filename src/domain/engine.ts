import type { Pack, WordItem, SortRound, Placements } from './types';

/** In-place Fisher–Yates copy using an injectable rng (default Math.random). */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(rng: () => number, lo: number, hi: number): number {
  if (hi <= lo) return lo;
  return lo + Math.floor(rng() * (hi - lo + 1));
}

function wordsFor(pack: Pack, sound: string): WordItem[] {
  return pack.words.filter((w) => w.beginningSound === sound);
}

/** Sounds in the pack that have at least `minWords` words available. */
export function availableSounds(pack: Pack, minWords = 1): string[] {
  const counts = new Map<string, number>();
  for (const w of pack.words) counts.set(w.beginningSound, (counts.get(w.beginningSound) ?? 0) + 1);
  return [...counts.entries()].filter(([, n]) => n >= minWords).map(([s]) => s);
}

export function canBuildSortRound(pack: Pack, sounds: string[], minPerSound: number): boolean {
  return sounds.every((s) => wordsFor(pack, s).length >= minPerSound);
}

/**
 * Spread `total` items across baskets, each getting at least 1 (capacity & total
 * permitting), then scatter the remainder at random so splits come out uneven
 * (e.g. 2+4, 1+2+3) rather than a predictable even split. Respects per-basket caps.
 */
function distribute(total: number, caps: number[], rng: () => number): number[] {
  const n = caps.length;
  const counts = caps.map(() => 0);
  let left = total;
  for (let i = 0; i < n && left > 0; i++) {
    if (caps[i] > 0) { counts[i] = 1; left -= 1; }
  }
  let guard = 0;
  while (left > 0 && guard++ < 10000) {
    if (counts.every((c, i) => c >= caps[i])) break;
    const i = Math.floor(rng() * n);
    if (counts[i] < caps[i]) { counts[i] += 1; left -= 1; }
  }
  return counts;
}

export interface GenerateSortRoundParams {
  pack: Pack;
  /** Explicit target sounds. If omitted, chosen at random from the pack. */
  sounds?: string[];
  /** How many baskets. If omitted, a random 2 or 3 (capped by the pack). */
  basketCount?: number;
  /** Fewest pictures drawn for a sound (default 2, or 1 when totalItems is set). */
  minPerSound?: number;
  /** Most pictures drawn for a sound (default 4). Ignored when totalItems is set. */
  maxPerSound?: number;
  /** Exact number of pictures in the round, spread unevenly across the baskets. */
  totalItems?: number;
  rng?: () => number;
}

/**
 * Builds a Mode-A round designed to defeat pattern-cheating:
 *  - target sounds are chosen at random (not always the same letters),
 *  - each sound gets an UNEQUAL, hidden number of pictures (so counting the
 *    tray never reveals the answer),
 *  - basket display order is shuffled (so position is never a cue),
 *  - pictures are drawn from a larger pool (so the same picture isn't always
 *    in the same basket).
 * Pass `totalItems` to fix the picture count per round (e.g. 6 per page).
 */
export function generateSortRound(params: GenerateSortRoundParams): SortRound {
  const { pack, rng = Math.random } = params;
  const usingTotal = params.totalItems != null;
  const minPerSound = params.minPerSound ?? (usingTotal ? 1 : 2);
  const maxPerSound = params.maxPerSound ?? 4;

  const pool = availableSounds(pack, minPerSound);
  if (pool.length < 2) {
    throw new Error(`pack needs at least 2 sounds with >= ${minPerSound} words; has ${pool.length}`);
  }

  const maxBaskets = Math.min(3, pool.length);
  const requested = params.basketCount ?? randInt(rng, 2, maxBaskets);
  const basketCount = Math.max(2, Math.min(requested, pool.length));

  const chosen = (params.sounds ?? shuffle(pool, rng).slice(0, basketCount)).slice();
  if (chosen.length < 2) {
    throw new Error('a round needs at least 2 target sounds');
  }

  const caps = chosen.map((s) => wordsFor(pack, s).length);
  caps.forEach((cap, i) => {
    if (cap < minPerSound) {
      throw new Error(`not enough words for sound "${chosen[i]}": need ${minPerSound}, have ${cap}`);
    }
  });

  const counts = usingTotal
    ? distribute(Math.min(params.totalItems as number, caps.reduce((a, b) => a + b, 0)), caps, rng)
    : chosen.map((_, i) => randInt(rng, minPerSound, Math.min(maxPerSound, caps[i])));

  const items: WordItem[] = [];
  chosen.forEach((sound, i) => {
    items.push(...shuffle(wordsFor(pack, sound), rng).slice(0, counts[i]));
  });

  return { baskets: shuffle([...chosen], rng), items: shuffle(items, rng) };
}

export function isCorrectPlacement(item: WordItem, basketSound: string): boolean {
  return item.beginningSound === basketSound;
}

export function isRoundComplete(round: SortRound, placements: Placements): boolean {
  return round.items.every((item) => placements[item.id] === item.beginningSound);
}
