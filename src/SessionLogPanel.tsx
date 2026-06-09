import { useState } from 'react';
import { loadSessionLog, clearSessionLog, sessionLogCsv } from './sessionLog';
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

function isThisWeek(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() <= 7 * 24 * 60 * 60 * 1000;
}

/** Friendly game title for a logged session (falls back to the raw id). */
const GAME_TITLES: Record<string, string> = {
  'tap-it-out': 'Tap It Out',
  'beginning-sounds': 'Blast Off',
  'ending-sounds': 'Touchdown',
  'middle-sounds': 'Vowel Patrol',
};
const gameTitle = (id: string) => GAME_TITLES[id] ?? id.replace(/-/g, ' ');

/** Accuracy band → colour (dyslexia-affirming: warm amber/coral, never harsh red). */
function accBand(acc: number): 'high' | 'mid' | 'low' {
  const p = acc * 100;
  return p >= 90 ? 'high' : p >= 70 ? 'mid' : 'low';
}

/**
 * Tutor progress-log content (summary + list + export/clear) for one learner.
 * Used both by the in-game modal and the Tutor Dashboard page, so the data view
 * stays identical.
 */
export function SessionLogPanel({ learnerId, showSummary = true }: { learnerId: string; showSummary?: boolean }) {
  const [, bump] = useState(0); // re-read after clearing
  const dialog = useDialog();

  const records = loadSessionLog(learnerId).slice().reverse(); // newest first
  const total = records.length;
  const week = records.filter((r) => isThisWeek(r.endedAt)).length;
  const avgAccuracy = total ? Math.round((records.reduce((s, r) => s + r.accuracy, 0) / total) * 100) : 0;

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
    if (ok) {
      clearSessionLog(learnerId);
      bump((n) => n + 1);
    }
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
        <div className="slog" role="table" aria-label="Session history">
          <div className="slog__head" role="row">
            <span role="columnheader">Game</span>
            <span role="columnheader">When</span>
            <span role="columnheader" className="slog__r">Accuracy</span>
            <span role="columnheader" className="slog__r">Time</span>
            <span role="columnheader" className="slog__r">Items</span>
          </div>
          <ul className="slog__rows">
            {records.map((r) => (
              <li className="slog__row" key={r.id} role="row">
                <span className="slog__game" role="cell">
                  {gameTitle(r.game)}
                  {r.level != null && <i className="slog__lvl">Lv {r.level}</i>}
                </span>
                <span className="slog__when" role="cell">{fmtDate(r.endedAt)}</span>
                <span className="slog__r" role="cell">
                  <b className={`slog__acc slog__acc--${accBand(r.accuracy)}`}>{Math.round(r.accuracy * 100)}%</b>
                </span>
                <span className="slog__r slog__num" role="cell">{formatTime(r.durationMs)}</span>
                <span className="slog__r slog__num" role="cell">{r.items}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="log__actions">
        <button type="button" className="slog__export" onClick={exportCsv} disabled={total === 0}>⬇ Export CSV</button>
        <button type="button" className="slog__clear" onClick={clearAll} disabled={total === 0}>Clear log</button>
      </div>
    </>
  );
}
