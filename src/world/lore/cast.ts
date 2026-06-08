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
import { parseSkillKey, type SkillKey } from '../../mastery/skills';
import { scoreOf, type MasteryMap, type SkillStat } from '../../mastery/mastery';
import type { LoreState, StoryStage } from './loreStore';

/**
 * Bringing a friend HOME is a higher bar than general skill "mastery" (0.8): to
 * make a hum fully his again — and send the character home — the learner must be
 * reliably right on that sound, **over 95%**. Stricter on purpose; homecoming
 * should mean real, durable command of the sound, not just a passing grade.
 */
const RATED_MIN = 5;
export const HUM_RECOVERED_AT = 0.95;
export function isHumRecovered(stat: SkillStat | undefined): boolean {
  return !!stat && stat.attempts >= RATED_MIN && scoreOf(stat) >= HUM_RECOVERED_AT;
}

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
export type ReactionKind = 'intro' | 'teach' | 'correct' | 'wrong' | 'clear' | 'win';

/** Where a character's real art lives (set once a Rive file / images exist).
 *  Until then `CharacterArt` renders a transforming emoji placeholder. */
export interface ArtSource {
  /** A single base image (flat, transparent PNG). CSS does the heal transform
   *  (grey/small → colour/whole) right on it — the simplest free route. */
  image?: string;
  /** Optional per-expression frames; the matching one is shown on that mood. */
  frames?: Partial<Record<'idle' | 'cheer' | 'wobble' | 'point' | 'bloom', string>>;
  /** Rive upgrade path (fluid vector). Takes precedence over images when present. */
  rive?: string;          // path/url to the .riv (artboard with `heal` + `mood`)
  artboard?: string;      // default 'Moss'
  stateMachine?: string;  // default matches artboard
}

/**
 * How recovered the character is (0..1), derived from the learner's REAL mastery
 * of the character's sound — so playing literally heals them (intrinsic fantasy):
 * climbs with attempts + accuracy, reaches 1 (whole) once the sound is mastered.
 */
export function healFromMastery(stat: SkillStat | undefined): number {
  if (!stat) return 0;
  if (isHumRecovered(stat)) return 1;                          // whole only at the high bar
  const attemptsFrac = Math.min(1, stat.attempts / RATED_MIN);
  const quality = Math.min(1, scoreOf(stat) / HUM_RECOVERED_AT); // climbs toward the 95% bar
  return Math.max(0, Math.min(1, attemptsFrac * quality));
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
  /** The signature sound they "lost" (their hum). */
  skillKey: SkillKey;
  soundId: string;
  /** ALL the scattered hums to recover — full recovery needs every one mastered.
   *  More than one = a longer, harder, more story-rich arc. Defaults to [skillKey]. */
  sounds?: SkillKey[];
  /** A memory revealed when each sound is recovered (keyed by soundId). */
  fragments?: Record<string, string[]>;
  /** Gentle closing lines for the resident's cozy "storytime" (after they've
   *  retold their recovered memories). Authored, dyslexia-first. */
  storytime?: string[];
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
  // When Moss scattered, his hums flew across the WHOLE level — one into each Space
  // game (Blast Off /m/, Touchdown /t/, Vowel Patrol /a/). Recover them ALL to make
  // him whole, so finishing his level means playing every one of its games. Each
  // recovered hum returns a memory.
  sounds: ['sound:first:m', 'sound:last:t', 'sound:medial:a'],
  fragments: {
    m: ["…I remember — I'd hum to the moon-moths, low and warm. Mmm. That was me. 🌙"],
    t: ['The tip-tap of rain on the leaves… t, t, t. I used to dance to it. ☔'],
    a: ["And my warm sigh in the sun — ahh. /a/. That one's mine too. ☀️"],
  },
  storytime: [
    "That's the whole of me — every hum, home. Sit with me a while? 💚",
    "Funny thing: losing my sounds is how I found you. I'm so glad I did. 🌼",
    "I'm not lost any more. I live here now, with you. Come back soon. 🌱",
  ],
  playRoute: '#/play/beginning-sounds',
  // Flat transparent PNGs dropped in public/characters/moss/ (see the README
  // there). Until the files exist, CharacterArt's onError falls back to the emoji.
  art: {
    image: '/characters/moss/calm.png',
    frames: {
      cheer: '/characters/moss/cheer.png',
      wobble: '/characters/moss/wobble.png',
      point: '/characters/moss/point.png',
      bloom: '/characters/moss/bloom.png',
    },
  },
  // Voice = dyslexia-first (docs/art/moss-yarn-guide.md §0): short, plain words,
  // no shame, growth mindset ("not yet"), credit the learner, built to be heard.
  reactions: {
    intro: [
      "I'm Moss. I came apart out here in the dark. Will you help me gather my hums? 🌱",
      'Hello! Each little critter holds a sound of mine. Send it home, and I come back — bit by bit.',
      "You're here! I knew someone kind would come. Let's find my sounds together.",
    ],
    // The pre-emptive tutorial: Moss shows his WAY before you try (multisensory,
    // structured-literacy — say it slow, feel where it sits, then plant it).
    teach: [
      "Watch how I do it. 🌱 Say the word slow… feel the sound… then send it to the glowing planet. Now you try!",
      "Here's my way: hear it, say it, then plant it where it glows. I'll show you this one — then it's yours.",
      "Let me start us off. Say it slow, catch the sound, fly it to the planet I'm pointing at. Your turn next! 💚",
    ],
    correct: [
      "Mmm — that one's mine! You heard it. 🌟",
      'Yes — home it goes. That’s one hum back.',
      'You did that. I can feel it. 💚',
    ],
    wrong: [
      "Not that one — and that's okay. The little sounds are slippery. They were for me too.",
      'Ooh, close. Say the word slow… catch its first sound. Try again? 💚',
      "'Not yet' just means we keep going. I'm right here.",
    ],
    clear: [
      "A whole sector, clear. I'm humming louder already…",
      'Look what you did. I feel less lost. 💚',
    ],
    win: [
      "You brought them home — mmmmm! 🌼 I wasn't broken. I was just waiting for you.",
      "All my hums, back. I'm me again — because you stayed. 💚",
      "We did it. Let's go to the garden together.",
    ],
  },
  beats: {
    arrived: [
      "Oh — a friendly face. I'm Moss. I drifted up from a garden far below, and out here I lost my hums. Will you help me find them? 🌱",
      "Hello! I came apart in the dark. Each sound I lost is still out there, waiting. Help me?",
    ],
    healing: [
      "You're close — I can almost hum again. Keep going! 🌟",
      'Every hum you bring back, I feel more like me. Don’t stop now. 💚',
    ],
    healed: [
      'You found them all — mmmmm! 🌼 I’m whole. I think I can go home now.',
      "I'm me again. You did that. Truly — thank you.",
    ],
    resident: [
      'I live in your garden now — the marigold by the path. Come hum with me. 💚',
      'Rooted at last, by your other flowers. Visit me anytime? 🌼',
    ],
  },
};

