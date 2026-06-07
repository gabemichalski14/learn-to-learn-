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

export interface LevelCharacter {
  id: string;          // 'moss'
  level: number;       // which level they belong to
  name: string;
  emoji: string;
  /** The dyslexic strength they embody (affirming; difference-not-deficit). */
  strength: string;
  /** The psychology lever they're designed around (author/tutor note). */
  lever: string;
  /** The sound they "lost" — healed by mastering this skill in the level's game. */
  skillKey: SkillKey;
  soundId: string;
  /** Where helping happens (the level's game). */
  playRoute: string;
  /** Authored beat lines per stage (no GenAI). */
  beats: Partial<Record<StoryStage, string[]>>;
}

export const MOSS: LevelCharacter = {
  id: 'moss',
  level: 2,
  name: 'Moss',
  emoji: '🌱',
  strength: 'spatial sense — he knows where every sound belongs, even in the dark',
  lever: 'self-efficacy via vicarious mastery (you watch a lost sound click home)',
  skillKey: 'sound:first:m',
  soundId: 'm',
  playRoute: '#/play/beginning-sounds',
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

/** Id for the one-time "welcomed home" beat acknowledgement. */
export function healedBeatId(c: LevelCharacter): string {
  return `story:${c.id}:healed`;
}
