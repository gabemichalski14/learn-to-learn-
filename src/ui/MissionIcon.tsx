import type { CSSProperties } from 'react';
import { Icon } from './Icon';
import './missionIcon.css';

/**
 * The shared game-icon "chip" for every level hub's mission cards. ONE place owns
 * the icon treatment so hubs can't drift:
 *  - a consistent, larger size (easy to see) without changing the card,
 *  - a rounded, clipped container — so an icon PNG that ships with an opaque
 *    SQUARE background reads as a clean rounded badge (not a raw square), and a
 *    transparent PNG sits on a soft themed badge,
 *  - per-world theming via the `accent` color.
 * New hubs render <MissionIcon>; they never style a raw <Icon> in a card again.
 */
export function MissionIcon({ name, emoji, accent }: { name: string; emoji: string; accent?: string }) {
  return (
    <span className="mission-ico" style={accent ? ({ '--mission-accent': accent } as CSSProperties) : undefined} aria-hidden="true">
      <Icon name={name} emoji={emoji} className="mission-ico__img" />
    </span>
  );
}
