import { LEVELS } from '../games';
import { PIP_DESTINATIONS } from './pipNav';
import { isMuted, setMuted, hapticsOn, setHaptics } from '../audio/sfx';

/**
 * Pip the one-stop shop. Everything Pip can do for you, as a single searchable
 * list of capabilities: GO somewhere, change a SETTING (sounds / buzz), or EXPLAIN
 * something (a game, or what a piece of your data means). You type what you want;
 * Pip finds it and either walks you there, flips the switch, or explains it.
 */
export type PipOutcome =
  | { kind: 'go'; to: string }
  | { kind: 'say'; text: string }
  | { kind: 'explain'; title: string; body: string; to?: string; cta?: string };

export interface PipCap { id: string; emoji: string; label: string; keys: string[]; run: () => PipOutcome }

// Friendly, no-shame explanations of the data + reward concepts a learner/parent
// might ask Pip about. (Kept plain — a 7-year-old or a busy parent can follow.)
const DATA_CONCEPTS: { id: string; label: string; keys: string[]; body: string; to?: string; cta?: string }[] = [
  { id: 'progress', label: 'See my progress', keys: ['data', 'progress', 'stats', 'report', 'doing', 'dashboard', 'profile'], body: 'Your practice, all gathered up — the skills you’re growing and how steady you’re getting.', to: '#/profile', cta: 'Open my progress ▸' },
  { id: 'mastery', label: 'What does “mastered” mean?', keys: ['mastery', 'mastered', 'master', 'learned', 'solid', 'green'], body: 'How solidly a skill is learned. We count only FIRST-try answers, so it shows real, un-helped skill — not lucky guesses.' },
  { id: 'accuracy', label: 'What is accuracy?', keys: ['accuracy', 'accurate', 'sharp', 'correct', 'percent', 'score'], body: 'How often your answers are right. The “Sharpest ears” board celebrates it — but every learner shines somewhere.' },
  { id: 'softspots', label: 'What are my soft spots?', keys: ['soft', 'weak', 'improve', 'areas', 'hard', 'struggle', 'tricky'], body: 'The sounds you’re still growing. Pip gives you a little extra play on them — that’s exactly how they get strong. 💪' },
  { id: 'flowers', label: 'What are sound flowers?', keys: ['flower', 'flowers', 'bloom', 'plant', 'grow'], body: 'Each sound you master blooms a named flower in your Village — yours forever. 🌼' },
  { id: 'friends', label: 'What does “friends home” mean?', keys: ['friend', 'friends', 'home', 'resident', 'move in'], body: 'Help a character all the way and they move into your Village, so you can visit them any time. 🏡' },
  { id: 'stickers', label: 'What are stickers?', keys: ['sticker', 'stickers', 'badge', 'badges', 'reward', 'trophy'], body: 'Little celebrations for milestones — pure fun, never pressure. 🌟' },
];

export function pipCaps(): PipCap[] {
  const caps: PipCap[] = [];

  // 1) GO — every place Pip can take you
  for (const d of PIP_DESTINATIONS) {
    caps.push({ id: `go:${d.id}`, emoji: d.emoji, label: d.label, keys: d.keys, run: () => ({ kind: 'go', to: d.to }) });
  }

  // 2) SETTINGS — sound + buzz, independent toggles (labels reflect current state)
  caps.push({
    id: 'set:sound', emoji: '🔊', label: isMuted() ? 'Turn sounds on' : 'Turn sounds off',
    keys: ['sound', 'sounds', 'audio', 'mute', 'unmute', 'volume', 'quiet', 'noise', 'loud'],
    run: () => { const off = !isMuted(); setMuted(off); return { kind: 'say', text: off ? 'Sounds off now — quiet mode. 🤫 (The spoken words still play; those are the lesson!)' : 'Sounds back on! 🔊' }; },
  });
  caps.push({
    id: 'set:haptics', emoji: '📳', label: hapticsOn() ? 'Turn buzz off' : 'Turn buzz on',
    keys: ['haptic', 'haptics', 'buzz', 'vibrate', 'vibration', 'rumble', 'shake'],
    run: () => { const on = !hapticsOn(); setHaptics(on); return { kind: 'say', text: on ? 'Buzz is on! 📳' : 'Buzz is off now. 🤫' }; },
  });

  // 3) EXPLAIN a game — straight from the curriculum registry
  for (const lvl of LEVELS) {
    for (const g of lvl.games) {
      if (g.status !== 'available') continue;
      caps.push({
        id: `game:${g.id}`, emoji: g.emoji, label: `What is ${g.title}?`,
        keys: [g.title.toLowerCase(), ...g.title.toLowerCase().split(/\s+/), 'game', 'play'],
        run: () => ({ kind: 'explain', title: `${g.emoji} ${g.title}`, body: `${g.tagline} It’s part of Level ${lvl.num} — ${lvl.focus}.`, to: g.route, cta: g.route ? 'Play it ▸' : undefined }),
      });
    }
  }

  // 4) EXPLAIN data / rewards
  for (const c of DATA_CONCEPTS) {
    caps.push({ id: `data:${c.id}`, emoji: '📊', label: c.label, keys: c.keys, run: () => ({ kind: 'explain', title: c.label, body: c.body, to: c.to, cta: c.cta }) });
  }

  return caps;
}

/** Ranked type-ahead across everything Pip can do. Empty query → nothing. */
export function pipSuggest(query: string, max = 6): PipCap[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { c: PipCap; s: number }[] = [];
  for (const c of pipCaps()) {
    const label = c.label.toLowerCase();
    let s = -1;
    if (label.startsWith(q)) s = 4;
    else if (label.includes(q)) s = 3;
    else if (c.keys.some((k) => k === q)) s = 2.5;
    else if (c.keys.some((k) => k.startsWith(q))) s = 2;
    else if (c.keys.some((k) => k.includes(q))) s = 1;
    if (s >= 0) scored.push({ c, s });
  }
  return scored.sort((a, b) => b.s - a.s).slice(0, max).map((x) => x.c);
}
