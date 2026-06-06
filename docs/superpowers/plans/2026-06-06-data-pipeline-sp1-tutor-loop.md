# SP1 — Tutor Cross-Device Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every answer + session sync to Supabase as append-only data and have the tutor dashboards read it back (cloud when signed in, local otherwise), so a tutor sees a student's full progress on any device — with a fast, hard-to-misfire active-student picker for the shared center device.

**Architecture:** Local-first stays the source of truth for gameplay. A durable **outbox** queues cloud writes (`skill_events`, `sessions`) and flushes when online + signed in. Reads go through a **dataSource** that returns cloud or local data; mastery is computed client-side from `skill_events` via the existing `scoreOf`/`areasToImprove`. Identity is the cloud `learners` row; a local profile carries its `cloudId`.

**Tech Stack:** React 19 + TypeScript + Vite, Vitest (jsdom, `pool: vmForks`), Supabase JS (lazy chunk). Run local binaries directly: `./node_modules/.bin/{tsc,vitest,vite,eslint}` — never `npx`.

**Scope:** SP1 only. SP2 (guardians/invites/parent dashboard) is a separate plan written after SP1 lands. Supabase schema + edge-function deploy are operator steps (the assistant cannot deploy); SQL is version-controlled in `supabase/schema.sql`.

**Conventions for every task:** after the implementation steps, run the full gate and only commit when green:
`./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run`

---

## File map

- `supabase/schema.sql` — add `skill_events` table + integrity trigger + center-scoped RLS *(modify)*
- `src/mastery/events.ts` — `SkillEvent` type + `masteryFromEvents()` *(create)*
- `src/mastery/events.test.ts` — equivalence tests *(create)*
- `src/data/outbox.ts` — durable cloud-write queue *(create)*
- `src/data/outbox.test.ts` *(create)*
- `src/data/cloud.ts` — add `insertSkillEvents`, `listSkillEvents` *(modify)*
- `src/data/cloudSync.ts` — add `logSkillEvent`, `flushOutbox`; route session writes through the outbox *(modify)*
- `src/data/dataSource.ts` — cloud/local read switch for sessions + mastery *(create)*
- `src/data/dataSource.test.ts` *(create)*
- `src/data/identity.ts` — pull cloud roster → reconcile into local profiles with `cloudId` *(create)*
- `src/data/identity.test.ts` *(create)*
- `src/profiles.ts` — `Learner.cloudId?`, `markRecentlyActive`, `recentlyActiveOrder` *(modify)*
- `src/sessionLog.ts` — route the cloud push through the outbox *(modify)*
- `src/mastery/mastery.ts` — export the rolling-window constant `K` for reuse *(modify)*
- `src/StudentPicker.tsx` — center-friendly full-screen picker (search + recently-active) *(create)*
- `src/StudentPicker.test.tsx` *(create)*
- `src/NowPlaying.tsx` — "Now playing" bar that opens the picker *(create)*
- `src/worlds/space/SpaceSortGame.tsx` — log per-item skill events; show active-student chip *(modify)*
- `src/game/SortGame.tsx` — log per-item skill events *(modify)*
- `src/GameScreen.tsx` — pass the active learner name to the games for the chip *(modify)*
- `src/ProfilePage.tsx` — areas-to-improve via async `dataSource` *(modify)*
- `src/TutorDashboard.tsx` — sessions/KPIs via async `dataSource` *(modify)*
- `src/Home.tsx` — mount `NowPlaying`; "confirm student on launch" setting (off by default) *(modify)*

---

## Task 1: Schema — `skill_events` + integrity trigger + center RLS

**Files:**
- Modify: `supabase/schema.sql` (append before the onboarding-trigger section)

This is version-controlled SQL the operator runs in the Supabase SQL editor. No unit test (pure DDL); verification is that the file is valid SQL and the app still builds. SP2 will broaden the RLS to guardians; SP1 keeps it center-scoped.

- [ ] **Step 1: Append the table, trigger, and RLS to `supabase/schema.sql`**

Insert this block immediately *before* the `-- ---------- onboarding trigger ----------` section:

```sql
-- ---------- per-answer event log (append-only; powers cross-device mastery) ----------
create table if not exists skill_events (
  id         uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learners (id) on delete cascade,
  center_id  uuid not null references centers (id) on delete cascade,
  skill_key  text not null,
  correct    boolean not null,
  game       text,
  at         timestamptz not null default now()
);
create index if not exists skill_events_learner_idx on skill_events (learner_id, at desc);

-- integrity: stamp center_id from the learner row so a client can never spoof it
create or replace function stamp_center_from_learner() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  select center_id into new.center_id from learners where id = new.learner_id;
  return new;
end;
$$;
drop trigger if exists sessions_stamp_center on sessions;
create trigger sessions_stamp_center before insert on sessions
  for each row execute function stamp_center_from_learner();
drop trigger if exists skill_events_stamp_center on skill_events;
create trigger skill_events_stamp_center before insert on skill_events
  for each row execute function stamp_center_from_learner();

alter table skill_events enable row level security;
-- SP1: center-scoped. SP2 broadens these to "or is_guardian_of(learner_id)".
create policy "skill_events read"   on skill_events for select using (center_id = current_center_id());
create policy "skill_events insert" on skill_events for insert with check (
  exists (select 1 from learners l where l.id = learner_id and l.center_id = current_center_id()));
```

