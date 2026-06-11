import { useState, type FormEvent } from 'react';
import type { Phrase } from './phrases';
import { searchDestinations, matchDestination } from './pipNav';

/** Highlight the typed letters inside a place name as you go. */
function Highlight({ text, q }: { text: string; q: string }) {
  const needle = q.trim();
  const i = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark className="mascot-say__hl">{text.slice(i, i + needle.length)}</mark>{text.slice(i + needle.length)}</>;
}

/**
 * Pip's speech bubble. Two modes: a warm line (with its learning CTA), or a
 * "type where to go" guide. Pip no longer shows a grid of place-icons to pick
 * from — you TYPE a place and he walks you there, suggesting matches with the
 * letters you've typed highlighted as you go.
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
  const results = onNavigate ? searchDestinations(q) : [];

  function ask(e: FormEvent) {
    e.preventDefault();
    const top = results[0] ?? matchDestination(q);
    if (top) onNavigate?.(top.to);
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
              <button type="button" className="mascot-say__nav-toggle" onClick={() => setNav(true)}>🧭 Take me somewhere…</button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="mascot-say__navtitle">Type where you'd like to go — I'll walk you there. 🌿</p>
          <form className="mascot-say__ask" onSubmit={ask}>
            <input
              className="mascot-say__askinput"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="garden · games · leaderboard · home…"
              aria-label="Type where to go"
              maxLength={40}
              autoFocus
            />
            <button type="submit" className="mascot-say__askgo" aria-label="Go" disabled={!results.length}>→</button>
          </form>
          {q.trim() && (
            <div className="mascot-say__results">
              {results.length ? results.map((d) => (
                <button key={d.to} type="button" className="mascot-say__result" onClick={() => onNavigate?.(d.to)}>
                  <Highlight text={d.label} q={q} />
                </button>
              )) : (
                <p className="mascot-say__hint">Hmm, I don't know that place — try “garden”, “games”, or “home”. 🧭</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
