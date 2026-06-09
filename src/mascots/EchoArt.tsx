import { useState, type CSSProperties } from 'react';
import { Echo } from './Echo';
import './echoArt.css';

export type EchoMood = 'calm' | 'happy' | 'ping';

/**
 * Painted Echo — the sound-spark sprite. Renders `/characters/echo/<mood>.png`
 * and falls back to the original SVG <Echo> if a frame is missing. Drop-in for
 * <Echo> (same size/alive/className), plus a `mood`: calm (idle), happy (poked),
 * ping (a sound just happened).
 */
export function EchoArt({ size = 96, mood = 'calm', alive = true, className = '' }: {
  size?: number;
  mood?: EchoMood;
  alive?: boolean;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) return <Echo size={size} alive={alive} className={className} />;
  return (
    <img
      className={`echo-art${alive ? ' echo-art--alive' : ''} ${className}`}
      style={{ width: `${size}px`, height: 'auto' } as CSSProperties}
      src={`/characters/echo/${mood}.png`}
      alt=""
      draggable={false}
      onError={() => setErrored(true)}
    />
  );
}
