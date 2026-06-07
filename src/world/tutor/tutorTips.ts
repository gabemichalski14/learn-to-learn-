/**
 * Tutor-facing coaching tips — Pip speaking to the *grown-up*, not the child.
 * Concrete, professional, and derived from the student's REAL mastery data
 * (weakest rated sounds first), so the dashboard tells a tutor what to actually
 * do next. Pure + deterministic → easy to test. Original guidance only (never the
 * Barton program's scripts or word lists).
 */
import type { MasteryMap } from '../../mastery/mastery';
import { rankAreas, scoreOf } from '../../mastery/mastery';
import { skillLabel, parseSkillKey } from '../../mastery/skills';

export interface TutorTip {
  id: string;
  title: string;
  body: string;
}

/** Original, practical hints keyed to a sound id (NOT Barton material). */
const SOUND_HINTS: Record<string, string> = {
  b: 'Often confused with /p/ (same lips) or /d/ (mirror shape). Have them feel the throat buzz for /b/, and keep letter direction left-to-right.',
  d: 'If /b/ and /d/ swap, give each its own steady picture cue and practice them apart before ever contrasting them.',
  p: 'Pairs with /b/: /p/ is a quiet pop with no voice, /b/ buzzes. A hand at the mouth feels the puff of air on /p/.',
  t: 'A light tongue-tap behind the top teeth; contrast with /d/, which adds voice — feel the throat.',
  m: 'A hum with the lips closed — have them hum and notice the lips and nose buzzing.',
  n: 'Tongue tip taps behind the top teeth; contrast with /m/ (lips) so the two hums stay distinct.',
  s: 'A long snake hiss — let them stretch it (sss) and notice the air stays quiet (no voice).',
  f: 'Top teeth on the bottom lip, push air; contrast with /v/, which is the same shape plus voice.',
  a: 'Short vowels are slippery — anchor /a/ to one keyword picture and return to it every session.',
  e: 'Short /e/ and /i/ blur easily; over-articulate the mouth shape and compare them side by side.',
  i: 'Short /i/ is a small smile shape; a mirror helps them see the difference from /e/.',
  o: 'Round the lips for /o/ and pair it with a consistent keyword image.',
  u: 'Short /u/ is relaxed and central; keep the keyword steady across sessions.',
};

const pct = (score: number): number => Math.round(score * 100);

/**
 * Up to `n` coaching tips for the tutor, derived from the student's mastery:
 * weak rated sounds first (most actionable), then a strength to build on, and a
 * gentle starter nudge when there's nothing rated yet.
 */
export function tutorTipsFor(mastery: MasteryMap, name: string, n = 3): TutorTip[] {
  const who = name || 'This student';
  const tips: TutorTip[] = [];

  for (const a of rankAreas(mastery, n)) { // weakest-first, rated, score < 0.8
    const sound = parseSkillKey(a.skillKey)?.soundId;
    const action = (sound && SOUND_HINTS[sound])
      ?? 'Keep rounds short and playful: model the sound first, then let them try, and celebrate close attempts.';
    tips.push({
      id: `weak:${a.skillKey}`,
      title: skillLabel(a.skillKey),
      body: `${who} is at ${pct(a.score)}% here over recent tries. ${action}`,
    });
  }

  if (tips.length < n) {
    const strong = Object.entries(mastery)
      .filter(([, s]) => s.attempts >= 5)
      .map(([skillKey, s]) => ({ skillKey, score: scoreOf(s) }))
      .filter((a) => a.score >= 0.8)
      .sort((a, b) => b.score - a.score)[0];
    if (strong) {
      tips.push({
        id: `strong:${strong.skillKey}`,
        title: 'Build on a strength',
        body: `${who} is solid on ${skillLabel(strong.skillKey)} (${pct(strong.score)}%). Use it as a warm-up win before tackling a tricky sound.`,
      });
    }
  }

  if (tips.length === 0) {
    tips.push({
      id: 'start',
      title: 'Getting started',
      body: `Not enough practice yet to spot patterns for ${who}. Aim for short, frequent sessions — a few minutes daily beats one long sitting.`,
    });
  }

  return tips.slice(0, n);
}
