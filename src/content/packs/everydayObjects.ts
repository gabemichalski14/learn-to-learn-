import type { Pack } from '../../domain/types';

/**
 * Starter pack chosen for clean, unambiguous single-consonant onsets
 * (b / s / m / t). Emojis are placeholders for the real illustration set.
 */
export const everydayObjects: Pack = {
  id: 'everyday-objects',
  name: 'Everyday Objects',
  words: [
    { id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' },
    { id: 'bear', label: 'bear', beginningSound: 'b', emoji: '🐻' },
    { id: 'bus',  label: 'bus',  beginningSound: 'b', emoji: '🚌' },
    { id: 'bed',  label: 'bed',  beginningSound: 'b', emoji: '🛏️' },
    { id: 'sun',  label: 'sun',  beginningSound: 's', emoji: '☀️' },
    { id: 'sock', label: 'sock', beginningSound: 's', emoji: '🧦' },
    { id: 'saw',  label: 'saw',  beginningSound: 's', emoji: '🪚' },
    { id: 'seal', label: 'seal', beginningSound: 's', emoji: '🦭' },
    { id: 'moon', label: 'moon', beginningSound: 'm', emoji: '🌙' },
    { id: 'mop',  label: 'mop',  beginningSound: 'm', emoji: '🧹' },
    { id: 'map',  label: 'map',  beginningSound: 'm', emoji: '🗺️' },
    { id: 'mug',  label: 'mug',  beginningSound: 'm', emoji: '☕' },
    { id: 'top',  label: 'top',  beginningSound: 't', emoji: '🔝' },
    { id: 'tap',  label: 'tap',  beginningSound: 't', emoji: '🚰' },
    { id: 'tent', label: 'tent', beginningSound: 't', emoji: '⛺' },
    { id: 'tire', label: 'tire', beginningSound: 't', emoji: '🛞' },
  ],
};
