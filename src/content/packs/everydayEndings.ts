import type { Pack } from '../../domain/types';

/**
 * Ending-sounds pack — pictures grouped by the LAST sound the learner hears.
 * Ending sounds are drawn from the starter phoneme set (/t/ /n/ /p/ /m/), each
 * with ~6 picturable words so the round generator can vary which appear.
 * Our own word/picture selection; emojis are placeholders for real art.
 */
export const everydayEndings: Pack = {
  id: 'everyday-endings',
  name: 'Everyday Endings',
  words: [
    // ends with /t/
    { id: 'e-cat', label: 'cat', endingSound: 't', emoji: '🐱' },
    { id: 'e-hat', label: 'hat', endingSound: 't', emoji: '🎩' },
    { id: 'e-goat', label: 'goat', endingSound: 't', emoji: '🐐' },
    { id: 'e-boat', label: 'boat', endingSound: 't', emoji: '⛵' },
    { id: 'e-kite', label: 'kite', endingSound: 't', emoji: '🪁' },
    { id: 'e-foot', label: 'foot', endingSound: 't', emoji: '🦶' },
    // ends with /n/
    { id: 'e-sun', label: 'sun', endingSound: 'n', emoji: '☀️' },
    { id: 'e-moon', label: 'moon', endingSound: 'n', emoji: '🌙' },
    { id: 'e-crown', label: 'crown', endingSound: 'n', emoji: '👑' },
    { id: 'e-lion', label: 'lion', endingSound: 'n', emoji: '🦁' },
    { id: 'e-corn', label: 'corn', endingSound: 'n', emoji: '🌽' },
    { id: 'e-train', label: 'train', endingSound: 'n', emoji: '🚂' },
    // ends with /p/
    { id: 'e-cup', label: 'cup', endingSound: 'p', emoji: '☕' },
    { id: 'e-ship', label: 'ship', endingSound: 'p', emoji: '🚢' },
    { id: 'e-sheep', label: 'sheep', endingSound: 'p', emoji: '🐑' },
    { id: 'e-soap', label: 'soap', endingSound: 'p', emoji: '🧼' },
    { id: 'e-mop', label: 'mop', endingSound: 'p', emoji: '🧹' },
    { id: 'e-cap', label: 'cap', endingSound: 'p', emoji: '🧢' },
    // ends with /m/
    { id: 'e-drum', label: 'drum', endingSound: 'm', emoji: '🥁' },
    { id: 'e-ham', label: 'ham', endingSound: 'm', emoji: '🍖' },
    { id: 'e-worm', label: 'worm', endingSound: 'm', emoji: '🪱' },
    { id: 'e-gem', label: 'gem', endingSound: 'm', emoji: '💎' },
    { id: 'e-arm', label: 'arm', endingSound: 'm', emoji: '💪' },
    { id: 'e-thumb', label: 'thumb', endingSound: 'm', emoji: '👍' },
  ],
};
