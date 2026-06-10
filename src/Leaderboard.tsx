import { useState, useEffect, type CSSProperties } from 'react';
import { navigate } from './router';
import { loadProgress, formatTime } from './progress';
import { ACHIEVEMENTS } from './achievements';
import { loadLearners, initials } from './profiles';
import { useDataVersion } from './data/store';
import { loadMastery } from './mastery/mastery';
import { gardenResidents } from './world/lore/cast';
import { pipChats } from './data/pipChats';
import { PipArt } from './mascots/PipArt';
import { isCloudConfigured } from './data/supabase';
import { leaderboard } from './data/cloud';

const MEDALS = ['🥇', '🥈', '🥉'];

// Warm, NON-ranking titles — every learner gets one, so the page celebrates the
// whole center (no shame, no FOMO). Randomized per visit; collisions are fine.
const STAR_TITLES = [
  'Curious Explorer 🔭', 'Brave Tryer 💪', 'Sound Detective 🕵️', 'Garden Friend 🌷',
  'Steady Grower 🌱', 'Bright Spark ✨', 'Kind Helper 🤝', 'Great Listener 👂',
  'Pattern Spotter 🔎', 'Big-Picture Thinker 🧩', 'Star Speller ⭐', 'Joyful Learner 🌈',
];

interface Person { id: string; name: string; color: string }
interface Entry { person: Person; value: string; sortKey: number }
interface Row extends Person { sessions: number; bestMs: number | null; acc: number | null }
interface CloudStat { learner_id: string; display_name: string; color: string; sessions: number | null; best_ms: number | null; avg_accuracy: number | null }

