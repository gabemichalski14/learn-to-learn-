interface Props {
  /** 0..1 — how far along the path. */
  progress: number;
  className?: string;
}

/**
 * Minimal progress indicator for the "Clean" theme: a small figure walks along
 * a line toward a checkered finish flag as the session progresses. Quiet and
 * dignified — no growing tree, no flourishes.
 */
export function WalkProgress({ progress, className }: Props) {
  const p = Math.max(0, Math.min(1, progress));
  const x = 20 + p * 194; // start at 20, reach the flag pole at ~214

  return (
    <svg className={className} viewBox="0 0 240 64" role="img" aria-label="Progress toward the finish line">
      {/* path */}
      <line x1="18" y1="48" x2="222" y2="48" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="43" x2="18" y2="53" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" />

      {/* finish flag */}
      <line x1="214" y1="48" x2="214" y2="13" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
      <g>
        <rect x="214" y="13" width="8" height="6" fill="var(--teal-deep)" />
        <rect x="222" y="13" width="8" height="6" fill="#ffffff" />
        <rect x="214" y="19" width="8" height="6" fill="#ffffff" />
        <rect x="222" y="19" width="8" height="6" fill="var(--teal-deep)" />
        <rect x="214" y="13" width="16" height="12" fill="none" stroke="var(--ink)" strokeWidth="1" />
      </g>

      {/* walker (slides along the line) */}
      <g
        className="walker"
        style={{ transform: `translateX(${x}px)` }}
        stroke="var(--ink)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <circle cx="0" cy="26" r="4.6" fill="var(--ink)" stroke="none" />
        <line x1="0" y1="31" x2="0" y2="40" />
        <line x1="-5" y1="33" x2="5" y2="35" />
        <line x1="0" y1="40" x2="5.5" y2="48" />
        <line x1="0" y1="40" x2="-5.5" y2="48" />
      </g>
    </svg>
  );
}
