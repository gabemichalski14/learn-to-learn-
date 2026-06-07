import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useLearners } from './store';
import { addLearner, renameLearner } from '../profiles';

beforeEach(() => localStorage.clear());

function Roster() {
  const learners = useLearners();
  return <ul>{learners.map((l) => <li key={l.id}>{l.name}</li>)}</ul>;
}

describe('reactive store (useSyncExternalStore)', () => {
  it('re-renders subscribers live when data changes', () => {
    render(<Roster />);
    expect(screen.queryByText('Mia')).toBeNull();

    let id = '';
    act(() => { id = addLearner('Mia').id; });
    expect(screen.getByText('Mia')).toBeTruthy(); // appeared without a reload

    act(() => { renameLearner(id, 'Mira'); });
    expect(screen.getByText('Mira')).toBeTruthy();
    expect(screen.queryByText('Mia')).toBeNull();
  });
});
