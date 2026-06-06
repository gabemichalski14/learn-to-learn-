import { useState } from 'react';
import { getCurrentLearnerId, getLearner, initials, setCurrentLearnerId, markRecentlyActive } from './profiles';
import { StudentPicker } from './StudentPicker';

/** The persistent "Now playing: <child> ▾" control. Opens the picker; on select,
 *  sets the active learner, stamps recency, and notifies the parent. */
export function NowPlaying({ onChange }: { onChange?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState<string | null>(() => getCurrentLearnerId());
  const learner = getLearner(id);
  return (
    <div className="nowplaying">
      <button type="button" className="nowplaying__btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className="nowplaying__label">Now playing</span>
        {learner ? (
          <span className="nowplaying__who">
            <span className="nowplaying__avatar" style={{ background: learner.color }} aria-hidden="true">{initials(learner.name)}</span>
            {learner.name} <span aria-hidden="true">▾</span>
          </span>
        ) : <span className="nowplaying__who">Choose a student ▾</span>}
      </button>
      <StudentPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(sel) => { setCurrentLearnerId(sel); markRecentlyActive(sel); setId(sel); onChange?.(sel); }}
      />
    </div>
  );
}