- [ ] **Step 2: Sanity-check the build is unaffected**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: PASS (SQL is not compiled; this just confirms nothing else broke).

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat(schema): skill_events table + center_id integrity trigger (SP1)"
```

---

## Task 2: `SkillEvent` type + `masteryFromEvents()`

**Files:**
- Modify: `src/mastery/mastery.ts` (export `K`)
- Create: `src/mastery/events.ts`
- Test: `src/mastery/events.test.ts`

Goal: fold an ordered list of answer-events into the existing `MasteryMap` so dashboards can reuse `scoreOf`/`areasToImprove` unchanged.

- [ ] **Step 1: Export the rolling-window constant from `mastery.ts`**

In `src/mastery/mastery.ts`, change `const K = 10;` to:

```ts
export const K = 10; // rolling window (also used by masteryFromEvents)
```

- [ ] **Step 2: Write the failing test** — `src/mastery/events.test.ts`

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { masteryFromEvents } from './events';
import type { SkillEvent } from './events';
import { recordItem, loadMastery, scoreOf } from './mastery';

beforeEach(() => localStorage.clear());

describe('masteryFromEvents', () => {
  it('matches the recordItem fold for the same ordered sequence', () => {
    const seq: Array<[string, boolean]> = [
      ['sound:medial:a', true], ['sound:medial:a', false], ['sound:medial:a', true],
      ['sound:first:b', false], ['sound:first:b', false], ['sound:medial:a', true],
    ];
    // expected: replay through the real local recorder
    seq.forEach(([k, c]) => recordItem('L1', k, c));
    const expected = loadMastery('L1');

    const events: SkillEvent[] = seq.map(([skillKey, correct], i) => ({ skillKey, correct, at: 1000 + i }));
    const got = masteryFromEvents(events);

    for (const key of Object.keys(expected)) {
      expect(got[key].attempts).toBe(expected[key].attempts);
      expect(got[key].correct).toBe(expected[key].correct);
      expect(scoreOf(got[key])).toBeCloseTo(scoreOf(expected[key]));
    }
  });

  it('caps the recent window at K and sorts events by time first', () => {
    const events: SkillEvent[] = Array.from({ length: 14 }, (_, i) => ({
      skillKey: 's', correct: i % 2 === 0, at: 14 - i, // intentionally reverse-time
    }));
    const map = masteryFromEvents(events);
    expect(map['s'].attempts).toBe(14);
    expect(map['s'].recent.length).toBe(10);
  });
});
```

- [ ] **Step 3: Run it to confirm it fails**

Run: `./node_modules/.bin/vitest run src/mastery/events.test.ts`
Expected: FAIL ("Failed to resolve import './events'").

- [ ] **Step 4: Implement** — `src/mastery/events.ts`

```ts
import { K } from './mastery';
import type { MasteryMap, SkillStat } from './mastery';

/** One answered item, as logged to the cloud (append-only). `at` is epoch ms. */
export interface SkillEvent {
  skillKey: string;
  correct: boolean;
  at: number;
}

/**
 * Fold an ordered event list into the existing MasteryMap shape so the dashboard
 * can reuse scoreOf / areasToImprove unchanged. Events are sorted by time first,
 * so multi-device merges (events arriving in any order) are deterministic.
 */
export function masteryFromEvents(events: SkillEvent[]): MasteryMap {
  const map: MasteryMap = {};
  const ordered = [...events].sort((a, b) => a.at - b.at);
  for (const e of ordered) {
    const s: SkillStat = map[e.skillKey] ?? { attempts: 0, correct: 0, recent: [], lastSeen: 0 };
    s.attempts += 1;
    if (e.correct) s.correct += 1;
    s.recent.push(e.correct ? 1 : 0);
    if (s.recent.length > K) s.recent = s.recent.slice(-K);
    s.lastSeen = e.at;
    map[e.skillKey] = s;
  }
  return map;
}
```

- [ ] **Step 5: Run tests to confirm pass**

Run: `./node_modules/.bin/vitest run src/mastery/events.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Gate + commit**

```bash
./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run
git add src/mastery/events.ts src/mastery/events.test.ts src/mastery/mastery.ts
git commit -m "feat(mastery): masteryFromEvents folds skill events into MasteryMap"
```

---

## Task 3: Durable outbox queue

**Files:**
- Create: `src/data/outbox.ts`
- Test: `src/data/outbox.test.ts`

A persistent queue of pending cloud writes. Pure over `localStorage` + an injected async `writer`, so it is fully testable without a backend.

- [ ] **Step 1: Write the failing test** — `src/data/outbox.test.ts`

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { enqueue, allItems, flush, MAX_OUTBOX } from './outbox';

beforeEach(() => localStorage.clear());

describe('outbox', () => {
  it('persists enqueued items', () => {
    enqueue({ kind: 'skill_event', localLearnerId: 'L1', payload: { skillKey: 's', correct: true, at: 1 } });
    expect(allItems()).toHaveLength(1);
    expect(allItems()[0].tries).toBe(0);
  });

  it('removes items the writer accepts, keeps + counts tries on failure', async () => {
    enqueue({ kind: 'session', localLearnerId: 'L1', payload: { game: 'g' } });
    enqueue({ kind: 'session', localLearnerId: 'L1', payload: { game: 'h' } });
    const writer = vi.fn()
      .mockResolvedValueOnce(true)   // first ok
      .mockResolvedValueOnce(false); // second fails
    await flush(writer);
    expect(writer).toHaveBeenCalledTimes(2);
    const left = allItems();
    expect(left).toHaveLength(1);
    expect(left[0].tries).toBe(1);
  });

  it('drops oldest beyond MAX_OUTBOX', () => {
    for (let i = 0; i < MAX_OUTBOX + 5; i++) enqueue({ kind: 'skill_event', localLearnerId: 'L1', payload: { skillKey: 's', correct: true, at: i } });
    expect(allItems().length).toBe(MAX_OUTBOX);
    expect((allItems()[0].payload as { at: number }).at).toBe(5); // oldest 5 dropped
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `./node_modules/.bin/vitest run src/data/outbox.test.ts`
Expected: FAIL ("Failed to resolve import './outbox'").

- [ ] **Step 3: Implement** — `src/data/outbox.ts`

```ts
/**
 * Durable queue of pending cloud writes. Gameplay enqueues; flush() drains it
 * through an injected writer when online + signed in. Append-only payloads mean
 * flush order is irrelevant and "both places" merges cleanly. Guarded so a cloud
 * problem never blocks play.
 */
