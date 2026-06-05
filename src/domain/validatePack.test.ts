import { describe, it, expect } from 'vitest';
import { validatePack } from './validatePack';
import { everydayObjects } from '../content/packs/everydayObjects';
import type { Pack } from './types';

describe('validatePack', () => {
  it('passes the starter pack with no problems', () => {
    expect(validatePack(everydayObjects)).toEqual([]);
  });

  it('flags a word whose beginningSound is not a known phoneme', () => {
    const bad: Pack = {
      id: 'x', name: 'x',
      words: [{ id: 'w1', label: 'xray', beginningSound: 'zzz', emoji: '❌' }],
    };
    expect(validatePack(bad)).toContain('word "w1": unknown beginningSound "zzz"');
  });

  it('flags duplicate word ids', () => {
    const bad: Pack = {
      id: 'x', name: 'x',
      words: [
        { id: 'dup', label: 'ball', beginningSound: 'b', emoji: '⚽' },
        { id: 'dup', label: 'bus', beginningSound: 'b', emoji: '🚌' },
      ],
    };
    expect(validatePack(bad)).toContain('duplicate word id "dup"');
  });

  it('flags a word with an empty emoji placeholder', () => {
    const bad: Pack = {
      id: 'x', name: 'x',
      words: [{ id: 'w1', label: 'ball', beginningSound: 'b', emoji: '' }],
    };
    expect(validatePack(bad)).toContain('word "w1": missing picture (emoji)');
  });
});
