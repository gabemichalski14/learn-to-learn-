/**
 * Pip-as-guide: the places Pip can walk you to, plus a forgiving keyword router
 * so a learner can *ask* ("take me to my garden", "I want to play") and Pip
 * figures out where. Pure + deterministic so it's easy to test; the UI layers
 * the mascot-led wipe (useGuide) on top.
 */
export interface Dest {
  label: string;
  to: string;
  emoji: string;
  keys: string[];
}

/** Kid-facing destinations only (no tutor/account surfaces). Order = chip order. */
export const PIP_DESTINATIONS: Dest[] = [
  { label: 'Levels', to: '#/levels', emoji: '🗺️', keys: ['level', 'levels', 'map', 'world', 'worlds', 'garden', 'space', 'patrol'] },
  { label: 'Games', to: '#/games', emoji: '🎮', keys: ['game', 'games', 'play', 'practice', 'sounds', 'sort'] },
  { label: 'Leaderboard', to: '#/leaderboard', emoji: '🏆', keys: ['leaderboard', 'board', 'score', 'scores', 'ranking', 'rank', 'stars', 'win'] },
  { label: 'My progress', to: '#/profile', emoji: '🌱', keys: ['progress', 'profile', 'grown', 'flowers', 'stickers', 'badges', 'mastery'] },
  { label: 'Home', to: '#/', emoji: '🏡', keys: ['home', 'start', 'beginning', 'back', 'main'] },
];

/**
 * Map a free-text request to a destination by keyword overlap. Returns the
 * best match, or null when nothing is recognized (UI then shows the chips).
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
