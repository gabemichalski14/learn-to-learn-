interface Props {
  /** 0..1 — how far along the path. */
  progress: number;
  /** When true, the figure strides (it only walks on a correct answer). */
  walking?: boolean;
  /** When true (session finished), the figure hops and flies off the screen. */
  finished?: boolean;
  className?: string;
}

/**
 * Minimal progress indicator for the "Clean" theme: a small figure walks along
 * a line toward a checkered finish flag as the session progresses. The figure
 * strides (legs/arms swing, gentle gait bob) and slides to its progress spot.
 */
export function WalkProgress({ progress, walking = false, finished = false, className }: Props) {
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

      {/* walker (slides along the line; the body strides in place) */}
      <g
        className={`walker${walking ? ' walker--walking' : ''}${finished ? ' walker--finish' : ''}`}
        style={{ transform: `translateX(${x}px)` }}
        stroke="var(--ink)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <g className="walker__body">
          {/* legs (pivot at the hip) */}
          <g transform="translate(0 40)">
            <g className="walker__leg walker__leg--a"><line x1="0" y1="0" x2="0" y2="8" /></g>
            <g className="walker__leg walker__leg--b"><line x1="0" y1="0" x2="0" y2="8" /></g>
          </g>
          {/* spine + head */}
          <line x1="0" y1="31" x2="0" y2="40" />
          <circle cx="0" cy="26" r="4.6" fill="var(--ink)" stroke="none" />
          {/* arms drawn LAST (pivot at the shoulder) so raised arms stay on top of the head */}
          <g transform="translate(0 32.5)">
            <g className="walker__arm walker__arm--a"><line x1="0" y1="0" x2="0" y2="8" /></g>
            <g className="walker__arm walker__arm--b"><line x1="0" y1="0" x2="0" y2="8" /></g>
          </g>
        </g>
      </g>
    </svg>
  );
}
