import { useState, type CSSProperties } from 'react';
import { Pip, type PipExpression } from './Pip';
import './pipArt.css';

/**
 * Painted Pip — the real storybook companion. Renders the hand-painted frame
 * `/characters/pip/<expression>.png`, and falls back to the original SVG <Pip>
 * (per expression) if a frame is ever missing, so it upgrades gracefully and
 * nothing breaks. Drop-in replacement for <Pip>: same props.
 */
export function PipArt({ size = 120, expression = 'happy', alive = true, className = '' }: {
  size?: number;
  expression?: PipExpression;
  alive?: boolean;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) return <Pip size={size} expression={expression} alive={alive} className={className} />;
  return (
    <img
      className={`pip-art${alive ? ' pip-art--alive' : ''} ${className}`}
      style={{ width: `${size}px`, height: 'auto' } as CSSProperties}
      src={`/characters/pip/${expression}.png`}
      alt=""
      draggable={false}
      onError={() => setErrored(true)}
    />
  );
}
