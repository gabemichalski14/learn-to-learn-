import { useEffect } from 'react';
import { SessionLogPanel } from './SessionLogPanel';

interface Props {
  open: boolean;
  onClose: () => void;
  learnerId: string;
}

/** Modal wrapper around the tutor progress log (quick in-game access). */
export function SessionLog({ open, onClose, learnerId }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="log-overlay" role="dialog" aria-modal="true" aria-label="Tutor progress log" onClick={onClose}>
      <div className="log" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="book__close" onClick={onClose} aria-label="Close progress log">×</button>
        <h2 className="book__title">Progress Log</h2>
        <p className="log__sub">For the tutor — every finished session</p>
        <SessionLogPanel learnerId={learnerId} />
      </div>
    </div>
  );
}
