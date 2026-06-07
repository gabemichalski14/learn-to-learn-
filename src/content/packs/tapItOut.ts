/**
 * Tap It Out (Level 1 — Sound Garden): picture words for phoneme segmentation.
 * `sounds` is the count of SPOKEN sounds (phonemes), NOT letters — the child taps
 * once per sound they hear. Words are hand-picked for clear, unambiguous
 * segmentation across 2–4 sounds. The word is heard (oral); the emoji is its
 * picture (Level 1 shows no letters).
 */
export interface TapWord {
  id: string;
  label: string;
  sounds: number;
  emoji: string;
}

export const tapItOutWords: TapWord[] = [
  // 2 sounds
  { id: 'bee', label: 'bee', sounds: 2, emoji: '🐝' },
  { id: 'pie', label: 'pie', sounds: 2, emoji: '🥧' },
  { id: 'key', label: 'key', sounds: 2, emoji: '🔑' },
  { id: 'egg', label: 'egg', sounds: 2, emoji: '🥚' },
  { id: 'owl', label: 'owl', sounds: 2, emoji: '🦉' },
  // 3 sounds
  { id: 'cat', label: 'cat', sounds: 3, emoji: '🐱' },
  { id: 'dog', label: 'dog', sounds: 3, emoji: '🐶' },
  { id: 'sun', label: 'sun', sounds: 3, emoji: '☀️' },
  { id: 'fish', label: 'fish', sounds: 3, emoji: '🐟' },
  { id: 'ship', label: 'ship', sounds: 3, emoji: '🚢' },
  { id: 'leaf', label: 'leaf', sounds: 3, emoji: '🍃' },
  { id: 'rain', label: 'rain', sounds: 3, emoji: '🌧️' },
  { id: 'moon', label: 'moon', sounds: 3, emoji: '🌙' },
  { id: 'boat', label: 'boat', sounds: 3, emoji: '⛵' },
  { id: 'bell', label: 'bell', sounds: 3, emoji: '🔔' },
  // 4 sounds
  { id: 'frog', label: 'frog', sounds: 4, emoji: '🐸' },
  { id: 'flag', label: 'flag', sounds: 4, emoji: '🚩' },
  { id: 'hand', label: 'hand', sounds: 4, emoji: '✋' },
  { id: 'nest', label: 'nest', sounds: 4, emoji: '🪺' },
  { id: 'milk', label: 'milk', sounds: 4, emoji: '🥛' },
  { id: 'train', label: 'train', sounds: 4, emoji: '🚂' },
  { id: 'tent', label: 'tent', sounds: 4, emoji: '⛺' },
  { id: 'gift', label: 'gift', sounds: 4, emoji: '🎁' },
];
