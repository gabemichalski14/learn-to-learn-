import { describe, it, expect } from 'vitest';
import { parseTwee, tweeToArc, loadTwee } from './tweeLoader';

const SAMPLE = `:: StoryTitle
Moss

:: StoryData
{"ifid":"X"}

:: Stage0 [stage]
…oh. A friendly face. I'm Moss, and I'm all scattered.

:: Stage1 [stage]
A little colour returns.

:: Stage2 [stage]
I can sit up now.

:: Stage3 [stage]
I'm whole — I can go home. 🌼

:: Fragment_m [fragment]
I used to hum to the moon-moths…

Mmm — that warmth. I remember.
`;

describe('parseTwee', () => {
  it('reads passage names, tags, and bodies (until the next header)', () => {
    const ps = parseTwee(SAMPLE);
    const byName = Object.fromEntries(ps.map((p) => [p.name, p]));
    expect(byName.Stage0.tags).toEqual(['stage']);
    expect(byName.Stage0.body).toContain("I'm Moss");
    expect(byName.Fragment_m.body).toContain('moon-moths');
  });
});

describe('tweeToArc', () => {
  it('maps Stage0..3 into ordered stages and ignores StoryData/Title', () => {
    const arc = loadTwee(SAMPLE);
    expect(arc.stages).toHaveLength(4);
    expect(arc.stages[0]).toContain('scattered');
    expect(arc.stages[3]).toContain('go home');
  });
  it('splits a fragment passage into variants on blank lines', () => {
    const arc = loadTwee(SAMPLE);
    expect(arc.fragments.m).toEqual([
      'I used to hum to the moon-moths…',
      'Mmm — that warmth. I remember.',
    ]);
  });
  it('compacts stage holes (missing Stage2 → dense array)', () => {
    const arc = tweeToArc(parseTwee(':: Stage0\nA\n\n:: Stage3\nB\n'));
    expect(arc.stages).toEqual(['A', 'B']);
  });
});
