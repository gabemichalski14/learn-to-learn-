import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentPicker } from './StudentPicker';
import { addLearner } from './profiles';

beforeEach(() => localStorage.clear());

describe('StudentPicker', () => {
  it('lists students and selects on tap', () => {
    const mia = addLearner('Mia');
    addLearner('Sam');
    const onSelect = vi.fn();
    render(<StudentPicker open onSelect={onSelect} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Mia/ }));
    expect(onSelect).toHaveBeenCalledWith(mia.id);
  });

  it('filters by the search box', () => {
    // create > 12 learners so the search box renders
    for (let i = 0; i < 12; i++) addLearner(`Kid${i}`);
    addLearner('Sam');
    render(<StudentPicker open onSelect={() => {}} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'sam' } });
    expect(screen.queryByRole('button', { name: /Kid0/ })).toBeNull();
    expect(screen.getByRole('button', { name: /Sam/ })).toBeTruthy();
  });
});