export const CAST: LevelCharacter[] = [MOSS];

export function castFor(level: number): LevelCharacter | undefined {
  return CAST.find((c) => c.level === level);
}

/** All the sounds this character must recover (defaults to the signature one). */
export function soundsOf(c: LevelCharacter): SkillKey[] {
  return c.sounds && c.sounds.length ? c.sounds : [c.skillKey];
}

/** Overall recovery (0..1) = average heal across ALL the character's sounds, so a
 *  multi-sound character heals gradually as each hum comes home. */
export function healFor(c: LevelCharacter, mastery: MasteryMap): number {
  const sounds = soundsOf(c);
  if (!sounds.length) return 0;
  return sounds.reduce((sum, k) => sum + healFromMastery(mastery[k]), 0) / sounds.length;
}

/** Fully recovered = every one of the character's scattered hums is mastered =
 *  their whole level is complete (you've played all its games). */
export function isFullyRecovered(c: LevelCharacter, mastery: MasteryMap): boolean {
  return soundsOf(c).every((k) => isHumRecovered(mastery[k]));
}

/** The characters who now LIVE in the garden — those whose level is fully
 *  complete (all their hums mastered). They move in once their story is done. */
export function gardenResidents(mastery: MasteryMap): LevelCharacter[] {
  return CAST.filter((c) => isFullyRecovered(c, mastery));
}

/**
 * The character's current stage — pure, derived from real mastery + the persisted
 * lore record. 'arrived' until you start; 'healing' once any hum is in progress;
 * 'healed' once ALL the sounds are mastered; 'resident' after you've welcomed them.
 */
export function characterStage(c: LevelCharacter, lore: LoreState, mastery: MasteryMap): StoryStage {
  const sounds = soundsOf(c);
  if (sounds.every((k) => isHumRecovered(mastery[k]))) {
    return lore.stories[c.id]?.stage === 'resident' ? 'resident' : 'healed';
  }
  if (sounds.some((k) => (mastery[k]?.attempts ?? 0) > 0)) return 'healing';
  return 'arrived';
}

/** Acknowledgement id for a recovered-sound memory. */
export function fragmentId(c: LevelCharacter, soundId: string): string {
  return `fragment:${c.id}:${soundId}`;
}

/** The next memory to reveal: a sound that's now mastered but whose fragment the
 *  learner hasn't been shown yet. Null when there's nothing new. */
export function fragmentToReveal(
  c: LevelCharacter, lore: LoreState, mastery: MasteryMap,
): { soundId: string; line: string; id: string } | null {
  if (!c.fragments) return null;
  for (const k of soundsOf(c)) {
    const sid = parseSkillKey(k)?.soundId;
    if (!sid) continue;
    const lines = c.fragments[sid];
    if (!lines || !lines.length) continue;
    const id = fragmentId(c, sid);
    if (isHumRecovered(mastery[k]) && !lore.acknowledged.includes(id)) {
      return { soundId: sid, line: lines[0], id };
    }
  }
  return null;
}

/**
 * A cozy "storytime" a resident tells by the fire — memory-aware: a warm opening
 * beat, then each recovered hum's memory in turn (only sounds actually mastered),
 * then a gentle close. Pure + deterministic given rng; never yields empty lines.
 * This is what plays when you tap a friend who lives in your garden.
 */
export function storytimeScene(c: LevelCharacter, mastery: MasteryMap, rng: () => number = Math.random): string[] {
  const lines: string[] = [];
  const open = beatFor(c, 'resident', rng);
  if (open) lines.push(open);
  if (c.fragments) {
    for (const k of soundsOf(c)) {
      const sid = parseSkillKey(k)?.soundId;
      if (!sid) continue;
      const memory = c.fragments[sid]?.[0];
      if (memory && isHumRecovered(mastery[k])) lines.push(memory);
    }
  }
  const closes = c.storytime ?? [];
  if (closes.length) lines.push(closes[Math.floor(rng() * closes.length)] ?? closes[0]);
  return lines;
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
