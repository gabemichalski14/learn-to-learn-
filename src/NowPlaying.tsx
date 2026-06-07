import { useState } from 'react';
import { initials, setCurrentLearnerId, markRecentlyActive } from './profiles';
import { useCurrentLearnerId, useLearner } from './data/store';
import { StudentPicker } from './StudentPicker';

/** The persistent "Explorer: <child> ▾" control. Opens the picker; on select,
 *  sets the active learner, stamps recency, and notifies the parent. The active
 *  learner comes from the reactive store, so it stays in sync everywhere. */
export function NowPlaying({ onChange }: { onChange?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const id = useCurrentLearnerId();
  const learner = useLearner(id);
  return (
    <div className="nowplaying">
      <button type="button" className="nowplaying__btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className="nowplaying__label">Explorer</span>
        {learner ? (
          <span className="nowplaying__who">
            <span className="nowplaying__avatar" style={{ background: learner.color }} aria-hidden="true">{initials(learner.name)}</span>
            {learner.name} <span aria-hidden="true">▾</span>
          </span>
        ) : <span className="nowplaying__who">Choose an explorer ▾</span>}
      </button>
      <StudentPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(sel) => { setCurrentLearnerId(sel); markRecentlyActive(sel); onChange?.(sel); }}
      />
    </div>
  );
}
