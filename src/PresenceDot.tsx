import { presenceState, presenceLabel } from './presence';
import './presence.css';

/** A small status dot: green = on the platform now, amber = active recently,
 *  grey = offline. Carries a text label (title + aria-label) for context. */
export function PresenceDot({ lastActive, size = 9, withText = false }: { lastActive: number | null; size?: number; withText?: boolean }) {
  const state = presenceState(lastActive);
  const label = presenceLabel(lastActive);
  return (
    <span className="presence-wrap">
      <span className={`presence presence--${state}`} style={{ width: size, height: size }} role="img" aria-label={label} title={label} />
      {withText && <span className="presence-text">{label}</span>}
    </span>
  );
}