function Board({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <div className="board">
      <h3 className="board__title">{title}</h3>
      {entries.length === 0 ? (
        <p className="board__empty">No data yet.</p>
      ) : (
        <ol className="board__list">
          {entries.map((e, i) => (
            <li key={e.person.id} className="lb-row">
              <span className="lb-row__rank">{MEDALS[i] ?? i + 1}</span>
              <span className="lb-row__avatar" style={{ background: e.person.color }} aria-hidden="true">{initials(e.person.name)}</span>
              <span className="lb-row__name">{e.person.name}</span>
              <span className="lb-row__value">{e.value}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/**
 * Friendly standings. When signed in, the boards use CENTER-WIDE cloud stats
 * (the RLS-scoped learner_stats view) — an owner sees everyone, a tutor their
 * assigned students. Signed out, it falls back to this device's players. Either
 * way, a "Stars of the center" spotlight gives EVERY learner a happy title so
 * the board is inclusive, not just a top-5 ranking.
 */
export function Leaderboard() {
  useDataVersion(); // live local standings
  const [cloud, setCloud] = useState<CloudStat[] | null>(null);
  useEffect(() => {
    if (!isCloudConfigured()) return;
    let live = true;
    void leaderboard().then((r) => { if (live) setCloud(r as CloudStat[]); }).catch(() => { /* offline → local */ });
    return () => { live = false; };
  }, []);
  const usingCloud = !!cloud && cloud.length > 0;

  // per-visit seed for the spotlight shuffle (lazy init keeps render pure)
  const [seed] = useState(() => Math.floor(Math.random() * 1e6));
  const keyOf = (id: string) => { let h = seed + 7; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1_000_000_007; return h; };

  const rows: Row[] = usingCloud
    ? cloud!.map((c) => ({ id: c.learner_id, name: c.display_name, color: c.color, sessions: c.sessions ?? 0, bestMs: c.best_ms ?? null, acc: c.avg_accuracy ?? null }))
    : loadLearners().map((l) => { const p = loadProgress(l.id); return { id: l.id, name: l.name, color: l.color, sessions: p.sessions, bestMs: p.bestMs ?? null, acc: null }; });

  const games: Entry[] = rows.filter((r) => r.sessions > 0).map((r) => ({ person: r, sortKey: r.sessions, value: String(r.sessions) })).sort((a, b) => b.sortKey - a.sortKey).slice(0, 5);
  const fastest: Entry[] = rows.filter((r) => r.bestMs != null).map((r) => ({ person: r, sortKey: r.bestMs as number, value: formatTime(r.bestMs as number) })).sort((a, b) => a.sortKey - b.sortKey).slice(0, 5);
  const sharp: Entry[] = rows.filter((r) => r.acc != null).map((r) => ({ person: r, sortKey: r.acc as number, value: `${Math.round((r.acc as number) * 100)}%` })).sort((a, b) => b.sortKey - a.sortKey).slice(0, 5);

  // local-only charming boards (keyed off the device's local ids)
  const localRows = usingCloud ? [] : loadLearners();
  const stickers: Entry[] = localRows.map((l) => { const n = new Set(loadProgress(l.id).earned).size; return { person: l, sortKey: n, value: `${n}/${ACHIEVEMENTS.length}` }; }).filter((e) => e.sortKey > 0).sort((a, b) => b.sortKey - a.sortKey).slice(0, 5);
  const friendsHome: Entry[] = localRows.map((l) => { const n = gardenResidents(loadMastery(l.id)).length; return { person: l, sortKey: n, value: String(n) }; }).filter((e) => e.sortKey > 0).sort((a, b) => b.sortKey - a.sortKey).slice(0, 5);
  const chats: Entry[] = localRows.map((l) => { const n = pipChats(l.id); return { person: l, sortKey: n, value: String(n) }; }).filter((e) => e.sortKey > 0).sort((a, b) => b.sortKey - a.sortKey).slice(0, 5);

  // Spotlight — EVERY learner gets a warm title (shuffled per visit). Nobody left off.
  const spotlight = [...rows].sort((a, b) => keyOf(a.id) - keyOf(b.id)).map((r) => ({ person: r as Person, title: STAR_TITLES[keyOf(r.id) % STAR_TITLES.length] }));

  return (
    <main className="l2l-page">
      <button type="button" className="l2l-back" onClick={() => navigate('#/')}>← Home</button>

      <div className="l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
        <p className="l2l-eyebrow">Rankings</p>
        <h1 className="l2l-display">Friendly <em>standings</em></h1>
        <p className="l2l-lead">{usingCloud
          ? 'Friendly standings across every student at your center — plus a spotlight where everyone shines.'
          : 'Friendly standings across the players on this device — sign in to see your whole center.'}</p>
      </div>

      <div className="l2l-reveal" style={{ '--i': 1 } as CSSProperties}>
        {rows.length < 2 ? (
          <div className="l2l-card lb-empty" style={{ marginTop: '24px' }}>
            <PipArt size={92} expression="happy" />
            <div className="lb-empty__body">
              <h2 className="lb-empty__h">It’s just you and Pip up here… for now! 🌱</h2>
              <p className="lb-empty__p">Add more students and these boards come alive — and everyone gets a spotlight.</p>
              <button type="button" className="lb-empty__cta" onClick={() => navigate('#/')}>← Add a player on Home</button>
            </div>
          </div>
        ) : (
          <>
            <div className="l2l-card" style={{ marginTop: '24px' }}>
              <div className="board-grid">
                <Board title="🎮 Most games" entries={games} />
                <Board title="⚡ Fastest finish" entries={fastest} />
                {usingCloud ? (
                  <Board title="🎯 Sharpest ears" entries={sharp} />
                ) : (
                  <>
                    <Board title="🏡 Most friends home" entries={friendsHome} />
                    <Board title="🌟 Most stickers" entries={stickers} />
                    <Board title="💬 Most chats with Pip" entries={chats} />
                  </>
                )}
              </div>
            </div>

            <div className="l2l-card" style={{ marginTop: '16px' }}>
              <h2 className="l2l-h2" style={{ marginBottom: 6 }}>Stars of the center</h2>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 14px' }}>Every learner shines somewhere — these change each visit, just for fun.</p>
              <ul className="lb-spotlight">
                {spotlight.map((s) => (
                  <li key={s.person.id} className="lb-star">
                    <span className="lb-star__avatar" style={{ background: s.person.color }} aria-hidden="true">{initials(s.person.name)}</span>
                    <span className="lb-star__body">
                      <span className="lb-star__name">{s.person.name}</span>
                      <span className="lb-star__title">{s.title}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
