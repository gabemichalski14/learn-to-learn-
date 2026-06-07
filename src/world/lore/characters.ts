/**
 * Pip & Echo — characters with arcs and memory.
 *
 * Pip is written to reflect the dyslexic experience as a STRENGTH, grounded in
 * research (see memory `barton-games-dyslexia-character-research`): big-picture
 * pattern-seeing, spatial imagination, and storytelling are gifts; the *little
 * pieces inside words* are the slippery part. The Sound Garden went quiet when
 * those pieces scattered — and Pip didn't give up. He found a METHODICAL way that
 * mirrors structured literacy / Orton-Gillingham: one sound at a time, through
 * every sense — "hear it, say it, see it, plant it" — make it solid, then the
 * next. Difference, not deficit. No shame, ever; "not yet" beats "wrong."
 *
 * The backstory unfolds as the bond deepens (tiers gate the reveal lines), so the
 * learner gets more emotionally involved as they progress — and meets a character
 * who learns the way they do, and thrives.
 *
 * Echo is the garden's old song, returning: shy, audio-bound, brighter and surer
 * the more named sounds the learner has grown.
 */
import type { Line } from './dialogue';
import type { Persona } from './cast';

export interface Character {
  id: 'pip' | 'echo';
  name: string;
  tagline: string;
  bio: string[];     // short paragraphs for an "about" surface
  persona: Persona;  // want/need/flaw/expression — Pip & Echo have real arcs too
}

/** Bond counts at which Pip opens up more of himself. Never decays. */
export const BOND_TIERS = [0, 3, 8, 18];

export function bondTier(count: number): number {
  let tier = 0;
  for (let i = 0; i < BOND_TIERS.length; i++) if (count >= BOND_TIERS[i]) tier = i;
  return tier;
}

export const PIP: Character = {
  id: 'pip',
  name: 'Pip',
  tagline: 'Keeper of the Sound Garden',
  bio: [
    "Pip sees the whole garden at once — every path, every pattern, every story waiting in it. Big pictures come easily to him.",
    "The little pieces inside words, though — the tiny sounds — always wriggled away from him. When they scattered, the garden went quiet.",
    "So Pip found a way that works: one sound at a time. Hear it, say it, see it, plant it — make it solid, then the next. One by one, the garden wakes up.",
    "He'll tell you the truth: you have the very same gifts. We grow this place together.",
  ],
  persona: {
    want: 'to wake the whole Sound Garden back into song',
    need: 'to stop hiding that the little pieces are hard for him — and trust that leading with his gifts is enough',
    flaw: 'rushes to the big picture and gets frustrated by the tiny pieces; downplays how hard it once was for him',
    trait: 'warm and quick to wonder; lights up at patterns, goes quiet when a small sound slips away',
  },
};

export const ECHO: Character = {
  id: 'echo',
  name: 'Echo',
  tagline: 'The garden’s returning song',
  bio: [
    "Echo is the old song of the Sound Garden — the music it made before the sounds drifted apart.",
    "Echo is shy, and easy to miss, but grows clearer every time you make a sound true. Grow enough, and the whole garden sings.",
  ],
  persona: {
    want: 'to be heard — to sing again',
    need: 'to believe she still matters even when she is faint',
    flaw: 'goes quiet and hides when she is unsure she is wanted',
    trait: 'shy and shimmering; brightens with every sound you make true',
  },
};

const pct = (n: number) => Math.round(n * 100);

/**
 * Pip's line pool. Memory-aware greetings, methodical coaching, gentle idle
 * personality, planting call-backs, and bond-gated backstory reveals. The engine
 * (selectLine) gates by `when` and suppresses recent repeats.
 */
