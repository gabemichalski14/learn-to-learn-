/**
 * The story spine — ROAD B (see DESIGN.md + memory `barton-games-art-direction-rethink.md`).
 * Immersion comes from a PREMISE + characters who REMEMBER you + a world that
 * responds to your real practice — not from background art. This module turns the
 * data we already track (sessions, days-away, mastered sounds, growth tier) into a
 * `NarrativeState`, then writes warm, memory-aware lines for the Home hero and for
 * Pip. Pure line functions are deterministic (tested); the gatherer reads the store.
 *
 * World premise: "The Sound Garden has gone quiet. With Pip & Echo you bring it back
 * to life — every sound you learn plants something, and lost voices return."
 */
import { useState } from 'react';
import { useProgress, useDataVersion } from '../data/store';
import { loadProgress } from '../progress';
import { loadSessionLog } from '../sessionLog';
import { loadMastery } from '../mastery/mastery';
import { parseSkillKey } from '../mastery/skills';
import { investmentScore, tierProgress } from './worldTier';

export interface NarrativeState {
  newcomer: boolean;          // never finished a session
  sessions: number;
  stickers: number;
  tierName: string;           // garden growth stage
  daysSince: number | null;   // whole days since the last session (null = newcomer)
  lastSkill: string | null;   // label of the most-recently-practiced sound
}

/** Whole days between two epoch-ms times (>= 0), or null if no prior visit. */
export function daysBetween(lastMs: number | null, nowMs: number): number | null {
  if (lastMs == null) return null;
  return Math.max(0, Math.floor((nowMs - lastMs) / 86_400_000));
}

/** The Home hero subline — warm, and aware of how long you've been away + what you
 *  grew. Newcomers get the world premise. Deterministic given the state. */
export function homeLead(s: NarrativeState): string {
  if (s.newcomer) {
    return 'The Sound Garden is sleepy and quiet. Plant your very first sound with Pip and Echo — and watch it wake up.';
  }
  const skill = s.lastSkill ? `the ${s.lastSkill} sound` : 'your sounds';
  if (s.daysSince === 0) return `Welcome back — your garden's still warm from earlier. Want to grow ${skill} a little more?`;
  if (s.daysSince === 1) return `A day away, and your garden missed you. Pip kept ${skill} cozy — shall we make it bloom?`;
  if (s.daysSince != null && s.daysSince >= 2) return `${s.daysSince} days away — the garden's been waiting. It's looking ${s.tierName.toLowerCase()}, and ${skill} is ready when you are.`;
  return `Your ${s.tierName.toLowerCase()} garden is glad you're here. Let's grow ${skill} today.`;
}

export interface Line { say: string; cta?: string; to?: string }

/** Pip's greeting — remembers your last visit + the sound you grew. */
export function pipGreetingFor(s: NarrativeState): Line {
  if (s.newcomer) return { say: "Hi! I'm Pip. 🌱 This is the Sound Garden — it's a little sleepy. Let's wake it up together!", cta: 'Plant a sound', to: '#/levels' };
  const skill = s.lastSkill ? `the ${s.lastSkill} sound` : 'a sound';
  if (s.daysSince === 0) return { say: 'Back so soon? I love that. 💚', cta: 'Keep growing', to: '#/levels' };
  if (s.daysSince === 1) return { say: `We grew ${skill} yesterday — want to help it bloom?`, cta: "Let's go", to: '#/levels' };
  if (s.daysSince != null && s.daysSince >= 2) return { say: `${s.daysSince} days! I watered ${skill} for you while you were away. 🌿`, cta: 'Continue', to: '#/levels' };
  return { say: 'There you are! Ready to grow a sound with me?', cta: "Let's play", to: '#/levels' };
}

/** Read the store and assemble the current narrative state (call in render via the
 *  hook, or at event-time). Safe: the hook memoizes on the stable Progress + version. */
/** A short, warm reference to a practiced sound — e.g. `/m/` — built for inline use
 *  in "the ___ sound". Returns null for non-sound skills (e.g. segmenting) so the
 *  lines fall back gracefully to "your sounds" rather than reading awkwardly. */
function shortSound(key: string): string | null {
  const p = parseSkillKey(key);
  return p ? `/${p.soundId}/` : null;
}

export function narrativeState(learnerId: string, nowMs: number): NarrativeState {
  const prog = loadProgress(learnerId);
  const log = loadSessionLog(learnerId);
  const mastery = loadMastery(learnerId);
  // The most-recently-practiced *sound* (segmenting/other skills are skipped so the
  // greeting always reads "the /m/ sound", never a descriptive phrase doubled up).
  let lastSkill: string | null = null, bestSeen = -1;
  for (const [key, s] of Object.entries(mastery)) {
    if (s.attempts > 0 && s.lastSeen > bestSeen) {
      const sound = shortSound(key);
      if (sound) { bestSeen = s.lastSeen; lastSkill = sound; }
    }
  }
  const latest = log.length ? new Date(log[log.length - 1].endedAt).getTime() : null;
  return {
    newcomer: prog.sessions === 0,
    sessions: prog.sessions,
    stickers: new Set(prog.earned).size,
    tierName: tierProgress(investmentScore(prog)).name,
    daysSince: daysBetween(latest, nowMs),
    lastSkill,
  };
}

/** Reactive narrative state for the current learner. Subscribes to the learner's
 *  Progress + the global data version so the lines refresh whenever practice data
 *  changes; `now` is captured once per mount (lazy init keeps render pure — no
 *  impure `Date.now()` in the render body). */
export function useNarrative(learnerId: string): NarrativeState {
  useProgress(learnerId);   // subscribe: re-render when this learner's progress changes
  useDataVersion();         // subscribe: re-render on any local data write
  const [now] = useState(() => Date.now());
  return narrativeState(learnerId, now);
}
