import { navigate } from './router';
import { findLevel } from './games';

/** Sub-menu for one Barton level: its games (placeholders + any built game). */
export function LevelPage({ level }: { level: number }) {
  const lvl = findLevel(level);

  if (!lvl) {
    return (
      <main className="site site--page">
        <button type="button" className="back-btn" onClick={() => navigate('#/')}>← Home</button>
        <h1 className="site__title">Level not found</h1>
      </main>
    );
  }

  return (
    <main className="site site--page">
      <button type="button" className="back-btn" onClick={() => navigate('#/')}>← Home</button>
      <p className="level-page__eyebrow">Level {lvl.num}</p>
      <h1 className="site__title">{lvl.title}</h1>
      <p className="page__lead">{lvl.focus}</p>

      <div className="tile-grid">
        {lvl.games.map((g) => {
          const available = g.status === 'available';
          return (
            <button
              key={g.id}
              type="button"
              className={`tile${available ? '' : ' tile--soon'}`}
              onClick={() => available && g.route && navigate(g.route)}
              disabled={!available}
              aria-label={available ? `Play ${g.title}` : `${g.title} — coming soon`}
            >
              <span className="tile__emoji" aria-hidden="true">{g.emoji}</span>
              <span className="tile__title">{g.title}</span>
              <span className="tile__tagline">{g.tagline}</span>
              <span className="tile__foot">
                <span className="tile__ref">Level {lvl.num}</span>
                <span className={`tile__badge${available ? ' tile__badge--go' : ''}`}>
                  {available ? 'Play ▸' : 'Soon'}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
