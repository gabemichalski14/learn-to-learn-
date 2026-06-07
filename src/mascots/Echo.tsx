import { useId } from 'react';

/**
 * Echo — Pip's sidekick. A sound-spark sprite: a glowing orb whose body ripples
 * like a soundwave (on-theme for a phonics app that's all about sounds). Reads as
 * a twinkling star in space and a firefly in the garden. When `alive`, it pulses
 * and its ripples breathe.
 */
export function Echo({ size = 96, alive = true, className = '' }: { size?: number; alive?: boolean; className?: string }) {
  const uid = useId();
  const k = uid.replace(/[:]/g, '');
  return (
    <span className={`echo${alive ? ' echo--alive' : ''} ${className}`} role="img" aria-label="Echo">
      <svg viewBox="0 0 140 140" width={size} height={size} aria-hidden="true">
        <defs>
          <radialGradient id={`eg-${k}`} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#bff4ff" stopOpacity=".9" />
            <stop offset="55%" stopColor="#5ed7f0" stopOpacity=".35" />
            <stop offset="100%" stopColor="#1b9aaa" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`ec-${k}`} cx="42%" cy="36%" r="72%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#9cebff" />
            <stop offset="100%" stopColor="#28b6cf" />
          </radialGradient>
        </defs>
        <circle cx="70" cy="70" r="62" fill={`url(#eg-${k})`} />
        <g className="echo__ripple" fill="none" stroke="#ffd66b" strokeWidth="3.4" strokeLinecap="round" style={{ transformOrigin: '70px 70px' }}>
          <path d="M32 56 q-7 14 0 28" />
          <path d="M23 49 q-12 21 0 42" opacity=".5" />
          <path d="M108 56 q7 14 0 28" />
          <path d="M117 49 q12 21 0 42" opacity=".5" />
        </g>
        <circle cx="70" cy="70" r="34" fill={`url(#ec-${k})`} />
        <circle cx="70" cy="70" r="34" fill="none" stroke="#eafcff" strokeWidth="1.2" opacity=".35" />
        <ellipse cx="59" cy="55" rx="11" ry="7" fill="#fff" opacity=".6" transform="rotate(-18 59 55)" />
        <circle cx="55" cy="51" r="2.6" fill="#fff" />
        <g className="echo__eyes">
          <ellipse cx="60" cy="71" rx="5" ry="7" fill="#0a2a30" />
          <ellipse cx="80" cy="71" rx="5" ry="7" fill="#0a2a30" />
          <circle cx="62" cy="68" r="1.8" fill="#fff" />
          <circle cx="82" cy="68" r="1.8" fill="#fff" />
        </g>
        <path d="M61 83 q9 8 18 0" fill="none" stroke="#0a2a30" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M106 28 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6z" fill="#ffe9a8" />
      </svg>
    </span>
  );
}
