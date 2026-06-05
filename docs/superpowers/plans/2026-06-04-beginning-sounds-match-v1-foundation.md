# Beginning Sounds Match — v1 Foundation & First Playable Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a tested, data-driven phonics engine and ship one playable, deployed Barton-Level-1 "Beginning Sounds Match" game in Mode A (sort pictures into sound baskets), audio-first and letterless.

**Architecture:** Four separated layers — **content data** (declarative word packs + phonemes), **engine** (pure functions: round generation + answer checking), **audio** (interface + swappable player), **app shell** (React UI). The engine and content are framework-free and unit-tested; the UI is a thin layer over them. This is Plan 1 of the v1 series; Mode B, themes, pack-switching, reward toggle, and recorded audio follow in Plan 2 and bolt onto these same layers without engine changes.

**Tech Stack:** React + TypeScript + Vite, Vitest + @testing-library/react (jsdom), @dnd-kit/core for accessible touch/mouse/keyboard drag-and-drop. Dev audio via the browser `speechSynthesis` stub behind an `AudioPlayer` interface (recorded human audio swaps in later with zero call-site changes).

**Spec:** `docs/superpowers/specs/2026-06-04-beginning-sounds-match-design.md`

---

## File structure (created by this plan)

```
barton-games/
  package.json, vite.config.ts, tsconfig*.json, index.html   # scaffold
  src/
    main.tsx                      # React entry
    App.tsx                       # mounts the game
    styles/theme.css              # "Soft & Friendly" default look
    domain/
      types.ts                    # Phoneme, WordItem, Pack, SortRound, Placements
      phonemes.ts                 # phoneme registry + getPhoneme()
      validatePack.ts             # structural integrity checks
      engine.ts                   # generateSortRound, isCorrectPlacement, isRoundComplete, canBuildSortRound
    content/
      packs/everydayObjects.ts    # starter interest pack (b/s/m/t)
    audio/
      audioPlayer.ts              # AudioPlayer interface
      stubAudioPlayer.ts          # speechSynthesis dev implementation
    game/
      useSortGame.ts              # headless game-state hook (no DnD/DOM)
      SortGame.tsx                # Mode A screen (DndContext + components)
      PictureCard.tsx             # draggable picture (word)
      SoundBasket.tsx             # droppable basket (target sound)
      ReplayButton.tsx            # 🔊 replay control
    test/
      setupTests.ts               # jsdom + jest-dom + speechSynthesis mock
```

---

## Task 0: Scaffold the project

**Files:**
- Create: `package.json`, `vite.config.ts`, `index.html`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`, `src/test/setupTests.ts`
- Create (sanity test): `src/domain/smoke.test.ts`

- [ ] **Step 1: Create the Vite React-TS app in place**

Run from `barton-games/`:
```bash
npm create vite@latest . -- --template react-ts
```
If prompted about the non-empty directory (the `docs/` and `.git` already exist), choose **"Ignore files and continue"**.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install @dnd-kit/core @dnd-kit/utilities
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

- [ ] **Step 3: Configure Vitest** — replace `vite.config.ts` with:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
  },
});
```

- [ ] **Step 4: Create the test setup file** — `src/test/setupTests.ts`:

```ts
import '@testing-library/jest-dom/vitest';

// jsdom has no speechSynthesis; provide a no-op mock so the audio stub runs in tests.
if (!('speechSynthesis' in globalThis)) {
  (globalThis as unknown as { speechSynthesis: unknown }).speechSynthesis = {
    speak: () => {},
    cancel: () => {},
    getVoices: () => [],
  };
  (globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
    class { constructor(public text: string) {} };
}
```

