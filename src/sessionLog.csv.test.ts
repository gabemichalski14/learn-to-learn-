import { describe, it, expect } from 'vitest';
import { sessionLogCsv } from './sessionLog';
import type { SessionRecord } from './sessionLog';

const rec = (over: Partial<SessionRecord>): SessionRecord => ({
  id: '1', game: 'middle-sounds', level: 2, startedAt: '', endedAt: '2026-06-06T00:00:00Z',
  durationMs: 61000, rounds: 5, items: 30, wrongAttempts: 0, accuracy: 1, ...over,
});

describe('sessionLogCsv escaping', () => {
  it('neutralises spreadsheet formula injection (leading = + - @)', () => {
    const csv = sessionLogCsv([rec({ game: '=SUM(A1)' })]);
    expect(csv).toContain("'=SUM(A1)");
    expect(csv).not.toMatch(/,=SUM/); // never a bare formula cell
  });

  it('quotes cells containing commas or quotes', () => {
    const csv = sessionLogCsv([rec({ game: 'a,"b"' })]);
    expect(csv).toContain('"a,""b"""');
  });

  it('emits a header + one row per record', () => {
    const csv = sessionLogCsv([rec({}), rec({})]);
    expect(csv.split('\n')).toHaveLength(3);
    expect(csv.split('\n')[0]).toContain('accuracy_pct');
  });
});
