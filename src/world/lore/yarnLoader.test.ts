import { describe, it, expect } from 'vitest';
import { parseYarn, yarnToContent, loadYarn } from './yarnLoader';

const SAMPLE = `title: Intro
---
Will you help me find my hum? 🌱
// authoring note, ignored
===
title: Wrong
---
Oh — not that sound. But you're still here. 💚 #soft
Close! The little ones are slippery. <<wait>>
-> not an option we keep
===
title: Win
---
You brought them ALL home — mmmmm! 🌼
===
title: Fragment_m
---
I used to hum to the moon-moths…
===
`;

describe('parseYarn', () => {
  it('extracts node titles and authored lines, skipping commands/options/comments', () => {
    const nodes = parseYarn(SAMPLE);
    expect(Object.keys(nodes).sort()).toEqual(['Fragment_m', 'Intro', 'Win', 'Wrong']);
    expect(nodes.Intro).toEqual(['Will you help me find my hum? 🌱']);
    expect(nodes.Wrong).toEqual([
      "Oh — not that sound. But you're still here. 💚", // trailing #soft stripped
      'Close! The little ones are slippery.',           // inline <<wait>> dropped
    ]);
  });
  it('handles CRLF', () => {
    const nodes = parseYarn('title: Win\r\n---\r\nHome at last.\r\n===\r\n');
    expect(nodes.Win).toEqual(['Home at last.']);
  });
});

describe('yarnToContent', () => {
  it('maps reaction nodes + fragment nodes', () => {
    const content = loadYarn(SAMPLE);
    expect(content.reactions.intro).toEqual(['Will you help me find my hum? 🌱']);
    expect(content.reactions.win).toEqual(['You brought them ALL home — mmmmm! 🌼']);
    expect(content.reactions.correct).toBeUndefined();
    expect(content.fragments.m).toEqual(['I used to hum to the moon-moths…']);
  });
  it('is case-insensitive on node titles and never yields undefined lines', () => {
    const content = yarnToContent({ CORRECT: ['Yes!'], 'fragment-S': ['a memory'] });
    expect(content.reactions.correct).toEqual(['Yes!']);
    expect(content.fragments.s).toEqual(['a memory']);
  });
});
