import type { SessionRecord } from './sessionLog';
import { loadSessionLog } from './sessionLog';
import { loadEarned, addEarned } from './progress';

/**
 * Program-wide achievement stickers: each sticker is a *distinct goal*, not just
 * "finish another game". Goals are game-agnostic — they read from the shared
 * session log + progress, so any game we add earns the same stickers.
 */
export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  /** Earned when this returns true for the just-finished session's context. */
  earned: (c: AchvCtx) => boolean;
}

export interface AchvCtx {
  /** Full session log, including the session that just finished (last element). */
  log: SessionRecord[];
  /** The session just finished. */
  last: SessionRecord;
  /** The previous session (for improvement goals), if any. */
  prev?: SessionRecord;
  /** Total sessions finished. */
  sessions: number;
  /** Distinct calendar days played. */
  distinctDays: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first',    emoji: '🌟', title: 'First Finish',   desc: 'Finish your first game',        earned: (c) => c.sessions >= 1 },
  { id: 'perfect',  emoji: '🦄', title: 'Perfect!',       desc: 'Finish with no mistakes',       earned: (c) => c.last.wrongAttempts === 0 },
  { id: 'sharp',    emoji: '🌈', title: 'Sharp Ears',     desc: 'Finish with 90%+ accuracy',     earned: (c) => c.last.accuracy >= 0.9 },
  { id: 'speedy',   emoji: '🚀', title: 'Speedy',         desc: 'Finish in under a minute',      earned: (c) => c.last.durationMs <= 60_000 },
  { id: 'better',   emoji: '🦋', title: 'Getting Better', desc: 'Beat your last accuracy',       earned: (c) => !!c.prev && c.last.accuracy > c.prev.accuracy },
  { id: 'five',     emoji: '🐬', title: 'High Five',      desc: 'Finish 5 games',                earned: (c) => c.sessions >= 5 },
  { id: 'ten',      emoji: '🌻', title: 'Perfect Ten',    desc: 'Finish 10 games',               earned: (c) => c.sessions >= 10 },
  { id: 'persist',  emoji: '🐢', title: 'Never Give Up',  desc: 'Finish a really tricky one',    earned: (c) => c.last.wrongAttempts >= 6 },
  { id: 'twoday',   emoji: '🎈', title: 'Two-Day Streak', desc: 'Play on two different days',    earned: (c) => c.distinctDays >= 2 },
  { id: 'fiveday',  emoji: '🐱', title: 'Five-Day Club',  desc: 'Play on five different days',   earned: (c) => c.distinctDays >= 5 },
  { id: 'wise',     emoji: '🦉', title: 'Wise Owl',       desc: 'Finish 25 games',               earned: (c) => c.sessions >= 25 },
  { id: 'collector', emoji: '🐠', title: 'Collector',     desc: 'Earn every other sticker',      earned: () => false /* handled specially below */ },
];

const COLLECTOR_ID = 'collector';

/** Decide which achievements are newly earned this session (collector handled last). */
export function evaluateNew(ctx: AchvCtx, alreadyEarned: Set<string>): Achievement[] {
  const newly: Achievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (a.id === COLLECTOR_ID) continue;
    if (!alreadyEarned.has(a.id) && a.earned(ctx)) newly.push(a);
  }
  const after = new Set([...alreadyEarned, ...newly.map((a) => a.id)]);
  const others = ACHIEVEMENTS.filter((a) => a.id !== COLLECTOR_ID);
  if (!alreadyEarned.has(COLLECTOR_ID) && others.every((a) => after.has(a.id))) {
    const collector = ACHIEVEMENTS.find((a) => a.id === COLLECTOR_ID);
    if (collector) newly.push(collector);
  }
  return newly;
}

/**
 * Evaluate + persist achievements for the session that was *just logged*.
 * Call AFTER logSession(). Returns the achievements newly earned (0, 1, or many).
 */
export function awardForSession(): Achievement[] {
  const log = loadSessionLog();
  if (log.length === 0) return [];
  const last = log[log.length - 1];
  const prev = log.length >= 2 ? log[log.length - 2] : undefined;
  const distinctDays = new Set(log.map((r) => r.endedAt.slice(0, 10))).size;
  const ctx: AchvCtx = { log, last, prev, sessions: log.length, distinctDays };

  const newly = evaluateNew(ctx, new Set(loadEarned()));
  if (newly.length) addEarned(newly.map((a) => a.id));
  return newly;
}
