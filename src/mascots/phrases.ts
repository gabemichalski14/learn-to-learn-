/**
 * Pip & Echo's vocabulary. Warm, short, and always pointed at learning &
 * confidence — never streak-shaming or FOMO (ethical persuasion). Phrases with a
 * `to` carry a learning call-to-action; `idle` quips are just personality.
 */
export interface Phrase {
  say: string;
  cta?: string;
  to?: string;
}

export type PhraseKind = 'greet' | 'nudge' | 'celebrate' | 'idle';

const BANK: Record<PhraseKind, Phrase[]> = {
  greet: [
    { say: 'Hi again, Explorer! 👋' },
    { say: 'There you are! I was hoping you’d come back. 🌱' },
    { say: 'Hey hey! Ready to make some sounds?', cta: 'Let’s go', to: '#/levels' },
    { say: 'Ooh, it’s you! My favorite reader. 💚' },
    { say: 'Welcome back, friend!' },
    { say: 'Psst — I saved your spot.', cta: 'Continue', to: '#/levels' },
    { say: 'Good to see you! Let’s grow today. 🌿' },
  ],
  nudge: [
    { say: 'Want to grow a few sounds with me? 🌱', cta: 'Let’s play', to: '#/levels' },
    { say: 'You’ve got a great ear today. One more round?', cta: 'Pick a game', to: '#/games' },
    { say: 'Tiny steps make big readers. Try one?', cta: 'Let’s go', to: '#/levels' },
    { say: 'I know a game you’d love…', cta: 'Show me', to: '#/games' },
    { say: 'Five minutes of play = brain magic. ✨', cta: 'Play', to: '#/games' },
    { say: 'Your sounds are getting stronger. Keep going!', cta: 'Continue', to: '#/levels' },
    { say: 'Let’s find some sounds together!', cta: 'Explore levels', to: '#/levels' },
  ],
  celebrate: [
    { say: 'You DID it! 🎉' },
    { say: 'Whoa — that was amazing!' },
    { say: 'Reading superstar! ⭐' },
    { say: 'High-five! Your ears are on fire. 🔥' },
    { say: 'So proud of you. Truly. 💚' },
    { say: 'Look at you go!' },
    { say: 'That’s how it’s done, Explorer!' },
    { say: 'Brilliant listening! 👂✨' },
  ],
  idle: [
    { say: 'Sounds are everywhere if you listen. 👂' },
    { say: 'I like your style.' },
    { say: 'Did you know? Every word is a little song. 🎵' },
    { say: 'Stretch a word out s-l-o-w… it’s fun!' },
    { say: 'You’re doing better than you think. 💚' },
    { say: 'I believe in you, Explorer.' },
    { say: 'Boop! 👃' },
    { say: 'Practice makes brave, not just perfect.' },
    { say: 'Echo says hi too! ✨' },
  ],
};

let last = '';

/** A random phrase from the given kinds, avoiding an immediate repeat. */
export function randomPhrase(kinds: PhraseKind[] = ['greet', 'nudge', 'idle']): Phrase {
  const pool = kinds.flatMap((k) => BANK[k]);
  let p = pool[Math.floor(Math.random() * pool.length)];
  for (let i = 0; i < 6 && p.say === last && pool.length > 1; i++) {
    p = pool[Math.floor(Math.random() * pool.length)];
  }
  last = p.say;
  return p;
}
