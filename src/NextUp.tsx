import { getPlacement, nextUp } from './mastery/placement';

/** Shows what's coming after the learner's current lesson/level. */
export function NextUp({ learnerId }: { learnerId: string }) {
  const { level, lesson } = getPlacement(learnerId);
  const items = nextUp(level, lesson, 3);
  if (items.length === 0) return null;
  return (
    <div className="nextup">
      <h4 className="nextup__h">🚀 Next up</h4>
      {items.map((it) => (
        <div key={`${it.kind}-${it.level}-${it.lesson ?? 0}`} className="nextup__row">
          <span className="nextup__pill">{it.kind === 'lesson' ? `Lesson ${it.lesson}` : 'Then'}</span>
          <span className="nextup__title">
            {it.kind === 'level' ? `Level ${it.level} · ${it.title}` : it.title}
          </span>
        </div>
      ))}
    </div>
  );
}
