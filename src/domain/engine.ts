import type { Pack, WordItem, SortRound, Placements } from './types';

/** In-place Fisher–Yates using an injectable rng (default Math.random). */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function wordsFor(pack: Pack, sound: string): WordItem[] {
  return pack.words.filter((w) => w.beginningSound === sound);
}

export function canBuildSortRound(pack: Pack, targetSounds: string[], itemsPerSound: number): boolean {
  return targetSounds.every((s) => wordsFor(pack, s).length >= itemsPerSound);
}

export interface GenerateSortRoundParams {
  pack: Pack;
  targetSounds: string[];
  itemsPerSound?: number;
  rng?: () => number;
}

export function generateSortRound(params: GenerateSortRoundParams): SortRound {
  const { pack, targetSounds, itemsPerSound = 3, rng = Math.random } = params;

  const items: WordItem[] = [];
  for (const sound of targetSounds) {
    const pool = wordsFor(pack, sound);
    if (pool.length < itemsPerSound) {
      throw new Error(`not enough words for sound "${sound}": need ${itemsPerSound}, have ${pool.length}`);
    }
    items.push(...shuffle(pool, rng).slice(0, itemsPerSound));
  }

  return { baskets: [...targetSounds], items: shuffle(items, rng) };
}

export function isCorrectPlacement(item: WordItem, basketSound: string): boolean {
  return item.beginningSound === basketSound;
}

export function isRoundComplete(round: SortRound, placements: Placements): boolean {
  return round.items.every((item) => placements[item.id] === item.beginningSound);
}
