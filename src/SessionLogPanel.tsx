import { useState } from 'react';
import { loadSessionLog, clearSessionLog, sessionLogCsv, type SessionRecord } from './sessionLog';
import { formatTime } from './progress';
import { useDialog } from './ui/dialogContext';
import './sessionLogPanel.css';

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  );
}

function fmtFull(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function isThisWeek(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() <= 7 * 24 * 60 * 60 * 1000;
}

/** Friendly game title for a logged session (falls back to the raw id). */
const GAME_TITLES: Record<string, string> = {
  'tap-it-out': 'Tap It Out',
  'same-or-different': 'Same or Different?',
  'switch-it': 'Switch It',
  'beginning-sounds': 'Blast Off',
  'ending-sounds': 'Touchdown',
  'middle-sounds': 'Vowel Patrol',
  'star-station': 'Star Station',
  'word-beam': 'Word Beam',
  'warp-speed': 'Warp Speed',
  'rhyme-time': 'Rhyme Time',
  'blend-it': 'Blend It',
  'blend-buddies': 'Blend Buddies',
  'sort-it': 'Sort It',
  'rule-breakers': 'Rule Breakers',
  'chop-shop': 'Chop Shop',
};
const gameTitle = (id: string) => GAME_TITLES[id] ?? id.replace(/-/g, ' ');

/** Accuracy band → colour (dyslexia-affirming: warm amber/coral, never harsh red). */
function accBand(acc: number): 'high' | 'mid' | 'low' {
  const p = acc * 100;
  return p >= 90 ? 'high' : p >= 70 ? 'mid' : 'low';
}
const bandRead: Record<'high' | 'mid' | 'low', string> = {
  high: 'Strong — mastery range 💪',
  mid: 'Solid — keep practising 👍',
  low: 'Worth another pass 🌱',
};

const PER_PAGE_OPTIONS = [10, 25, 50];

/** Expanding detail for one session — the full collected data for that play. */
function SessionDetail({ r }: { r: SessionRecord }) {
  const acc = Math.round(r.accuracy * 100);
  const mins = r.durationMs / 60000;
  const pace = mins > 0 ? Math.round(r.items / mins) : r.items;
  const firstTry = r.items > 0 ? Math.round(((r.items - r.wrongAttempts) / r.items) * 100) : 0;
  return (
    <div className="slog__detail" role="region" aria-label="session detail">
      <p className="slog__detail-read">{bandRead[accBand(r.accuracy)]}</p>
      <div className="slog__stats">
        <span className="slog__stat"><b>{fmtFull(r.endedAt)}</b><i>played</i></span>
        <span className="slog__stat"><b>{acc}%</b><i>accuracy</i></span>
        <span className="slog__stat"><b>{Math.max(0, firstTry)}%</b><i>first try</i></span>
        <span className="slog__stat"><b>{formatTime(r.durationMs)}</b><i>time</i></span>
        <span className="slog__stat"><b>{r.items}</b><i>items</i></span>
        <span className="slog__stat"><b>{r.rounds}</b><i>rounds</i></span>
        <span className="slog__stat"><b>{r.wrongAttempts}</b><i>missed</i></span>
        <span className="slog__stat"><b>{pace}</b><i>per min</i></span>
        {r.level != null && <span className="slog__stat"><b>Lv {r.level}{r.lesson != null ? `·${r.lesson}` : ''}</b><i>level</i></span>}
      </div>
    </div>
  );
}

/**
 * Tutor progress-log content for one learner: summary + a paginated, expandable
 * session table where each row opens its full collected data. `collapsible`
 * starts the table folded behind a toggle (used on the dashboard); the in-game
 * modal shows it open with the summary.
 */
export function SessionLogPanel({ learnerId, showSummary = true, collapsible = false }: {
  learnerId: string;
  showSummary?: boolean;
  collapsible?: boolean;
}) {
  const [, bump] = useState(0); // re-read after clearing
  const [perPage, setPerPage] = useState(PER_PAGE_OPTIONS[0]);
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [open, setOpen] = useState(!collapsible);
  const dialog = useDialog();

  const records = loadSessionLog(learnerId).slice().reverse(); // newest first
  const total = records.length;
  const week = records.filter((r) => isThisWeek(r.endedAt)).length;
  const avgAccuracy = total ? Math.round((records.reduce((s, r) => s + r.accuracy, 0) / total) * 100) : 0;

  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const curPage = Math.min(page, pageCount - 1);
  const start = curPage * perPage;
  const pageRows = records.slice(start, start + perPage);

  function exportCsv() {
    const csv = sessionLogCsv(loadSessionLog(learnerId));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learn-to-learn-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function clearAll() {
    const ok = await dialog.confirm({
      title: 'Clear session log?',
      message: 'Clear this student’s whole session log? This can’t be undone.',
      okLabel: 'Clear', danger: true,
    });
    if (ok) { clearSessionLog(learnerId); bump((n) => n + 1); }
  }

  return (
    <>
      {showSummary && (
        <div className="book__stats">
          <span className="book__stat"><strong>{total}</strong><br />sessions</span>
          <span className="book__stat"><strong>{week}</strong><br />this week</span>
          <span className="book__stat"><strong>{avgAccuracy}%</strong><br />avg accuracy</span>
        </div>
      )}

      {total === 0 ? (
        <p className="log__empty">No sessions yet. Finished games will show up here. 🌱</p>
      ) : (
        <>
          {collapsible && (
            <button type="button" className="slog__toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              {open ? '▾ Hide history' : `▸ Show all ${total} session${total === 1 ? '' : 's'}`}
            </button>
          )}

          {open && (
            <>
              <div className="slog" role="table" aria-label="Session history">
                <div className="slog__head" role="row">
                  <span role="columnheader">Game</span>
                  <span role="columnheader">When</span>
                  <span role="columnheader" className="slog__r">Accuracy</span>
                  <span role="columnheader" className="slog__r">Time</span>
                  <span role="columnheader" className="slog__r">Items</span>
                </div>
                <ul className="slog__rows">
                  {pageRows.map((r) => {
                    const isOpen = openId === r.id;
                    return (
                      <li key={r.id}>
                        <button type="button" className={`slog__row${isOpen ? ' is-open' : ''}`} aria-expanded={isOpen}
                          onClick={() => setOpenId((id) => (id === r.id ? null : r.id))}>
                          <span className="slog__game">
                            <span className="slog__chev" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
                            {gameTitle(r.game)}
                            {r.level != null && <i className="slog__lvl">Lv {r.level}</i>}
                          </span>
                          <span className="slog__when">{fmtDate(r.endedAt)}</span>
                          <span className="slog__r"><b className={`slog__acc slog__acc--${accBand(r.accuracy)}`}>{Math.round(r.accuracy * 100)}%</b></span>
                          <span className="slog__r slog__num">{formatTime(r.durationMs)}</span>
                          <span className="slog__r slog__num">{r.items}</span>
                        </button>
                        {isOpen && <SessionDetail r={r} />}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="slog__pager">
                <label className="slog__perpage">Rows
                  <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(0); setOpenId(null); }}>
                    {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <span className="slog__range">{start + 1}–{Math.min(start + perPage, total)} of {total}</span>
                <span className="slog__nav">
                  <button type="button" disabled={curPage === 0} onClick={() => { setPage((p) => Math.max(0, p - 1)); setOpenId(null); }} aria-label="Previous page">‹</button>
                  <span className="slog__page">{curPage + 1}/{pageCount}</span>
                  <button type="button" disabled={curPage >= pageCount - 1} onClick={() => { setPage((p) => Math.min(pageCount - 1, p + 1)); setOpenId(null); }} aria-label="Next page">›</button>
                </span>
              </div>
            </>
          )}
        </>
      )}

      <div className="log__actions">
        <button type="button" className="slog__export" onClick={exportCsv} disabled={total === 0}>⬇ Export CSV</button>
        <button type="button" className="slog__clear" onClick={clearAll} disabled={total === 0}>Clear log</button>
      </div>
    </>
  );
}
