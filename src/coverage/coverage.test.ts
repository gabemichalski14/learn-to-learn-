import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LEVELS } from '../games';
import {
  REQUIRED_DOMAINS,
  FRAMEWORKS,
  ALL_COVERAGE,
  READING_COVERAGE,
  GAME_COVERAGE,
  COMPLIANCE_COVERAGE,
  dueDate,
  isOverdue,
  deferProblems,
  activeDeferIds,
  sweepDeferred,
  type CoverageComponent,
  type CoverageMeta,
} from './coverage';

const today = new Date().toISOString().slice(0, 10);

describe('Freshness Engine — manifest integrity', () => {
  it('has unique component ids', () => {
    const ids = ALL_COVERAGE.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // #5 Triangulation — a 'covered' claim needs a place + ≥2 independent sources.
  it('#5 every covered row has a non-empty where + ≥2 sources', () => {
    const bad = ALL_COVERAGE
      .filter((c) => c.status === 'covered' && (!c.where.trim() || c.sources.length < 2))
      .map((c) => c.id);
    expect(bad).toEqual([]);
  });

  // #3 Required-domain completeness — an empty domain = a whole area missing.
  it('#3 every required domain (reading · gaming · compliance) has ≥1 component', () => {
    const missing: string[] = [];
    (Object.entries(REQUIRED_DOMAINS) as [keyof typeof REQUIRED_DOMAINS, string[]][]).forEach(([side, domains]) => {
      domains.forEach((domain) => {
        if (!ALL_COVERAGE.some((c) => c.side === side && c.domain === domain)) missing.push(`${side}/${domain}`);
      });
    });
    expect(missing).toEqual([]);
  });

  // #4 Framework completeness — every enumerated element maps to ≥1 component.
  it('#4 every canonical-framework element is referenced by a component', () => {
    const referenced = new Set<string>();
    ALL_COVERAGE.forEach((c) => c.frameworks.forEach((f) => referenced.add(f)));
    const orphans: string[] = [];
    for (const fw of FRAMEWORKS) {
      for (const el of fw.elements) {
        const inFrameworks = referenced.has(el);
        const inNote = ALL_COVERAGE.some((c) => c.note?.includes(el));
        if (!inFrameworks && !inNote) orphans.push(`${fw.id}:${el}`);
      }
    }
    expect(orphans).toEqual([]);
  });

  // #2 No-level-left-behind — a level can't ship without ≥ partial reading coverage.
  it('#2 every games.ts level has a covered/partial reading row', () => {
    const uncovered = LEVELS.map((l) => l.num).filter(
      (num) => !READING_COVERAGE.some(
        (c) => (c.status === 'covered' || c.status === 'partial') && c.levels?.includes(num),
      ),
    );
    expect(uncovered).toEqual([]);
  });
});

describe('Freshness Engine — staleness tripwire (#1)', () => {
  it('emergency-valve defers are all well-formed + bounded', () => {
    expect(deferProblems()).toEqual([]);
  });

  it('review is current today — a RED gate here means the quarterly sweep is overdue', () => {
    // Forcing function: this flips red `reviewIntervalDays` after `lastReviewed`.
    // When it goes red, run docs/coverage/SWEEP.md and bump COVERAGE_META.lastReviewed
    // (or add a bounded `sweep` defer). NEVER delete this test.
    const overdue = isOverdue(today) && !sweepDeferred(today);
    expect(
      overdue,
      `Coverage review OVERDUE (was due ${dueDate()}). Run docs/coverage/SWEEP.md, then bump COVERAGE_META.lastReviewed or add a bounded 'sweep' defer.`,
    ).toBe(false);
  });
});

describe('Freshness Engine — tripwire self-test (#9, deterministic)', () => {
  const meta: CoverageMeta = {
    lastReviewed: '2026-01-01', reviewIntervalDays: 90, maxDeferDays: 30, coverageVersion: 1, acknowledgedDefers: [],
  };

  it('computes the due date and overdue boundary correctly', () => {
    expect(dueDate(meta)).toBe('2026-04-01'); // Jan 1 + 90d
    expect(isOverdue('2026-03-31', meta)).toBe(false);
    expect(isOverdue('2026-04-01', meta)).toBe(false); // the due date itself is not yet overdue
    expect(isOverdue('2026-04-02', meta)).toBe(true);
  });

  it('flags malformed defers (unknown id / missing reason / over the cap)', () => {
    const realId = ALL_COVERAGE[0].id;
    const probs = deferProblems({
      ...meta,
      acknowledgedDefers: [
        { componentId: 'nope', reason: 'x', by: 'me', at: '2026-04-02', until: '2026-04-10' },
        { componentId: realId, reason: '', by: 'me', at: '2026-04-02', until: '2026-04-10' },
        { componentId: realId, reason: 'slow review', by: 'me', at: '2026-04-02', until: '2026-09-01' }, // > 30d
      ],
    });
    expect(probs.some((p) => p.includes('unknown component'))).toBe(true);
    expect(probs.some((p) => p.includes('missing reason'))).toBe(true);
    expect(probs.some((p) => p.includes('exceeds maxDeferDays'))).toBe(true);
  });

  it('the sweep valve is active only while un-expired (and well-formed)', () => {
    const m: CoverageMeta = {
      ...meta,
      acknowledgedDefers: [{ componentId: 'sweep', reason: 'hotfix in flight', by: 'owner', at: '2026-04-02', until: '2026-04-20' }],
    };
    expect(activeDeferIds('2026-04-10', m).has('sweep')).toBe(true);
    expect(activeDeferIds('2026-04-21', m).has('sweep')).toBe(false);
    expect(sweepDeferred('2026-04-10', m)).toBe(true);
    expect(sweepDeferred('2026-04-21', m)).toBe(false); // expired → no longer covers an overdue review
  });
});

describe('Freshness Engine — manifest↔prose sync (#10)', () => {
  const maps: Record<string, CoverageComponent[]> = {
    'docs/coverage/READING-COVERAGE.md': READING_COVERAGE,
    'docs/coverage/GAME-COVERAGE.md': GAME_COVERAGE,
    'docs/coverage/COMPLIANCE-COVERAGE.md': COMPLIANCE_COVERAGE,
  };
  for (const [path, components] of Object.entries(maps)) {
    it(`${path} references every manifest id (docs can't silently drift)`, () => {
      const text = readFileSync(join(process.cwd(), path), 'utf8');
      const missing = components.filter((c) => !text.includes(c.id)).map((c) => c.id);
      expect(missing).toEqual([]);
    });
  }
});
