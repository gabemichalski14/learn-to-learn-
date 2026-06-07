import type { CSSProperties } from 'react';
import { navigate } from './router';
import { LEVELS } from './games';
import type { GameInfo } from './games';

interface Entry {
  game: GameInfo;
  levelNum: number;
}

function Tile({ entry }: { entry: Entry }) {
  const { game, levelNum } = entry;
  const available = game.status === 'available';
  return (
    <button
      type="button"
      className={`l2l-card l2l-card--interactive tile${available ? '' : ' tile--soon'}`}
      onClick={() => available && game.route && navigate(game.route)}
      disabled={!available}
      aria-label={available ? `Play ${game.title}` : `${game.title} — coming soon`}
    >
      <span className="l2l-badge tile__emoji" aria-hidden="true">{game.emoji}</span>
      <span className="tile__title">{game.title}</span>
      <span className="tile__tagline">{game.tagline}</span>
      <span className="tile__foot">
        <button
          type="button"
          className="tile__ref tile__ref--link"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`#/level/${levelNum}`);
          }}
        >
          Level {levelNum}
        </button>
        <span className={`tile__badge${available ? ' tile__badge--go' : ''}`}>
          {available ? 'Play ▸' : 'Soon'}
        </span>
      </span>
    </button>
  );
}

/** All games across every level, grouped into ready-to-play and coming-soon. */
export function GamesPage() {
  const all: Entry[] = LEVELS.flatMap((lvl) => lvl.games.map((game) => ({ game, levelNum: lvl.num })));
  const ready = all.filter((e) => e.game.status === 'available');
  const soon = all.filter((e) => e.game.status !== 'available');

  return (
    <main className="l2l-page">
      <button type="button" className="l2l-back" onClick={() => navigate('#/')}>← Home</button>

      <div className="l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
        <p className="l2l-eyebrow">Catalogue</p>
        <h1 className="l2l-display">All <em>games</em></h1>
        <p className="l2l-lead">Every game on the platform. Each one practises a specific skill from its level — the tagline always says which.</p>
      </div>

      <section className="l2l-reveal" style={{ marginTop: '28px', '--i': 1 } as CSSProperties} aria-labelledby="ready-h">
        <h2 id="ready-h" className="l2l-h2" style={{ marginBottom: '16px' }}>Ready to play · {ready.length}</h2>
        {ready.length === 0 ? (
          <p className="page__note" style={{ marginTop: 0 }}>No games are live yet — check back soon.</p>
        ) : (
          <div className="tile-grid">
            {ready.map((e) => <Tile key={e.game.id} entry={e} />)}
          </div>
        )}
      </section>

      <section className="l2l-reveal" style={{ marginTop: '28px', '--i': 2 } as CSSProperties} aria-labelledby="soon-h">
        <h2 id="soon-h" className="l2l-h2" style={{ marginBottom: '16px' }}>Coming soon · {soon.length}</h2>
        <div className="tile-grid">
          {soon.map((e) => <Tile key={e.game.id} entry={e} />)}
        </div>
      </section>
    </main>
  );
}
