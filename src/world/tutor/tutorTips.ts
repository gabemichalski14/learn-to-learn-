/**
 * Tutor-facing coaching tips — Pip speaking to the *grown-up*, not the child.
 * Concrete, professional, and derived from the student's REAL mastery data
 * (weakest rated sounds first), then anchored by a research-backed coaching
 * principle chosen to fit the data. Each tip can carry a short "why it works"
 * grounded in structured-literacy / Orton-Gillingham evidence. Pure +
 * deterministic → easy to test. Original guidance only (never the Barton
 * program's scripts or word lists).
 */
import type { MasteryMap } from '../../mastery/mastery';
import { rankAreas, scoreOf } from '../../mastery/mastery';
import { skillLabel, parseSkillKey } from '../../mastery/skills';

export interface TutorTip {
  id: string;
  title: string;
  body: string;
  /** Short evidence grounding shown as "Why it works" (optional). */
  why?: string;
}

/** Original, practical articulatory cues keyed to a sound id (NOT Barton material). */
const SOUND_HINTS: Record<string, string> = {
  b: 'Often confused with /p/ (same lips) or /d/ (mirror shape). Have them feel the throat buzz for /b/ and keep letter direction left-to-right.',
  d: 'If /b/ and /d/ swap, give each its own steady picture cue and master them apart before ever contrasting them.',
  p: 'Pairs with /b/: /p/ is a quiet pop with no voice, /b/ buzzes. A hand at the mouth feels the puff of air on /p/.',
  t: 'A light tongue-tap behind the top teeth; contrast with /d/, which adds voice — have them feel the throat.',
  k: 'Made at the back of the tongue; contrast with /g/ (same place, plus voice). Feel for no throat-buzz on /k/.',
  g: 'Back of the tongue with voice on; pair it against /k/ so the voiced/voiceless difference stays clear.',
  m: 'A hum with the lips closed — have them hum and notice the lips and nose buzzing.',
  n: 'Tongue tip taps behind the top teeth; contrast with /m/ (lips) so the two hums stay distinct.',
  s: 'A long snake hiss — let them stretch it (sss) and notice the air stays quiet (no voice).',
  z: 'Same hiss as /s/ but with the voice on — have them feel the buzz; contrast the two side by side.',
  f: 'Top teeth on the bottom lip, push air; contrast with /v/, which is the same shape plus voice.',
  v: 'Top teeth on the bottom lip with voice on — feel the buzz; it is /f/ with the motor running.',
  l: 'Tongue tip lifts to behind the top teeth and the voice flows around it — watch it in a mirror.',
  r: 'Lips round a little and the tongue bunches back; a tricky one — model slowly and let them watch your mouth.',
  w: 'Lips round into a tight circle then release — exaggerate the lip movement so it is visible.',
  h: 'Just a gentle breath out, no voice — have them feel the warm air on their hand.',
  j: 'A quick "dge" — voice on; contrast with /ch/ (same shape, voice off).',
  a: 'Short vowels are slippery — anchor /a/ to one keyword picture and return to it every session.',
  e: 'Short /e/ and /i/ blur easily; over-articulate the mouth shape and compare them side by side.',
  i: 'Short /i/ is a small smile shape; a mirror helps them see the difference from /e/.',
  o: 'Round the lips for /o/ and pair it with a consistent keyword image.',
  u: 'Short /u/ is relaxed and central; keep the keyword steady across sessions.',
};

/**
 * Research-backed coaching principles (structured literacy / Orton-Gillingham).
 * One is chosen to FIT the student's data so the advice is timely, not generic.
 */
