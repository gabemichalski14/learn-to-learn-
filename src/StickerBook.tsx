import { useEffect } from 'react';
import { STICKERS, loadProgress, formatTime } from './progress';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * A "collect them all" sticker book: every sticker shows as a colourful earned
 * one or a mystery locked slot, alongside the learner's best time and how many
 * sessions they've finished. Opens on demand (no time pressure during play).
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

  const { stickers, bestMs, sessions } = loadProgress();
  const earned = new Set(stickers);

  return (
    <div className="book-overlay" role="dialog" aria-modal="true" aria-label="My sticker book" onClick={onClose}>
      <div className="book" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="book__close" onClick={onClose} aria-label="Close sticker book">×</button>
        <h2 className="book__title">My Sticker Book</h2>

        <div className="book__stats">
          <span className="book__stat">
            <strong>{earned.size}</strong>/{STICKERS.length}<br />stickers
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
          {STICKERS.map((s, i) => {
            const got = earned.has(s);
            return (
              <div key={i} className={`book__slot${got ? ' book__slot--got' : ''}`}>
                <span aria-hidden="true">{got ? s : '?'}</span>
              </div>
            );
          })}
        </div>

        {earned.size < STICKERS.length ? (
          <p className="book__hint">Finish a game to earn the next one!</p>
        ) : (
          <p className="book__hint">You collected them all! 🎉</p>
        )}
      </div>
    </div>
  );
}
