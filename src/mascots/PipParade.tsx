import { type CSSProperties } from 'react';
import { type PipExpression } from './Pip';
import { PipArt } from './PipArt';

/** The gag: a whole conga line of Pips waddles across the bottom of the screen,
 *  staggered so they stream in one after another, then march off. Decorative +
 *  pointer-events-none; the parent mounts it briefly. */
const MARCHERS: { size: number; expr: PipExpression; delay: number }[] = [
  { size: 62, expr: 'happy', delay: 0 },
  { size: 80, expr: 'excited', delay: 0.55 },
  { size: 56, expr: 'curious', delay: 1.05 },
  { size: 88, expr: 'happy', delay: 1.5 },
  { size: 64, expr: 'wink', delay: 2.05 },
  { size: 74, expr: 'excited', delay: 2.6 },
  { size: 58, expr: 'happy', delay: 3.15 },
];

export function PipParade() {
  return (
    <div className="pip-parade" aria-hidden="true">
      {MARCHERS.map((m, i) => (
        <span key={i} className="pip-parade__one" style={{ '--delay': `${m.delay}s` } as CSSProperties}>
          <span className="pip-parade__waddle">
            <PipArt size={m.size} expression={m.expr} />
          </span>
        </span>
      ))}
    </div>
  );
}
