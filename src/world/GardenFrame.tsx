import './living-world.css';

/**
 * Foreground framing foliage — the cozy "you're peeking into the garden" layer.
 * Large, warm, slightly-out-of-focus leaves hug the screen corners IN FRONT of
 * the backdrop (but pointer-events:none, and tucked into corners/gutters so they
 * never cover content or controls). This foreground plane is what kills the
 * "floating cards on white" feeling — it gives the scene real depth.
 *
 * Narrow screens shrink/relax the frame (see CSS) so it never crowds content.
 */
function Leaf({ d, fill }: { d: string; fill: string }) {
  return <path d={d} fill={fill} />;
}

export function GardenFrame() {
  return (
    <div className="garden-frame" aria-hidden="true">
      {/* bottom-left cluster rising inward */}
      <span className="gf gf--bl">
        <svg viewBox="0 0 180 180" width="100%" height="100%">
          <g className="gf__sway">
            <Leaf d="M20 180 q-6 -80 34 -120 q14 40 -10 84 q-12 22 -24 36z" fill="#4e7d49" />
            <Leaf d="M54 180 q4 -70 56 -96 q2 40 -28 72 q-14 16 -28 24z" fill="#5f9a58" />
            <Leaf d="M96 180 q14 -52 70 -64 q-6 34 -38 54 q-16 10 -32 10z" fill="#73b066" />
          </g>
        </svg>
      </span>
      {/* bottom-right cluster rising inward */}
      <span className="gf gf--br">
        <svg viewBox="0 0 180 180" width="100%" height="100%">
          <g className="gf__sway gf__sway--b">
            <Leaf d="M160 180 q6 -80 -34 -120 q-14 40 10 84 q12 22 24 36z" fill="#4e7d49" />
            <Leaf d="M126 180 q-4 -70 -56 -96 q-2 40 28 72 q14 16 28 24z" fill="#5f9a58" />
            <Leaf d="M84 180 q-14 -52 -70 -64 q6 34 38 54 q16 10 32 10z" fill="#73b066" />
          </g>
        </svg>
      </span>
      {/* top-right hanging sprig (away from the top-left menu button) */}
      <span className="gf gf--tr">
        <svg viewBox="0 0 150 130" width="100%" height="100%">
          <g className="gf__sway gf__sway--hang">
            <path d="M150 0 q-40 6 -64 44" fill="none" stroke="#4e7d49" strokeWidth="4" strokeLinecap="round" />
            <Leaf d="M150 0 q-30 2 -40 30 q26 2 40 -14z" fill="#5f9a58" />
            <Leaf d="M120 20 q-26 4 -34 30 q24 4 38 -12z" fill="#6aa85f" />
            <Leaf d="M98 44 q-24 8 -28 34 q22 0 34 -16z" fill="#73b066" />
          </g>
        </svg>
      </span>
    </div>
  );
}