export type OutboxKind = 'skill_event' | 'session' | 'achievement';

export interface OutboxItem {
  id: string;
  kind: OutboxKind;
  localLearnerId: string;
  payload: unknown;
  tries: number;
}

export const MAX_OUTBOX = 2000;
const KEY = 'll-outbox';

function read(): OutboxItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? (v as OutboxItem[]) : [];
  } catch {
    return [];
  }
}
function write(items: OutboxItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(-MAX_OUTBOX)));
  } catch {
    /* ignore (quota / private mode) */
  }
}

export function allItems(): OutboxItem[] {
  return read();
}

export function enqueue(item: Omit<OutboxItem, 'id' | 'tries'>): void {
  const items = read();
  items.push({ ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, tries: 0 });
  write(items);
}

/**
 * Drain the queue. `writer` returns true on success (item removed) or false on
 * failure (item kept, tries incremented). Never throws.
 */
export async function flush(writer: (item: OutboxItem) => Promise<boolean>): Promise<void> {
  const items = read();
  const keep: OutboxItem[] = [];
  for (const item of items) {
    let ok = false;
    try {
      ok = await writer(item);
    } catch {
      ok = false;
    }
    if (!ok) keep.push({ ...item, tries: item.tries + 1 });
  }
  write(keep);
}
```

- [ ] **Step 4: Run tests to confirm pass**

Run: `./node_modules/.bin/vitest run src/data/outbox.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Gate + commit**

```bash
./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run
git add src/data/outbox.ts src/data/outbox.test.ts
git commit -m "feat(data): durable cloud-write outbox queue"
```

---

## Task 4: `cloud.ts` — `insertSkillEvents` + `listSkillEvents`

**Files:**
- Modify: `src/data/cloud.ts` (add after the `sessions` section, near `insertSession`)

Thin Supabase wrappers. `center_id` is omitted on insert (the DB trigger stamps it).

- [ ] **Step 1: Add the types + functions to `src/data/cloud.ts`**

```ts
// ---------- skill events (append-only per-answer log) ----------
export interface CloudSkillEvent {
  learner_id: string;
  skill_key: string;
  correct: boolean;
  game?: string;
  at: string; // ISO
}

export async function insertSkillEvents(rows: CloudSkillEvent[]) {
  if (rows.length === 0) return;
  const { error } = await (await client()).from('skill_events').insert(rows);
  if (error) throw error;
}

export async function listSkillEvents(learnerId: string, sinceISO?: string) {
  let q = (await client()).from('skill_events').select('skill_key, correct, at').eq('learner_id', learnerId);
  if (sinceISO) q = q.gte('at', sinceISO);
  const { data, error } = await q.order('at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as { skill_key: string; correct: boolean; at: string }[];
}
```

- [ ] **Step 2: Gate (type-check only — these need a live client to exercise)**

Run: `./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint .`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/data/cloud.ts
git commit -m "feat(cloud): insertSkillEvents + listSkillEvents wrappers"
```

---

## Task 5: `cloudSync` — `logSkillEvent`, `flushOutbox`; route sessions through the outbox

**Files:**
- Modify: `src/data/cloudSync.ts`
- Modify: `src/sessionLog.ts` (route the cloud push through the outbox)
- Test: `src/data/cloudSync.test.ts` *(create)*

- [ ] **Step 1: Write the failing test** — `src/data/cloudSync.test.ts`

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('./cloud', () => ({
  currentCenterId: vi.fn().mockResolvedValue('C1'),
  upsertLearner: vi.fn().mockResolvedValue('cloud-L1'),
  insertSession: vi.fn().mockResolvedValue(undefined),
  insertSkillEvents: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../profiles', () => ({ getLearner: () => ({ id: 'L1', name: 'Mia', color: '#000' }) }));
vi.mock('./supabase', () => ({ getSupabase: vi.fn().mockResolvedValue({ auth: { getSession: async () => ({ data: { session: { user: {} } } }) } }) }));

import * as cloud from './cloud';
import { logSkillEvent, flushOutbox } from './cloudSync';
import { allItems } from './outbox';

beforeEach(() => localStorage.clear());

describe('cloudSync outbox integration', () => {
  it('logSkillEvent enqueues and flushOutbox pushes + drains when signed in', async () => {
    logSkillEvent('L1', { skillKey: 'sound:medial:a', correct: true, at: 123 });
    expect(allItems()).toHaveLength(1);
    await flushOutbox();
    expect(cloud.insertSkillEvents).toHaveBeenCalledTimes(1);
    expect(allItems()).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `./node_modules/.bin/vitest run src/data/cloudSync.test.ts`
Expected: FAIL (`logSkillEvent`/`flushOutbox` not exported).

- [ ] **Step 3: Implement in `src/data/cloudSync.ts`**

Add these imports at the top (alongside the existing ones):

```ts
import { enqueue, flush, type OutboxItem } from './outbox';
import type { SkillEvent } from '../mastery/events';
```

Add these exports at the bottom of the file:

```ts
/** Enqueue one answer-event for cloud sync (no-op effect until flushed). */
export function logSkillEvent(localLearnerId: string, ev: SkillEvent): void {
  enqueue({ kind: 'skill_event', localLearnerId, payload: ev });
  void flushOutbox();
}

/** Enqueue a finished session for cloud sync. */
export function enqueueSession(localLearnerId: string, rec: Omit<SessionRecord, 'id'>): void {
  enqueue({ kind: 'session', localLearnerId, payload: rec });
  void flushOutbox();
}

