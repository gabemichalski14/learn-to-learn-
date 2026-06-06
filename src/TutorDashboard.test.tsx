import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TutorDashboard } from './TutorDashboard';
import { addLearner } from './profiles';

beforeEach(() => localStorage.clear());

describe('TutorDashboard', () => {
  it('renders with a learner and shows the KPI labels', async () => {
    addLearner('Mia');
    render(<TutorDashboard />);
    expect(await screen.findByText(/Tutor Dashboard/i)).toBeTruthy();
    expect(screen.getByText(/avg accuracy/i)).toBeTruthy();
  });
});
