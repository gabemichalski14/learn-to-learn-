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
      className={`tile${available ? '' : ' tile--soon'}`}
      onClick={() => available && game.route && navigate(game.route)}
      disabled={!available}
      aria-label={available ? `Play ${game.title}` : `${game.title} — coming soon`}
    >
      <span className="tile__emoji" aria-hidden="true">{game.emoji}</span>
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
    <main className="site site--page">
      <button type="button" className="back-btn" onClick={() => navigate('#/')}>← Home</button>
      <h1 className="site__title">Games</h1>
      <p className="page__lead">Every game on the platform. Each one practises a specific skill from its level — the tagline always says which.</p>

      <section className="site__section" aria-labelledby="ready-h">
        <h2 id="ready-h" className="site__h2">Ready to play · {ready.length}</h2>
        {ready.length === 0 ? (
          <p className="page__note" style={{ marginTop: 0 }}>No games are live yet — check back soon.</p>
        ) : (
          <div className="tile-grid">
            {ready.map((e) => <Tile key={e.game.id} entry={e} />)}
          </div>
        )}
      </section>

      <section className="site__section" aria-labelledby="soon-h">
        <h2 id="soon-h" className="site__h2">Coming soon · {soon.length}</h2>
        <div className="tile-grid">
          {soon.map((e) => <Tile key={e.game.id} entry={e} />)}
        </div>
      </section>
    </main>
  );
}