/** Drain the outbox to Supabase. No-op unless signed in + a center exists. */
export function flushOutbox(): Promise<void> {
  return (async () => {
    if (!(await signedIn())) return;
    const centerId = await cloud.currentCenterId();
    if (!centerId) return;
    await flush(async (item: OutboxItem) => {
      const learnerId = await ensureCloudLearner(item.localLearnerId, centerId);
      if (!learnerId) return false;
      if (item.kind === 'skill_event') {
        const ev = item.payload as SkillEvent;
        await cloud.insertSkillEvents([{ learner_id: learnerId, skill_key: ev.skillKey, correct: ev.correct, at: new Date(ev.at).toISOString() }]);
        return true;
      }
      if (item.kind === 'session') {
        const r = item.payload as Omit<SessionRecord, 'id'>;
        await cloud.insertSession({
          learner_id: learnerId, center_id: centerId, game: r.game, level: r.level, lesson: r.lesson,
          started_at: r.startedAt, ended_at: r.endedAt, duration_ms: r.durationMs, rounds: r.rounds,
          items: r.items, wrong_attempts: r.wrongAttempts, accuracy: r.accuracy,
        });
        return true;
      }
      return true; // unknown kind: drop
    });
  })().catch((e) => { console.warn('[cloud] flush failed:', e); });
}
```

- [ ] **Step 4: Route the session push through the outbox in `src/sessionLog.ts`**

Replace the existing best-effort push line:

```ts
  // Best-effort cloud push (no-op unless a tutor is signed in).
  void import('./data/cloudSync').then((m) => m.syncSession(learnerId, rec));
```

with:

```ts
  // Queue for cloud sync (durable; no-op effect until flushed when signed in).
  void import('./data/cloudSync').then((m) => m.enqueueSession(learnerId, rec));
```

- [ ] **Step 5: Run tests to confirm pass**

Run: `./node_modules/.bin/vitest run src/data/cloudSync.test.ts`
Expected: PASS.

- [ ] **Step 6: Gate + commit**

```bash
./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run
git add src/data/cloudSync.ts src/sessionLog.ts src/data/cloudSync.test.ts
git commit -m "feat(cloud): logSkillEvent + flushOutbox; route sessions through outbox"
```

---

## Task 6: Log per-item events at the game call sites

**Files:**
- Modify: `src/worlds/space/SpaceSortGame.tsx` (the `onItemResult` callback)
- Modify: `src/game/SortGame.tsx` (the `onItemResult` callback)

Each game already calls `recordItem(learnerId, skillKey, correct)` per item. Add a cloud enqueue alongside it (local stays the source of truth).

- [ ] **Step 1: SpaceSortGame — import + enqueue**

In `src/worlds/space/SpaceSortGame.tsx`, add to imports:

```ts
import { logSkillEvent } from '../../data/cloudSync';
```

Change the `useSortGame` call's `onItemResult`:

```ts
    onItemResult: ({ skillKey, correct }) => {
      recordItem(learnerId, skillKey, correct);
      logSkillEvent(learnerId, { skillKey, correct, at: Date.now() });
    },
```

- [ ] **Step 2: SortGame — same change**

In `src/game/SortGame.tsx`, add the same import (`import { logSkillEvent } from '../data/cloudSync';`) and update its `onItemResult` callback identically (call `recordItem(...)` then `logSkillEvent(learnerId, { skillKey, correct, at: Date.now() })`). If `SortGame` records items inside a different handler, add the `logSkillEvent` call on the same line where `recordItem` is called.

- [ ] **Step 3: Gate + commit**

```bash
./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run
git add src/worlds/space/SpaceSortGame.tsx src/game/SortGame.tsx
git commit -m "feat(games): log per-item skill events to the cloud outbox"
```

---

## Task 7: `Learner.cloudId` + identity reconciliation

**Files:**
- Modify: `src/profiles.ts` (add `cloudId?` to `Learner`; add `setCloudId`, `markRecentlyActive`, `recentlyActiveOrder`)
- Create: `src/data/identity.ts`
- Test: `src/data/identity.test.ts`

- [ ] **Step 1: Extend `src/profiles.ts`**

Add `cloudId?: string;` to the `Learner` interface.

Modify `addLearner` to accept an options bag — backward-compatible (existing `addLearner(name)` callers are unaffected). Replace the current function with:

```ts
export function addLearner(name: string, opts?: { color?: string; setCurrent?: boolean }): Learner {
  const list = loadLearners();
  const learner: Learner = {
    id: 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    name: name.trim() || `Player ${list.length + 1}`,
    color: opts?.color ?? COLORS[list.length % COLORS.length],
    createdAt: new Date().toISOString(),
  };
  persist([...list, learner]);
  if (opts?.setCurrent !== false) setCurrentLearnerId(learner.id);
  return learner;
}
```

Then add these functions (after `persist`):

```ts
/** Set the cloud learner uuid for a local profile (idempotent). */
export function setCloudId(localId: string, cloudId: string): void {
  const list = loadLearners();
  const l = list.find((x) => x.id === localId);
  if (l && l.cloudId !== cloudId) {
    l.cloudId = cloudId;
    persist(list);
  }
}

const RECENT_KEY = 'll-recent';
function readRecent(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '{}'); } catch { return {}; }
}
/** Stamp a learner as just-active (drives the picker's sort order). */
export function markRecentlyActive(localId: string): void {
  try {
    const m = readRecent();
    m[localId] = Date.now();
    localStorage.setItem(RECENT_KEY, JSON.stringify(m));
  } catch { /* ignore */ }
}
/** Learners sorted most-recently-active first (for the student picker). */
export function recentlyActiveOrder(list: Learner[]): Learner[] {
  const m = readRecent();
  return [...list].sort((a, b) => (m[b.id] ?? 0) - (m[a.id] ?? 0));
}
```

- [ ] **Step 2: Write the failing test** — `src/data/identity.test.ts`

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('./cloud', () => ({
  listLearners: vi.fn().mockResolvedValue([
    { id: 'cloud-A', display_name: 'Mia', color: '#111', archived: false },
    { id: 'cloud-B', display_name: 'Sam', color: '#222', archived: false },
  ]),
}));
vi.mock('./supabase', () => ({ getSupabase: vi.fn().mockResolvedValue({ auth: { getSession: async () => ({ data: { session: {} } }) } }) }));

import { reconcileRoster } from './identity';
import { loadLearners } from '../profiles';

beforeEach(() => localStorage.clear());

describe('reconcileRoster', () => {
  it('creates local profiles for cloud learners with cloudId set', async () => {
    await reconcileRoster();
    const list = loadLearners();
    const mia = list.find((l) => l.cloudId === 'cloud-A');
    expect(mia?.name).toBe('Mia');
    expect(list.some((l) => l.cloudId === 'cloud-B')).toBe(true);
  });

  it('is idempotent (no duplicates on a second run)', async () => {
    await reconcileRoster();
    await reconcileRoster();
    expect(loadLearners().filter((l) => l.cloudId === 'cloud-A')).toHaveLength(1);
  });
});
```

