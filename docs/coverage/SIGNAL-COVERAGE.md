# Signal Coverage — the "positions lacking" report

*Generated/verified by `src/signals/coverage.test.ts` (a brace-matched scan of the
real `logSkillEvent` call sites — it can't drift from the code). Re-run the gate to
refresh the finding.*

> A coverage gap is a **blind spot in the learner model**, never an un-monetized
> data field. Everything here is first-party, on-device-derivable, no PII — bounded
> by the Signal Coverage Engine's litmus test.

## What unlocks what

Signals that need **no enrichment** (always derivable from skillKey/correct/firstTry/at):
**learning curve · wheel-spinning · retention/forgetting**.

Signals gated on an enrichment field:
| Signal | Needs |
|---|---|
| automaticity-slope · rapid-guess · fatigue | `latencyMs` |
| confusion-graph | `chosen` |
| replay-reliance | `replays` |

## Current gaps (the finding)

1. **`latencyMs` is logged by only 2 games** (`tap-it-out`, `say-it-again`). The
   other ~18 — **including the fluency/speed games `warp-speed`, `giant-steps`,
   `tool-time`, `word-giants`** whose entire point is reading *speed* — don't log
   it. So **automaticity, fatigue, and rapid-guess are blind for almost the whole
   app.** Highest-value gap; the speed games are the most glaring (they measure the
   thing and throw it away). → task #126.
2. **`replays` reaches no cloud event (0 of 20).** Re-hears are tracked locally
   (`recordReplay` → mastery store) but never make it into `SkillEvent`, so
   **replay-reliance can't be derived from the cloud stream.** → task #126.
3. **`chosen` (confusion) is well-covered** — most games log it; the confusion
   graph works. Exceptions are where there's no meaningful wrong-choice
   (`tap-it-out` segmenting, `switch-it`).
4. **`dynamic`-game calls** (`space-sort`, `workshop-pick` use a `gameId` prop) are
   bucketed as `dynamic` by the scanner — fields are captured, per-game attribution
   isn't. Acceptable; noted.

## How it's enforced

- The scan **names every call's game** (fails if a `logSkillEvent` omits `game:`).
- A **regression guard** asserts the two games that *do* log `latencyMs` keep doing
  so (so we never lose the only automaticity sources we have).
- The gap counts are printed each run (`[signal-coverage] …`) and recorded here.
- As games are instrumented (task #126), the gap list shrinks — re-run to confirm.

## To close (task #126)

Add `latencyMs` to the per-item `logSkillEvent` of the **fluency/speed games first**
(`warp-speed`, `giant-steps`, `tool-time`, `word-giants` — a "shown-at" timestamp
ref + `Date.now() - shownAt`, exactly like `tap-it-out`/`say-it-again`), then the
rest. Add `replays` to the event payload where games already track re-hears. Each
instrumented game immediately unlocks automaticity + fatigue + rapid-guess for its
skills, with zero new *kinds* of data — just recording timing we already have.
