import type { ReactNode } from 'react';

/**
 * GameShell — the CONGRUENT chrome shared by every game screen, so the back
 * button, title badge, progress bar and mute toggle sit in the same place on
 * every level. Structure is identical; appearance is themed by each world's
 * existing CSS `prefix` (gd- / sg- / wk- …), so a level keeps its look while its
 * layout matches the rest.
 *
 * Layout: [backdrop] then a HUD row — back button (left), title badge (center),
 * and a right group (optional extra e.g. a combo chip, the progress segment-bar,
 * and the mute toggle). The game's stage + finish are passed as `children`.
 */
export function GameShell({
  prefix, rootClass, backdrop, back, badge, current, total, muted, onToggleMute, rightExtra, children,
}: {
  /** CSS class prefix for the chrome, e.g. "gd" → gd-hud/gd-back/gd-badge/gd-seg/gd-mute. */
  prefix: string;
  /** The full <main> className (world base + any screen modifier, e.g. "gd sd"). */
  rootClass: string;
  /** The world backdrop element (rendered first, behind the HUD + stage). */
  backdrop?: ReactNode;
  back: { label: string; onClick: () => void };
  /** Title content for the badge, e.g. <>🌱 Tap It Out · Word 3</>. */
  badge: ReactNode;
  /** 0-based current step for the segment bar. */
  current?: number;
  /** Total steps; omit to hide the segment bar. */
  total?: number;
  muted?: boolean;
  /** Provide to show the mute toggle; omit to hide it. */
  onToggleMute?: () => void;
  /** Optional right-aligned extra (before the segments), e.g. a combo chip. */
  rightExtra?: ReactNode;
  children: ReactNode;
}) {
  const cur = current ?? 0;
  return (
    <main className={rootClass}>
      {backdrop}
      <div className={`${prefix}-hud`}>
        <button type="button" className={`${prefix}-back`} onClick={back.onClick}>{back.label}</button>
        <span className={`${prefix}-badge`}>{badge}</span>
        <span className={`${prefix}-hud__right`}>
          {rightExtra}
          {total != null && total > 0 && (
            <span className={`${prefix}-seg`} aria-label={`Step ${Math.min(cur + 1, total)} of ${total}`}>
              {Array.from({ length: total }).map((_, i) => <i key={i} className={i <= cur ? 'on' : ''} />)}
            </span>
          )}
          {onToggleMute && (
            <button type="button" className={`${prefix}-mute`} onClick={onToggleMute} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={muted}>{muted ? '🔇' : '🔊'}</button>
          )}
        </span>
      </div>
      {children}
    </main>
  );
}
