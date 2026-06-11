import { useState, type FormEvent } from 'react';
import type { Phrase } from './phrases';
import { pipSuggest, type PipCap, type PipOutcome } from './pipBrain';

/** Highlight the typed letters inside a suggestion as you go. */
function Highlight({ text, q }: { text: string; q: string }) {
  const needle = q.trim();
  const i = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark className="mascot-say__hl">{text.slice(i, i + needle.length)}</mark>{text.slice(i + needle.length)}</>;
}

/**
 * Pip's speech bubble. Two modes: a warm line (with its learning CTA), or "Ask
 * Pip anything" — a one-stop search. You type what you want and Pip either walks
 * you there, flips a setting (sounds / buzz), or explains a game or your data.
 * Suggestions are text with the typed letters highlighted (no icon grid).
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
  const [answer, setAnswer] = useState<PipOutcome | null>(null);
  const results = onNavigate ? pipSuggest(q) : [];

  function pick(cap: PipCap) {
    const out = cap.run();
    if (out.kind === 'go') { onNavigate?.(out.to); return; }
    setAnswer(out); // 'say' (setting confirmation) or 'explain' — stay in the bubble
  }
  function ask(e: FormEvent) {
    e.preventDefault();
    if (results[0]) pick(results[0]);
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
              <button type="button" className="mascot-say__nav-toggle" onClick={() => setNav(true)}>🧭 Ask Pip anything…</button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="mascot-say__navtitle">Where to — or what can I help with? Just type. 🌿</p>
          <form className="mascot-say__ask" onSubmit={ask}>
            <input
              className="mascot-say__askinput"
              value={q}
              onChange={(e) => { setQ(e.target.value); setAnswer(null); }}
              placeholder="garden · sounds off · what is Blend Buddies · my progress"
              aria-label="Ask Pip"
              maxLength={48}
              autoFocus
            />
            <button type="submit" className="mascot-say__askgo" aria-label="Go" disabled={!results.length}>→</button>
          </form>

          {answer && (
            <div className="mascot-say__answer">
              {answer.kind === 'say' ? (
                <p className="mascot-say__ansbody">{answer.text}</p>
              ) : (
                <>
                  <p className="mascot-say__anstitle">{answer.title}</p>
                  <p className="mascot-say__ansbody">{answer.body}</p>
                  {answer.to && answer.cta && (
                    <button type="button" className="mascot-say__cta" onClick={() => onNavigate?.(answer.to!)}>{answer.cta}</button>
                  )}
                </>
              )}
            </div>
          )}

          {q.trim() && !answer && (
            <div className="mascot-say__results">
              {results.length ? results.map((c) => (
                <button key={c.id} type="button" className="mascot-say__result" onClick={() => pick(c)}>
                  <Highlight text={c.label} q={q} />
                </button>
              )) : (
                <p className="mascot-say__hint">Hmm, not sure — try “games”, “sounds off”, or “my progress”. 🧭</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