const PRINCIPLES = {
  spaced: {
    title: 'Little and often',
    body: 'Two or three short sessions across the week beat one long one — aim for 5–10 focused minutes, and stop while it is still going well.',
    why: 'Distributed practice: spacing the same minutes across days builds far more durable recall than massing them.',
  },
  isolate: {
    title: 'One tricky sound at a time',
    body: 'When two sounds keep swapping, teach each to mastery on its own first — over-learn one, then the other, before contrasting them.',
    why: 'Explicit, cumulative sequencing stops confusable pairs from reinforcing each other.',
  },
  feedback: {
    title: 'Correct gently, right away',
    body: 'If a sound comes out off, model the correct one immediately, have them say it back, then circle back a moment later to lock it in.',
    why: 'Immediate corrective feedback plus a quick re-test turns an error into learning instead of practice of the error.',
  },
  cumulative: {
    title: 'Warm up with a win',
    body: 'Open each session by revisiting a sound they have already mastered, then fold in the newer one. Keep cycling old skills back through.',
    why: 'Cumulative review — continually revisiting prior skills — is what keeps gains from fading over time.',
  },
  multisensory: {
    title: 'Hear it, say it, feel it, write it',
    body: 'Pair every sound with movement: say it aloud, feel the mouth and throat, tap it on fingers, and air-write the letter — several senses at once.',
    why: 'Multisensory (VAKT) instruction is a core, evidence-based feature of Orton-Gillingham structured literacy.',
  },
} as const;

const pct = (score: number): number => Math.round(score * 100);

/** Pick the principle that best fits the student's current data shape. */
function choosePrinciple(mastery: MasteryMap): TutorTip {
  const stats = Object.values(mastery);
  const totalAttempts = stats.reduce((sum, s) => sum + s.attempts, 0);
  const rated = stats.filter((s) => s.attempts >= 5);
  const weak = rated.filter((s) => scoreOf(s) < 0.8).length;

  let key: keyof typeof PRINCIPLES;
  if (totalAttempts < 20) key = 'spaced';          // early days → build the habit
  else if (weak >= 2) key = 'isolate';             // several shaky sounds → don't pile them up
  else if (weak === 1) key = 'feedback';           // one shaky sound → tighten the correction loop
  else if (rated.length >= 4) key = 'cumulative';  // broad + mostly solid → keep it solid
  else key = 'multisensory';                       // general anchor

  const p = PRINCIPLES[key];
  return { id: `principle:${key}`, title: p.title, body: p.body, why: p.why };
}

/**
 * Up to `n` coaching tips for the tutor: weakest rated sounds first (each with a
 * multisensory action), a strength to build on, and a research-backed principle
 * chosen for this student as the closing anchor. With no rated data yet, a single
 * starter nudge.
 */
export function tutorTipsFor(mastery: MasteryMap, name: string, n = 3): TutorTip[] {
  const who = name || 'This student';
  const data: TutorTip[] = [];

  for (const a of rankAreas(mastery, n)) { // weakest-first, rated, score < 0.8
    const sound = parseSkillKey(a.skillKey)?.soundId;
    const action = (sound && SOUND_HINTS[sound])
      ?? 'Model the sound first, then let them try, and celebrate close attempts.';
    data.push({
      id: `weak:${a.skillKey}`,
      title: skillLabel(a.skillKey),
      body: `${who} is at ${pct(a.score)}% here over recent tries. ${action}`,
      why: 'Multisensory cue — hear it, say it, and feel the mouth shape (Orton-Gillingham).',
    });
  }

  const strong = Object.entries(mastery)
    .filter(([, s]) => s.attempts >= 5)
    .map(([skillKey, s]) => ({ skillKey, score: scoreOf(s) }))
    .filter((a) => a.score >= 0.8)
    .sort((a, b) => b.score - a.score)[0];
  if (strong) {
    data.push({
      id: `strong:${strong.skillKey}`,
      title: 'Build on a strength',
      body: `${who} is solid on ${skillLabel(strong.skillKey)} (${pct(strong.score)}%). Use it as a warm-up win before tackling a tricky sound.`,
      why: 'Cumulative review — revisiting mastered skills keeps them from fading.',
    });
  }

  // No rated data at all → a single, friendly starter nudge.
  if (data.length === 0) {
    return [{
      id: 'start',
      title: 'Getting started',
      body: `Not enough practice yet to spot patterns for ${who}. Aim for short, frequent sessions — a few minutes daily beats one long sitting.`,
      why: 'Distributed practice: little and often builds more durable skill than one long session.',
    }];
  }

  // Otherwise: data tips first (weakest leads), with the chosen principle as the closing anchor.
  return [...data.slice(0, Math.max(1, n - 1)), choosePrinciple(mastery)].slice(0, n);
}
