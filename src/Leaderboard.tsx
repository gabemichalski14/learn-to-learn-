import type { CSSProperties } from 'react';
import { navigate } from './router';
import { loadProgress, formatTime } from './progress';
import { ACHIEVEMENTS } from './achievements';
import { loadLearners, initials } from './profiles';
import type { Learner } from './profiles';

const MEDALS = ['🥇', '🥈', '🥉'];

interface Entry {
  learner: Learner;
  value: string;
  sortKey: number;
}

function Board({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <div className="board">
      <h3 className="board__title">{title}</h3>
      {entries.length === 0 ? (
        <p className="board__empty">No data yet.</p>
      ) : (
        <ol className="board__list">
          {entries.map((e, i) => (
            <li key={e.learner.id} className="lb-row">
              <span className="lb-row__rank">{MEDALS[i] ?? i + 1}</span>
              <span className="lb-row__avatar" style={{ background: e.learner.color }} aria-hidden="true">
                {initials(e.learner.name)}
              </span>
              <span className="lb-row__name">{e.learner.name}</span>
              <span className="lb-row__value">{e.value}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/**
 * A local leaderboard across the students on this device — a working preview of
 * the eventual center-wide board (which needs a backend + shared accounts).
 */
export function Leaderboard() {
  const learners = loadLearners();
  const rows = learners.map((l) => ({ learner: l, p: loadProgress(l.id) }));

  const stickers: Entry[] = [...rows]
    .map((r) => ({ learner: r.learner, sortKey: new Set(r.p.earned).size, value: `${new Set(r.p.earned).size}/${ACHIEVEMENTS.length}` }))
    .filter((e) => e.sortKey > 0)
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 5);

  const fastest: Entry[] = [...rows]
    .filter((r) => r.p.bestMs != null)
    .map((r) => ({ learner: r.learner, sortKey: r.p.bestMs as number, value: formatTime(r.p.bestMs as number) }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(0, 5);

  const sessions: Entry[] = [...rows]
    .map((r) => ({ learner: r.learner, sortKey: r.p.sessions, value: String(r.p.sessions) }))
    .filter((e) => e.sortKey > 0)
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 5);

  return (
    <main className="l2l-page">
      <button type="button" className="l2l-back" onClick={() => navigate('#/')}>← Home</button>

      <div className="l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
        <p className="l2l-eyebrow">Rankings</p>
        <h1 className="l2l-display">Friendly <em>standings</em></h1>
        <p className="l2l-lead">
          Friendly competition across the players on this device. Center-wide leaderboards (across
          every student at the center) arrive once accounts are added.
        </p>
      </div>

      <div className="l2l-reveal" style={{ '--i': 1 } as CSSProperties}>
        {learners.length < 2 ? (
          <div className="l2l-card" style={{ marginTop: '24px' }}>
            <p>Add more players from the home screen to compare stickers and times!</p>
          </div>
        ) : (
          <div className="l2l-card" style={{ marginTop: '24px' }}>
            <div className="board-grid">
              <Board title="🌟 Most stickers" entries={stickers} />
              <Board title="⚡ Fastest finish" entries={fastest} />
              <Board title="🎮 Most games" entries={sessions} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
