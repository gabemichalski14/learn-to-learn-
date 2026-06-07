import { describe, it, expect, beforeEach } from 'vitest';
import { stableRead, __resetStableReadCache } from './stableRead';
import { loadLearners, getLearner, addLearner } from '../profiles';
import { loadProgress, recordFinish } from '../progress';

beforeEach(() => {
  localStorage.clear();
  __resetStableReadCache();
});

describe('stableRead', () => {
  it('returns the same reference while the signature is unchanged', () => {
    let builds = 0;
    const build = () => { builds++; return { v: 1 }; };
    const a = stableRead('k', 'sig1', build);
    const b = stableRead('k', 'sig1', build);
    expect(a).toBe(b);
    expect(builds).toBe(1); // built once, reused
  });

  it('rebuilds when the signature changes', () => {
    const a = stableRead('k', 'sig1', () => ({ v: 1 }));
    const b = stableRead('k', 'sig2', () => ({ v: 2 }));
    expect(a).not.toBe(b);
  });
});

// These guard the render-loop bug class: localStorage reads must return a STABLE
// reference until the data changes, so they're safe in React dependency arrays.
describe('profiles reads are reference-stable', () => {
  it('loadLearners: same reference until data changes, new reference after a write', () => {
    addLearner('Mia');
    const first = loadLearners();
    expect(loadLearners()).toBe(first); // identical across renders → loop-proof
    addLearner('Sam');
    const after = loadLearners();
    expect(after).not.toBe(first); // genuine change → fresh reference
    expect(after).toHaveLength(2);
  });

  it('getLearner: stable reference for the same learner', () => {
    const m = addLearner('Mia');
    expect(getLearner(m.id)).toBe(getLearner(m.id));
    expect(getLearner(m.id)?.name).toBe('Mia');
  });
});

describe('progress reads are reference-stable', () => {
  it('loadProgress: same reference until progress changes', () => {
    const m = addLearner('Mia');
    const a = loadProgress(m.id);
    expect(loadProgress(m.id)).toBe(a);
    recordFinish(m.id, 5000);
    const b = loadProgress(m.id);
    expect(b).not.toBe(a);
    expect(b.sessions).toBe(1);
  });
});
