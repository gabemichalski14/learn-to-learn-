/**
 * The cast — one emotionally-resonant character per level (Pip stays the constant
 * companion across the whole journey; these are the friends you meet, help, and
 * bring home). Each is built from a DIFFERENT psychology lever and embodies a
 * DIFFERENT dyslexic strength, so climbing the levels affirms the whole spectrum
 * of how the learner's mind works. A character has a wound the level's Barton
 * skill heals; the level's games dramatize helping them (no-fail, empathy-driven
 * — you help because you care, à la Spiritfarer). When healed, they join your
 * Garden home (blooming as the named planting).
 *
 * Research: mascot/parasocial trust, companion-design contrast, Spiritfarer's
 * empathy loop, Bandura self-efficacy (vicarious mastery + encouragement), growth
 * mindset. See memory `barton-games-*` + the narrative spec.
 */
import type { SkillKey } from '../../mastery/skills';
import type { MasteryMap } from '../../mastery/mastery';
import { isMastered } from './plantings';
import type { LoreState, StoryStage } from './loreStore';

/** The compelling-character spine (want vs need + a flaw + how they show emotion).
 *  Drives writing and gives the cast real arcs people follow. */
export interface Persona {
  want: string;   // the surface goal they chase
  need: string;   // the deeper thing they actually need (the heart of the arc)
  flaw: string;   // how they get in their own way
  trait: string;  // how they show emotion (expression > dialogue)
}

/** In-game reaction moments — the character REACTS to what you do (agency →
 *  attachment), so they live inside the game, not just on the hub. */
export type ReactionKind = 'intro' | 'correct' | 'wrong' | 'clear' | 'win';

/** Where a character's real art lives (set once a Rive file / sprites exist).
 *  Until then `CharacterArt` renders a transforming emoji placeholder. */
export interface ArtSource {
  rive?: string;          // path/url to the .riv (artboard with a `heal` + `mood` state machine)
  artboard?: string;      // default 'Moss'
  stateMachine?: string;  // default matches artboard
}

/** Transformation stage (0 scattered → 3 whole) from a 0..1 heal fraction. Pure;
 *  drives the placeholder art and mirrors the Rive `heal` stages in the brief. */
export function healStage(heal: number): 0 | 1 | 2 | 3 {
  const h = Math.max(0, Math.min(1, heal));
  if (h >= 1) return 3;
  if (h >= 0.66) return 2;
  if (h >= 0.33) return 1;
  return 0;
}

export interface LevelCharacter {
  id: string;          // 'moss'
  level: number;       // which level they belong to
  name: string;
  emoji: string;
  /** The dyslexic strength they embody (affirming; difference-not-deficit). */
  strength: string;
  /** The psychology lever they're designed around (author/tutor note). */
  lever: string;
  /** Want/need/flaw/expression — the arc spine. */
  persona: Persona;
  /** The sound they "lost" — healed by mastering this skill in the level's game. */
  skillKey: SkillKey;
  soundId: string;
  /** Where helping happens (the level's game). */
  playRoute: string;
  /** Authored beat lines per story stage (hub). */
  beats: Partial<Record<StoryStage, string[]>>;
  /** Authored in-game reactions (no GenAI). */
  reactions: Partial<Record<ReactionKind, string[]>>;
  /** Real art, once it exists (Rive). Optional — placeholder until then. */
  art?: ArtSource;
}

