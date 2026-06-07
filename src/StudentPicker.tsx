import { useState } from 'react';
import { createPortal } from 'react-dom';
import { initials, recentlyActiveOrder } from './profiles';
import { useLearners } from './data/store';

interface Props { open: boolean; onSelect: (id: string) => void; onClose: () => void }

/** Full-screen student picker for the shared center device: large avatar cards,
 *  most-recently-active first, with a search box that appears for big rosters. */
export function StudentPicker({ open, onSelect, onClose }: Props) {
  const [q, setQ] = useState('');
  const learners = useLearners();
  if (!open) return null;
  const all = recentlyActiveOrder(learners);
  const list = q.trim() ? all.filter((l) => l.name.toLowerCase().includes(q.trim().toLowerCase())) : all;
  // Portal to <body> so the fixed overlay escapes any page-level stacking context
  // (the .l2l-page transform/z-index trap that was painting it behind content).
  return createPortal(
    <div className="picker-overlay" role="dialog" aria-modal="true" aria-label="Choose the student playing" onClick={onClose}>
      <div className="picker" onClick={(e) => e.stopPropagation()}>
        <div className="picker__head">
          <h2 className="picker__title">Who's playing?</h2>
          <button type="button" className="picker__x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {all.length > 12 && (
          <input className="picker__search" placeholder="Search students…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        )}
        <div className="picker__grid">
          {list.map((l) => (
            <button key={l.id} type="button" className="picker__card" onClick={() => { onSelect(l.id); onClose(); }}>
              <span className="picker__avatar" style={{ background: l.color }} aria-hidden="true">{initials(l.name)}</span>
              <span className="picker__name">{l.name}</span>
            </button>
          ))}
          {list.length === 0 && <p className="picker__empty">No students match "{q}".</p>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
