import { useState, type FormEvent } from 'react';
import type { Phrase } from './phrases';
import { PIP_DESTINATIONS, matchDestination } from './pipNav';

/**
 * Pip's speech bubble. Two modes: a warm line (with its learning CTA), or a
 * "Take me to…" guide panel where the learner can tap a place — or just *ask*
 * ("my garden", "I wanna play") and Pip figures out where. Navigation is handed
 * up so the caller can play the mascot-led wipe (Pip walks you there).
 */
export function MascotBubble({
  phrase, onCta, onDismiss, onNavigate,
}: {
  phrase: Phrase;
  onCta: () => void;
  onDismiss: () => void;
  onNavigate?: (to: string) => void;
}) {
  const [nav, setNav] = useState(false);
  const [q, setQ] = useState('');
  const [hint, setHint] = useState<string | null>(null);

  function ask(e: FormEvent) {
    e.preventDefault();
    const m = matchDestination(q);
    if (m && onNavigate) { onNavigate(m.to); return; }
    setHint('Hmm, I’m not sure where that is — tap a spot below! 🧭');
  }

  return (
    <div className="mascot-say" role="status">
      <button type="button" className="mascot-say__x" onClick={onDismiss} aria-label="Dismiss">✕</button>

      {!nav ? (
        <>
          <p>{phrase.say}</p>
          <div className="mascot-say__row">
            {phrase.cta && phrase.to && (
              <button type="button" className="mascot-say__cta" onClick={onCta}>{phrase.cta} →</button>
            )}
            {onNavigate && (
              <button type="button" className="mascot-say__nav-toggle" onClick={() => setNav(true)}>🧭 Take me to…</button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="mascot-say__navtitle">Where to, Explorer?</p>
          <form className="mascot-say__ask" onSubmit={ask}>
            <input
              className="mascot-say__askinput"
              value={q}
              onChange={(e) => { setQ(e.target.value); setHint(null); }}
              placeholder="Ask Pip… (e.g. “my garden”)"
              aria-label="Ask Pip where to go"
              maxLength={40}
            />
            <button type="submit" className="mascot-say__askgo" aria-label="Go">→</button>
          </form>
          {hint && <p className="mascot-say__hint">{hint}</p>}
          <div className="mascot-say__chips">
            {PIP_DESTINATIONS.map((d) => (
              <button key={d.to} type="button" className="mascot-say__chip" onClick={() => onNavigate?.(d.to)}>
                <span aria-hidden="true">{d.emoji}</span> {d.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
