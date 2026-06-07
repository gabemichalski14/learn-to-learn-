/** Shared garden-growth math + palette (kept out of the component files so Fast
 *  Refresh stays happy). Bloom count = real practice made visible: sessions +
 *  earned stickers, capped, never decaying. */
export const GARDEN_FLOWERS = ['🌷', '🌸', '🌼', '🌻', '🌺', '🪻', '🌹', '💐'];
export const GARDEN_MAX = 64;

export function bloomCount(sessions: number, stickers: number): number {
  return Math.min(GARDEN_MAX, sessions * 6 + stickers + 3);
}
