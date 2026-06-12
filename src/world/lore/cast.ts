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

/** What a resident teaches when you visit them in the Village — a tiny authored
 *  lesson that ties CURRICULUM (their sound + position; structured-literacy,
 *  one-sound-at-a-time, multisensory) to RESEARCH (their dyslexic strength,
 *  difference-not-deficit). Dyslexia-first: short steps, plain words, heard. */
export interface Teaching {
  title: string;
  lines: string[];
}

/** Where a character's real art lives (set once a Rive file / images exist).
 *  Until then `CharacterArt` renders a transforming emoji placeholder. */
/** Standard art paths for a character — the manifest convention
 *  /art/char/<id>-<expr>.png. Files are optional: CharacterArt probes for each and
 *  falls back to the emoji (which still heals) until the PNG lands. */
export function charArt(id: string): ArtSource {
  return {
    image: `/art/char/${id}-calm.png`,
    frames: {
      cheer: `/art/char/${id}-cheer.png`,
      wobble: `/art/char/${id}-wobble.png`,
      point: `/art/char/${id}-point.png`,
      bloom: `/art/char/${id}-bloom.png`,
      talk: `/art/char/${id}-talk.png`,
    },
  };
}

export interface ArtSource {
  /** A single base image (flat, transparent PNG). CSS does the heal transform
   *  (grey/small → colour/whole) right on it — the simplest free route. */
  image?: string;
  /** Optional per-expression frames; the matching one is shown on that mood. */
  frames?: Partial<Record<'idle' | 'cheer' | 'wobble' | 'point' | 'bloom' | 'talk', string>>;
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
  /** The little lesson they teach when you visit them in the Village. */
  teaching?: Teaching;
  /** Opening line when you return AFTER they're already whole + home (arc done):
   *  a returning friend, not "I'm broken, help me" — so the arc reads as finished. */
  revisit?: string[];
  /** Where helping happens (the level's game). */
  playRoute: string;
  /** Authored beat lines per story stage (hub). */
  beats: Partial<Record<StoryStage, string[]>>;
  /** Authored in-game reactions (no GenAI). */
  reactions: Partial<Record<ReactionKind, string[]>>;
  /** Real art, once it exists (Rive). Optional — placeholder until then. */
  art?: ArtSource;
  /** Their house in the Village (a cottage PNG). Defaults to the thatched cottage. */
  house?: string;
  /** A little symbol that drifts across the site while you're helping them /
   *  after they're home — the world celebrates the friendship. */
  motif?: string;
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
  // The Village lesson — Moss's structured-literacy method, framed as his gift.
  // (Curriculum: first/middle/end sound + one-at-a-time, multisensory. Research:
  // spatial strength, difference-not-deficit, "hear it, say it, see it, plant it".)
  revisit: [
    "Back for more? I'm whole now — but I love practising with you. Let's keep my sounds sharp! 🌱",
    'Just visiting from the Village! Say them with me again? 💚',
  ],
  teaching: {
    title: 'How to catch a slippery sound',
    lines: [
      'Little sounds are slippery — they were for me, too. Here is how I hold them. 🌱',
      'Hear it. Say the word out loud, nice and slow.',
      'Say it. Stretch the sound you want — mmm, t, ahh.',
      'See it. Is it at the start, the middle, or the end?',
      'Plant it. Send it to its place. Just one sound at a time.',
      "Big pictures come easy to me. The little sounds just need my way. That's not broken — that's how I think. 💚",
    ],
  },
  playRoute: '#/play/beginning-sounds',
  // Flat transparent PNGs dropped in public/characters/moss/ (see the README
  // there). Until the files exist, CharacterArt's onError falls back to the emoji.
  art: charArt('moss'),
  house: '/characters/village/cottage.png',
  motif: '🍃',
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

/**
 * Chip — Level 1 (Sound Garden, phonemic awareness). A DIFFERENT dyslexic
 * strength (a musical ear) and a DIFFERENT psychology lever from Moss: the
 * **protégé effect** — the child TEACHES Chip to tap out each beat, and teaching
 * deepens their own phonemic awareness (teachable-agents research). Level 1 trains
 * one PA skill, so Chip recovers in a single gentle arc (right for the first level)
 * rather than collecting scattered hums. Art arrives in public/characters/chip/;
 * until then CharacterArt falls back to the emoji.
 */
export const CHIP: LevelCharacter = {
  id: 'chip',
  level: 1,
  name: 'Chip',
  emoji: '🦗',
  strength: 'a musical ear — he hears the whole song in a word, even when the little beats hide',
  lever: 'the protégé effect (learning by teaching) — the child shows Chip how to tap out each beat; teaching deepens their own phonemic awareness',
  persona: {
    want: 'to play his whole song and join the garden chorus',
    need: "to learn a word is made of small beats — one at a time — and that needing to count them out doesn't make him any less musical",
    flaw: 'rushes ahead to the whole melody and tumbles over the separate beats; sure he "can\'t keep simple time"',
    trait: 'chirps bright and his antennae perk when a beat lands; goes quiet and curls up when he loses it',
  },
  skillKey: 'pa:segment',
  soundId: 'segment',
  // Chip's song scattered into ALL FIVE Sound-Garden games — one phonemic-awareness
  // skill per game (Tap It Out=segment, Same or Different=compare, Switch It=
  // manipulate, Rhyme Time=rhyme, Blend It=blend). Recover them all to make him
  // whole, so finishing Level 1 means playing every game. Each returns a musical memory.
  sounds: ['pa:segment', 'pa:compare', 'pa:manipulate', 'pa:rhyme', 'pa:blend'],
  fragments: {
    segment: ['…there. I caught a beat — one little tk, all on its own. You showed me how. Now I can find the rest. 🎵'],
    compare: ['…two words, almost the same — but one little beat is different. My ears can tell them apart now. You taught me that. 🎵'],
    manipulate: ['…switch one beat and the whole word changes — cat, cap! I can move the sounds around now, like notes on a string. 🎶'],
    rhyme: ['…cat, hat, bat — they all land on the same beat at the end. Rhymes! That was always my favorite part of the song. 🎵'],
    blend: ["…I strung the little beats together and a whole word sang out. Blending — that's my song coming home. 🎶"],
  },
  storytime: [
    'Every word is a tiny song now — and I can hear each beat. You taught me that. 🎵',
    'I used to rush the whole tune and trip. You slowed me down, one beat at a time. Thank you.',
    "Come keep time with me in the chorus. I never lose the beat when you're here. 💚",
  ],
  revisit: [
    'Hi again! I live in the Village now — but let\'s keep the beat together. 🎵',
    "Back for a tune-up? I never lose the beat when you're here. 💚",
  ],
  teaching: {
    title: 'How to hear the beats in a word',
    lines: [
      'A word is a little song — and songs are made of beats. Here is how I find them.',
      'Say the word slow, out loud.',
      'Now tap once for each sound you hear — t… a… p.',
      "Count the taps. That's how many beats the word has!",
      'Hearing the whole song is my gift. Tapping the beats is just a skill — and now it\'s yours too. 🎵',
    ],
  },
  playRoute: '#/play/tap-it-out',
  art: charArt('chip'),
  house: '/characters/village/cottage-2.png',
  motif: '🎵',
  reactions: {
    intro: [
      "I'm Chip. I hear the song in every word… but the little beats hide from me. Will you show me how to catch them? 🦗",
      "Hello! You tap out the sounds, and I'll listen close. Teach me the beats?",
      "A teacher! I learn best when someone shows me. Let's find the beats together. 🎵",
    ],
    teach: [
      "Watch — say it slow, then tap once for each sound. I'll follow you. Now you lead!",
      'Show me first. Tap each beat… I hear it when you do. Your turn to teach me!',
    ],
    correct: [
      "There! I felt that beat — tk! You're a good teacher. 🌟",
      'Yes — I caught it because you showed me. 🎵',
      'One more beat in my song. You did that. 💚',
    ],
    wrong: [
      "Ooh — I lost the beat. That's okay, it hides from me too. Show me again? 💚",
      'Not quite — say it slow and tap it out for me once more.',
      "'Not yet' just means we keep the beat going. I'm listening.",
    ],
    clear: [
      'A whole verse! I can almost play my song now…',
      "Listen — it's coming together, because you taught me. 💚",
    ],
    win: [
      "My whole song — every beat in its place! 🎵 I wasn't out of time. I just needed a teacher.",
      "You taught me to keep the beat. I'll never lose it now. 💚",
      "Let's play it in the garden together.",
    ],
  },
  beats: {
    arrived: [
      "Oh — a friend! I'm Chip. I hear the song in every word, but the little beats slip right past me. Will you show me how to catch them? 🦗",
      'Hello! I came to the Sound Garden to learn the beats. Teach me?',
    ],
    healing: [
      "You're a good teacher — I'm catching more beats every time. Keep going! 🎵",
      'Each word you tap out, I hear one more beat. Don\'t stop now. 💚',
    ],
    healed: [
      'Listen — my whole song, every beat! 🎵 You taught me that. I can join the chorus now.',
      'I can keep the beat at last. Truly — thank you for showing me.',
    ],
    resident: [
      'I play in the garden chorus now. Come keep time with me. 🎵',
      'Rooted here with the others, humming my little song. Visit me? 💚',
    ],
  },
};

// Level 3 — Patch (the connector). Interconnected reasoning (Eide MIND strength)
// + enactive mastery (Bandura's STRONGEST self-efficacy source — you apply a rule
// and it works every time). His wound IS the curriculum's central error: blend
// reduction (squeezing a blend until a sound slips out). Flat/emoji art for now
// (no hand-coded SVG, per the art-direction call); CharacterArt heals the emoji.
export const PATCH: LevelCharacter = {
  id: 'patch',
  level: 3,
  name: 'Patch',
  emoji: '🧵',
  strength: 'interconnected reasoning — Patch sees how every little piece joins into the whole',
  lever: "enactive mastery (Bandura's strongest source) — you apply a rule yourself and it works every single time",
  persona: {
    want: 'stitch his scattered bits back together and reopen the Workshop',
    need: 'to learn two sounds can hold hands and BOTH still be heard — and that a rule is a tool you own, not a trap',
    flaw: 'squeezes pieces so tight that one slips away — a blend loses a sound ("slip" → "sip")',
    trait: 'a tinkerer; fidgets with thread and bolts, lights up when two parts click together',
  },
  skillKey: 'blend:init:sl',
  soundId: 'sl',
  // His pieces scattered into all four Workshop games — recover them ALL to make
  // him whole (one signature skill per game).
  sounds: ['blend:init:sl', 'digraph:sh', 'rule:floss', 'syll:vccv'],
  fragments: {
    sl: ['…there it is — sl. Two sounds, holding hands, neither one lost. That stitch is mine. 🧵'],
    sh: ['Sh — quiet now. One sound from two letters. I used to hush the whole Workshop with it. 🤫'],
    floss: ['And my trusty tool: the FLOSS rule — f, l, s, z, doubled every time. A rule I can count on. 📏'],
    vccv: ['Big words come apart at the seam — rab·bit, nap·kin. I always saw the join. ✂️'],
  },
  storytime: [
    'Every piece, back where it belongs. The Workshop hums again. Sit a while? 🧵',
    'Funny — I thought a dropped sound meant I was broken. Turns out I just hold them gently now. 💛',
    "You stitched me back together. I live here now. Door's always open. 🔧",
  ],
  revisit: [
    "Back in the Workshop? I'm whole now — but I love building with you. Let's keep these joins strong! 🧵",
    'Just visiting from the Village! Hold the buddies together with me again? 💛',
  ],
  teaching: {
    title: 'How two sounds hold hands',
    lines: [
      "Blends used to slip on me — I'd squeeze sl so hard the l fell out. Here's how I hold them now. 🧵",
      'Say both. s… l… slow. Two sounds, both heard — buddies that hold hands.',
      'Don\'t drop one. If you only hear "sip," a buddy got away. Reach back for it.',
      'Trust the rule. ck after a short vowel; double f, l, s, z at the end. A rule works every time — that\'s your superpower.',
      "I see the whole picture fast — it's the little joins I take slow. That's not broken. That's how I build. 💛",
    ],
  },
  playRoute: '#/play/blend-buddies',
  art: charArt('patch'),
  house: '/characters/village/cottage.png',
  motif: '🧵',
  beats: {
    arrived: [
      'Oh — a helper! My Workshop came apart and the pieces flew into every game. Help me stitch them back? 🧵',
      'Hello! Each bit of me is stuck in a build. Put them together and I come back, piece by piece.',
    ],
    healing: [
      'Another piece, clicked into place. I can feel the Workshop warming up… 🔧',
      "You're holding the buddies together — that's exactly it. Keep going! 🧵",
    ],
    healed: [
      "That's all of me — every join, every rule, back together. You did that. 🧵",
      "The Workshop's open again, and it's because you didn't let a single sound slip. 💛",
    ],
    resident: ['Welcome to the Workshop! Pull up a stool. What shall we build today? 🧵'],
  },
  reactions: {
    intro: [
      "I'm Patch. I came apart out here — pieces everywhere. Will you help me stitch them back together? 🧵",
      'Hello! Every build holds a piece of me. Put it together and I come back — bit by bit.',
      "You came! I knew a good builder would. Let's join these sounds up.",
    ],
    teach: [
      'Watch how I do it. 🧵 Say BOTH sounds — s… l… — and keep them holding hands. Now you try!',
      "Here's my way: hear both buddies, build them side by side, don't let one slip. I'll start — then it's yours.",
      'Two sounds, both heard, joined up tight. Let me show you one — your turn next! 💛',
    ],
    correct: [
      'Click — both buddies, together! That one\'s mine. 🧵',
      'Yes — neither one slipped. You held them. 🌟',
      'You built that. I can feel it clicking home. 💛',
    ],
    wrong: [
      "A buddy got away there — and that's okay. Blends are slippery; they were for me too.",
      'Ooh, close. Say both sounds slow… catch the one that slipped. Try again? 💛',
      '"Not yet" just means we keep building. I\'m right here.',
    ],
    clear: [
      "A whole build, done. The Workshop's humming louder…",
      'Look what you joined. I feel more like me. 💛',
    ],
    win: [
      "You put me back together — every piece! 🧵 I wasn't broken. I just needed to hold them gently.",
      "All my joins, strong. I'm me again — because you didn't drop a single sound. 💛",
      'We did it. Come build in my Workshop any time.',
    ],
  },
};

export const BRAM: LevelCharacter = {
  id: 'bram',
  level: 4,
  name: 'Bram',
  emoji: '🦕',
  strength: 'big-picture seeing — Bram takes in the whole shape of a giant word at a glance, then breaks it into climbable parts',
  lever: 'chunking to beat overwhelm — the holistic strength turned into a strategy: a long word is never bigger, just more parts, one at a time',
  persona: {
    want: 'wake the sleeping giants of the valley so the long words can be read again',
    need: 'to learn that a giant word is not scary — it is just little parts holding hands, and a silent friend can change a whole sound',
    flaw: 'freezes at the SIZE of a word and tries to swallow it whole instead of cutting it into parts',
    trait: 'a gentle, slow-moving word-dino; loves looking at the whole valley, hums while he climbs, never rushes',
  },
  skillKey: 'vce',
  soundId: 'vce',
  // One signature skill per Level-4 game — recover them all to wake Bram fully.
  sounds: ['vce', 'vowel:open', 'div:vcv', 'read:multi'],
  fragments: {
    vce: ['…there — the silent e. It says nothing, but it changes everything. cap becomes cape. ✨'],
    open: ["When a vowel's at the open end, it gets to say its own name — me, go, hi. I'd forgotten that. 🦕"],
    vcv: ['Big words come apart at the seam — ti·ger, rob·in. One cut, two climbable parts. ✂️'],
    multi: ['And the giant words? Just parts, read one at a time. Nothing was ever too big. 🏔️'],
  },
  storytime: [
    'The valley is awake again. The giants stretch and the long words read themselves. Sit with me? 🦕',
    'I used to freeze at a big word. Now I just see the parts. Funny how the giant was never the problem. 💛',
    'You taught me to take it one chunk at a time. Come climb a word with me anytime. 🏔️',
  ],
  revisit: [
    "Back in the valley? I'm wide awake now — but I love climbing big words with you. Pick a giant! 🦕",
    'Just visiting from the Village! Cut a long word into parts with me again? 💛',
  ],
  teaching: {
    title: 'How a giant word becomes small',
    lines: [
      'Big words used to freeze me — I tried to swallow them whole. Here is how I climb them now. 🦕',
      'Look at the whole shape first — that is your gift, big-picture friend.',
      'Then cut it at the seam: between the consonants, or right after a vowel that says its name.',
      'Read one part. Then the next. A giant word is never bigger — just more parts.',
      'And watch for the silent e — it says nothing, but it makes the vowel say its name. cap → cape. ✨',
    ],
  },
  playRoute: '#/play/name-change',
  art: charArt('bram'),
  house: '/characters/village/cottage.png',
  motif: '🦕',
  beats: {
    arrived: [
      'Oh… a small friend! The valley fell asleep and the long words went quiet. Will you help me wake the giants? 🦕',
      'Hello, down there! Each giant holds a piece of how to read big words. Climb them with me?',
    ],
    healing: [
      'A giant stirs… I can feel a long word waking up. 🏔️',
      'You cut that big word right at the seam — that is exactly how. Keep climbing! 🦕',
    ],
    healed: [
      'The whole valley is awake — every giant, every long word. You did that, little friend. 🦕',
      'No word is too big for us now. We just take it one part at a time. 💛',
    ],
    resident: ['Welcome back to the valley! Want to climb a giant word together? 🦕'],
  },
  reactions: {
    intro: [
      "I'm Bram. I see the whole shape of a word in a blink — it's the cutting-into-parts I take slow. Climb with me? 🦕",
      'Hello! Every giant in this valley holds a piece of reading big words. Wake them with me, one at a time.',
      'You came! Big-picture friends like us — we just need to chunk it. Let me show you.',
    ],
    teach: [
      'Watch. 🦕 First the whole shape… then I cut it at the seam… then read one part at a time. Your turn!',
      'Here is my way: see the giant, find the seam, climb one part, then the next. I will start — then it is yours.',
      'A silent e says nothing, but it makes the vowel say its name. cap… cape. Let me show you — your turn next! ✨',
    ],
    correct: [
      'Yes — one part at a time, and the giant wakes! 🦕',
      'That silent e changed everything — you heard it. ✨',
      'You cut it right at the seam. The valley hums. 💛',
    ],
    wrong: [
      "A big one, that — and big words froze me too, once. Look at the whole shape, then find the seam.",
      'Ooh, close. Say each part slow… where does it come apart? Try again? 💛',
      '"Not yet" just means we keep climbing. I\'m right here, big as a hill.',
    ],
    clear: [
      'A whole giant, awake. The long words are coming back…',
      'Look what you read. The valley feels more alive. 💛',
    ],
    win: [
      'You woke the whole valley! 🦕 Every giant, every long word — read, one part at a time.',
      'A big word was never too big. You taught me that. 💛',
      'We did it. Come climb a giant in my valley any time. 🏔️',
    ],
  },
};

export const SPRIG: LevelCharacter = {
  id: 'l5', // reuses the existing /art/char/l5-*.png frames
  level: 5,
  name: 'Sprig',
  emoji: '🧚',
  strength: 'whole-word building — Sprig sees the finished word and all its little parts at once; it is fitting the one small piece that slips',
  lever: 'building competence — a big word is never bigger, just more parts you fit together one at a time; you add the piece yourself and it works every time',
  persona: {
    want: 'mend the worn-down words of Tinker Town so they can change and grow again',
    need: 'to trust that adding one small part changes what a word means — and that a real part always leaves a real word behind',
    flaw: 'grabs the whole word at once and jams, instead of fitting one little part at a time',
    trait: 'a tiny green tinker-sprite; hums while sorting parts, taps a piece twice to be sure it fits, lights up when it clicks',
  },
  skillKey: 'affix:suffix',
  soundId: 'suffix',
  // One signature skill per Tinker Town game — mend them all to fully wake Sprig.
  sounds: ['affix:suffix', 'affix:prefix', 'affix:build', 'affix:peel', 'affix:ed', 'affix:sort'],
  fragments: {
    suffix: ['…there — the ending clicks on and the word changes its job. jump… jumped. It already happened now. ⚙️'],
    prefix: ['A little part on the FRONT flips the whole meaning — lock… unlock. I had that backwards. 🔧'],
    build: ['A big word is just parts holding hands: un + lock, re + play. Build it, and it works. 🧩'],
    peel: ['And to READ a giant word? Peel the parts off — front, back — and the little base is right there. 🍃'],
    ed: ['That -ed has three voices — jumped, played, wanted. Same ending, three sounds. Who knew! 🎵'],
    sort: ['A real part always leaves a real word behind. The "un" in under? Not a part — just letters. ✓'],
  },
  storytime: [
    'Tinker Town hums again — every word can change and grow. Sit on my workbench a while? 🧚',
    'I used to jam on a whole word. Now I just add one little part. The big word was never the problem. 💛',
    'You taught me to build, piece by piece. Come fix a word with me any time. 🔧',
  ],
  revisit: [
    'Back in the workshop? My words all work now — but I love building with you. Pick a part! 🧚',
    'Just visiting from the Village! Snap a part onto a word with me again? 🍃',
  ],
  teaching: {
    title: 'How a little part changes a whole word',
    lines: [
      'Words used to jam on me — I grabbed the whole thing at once. Here is how I build them now. 🧚',
      'See the finished word first — that is your gift, big-picture friend.',
      'Then add ONE little part. On the end, it changes the job: jump → jumped, already happened.',
      'On the front, it flips the meaning: lock → unlock.',
      'And always check: peel the part off — is a real word left behind? If yes, it is a real part. ✓',
    ],
  },
  playRoute: '#/play/l5-suffix',
  art: charArt('l5'),
  house: '/characters/village/cottage.png',
  motif: '🍃',
  beats: {
    arrived: [
      'Oh — a helper! The words of Tinker Town wore out and stopped changing. Will you build them back with me? 🧚',
      'Hello there! Every worn word holds one little part of how words grow. Fit them with me?',
    ],
    healing: [
      'A part clicked — I felt a word come back to life. ⚙️',
      'You fit that ending just right — the whole word changed its job! Keep building. 🔧',
    ],
    healed: [
      'Every word works again — they change, they grow, they read themselves. You built that. 🧚',
      'No word is too big now. We just add one part at a time. 💛',
    ],
    resident: ['Welcome back to the workshop! Want to build a word together? 🧚'],
  },
  reactions: {
    intro: [
      "I'm Sprig. I see the whole word in a blink — it's fitting the one little part I take slow. Build with me? 🧚",
      'Hello! Every worn word here holds a piece of how words grow. Mend them with me, one part at a time.',
      'You came! Big-picture friends like us — we just add the right part. Let me show you.',
    ],
    teach: [
      'Watch. 🧚 See the whole word… then I add one little part… and its job changes. Your turn!',
      'Here is my way: see the word, pick the part that does THIS job, click it on. I will start — then it is yours.',
      'A part on the end changes the job; a part on the front flips the meaning. Let me show you — your turn next! ⚙️',
    ],
    correct: [
      'Yes — one part, and the whole word changes! 🧚',
      'You heard it click into its job. jump… jumped. ⚙️',
      'That part fit just right. Tinker Town hums. 💛',
    ],
    wrong: [
      'A tricky fit, that — and words jammed on me too, once. Which part does THIS job?',
      'Ooh, close. Say it with the part on… does it mean the right thing? Try again? 💛',
      '"Not yet" just means we keep building. I\'m right here at the bench.',
    ],
    clear: [
      'A whole word, mended. The town hums a little louder…',
      'Look what you built. Tinker Town feels more alive. 💛',
    ],
    win: [
      'You mended every word! 🧚 They change, they grow, they read themselves — one part at a time.',
      'A big word was never too big. You taught me that. 💛',
      'We did it. Come build a word at my bench any time. 🔧',
    ],
  },
};

export const CAST: LevelCharacter[] = [CHIP, MOSS, PATCH, BRAM, SPRIG];

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
 * The friend symbols the world should celebrate right now: `helping` = friends
 * you've started but not finished (their motif drifts more often, a happy nudge);
 * `home` = fully-recovered friends (a gentler, ongoing flourish). Drives the
 * ambient easter eggs so helping/finishing a friend literally lights up the site.
 */
export function worldMotifs(mastery: MasteryMap): { helping: string[]; home: string[] } {
  const helping: string[] = [];
  const home: string[] = [];
  for (const c of CAST) {
    if (!c.motif) continue;
    if (isFullyRecovered(c, mastery)) home.push(c.motif);
    else if (soundsOf(c).some((k) => (mastery[k]?.attempts ?? 0) > 0)) helping.push(c.motif);
  }
  return { helping, home };
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

/** The fragment key for a skill: the parsed soundId (L1/L2 sounds), else the last
 *  segment of the skillKey (L3: blend:init:sl → 'sl', rule:floss → 'floss'), else
 *  the character's signature soundId. */
function fragmentSid(k: SkillKey, fallback: string): string {
  return parseSkillKey(k)?.soundId ?? k.split(':').pop() ?? fallback;
}

/** The next memory to reveal: a sound that's now mastered but whose fragment the
 *  learner hasn't been shown yet. Null when there's nothing new. */
export function fragmentToReveal(
  c: LevelCharacter, lore: LoreState, mastery: MasteryMap,
): { soundId: string; line: string; id: string } | null {
  if (!c.fragments) return null;
  for (const k of soundsOf(c)) {
    // per-sound key → its soundId; a single-skill key (e.g. PA) → the character's soundId
    const sid = fragmentSid(k, c.soundId);
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
      const sid = fragmentSid(k, c.soundId);
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
