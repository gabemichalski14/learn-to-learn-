# Mastery Foundation (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local, per-item skill-mastery model so the two live games record what a learner gets right/wrong per Barton skill, surfacing "Areas to improve", "Next up", and a "Practice this" loop into a targeted game.

**Architecture:** A new `src/mastery/` module (skill-key taxonomy, local mastery store with rolling scoring, learner placement + curriculum-derived "next up", and skill→game/skill-help content). The sort games emit one per-item result on first attempt via a new `useSortGame` callback. The round generator gains a `focusSound` so a "Practice this" link drills one skill. UI components (`AreasToImprove`, `NextUp`) render on the Profile page. Everything is local-first and needs no backend — it mirrors the existing `progress.ts` / `sessionLog.ts` localStorage pattern.

**Tech Stack:** React 19 + TypeScript + Vite, Vitest. Run binaries directly: `./node_modules/.bin/tsc`, `./node_modules/.bin/vitest`, `./node_modules/.bin/vite` (NOT npx).

---

## File structure

| File | Responsibility |
|------|----------------|
| `src/mastery/skills.ts` (create) | `SkillKey` type + `skillKeyForSound`, `parseSkillKey`, `skillLabel` |
| `src/mastery/skill-help.ts` (create) | Our-own-words What/Why/How + home tip per sound |
| `src/mastery/mastery.ts` (create) | Local store: `recordItem`, `loadMastery`, `masteryScore`, `areasToImprove`, `clearMastery` |
| `src/mastery/placement.ts` (create) | `getPlacement`/`setPlacement` + `nextUp` (curriculum-derived) |
| `src/mastery/skill-games.ts` (create) | `practiceRouteForSkill` (skill → `#/play/<game>?focus=<skill>`) |
| `src/domain/engine.ts` (modify) | Add `focusSound?` to `generateSortRound` |
| `src/game/useSortGame.ts` (modify) | Add `onItemResult` callback; emit first-attempt-per-item |
| `src/game/SortGame.tsx` (modify) | Wire `onItemResult` → `recordItem` |
| `src/router.ts` (modify) | Parse `?focus=` on the play route |
| `src/GameScreen.tsx` (modify) | Accept `focus`, pass `focusSound` to the generator |
| `src/App.tsx` (modify) | Pass `route.focus` to `GameScreen` |
| `src/AreasToImprove.tsx` (create) | Focus-card list (ring + What/Why/How + Practice ▸) |
| `src/NextUp.tsx` (create) | Upcoming lessons/level from the curriculum |
| `src/ProfilePage.tsx` (modify) | Render `NextUp` + `AreasToImprove` for the current learner |
| `src/styles/theme.css` (modify) | Styles for the two new components |

---

### Task 1: Skill-key taxonomy

**Files:**
- Create: `src/mastery/skills.ts`
- Test: `src/mastery/skills.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/mastery/skills.test.ts
import { describe, it, expect } from 'vitest';
import { skillKeyForSound, parseSkillKey, skillLabel } from './skills';

describe('skill keys', () => {
  it('builds keys per sound + position', () => {
    expect(skillKeyForSound('m', 'beginning')).toBe('sound:first:m');
    expect(skillKeyForSound('m', 'ending')).toBe('sound:last:m');
  });
  it('round-trips through parse', () => {
    expect(parseSkillKey('sound:first:b')).toEqual({ kind: 'sound', target: 'beginning', soundId: 'b' });
    expect(parseSkillKey('sound:last:s')).toEqual({ kind: 'sound', target: 'ending', soundId: 's' });
    expect(parseSkillKey('nonsense')).toBeNull();
  });
  it('labels are learner-friendly', () => {
    expect(skillLabel('sound:first:m')).toBe('the /m/ sound at the start');
    expect(skillLabel('sound:last:t')).toBe('the /t/ sound at the end');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run src/mastery/skills.test.ts`
Expected: FAIL — cannot find module `./skills`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/mastery/skills.ts
import type { SoundTarget } from '../domain/types';

/** Stable skill identifier, e.g. 'sound:first:m'. Extensible to confusions/rules later. */
export type SkillKey = string;

export interface ParsedSkill {
  kind: 'sound';
  target: SoundTarget;
  soundId: string;
}

/** The skill the sort games train: recognizing a sound in a position. */
export function skillKeyForSound(soundId: string, target: SoundTarget): SkillKey {
  return `sound:${target === 'ending' ? 'last' : 'first'}:${soundId}`;
}

export function parseSkillKey(key: SkillKey): ParsedSkill | null {
  const parts = key.split(':');
  if (parts.length === 3 && parts[0] === 'sound' && (parts[1] === 'first' || parts[1] === 'last')) {
    return { kind: 'sound', target: parts[1] === 'last' ? 'ending' : 'beginning', soundId: parts[2] };
  }
  return null;
}

