/**
 * Online / "on the platform" presence — the universally-recognised green dot.
 * Research: a ~5-minute window is the common "active now" standard, and a status
 * dot wants a text label for context. We derive presence from the freshest
 * LAST-ACTIVITY timestamp we already have — the cloud `last_played` (updated and
 * synced whenever a learner finishes a round, so it works cross-device) or a
 * local heartbeat for this device's active learner — so it needs no new infra.
 */
const ONLINE_MS = 5 * 60_000;    // "on the platform now"
const RECENT_MS = 30 * 60_000;   // active recently

export type Presence = 'online' | 'recent' | 'offline';

export function presenceState(lastActive: number | null, now = Date.now()): Presence {
  if (lastActive == null) return 'offline';
  const dt = now - lastActive;
  if (dt <= ONLINE_MS) return 'online';
  if (dt <= RECENT_MS) return 'recent';
  return 'offline';
}

export function presenceLabel(lastActive: number | null, now = Date.now()): string {
  if (lastActive == null) return 'Not on the platform yet';
  const dt = Math.max(0, now - lastActive);
  if (dt <= ONLINE_MS) return 'On the platform now';
  const mins = Math.round(dt / 60_000);
  if (mins < 60) return `Active ${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `Active ${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return `Active ${days} day${days === 1 ? '' : 's'} ago`;
}

export function parseTs(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

// ---- local heartbeat (this device's active learner) ----
const KEY = (id: string) => `ll-seen-${id}`;

/** Stamp "this learner is active right now" on this device. */
export function markActive(id: string): void {
  try { localStorage.setItem(KEY(id), String(Date.now())); } catch { /* storage off */ }
}
export function localSeen(id: string): number | null {
  try { const v = localStorage.getItem(KEY(id)); return v ? Number(v) : null; } catch { return null; }
}

/** Freshest of a cloud `last_played` and this device's local heartbeat. */
export function lastActiveOf(id: string, cloudIso?: string | null): number | null {
  const a = parseTs(cloudIso ?? null);
  const b = localSeen(id);
  if (a == null) return b;
  if (b == null) return a;
  return Math.max(a, b);
}
