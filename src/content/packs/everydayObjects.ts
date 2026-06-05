import type { Pack } from '../../domain/types';

/**
 * Starter pack. Every word is a clean single-consonant onset (no blends) chosen
 * so a young learner hears one unambiguous beginning sound. ~6 words per sound
 * gives the round generator room to vary which pictures appear, so kids can't
 * memorize "this picture goes here." Emojis are placeholders for the real
 * illustration set.
 */
export const everydayObjects: Pack = {
  id: 'everyday-objects',
  name: 'Everyday Objects',
  words: [
    // /b/
    { id: 'bear', label: 'bear', beginningSound: 'b', emoji: '🐻' },
    { id: 'bus', label: 'bus', beginningSound: 'b', emoji: '🚌' },
    { id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' },
    { id: 'banana', label: 'banana', beginningSound: 'b', emoji: '🍌' },
    { id: 'bee', label: 'bee', beginningSound: 'b', emoji: '🐝' },
    { id: 'book', label: 'book', beginningSound: 'b', emoji: '📖' },
    // /s/
    { id: 'sun', label: 'sun', beginningSound: 's', emoji: '☀️' },
    { id: 'sock', label: 'sock', beginningSound: 's', emoji: '🧦' },
    { id: 'seal', label: 'seal', beginningSound: 's', emoji: '🦭' },
    { id: 'soap', label: 'soap', beginningSound: 's', emoji: '🧼' },
    { id: 'sandwich', label: 'sandwich', beginningSound: 's', emoji: '🥪' },
    { id: 'sailboat', label: 'sailboat', beginningSound: 's', emoji: '⛵' },
    // /m/
    { id: 'moon', label: 'moon', beginningSound: 'm', emoji: '🌙' },
    { id: 'mouse', label: 'mouse', beginningSound: 'm', emoji: '🐭' },
    { id: 'milk', label: 'milk', beginningSound: 'm', emoji: '🥛' },
    { id: 'mango', label: 'mango', beginningSound: 'm', emoji: '🥭' },
    { id: 'monkey', label: 'monkey', beginningSound: 'm', emoji: '🐵' },
    { id: 'map', label: 'map', beginningSound: 'm', emoji: '🗺️' },
    // /t/
    { id: 'tiger', label: 'tiger', beginningSound: 't', emoji: '🐯' },
    { id: 'tent', label: 'tent', beginningSound: 't', emoji: '⛺' },
    { id: 'turtle', label: 'turtle', beginningSound: 't', emoji: '🐢' },
    { id: 'taxi', label: 'taxi', beginningSound: 't', emoji: '🚕' },
    { id: 'taco', label: 'taco', beginningSound: 't', emoji: '🌮' },
    { id: 'tooth', label: 'tooth', beginningSound: 't', emoji: '🦷' },
  ],
};