- [ ] **Step 3: Run it to confirm it fails**

Run: `./node_modules/.bin/vitest run src/data/identity.test.ts`
Expected: FAIL ("Failed to resolve import './identity'").

- [ ] **Step 4: Implement** — `src/data/identity.ts`

```ts
import { getSupabase } from './supabase';
import * as cloud from './cloud';
import { loadLearners, addLearner, setCloudId } from '../profiles';

/**
 * Pull the accessible cloud roster (tutor → center learners) and reconcile it
 * into local profiles, setting cloudId. A local profile already bound to a cloud
 * id is left alone; unseen cloud learners get a new local profile. No-op when
 * signed out or Supabase is unconfigured.
 */
export async function reconcileRoster(): Promise<void> {
  try {
    const supabase = await getSupabase();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    const cloudLearners = await cloud.listLearners();
    const local = loadLearners();
    const haveCloudIds = new Set(local.map((l) => l.cloudId).filter(Boolean));

    for (const cl of cloudLearners) {
      if (haveCloudIds.has(cl.id)) continue;
      const created = addLearner(cl.display_name, { color: cl.color, setCurrent: false });
      setCloudId(created.id, cl.id);
    }
  } catch (e) {
    console.warn('[cloud] roster reconcile failed:', e);
  }
}
```

> `addLearner` is extended in Step 1 to take `{ color, setCurrent }`; `setCurrent: false` keeps roster sync from hijacking whichever student is currently active on the device.

- [ ] **Step 5: Run tests to confirm pass**

Run: `./node_modules/.bin/vitest run src/data/identity.test.ts`
Expected: PASS.

- [ ] **Step 6: Gate + commit**

```bash
./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run
git add src/profiles.ts src/data/identity.ts src/data/identity.test.ts
git commit -m "feat(data): cloud roster reconciliation into local profiles (cloudId)"
```

---

## Task 8: `dataSource` — cloud/local read switch

**Files:**
- Create: `src/data/dataSource.ts`
- Test: `src/data/dataSource.test.ts`

Returns a learner's sessions + mastery from the cloud when signed in, local otherwise. Mastery from cloud uses `masteryFromEvents`.

- [ ] **Step 1: Write the failing test** — `src/data/dataSource.test.ts`

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

const signedInRef = { value: false };
vi.mock('./supabase', () => ({
  getSupabase: vi.fn().mockImplementation(async () =>
    signedInRef.value ? { auth: { getSession: async () => ({ data: { session: {} } }) } } : null),
}));
vi.mock('./cloud', () => ({
  listSessions: vi.fn().mockResolvedValue([{ id: 'c1', game: 'g', ended_at: '2026-01-01T00:00:00Z', duration_ms: 1000, rounds: 1, items: 6, wrong_attempts: 0, accuracy: 1 }]),
  listSkillEvents: vi.fn().mockResolvedValue([{ skill_key: 's', correct: true, at: '2026-01-01T00:00:00Z' }]),
}));

import { getMastery } from './dataSource';
import { recordItem } from '../mastery/mastery';
import { scoreOf } from '../mastery/mastery';

beforeEach(() => { localStorage.clear(); signedInRef.value = false; });

