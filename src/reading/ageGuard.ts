/**
 * Age-appropriateness guard for ALL child-facing reading content (ages ~5–10).
 *
 * The composer emits a CLOSED vocabulary — only curated lexicon words plus a few
 * function-word literals — so guarding the lexicon guarantees every generated
 * phrase/sentence/passage is age-safe. This module is the backstop scan; its test
 * (ageGuard.test.ts) both runs the scan in the gate AND proves the closed-vocabulary
 * property (the composer never emits a word outside the curated lexicon), so
 * inappropriate content can never ship. This is a HARD gate, like the IP guard.
 */

/** Whole-word denylist (case-insensitive). Whole-word match avoids benign-substring
 *  false hits (e.g. "hat" must not trip "hate"). A backstop for the curated lexicon;
 *  any future content word that lands here fails the build. */
export const BANNED_WORDS: ReadonlySet<string> = new Set([
  // violence / weapons / harm
  'gun', 'guns', 'kill', 'kills', 'shoot', 'stab', 'knife', 'knives', 'bomb', 'war',
  'blood', 'bloody', 'dead', 'death', 'die', 'dies', 'died', 'hurt', 'hurts', 'wound',
  'fight', 'punch', 'slap', 'kick', 'gore', 'gun', 'axe',
  // fear / distress
  'scared', 'scary', 'afraid', 'cry', 'cries', 'scream', 'screams', 'nightmare',
  'monster', 'demon', 'devil', 'ghost', 'creepy',
  // adult / body / relationships
  'sex', 'sexy', 'kiss', 'kisses', 'naked', 'nude', 'butt', 'boob', 'breast',
  // substances
  'beer', 'wine', 'vodka', 'drunk', 'drug', 'drugs', 'smoke', 'smokes', 'cigarette', 'vape',
  // profanity / insults (mild → strong)
  'damn', 'hell', 'crap', 'heck', 'suck', 'sucks', 'stupid', 'dumb', 'idiot', 'hate', 'hates',
  // gambling / money pressure
  'bet', 'bets', 'casino', 'gamble',
]);

/** Substrings that are never benign (strong profanity / slur roots). */
export const BANNED_SUBSTRINGS: readonly string[] = ['fuck', 'shit', 'bitch', 'piss', 'cunt'];

/** Why a word is age-inappropriate, or null if it's fine. */
export function bannedReason(word: string): string | null {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return null;
  if (BANNED_WORDS.has(w)) return `denylisted word: "${w}"`;
  for (const sub of BANNED_SUBSTRINGS) {
    if (w.includes(sub)) return `banned substring "${sub}" in "${w}"`;
  }
  return null;
}
