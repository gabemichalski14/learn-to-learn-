# Build Moss in Rive — the complete guide (who he is + every step)

This is everything you need to create Moss: his full character (from all our
research) and the exact Rive editor steps to build, rig, and export him so he
drops straight into the game via our contract (`docs/art/authoring-contract.md`).

**Golden rule:** do a rough, ugly-but-valid pass first (Part 4 "Minimum viable
Moss") so we prove the pipeline; then return and polish (Part 5). Don't perfect
the art before the pipeline is confirmed.

---

## PART 1 — Who Moss *is* (the being)

Moss is the friend you meet on Level 2. Everything about him is built from our
research (dyslexia-as-strength, character craft, the cozy/no-shame loop) so he
*pulls heartstrings* and models the learner's own mind.

### Essence (one line)
A tiny garden-sprout spirit who drifted into the cold dark of space and *came
apart* — and who learns, with your help, that he was never broken, just scattered.

### The arc spine (want / need / flaw — the engine of a character we follow)
- **Want (surface):** find his lost hum (the **/m/** sound) and go home.
- **Need (deep):** to believe he *wasn't broken — just lost*, and that the right
  friend + the right way make him whole.
- **Flaw (gets in his own way):** he blames himself, hides in the dark, is sure
  he's "broken."
- **Growth:** self-blame → helped without judgment → *"I wasn't broken, I was
  just waiting for you"* → whole → goes home (and later welcomes the next lost one).

### His dyslexic strength (difference, NOT deficit)
Moss has a **spatial gift**: he always *knows where a sound belongs*, even in the
dark — but the **little pieces inside words slip away from him** (the dyslexia
parallel). So in the game you're a **team**: *you* catch the slippery sound, *he*
knows where it goes. This is the whole point — he reflects the learner's mind and
says, without saying it, "your way of thinking is a gift."

### Personality & voice
Shy, gentle, earnest, quietly funny, never babyish (he must charm a 5-year-old
**and** a 40-year-old). Warm, no-shame, growth-minded. Catchphrase energy:
"*mmm*" (his hum). Misses are met with kindness ("the little ones are slippery —
they were for me too"); wins with wonder ("you hear it too, don't you?").

### Expression trait (how he shows feeling — show, don't tell)
Curls up / dims when unsure; **glows and hums** when a sound clicks home; leans/
points when he "knows where this goes." His body language carries the emotion
faster than any line.

### Do / Don't
- ✅ endearing, soft, hopeful, a little vulnerable; readable at a glance.
- ❌ not cutesy-baby, not sad-sack/pitiable, not hyperactive. Calm, cozy, kind.

---

## PART 2 — Visual design language (draw him cohesive)

Keep him consistent with Pip & Echo's world (cozy "characterful-flat"; see
DESIGN.md Road B).

- **Silhouette (must read tiny):** a small rounded **sprout-body** (a soft
  bean/drop shape), **one curling leaf** sprouting from his head, **one or two
  big soft eyes**. Distinct enough to recognize at 48px.
- **Palette:** *whole* = warm spring green body (#5fae6d-ish), gold-cream belly,
  a soft golden glow; *scattered* = desaturated grey-green, translucent.
- **Shape language:** all rounded corners, no sharp points (kindchenschema =
  trustworthy/safe). Thick soft outline or none; gentle gradients.
- **Construction (keep parts separate for animation):** Body · Leaf · Eye(s) ·
  Belly/cheek-glow · (optional) tiny arms/feet · a soft "glow" ellipse behind him.
- **Sizes:** designed to look good **48px → 160px** (hub chip → in-game hero).

---

## PART 3 — The two things Rive must do (our contract)

1. **Transform with `heal`** (a Number 0→100): grey/curled/faint/small → full
   colour/upright/glowing/whole. This is the "character is the progress."
2. **React with mood** (Triggers): **`cheer`** (a hum comes home), **`wobble`**
   (a gentle miss, no shame), **`point`** (his "I know where this goes" gift),
   **`bloom`** (completion). Plus a default **idle** loop.

Artboard name **`Moss`**, State Machine name **`Moss`**, inputs exactly:
`heal` (Number, 0), `cheer` `wobble` `point` `bloom` (Triggers). Export to
`src/assets/moss.riv`.

---

## PART 4 — Rive build, step by step (MINIMUM VIABLE MOSS first)

> Goal of this pass: a valid `.riv` that transforms with `heal` and has at least
> `cheer` + `wobble`. Ugly is fine. ~30–45 min.

### Step 0 — New file & artboard
1. rive.app → **New File**.
2. Select the **Artboard** tool, draw an artboard; in the **Inspector** (right)
   rename it **`Moss`**; set size ~**512×512** (square, scales fine).

### Step 1 — Draw Moss (Design mode)
1. **Body:** Ellipse tool → a soft rounded body; set a green **Fill** in the
   Inspector. In the **Hierarchy** (left) rename the shape **`Body`**.
2. **Leaf:** Pen/Ellipse → a small curling leaf on top; rename **`Leaf`**.
3. **Eye(s):** small dark ellipse(s) + a white highlight dot; rename **`Eye`**.
4. **Glow:** a pale ellipse *behind* Body (drag it below in the hierarchy);
   rename **`Glow`**; lower its opacity.
5. Select all → **group** (⌘/Ctrl+G) → rename the group **`Moss`**. Center it on
   the artboard. (Tip: keep parts as separate shapes so you can animate them.)

### Step 2 — Create the two transformation timelines (Animate mode)
Switch to **Animate** mode (top toggle). You'll make two timelines that the
blend will mix.

1. In the **Animations** panel click **+ → Timeline**, name it **`Scattered`**.
   - With the playhead at frame 0, set Moss's *scattered* look: drag the **Glow**
     opacity near 0; set **Body** fill toward grey (or lower the group opacity to
     ~50%); **scale the `Moss` group down** to ~0.8; rotate/curl the **Leaf**
     inward; maybe nudge the eye to a sleepy half-shape. (Changing a property in
     Animate mode auto-creates a keyframe.)
2. **+ → Timeline**, name it **`Whole`**.
   - Set the *whole* look: full green **Body** fill, **Glow** opacity high, group
     **scale 1.0**, **Leaf** open/up, eye bright. (One keyframe at frame 0 is
     enough — a blend just needs the end pose.)

*(Each of these can be a single-frame "pose"; the blend interpolates between them.)*

### Step 3 — Idle + reaction timelines
1. **`Idle`** timeline: a gentle 2–3s **loop** — small up/down bob of the `Moss`
   group (scale-Y squash or position-Y). Set it to **Loop** in the timeline
   options.
2. **`Cheer`** timeline (~0.5s, one-shot): a quick scale-up pop + the Glow
   flashes brighter, then settles.
3. **`Wobble`** timeline (~0.5s, one-shot): a soft left-right rotation of the
   group that returns to 0 (gentle, not violent).
4. *(polish later)* **`Point`**: lean toward one side + leaf points. **`Bloom`**:
   big celebratory scale + glow burst.

### Step 4 — Inputs (the contract)
1. **+ → State Machine**, name it **`Moss`**. Open it.
2. In the **Inputs** panel, click **+**:
   - **Number** named **`heal`** (default **0**).
   - **Trigger** named **`cheer`**.
   - **Trigger** named **`wobble`**.
   - *(later)* Triggers **`point`**, **`bloom`**.

### Step 5 — Layer 1: the heal blend (continuous transform)
1. In the State Machine graph, the default layer = **Layer 1**.
2. Right-click the graph → add a **1D Blend State** (or add a Blend State from the
   toolbar). Connect **Entry → Blend**.
3. Select the Blend State; in the **Inspector**:
   - Set the **input** dropdown to **`heal`**.
   - Set the **range** to **0–100**.
   - Click **+** to add timelines: add **`Scattered`** at value **0** and
     **`Whole`** at value **100**.
   - Now dragging `heal` 0→100 morphs Scattered→Whole. ✅ (That's the whole
     "character is the progress.")

### Step 6 — Layer 2: mood reactions (one-shots over the blend)
1. Click the **+** at the top of the State Machine graph to add **Layer 2**.
2. Add the **`Idle`** state; connect **Entry → Idle** (the resting state).
3. Add **`Cheer`** and **`Wobble`** states.
4. Transitions:
   - **Idle → Cheer**: condition **`cheer` (trigger)**. **Cheer → Idle**: on
     "exit time"/animation end (no condition, or duration).
   - **Idle → Wobble**: condition **`wobble`**. **Wobble → Idle**: on end.
   - (Triggers auto-reset, so each fire plays the one-shot once and returns to
     Idle. Idle keeps looping underneath.)

### Step 7 — Test in the editor
1. Hit **Play** on the State Machine.
2. Drag the **`heal`** slider 0→100 — Moss should transform grey→whole.
3. Fire **`cheer`** / **`wobble`** — he should pop / wobble then return to idle.
4. Fix anything that looks off.

### Step 8 — Export
1. In the Rive **file browser**, **right-click the file → Export** (choose the
   **.riv** runtime file).
2. Save it as **`moss.riv`** and put it in the repo at **`src/assets/moss.riv`**.
3. Tell me the filename + confirm the artboard is `Moss`, state machine `Moss`,
   inputs `heal`/`cheer`/`wobble`(/`point`/`bloom`). I add the runtime + render it.

---

## PART 5 — Polish pass (after the pipeline is proven)

- Add **`point`** + **`bloom`** triggers/states.
- Make 4 distinct blend stops (`Scattered`@0, partial@33, partial@66, `Whole`@100)
  for richer stages.
- **Bones/rig** the leaf + body for squash-and-stretch life (Animate → add Bones,
  bind shapes) — optional but makes him feel alive.
- Eye blinks; a subtle floating idle; the glow pulsing with his hum.
- Mouth shape for `talking` (optional Boolean) to sync with audio later.

---

## PART 6 — Handoff checklist (so it just works)

- [ ] Artboard named **`Moss`**, ~square, content centered.
- [ ] State machine named **`Moss`**.
- [ ] Input **`heal`** = Number, range 0–100, drives a visible grey→whole change.
- [ ] Triggers **`cheer`** + **`wobble`** (min) play one-shots and return to idle.
- [ ] Looks OK at 48px and 160px.
- [ ] Exported **`.riv`** → `src/assets/moss.riv`.
- [ ] Commercial-safe (your own art / CC0 — no traced copyrighted characters).

Send me the `.riv` (or just confirm it's committed) and I'll wire the
`RiveAvatar`, feed it `heal` (your journey-home progress) + fire the mood
triggers, and Moss becomes the animated star of "Bring Moss Home."

Refs: [Rive states/blend](https://help.rive.app/editor/state-machine/states) ·
[Rive inputs](https://help.rive.app/editor/state-machine/inputs) ·
[Rive export](https://github.com/rive-app/help-center/blob/master/editor/exporting.md) ·
[React runtime](https://rive.app/docs/runtimes/react/parameters-and-return-values)