export const MOSS: LevelCharacter = {
  id: 'moss',
  level: 2,
  name: 'Moss',
  emoji: '🌱',
  strength: 'spatial sense — he knows where every sound belongs, even in the dark',
  lever: 'self-efficacy via vicarious mastery (you watch a lost sound click home)',
  persona: {
    want: 'find his lost hum (/m/) and go home',
    need: "to learn he wasn't broken — just lost — and that the right friend and the right way make him whole",
    flaw: 'blames himself and hides in the dark, sure he is "broken"',
    trait: 'shy; curls up when unsure, glows and hums when a sound clicks home',
  },
  skillKey: 'sound:first:m',
  soundId: 'm',
  playRoute: '#/play/beginning-sounds',
  reactions: {
    intro: [
      "These little critters carry my lost hums, scattered across the sectors. Help me send each one home to its sound? 🌱",
      "Will you help me? Each critter belongs with a sound. Sort them home and I get a little more… me.",
    ],
    correct: [
      'Mmm — that one’s mine! I can feel it. 🌟',
      'Yes! Home it goes. You hear it too, don’t you?',
      'There — a hum comes back. You’re good at this.',
    ],
    wrong: [
      "Oh — not that sound. But you’re still here with me, and that’s what counts. Try again? 💚",
      "Close! The little ones are slippery — they were for me too. Listen once more?",
      "Not quite — and that’s okay. ‘Not yet’ just means we keep going.",
    ],
    clear: [
      "A whole sector, cleared. I’m humming a little louder already…",
      "Look at that — you sent them all home. I feel less lost.",
    ],
    win: [
      "You brought them ALL home — mmmmm! 🌼 I wasn’t broken… I was just waiting for you.",
      "Every hum, home. I’m whole again — and it’s because you stayed. Let’s go to the garden.",
    ],
  },
  beats: {
    arrived: [
      "…oh! A friendly face. I'm Moss — a little sprout, drifted up here from a garden far below. Out in the dark I lost my hum… my /m/ sound. Could you help me find it? 🌱",
      "Hello? I'm Moss. I floated away from my garden and dropped my /m/ somewhere out here. Will you help me catch it?",
    ],
    healing: [
      "You're close — I can almost hum again… mmm… keep going! 🌟",
      "Every critter you send home, I feel a little more like me. Don't stop now.",
    ],
    healed: [
      "You FOUND it — mmmmm! 🌼 That's my hum. I feel whole. I think I can go home now…",
      "There it is — /m/! I'm me again. You did that. Thank you, truly.",
    ],
    resident: [
      "I'm home — I'm the /m/ marigold by your garden path now. Come hum with me anytime. 💚",
      "Rooted at last, next to your other flowers. Visit me in the garden? 🌼",
    ],
  },
};

export const CAST: LevelCharacter[] = [MOSS];

export function castFor(level: number): LevelCharacter | undefined {
  return CAST.find((c) => c.level === level);
}

/**
 * The character's current stage — pure, derived from real mastery + the persisted
 * lore record. Always at least 'arrived' (they're here, needing you); 'healing'
 * once you've started their sound; 'healed' once it's mastered; 'resident' once
 * you've welcomed them home (an acknowledged beat).
 */
export function characterStage(c: LevelCharacter, lore: LoreState, mastery: MasteryMap): StoryStage {
  const stat = mastery[c.skillKey];
  if (isMastered(stat)) return lore.stories[c.id]?.stage === 'resident' ? 'resident' : 'healed';
  if (stat && stat.attempts > 0) return 'healing';
  return 'arrived';
}

/** A beat line for a stage (deterministic given rng). Falls back to 'arrived'. */
export function beatFor(c: LevelCharacter, stage: StoryStage, rng: () => number = Math.random): string {
  const pool = c.beats[stage] ?? c.beats.arrived ?? [];
  if (pool.length === 0) return '';
  return pool[Math.floor(rng() * pool.length)] ?? pool[0];
}

/** An in-game reaction line for a moment (deterministic given rng). */
export function reactionLine(c: LevelCharacter, kind: ReactionKind, rng: () => number = Math.random): string {
  const pool = c.reactions[kind] ?? c.reactions.intro ?? [];
  if (pool.length === 0) return '';
  return pool[Math.floor(rng() * pool.length)] ?? pool[0];
}

/** Id for the one-time "welcomed home" beat acknowledgement. */
export function healedBeatId(c: LevelCharacter): string {
  return `story:${c.id}:healed`;
}
