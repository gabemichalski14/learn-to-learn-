import { useState, type CSSProperties, type ReactNode } from 'react';
import { navigate } from './router';
import { LEVELS, availableCount } from './games';
import { isLevelUnlocked, isLevelReady } from './mastery/levelGate';
import { useRole } from './useAuth';
import { useDataVersion } from './data/store';
import { LevelEmblem } from './LevelEmblem';

/** Which levels have an immersive themed "world" (full-card treatment). */
const WORLD: Record<number, 'space' | 'garden'> = { 1: 'garden', 2: 'space' };

/** Each level is its own themed WORLD — original names (no program's scope &
 *  sequence titles), so the level NAME is creative expression, not a transcribed
 *  curriculum heading. The academic skill rides along as a subtitle. */
const WORLD_NAME: Record<number, string> = {
  1: 'Sound Garden', 2: 'Space Patrol', 3: "Patch's Workshop", 4: "Giant's Valley",
  5: 'Tinker Town', 6: 'Whisper Woods', 7: 'Pirate Cove', 8: 'Tidepool Bay',
  9: 'Globe Harbor', 10: 'Root Ruins',
};
/** Per-world accent — themes each card (icon badge, skill label, glow) until its
 *  full painted background lands (see docs/art/LEVEL-ICONS-MANIFEST.md). */
const WORLD_ACCENT: Record<number, string> = {
  1: '#5aa06f', 2: '#22c1d6', 3: '#c8893e', 4: '#7a9e6b', 5: '#d98a3d',
  6: '#8a7bc0', 7: '#2f8aa8', 8: '#3fb5a0', 9: '#5b86c4', 10: '#b87a55',
};

/** Fixed star field for the themed Level 2 card (top%, left%). */
const SPACE_STARS: Array<[number, number]> = [
  [14, 10], [22, 78], [34, 30], [12, 52], [60, 16], [72, 64], [48, 86], [82, 38], [28, 92], [66, 44], [88, 12], [40, 60],
];

/** A teasing one-liner for a still-locked level — enough to spark curiosity (the
 *  "what's in there?" pull) without giving the lesson away. Original flavor text. */
const LEVEL_TEASER: Record<number, string> = {
  3: 'A hush of little cabins, every door latched tight. Who lives behind them?',
  4: 'The path forks at the big hill — two secret ways into longer words.',
  5: 'A friendly train that grows new cars at the front… and the back.',
  6: 'A quiet little e, hiding six secrets. Shh — can you find them all?',
  7: 'A crowned R who bosses every vowel it meets. Fancy meeting them?',
  8: 'Two vowels team up to make one brand-new sound. Who joins forces?',
  9: 'Words that sailed in from faraway lands, with curious spellings.',
  10: 'Giant words, built brick by brick from ancient roots.',
};

function footText(_num: number, games: number): string {
  // We surface our OWN games count only — not a transcribed lesson breakdown.
  return games > 0 ? `${games} game${games === 1 ? '' : 's'} ▸` : 'Coming soon';
}

function SpaceVisual() {
  return (
    <span className="lvl-space" aria-hidden="true">
      {SPACE_STARS.map(([t, l], i) => (
        <i key={i} style={{ top: `${t}%`, left: `${l}%`, animationDelay: `${(i % 5) * 0.5}s` } as CSSProperties} />
      ))}
      <span className="lvl-space__planet" />
      <span className="lvl-space__rocket">
        <svg viewBox="0 0 36 36" width="34" height="34">
          <path d="M25 6 q3 0 3 6 v8 h-6 v-8 q0-6 3-6z" fill="#eaf6f8" />
          <circle cx="25" cy="13" r="1.8" fill="#2b6f8a" />
          <path d="M22 20 l-3 5 3 -1 z" fill="#22c1d6" />
          <path d="M28 20 l3 5 -3 -1 z" fill="#22c1d6" />
          <path d="M23 20 h4 l-2 6 z" className="lvl-space__flame" fill="#ffb24a" />
        </svg>
      </span>
    </span>
  );
}

function GardenVisual() {
  return (
    <span className="lvl-garden" aria-hidden="true">
      <span className="lvl-garden__sun" />
      <span className="lvl-garden__hill" />
      <span className="lvl-garden__sprout">🌱</span>
      <span className="lvl-garden__sprout lvl-garden__sprout--2">🌿</span>
      <span className="lvl-garden__sprout lvl-garden__sprout--3">🌸</span>
    </span>
  );
}

/** Index of all 10 levels. Each keeps its own themed world even when locked — a
 *  veiled, "sleeping" version with a teaser, so the child *wants* to wake it. */
