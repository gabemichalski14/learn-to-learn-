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

export interface GenerateSortRoundParams {
  pack: Pack;
  /** Explicit target sounds. If omitted, chosen at random from the pack. */
  sounds?: string[];
  /** How many baskets. If omitted, a random 2 or 3 (capped by the pack). */
  basketCount?: number;
  /** Fewest pictures drawn for a sound (default 2). */
  minPerSound?: number;
  /** Most pictures drawn for a sound (default 4). */
  maxPerSound?: number;
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
 * The child has to actually listen.
 */
export function generateSortRound(params: GenerateSortRoundParams): SortRound {
  const { pack, rng = Math.random } = params;
  const minPerSound = params.minPerSound ?? 2;
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

  const items: WordItem[] = [];
  for (const sound of chosen) {
    const poolForSound = wordsFor(pack, sound);
    if (poolForSound.length < minPerSound) {
      throw new Error(`not enough words for sound "${sound}": need ${minPerSound}, have ${poolForSound.length}`);
    }
    const want = randInt(rng, minPerSound, Math.min(maxPerSound, poolForSound.length));
    items.push(...shuffle(poolForSound, rng).slice(0, want));
  }

  return { baskets: shuffle([...chosen], rng), items: shuffle(items, rng) };
}

export function isCorrectPlacement(item: WordItem, basketSound: string): boolean {
  return item.beginningSound === basketSound;
}

export function isRoundComplete(round: SortRound, placements: Placements): boolean {
  return round.items.every((item) => placements[item.id] === item.beginningSound);
}
