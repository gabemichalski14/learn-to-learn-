/**
 * Named plantings — the "world that remembers you." Every sound a learner truly
 * masters becomes a NAMED, persistent plant in the garden ("the /m/ marigold").
 * Derived purely from mastery (no extra writes); the garden home renders them and
 * Pip references them by name. Per-sound mastery is earned in the Space game
 * (the only place per-sound skills are recorded), then blooms here.
 */
import type { MasteryMap, SkillStat } from '../../mastery/mastery';
import { loadMastery, scoreOf } from '../../mastery/mastery';
import { parseSkillKey, type SkillKey } from '../../mastery/skills';
import type { LoreState } from './loreStore';

export interface Species {
  sound: string;
  plant: string;
  emoji: string;
  color: string;
  /** Painted flower art, when we have it; callers fall back to a sprout image. */
  image?: string;
}

/**
 * Deterministic sound → plant. A sound always grows the same species, so "the
 * /m/ marigold" is stable across sessions and devices. Not every trainable sound
 * needs an entry — FALLBACK_SPECIES covers any gap so a planting is never unnamed.
 */
export const SPECIES: Record<string, Species> = {
  m: { sound: 'm', plant: 'marigold', emoji: '🌼', color: '#f4c14b', image: '/characters/garden/marigold.png' },
  s: { sound: 's', plant: 'sunflower', emoji: '🌻', color: '#f2a93b' },
  t: { sound: 't', plant: 'tulip', emoji: '🌷', color: '#e86a8e', image: '/characters/garden/tulip.png' },
  b: { sound: 'b', plant: 'bluebell', emoji: '🪻', color: '#7c83e8' },
  p: { sound: 'p', plant: 'poppy', emoji: '🌺', color: '#e8556a' },
  n: { sound: 'n', plant: 'narcissus', emoji: '🌼', color: '#f6e07a' },
  f: { sound: 'f', plant: 'forget-me-not', emoji: '💠', color: '#6cb8e8' },
  d: { sound: 'd', plant: 'daisy', emoji: '🌼', color: '#f4f1e0' },
  r: { sound: 'r', plant: 'rose', emoji: '🌹', color: '#e0556a' },
  l: { sound: 'l', plant: 'lavender', emoji: '🪻', color: '#a98ce0' },
  c: { sound: 'c', plant: 'crocus', emoji: '🌷', color: '#c98ce0' },
  g: { sound: 'g', plant: 'gardenia', emoji: '🤍', color: '#eef3ea' },
  h: { sound: 'h', plant: 'hyacinth', emoji: '🪻', color: '#8c9ce8' },
  k: { sound: 'k', plant: 'kingcup', emoji: '🌼', color: '#f4cc4b' },
  a: { sound: 'a', plant: 'aster', emoji: '🌸', color: '#e88cb8' },
  e: { sound: 'e', plant: 'echinacea', emoji: '🌺', color: '#d98ab0' },
  i: { sound: 'i', plant: 'iris', emoji: '🪻', color: '#8c7ce0' },
  o: { sound: 'o', plant: 'orchid', emoji: '🌸', color: '#e07ab8' },
  u: { sound: 'u', plant: 'umbrella-flower', emoji: '🌼', color: '#f0c060' },
};

export const FALLBACK_SPECIES: Species = { sound: '', plant: 'sprout', emoji: '🌱', color: '#7bc47f', image: '/characters/garden/sprout.png' };

/** Painted art for a planting — its own flower if we have one, else the sprout. */
export const PLANTING_FALLBACK_IMAGE = '/characters/garden/sprout.png';

// Mirrors mastery's bar: rated (>= RATED_MIN attempts) and solid (score >= 0.8,
// the same line areasToImprove uses to decide a skill no longer "needs work").
const RATED_MIN = 5;
const MASTER_AT = 0.8;

export function isMastered(stat: SkillStat | undefined): boolean {
  return !!stat && stat.attempts >= RATED_MIN && scoreOf(stat) >= MASTER_AT;
}

export interface Planting {
  skillKey: SkillKey;
  sound: string;
  species: Species;
  name: string; // "the /m/ marigold"
}

export function speciesFor(sound: string): Species {
  return SPECIES[sound] ?? { ...FALLBACK_SPECIES, sound };
}

/** Stable id for a planting's one-time "it bloomed!" beat. */
export function plantingId(p: Planting): string {
  return `bloom:${p.skillKey}`;
}

/** Named plantings derived from a mastery map. Only per-sound skills bloom; the
 *  list is sorted by sound so rendering/tests are deterministic. */
export function plantingsFromMastery(mastery: MasteryMap): Planting[] {
  const out: Planting[] = [];
  for (const [skillKey, stat] of Object.entries(mastery)) {
    const parsed = parseSkillKey(skillKey);
    if (!parsed) continue; // segmenting / non-sound skills don't bloom
    if (!isMastered(stat)) continue;
    const species = speciesFor(parsed.soundId);
    out.push({ skillKey, sound: parsed.soundId, species, name: `the /${parsed.soundId}/ ${species.plant}` });
  }
  return out.sort((a, b) => a.sound.localeCompare(b.sound) || a.skillKey.localeCompare(b.skillKey));
}

export function plantingsFor(learnerId: string): Planting[] {
  return plantingsFromMastery(loadMastery(learnerId));
}

/** Plantings whose one-time bloom beat hasn't been shown yet. */
export function unacknowledgedPlantings(plantings: Planting[], lore: LoreState): Planting[] {
  return plantings.filter((p) => !lore.acknowledged.includes(plantingId(p)));
}
