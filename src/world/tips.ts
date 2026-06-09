/**
 * Pip's little tips — rotating confidence boosters, learning tricks, and fun
 * facts for the cozy Home. Dyslexia-affirming (difference-not-deficit, growth
 * mindset, no shame); structured-literacy tricks are practical and multisensory.
 * Authored only (no GenAI). Pure data + a deterministic picker.
 */
export interface Tip {
  kind: 'confidence' | 'trick' | 'fact';
  text: string;
}

export const TIPS: Tip[] = [
  { kind: 'confidence', text: "Your brain learns sounds best one at a time — and that's exactly what you're doing. 🌱" },
  { kind: 'confidence', text: 'Every "not yet" is part of getting there. Mistakes make the path clearer. 💚' },
  { kind: 'confidence', text: 'Big-picture thinkers often find the little sounds slippery — that\'s a difference, not a problem.' },
  { kind: 'confidence', text: 'A little practice, often, beats a lot all at once. You\'re growing strong roots. 🌷' },
  { kind: 'trick', text: 'Stuck on a sound? Say the word slowly and notice where your mouth moves.' },
  { kind: 'trick', text: 'Tap a word\'s beats on the table — one tap per sound. Your hands help your ears.' },
  { kind: 'trick', text: 'Can\'t catch the middle sound? Stretch the word out looong, like a rubber band.' },
  { kind: 'trick', text: 'Hear it, say it, see it, plant it — one sound at a time. That\'s Moss\'s way. 🌱' },
  { kind: 'fact', text: 'Crickets "hear" with tiny ears on their legs — Chip listens with his whole self! 🦗' },
  { kind: 'fact', text: 'Reading isn\'t automatic like talking — every reader\'s brain had to be built. You\'re building yours. 🧠' },
  { kind: 'fact', text: 'English has about 44 sounds but only 26 letters — no wonder the little sounds hide!' },
  { kind: 'fact', text: 'Lots of inventors, artists, and storytellers are dyslexic — different wiring, big imagination. ✨' },
];

const LABEL: Record<Tip['kind'], string> = {
  confidence: 'You\'ve got this',
  trick: 'Little trick',
  fact: 'Fun fact',
};
export const tipLabel = (kind: Tip['kind']) => LABEL[kind];

/** Deterministic pick (seed once per visit so it doesn't flicker on re-render). */
export function pickTip(seed: number): Tip {
  return TIPS[Math.abs(Math.floor(seed)) % TIPS.length];
}
