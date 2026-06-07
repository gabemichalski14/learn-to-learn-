import { describe, it, expect, beforeEach } from 'vitest';
import { speak, buildCtx, lineToPhrase } from './speak';
import { PIP_LINES } from './characters';
import { bondOf, loadLore } from './loreStore';
import { __resetStableReadCache } from '../../data/stableRead';
import { destById } from '../../mascots/pipNav';

const L = 'speak-test';
beforeEach(() => { localStorage.clear(); __resetStableReadCache(); });

describe('speak', () => {
  it('returns a non-empty phrase and deepens the bond (never decays)', () => {
    const p = speak(L, PIP_LINES, () => 0);
    expect(p).not.toBeNull();
    expect((p?.say ?? '').length).toBeGreaterThan(0);
    expect(bondOf(L, 'pip')).toBe(1);
    speak(L, PIP_LINES, () => 0);
    expect(bondOf(L, 'pip')).toBe(2);
  });

  it('records the shown line so the next chat avoids it (no hollow repeat)', () => {
    speak(L, PIP_LINES, () => 0);
    expect(loadLore(L).recentLines).toHaveLength(1);
    speak(L, PIP_LINES, () => 0);
    const rec = loadLore(L).recentLines;
    expect(rec).toHaveLength(2);
    expect(new Set(rec).size).toBe(2); // two different lines
  });

  it('maps a CTA to the SAME destination route + label (spoken == target)', () => {
    const ctx = buildCtx(L, 1_700_000_000_000);
    const withCta = PIP_LINES.find((l) => l.cta);
    expect(withCta).toBeTruthy();
    const ph = lineToPhrase(withCta!, ctx);
    const dest = destById(withCta!.cta!.destId);
    expect(ph.to).toBe(dest?.to);
    expect(ph.cta).toBe(dest?.label);
  });
});
