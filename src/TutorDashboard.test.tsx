import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TutorDashboard } from './TutorDashboard';
import { addLearner } from './profiles';

beforeEach(() => localStorage.clear());

describe('TutorDashboard', () => {
  it('renders with a learner and shows the KPI labels', async () => {
    addLearner('Mia');
    render(<TutorDashboard />);
    // The heading renders as "Tutor <em>Dashboard</em>"; the accessible name
    // concatenates the parts, so match by role rather than a single text node.
    expect(await screen.findByRole('heading', { name: /Tutor Dashboard/i })).toBeTruthy();
    expect(screen.getByText(/avg accuracy/i)).toBeTruthy();
  });

  it('renders the Sound map + Engagement sections when a learner exists', async () => {
    addLearner('Mia');
    render(<TutorDashboard />);
    expect((await screen.findAllByText(/Sound map/i)).length).toBeGreaterThan(0);
    expect(screen.getByText(/Engagement/i)).toBeTruthy();
  });
});
