import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { type PipExpression } from './Pip';
import { PipArt } from './PipArt';
import { EchoArt } from './EchoArt';
import { MascotBubble } from './MascotBubble';
import { PipParade } from './PipParade';
import { randomPhrase, type Phrase } from './phrases';
import { speak } from '../world/lore/speak';
import { bumpPipChat } from '../data/pipChats';
import { PIP_LINES, ECHO_LINES } from '../world/lore/characters';
import { sfx } from '../audio/sfx';
import { useGuide } from '../world/guideContext';
import './mascots.css';

/**
 * The roaming buddy. Pip (rarely Echo) appears at one of many spots around the
 * page and, every so often, glides to a NEW spot — so it never sits in a fixed
 * pattern and always feels alive. Poke them for a short, warm, randomly-chosen
 * phrase (with an optional learning CTA). Everything is randomized (spot, timing,
 * expression, phrase) with no immediate repeats, and movement is driven by a
 * single self-rescheduling timer — no render loop.
 */
type Spot = { left: string; top: string; v: 'above' | 'below'; s: 'sl' | 'sr' | 'sc' };

// Spread around the edges + sides + center (never top-left — the menu lives there).
const SPOTS: Spot[] = [
  { left: '16px', top: 'calc(100dvh - 156px)', v: 'above', s: 'sl' },
  { left: 'calc(100vw - 132px)', top: 'calc(100dvh - 156px)', v: 'above', s: 'sr' },
  { left: 'calc(50vw - 56px)', top: 'calc(100dvh - 156px)', v: 'above', s: 'sc' },
  { left: '12px', top: '46vh', v: 'above', s: 'sl' },
  { left: 'calc(100vw - 128px)', top: '46vh', v: 'above', s: 'sr' },
  { left: 'calc(100vw - 128px)', top: '92px', v: 'below', s: 'sr' },
  { left: 'calc(50vw - 56px)', top: '90px', v: 'below', s: 'sc' },
];
const PEEK_EXPR: PipExpression[] = ['happy', 'wink', 'curious', 'happy', 'excited'];
const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315];
const rnd = (n: number) => Math.floor(Math.random() * n);

export function MascotBuddy({ learnerId }: { learnerId: string }) {
  const [isEcho] = useState(() => Math.random() < 0.22);
  const [spot, setSpot] = useState(() => rnd(SPOTS.length));
  const [expr, setExpr] = useState<PipExpression>(() => PEEK_EXPR[rnd(PEEK_EXPR.length)]);
  const [bobDelay] = useState(() => `${(rnd(1800)) / 1000}s`);
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState<Phrase | null>(null);
  const [burst, setBurst] = useState(false);
  const [parade, setParade] = useState(false);
  const guide = useGuide();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const openRef = useRef(false);
  const paradeRef = useRef(false);
  const dodgedRef = useRef(false); // trickster: only dodge once in a row
  const pokeTimes = useRef<number[]>([]);
  const timers = useRef<number[]>([]);

  // The gag: a conga line of Pips waddles across the screen, then is gone again.
  function summonParade() {
    if (paradeRef.current) return;
    setParade(true);
    sfx.combo(6);
    timers.current.push(window.setTimeout(() => setParade(false), 10500));
  }
  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { paradeRef.current = parade; }, [parade]);
  const clearAll = () => { timers.current.forEach(window.clearTimeout); timers.current = []; };

  // Wander to a new spot on a randomized cadence (paused while open). One
  // self-rescheduling timer — bounded, cleaned up, never a render loop.
  useEffect(() => {
    let alive = true;
    const schedule = () => {
      const id = window.setTimeout(() => {
        if (!alive) return;
        if (!openRef.current) {
          if (Math.random() < 0.12) {
            summonParade(); // rare gag
          } else {
            setSpot((s) => (s + 1 + rnd(SPOTS.length - 1)) % SPOTS.length); // a different spot
            setExpr(PEEK_EXPR[rnd(PEEK_EXPR.length)]);
          }
        }
        schedule();
      }, 14000 + rnd(12000)); // 14–26s, randomized
      timers.current.push(id);
    };
    schedule();
    return () => { alive = false; clearAll(); };
  }, []);

  // Click-outside / Escape closes the bubble.
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

  useEffect(() => clearAll, []);

  function poke() {
    // Poke Pip a few times fast → summon the parade (a discoverable easter egg).
    const now = Date.now();
    pokeTimes.current = [...pokeTimes.current, now].filter((t) => now - t < 1600);
    if (pokeTimes.current.length >= 4) {
      pokeTimes.current = [];
      setOpen(false);
      summonParade();
      return;
    }
    if (open) { setOpen(false); return; }
    // Trickster gag: every so often Pip playfully scoots to a new spot instead
    // of opening — then waits to be caught. Reversible (the next poke opens),
    // never moves real UI, and disabled under reduced-motion.
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && !dodgedRef.current && Math.random() < 0.18) {
      dodgedRef.current = true;
      setSpot((s) => (s + 1 + rnd(SPOTS.length - 1)) % SPOTS.length);
      setExpr('wink');
      sfx.tick();
      return;
    }
    dodgedRef.current = false;
    // Pip (or Echo) speaks an authored, memory + bond-aware line that evolves as
    // you grow together and never repeats hollowly; each chat deepens the bond,
    // unlocking deeper backstory over time. Falls back to a generic phrase only
    // if the pool somehow yields nothing. Read/write at click-time (no render loop).
    const pool = isEcho ? ECHO_LINES : PIP_LINES;
    setPhrase(speak(learnerId, pool) ?? randomPhrase(['nudge', 'idle', 'tip']));
    bumpPipChat(learnerId); // a friendly tally for the leaderboard
    setExpr('excited');
    setOpen(true);
    setBurst(true);
    sfx.pop();
    timers.current.push(window.setTimeout(() => setBurst(false), 700));
    timers.current.push(window.setTimeout(() => setOpen(false), 9000));
  }
  function go() {
    sfx.tap();
    setOpen(false);
    // Pip walks you there: sweep left if the buddy sits on the right, else right.
    if (phrase?.to) guide.goTo(phrase.to, SPOTS[spot].s === 'sr' ? 'left' : 'right');
  }

  const s = SPOTS[spot];
  return (
    <>
      {parade && <PipParade />}
      <div
        ref={rootRef}
        className={`mascot-egg mascot-egg--${s.v} mascot-egg--${s.s}${open ? ' mascot-egg--open' : ''}`}
        style={{ left: s.left, top: s.top } as CSSProperties}
      >
      {open && phrase && (
        <MascotBubble
          phrase={phrase}
          onCta={go}
          onDismiss={() => setOpen(false)}
          onNavigate={(to) => { setOpen(false); guide.goTo(to, SPOTS[spot].s === 'sr' ? 'left' : 'right'); }}
        />
      )}
      <div className="mascot-egg__bob" style={{ '--bob-delay': bobDelay } as CSSProperties}>
        <button type="button" className="mascot-egg__btn" onClick={poke} aria-label={isEcho ? 'Echo says hi' : 'Pip says hi'}>
          {burst && (
            <span className="mascot-burst" aria-hidden="true">
              {SPARKS.map((a, i) => <i key={i} style={{ '--a': `${a}deg` } as CSSProperties} />)}
            </span>
          )}
          {isEcho ? <EchoArt size={86} mood={open ? 'happy' : 'calm'} /> : <PipArt size={104} expression={open ? 'excited' : expr} />}
        </button>
      </div>
      </div>
    </>
  );
}
