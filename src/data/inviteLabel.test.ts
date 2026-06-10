import { describe, it, expect } from 'vitest';
import { inviteLabel } from './cloud';

describe('inviteLabel', () => {
  it('prefers the name the owner typed', () => {
    expect(inviteLabel({ name: 'Jane Doe', email: 'jdoe@school.org' })).toBe('Jane Doe');
  });
  it('derives a friendly name from the email when no name', () => {
    expect(inviteLabel({ name: null, email: 'jane.doe@gmail.com' })).toBe('Jane Doe');
    expect(inviteLabel({ name: '', email: 'mary-anne_smith@x.com' })).toBe('Mary Anne Smith');
  });
  it('falls back to a plain label with no email', () => {
    expect(inviteLabel({ name: null, email: null })).toBe('Invite sent');
  });
});
