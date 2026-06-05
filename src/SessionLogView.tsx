import { useEffect } from 'react';
import { loadSessionLog, clearSessionLog, sessionLogCsv } from './sessionLog';
import { formatTime } from './progress';

interface Props {
  open: boolean;
  onClose: () => void;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function isThisWeek(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() <= 7 * 24 * 60 * 60 * 1000;
}

/**
 * Tutor-only progress log: every completed session with date, time spent, and
 * accuracy, so a center can track a student over weeks. Discreet entry point
 * (small corner button) and CSV export for record-keeping.
 */
export function SessionLog({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const records = loadSessionLog().slice().reverse(); // newest first
  const total = records.length;
  const week = records.filter((r) => isThisWeek(r.endedAt)).length;
  const avgAccuracy = total ? Math.round((records.reduce((s, r) => s + r.accuracy, 0) / total) * 100) : 0;

  function exportCsv() {
    const csv = sessionLogCsv(loadSessionLog());
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learn-to-learn-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    if (window.confirm('Clear the whole session log? This cannot be undone.')) {
      clearSessionLog();
      onClose();
    }
  }

  return (
    <div className="log-overlay" role="dialog" aria-modal="true" aria-label="Tutor progress log" onClick={onClose}>
      <div className="log" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="book__close" onClick={onClose} aria-label="Close progress log">×</button>
        <h2 className="book__title">Progress Log</h2>
        <p className="log__sub">For the tutor — every finished session</p>

        <div className="book__stats">
          <span className="book__stat"><strong>{total}</strong><br />sessions</span>
          <span className="book__stat"><strong>{week}</strong><br />this week</span>
          <span className="book__stat"><strong>{avgAccuracy}%</strong><br />avg accuracy</span>
        </div>

        {total === 0 ? (
          <p className="log__empty">No sessions yet. Finished games will show up here.</p>
        ) : (
          <div className="log__table-wrap">
            <table className="log__table">
              <thead>
                <tr><th>When</th><th>Time</th><th>Accuracy</th><th>Items</th></tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{fmtDate(r.endedAt)}</td>
                    <td>{formatTime(r.durationMs)}</td>
                    <td>{Math.round(r.accuracy * 100)}%</td>
                    <td>{r.items}/{r.items + r.wrongAttempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="log__actions">
          <button type="button" className="btn-ghost" onClick={exportCsv} disabled={total === 0}>Export CSV</button>
          <button type="button" className="log__clear" onClick={clearAll} disabled={total === 0}>Clear log</button>
        </div>
      </div>
    </div>
  );
}
