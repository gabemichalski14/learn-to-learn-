import type { ReactNode } from 'react';
import './hubHeader.css';

/**
 * The ONE shared header for every level hub: a back button pinned to the left and
 * the level title CENTERED — identical placement on every world (themed only by
 * the per-world `prefix`: gd-/sg-/wk-… supplies the back + badge colors).
 *
 * Using this everywhere is the fail-safe: hubs can't drift apart in header layout
 * because they no longer hand-roll their own header markup.
 */
export function HubHeader({ prefix, back, badge }: {
  /** per-world CSS prefix for theming, e.g. "gd" → gd-back / gd-badge. */
  prefix: string;
  back: { label: string; onClick: () => void };
  /** the level title, e.g. <><Icon …/> Sound Garden · Level 1</>. */
  badge: ReactNode;
}) {
  return (
    <div className="hub-hud">
      <button type="button" className={`hub-hud__back ${prefix}-back`} onClick={back.onClick}>{back.label}</button>
      <span className={`hub-hud__title ${prefix}-badge`}>{badge}</span>
    </div>
  );
}