- [ ] **Step 5: Add the test script** — in `package.json` `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Add a sanity test** — `src/domain/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('toolchain', () => {
  it('runs tests', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 7: Run the test suite**

Run: `npm test`
Expected: 1 passed (`toolchain > runs tests`).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite React-TS app with Vitest"
```

---

## Task 1: Domain types + phoneme registry

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/phonemes.ts`
- Test: `src/domain/phonemes.test.ts`

- [ ] **Step 1: Write the failing test** — `src/domain/phonemes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PHONEMES, getPhoneme } from './phonemes';

describe('phoneme registry', () => {
  it('returns a phoneme by id with required fields', () => {
    const b = getPhoneme('b');
    expect(b).toEqual({ id: 'b', label: 'b', ipa: '/b/', type: 'consonant' });
  });

  it('throws on an unknown id', () => {
    expect(() => getPhoneme('zzz')).toThrow(/unknown phoneme/i);
  });

  it('every registered phoneme has id, label, ipa, and a valid type', () => {
    const validTypes = ['consonant', 'vowel', 'unit'];
    for (const [id, p] of Object.entries(PHONEMES)) {
      expect(p.id).toBe(id);
      expect(p.label.length).toBeGreaterThan(0);
      expect(p.ipa.length).toBeGreaterThan(0);
      expect(validTypes).toContain(p.type);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/phonemes.test.ts`
Expected: FAIL — cannot find module `./phonemes`.

- [ ] **Step 3: Create the types** — `src/domain/types.ts`:

```ts
export type SoundType = 'consonant' | 'vowel' | 'unit';

/** A single Barton sound. `id` is our internal key (e.g. 'b', 's', 'a'). */
export interface Phoneme {
  id: string;
  label: string; // shown to tutors only, never to the learner during play
  ipa: string;
  type: SoundType;
}

/**
 * A word the learner hears (never reads). `emoji` is a PLACEHOLDER picture for v1;
 * it is replaced by an illustration asset path (`image`) later.
 */
export interface WordItem {
  id: string;
  label: string;        // for tutors / alt-text / audio, not shown as text in play
  beginningSound: string; // a Phoneme id
  emoji: string;        // placeholder picture
  image?: string;       // future: path to real illustration
}

export interface Pack {
  id: string;
  name: string;
  words: WordItem[];
}

/** Mode A round: which baskets (target sounds) and which pictures to sort. */
export interface SortRound {
  baskets: string[];     // Phoneme ids, in display order
  items: WordItem[];     // pictures to sort, shuffled
}

/** Map of wordId -> the basket sound it has been correctly placed in. */
export type Placements = Record<string, string>;
```

- [ ] **Step 4: Create the registry** — `src/domain/phonemes.ts`:

```ts
import type { Phoneme } from './types';

const c = (id: string): Phoneme => ({ id, label: id, ipa: `/${id}/`, type: 'consonant' });
const v = (id: string): Phoneme => ({ id, label: id, ipa: `/${id}/`, type: 'vowel' });

/** Starter subset — expands toward the full ~40 phonemes as content grows. */
export const PHONEMES: Record<string, Phoneme> = {
  b: c('b'), s: c('s'), m: c('m'), t: c('t'),
  f: c('f'), p: c('p'), n: c('n'), l: c('l'),
  a: v('a'), e: v('e'), i: v('i'), o: v('o'), u: v('u'),
};

export function getPhoneme(id: string): Phoneme {
  const p = PHONEMES[id];
  if (!p) throw new Error(`unknown phoneme: ${id}`);
  return p;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/domain/phonemes.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/domain/types.ts src/domain/phonemes.ts src/domain/phonemes.test.ts
git commit -m "feat: add domain types and phoneme registry"
```

---

## Task 2: Starter interest pack + structural validation

**Files:**
- Create: `src/content/packs/everydayObjects.ts`
- Create: `src/domain/validatePack.ts`
- Test: `src/domain/validatePack.test.ts`

- [ ] **Step 1: Write the failing test** — `src/domain/validatePack.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/validatePack.test.ts`
Expected: FAIL — cannot find module `./validatePack`.

- [ ] **Step 3: Create the validator** — `src/domain/validatePack.ts`:

```ts
import type { Pack } from './types';
import { PHONEMES } from './phonemes';

/**
 * Structural integrity checks only. NOTE: code cannot verify that a picture's
 * spoken word truly begins with its claimed sound — that is a human content
 * review. This guards referential integrity so the engine never breaks.
 */
export function validatePack(pack: Pack): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const w of pack.words) {
    if (seen.has(w.id)) problems.push(`duplicate word id "${w.id}"`);
    seen.add(w.id);

    if (!PHONEMES[w.beginningSound]) {
      problems.push(`word "${w.id}": unknown beginningSound "${w.beginningSound}"`);
    }
    if (!w.emoji || w.emoji.trim() === '') {
      problems.push(`word "${w.id}": missing picture (emoji)`);
    }
  }
  return problems;
}
```

- [ ] **Step 4: Create the starter pack** — `src/content/packs/everydayObjects.ts`:

```ts
import type { Pack } from '../../domain/types';

/**
 * Starter pack chosen for clean, unambiguous single-consonant onsets
 * (b / s / m / t). Emojis are placeholders for the real illustration set.
 */
export const everydayObjects: Pack = {
  id: 'everyday-objects',
  name: 'Everyday Objects',
  words: [
    { id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' },
    { id: 'bear', label: 'bear', beginningSound: 'b', emoji: '🐻' },
    { id: 'bus',  label: 'bus',  beginningSound: 'b', emoji: '🚌' },
    { id: 'bed',  label: 'bed',  beginningSound: 'b', emoji: '🛏️' },
    { id: 'sun',  label: 'sun',  beginningSound: 's', emoji: '☀️' },
    { id: 'sock', label: 'sock', beginningSound: 's', emoji: '🧦' },
    { id: 'saw',  label: 'saw',  beginningSound: 's', emoji: '🪚' },
    { id: 'seal', label: 'seal', beginningSound: 's', emoji: '🦭' },
    { id: 'moon', label: 'moon', beginningSound: 'm', emoji: '🌙' },
    { id: 'mop',  label: 'mop',  beginningSound: 'm', emoji: '🧹' },
    { id: 'map',  label: 'map',  beginningSound: 'm', emoji: '🗺️' },
    { id: 'mug',  label: 'mug',  beginningSound: 'm', emoji: '☕' },
    { id: 'top',  label: 'top',  beginningSound: 't', emoji: '🔝' },
    { id: 'tap',  label: 'tap',  beginningSound: 't', emoji: '🚰' },
    { id: 'tent', label: 'tent', beginningSound: 't', emoji: '⛺' },
    { id: 'tire', label: 'tire', beginningSound: 't', emoji: '🛞' },
  ],
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/domain/validatePack.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/content/packs/everydayObjects.ts src/domain/validatePack.ts src/domain/validatePack.test.ts
git commit -m "feat: add starter pack and structural pack validation"
```

---

## Task 3: Engine — round generation

**Files:**
- Create: `src/domain/engine.ts`
- Test: `src/domain/engine.test.ts`

- [ ] **Step 1: Write the failing test** — `src/domain/engine.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generateSortRound, canBuildSortRound } from './engine';
import { everydayObjects } from '../content/packs/everydayObjects';

describe('generateSortRound', () => {
  it('uses the requested target sounds as baskets', () => {
    const round = generateSortRound({
      pack: everydayObjects, targetSounds: ['b', 's'], itemsPerSound: 3,
    });
    expect(round.baskets).toEqual(['b', 's']);
  });

  it('includes itemsPerSound pictures for each target sound', () => {
    const round = generateSortRound({
      pack: everydayObjects, targetSounds: ['b', 's'], itemsPerSound: 3,
    });
    expect(round.items).toHaveLength(6);
    const bCount = round.items.filter((i) => i.beginningSound === 'b').length;
    const sCount = round.items.filter((i) => i.beginningSound === 's').length;
    expect(bCount).toBe(3);
    expect(sCount).toBe(3);
  });

  it('only includes pictures whose beginning sound is a target', () => {
    const round = generateSortRound({
      pack: everydayObjects, targetSounds: ['b', 's'], itemsPerSound: 3,
    });
    for (const item of round.items) {
      expect(['b', 's']).toContain(item.beginningSound);
    }
  });

  it('is deterministic when given a fixed rng', () => {
    const rng = () => 0;
    const a = generateSortRound({ pack: everydayObjects, targetSounds: ['b', 's'], itemsPerSound: 3, rng });
    const b = generateSortRound({ pack: everydayObjects, targetSounds: ['b', 's'], itemsPerSound: 3, rng });
    expect(a.items.map((i) => i.id)).toEqual(b.items.map((i) => i.id));
  });

  it('throws if the pack lacks enough words for a target sound', () => {
    expect(() =>
      generateSortRound({ pack: everydayObjects, targetSounds: ['b'], itemsPerSound: 99 }),
    ).toThrow(/not enough words/i);
  });
});

describe('canBuildSortRound', () => {
  it('is true when every target sound has enough words', () => {
    expect(canBuildSortRound(everydayObjects, ['b', 's'], 3)).toBe(true);
  });
  it('is false when a target sound is short on words', () => {
    expect(canBuildSortRound(everydayObjects, ['b'], 99)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/engine.test.ts`
Expected: FAIL — cannot find module `./engine`.

- [ ] **Step 3: Write the implementation** — `src/domain/engine.ts`:

```ts
import type { Pack, WordItem, SortRound } from './types';

/** In-place Fisher–Yates using an injectable rng (default Math.random). */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function wordsFor(pack: Pack, sound: string): WordItem[] {
  return pack.words.filter((w) => w.beginningSound === sound);
}

export function canBuildSortRound(pack: Pack, targetSounds: string[], itemsPerSound: number): boolean {
  return targetSounds.every((s) => wordsFor(pack, s).length >= itemsPerSound);
}

export interface GenerateSortRoundParams {
  pack: Pack;
  targetSounds: string[];
  itemsPerSound?: number;
  rng?: () => number;
}

export function generateSortRound(params: GenerateSortRoundParams): SortRound {
  const { pack, targetSounds, itemsPerSound = 3, rng = Math.random } = params;

  const items: WordItem[] = [];
  for (const sound of targetSounds) {
    const pool = wordsFor(pack, sound);
    if (pool.length < itemsPerSound) {
      throw new Error(`not enough words for sound "${sound}": need ${itemsPerSound}, have ${pool.length}`);
    }
    items.push(...shuffle(pool, rng).slice(0, itemsPerSound));
  }

  return { baskets: [...targetSounds], items: shuffle(items, rng) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/domain/engine.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/engine.ts src/domain/engine.test.ts
git commit -m "feat: add sort-round generation engine"
```

---

## Task 4: Engine — placement checking & completion

**Files:**
- Modify: `src/domain/engine.ts` (append)
- Test: `src/domain/placement.test.ts`

- [ ] **Step 1: Write the failing test** — `src/domain/placement.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { isCorrectPlacement, isRoundComplete } from './engine';
import type { SortRound, WordItem } from './types';

const ball: WordItem = { id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' };
const sun: WordItem = { id: 'sun', label: 'sun', beginningSound: 's', emoji: '☀️' };
const round: SortRound = { baskets: ['b', 's'], items: [ball, sun] };

describe('isCorrectPlacement', () => {
  it('is true when the item begins with the basket sound', () => {
    expect(isCorrectPlacement(ball, 'b')).toBe(true);
  });
  it('is false otherwise', () => {
    expect(isCorrectPlacement(ball, 's')).toBe(false);
  });
});

describe('isRoundComplete', () => {
  it('is false until every item is correctly placed', () => {
    expect(isRoundComplete(round, { ball: 'b' })).toBe(false);
  });
  it('is true when all items are correctly placed', () => {
    expect(isRoundComplete(round, { ball: 'b', sun: 's' })).toBe(true);
  });
  it('does not count an incorrect placement as complete', () => {
    expect(isRoundComplete(round, { ball: 's', sun: 's' })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/placement.test.ts`
Expected: FAIL — `isCorrectPlacement` is not exported.

- [ ] **Step 3: Append to the implementation** — add to the end of `src/domain/engine.ts`:

```ts
import type { Placements } from './types';

export function isCorrectPlacement(item: WordItem, basketSound: string): boolean {
  return item.beginningSound === basketSound;
}

export function isRoundComplete(round: SortRound, placements: Placements): boolean {
  return round.items.every((item) => placements[item.id] === item.beginningSound);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/domain/placement.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/engine.ts src/domain/placement.test.ts
git commit -m "feat: add placement checking and round completion"
```

---

## Task 5: Audio interface + dev stub player

**Files:**
- Create: `src/audio/audioPlayer.ts`
- Create: `src/audio/stubAudioPlayer.ts`
- Test: `src/audio/stubAudioPlayer.test.ts`

- [ ] **Step 1: Write the failing test** — `src/audio/stubAudioPlayer.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStubAudioPlayer } from './stubAudioPlayer';
import type { WordItem } from '../domain/types';

describe('stub audio player', () => {
  beforeEach(() => {
    vi.spyOn(globalThis.speechSynthesis, 'speak');
    vi.spyOn(globalThis.speechSynthesis, 'cancel');
  });

  it('speaks the word label when playing a word', async () => {
    const player = createStubAudioPlayer();
    const ball: WordItem = { id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' };
    await player.playWord(ball);
    expect(globalThis.speechSynthesis.speak).toHaveBeenCalledTimes(1);
  });

  it('speaks something for a phoneme id', async () => {
    const player = createStubAudioPlayer();
    await player.playSound('b');
    expect(globalThis.speechSynthesis.speak).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/audio/stubAudioPlayer.test.ts`
Expected: FAIL — cannot find module `./stubAudioPlayer`.

- [ ] **Step 3: Create the interface** — `src/audio/audioPlayer.ts`:

```ts
import type { WordItem } from '../domain/types';

/**
 * The one audio seam in the app. v1 uses a speechSynthesis stub; the recorded
 * human-voice player implements this same interface later — no call sites change.
 */
export interface AudioPlayer {
  playSound(soundId: string): Promise<void>;
  playWord(item: WordItem): Promise<void>;
}
```

- [ ] **Step 4: Create the stub** — `src/audio/stubAudioPlayer.ts`:

```ts
import type { AudioPlayer } from './audioPlayer';
import type { WordItem } from '../domain/types';

/**
 * DEV PLACEHOLDER. Uses browser TTS so there is audible feedback while building.
 * TTS mispronounces isolated phonemes (it is NOT Barton-correct) — this is
 * intentionally temporary and replaced by recorded human audio in Plan 2.
 */
export function createStubAudioPlayer(): AudioPlayer {
  function speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        globalThis.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.8;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        globalThis.speechSynthesis.speak(u);
        // jsdom never fires onend; resolve defensively next tick.
        setTimeout(resolve, 0);
      } catch {
        resolve();
      }
    });
  }

  return {
    playSound: (soundId: string) => speak(soundId),
    playWord: (item: WordItem) => speak(item.label),
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/audio/stubAudioPlayer.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/audio/audioPlayer.ts src/audio/stubAudioPlayer.ts src/audio/stubAudioPlayer.test.ts
git commit -m "feat: add audio interface and speechSynthesis dev stub"
```

---

## Task 6: Headless game-state hook (`useSortGame`)

This holds ALL game logic (placements, correctness, no-anxiety messaging, completion) so it is unit-testable without any drag-and-drop or DOM.

**Files:**
- Create: `src/game/useSortGame.ts`
- Test: `src/game/useSortGame.test.ts`

- [ ] **Step 1: Write the failing test** — `src/game/useSortGame.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSortGame } from './useSortGame';
import type { SortRound } from '../domain/types';
import type { AudioPlayer } from '../audio/audioPlayer';

const round: SortRound = {
  baskets: ['b', 's'],
  items: [
    { id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' },
    { id: 'sun', label: 'sun', beginningSound: 's', emoji: '☀️' },
  ],
};

function fakeAudio(): AudioPlayer {
  return { playSound: vi.fn().mockResolvedValue(undefined), playWord: vi.fn().mockResolvedValue(undefined) };
}

describe('useSortGame', () => {
  it('records a correct placement and clears any message', () => {
    const { result } = renderHook(() => useSortGame({ round, audio: fakeAudio() }));
    act(() => { result.current.attemptPlace('ball', 'b'); });
    expect(result.current.placements).toEqual({ ball: 'b' });
    expect(result.current.message).toBeNull();
  });

  it('rejects a wrong placement, sets a gentle message, and replays the sound', () => {
    const audio = fakeAudio();
    const { result } = renderHook(() => useSortGame({ round, audio }));
    act(() => { result.current.attemptPlace('ball', 's'); });
    expect(result.current.placements).toEqual({}); // not recorded
    expect(result.current.message).toMatch(/listen again/i);
    expect(audio.playSound).toHaveBeenCalledWith('s');
  });

  it('reports completion only when all items are correctly placed', () => {
    const { result } = renderHook(() => useSortGame({ round, audio: fakeAudio() }));
    act(() => { result.current.attemptPlace('ball', 'b'); });
    expect(result.current.isComplete).toBe(false);
    act(() => { result.current.attemptPlace('sun', 's'); });
    expect(result.current.isComplete).toBe(true);
  });

  it('exposes still-unplaced items', () => {
    const { result } = renderHook(() => useSortGame({ round, audio: fakeAudio() }));
    act(() => { result.current.attemptPlace('ball', 'b'); });
    expect(result.current.remainingItems.map((i) => i.id)).toEqual(['sun']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/game/useSortGame.test.ts`
Expected: FAIL — cannot find module `./useSortGame`.

- [ ] **Step 3: Write the hook** — `src/game/useSortGame.ts`:

```ts
import { useMemo, useState } from 'react';
import type { SortRound, Placements, WordItem } from '../domain/types';
import type { AudioPlayer } from '../audio/audioPlayer';
import { isCorrectPlacement, isRoundComplete } from '../domain/engine';

export interface UseSortGame {
  placements: Placements;
  message: string | null;
  isComplete: boolean;
  remainingItems: WordItem[];
  attemptPlace: (wordId: string, basketSound: string) => boolean;
  replaySound: (soundId: string) => void;
  replayWord: (item: WordItem) => void;
}

export function useSortGame(opts: { round: SortRound; audio: AudioPlayer }): UseSortGame {
  const { round, audio } = opts;
  const [placements, setPlacements] = useState<Placements>({});
  const [message, setMessage] = useState<string | null>(null);

  const byId = useMemo(() => {
    const m: Record<string, WordItem> = {};
    for (const i of round.items) m[i.id] = i;
    return m;
  }, [round]);

  function attemptPlace(wordId: string, basketSound: string): boolean {
    const item = byId[wordId];
    if (!item) return false;
    if (isCorrectPlacement(item, basketSound)) {
      setPlacements((prev) => ({ ...prev, [wordId]: basketSound }));
      setMessage(null);
      void audio.playWord(item);
      return true;
    }
    // No-anxiety: do not record, replay the basket sound, gently invite a retry.
    setMessage('Not quite — listen again and try another basket.');
    void audio.playSound(basketSound);
    return false;
  }

  const remainingItems = round.items.filter((i) => placements[i.id] !== i.beginningSound);

  return {
    placements,
    message,
    isComplete: isRoundComplete(round, placements),
    remainingItems,
    attemptPlace,
    replaySound: (soundId) => void audio.playSound(soundId),
    replayWord: (item) => void audio.playWord(item),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/game/useSortGame.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/game/useSortGame.ts src/game/useSortGame.test.ts
git commit -m "feat: add headless useSortGame state hook"
```

---

## Task 7: UI components — PictureCard, SoundBasket, ReplayButton

**Files:**
- Create: `src/game/ReplayButton.tsx`
- Create: `src/game/PictureCard.tsx`
- Create: `src/game/SoundBasket.tsx`
- Test: `src/game/components.test.tsx`

- [ ] **Step 1: Write the failing test** — `src/game/components.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { ReplayButton } from './ReplayButton';
import { PictureCard } from './PictureCard';
import { SoundBasket } from './SoundBasket';

describe('ReplayButton', () => {
  it('calls onReplay when clicked', async () => {
    const onReplay = vi.fn();
    render(<ReplayButton label="Replay the b sound" onReplay={onReplay} />);
    await userEvent.click(screen.getByRole('button', { name: /replay the b sound/i }));
    expect(onReplay).toHaveBeenCalledTimes(1);
  });
});

describe('PictureCard', () => {
  it('renders the picture with an accessible name from the label', () => {
    render(
      <DndContext>
        <PictureCard item={{ id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' }} />
      </DndContext>,
    );
    expect(screen.getByRole('img', { name: /ball/i })).toBeInTheDocument();
  });
});

describe('SoundBasket', () => {
  it('renders a replay control for its sound', () => {
    render(
      <DndContext>
        <SoundBasket sound="b" onReplay={() => {}}>{null}</SoundBasket>
      </DndContext>,
    );
    expect(screen.getByRole('button', { name: /sound/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/game/components.test.tsx`
Expected: FAIL — cannot find module `./ReplayButton`.

- [ ] **Step 3: Create ReplayButton** — `src/game/ReplayButton.tsx`:

```tsx
interface Props { label: string; onReplay: () => void; }

export function ReplayButton({ label, onReplay }: Props) {
  return (
    <button type="button" className="replay-btn" aria-label={label} onClick={onReplay}>
      <span aria-hidden="true">🔊</span>
    </button>
  );
}
```

- [ ] **Step 4: Create PictureCard** — `src/game/PictureCard.tsx`:

```tsx
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { WordItem } from '../domain/types';

interface Props { item: WordItem; }

export function PictureCard({ item }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 };
  return (
    <button
      ref={setNodeRef}
      style={style}
      className="picture-card"
      // role=img conveys "this is a picture of <label>"; the label is the alt, not on-screen text
      role="img"
      aria-label={item.label}
      {...listeners}
      {...attributes}
    >
      <span aria-hidden="true" className="picture-card__emoji">{item.emoji}</span>
    </button>
  );
}
```

- [ ] **Step 5: Create SoundBasket** — `src/game/SoundBasket.tsx`:

```tsx
import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ReplayButton } from './ReplayButton';

interface Props { sound: string; onReplay: () => void; children: ReactNode; }

export function SoundBasket({ sound, onReplay, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: sound });
  return (
    <div ref={setNodeRef} className={`sound-basket${isOver ? ' sound-basket--over' : ''}`}>
      <div className="sound-basket__head">
        <ReplayButton label={`Replay the ${sound} sound`} onReplay={onReplay} />
      </div>
      <div className="sound-basket__items">{children}</div>
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/game/components.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add src/game/ReplayButton.tsx src/game/PictureCard.tsx src/game/SoundBasket.tsx src/game/components.test.tsx
git commit -m "feat: add PictureCard, SoundBasket, ReplayButton"
```

---

## Task 8: SortGame screen (wire engine + hook + DnD + audio)

**Files:**
- Create: `src/game/SortGame.tsx`
- Test: `src/game/SortGame.test.tsx`

- [ ] **Step 1: Write the failing test** — `src/game/SortGame.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SortGame } from './SortGame';
import type { SortRound } from '../domain/types';
import type { AudioPlayer } from '../audio/audioPlayer';

const round: SortRound = {
  baskets: ['b', 's'],
  items: [
    { id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' },
    { id: 'sun', label: 'sun', beginningSound: 's', emoji: '☀️' },
  ],
};
const audio: AudioPlayer = { playSound: vi.fn().mockResolvedValue(undefined), playWord: vi.fn().mockResolvedValue(undefined) };

describe('SortGame', () => {
  it('renders a basket per target sound and all unplaced pictures', () => {
    render(<SortGame round={round} audio={audio} />);
    expect(screen.getAllByRole('button', { name: /replay the .* sound/i })).toHaveLength(2);
    expect(screen.getByRole('img', { name: /ball/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /sun/i })).toBeInTheDocument();
  });

  it('plays the word audio when a picture is tapped', async () => {
    render(<SortGame round={round} audio={audio} />);
    screen.getByRole('img', { name: /ball/i }).click();
    expect(audio.playWord).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/game/SortGame.test.tsx`
Expected: FAIL — cannot find module `./SortGame`.

- [ ] **Step 3: Write the screen** — `src/game/SortGame.tsx`:

```tsx
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { SortRound, WordItem } from '../domain/types';
import type { AudioPlayer } from '../audio/audioPlayer';
import { useSortGame } from './useSortGame';
import { PictureCard } from './PictureCard';
import { SoundBasket } from './SoundBasket';

interface Props { round: SortRound; audio: AudioPlayer; }

export function SortGame({ round, audio }: Props) {
  const game = useSortGame({ round, audio });
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  function handleDragEnd(event: DragEndEvent) {
    const wordId = String(event.active.id);
    const basketSound = event.over ? String(event.over.id) : null;
    if (basketSound) game.attemptPlace(wordId, basketSound);
  }

  function placedIn(sound: string): WordItem[] {
    return round.items.filter((i) => game.placements[i.id] === sound);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="sort-game">
        {game.isComplete ? (
          <div className="sort-game__done" role="status">All sorted! Great listening. 🎉</div>
        ) : (
          <p className="sort-game__prompt" role="status" aria-live="polite">
            {game.message ?? 'Drag each picture to the basket with its beginning sound.'}
          </p>
        )}

        <div className="sort-game__tray">
          {game.remainingItems.map((item) => (
            <span key={item.id} onClick={() => game.replayWord(item)}>
              <PictureCard item={item} />
            </span>
          ))}
        </div>

        <div className="sort-game__baskets">
          {round.baskets.map((sound) => (
            <SoundBasket key={sound} sound={sound} onReplay={() => game.replaySound(sound)}>
              {placedIn(sound).map((item) => (
                <span key={item.id} className="placed" aria-label={item.label} role="img">
                  <span aria-hidden="true">{item.emoji}</span>
                </span>
              ))}
            </SoundBasket>
          ))}
        </div>
      </div>
    </DndContext>
  );
}
```

> Note: tapping a picture replays its word (the `onClick` wrapper); dragging it sorts it. `@dnd-kit`'s PointerSensor distinguishes a click from a drag, so both gestures coexist.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/game/SortGame.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/game/SortGame.tsx src/game/SortGame.test.tsx
git commit -m "feat: wire SortGame screen with dnd-kit and audio"
```

---

## Task 9: App entry, "Soft & Friendly" styles, and run

**Files:**
- Modify: `src/App.tsx`
- Create: `src/styles/theme.css`
- Modify: `src/main.tsx` (ensure it imports `theme.css`)

- [ ] **Step 1: Replace `src/App.tsx`**

```tsx
import { useMemo } from 'react';
import { generateSortRound } from './domain/engine';
import { everydayObjects } from './content/packs/everydayObjects';
import { createStubAudioPlayer } from './audio/stubAudioPlayer';
import { SortGame } from './game/SortGame';

export default function App() {
  const audio = useMemo(() => createStubAudioPlayer(), []);
  const round = useMemo(
    () => generateSortRound({ pack: everydayObjects, targetSounds: ['b', 's'], itemsPerSound: 3 }),
    [],
  );

  return (
    <main className="app">
      <h1 className="app__title">Beginning Sounds Match</h1>
      <SortGame round={round} audio={audio} />
    </main>
  );
}
```

- [ ] **Step 2: Create `src/styles/theme.css`** — the "Soft & Friendly" default:

```css
:root {
  --bg: #fff6ec; --surface: #ffffff; --ink: #2b2d42; --accent: #ff8a3d;
  --accent-soft: #ffe9d6; --good: #6ab04c; --radius: 18px;
  font-family: 'Trebuchet MS', 'Segoe UI', system-ui, sans-serif;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); }
.app { max-width: 880px; margin: 0 auto; padding: 24px; text-align: center; }
.app__title { font-size: 28px; margin: 8px 0 20px; }

.sort-game__prompt, .sort-game__done {
  min-height: 28px; font-size: 18px; margin: 0 0 18px; font-weight: 600;
}
.sort-game__done { color: var(--good); }

.sort-game__tray {
  display: flex; flex-wrap: wrap; gap: 14px; justify-content: center;
  min-height: 96px; margin-bottom: 24px;
}
.sort-game__baskets { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }

.picture-card {
  width: 84px; height: 84px; border: none; border-radius: var(--radius);
  background: var(--surface); box-shadow: 0 6px 14px rgba(210,120,40,.18);
  font-size: 42px; cursor: grab; touch-action: none; display: grid; place-items: center;
}
.picture-card:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }

.sound-basket {
  min-width: 150px; min-height: 150px; padding: 12px; border-radius: var(--radius);
  background: var(--accent-soft); border: 3px dashed transparent;
}
.sound-basket--over { border-color: var(--accent); }
.sound-basket__head { display: flex; justify-content: center; margin-bottom: 8px; }
.sound-basket__items { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; font-size: 34px; }

.replay-btn {
  width: 48px; height: 48px; border-radius: 50%; border: none; cursor: pointer;
  background: var(--accent); color: #fff; font-size: 20px;
}
.replay-btn:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
```

- [ ] **Step 3: Ensure `src/main.tsx` imports the theme** — confirm it contains `import './styles/theme.css';` (replace the default `import './index.css'` line). The rest of the Vite-generated `main.tsx` stays.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: all suites pass (phonemes, validatePack, engine, placement, stub audio, useSortGame, components, SortGame, smoke).

- [ ] **Step 5: Manual run**

Run: `npm run dev`, open the printed URL. Verify: two baskets (b, s) with 🔊 buttons; six pictures in the tray; tapping a picture speaks it (TTS placeholder); dragging a picture into the correct basket keeps it there; a wrong basket shows "Not quite — listen again" and the picture returns; sorting all six shows the celebration.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/styles/theme.css src/main.tsx
git commit -m "feat: app entry, Soft & Friendly theme, first playable Mode A"
```

---

## Task 10: Production build + deploy

**Files:**
- Modify: `package.json` (verify `build` script exists from Vite)
- Create: `README.md`

- [ ] **Step 1: Verify the production build**

Run: `npm run build`
Expected: a `dist/` folder is produced with no TypeScript errors.

- [ ] **Step 2: Preview the build locally**

Run: `npm run preview`, open the URL, confirm the game plays as in Task 9 Step 5.

- [ ] **Step 3: Write `README.md`**

```markdown
# Beginning Sounds Match (Barton Level 1)

Audio-first, letterless phonics game. Mode A: sort pictures into beginning-sound baskets.

## Develop
- `npm install`
- `npm run dev` — play locally
- `npm test` — run the engine + UI tests
- `npm run build` — production build into `dist/`

## Status
v1 foundation: engine + content + Mode A, default "Soft & Friendly" look, TTS placeholder audio.
Next: Mode B, age-band themes, pack switching, reward toggle, recorded human audio (see docs/superpowers/plans).
```

- [ ] **Step 4: Commit**

```bash
git add README.md package.json
git commit -m "docs: add README and verify production build"
```

- [ ] **Step 5: Deploy (static host)**

Any static host serves `dist/`. With Vercel CLI: run `npx vercel` from the project root and accept defaults (framework auto-detected as Vite). Confirm the deployed URL plays the game. Record the URL in the README.

---

## Self-review notes (verified during planning)

- **Spec coverage:** Barton Level 1 letterless/audio-first (pictures + 🔊, no text labels shown) ✓; Mode A ✓ (Mode B deferred to Plan 2, stated); no-anxiety feedback (no timers, wrong = gentle replay, can't fail) ✓; dyslexia accessibility (big targets, focus rings, reduced-motion, audio-for-everything, keyboard via @dnd-kit KeyboardSensor) ✓; data-driven layers (content/engine/audio/shell separated) ✓; recorded-audio plan honored via swappable `AudioPlayer` (stub now) ✓; React+TS+Vite static deploy ✓; engine retargetable to ending/middle sounds (targetSounds is just input; `beginningSound` field is the only Level-1-specific name — Plan 2 generalizes the field to a `sounds` map) ✓; authored-not-copied word list ✓. Deferred-by-spec (avatar, Game World theme, themes/packs UI, levels 2–10, backend) intentionally absent.
- **Placeholder scan:** none — every step has concrete code/commands.
- **Type consistency:** `Phoneme`, `WordItem`, `Pack`, `SortRound`, `Placements` defined in Task 1 and used unchanged; `generateSortRound`/`isCorrectPlacement`/`isRoundComplete`/`canBuildSortRound` signatures consistent across Tasks 3/4/6/8; `AudioPlayer` interface stable across Tasks 5/6/8/9.
- **Known v1 limitation to revisit in Plan 2:** the `WordItem.beginningSound` field name is Level-1-specific; generalize to support ending/middle targets when those games are built.
```
