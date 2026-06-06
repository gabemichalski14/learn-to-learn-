import type { Pack } from '../../domain/types';

/**
 * CVC words grouped by their MIDDLE short vowel — the content for Vowel Patrol
 * (sort each picture to its vowel planet). Words carry only `medialVowel`; the
 * game sorts by that. ~6 per vowel gives the round generator variety so kids
 * can't memorize a picture's planet. Emojis are placeholders for the real
 * illustrated creature set.
 */
export const shortVowelWords: Pack = {
  id: 'short-vowel-words',
  name: 'Short Vowel Words',
  words: [
    // short a
    { id: 'cat', label: 'cat', medialVowel: 'a', emoji: '🐱' },
    { id: 'hat', label: 'hat', medialVowel: 'a', emoji: '🎩' },
    { id: 'bag', label: 'bag', medialVowel: 'a', emoji: '🎒' },
    { id: 'map', label: 'map', medialVowel: 'a', emoji: '🗺️' },
    { id: 'van', label: 'van', medialVowel: 'a', emoji: '🚐' },
    { id: 'jam', label: 'jam', medialVowel: 'a', emoji: '🍓' },
    // short e
    { id: 'hen', label: 'hen', medialVowel: 'e', emoji: '🐔' },
    { id: 'bed', label: 'bed', medialVowel: 'e', emoji: '🛏️' },
    { id: 'net', label: 'net', medialVowel: 'e', emoji: '🥅' },
    { id: 'pen', label: 'pen', medialVowel: 'e', emoji: '🖊️' },
    { id: 'web', label: 'web', medialVowel: 'e', emoji: '🕸️' },
    { id: 'jet', label: 'jet', medialVowel: 'e', emoji: '🛩️' },
    // short i
    { id: 'pig', label: 'pig', medialVowel: 'i', emoji: '🐷' },
    { id: 'pin', label: 'pin', medialVowel: 'i', emoji: '📌' },
    { id: 'lips', label: 'lips', medialVowel: 'i', emoji: '👄' },
    { id: 'fish', label: 'fish', medialVowel: 'i', emoji: '🐟' },
    { id: 'six', label: 'six', medialVowel: 'i', emoji: '6️⃣' },
    { id: 'milk', label: 'milk', medialVowel: 'i', emoji: '🥛' },
    // short o
    { id: 'dog', label: 'dog', medialVowel: 'o', emoji: '🐶' },
    { id: 'box', label: 'box', medialVowel: 'o', emoji: '📦' },
    { id: 'fox', label: 'fox', medialVowel: 'o', emoji: '🦊' },
    { id: 'pot', label: 'pot', medialVowel: 'o', emoji: '🍲' },
    { id: 'top', label: 'top', medialVowel: 'o', emoji: '🔝' },
    { id: 'sock', label: 'sock', medialVowel: 'o', emoji: '🧦' },
    // short u
    { id: 'sun', label: 'sun', medialVowel: 'u', emoji: '☀️' },
    { id: 'bug', label: 'bug', medialVowel: 'u', emoji: '🐛' },
    { id: 'cup', label: 'cup', medialVowel: 'u', emoji: '☕' },
    { id: 'bus', label: 'bus', medialVowel: 'u', emoji: '🚌' },
    { id: 'nut', label: 'nut', medialVowel: 'u', emoji: '🌰' },
    { id: 'duck', label: 'duck', medialVowel: 'u', emoji: '🦆' },
  ],
};
