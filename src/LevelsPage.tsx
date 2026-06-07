import type { CSSProperties } from 'react';
import { navigate } from './router';
import { LEVELS, availableCount } from './games';
import { levelCurriculum } from './curriculum';
import { LevelEmblem } from './LevelEmblem';

/** Which levels have an immersive themed "world" (full-card treatment). */
const WORLD: Record<number, 'space' | 'garden'> = { 1: 'garden', 2: 'space' };

/** Fixed star field for the themed Level 2 card (top%, left%). */
const SPACE_STARS: Array<[number, number]> = [
  [14, 10], [22, 78], [34, 30], [12, 52], [60, 16], [72, 64], [48, 86], [82, 38], [28, 92], [66, 44], [88, 12], [40, 60],
];

function footText(num: number, games: number): string {
  const cur = levelCurriculum(num);
  const lessons = cur?.lessons.length ?? 0;
  const lessonStr = lessons > 0 ? `${lessons} lesson${lessons === 1 ? '' : 's'}${cur?.partial ? '+' : ''}` : 'Curriculum pending';
  return games > 0 ? `${lessonStr} · ${games} game${games === 1 ? '' : 's'} ▸` : lessonStr;
}

/** Index of all 10 structured-literacy levels. Themed levels (Level 2 = Space Patrol) render
 *  as a fully themed, animated card; the rest use the brand standard card. */
export function LevelsPage() {
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
          const games = availableCount(lvl);
          const ready = games > 0;
          const foot = footText(lvl.num, games);
          const style = { '--i': idx + 1 } as CSSProperties;

          if (WORLD[lvl.num] === 'space') {
            return (
              <button key={lvl.num} type="button" className="lvl-card lvl-card--space l2l-reveal" style={style} onClick={() => navigate(`#/level/${lvl.num}`)} aria-label={`Level ${lvl.num}: ${lvl.title}`}>
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
                <span className="lvl-card__body">
                  <span className="lvl-card__num">Level {lvl.num} · Space Patrol</span>
                  <span className="lvl-card__title">{lvl.title}</span>
                  <span className="lvl-card__focus">{lvl.focus}</span>
                  <span className="lvl-card__foot">{foot}</span>
                </span>
              </button>
            );
          }

          if (WORLD[lvl.num] === 'garden') {
            return (
              <button key={lvl.num} type="button" className="lvl-card lvl-card--garden l2l-reveal" style={style} onClick={() => navigate(`#/level/${lvl.num}`)} aria-label={`Level ${lvl.num}: ${lvl.title}`}>
                <span className="lvl-garden" aria-hidden="true">
                  <span className="lvl-garden__sun" />
                  <span className="lvl-garden__hill" />
                  <span className="lvl-garden__sprout">🌱</span>
                  <span className="lvl-garden__sprout lvl-garden__sprout--2">🌿</span>
                  <span className="lvl-garden__sprout lvl-garden__sprout--3">🌸</span>
                </span>
                <span className="lvl-card__body">
                  <span className="lvl-card__num">Level {lvl.num} · Sound Garden</span>
                  <span className="lvl-card__title">{lvl.title}</span>
                  <span className="lvl-card__focus">{lvl.focus}</span>
                  <span className="lvl-card__foot">{foot}</span>
                </span>
              </button>
            );
          }

          return (
            <button key={lvl.num} type="button" className={`lvl-card lvl-card--std${ready ? ' is-ready' : ''} l2l-reveal`} style={style} onClick={() => navigate(`#/level/${lvl.num}`)} aria-label={`Level ${lvl.num}: ${lvl.title}`}>
              <LevelEmblem level={lvl.num} />
              <span className="lvl-card__num">Level {lvl.num}</span>
              <span className="lvl-card__title">{lvl.title}</span>
              <span className="lvl-card__focus">{lvl.focus}</span>
              <span className="lvl-card__foot">{foot}</span>
            </button>
          );
        })}
      </div>
      <p className="levels-note">Lesson titles and rules are captured directly from the books; Levels 8–10 fill in as their books are added.</p>
    </main>
  );
}
