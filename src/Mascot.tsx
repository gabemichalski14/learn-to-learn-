export type MascotMood = 'idle' | 'happy' | 'oops';

interface Props {
  mood?: MascotMood;
  className?: string;
}

/**
 * Sprouty — a little tree-sprout buddy for the Playful theme. Bobs while idle,
 * hops when the child is right, gives a sympathetic wobble when not. Purely
 * decorative (aria-hidden); the learning is unchanged underneath.
 */
export function Mascot({ mood = 'idle', className }: Props) {
  return (
    <div className={`mascot mascot--${mood}${className ? ' ' + className : ''}`} aria-hidden="true">
      <svg viewBox="0 0 100 112" width="100%" height="100%">
        {/* sprout on top */}
        <path d="M50,34 L50,16" stroke="var(--teal-deep)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <g transform="translate(50 18) rotate(-38)">
          <path d="M0,0 C 5,-2 6,-10 0,-14 C -6,-10 -5,-2 0,0 Z" fill="var(--teal)" stroke="var(--teal-deep)" strokeWidth="1.2" />
        </g>
        <g transform="translate(50 18) rotate(38)">
          <path d="M0,0 C 5,-2 6,-10 0,-14 C -6,-10 -5,-2 0,0 Z" fill="var(--teal)" stroke="var(--teal-deep)" strokeWidth="1.2" />
        </g>

        {/* body */}
        <circle cx="50" cy="68" r="33" fill="var(--teal)" stroke="var(--teal-deep)" strokeWidth="2.5" />
        <ellipse cx="50" cy="76" rx="19" ry="15" fill="#ffffff" opacity="0.55" />

        {/* cheeks when happy */}
        {mood === 'happy' && (
          <g>
            <circle cx="33" cy="70" r="5" fill="#ff8fb0" opacity="0.7" />
            <circle cx="67" cy="70" r="5" fill="#ff8fb0" opacity="0.7" />
          </g>
        )}

        {/* eyes */}
        <g className="mascot__eyes">
          <circle cx="40" cy="62" r="6.5" fill="#ffffff" stroke="var(--teal-deep)" strokeWidth="1.3" />
          <circle cx="60" cy="62" r="6.5" fill="#ffffff" stroke="var(--teal-deep)" strokeWidth="1.3" />
          <circle cx="41" cy="63" r="3" fill="var(--ink)" />
          <circle cx="61" cy="63" r="3" fill="var(--ink)" />
        </g>

        {/* mouth per mood */}
        {mood === 'oops' ? (
          <ellipse cx="50" cy="80" rx="4.5" ry="5.5" fill="var(--teal-deeper)" />
        ) : mood === 'happy' ? (
          <path d="M40,76 Q50,90 60,76 Z" fill="var(--teal-deeper)" />
        ) : (
          <path d="M43,78 Q50,84 57,78" stroke="var(--teal-deeper)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}
