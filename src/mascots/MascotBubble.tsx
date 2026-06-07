import type { Phrase } from './phrases';

/** The shared speech bubble used by the roaming buddy and the static greeters. */
export function MascotBubble({ phrase, onCta, onDismiss }: { phrase: Phrase; onCta: () => void; onDismiss: () => void }) {
  return (
    <div className="mascot-say" role="status">
      <button type="button" className="mascot-say__x" onClick={onDismiss} aria-label="Dismiss">✕</button>
      <p>{phrase.say}</p>
      {phrase.cta && phrase.to && (
        <button type="button" className="mascot-say__cta" onClick={onCta}>{phrase.cta} →</button>
      )}
    </div>
  );
}