describe('dataSource.getMastery', () => {
  it('reads local mastery when signed out', async () => {
    recordItem('L1', 's', false);
    const m = await getMastery({ id: 'L1', name: 'x', color: '#000', createdAt: '' });
    expect(m['s'].attempts).toBe(1);
  });

  it('reads cloud events when signed in + cloudId present', async () => {
    signedInRef.value = true;
    const m = await getMastery({ id: 'L1', cloudId: 'cloud-1', name: 'x', color: '#000', createdAt: '' });
    expect(m['s'].attempts).toBe(1);
    expect(scoreOf(m['s'])).toBeCloseTo(1);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `./node_modules/.bin/vitest run src/data/dataSource.test.ts`
Expected: FAIL ("Failed to resolve import './dataSource'").

- [ ] **Step 3: Implement** — `src/data/dataSource.ts`

```ts
import { getSupabase } from './supabase';
import * as cloud from './cloud';
import type { Learner } from '../profiles';
import { loadSessionLog } from '../sessionLog';
import type { SessionRecord } from '../sessionLog';
import { loadMastery } from '../mastery/mastery';
import type { MasteryMap } from '../mastery/mastery';
import { masteryFromEvents } from '../mastery/events';

async function cloudActive(learner: Learner): Promise<boolean> {
  if (!learner.cloudId) return false;
  const supabase = await getSupabase();
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

/** A learner's finished sessions — cloud when signed in, local otherwise. */
export async function getSessions(learner: Learner): Promise<SessionRecord[]> {
  if (await cloudActive(learner)) {
    try {
      const rows = await cloud.listSessions(learner.cloudId!);
      return rows.map((r) => ({
        id: r.id, game: r.game, level: r.level ?? undefined, lesson: r.lesson ?? undefined,
        startedAt: r.started_at ?? '', endedAt: r.ended_at, durationMs: r.duration_ms,
        rounds: r.rounds ?? 0, items: r.items ?? 0, wrongAttempts: r.wrong_attempts ?? 0, accuracy: r.accuracy ?? 1,
      }));
    } catch { /* fall through to local */ }
  }
  return loadSessionLog(learner.id);
}

/** A learner's mastery map — computed from cloud events when signed in, local otherwise. */
export async function getMastery(learner: Learner): Promise<MasteryMap> {
  if (await cloudActive(learner)) {
    try {
      const rows = await cloud.listSkillEvents(learner.cloudId!);
      return masteryFromEvents(rows.map((r) => ({ skillKey: r.skill_key, correct: r.correct, at: Date.parse(r.at) })));
    } catch { /* fall through to local */ }
  }
  return loadMastery(learner.id);
}
```

- [ ] **Step 4: Run tests to confirm pass**

Run: `./node_modules/.bin/vitest run src/data/dataSource.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate + commit**

```bash
./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run
git add src/data/dataSource.ts src/data/dataSource.test.ts
git commit -m "feat(data): dataSource cloud/local read switch (sessions + mastery)"
```

---

## Task 9: ProfilePage — areas-to-improve via async `dataSource`

**Files:**
- Modify: `src/ProfilePage.tsx`
- Modify: `src/AreasToImprove.tsx` (accept a precomputed `MasteryMap` or focus list as a prop)

`AreasToImprove` currently reads local mastery synchronously. Make it accept the data so the page can supply cloud-or-local results.

- [ ] **Step 1: Inspect current props**

Run: `./node_modules/.bin/eslint src/AreasToImprove.tsx` and open it to see whether it calls `areasToImprove(learnerId)` internally. The change: accept a `focus: FocusArea[]` prop (computed by the parent) instead of reading mastery itself; keep a fallback to local if no prop is supplied (so other callers are unaffected).

- [ ] **Step 2: Make `AreasToImprove` accept the focus list**

In `src/AreasToImprove.tsx`, change the component signature to accept an optional precomputed list:

```tsx
import { areasToImprove, type FocusArea } from './mastery/mastery';

export function AreasToImprove({ learnerId, focus }: { learnerId: string; focus?: FocusArea[] }) {
  const areas = focus ?? areasToImprove(learnerId);
  // ...existing rendering using `areas`...
}
```

(Replace the internal `const areas = areasToImprove(learnerId)` with the line above; the rest of the component is unchanged.)

- [ ] **Step 3: Compute focus from `dataSource` in `ProfilePage.tsx`**

Add imports:

```tsx
import { useEffect, useState } from 'react';
import { getMastery } from './data/dataSource';
import { areasToImprove, type FocusArea } from './mastery/mastery';
import { getLearner } from './profiles';
```

Inside the `ProfilePage` component, add:

```tsx
  const [focus, setFocus] = useState<FocusArea[]>(() => areasToImprove(learnerId));
  useEffect(() => {
    let live = true;
    const learner = getLearner(learnerId);
    if (!learner) return;
    void getMastery(learner).then((map) => {
      if (!live) return;
      // reuse the existing ranker by temporarily scoring the map
      const ranked = Object.entries(map)
        .filter(([, s]) => s.attempts >= 5)
        .map(([skillKey, s]) => ({ skillKey, score: s.recent.length ? s.recent.reduce((n, v, i) => n + (i + 1) * v, 0) / s.recent.reduce((n, _v, i) => n + (i + 1), 0) : 1, attempts: s.attempts }))
        .filter((a) => a.score < 0.8)
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);
      setFocus(ranked);
    });
    return () => { live = false; };
  }, [learnerId]);
```

> Cleaner alternative (preferred): export a pure `rankAreas(map: MasteryMap, n=3): FocusArea[]` from `mastery.ts` (extract the body of `areasToImprove` so it operates on a passed map), then call `rankAreas(map)` here and have `areasToImprove(learnerId)` delegate to `rankAreas(loadMastery(learnerId))`. Do this extraction in `mastery.ts` first, add a unit test mirroring the existing `areasToImprove` test, then use `rankAreas` in this effect.

Then pass it to the card:

```tsx
  <AreasToImprove learnerId={learnerId} focus={focus} />
```

- [ ] **Step 4: Add a `rankAreas` unit test** — `src/mastery/rankAreas.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { rankAreas } from './mastery';

describe('rankAreas', () => {
  it('returns rated weak skills weakest-first, capped at n', () => {
    const map = {
      weak: { attempts: 6, correct: 1, recent: [0, 0, 1, 0, 0, 0], lastSeen: 2 },
      okay: { attempts: 6, correct: 6, recent: [1, 1, 1, 1, 1, 1], lastSeen: 1 },
      unrated: { attempts: 2, correct: 0, recent: [0, 0], lastSeen: 3 },
    };
    const out = rankAreas(map, 3);
    expect(out.map((a) => a.skillKey)).toEqual(['weak']);
  });
});
```

(Implement `rankAreas` by extracting the body of `areasToImprove` to operate on a passed `MasteryMap`; have `areasToImprove(learnerId)` call `rankAreas(loadMastery(learnerId), n)`. Then simplify the Task-9 effect to `setFocus(rankAreas(map))`.)

- [ ] **Step 5: Render test for ProfilePage focus** — extend `src/dashboard-cards.test.tsx`

Add a case asserting the page renders the focus card without throwing when local mastery has a weak skill (mirror the existing card test setup). Verify with:

Run: `./node_modules/.bin/vitest run src/dashboard-cards.test.tsx`
Expected: PASS.

- [ ] **Step 6: Gate + commit**

```bash
./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run
git add src/ProfilePage.tsx src/AreasToImprove.tsx src/mastery/mastery.ts src/mastery/rankAreas.test.ts src/dashboard-cards.test.tsx
git commit -m "feat(profile): areas-to-improve from cloud-or-local mastery (async)"
```

---

## Task 10: TutorDashboard — sessions/KPIs via async `dataSource`

**Files:**
- Modify: `src/TutorDashboard.tsx`

`TutorDashboard` currently reads `loadSessionLog(sel)` + `loadProgress(sel)` synchronously. Switch the session source to `dataSource.getSessions` (keeps local `loadProgress` for best-time/sticker counts, which remain local in SP1).

- [ ] **Step 1: Load sessions asynchronously**

Add imports:

```tsx
import { useEffect, useState } from 'react';
import { getSessions } from './data/dataSource';
import { getLearner } from './profiles';
import type { SessionRecord } from './sessionLog';
```

Replace `const log = sel ? loadSessionLog(sel) : [];` with state + an effect:

```tsx
  const [log, setLog] = useState<SessionRecord[]>([]);
  useEffect(() => {
    let live = true;
    const learner = sel ? getLearner(sel) : undefined;
    if (!learner) { setLog([]); return; }
    void getSessions(learner).then((rows) => { if (live) setLog(rows); });
    return () => { live = false; };
  }, [sel]);
```

The rest of the component (KPIs, charts, log panel) already derives from `log`; no further change.

- [ ] **Step 2: Render test** — `src/TutorDashboard.test.tsx` *(create)*

```tsx
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
```

- [ ] **Step 3: Run + gate + commit**

```bash
./node_modules/.bin/vitest run src/TutorDashboard.test.tsx
./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run
git add src/TutorDashboard.tsx src/TutorDashboard.test.tsx
git commit -m "feat(tutor): dashboard sessions via cloud-or-local dataSource"
```

---

## Task 11: Center-friendly StudentPicker + NowPlaying bar

**Files:**
- Create: `src/StudentPicker.tsx`
- Create: `src/NowPlaying.tsx`
- Test: `src/StudentPicker.test.tsx`
- Modify: `src/Home.tsx` (mount `NowPlaying`)

- [ ] **Step 1: Write the failing test** — `src/StudentPicker.test.tsx`

```tsx
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
    addLearner('Mia');
    addLearner('Sam');
    render(<StudentPicker open onSelect={() => {}} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'sam' } });
    expect(screen.queryByRole('button', { name: /Mia/ })).toBeNull();
    expect(screen.getByRole('button', { name: /Sam/ })).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `./node_modules/.bin/vitest run src/StudentPicker.test.tsx`
Expected: FAIL ("Failed to resolve import './StudentPicker'").

- [ ] **Step 3: Implement** — `src/StudentPicker.tsx`

```tsx
import { useState } from 'react';
import { loadLearners, initials, recentlyActiveOrder } from './profiles';

interface Props { open: boolean; onSelect: (id: string) => void; onClose: () => void }

/** Full-screen student picker for the shared center device: large avatar cards,
 *  most-recently-active first, with a search box that appears for big rosters. */
export function StudentPicker({ open, onSelect, onClose }: Props) {
  const [q, setQ] = useState('');
  if (!open) return null;
  const all = recentlyActiveOrder(loadLearners());
  const list = q.trim() ? all.filter((l) => l.name.toLowerCase().includes(q.trim().toLowerCase())) : all;
  return (
    <div className="picker-overlay" role="dialog" aria-modal="true" aria-label="Choose the student playing" onClick={onClose}>
      <div className="picker" onClick={(e) => e.stopPropagation()}>
        <div className="picker__head">
          <h2 className="picker__title">Who's playing?</h2>
          <button type="button" className="picker__x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {all.length > 12 && (
          <input className="picker__search" placeholder="Search students…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        )}
        <div className="picker__grid">
          {list.map((l) => (
            <button key={l.id} type="button" className="picker__card" onClick={() => { onSelect(l.id); onClose(); }}>
              <span className="picker__avatar" style={{ background: l.color }} aria-hidden="true">{initials(l.name)}</span>
              <span className="picker__name">{l.name}</span>
            </button>
          ))}
          {list.length === 0 && <p className="picker__empty">No students match “{q}”.</p>}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement** — `src/NowPlaying.tsx`

```tsx
import { useState } from 'react';
import { getCurrentLearnerId, getLearner, initials, setCurrentLearnerId, markRecentlyActive } from './profiles';
import { StudentPicker } from './StudentPicker';

/** The persistent "Now playing: <child> ▾" control. Opens the picker; on select,
 *  sets the active learner and stamps recency. */
export function NowPlaying({ onChange }: { onChange?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState<string | null>(() => getCurrentLearnerId());
  const learner = getLearner(id);
  return (
    <div className="nowplaying">
      <button type="button" className="nowplaying__btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className="nowplaying__label">Now playing</span>
        {learner ? (
          <span className="nowplaying__who">
            <span className="nowplaying__avatar" style={{ background: learner.color }} aria-hidden="true">{initials(learner.name)}</span>
            {learner.name} <span aria-hidden="true">▾</span>
          </span>
        ) : <span className="nowplaying__who">Choose a student ▾</span>}
      </button>
      <StudentPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(sel) => { setCurrentLearnerId(sel); markRecentlyActive(sel); setId(sel); onChange?.(sel); }}
      />
    </div>
  );
}
```

- [ ] **Step 5: Mount `NowPlaying` in `src/Home.tsx`**

Import it (`import { NowPlaying } from './NowPlaying';`) and render `<NowPlaying onChange={...} />` near the top of the home content, wiring `onChange` to the app's `chooseLearner` if Home receives it (otherwise it manages its own current-learner state, which `App` reads via `getCurrentLearnerId`). Add minimal styles for `.nowplaying`, `.picker*` to `src/styles/theme.css` (reuse existing `.learner-chip` look).

- [ ] **Step 6: Run + gate + commit**

```bash
./node_modules/.bin/vitest run src/StudentPicker.test.tsx
./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run
git add src/StudentPicker.tsx src/NowPlaying.tsx src/StudentPicker.test.tsx src/Home.tsx src/styles/theme.css
git commit -m "feat(center): full-screen student picker + Now-playing bar"
```

---

## Task 12: In-game active-student chip + confirm-on-launch setting

**Files:**
- Modify: `src/GameScreen.tsx` (pass active learner name down)
- Modify: `src/worlds/space/SpaceSortGame.tsx` (render the chip in the HUD)
- Modify: `src/Home.tsx` (a "confirm student when a game starts" toggle, default off)
- Modify: `src/worlds/space/space.css` (chip style)

- [ ] **Step 1: Pass the learner name into the game**

In `src/GameScreen.tsx`, resolve the active learner name (`getLearner(learnerId)?.name`) and pass it as a `learnerName` prop into `SpacePlaySession` → `SpaceSortGame`. Add `learnerName?: string` to `SpaceSortGame`'s `Props`.

- [ ] **Step 2: Render the chip in the Space HUD**

In `src/worlds/space/SpaceSortGame.tsx`, inside `.sg-hud` (after the badge), add:

```tsx
{learnerName && <span className="sg-who" aria-label={`Playing as ${learnerName}`}>👤 {learnerName}</span>}
```

Add to `src/worlds/space/space.css`:

```css
.sg-who{ position:relative; z-index:3; font-size:12px; font-weight:700; color:#bfe9ef;
  background:rgba(10,34,46,.6); border:1px solid rgba(120,220,230,.35); border-radius:999px; padding:3px 10px; }
```

- [ ] **Step 3: Confirm-on-launch setting (default off)**

In `src/Home.tsx`, add a small toggle persisted to `localStorage` key `ll-confirm-student` (default `'0'`). When on, launching a game first shows a one-tap confirm of the active student (a lightweight overlay reusing `StudentPicker` or a simple confirm). Keep it off by default; the always-visible chip from Step 2 is the primary safeguard.

- [ ] **Step 4: Render test (chip shows)** — extend `src/worlds/space/SpaceSortGame.test.tsx`

Add an assertion that, given `learnerName="Mia"`, the HUD contains "Mia". Run:

Run: `./node_modules/.bin/vitest run src/worlds/space/SpaceSortGame.test.tsx`
Expected: PASS.

- [ ] **Step 5: Gate + commit**

```bash
./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run
git add src/GameScreen.tsx src/worlds/space/SpaceSortGame.tsx src/worlds/space/SpaceSortGame.test.tsx src/worlds/space/space.css src/Home.tsx
git commit -m "feat(center): in-game active-student chip + confirm-on-launch toggle"
```

---

## Task 13: Wire roster reconciliation + outbox flush on sign-in

**Files:**
- Modify: `src/Account.tsx` (call `reconcileRoster` + `flushOutbox` after auth changes)
- Modify: `src/main.tsx` (flush the outbox on app start)

- [ ] **Step 1: On auth change, reconcile + flush**

In `src/Account.tsx`, where `onAuthChange` fires, after refreshing the user also call:

```tsx
import { reconcileRoster } from './data/identity';
import { flushOutbox } from './data/cloudSync';
// inside the auth-change handler, when signed in:
void reconcileRoster().then(() => flushOutbox());
```

- [ ] **Step 2: Flush on startup**

In `src/main.tsx`, after rendering, add a guarded best-effort flush so queued writes from a prior offline session go up once the app loads online:

```tsx
import { flushOutbox } from './data/cloudSync';
void flushOutbox();
```

- [ ] **Step 3: Gate + commit**

```bash
./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run
git add src/Account.tsx src/main.tsx
git commit -m "feat(cloud): reconcile roster + flush outbox on sign-in and startup"
```

---

## Task 14: Final verification + operator notes

**Files:**
- Modify: `README.md` or `docs/` (add the SP1 operator steps)

- [ ] **Step 1: Full gate + build**

Run:
```bash
./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run && ./node_modules/.bin/vite build
```
Expected: tsc clean, eslint 0, all tests pass, build OK.

- [ ] **Step 2: Document operator steps**

Add a short "Cloud sync (SP1)" section to the project README noting: run the updated `supabase/schema.sql`; sign in via the Account screen on each device; the same student must exist once in the cloud (created at the center) and home devices pick them via the roster. Note SP2 (parents) is a follow-up.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: SP1 cloud-sync operator steps"
```

---

## Self-review (completed by plan author)

**Spec coverage (SP1 portion):**
- `skill_events` + integrity trigger → Task 1 ✓
- Event-sourced mastery + client compute (`masteryFromEvents`) → Task 2 ✓
- Durable outbox → Task 3 ✓
- Cloud event write/read wrappers → Task 4 ✓
- Event enqueue + flush + session via outbox → Tasks 5, 6 ✓
- Identity reconciliation (`cloudId`) → Task 7 ✓
- Cloud/local `dataSource` → Task 8 ✓
- Dashboards read cloud-or-local (ProfilePage, TutorDashboard) → Tasks 9, 10 ✓
- Center-friendly active-student picker + Now-playing + in-game chip + confirm toggle → Tasks 11, 12 ✓
- Flush/reconcile on sign-in + startup → Task 13 ✓
- Verification + operator docs → Task 14 ✓
- *(SP2 — guardians/invites/parent dashboard — intentionally deferred to its own plan.)*

**Known verification dependencies (resolve while implementing, not blockers):**
- *Resolved:* `profiles.ts` exports `addLearner(name)` (color auto-assigned, sets current). Task 7 Step 1 extends it to `addLearner(name, { color?, setCurrent? })` (backward-compatible); reconcile uses `setCurrent: false`. All test calls use `addLearner(name)`.
- Confirm `AreasToImprove`'s current internal data call before swapping to the `focus` prop (Task 9 Step 1).
- The `rankAreas` extraction (Task 9) is the preferred path; do it first so the ProfilePage effect is a one-liner.

**Placeholder scan:** No "TBD/TODO"; every code step has complete code or an exact, named edit. UI-styling steps (Task 11 Step 5, Task 12 Step 3) describe concrete keys/classes to add and reuse existing styles.

**Type consistency:** `SkillEvent {skillKey, correct, at}` used identically in Tasks 2, 5, 6, 8. `OutboxItem` fields consistent across Tasks 3, 5. `Learner.cloudId` added in Task 7 and consumed in Task 8/10/11. `getSessions`/`getMastery` signatures consistent (Tasks 8, 9, 10).