/** Learner-facing label. ipa is simply /id/ in our registry, so we build from the id. */
export function skillLabel(key: SkillKey): string {
  const p = parseSkillKey(key);
  if (!p) return key;
  return `the /${p.soundId}/ sound at the ${p.target === 'ending' ? 'end' : 'start'}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run src/mastery/skills.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/mastery/skills.ts src/mastery/skills.test.ts
git commit -m "feat(mastery): skill-key taxonomy (sound+position)"
```

---

### Task 2: Skill-help content

**Files:**
- Create: `src/mastery/skill-help.ts`
- Test: `src/mastery/skill-help.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/mastery/skill-help.test.ts
import { describe, it, expect } from 'vitest';
import { skillHelp } from './skill-help';

describe('skillHelp', () => {
  it('returns what/why/how for a known sound skill', () => {
    const h = skillHelp('sound:first:m');
    expect(h.what.length).toBeGreaterThan(0);
    expect(h.why.length).toBeGreaterThan(0);
    expect(h.tip.length).toBeGreaterThan(0);
  });
  it('falls back gracefully for unknown keys', () => {
    const h = skillHelp('sound:first:zzz');
    expect(h.what).toContain('/zzz/');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run src/mastery/skill-help.test.ts`
Expected: FAIL — cannot find module `./skill-help`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/mastery/skill-help.ts
import { parseSkillKey } from './skills';
import type { SkillKey } from './skills';

export interface SkillHelp {
  what: string; // plain description
  why: string;  // why it matters
  tip: string;  // a quick at-home / strategy tip
}

/** Our own kid-friendly guidance per skill (never Barton's scripts). */
export function skillHelp(key: SkillKey): SkillHelp {
  const p = parseSkillKey(key);
  if (!p) return { what: key, why: 'A skill to practice.', tip: 'Keep practicing — short and playful.' };
  const s = p.soundId;
  const where = p.target === 'ending' ? 'end' : 'start';
  return {
    what: `We listen for the /${s}/ sound at the ${where} of a word and match it to its letter.`,
    why: `Hearing /${s}/ clearly makes reading and spelling words with it much easier.`,
    tip: `Say a few words slowly and stretch the ${where} sound: is it /${s}/? Thumbs up if yes.`,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run src/mastery/skill-help.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/mastery/skill-help.ts src/mastery/skill-help.test.ts
git commit -m "feat(mastery): authored skill-help content"
```

---

### Task 3: Local mastery store + scoring

**Files:**
- Create: `src/mastery/mastery.ts`
- Test: `src/mastery/mastery.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/mastery/mastery.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { recordItem, loadMastery, masteryScore, areasToImprove, clearMastery } from './mastery';

const L = 'test-learner';
beforeEach(() => { localStorage.clear(); });

describe('mastery store', () => {
  it('accumulates attempts and correct counts', () => {
    recordItem(L, 'sound:first:m', true);
    recordItem(L, 'sound:first:m', false);
    const m = loadMastery(L);
    expect(m['sound:first:m'].attempts).toBe(2);
    expect(m['sound:first:m'].correct).toBe(1);
  });

  it('scores unseen skills as fully solid (1)', () => {
    expect(masteryScore(L, 'sound:first:b')).toBe(1);
  });

  it('weights recent answers more heavily', () => {
    // 5 wrong then 5 right -> recency pushes the score above 0.5
    for (let i = 0; i < 5; i++) recordItem(L, 'sound:first:s', false);
    for (let i = 0; i < 5; i++) recordItem(L, 'sound:first:s', true);
    expect(masteryScore(L, 'sound:first:s')).toBeGreaterThan(0.5);
  });

  it('areasToImprove returns rated, weak skills weakest-first', () => {
    // strong skill: 6/6
    for (let i = 0; i < 6; i++) recordItem(L, 'sound:first:t', true);
    // weak skill: 2/6
    for (let i = 0; i < 4; i++) recordItem(L, 'sound:last:p', false);
    for (let i = 0; i < 2; i++) recordItem(L, 'sound:last:p', true);
    // unrated (too few attempts) is excluded
    recordItem(L, 'sound:first:n', false);

    const areas = areasToImprove(L, 3);
    expect(areas.map((a) => a.skillKey)).toContain('sound:last:p');
    expect(areas.map((a) => a.skillKey)).not.toContain('sound:first:t'); // strong, excluded
    expect(areas.map((a) => a.skillKey)).not.toContain('sound:first:n'); // unrated, excluded
    expect(areas[0].skillKey).toBe('sound:last:p'); // weakest first
  });

  it('clearMastery wipes the learner', () => {
    recordItem(L, 'sound:first:m', true);
    clearMastery(L);
    expect(loadMastery(L)).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run src/mastery/mastery.test.ts`
Expected: FAIL — cannot find module `./mastery`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/mastery/mastery.ts
import type { SkillKey } from './skills';

export interface SkillStat {
  attempts: number;
  correct: number;
  recent: number[]; // last K results, 1 = correct, 0 = wrong (oldest -> newest)
  lastSeen: number; // epoch ms
}

export type MasteryMap = Record<SkillKey, SkillStat>;

export interface FocusArea {
  skillKey: SkillKey;
  score: number;   // 0..1 rolling
  attempts: number;
}

const K = 10;              // rolling window
const RATED_MIN = 5;       // attempts before a skill is rated
const IMPROVE_BELOW = 0.8; // score under this = needs work
const key = (learnerId: string) => `ll:${learnerId}:mastery`;

export function loadMastery(learnerId: string): MasteryMap {
  try {
    const v = JSON.parse(localStorage.getItem(key(learnerId)) ?? '{}');
    return v && typeof v === 'object' ? (v as MasteryMap) : {};
  } catch {
    return {};
  }
}

function save(learnerId: string, map: MasteryMap): void {
  try {
    localStorage.setItem(key(learnerId), JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Record ONE per-item result (called once per item per round, on first attempt). */
export function recordItem(learnerId: string, skillKey: SkillKey, correct: boolean): void {
  const map = loadMastery(learnerId);
  const s = map[skillKey] ?? { attempts: 0, correct: 0, recent: [], lastSeen: 0 };
  s.attempts += 1;
  if (correct) s.correct += 1;
  s.recent.push(correct ? 1 : 0);
  if (s.recent.length > K) s.recent = s.recent.slice(-K);
  s.lastSeen = Date.now();
  map[skillKey] = s;
  save(learnerId, map);
}

/** Recency-weighted accuracy over the rolling window. Unseen skills score 1 (solid). */
export function scoreOf(s: SkillStat | undefined): number {
  if (!s || s.recent.length === 0) return 1;
  let num = 0;
  let den = 0;
  s.recent.forEach((val, i) => {
    const w = i + 1; // newer answers weigh more
    num += w * val;
    den += w;
  });
  return den === 0 ? 1 : num / den;
}

export function masteryScore(learnerId: string, skillKey: SkillKey): number {
  return scoreOf(loadMastery(learnerId)[skillKey]);
}

/** Rated, weak skills (weakest first). */
export function areasToImprove(learnerId: string, n = 3): FocusArea[] {
  const map = loadMastery(learnerId);
  return Object.entries(map)
    .filter(([, s]) => s.attempts >= RATED_MIN)
    .map(([skillKey, s]) => ({ skillKey, score: scoreOf(s), attempts: s.attempts, lastSeen: s.lastSeen }))
    .filter((a) => a.score < IMPROVE_BELOW)
    .sort((a, b) => a.score - b.score || b.lastSeen - a.lastSeen)
    .slice(0, n)
    .map(({ skillKey, score, attempts }) => ({ skillKey, score, attempts }));
}

export function clearMastery(learnerId: string): void {
  try {
    localStorage.removeItem(key(learnerId));
  } catch {
    /* ignore */
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run src/mastery/mastery.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/mastery/mastery.ts src/mastery/mastery.test.ts
git commit -m "feat(mastery): local store + recency-weighted scoring + areasToImprove"
```

---

### Task 4: Placement + "Next up"

**Files:**
- Create: `src/mastery/placement.ts`
- Test: `src/mastery/placement.test.ts`

Uses `levelCurriculum`/`CURRICULUM` from `src/curriculum.ts` (already present).

- [ ] **Step 1: Write the failing test**

```ts
// src/mastery/placement.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getPlacement, setPlacement, nextUp } from './placement';

const L = 'plc-learner';
beforeEach(() => { localStorage.clear(); });

describe('placement', () => {
  it('defaults to Level 1, Lesson 1', () => {
    expect(getPlacement(L)).toEqual({ level: 1, lesson: 1 });
  });
  it('round-trips through setPlacement', () => {
    setPlacement(L, 2, 2);
    expect(getPlacement(L)).toEqual({ level: 2, lesson: 2 });
  });
  it('nextUp lists upcoming lessons then the next level', () => {
    const up = nextUp(2, 2); // Level 2 has 5 lessons
    expect(up.length).toBeGreaterThan(0);
    // first upcoming item is Lesson 3 of Level 2
    expect(up[0]).toMatchObject({ kind: 'lesson', level: 2, lesson: 3 });
    // a later item points to the next level
    expect(up.some((u) => u.kind === 'level' && u.level === 3)).toBe(true);
  });
  it('nextUp at the last lesson points to the next level', () => {
    const up = nextUp(2, 5);
    expect(up[0]).toMatchObject({ kind: 'level', level: 3 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run src/mastery/placement.test.ts`
Expected: FAIL — cannot find module `./placement`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/mastery/placement.ts
import { levelCurriculum } from '../curriculum';

export interface Placement { level: number; lesson: number; }
export interface NextItem {
  kind: 'lesson' | 'level';
  level: number;
  lesson?: number;
  title: string;
}

const key = (learnerId: string) => `ll:${learnerId}:placement`;

export function getPlacement(learnerId: string): Placement {
  try {
    const v = JSON.parse(localStorage.getItem(key(learnerId)) ?? 'null');
    if (v && typeof v.level === 'number' && typeof v.lesson === 'number') return v;
  } catch {
    /* ignore */
  }
  return { level: 1, lesson: 1 };
}

export function setPlacement(learnerId: string, level: number, lesson: number): void {
  try {
    localStorage.setItem(key(learnerId), JSON.stringify({ level, lesson }));
  } catch {
    /* ignore */
  }
}

/** Up to `count` upcoming items: remaining lessons in this level, then the next level. */
export function nextUp(level: number, lesson: number, count = 3): NextItem[] {
  const out: NextItem[] = [];
  const cur = levelCurriculum(level);
  if (cur) {
    for (const l of cur.lessons) {
      if (l.n > lesson) out.push({ kind: 'lesson', level, lesson: l.n, title: l.title });
      if (out.length >= count) return out;
    }
  }
  const next = levelCurriculum(level + 1);
  if (next) out.push({ kind: 'level', level: level + 1, title: next.title });
  return out.slice(0, count);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run src/mastery/placement.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/mastery/placement.ts src/mastery/placement.test.ts
git commit -m "feat(mastery): learner placement + curriculum-derived next-up"
```

---

### Task 5: Skill → practice-game route

**Files:**
- Create: `src/mastery/skill-games.ts`
- Test: `src/mastery/skill-games.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/mastery/skill-games.test.ts
import { describe, it, expect } from 'vitest';
import { practiceRouteForSkill } from './skill-games';

describe('practiceRouteForSkill', () => {
  it('routes first-sound skills to Sound Safari with a focus', () => {
    expect(practiceRouteForSkill('sound:first:m')).toBe('#/play/beginning-sounds?focus=sound:first:m');
  });
  it('routes last-sound skills to Last Sound Standing', () => {
    expect(practiceRouteForSkill('sound:last:t')).toBe('#/play/ending-sounds?focus=sound:last:t');
  });
  it('returns null for unmapped skills', () => {
    expect(practiceRouteForSkill('rule:floss')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run src/mastery/skill-games.test.ts`
Expected: FAIL — cannot find module `./skill-games`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/mastery/skill-games.ts
import { parseSkillKey } from './skills';
import type { SkillKey } from './skills';

/** The game that drills a given skill, as a route with a ?focus= param. Null if none yet. */
export function practiceRouteForSkill(skillKey: SkillKey): string | null {
  const p = parseSkillKey(skillKey);
  if (!p) return null;
  const game = p.target === 'ending' ? 'ending-sounds' : 'beginning-sounds';
  return `#/play/${game}?focus=${encodeURIComponent(skillKey)}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run src/mastery/skill-games.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/mastery/skill-games.ts src/mastery/skill-games.test.ts
git commit -m "feat(mastery): skill -> targeted practice route"
```

---

### Task 6: Round generator `focusSound`

**Files:**
- Modify: `src/domain/engine.ts` (the `GenerateSortRoundParams` interface + `generateSortRound` body)
- Test: `src/domain/engine.test.ts` (append)

- [ ] **Step 1: Write the failing test (append to existing file)**

```ts
// src/domain/engine.test.ts — add these tests
import { generateSortRound } from './engine';
import { everydayObjects } from '../content/packs/everydayObjects';

describe('generateSortRound focusSound', () => {
  it('always includes the focus sound among the baskets', () => {
    for (let i = 0; i < 20; i++) {
      const round = generateSortRound({ pack: everydayObjects, totalItems: 6, target: 'beginning', focusSound: 'm' });
      expect(round.baskets).toContain('m');
    }
  });
  it('ignores a focus sound that is not in the pack', () => {
    const round = generateSortRound({ pack: everydayObjects, totalItems: 6, target: 'beginning', focusSound: 'zzz' });
    expect(round.baskets.length).toBeGreaterThanOrEqual(2);
  });
});
```

> Note: confirm `everydayObjects` contains words whose `beginningSound` is `'m'`. If it does not, pick a sound that exists in the pack (read `src/content/packs/everydayObjects.ts`) and use it in both this test and Task 9's default focus example.

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run src/domain/engine.test.ts`
Expected: FAIL — `focusSound` not honored / type error on unknown property.

- [ ] **Step 3: Implement — add `focusSound` to params and honor it**

In `src/domain/engine.ts`, add to `GenerateSortRoundParams`:

```ts
  /** Bias the round so this sound is one of the baskets (targeted practice). */
  focusSound?: string;
```

Then in `generateSortRound`, replace the `chosen` computation:

```ts
  const chosen = (params.sounds ?? shuffle(pool, rng).slice(0, basketCount)).slice();
```

with:

```ts
  let chosen: string[];
  if (params.sounds) {
    chosen = params.sounds.slice();
  } else if (params.focusSound && pool.includes(params.focusSound)) {
    const others = shuffle(pool.filter((s) => s !== params.focusSound), rng).slice(0, basketCount - 1);
    chosen = [params.focusSound, ...others];
  } else {
    chosen = shuffle(pool, rng).slice(0, basketCount);
  }
```

(The existing `baskets: shuffle([...chosen], rng)` still randomizes display order, so the focus sound's position is not a cue.)

- [ ] **Step 4: Run the full engine + domain tests**

Run: `./node_modules/.bin/vitest run src/domain/engine.test.ts`
Expected: PASS (existing + 2 new tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/engine.ts src/domain/engine.test.ts
git commit -m "feat(engine): focusSound to drill one target sound"
```

---

### Task 7: `useSortGame` emits per-item results (first attempt)

**Files:**
- Modify: `src/game/useSortGame.ts`
- Test: `src/game/useSortGame.test.ts` (append)

- [ ] **Step 1: Write the failing test (append)**

```ts
// src/game/useSortGame.test.ts — add
import { renderHook, act } from '@testing-library/react';
import { useSortGame } from './useSortGame';
import type { SortRound } from '../domain/types';

const stubAudio = { playWord: () => Promise.resolve(), playSound: () => Promise.resolve() } as any;

function roundOf(): SortRound {
  return {
    baskets: ['m', 's'],
    target: 'beginning',
    items: [
      { id: 'moon', label: 'moon', beginningSound: 'm', emoji: '🌙' },
      { id: 'sun', label: 'sun', beginningSound: 's', emoji: '☀️' },
    ],
  };
}

describe('useSortGame onItemResult', () => {
  it('emits one result per item on the FIRST attempt only', () => {
    const results: Array<{ skillKey: string; correct: boolean }> = [];
    const { result } = renderHook(() =>
      useSortGame({ round: roundOf(), audio: stubAudio, onItemResult: (r) => results.push(r) }),
    );
    // wrong first attempt for 'moon' -> records correct:false, does not record again on retry
    act(() => { result.current.attemptPlace('moon', 's'); });
    act(() => { result.current.attemptPlace('moon', 'm'); });
    // correct first attempt for 'sun'
    act(() => { result.current.attemptPlace('sun', 's'); });

    expect(results).toEqual([
      { skillKey: 'sound:first:m', correct: false },
      { skillKey: 'sound:first:s', correct: true },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run src/game/useSortGame.test.ts`
Expected: FAIL — `onItemResult` not supported.

- [ ] **Step 3: Implement the callback + first-attempt tracking**

In `src/game/useSortGame.ts`:

Add the import at the top:

```ts
import { skillKeyForSound } from '../mastery/skills';
```

Extend the options type on the function signature:

```ts
export function useSortGame(opts: {
  round: SortRound;
  audio: AudioPlayer;
  onItemResult?: (r: { skillKey: string; correct: boolean }) => void;
}): UseSortGame {
  const { round, audio, onItemResult } = opts;
```

Add a ref to track which items already reported, just below the existing `useState` lines:

```ts
  const reported = useRef<Set<string>>(new Set());
```

and add `useRef` to the React import:

```ts
import { useMemo, useRef, useState } from 'react';
```

Inside `attemptPlace`, at the very top after `if (!item) return false;`, emit the first-attempt result:

```ts
    const target = round.target ?? 'beginning';
    if (!reported.current.has(wordId)) {
      reported.current.add(wordId);
      const sound = soundOf(item, target);
      const correct = isCorrectPlacement(item, basketSound, target);
      if (sound) onItemResult?.({ skillKey: skillKeyForSound(sound, target), correct });
    }
```

(Leave the existing correct/incorrect placement logic below unchanged. Note `soundOf` is already imported.)

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run src/game/useSortGame.test.ts`
Expected: PASS (existing + new test).

- [ ] **Step 5: Commit**

```bash
git add src/game/useSortGame.ts src/game/useSortGame.test.ts
git commit -m "feat(game): useSortGame emits first-attempt per-item results"
```

---

### Task 8: Wire `SortGame` → mastery store

**Files:**
- Modify: `src/game/SortGame.tsx` (the `useSortGame({ round, audio })` call near line 87)

- [ ] **Step 1: Add the import**

At the top of `src/game/SortGame.tsx` (with the other local imports):

```ts
import { recordItem } from '../mastery/mastery';
```

- [ ] **Step 2: Pass `onItemResult` into the hook**

Replace:

```ts
  const game = useSortGame({ round, audio });
```

with:

```ts
  const game = useSortGame({
    round,
    audio,
    onItemResult: ({ skillKey, correct }) => recordItem(learnerId, skillKey, correct),
  });
```

(`learnerId` is already a prop with default `'guest'`.)

- [ ] **Step 3: Typecheck**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: PASS (no type errors).

- [ ] **Step 4: Run the game tests**

Run: `./node_modules/.bin/vitest run src/game/SortGame.test.tsx src/game/useSortGame.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/SortGame.tsx
git commit -m "feat(game): record per-item mastery from the sort game"
```

---

### Task 9: Route + GameScreen honor `?focus=`

**Files:**
- Modify: `src/router.ts` (the `Route` interface + the play branch of `parseHash`)
- Modify: `src/GameScreen.tsx` (accept `focus`, derive `focusSound`)
- Modify: `src/App.tsx` (pass `route.focus`)
- Test: `src/router.test.ts` (create)

- [ ] **Step 1: Write the failing router test**

```ts
// src/router.test.ts
import { describe, it, expect } from 'vitest';
import { parseHash } from './router';

describe('parseHash play focus', () => {
  it('parses game id with no focus', () => {
    expect(parseHash('#/play/beginning-sounds')).toEqual({ name: 'play', game: 'beginning-sounds', focus: undefined });
  });
  it('parses a focus query param', () => {
    expect(parseHash('#/play/ending-sounds?focus=sound:last:t')).toEqual({
      name: 'play', game: 'ending-sounds', focus: 'sound:last:t',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run src/router.test.ts`
Expected: FAIL — `focus` is not returned.

- [ ] **Step 3: Implement router parsing**

In `src/router.ts`, add `focus?: string;` to the `Route` interface:

```ts
export interface Route {
  name: RouteName;
  level?: number;
  game?: string;
  focus?: string;
}
```

Replace the play branch in `parseHash`:

```ts
  if (h.startsWith('play')) {
    const game = h.split('/')[1];
    return { name: 'play', game: game || 'beginning-sounds' };
  }
```

with:

```ts
  if (h.startsWith('play')) {
    const rest = h.slice('play'.length).replace(/^\//, ''); // "beginning-sounds?focus=..."
    const [gamePart, query] = rest.split('?');
    const focus = new URLSearchParams(query ?? '').get('focus') ?? undefined;
    return { name: 'play', game: gamePart || 'beginning-sounds', focus };
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run src/router.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Thread `focus` into GameScreen**

In `src/GameScreen.tsx`, add the import:

```ts
import { parseSkillKey } from './mastery/skills';
```

Add `focus` to `Props`:

```ts
interface Props {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  learnerId: string;
  gameId: string;
  focus?: string;
}
```

Destructure it: `export function GameScreen({ theme, setTheme, learnerId, gameId, focus }: Props) {`

Compute the focus sound (only when its position matches this game's target) and pass it to the generator. Replace the `round` memo:

```ts
  const round = useMemo(
    () => generateSortRound({ pack: config.pack, totalItems: ITEMS_PER_ROUND, target: config.target }),
    [sessionId, roundIndex, config],
  );
```

with:

```ts
  const focusSound = useMemo(() => {
    const p = focus ? parseSkillKey(focus) : null;
    return p && p.target === config.target ? p.soundId : undefined;
  }, [focus, config]);

  const round = useMemo(
    () => generateSortRound({ pack: config.pack, totalItems: ITEMS_PER_ROUND, target: config.target, focusSound }),
    [sessionId, roundIndex, config, focusSound],
  );
```

- [ ] **Step 6: Pass `route.focus` from App**

In `src/App.tsx`, update the play return:

```ts
  if (route.name === 'play') {
    return <GameScreen theme={theme} setTheme={setTheme} learnerId={learnerId} gameId={route.game ?? 'beginning-sounds'} focus={route.focus} />;
  }
```

- [ ] **Step 7: Typecheck + build**

Run: `./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/vite build`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/router.ts src/router.test.ts src/GameScreen.tsx src/App.tsx
git commit -m "feat: route ?focus= into a targeted practice round"
```

---

### Task 10: `NextUp` + `AreasToImprove` components

**Files:**
- Create: `src/NextUp.tsx`
- Create: `src/AreasToImprove.tsx`
- Modify: `src/styles/theme.css` (append)

- [ ] **Step 1: Create `NextUp.tsx`**

```tsx
// src/NextUp.tsx
import { getPlacement, nextUp } from './mastery/placement';

/** Shows what's coming after the learner's current lesson/level. */
export function NextUp({ learnerId }: { learnerId: string }) {
  const { level, lesson } = getPlacement(learnerId);
  const items = nextUp(level, lesson, 3);
  if (items.length === 0) return null;
  return (
    <div className="nextup">
      <h4 className="nextup__h">🚀 Next up</h4>
      {items.map((it) => (
        <div key={`${it.kind}-${it.level}-${it.lesson ?? 0}`} className="nextup__row">
          <span className="nextup__pill">{it.kind === 'lesson' ? `Lesson ${it.lesson}` : 'Then'}</span>
          <span className="nextup__title">
            {it.kind === 'level' ? `Level ${it.level} · ${it.title}` : it.title}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `AreasToImprove.tsx`**

```tsx
// src/AreasToImprove.tsx
import { useState } from 'react';
import { navigate } from './router';
import { areasToImprove } from './mastery/mastery';
import { skillLabel } from './mastery/skills';
import { skillHelp } from './mastery/skill-help';
import { practiceRouteForSkill } from './mastery/skill-games';

/** "Areas to improve" — weak skills with What/Why/How + a targeted practice link. */
export function AreasToImprove({ learnerId }: { learnerId: string }) {
  const areas = areasToImprove(learnerId, 3);
  const [open, setOpen] = useState<string | null>(areas[0]?.skillKey ?? null);

  if (areas.length === 0) {
    return (
      <div className="atimprove">
        <h4 className="atimprove__h">⭐ Areas to improve</h4>
        <p className="atimprove__empty">Play a few rounds and personalized focus areas will appear here.</p>
      </div>
    );
  }

  return (
    <div className="atimprove">
      <h4 className="atimprove__h">⭐ What to practice next</h4>
      {areas.map((a) => {
        const help = skillHelp(a.skillKey);
        const route = practiceRouteForSkill(a.skillKey);
        const isOpen = open === a.skillKey;
        const pct = Math.round(a.score * 100);
        return (
          <div key={a.skillKey} className={`focus${isOpen ? ' focus--open' : ''}`}>
            <button type="button" className="focus__bar" onClick={() => setOpen(isOpen ? null : a.skillKey)} aria-expanded={isOpen}>
              <span className="focus__ring" style={{ background: `conic-gradient(var(--teal-deep) 0 ${pct}%, var(--teal-soft) ${pct}% 100%)` }}>
                <i>{pct}%</i>
              </span>
              <span className="focus__title">{skillLabel(a.skillKey)}</span>
              <span className="focus__chev" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
            </button>
            {isOpen && (
              <div className="focus__body">
                <p><b>What:</b> {help.what}</p>
                <p><b>Why it helps:</b> {help.why}</p>
                <p className="focus__tip">💡 {help.tip}</p>
                {route && (
                  <button type="button" className="focus__play" onClick={() => navigate(route)}>▶ Practice this</button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Append styles to `src/styles/theme.css`**

```css
/* ============================================================
   Mastery: Next up + Areas to improve
   ============================================================ */
.nextup, .atimprove { background: var(--surface); border: 1px solid var(--teal-ring); border-radius: var(--radius); padding: 16px; margin-bottom: 16px; text-align: left; }
.nextup { border: 2px solid var(--green); background: #f3faf5; }
.nextup__h, .atimprove__h { margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--teal-deep); }
.nextup__row { display: flex; gap: 10px; align-items: center; padding: 5px 0; font-size: 14px; }
.nextup__pill { font-size: 10px; font-weight: 800; text-transform: uppercase; background: var(--green); color: #fff; border-radius: 99px; padding: 2px 8px; }
.atimprove__empty { color: var(--muted); font-size: 14px; margin: 0; }
.focus { border: 1px solid #e2e8ea; border-radius: 12px; margin-bottom: 8px; overflow: hidden; }
.focus--open { border: 2px solid var(--gold); background: #fffdf5; }
.focus__bar { display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 13px; cursor: pointer; border: none; background: none; font: inherit; text-align: left; color: var(--ink); }
.focus__bar:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.focus__ring { width: 36px; height: 36px; border-radius: 50%; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; }
.focus__ring i { width: 27px; height: 27px; border-radius: 50%; background: var(--surface); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: var(--teal-deep); font-style: normal; }
.focus__title { flex: 1; font-weight: 700; font-size: 14px; }
.focus__chev { color: var(--warn); font-weight: 800; }
.focus__body { padding: 0 13px 13px 61px; font-size: 13.5px; }
.focus__body p { margin: 8px 0; } .focus__body b { color: var(--teal-deep); }
.focus__tip { background: #eef7f1; border-left: 4px solid var(--green); border-radius: 8px; padding: 9px 11px; }
.focus__play { margin-top: 10px; display: inline-flex; align-items: center; gap: 8px; background: var(--teal-deep); color: #fff; font-weight: 800; font-size: 14px; border: none; border-radius: 99px; padding: 10px 18px; cursor: pointer; }
.focus__play:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }
```

- [ ] **Step 4: Typecheck + build**

Run: `./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/vite build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/NextUp.tsx src/AreasToImprove.tsx src/styles/theme.css
git commit -m "feat(mastery): NextUp + AreasToImprove components"
```

---

### Task 11: Surface on the Profile page + verify end-to-end

**Files:**
- Modify: `src/ProfilePage.tsx`

- [ ] **Step 1: Render the two components**

In `src/ProfilePage.tsx`, add imports:

```ts
import { NextUp } from './NextUp';
import { AreasToImprove } from './AreasToImprove';
```

Insert a new section immediately after the `profile-card` block and before the "Switch player" section:

```tsx
      <section className="site__section" aria-labelledby="focus-h">
        <h2 id="focus-h" className="site__h2">Learning focus</h2>
        <NextUp learnerId={learnerId} />
        <AreasToImprove learnerId={learnerId} />
      </section>
```

- [ ] **Step 2: Typecheck, test, build (full suite)**

Run: `./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/vitest run && ./node_modules/.bin/vite build`
Expected: tsc clean; all tests pass (prior 48 + the new mastery/router/engine/hook tests); build OK.

- [ ] **Step 3: Manual verification in the browser**

Dev server runs at http://localhost:5173 (restart with `npm --prefix /Users/gt/Downloads/barton-games run dev` if needed).
1. Open `#/play/beginning-sounds`, finish a session deliberately missing the same sound several times (≥5 attempts on one sound, mostly wrong).
2. Go to `#/profile`. Confirm **Next up** shows upcoming lessons and **Areas to improve** lists the weak sound with a working **Practice this** button.
3. Click **Practice this** → confirm it lands on the game with that sound present as a basket every round (`#/play/...?focus=sound:first:<x>`).

- [ ] **Step 4: Commit**

```bash
git add src/ProfilePage.tsx
git commit -m "feat(mastery): show NextUp + AreasToImprove on the Profile page"
```

---

## Self-Review

**1. Spec coverage (Phase 1 items):**
- Skill-key taxonomy → Task 1 ✓
- Per-item logging in the two live games → Tasks 7–8 ✓
- Local mastery store + scoring → Task 3 ✓
- "Areas to improve" UI → Tasks 10–11 ✓
- "Next up" (curriculum-derived) → Tasks 4, 10–11 ✓
- "What should I practice" / learner self-direction → AreasToImprove "What to practice next" + Practice button (Task 10) ✓ (a dedicated play-flow entry point is deferred; the Profile surface covers Phase 1)
- Targeted-game `focus` param → Tasks 6, 9 ✓
- Skill-help content → Task 2 ✓
- Local fallback (no backend) → entire phase is local ✓
- Cloud mastery sync, roles, family/tutor dashboards → **Phase 2/3, intentionally out of scope.**

**2. Placeholder scan:** No TBD/TODO. Every code step has complete code. (Task 6 includes a verification note to confirm the pack contains the `'m'` sound; this is a check, not a placeholder — the test/impl are complete.)

**3. Type consistency:** `recordItem(learnerId, skillKey, correct)` signature is consistent across Tasks 3, 7, 8. `onItemResult: (r: { skillKey: string; correct: boolean }) => void` matches between Tasks 7 and 8. `parseSkillKey` returns `{ kind, target, soundId }` used identically in Tasks 1, 5, 9. `practiceRouteForSkill` output format matches the router parser in Task 9. `getPlacement`/`nextUp`/`NextItem` consistent across Tasks 4, 10.

**Known Phase-1 limitation (documented in the spec):** only `sound:first:*` / `sound:last:*` skills get data (the two live games). Confusion-pairs (e.g. `confusion:b-p`) and rule skills are defined-for-later; "Areas to improve" is sparse until more games log items. Placement defaults to L1/L1 and is settable via `setPlacement`; a tutor-facing placement control is Phase 3.
