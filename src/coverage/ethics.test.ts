import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { GAME_COVERAGE } from './coverage';
import { ETHICS_DECISIONS, isKept, decisionProblems } from './ethicsReview';

/**
 * Freshness Engine — Layer 2 test #6/#7: ethics-as-tests (the "ethics drift" lock).
 *
 * A source scan that FAILS THE BUILD if a dark pattern or a privacy-hostile API
 * sneaks into the code — turning our walk-the-line bright lines (and the COPPA
 * biometric / re-engagement hard lines) into an enforced invariant, not just a doc.
 *
 * Necessary-but-not-sufficient: this catches ACCIDENTS (a keyword tell). Subtle or
 * obfuscated dark patterns are caught by the standing quarterly human ethics audit
 * (Layer 3 / SWEEP.md), not this scan.
 *
 * Comments are stripped before scanning, so our avoidance-documentation ("never a
 * streak", "never decays") is fine — only real CODE is checked.
 */

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) && !/\.d\.ts$/.test(name)) out.push(p);
  }
  return out;
}

/** Strip block + line comments so avoidance-docs ("never a streak") don't trip the
 *  scan. Block comments keep their newlines so line numbers stay accurate. */
function stripComments(s: string): string {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')) // blank a /* */ block, keep newlines
    .replace(/\/\/[^\n]*/g, ' ');
}

const ALL_TS = walk(SRC);
const rel = (p: string) => relative(ROOT, p);
const isTutor = (p: string) => rel(p).startsWith('src/world/tutor'); // adult-facing dashboards

/** Files a child actually plays/sees — where engagement bright lines apply. */
function isChildSurface(p: string): boolean {
  const r = rel(p);
  if (isTutor(p)) return false;
  return (
    r.startsWith('src/worlds/') ||
    r.startsWith('src/world/') ||
    r.startsWith('src/mascots/') ||
    r === 'src/Home.tsx' ||
    r === 'src/achievements.ts'
  );
}

interface Finding { file: string; line: number; text: string; label: string }

/** First matching line (1-based) in comment-stripped CODE. */
function firstHit(file: string, re: RegExp): string | null {
  const f = findAll(file, re)[0];
  return f ? f.label : null;
}

/** All matching lines (comment-stripped) in a file, as structured findings. */
function findAll(file: string, re: RegExp): Finding[] {
  const orig = readFileSync(file, 'utf8').split('\n');
  const code = stripComments(orig.join('\n')).split('\n');
  const out: Finding[] = [];
  for (let i = 0; i < code.length; i++) {
    if (re.test(code[i])) {
      const text = (orig[i] ?? '').trim().slice(0, 100);
      out.push({ file: rel(file), line: i + 1, text, label: `${rel(file)}:${i + 1}  →  ${text}` });
    }
  }
  return out;
}