export function LevelsPage({ learnerId }: { learnerId: string }) {
  useDataVersion(); // re-check unlocks when mastery changes
  const isOwner = useRole() === 'owner'; // admin sees every level open (preview/manage)
  const firstLocked = isOwner ? Infinity : (LEVELS.find((l) => !isLevelUnlocked(learnerId, l.num))?.num ?? Infinity);
  // pressing a locked card "knocks" — a friendly shake + a why-it's-locked bubble
  const [knocked, setKnocked] = useState<number | null>(null);
  function knock(num: number) {
    setKnocked(num);
    window.setTimeout(() => setKnocked((k) => (k === num ? null : k)), 2600);
  }

  return (
    <main className="l2l-page">
      <button type="button" className="l2l-back" onClick={() => navigate('#/')}>← Home</button>
      <header className="levels-head l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
        <p className="l2l-eyebrow">The curriculum</p>
        <h1 className="l2l-display">Ten levels, one <em>journey</em>.</h1>
        <p className="l2l-lead">A structured-literacy scope &amp; sequence — from hearing sounds to spelling multisyllable words. Each level becomes its own themed world as it opens.</p>
      </header>

      <div className="levels-grid">
        {LEVELS.map((lvl, idx) => {
          const num = lvl.num;
          const games = availableCount(lvl);
          const ready = games > 0;
          const unlocked = isOwner || isLevelUnlocked(learnerId, num);
          const nextUp = !unlocked && num === firstLocked; // the immediate goal
          const prereq = num - 1;
          const prereqReady = isLevelReady(learnerId, prereq);
          const world = WORLD[num];
          const worldName = WORLD_NAME[num] ?? lvl.title;
          const style = { '--i': idx + 1, '--lvl-accent': WORLD_ACCENT[num] ?? '#5aa06f' } as CSSProperties;

          const themeClass = world === 'space' ? 'lvl-card--space'
            : world === 'garden' ? 'lvl-card--garden'
            : `lvl-card--std${ready ? ' is-ready' : ''}`;
          const visual: ReactNode = world === 'space' ? <SpaceVisual />
            : world === 'garden' ? <GardenVisual />
            : <LevelEmblem level={num} />;
          const bodyWrap = world === 'space' || world === 'garden';
          const numLabel = `Level ${num}`;

          const foot = unlocked
            ? footText(num, games)
            : nextUp
              ? (prereqReady ? `✨ Pass the Level ${prereq} Checkpoint to open` : `Almost there — finish Level ${prereq}`)
              : `Opens after Level ${prereq}`;

          const bodyKids = (
            <>
              <span className="lvl-card__num">{numLabel}</span>
              <span className="lvl-card__title">{worldName}</span>
              <span className="lvl-card__skill">{lvl.title}</span>
              <span className="lvl-card__focus">{unlocked ? lvl.focus : (LEVEL_TEASER[num] ?? lvl.focus)}</span>
              <span className="lvl-card__foot">{foot}</span>
            </>
          );
          const body = bodyWrap ? <span className="lvl-card__body">{bodyKids}</span> : bodyKids;
          const cls = `lvl-card ${themeClass}${!unlocked ? ' lvl-card--veiled' : ''}${nextUp ? ' lvl-card--nextup' : ''} l2l-reveal`;

          if (unlocked) {
            return (
              <button key={num} type="button" className={cls} style={style} onClick={() => navigate(`#/level/${num}`)} aria-label={`Level ${num}: ${lvl.title}`}>
                {visual}{body}
              </button>
            );
          }

          // Locked cards are tappable — pressing them says (kindly) WHY they're
          // locked: a gentle shake + a bubble, instead of silently doing nothing
          // or whisking you away.
          const knockedNow = knocked === num;
          const knockMsg = nextUp
            ? (prereqReady ? `🔒 Almost! Pass the Level ${prereq} Checkpoint to open me.` : `🔒 Almost there — keep practising Level ${prereq} to open me.`)
            : `🔒 Finish Level ${prereq} first to open me.`;
          return (
            <button
              key={num}
              type="button"
              className={`${cls}${knockedNow ? ' lvl-card--knock' : ''}`}
              style={style}
              onClick={() => knock(num)}
              aria-label={`Level ${num}: ${lvl.title} — locked. ${knockMsg.replace('🔒 ', '')}`}
            >
              {visual}{body}
              <span className="lvl-veil" aria-hidden="true"><span className="lvl-veil__badge">{nextUp ? '✨' : '🔒'}</span></span>
              {knockedNow && <span className="lvl-knock" role="status">{knockMsg}</span>}
            </button>
          );
        })}
      </div>
      <p className="levels-note">Lesson titles and rules are captured directly from the books; Levels 8–10 fill in as their books are added.</p>
    </main>
  );
}