export const PIP_LINES: Line[] = [
  // --- Greetings (memory-aware) ---------------------------------------------
  {
    id: 'pip.greet.newcomer',
    speaker: 'pip',
    weight: 3,
    when: (c) => c.narrative.newcomer,
    text: () => "Oh — hello! I'm Pip, keeper of this garden. It's gone a little quiet… but you and I can wake it up. One sound at a time. 🌱",
    cta: { destId: 'levels' },
  },
  {
    id: 'pip.greet.sameday',
    speaker: 'pip',
    when: (c) => !c.narrative.newcomer && c.narrative.daysSince === 0,
    text: () => 'Back already? I love that. The garden stays warm when you visit often. 💚',
    cta: { destId: 'garden' },
  },
  {
    id: 'pip.greet.away',
    speaker: 'pip',
    weight: 2,
    when: (c) => (c.narrative.daysSince ?? 0) >= 2,
    text: (c) => `${c.narrative.daysSince} days! I kept your sounds safe. Want to grow one more today?`,
    cta: { destId: 'levels' },
  },
  {
    id: 'pip.greet.skill',
    speaker: 'pip',
    weight: 2,
    when: (c) => !c.narrative.newcomer && !!c.narrative.lastSkill,
    text: (c) => `We were growing ${c.narrative.lastSkill ? `the ${c.narrative.lastSkill} sound` : 'a sound'} together — shall we make it bloom?`,
    cta: { destId: 'levels' },
  },

  // --- The method (structured-literacy mantra, original wording) -------------
  {
    id: 'pip.method.mantra',
    speaker: 'pip',
    text: () => "Here's my trick for a tricky sound: hear it, say it, see it, plant it. Slow and sure. 🌿",
  },
  {
    id: 'pip.method.oneatatime',
    speaker: 'pip',
    text: () => "We only grow one sound at a time. When it's strong, we move on — never before. No rushing here.",
    cta: { destId: 'levels' },
  },
  {
    id: 'pip.method.notyet',
    speaker: 'pip',
    text: () => "Missed one? That's just a 'not yet.' Roots grow in the quiet. Try it once more with me. 🌱",
  },

  // --- Planting call-backs (the world remembers) ----------------------------
  {
    id: 'pip.planting.count',
    speaker: 'pip',
    weight: 2,
    when: (c) => c.plantings.length > 0,
    text: (c) => `Look — you've grown ${c.plantings.length} sound${c.plantings.length === 1 ? '' : 's'} into real flowers. Come see your garden. 🌼`,
    cta: { destId: 'garden' },
  },
  {
    id: 'pip.planting.named',
    speaker: 'pip',
    weight: 2,
    when: (c) => c.plantings.length > 0,
    text: (c) => `${c.plantings[c.plantings.length - 1].name} stood a little taller today. You planted that.`,
    cta: { destId: 'garden' },
  },

  // --- Idle personality (warm, ages 5→adult, never babyish) -----------------
  { id: 'pip.idle.pattern', speaker: 'pip', when: (c) => c.bond('pip') >= 1, text: () => 'I see patterns everywhere — clouds, leaves, the way you learn. It all rhymes if you look. 🎵' },
  { id: 'pip.idle.story', speaker: 'pip', text: () => 'Every word is a tiny story. Stretch it sloooow and you can hear all its parts.' },

  // --- Bond-gated backstory (Pip reveals himself as you grow together) ------
  {
    id: 'pip.arc.bigpicture',
    speaker: 'pip',
    weight: 2,
    when: (c) => bondTier(c.bond('pip')) >= 1,
    text: () => "Want to know a secret? I see the whole garden at once — every path and pattern. Big pictures are my favorite.",
  },
  {
    id: 'pip.arc.struggle',
    speaker: 'pip',
    weight: 2,
    when: (c) => bondTier(c.bond('pip')) >= 2,
    text: () => "The little pieces inside words, though? They always wriggled away from me. That's why the garden went quiet once. It wasn't my fault — and it isn't yours either.",
  },
  {
    id: 'pip.arc.method',
    speaker: 'pip',
    weight: 2,
    when: (c) => bondTier(c.bond('pip')) >= 3,
    text: () => "So I found my way: one sound at a time, through every sense, until it's solid. You and I learn the same way — and look how the garden's grown. 🌳",
    cta: { destId: 'garden' },
  },
  {
    id: 'pip.arc.samegifts',
    speaker: 'pip',
    when: (c) => bondTier(c.bond('pip')) >= 3 && c.plantings.length >= 3,
    text: (c) => `${c.plantings.length} flowers now, and the song is coming back. You have the same gifts I do — I knew it. 💚`,
    cta: { destId: 'garden' },
  },
];

/** Echo's pool — shy, audio-bound, brighter as the learner grows more sounds. */
export const ECHO_LINES: Line[] = [
  { id: 'echo.hush', speaker: 'echo', weight: 2, when: (c) => c.plantings.length === 0, text: () => '…(a faint, far-off hum) …' },
  { id: 'echo.clearer', speaker: 'echo', when: (c) => c.plantings.length >= 1 && c.plantings.length < 4, text: () => '…I can almost hear myself again… keep going…' },
  { id: 'echo.song', speaker: 'echo', weight: 2, when: (c) => c.plantings.length >= 4, text: () => 'There it is — the garden is starting to sing. ✨ That was you.' },
  { id: 'echo.named', speaker: 'echo', when: (c) => c.plantings.length > 0, text: (c) => `Your /${c.plantings[0].sound}/ rings clear and true now.` },
];

/** A learner-facing one-liner about how solid Pip thinks a planting is (used in
 *  garden tooltips). Pure helper kept here with the character voice. */
export function plantingPraise(name: string, score: number): string {
  return `${name} — strong and rooted (${pct(score)}%). You grew this.`;
}
