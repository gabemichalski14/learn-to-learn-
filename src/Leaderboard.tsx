import { useState, type CSSProperties } from 'react';
import { navigate } from './router';
import { loadProgress, formatTime } from './progress';
import { ACHIEVEMENTS } from './achievements';
import { loadLearners, initials } from './profiles';
import { useDataVersion } from './data/store';
import { loadMastery } from './mastery/mastery';
import { gardenResidents } from './world/lore/cast';
import { pipChats } from './data/pipChats';
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
  useDataVersion(); // re-render whenever any student's data changes (live standings)
  const learners = loadLearners();
  const rows = learners.map((l) => ({ learner: l, p: loadProgress(l.id) }));
  // A per-mount seed for the "Most eager" board — a *purely-for-fun* shuffle, so
  // nobody's ever last for real. Lazy init keeps it pure in render (no Math.random
  // during render); deterministic within a visit, re-shuffles next time.
  const [eagerSeed] = useState(() => Math.floor(Math.random() * 1e6));
  const eagerKey = (id: string) => {
    let h = eagerSeed + 7;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1_000_000_007;
    return h;
  };

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

  // Most friends brought all the way home (full recovery → living in the Village).
  const friendsHome: Entry[] = [...rows]
    .map((r) => { const n = gardenResidents(loadMastery(r.learner.id)).length; return { learner: r.learner, sortKey: n, value: String(n) }; })
    .filter((e) => e.sortKey > 0)
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 5);

  // Most chats with Pip (a friendly tally; cosmetic).
  const chats: Entry[] = [...rows]
    .map((r) => { const n = pipChats(r.learner.id); return { learner: r.learner, sortKey: n, value: String(n) }; })
    .filter((e) => e.sortKey > 0)
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 5);

  // Most eager to learn — purely for fun (random each visit). Everyone's a star.
  const eager: Entry[] = [...rows]
    .map((r) => ({ learner: r.learner, sortKey: eagerKey(r.learner.id), value: '' }))
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 5)
    .map((e, i) => ({ ...e, value: '🔥'.repeat(Math.max(1, 3 - i)) }));

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
              <Board title="🏡 Most friends home" entries={friendsHome} />
              <Board title="🌟 Most stickers" entries={stickers} />
              <Board title="⚡ Fastest finish" entries={fastest} />
              <Board title="🎮 Most games" entries={sessions} />
              <Board title="💬 Most chats with Pip" entries={chats} />
              <Board title="🔥 Most eager to learn" entries={eager} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