describe('ethics-as-tests — privacy-hostile APIs (#6, global)', () => {
  // Mic/camera capture (child voiceprint = COPPA biometric hard line) + Web
  // Notifications (re-engagement nag bright line). These never appear in real code.
  const SURVEILLANCE = /getUserMedia|\.mediaDevices\b|new\s+Notification\b|Notification\.requestPermission|\.showNotification\s*\(/;
  // Only the coverage manifest names these (in a string, documenting that we DON'T).
  const ALLOW = (p: string) => rel(p) === 'src/coverage/coverage.ts';

  it('no getUserMedia / mediaDevices / Web Notification anywhere in src', () => {
    const offenders = ALL_TS
      .filter((p) => !ALLOW(p))
      .map((p) => firstHit(p, SURVEILLANCE))
      .filter((x): x is string => x !== null);
    expect(offenders, `Privacy-hostile API found (mic/camera capture or push notifications are bright-line forbidden):\n${offenders.join('\n')}`).toEqual([]);
  });
});

describe('ethics-as-tests — engagement dark patterns in child surfaces (#6)', () => {
  // Streak-loss, progress decay, loot/randomized rewards, countdowns, FOMO,
  // login/daily bonuses, limited-time pressure. NOTE: the family progress view
  // ("leaderboard", single active student — no peer ranking) is intentionally NOT
  // banned; only true dark-pattern mechanics are.
  const DARK = /\bstreak|\bdecay|\bloot(box)?\b|countdown|\bFOMO\b|login[ -]?bonus|daily[ -]?bonus|limited[ -]?time/i;

  it('no UNREVIEWED streak / decay / loot / countdown / FOMO in child surfaces', () => {
    const surfaces = ALL_TS.filter(isChildSurface);
    expect(surfaces.length, 'expected to find child-surface files to scan').toBeGreaterThan(10);
    // Surface every finding, then subtract the ones a human consciously KEPT (walk
    // the line). What's left is UNREVIEWED — the build blocks until the owner decides
    // keep-with-reason or removal. The engine never auto-removes.
    const unreviewed = surfaces
      .flatMap((p) => findAll(p, DARK))
      .filter((f) => !isKept(f.file, f.text))
      .map((f) => f.label);
    expect(
      unreviewed,
      `Unreviewed dark-pattern tell in a child surface. The ethics engine ASKS before removal — do NOT auto-strip it. Take it to the owner and either (a) record a KEEP decision in src/coverage/ethicsReview.ts (legit white-hat lever, with a reason), or (b) get removal approval and a human edits the code:\n${unreviewed.join('\n')}`,
    ).toEqual([]);
  });
});

describe('walk-the-line consent ledger (ask before removal)', () => {
  it('every KEEP decision is justified (no rubber stamps)', () => {
    expect(decisionProblems()).toEqual([]);
  });

  it('a recorded KEEP allowlists only its own file + token; nothing else', () => {
    const decisions = [{ file: 'src/Home.tsx', match: 'streak', decision: 'keep' as const, reason: 'gentle non-resetting progress — motivating, no streak-loss', by: 'owner', at: '2026-06-12' }];
    expect(isKept('src/Home.tsx', 'a daily streak counter', decisions)).toBe(true);   // covered
    expect(isKept('src/Home.tsx', 'a countdown timer', decisions)).toBe(false);        // different token
    expect(isKept('src/worlds/Foo.tsx', 'a streak counter', decisions)).toBe(false);   // different file
    expect(isKept('src/Home.tsx', 'a streak counter')).toBe(false);                    // real ledger is empty → not kept
    expect(ETHICS_DECISIONS).toEqual([]); // we ship with zero keeps; the streak was reframed, not rubber-stamped
  });
});

describe('ethics-as-tests — manifest linkage + walk-the-line (#7)', () => {
  it('every declared bright-line component is covered (scan ↔ manifest stay tied)', () => {
    const brightLines = GAME_COVERAGE.filter((c) => c.kind === 'bright-line');
    expect(brightLines.length).toBeGreaterThanOrEqual(3);
    expect(brightLines.every((c) => c.status === 'covered')).toBe(true);
    // The three themes this scan enforces must each have a manifest row.
    for (const id of ['g-no-streaks-fomo', 'g-no-dark-social', 'g-no-variable-reward']) {
      expect(brightLines.some((c) => c.id === id), `missing bright-line row ${id}`).toBe(true);
    }
  });

  it('reports lean-in maximizers not yet fully adopted (informative, non-blocking)', () => {
    const leanIn = GAME_COVERAGE.filter((c) => c.kind === 'lean-in');
    const notYet = leanIn.filter((c) => c.status !== 'covered').map((c) => c.id);
    // Non-blocking: surface the list so we keep adopting them; never fails the build.
    if (notYet.length) console.info(`[walk-the-line] lean-in maximizers still partial/missing: ${notYet.join(', ')}`);
    expect(Array.isArray(notYet)).toBe(true);
  });
});
