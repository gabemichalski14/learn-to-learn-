/**
 * Pip-as-guide: the places Pip can walk you to, plus a forgiving keyword router
 * so a learner can *ask* ("take me to my garden", "I want to play") and Pip
 * figures out where. Pure + deterministic so it's easy to test; the UI layers
 * the mascot-led wipe (useGuide) on top.
 *
 * Reliability contract (tested): the place Pip *names* is the place he *goes*.
 * Each destination owns a disjoint keyword set, every destination's own label
 * routes back to itself, and the worlds (Garden / Space) route to their actual
 * hubs — not the generic Levels list — so "take me to my garden" lands in the
 * garden.
 */
export interface Dest {
  id: string;
  label: string;
  to: string;
  emoji: string;
  keys: string[];
}

/** Kid-facing destinations only (no tutor/account surfaces). Order = chip order. */
export const PIP_DESTINATIONS: Dest[] = [
  { id: 'garden', label: 'My Garden', to: '#/level/1', emoji: '🌻', keys: ['garden', 'meadow', 'flowers', 'flower', 'plant', 'plants', 'planting', 'bloom', 'blooms', 'grow', 'growing', 'sprout'] },
  { id: 'space', label: 'Space Patrol', to: '#/level/2', emoji: '🚀', keys: ['space', 'rocket', 'rockets', 'star', 'stars', 'planet', 'planets', 'galaxy', 'patrol', 'astronaut', 'moon'] },
  { id: 'games', label: 'Games', to: '#/games', emoji: '🎮', keys: ['game', 'games', 'play', 'practice', 'sort', 'round'] },
  { id: 'levels', label: 'Levels', to: '#/levels', emoji: '🗺️', keys: ['level', 'levels', 'map', 'world', 'worlds', 'chapter', 'chapters', 'journey'] },
  { id: 'leaderboard', label: 'Leaderboard', to: '#/leaderboard', emoji: '🏆', keys: ['leaderboard', 'board', 'score', 'scores', 'ranking', 'rank', 'win', 'winners', 'trophy'] },
  { id: 'progress', label: 'My progress', to: '#/profile', emoji: '🌱', keys: ['progress', 'profile', 'grown', 'stickers', 'sticker', 'badges', 'badge', 'mastery', 'journal'] },
  { id: 'home', label: 'Home', to: '#/', emoji: '🏡', keys: ['home', 'start', 'beginning', 'back', 'main', 'house'] },
];

/** Look up a destination by its stable id. Lets callers (dialogue CTAs) reference
 *  a place by id so the spoken place and the navigation target stay the same
 *  object by construction. Returns null for an unknown id. */
export function destById(id: string): Dest | null {
  return PIP_DESTINATIONS.find((d) => d.id === id) ?? null;
}

/**
 * Map a free-text request to a destination by keyword overlap. Returns the
 * best match, or null when nothing is recognized.
 */
export function matchDestination(query: string): Dest | null {
  const words = query.toLowerCase().match(/[a-z]+/g);
  if (!words) return null;
  const wordSet = new Set(words);
  let best: Dest | null = null;
  let bestScore = 0;
  for (const dest of PIP_DESTINATIONS) {
    let score = 0;
    for (const key of dest.keys) if (wordSet.has(key)) score++;
    if (score > bestScore) { bestScore = score; best = dest; }
  }
  return bestScore > 0 ? best : null;
}

/**
 * Live type-ahead: every destination whose label or a keyword matches the
 * (partial) query, ranked best-first. Empty query → no suggestions (Pip never
 * shows a grid of places to pick from — you type where you want to go). Powers
 * the search box where the matched letters are highlighted as you type.
 */
export function searchDestinations(query: string): Dest[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { d: Dest; s: number }[] = [];
  for (const d of PIP_DESTINATIONS) {
    const label = d.label.toLowerCase();
    let s = -1;
    if (label.startsWith(q)) s = 4;
    else if (label.includes(q)) s = 3;
    else if (d.keys.some((k) => k === q)) s = 2.5;
    else if (d.keys.some((k) => k.startsWith(q))) s = 2;
    else if (d.keys.some((k) => k.includes(q))) s = 1;
    if (s >= 0) scored.push({ d, s });
  }
  return scored.sort((a, b) => b.s - a.s).map((x) => x.d);
}
