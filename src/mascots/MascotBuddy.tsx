import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Pip, type PipExpression } from './Pip';
import { Echo } from './Echo';
import { sfx } from '../audio/sfx';
import { navigate } from '../router';
import './mascots.css';

/**
 * The roaming easter-egg buddy. Pip (occasionally Echo — a rare "variable
 * reward") peeks from a corner; poke them and they spring up with a short, warm
 * nudge toward learning. Deliberately ethical: every nudge points at play/
 * practice and frames it around the child's competence + choice — no streak
 * shaming, no FOMO, always easy to dismiss. (Relatedness + gentle persuasion.)
 *
 * Mount it keyed by route so each page gets a fresh placement/buddy/message.
 */
const NUDGES: { say: string; cta: string; to: string }[] = [
  { say: 'Psst… want to grow a few more sounds with me? 🌱', cta: 'Let’s play', to: '#/levels' },
  { say: 'You’ve got a great ear today. One more round?', cta: 'Pick a game', to: '#/games' },
  { say: 'I saved your spot — pick up where you left off!', cta: 'Continue', to: '#/levels' },
  { say: 'Tiny steps make big readers. Try one with me?', cta: 'Let’s go', to: '#/levels' },
  { say: 'I believe in you, Explorer. 💚', cta: 'Play a game', to: '#/games' },
];
const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315];
const PEEK_EXPR: PipExpression[] = ['happy', 'wink', 'curious', 'happy'];

export function MascotBuddy() {
  // Chosen once per mount → fresh "surprise" each page (component is keyed by route).
  const [pick] = useState(() => ({
    corner: Math.random() < 0.5 ? 'bl' : 'br',
    isEcho: Math.random() < 0.22, // rare appearance = variable reward
    nudge: NUDGES[Math.floor(Math.random() * NUDGES.length)],
    expr: PEEK_EXPR[Math.floor(Math.random() * PEEK_EXPR.length)],
  }));
  const [open, setOpen] = useState(false);
  const [burst, setBurst] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<number | null>(null);
  const burstTimer = useRef<number | null>(null);

  function clearTimers() {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    if (burstTimer.current) window.clearTimeout(burstTimer.current);
  }
  useEffect(() => clearTimers, []);

  // While open: click-outside or Escape closes it, so it's never a trap.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function poke() {
    if (open) { setOpen(false); return; }
    setOpen(true);
    setBurst(true);
    sfx.pop();
    clearTimers();
    burstTimer.current = window.setTimeout(() => setBurst(false), 700);
    hideTimer.current = window.setTimeout(() => setOpen(false), 9000);
  }
  function go() {
    sfx.tap();
    setOpen(false);
    navigate(pick.nudge.to);
  }

  return (
    <div ref={rootRef} className={`mascot-egg mascot-egg--${pick.corner}${open ? ' mascot-egg--open' : ''}`}>
      {open && (
        <div className="mascot-say" role="status">
          <button type="button" className="mascot-say__x" onClick={() => setOpen(false)} aria-label="Dismiss">✕</button>
          <p>{pick.nudge.say}</p>
          <button type="button" className="mascot-say__cta" onClick={go}>{pick.nudge.cta} →</button>
        </div>
      )}
      <div className="mascot-egg__bob">
        <button
          type="button"
          className="mascot-egg__btn"
          onClick={poke}
          aria-label={pick.isEcho ? 'Echo says hi' : 'Pip says hi'}
        >
          {burst && (
            <span className="mascot-burst" aria-hidden="true">
              {SPARKS.map((a, i) => <i key={i} style={{ '--a': `${a}deg` } as CSSProperties} />)}
            </span>
          )}
          {pick.isEcho ? <Echo size={90} /> : <Pip size={118} expression={pick.expr} />}
        </button>
      </div>
    </div>
  );
}
