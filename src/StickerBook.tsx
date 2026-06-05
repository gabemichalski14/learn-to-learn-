import { useEffect } from 'react';
import { loadProgress, formatTime } from './progress';
import { ACHIEVEMENTS } from './achievements';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * A "collect them all" sticker book where every sticker is a distinct goal.
 * Earned stickers show in colour with their title; locked ones stay a mystery
 * but reveal the goal, so kids always have something to aim for. Also shows
 * best time + sessions finished. Opens on demand (no time pressure).
 */
export function StickerBook({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const { earned, bestMs, sessions } = loadProgress();
  const got = new Set(earned);

  return (
    <div className="book-overlay" role="dialog" aria-modal="true" aria-label="My sticker book" onClick={onClose}>
      <div className="book" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="book__close" onClick={onClose} aria-label="Close sticker book">×</button>
        <h2 className="book__title">My Sticker Book</h2>

        <div className="book__stats">
          <span className="book__stat">
            <strong>{got.size}</strong>/{ACHIEVEMENTS.length}<br />stickers
          </span>
          <span className="book__stat">
            <strong>{sessions}</strong><br />finished
          </span>
          {bestMs != null && (
            <span className="book__stat">
              <strong>{formatTime(bestMs)}</strong><br />best time
            </span>
          )}
        </div>

        <div className="book__grid">
          {ACHIEVEMENTS.map((a) => {
            const have = got.has(a.id);
            return (
              <div key={a.id} className={`book__card${have ? ' book__card--got' : ''}`}>
                <span className="book__emoji" aria-hidden="true">{have ? a.emoji : '?'}</span>
                <span className="book__name">{a.title}</span>
                <span className="book__goal">{a.desc}</span>
              </div>
            );
          })}
        </div>

        <p className="book__hint">
          {got.size < ACHIEVEMENTS.length ? 'Reach a goal to earn its sticker!' : 'You collected them all! 🎉'}
        </p>
      </div>
    </div>
  );
}
