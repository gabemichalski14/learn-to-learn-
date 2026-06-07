import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';

// Replace the data source with mocks so we can count how often Home loads data.
vi.mock('./data/dataSource', () => ({
  getSessions: vi.fn(async () => []),
  getMastery: vi.fn(async () => ({})),
}));

import { Home } from './Home';
import { addLearner } from './profiles';
import { getSessions, getMastery } from './data/dataSource';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('Home — no render loop', () => {
  it('loads each data source only a bounded number of times', async () => {
    const m = addLearner('Mia');
    render(<Home learnerId={m.id} />);
    // Give effects + any (buggy) re-render cascade time to run. A render loop
    // would call these dozens/hundreds of times; the fix calls each once.
    await new Promise((r) => setTimeout(r, 150));
    expect(vi.mocked(getSessions).mock.calls.length).toBeLessThanOrEqual(2);
    expect(vi.mocked(getMastery).mock.calls.length).toBeLessThanOrEqual(2);
  });
});
