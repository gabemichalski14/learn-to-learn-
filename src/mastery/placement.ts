import { levelCurriculum } from '../curriculum';

export interface Placement { level: number; lesson: number; }
export interface NextItem {
  kind: 'lesson' | 'level';
  level: number;
  lesson?: number;
  title: string;
}

const key = (learnerId: string) => `ll:${learnerId}:placement`;

export function getPlacement(learnerId: string): Placement {
  try {
    const v = JSON.parse(localStorage.getItem(key(learnerId)) ?? 'null');
    if (v && typeof v.level === 'number' && typeof v.lesson === 'number') return v;
  } catch {
    /* ignore */
  }
  return { level: 1, lesson: 1 };
}

export function setPlacement(learnerId: string, level: number, lesson: number): void {
  try {
    localStorage.setItem(key(learnerId), JSON.stringify({ level, lesson }));
  } catch {
    /* ignore */
  }
}

/** Up to `count` upcoming lesson items plus the next-level pointer.
 *  The next-level entry is always appended (not counted against `count`). */
export function nextUp(level: number, lesson: number, count = 3): NextItem[] {
  const out: NextItem[] = [];
  const cur = levelCurriculum(level);
  if (cur) {
    for (const l of cur.lessons) {
      if (l.n > lesson && out.length < count) {
        out.push({ kind: 'lesson', level, lesson: l.n, title: l.title });
      }
    }
  }
  const next = levelCurriculum(level + 1);
  if (next) out.push({ kind: 'level', level: level + 1, title: next.title });
  return out;
}
