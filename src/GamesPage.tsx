import type { CSSProperties } from 'react';
import { navigate } from './router';
import { LEVELS } from './games';
import type { GameInfo } from './games';

/** Levels with an immersive themed "world" — their game tiles match that theme. */
const WORLD: Record<number, 'space'> = { 2: 'space' };
const TILE_STARS: Array<[number, number]> = [[16, 12], [30, 82], [60, 24], [74, 66], [46, 90], [12, 54], [84, 40]];

function Tile({ game, levelNum }: { game: GameInfo; levelNum: number }) {
  const available = game.status === 'available';
  const space = WORLD[levelNum] === 'space';
  // Available → play the game; coming-soon → open its level so you can still explore it.
  const go = () => navigate(available && game.route ? game.route : `#/level/${levelNum}`);
  return (
    <button
      type="button"
      className={`l2l-card l2l-card--interactive tile${available ? '' : ' tile--soon'}${space ? ' tile--space' : ''}`}
      onClick={go}
      aria-label={available ? `Play ${game.title}` : `${game.title} — coming soon, Level ${levelNum}`}
    >
      {space && (
        <span className="tile-space" aria-hidden="true">
          {TILE_STARS.map(([t, l], i) => (
            <i key={i} style={{ top: `${t}%`, left: `${l}%`, animationDelay: `${(i % 4) * 0.5}s` } as CSSProperties} />
          ))}
        </span>
      )}
      <span className={`l2l-badge tile__emoji${space ? ' tile__emoji--space' : ''}`} aria-hidden="true">{game.emoji}</span>
      <span className="tile__title">{game.title}</span>
      <span className="tile__tagline">{game.tagline}</span>
      <span className="tile__foot">
        <span className="tile__ref">Level {levelNum}</span>
        <span className={`tile__badge${available ? ' tile__badge--go' : ''}`}>{available ? 'Play ▸' : 'Soon'}</span>
      </span>
    </button>
  );
}

/** All games across every level, grouped into ready-to-play and coming-soon. */
export function GamesPage() {
  const all = LEVELS.flatMap((lvl) => lvl.games.map((game) => ({ game, levelNum: lvl.num })));
  const ready = all.filter((e) => e.game.status === 'available');
  const soon = all.filter((e) => e.game.status !== 'available');

  return (
    <main className="l2l-page">
      <button type="button" className="l2l-back" onClick={() => navigate('#/')}>← Home</button>

      <div className="l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
        <p className="l2l-eyebrow">Catalogue</p>
        <h1 className="l2l-display">All <em>games</em></h1>
        <p className="l2l-lead">Every game on the platform. Each one practises a specific skill from its level — the tagline always says which, and each game wears its level's theme.</p>
      </div>

      <section className="l2l-reveal" style={{ marginTop: '28px', '--i': 1 } as CSSProperties} aria-labelledby="ready-h">
        <h2 id="ready-h" className="l2l-h2" style={{ marginBottom: '16px' }}>Ready to play · {ready.length}</h2>
        {ready.length === 0 ? (
          <p className="levels-note" style={{ marginTop: 0 }}>No games are live yet — check back soon.</p>
        ) : (
          <div className="tile-grid">
            {ready.map((e) => <Tile key={e.game.id} game={e.game} levelNum={e.levelNum} />)}
          </div>
        )}
      </section>

      <section className="l2l-reveal" style={{ marginTop: '28px', '--i': 2 } as CSSProperties} aria-labelledby="soon-h">
        <h2 id="soon-h" className="l2l-h2" style={{ marginBottom: '16px' }}>Coming soon · {soon.length}</h2>
        <div className="tile-grid">
          {soon.map((e) => <Tile key={e.game.id} game={e.game} levelNum={e.levelNum} />)}
        </div>
      </section>
    </main>
  );
}
