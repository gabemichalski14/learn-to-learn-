import { useId, type CSSProperties } from 'react';

export type PipExpression = 'happy' | 'excited' | 'curious' | 'wink' | 'thinking' | 'caring';

const BODY_PATH = 'M100 48 C156 48 172 92 172 132 C172 184 142 206 100 206 C58 206 28 184 28 132 C28 92 44 48 100 48 Z';

/**
 * Pip — the universal "Learn to Learn" buddy. Baby-schema (Kindchenschema)
 * cuteness — oversized head, huge low-set eyes, round cheeks, tiny nose, soft
 * body, springy leaf-antenna — rendered with layered shading (rim light + bottom
 * ambient occlusion) and glossy, dimensional eyes so he reads as a real little
 * creature, not a flat sticker. The face is modular (`expression`) so he can
 * actually emote; when `alive`, he breathes, blinks, and his antenna sways.
 */
export function Pip({
  size = 120,
  expression = 'happy',
  alive = true,
  className = '',
}: {
  size?: number;
  expression?: PipExpression;
  alive?: boolean;
  className?: string;
}) {
  const uid = useId();
  const id = uid.replace(/[:]/g, '');
  const style = { '--pip-delay': `${(Math.abs(hash(uid)) % 1900) / 1000}s` } as CSSProperties;

  return (
    <span className={`pip${alive ? ' pip--alive' : ''} ${className}`} style={style} role="img" aria-label="Pip">
      <svg viewBox="0 0 200 232" width={size} height={size * 1.16} aria-hidden="true">
        <defs>
          <radialGradient id={`pb-${id}`} cx="38%" cy="26%" r="86%">
            <stop offset="0%" stopColor="#d7f6de" />
            <stop offset="42%" stopColor="#8ad19f" />
            <stop offset="78%" stopColor="#55a270" />
            <stop offset="100%" stopColor="#3f8a5c" />
          </radialGradient>
          <radialGradient id={`pao-${id}`} cx="50%" cy="93%" r="62%">
            <stop offset="0%" stopColor="#143b22" stopOpacity="0" />
            <stop offset="72%" stopColor="#143b22" stopOpacity="0" />
            <stop offset="100%" stopColor="#143b22" stopOpacity=".4" />
          </radialGradient>
          <linearGradient id={`prim-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".55" />
            <stop offset="20%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`pbelly-${id}`} cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#f3fcf5" />
            <stop offset="100%" stopColor="#d4efdb" />
          </radialGradient>
          <radialGradient id={`peye-${id}`} cx="50%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="68%" stopColor="#f1f6f2" />
            <stop offset="100%" stopColor="#d6e4da" />
          </radialGradient>
          <radialGradient id={`piris-${id}`} cx="42%" cy="34%" r="74%">
            <stop offset="0%" stopColor="#3f7355" />
            <stop offset="55%" stopColor="#22422e" />
            <stop offset="100%" stopColor="#15301f" />
          </radialGradient>
          <linearGradient id={`pleaf-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a6e3b8" />
            <stop offset="100%" stopColor="#5fae79" />
          </linearGradient>
        </defs>

        {/* soft contact shadow */}
        <ellipse cx="100" cy="214" rx="52" ry="10" fill="#143b22" opacity=".16" />

        {/* antenna (sways) */}
        <g className="pip__antenna" style={{ transformOrigin: '100px 58px' }}>
          <path d="M100 58 q-11 -27 6 -44" fill="none" stroke="#4f9d6b" strokeWidth="6" strokeLinecap="round" />
          <path d="M106 14 q19 -7 22 9 q-19 7 -22 -9z" fill={`url(#pleaf-${id})`} />
          <path d="M106 14 q-16 -9 -25 5 q17 10 25 -5z" fill="#6bae7f" />
          <path d="M106 15 q9 0 18 7" fill="none" stroke="#3f8a5c" strokeWidth="1.2" opacity=".5" />
        </g>

        {/* stubby arms + feet (behind body) */}
        <path d="M40 152 q-17 2 -17 23" fill="none" stroke="#54a06f" strokeWidth="12" strokeLinecap="round" />
        <path d="M160 152 q17 2 17 23" fill="none" stroke="#54a06f" strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="80" cy="206" rx="14" ry="8.5" fill="#4a9263" />
        <ellipse cx="120" cy="206" rx="14" ry="8.5" fill="#4a9263" />

        {/* body with layered shading */}
        <path d={BODY_PATH} fill={`url(#pb-${id})`} />
        <path d={BODY_PATH} fill={`url(#pao-${id})`} />
        <path d={BODY_PATH} fill={`url(#prim-${id})`} />
        <ellipse cx="100" cy="152" rx="38" ry="42" fill={`url(#pbelly-${id})`} opacity=".7" />

        <Face expression={expression} id={id} />
      </svg>
    </span>
  );
}

/** A glossy, dimensional eye: gradient white, deep iris with a darker pupil, and
 *  two catchlights. `lx/ly` shift the gaze. */
function GlossyEye({ cx, cy, r, lx = 0, ly = 2, id }: { cx: number; cy: number; r: number; lx?: number; ly?: number; id: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={`url(#peye-${id})`} />
      <circle cx={cx + lx} cy={cy + ly} r={r * 0.62} fill={`url(#piris-${id})`} />
      <circle cx={cx + lx} cy={cy + ly} r={r * 0.32} fill="#11271a" />
      <circle cx={cx + lx - r * 0.26} cy={cy + ly - r * 0.32} r={r * 0.24} fill="#ffffff" />
      <circle cx={cx + lx + r * 0.28} cy={cy + ly + r * 0.2} r={r * 0.1} fill="#ffffff" opacity=".8" />
    </g>
  );
}

function Face({ expression, id }: { expression: PipExpression; id: string }) {
  const cheeks = (
    <>
      <ellipse cx="52" cy="154" rx="12" ry="7.5" fill="#ff9ec4" opacity=".55" />
      <ellipse cx="148" cy="154" rx="12" ry="7.5" fill="#ff9ec4" opacity=".55" />
    </>
  );
  const nose = <ellipse cx="100" cy="151" rx="3" ry="2.2" fill="#3c6b4e" />;

  switch (expression) {
    case 'excited':
      return (
        <g>
          <g className="pip__eyes">
            <path d="M76 110 l5 11 11 5 -11 5 -5 11 -5 -11 -11 -5 11 -5z" fill="#ffd45e" />
            <path d="M124 110 l5 11 11 5 -11 5 -5 11 -5 -11 -11 -5 11 -5z" fill="#ffd45e" />
          </g>
          {cheeks}
          <path d="M82 154 Q100 184 118 154 Q100 170 82 154z" fill="#21402d" />
          <path d="M94 166 Q100 172 106 166z" fill="#ff7a9c" />
        </g>
      );
    case 'curious':
      return (
        <g>
          <g className="pip__eyes"><GlossyEye cx={76} cy={126} r={20} lx={3} ly={-5} id={id} /><GlossyEye cx={124} cy={126} r={20} lx={3} ly={-5} id={id} /></g>
          {cheeks}{nose}
          <circle cx="100" cy="162" r="5.5" fill="none" stroke="#21402d" strokeWidth="3.2" />
        </g>
      );
    case 'wink':
      return (
        <g>
          <g className="pip__eyes">
            <GlossyEye cx={76} cy={126} r={20} id={id} />
            <path d="M114 124 q10 7 20 0" fill="none" stroke="#21402d" strokeWidth="4.4" strokeLinecap="round" />
          </g>
          {cheeks}
          <path d="M90 158 q12 12 26 2" fill="none" stroke="#21402d" strokeWidth="4" strokeLinecap="round" />
          <path d="M108 164 q6 5 10 -1" fill="#ff7a9c" />
        </g>
      );
    case 'thinking':
      return (
        <g>
          <g className="pip__eyes"><GlossyEye cx={76} cy={124} r={20} lx={-5} ly={-4} id={id} /><GlossyEye cx={124} cy={124} r={20} lx={-5} ly={-4} id={id} /></g>
          {cheeks}
          <path d="M90 160 q10 -3 20 0" fill="none" stroke="#21402d" strokeWidth="3.4" strokeLinecap="round" />
        </g>
      );
    case 'caring':
      return (
        <g>
          <path d="M60 122 q14 -8 28 2" fill="none" stroke="#21402d" strokeWidth="3" strokeLinecap="round" />
          <path d="M112 124 q14 -10 28 -2" fill="none" stroke="#21402d" strokeWidth="3" strokeLinecap="round" />
          <g className="pip__eyes"><GlossyEye cx={76} cy={134} r={15} id={id} /><GlossyEye cx={124} cy={134} r={15} id={id} /></g>
          {cheeks}
          <path d="M90 164 q10 6 20 0" fill="none" stroke="#21402d" strokeWidth="3.4" strokeLinecap="round" />
        </g>
      );
    case 'happy':
    default:
      return (
        <g>
          <g className="pip__eyes"><GlossyEye cx={76} cy={128} r={21} id={id} /><GlossyEye cx={124} cy={128} r={21} id={id} /></g>
          {cheeks}{nose}
          <path d="M86 159 Q100 178 114 159 Z" fill="#21402d" />
          <path d="M94 168 Q100 173 106 168 Z" fill="#ff7a9c" />
        </g>
      );
  }
}

/** tiny stable string hash → for staggering idle timing per instance */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
