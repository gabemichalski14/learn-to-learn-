/**
 * Durable queue of pending cloud writes. Gameplay enqueues; flush() drains it
 * through an injected writer when online + signed in. Append-only payloads mean
 * flush order is irrelevant and "both places" merges cleanly. Guarded so a cloud
 * problem never blocks play.
 */
export type OutboxKind = 'skill_event' | 'session' | 'achievement';

export interface OutboxItem {
  id: string;
  kind: OutboxKind;
  localLearnerId: string;
  payload: unknown;
  tries: number;
}

export const MAX_OUTBOX = 2000;
const KEY = 'll-outbox';

function read(): OutboxItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? (v as OutboxItem[]) : [];
  } catch {
    return [];
  }
}
function write(items: OutboxItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(-MAX_OUTBOX)));
  } catch {
    /* ignore (quota / private mode) */
  }
}

export function allItems(): OutboxItem[] {
  return read();
}

export function enqueue(item: Omit<OutboxItem, 'id' | 'tries'>): void {
  const items = read();
  items.push({ ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, tries: 0 });
  write(items);
}

/**
 * Drain the queue. `writer` returns true on success (item removed) or false on
 * failure (item kept, tries incremented). Never throws.
 */
export async function flush(writer: (item: OutboxItem) => Promise<boolean>): Promise<void> {
  const items = read();
  const keep: OutboxItem[] = [];
  for (const item of items) {
    let ok = false;
    try {
      ok = await writer(item);
    } catch {
      /* writer threw — treat as failure, ok stays false */
    }
    if (!ok) keep.push({ ...item, tries: item.tries + 1 });
  }
  write(keep);
}
