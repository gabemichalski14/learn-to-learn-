import { useEffect, useRef, useState } from 'react';
import { type PipExpression } from './Pip';
import { PipArt } from './PipArt';
import { MascotBubble } from './MascotBubble';
import { randomPhrase, type Phrase, type PhraseKind } from './phrases';
import { sfx } from '../audio/sfx';
import { navigate } from '../router';
import './mascots.css';

/**
 * A Pip you can click to hear a (random, no-repeat) phrase — used for the
 * static greeters (Home hero, Tutor report, finish cards). Click-outside or
 * Escape dismisses; a phrase with a CTA navigates toward learning.
 */
export function MascotSpeaker({
  size = 92,
  expression = 'happy',
  kinds = ['greet', 'idle'],
  className = '',
  label = 'Pip says hi',
}: {
  size?: number;
  expression?: PipExpression;
  kinds?: PhraseKind[];
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState<Phrase | null>(null);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const hide = useRef<number | null>(null);

  useEffect(() => () => { if (hide.current) window.clearTimeout(hide.current); }, []);
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
    setPhrase(randomPhrase(kinds));
    setOpen(true);
    sfx.pop();
    if (hide.current) window.clearTimeout(hide.current);
    hide.current = window.setTimeout(() => setOpen(false), 9000);
  }
  function go() {
    sfx.tap();
    setOpen(false);
    if (phrase?.to) navigate(phrase.to);
  }

  return (
    <span ref={rootRef} className={`mascot-speaker ${className}`}>
      {open && phrase && <MascotBubble phrase={phrase} onCta={go} onDismiss={() => setOpen(false)} />}
      <button type="button" className="mascot-speaker__btn" onClick={poke} aria-label={label}>
        <PipArt size={size} expression={open ? 'excited' : expression} />
      </button>
    </span>
  );
}
