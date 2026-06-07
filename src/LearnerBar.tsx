import { addLearner, initials } from './profiles';
import { useLearners } from './data/store';

interface Props {
  learnerId: string;
  onSelect: (id: string) => void;
}

/** "Who's playing?" selector — the tutor picks/adds the student before handing over. */
export function LearnerBar({ learnerId, onSelect }: Props) {
  const learners = useLearners(); // live: re-renders when the roster changes

  function add() {
    const name = window.prompt('New player name:');
    if (name === null) return;
    const learner = addLearner(name); // notifies → useLearners updates automatically
    onSelect(learner.id);
  }

  return (
    <div className="learnerbar" aria-label="Who is playing">
      <span className="learnerbar__label">Playing as</span>
      <div className="learnerbar__chips">
        {learners.map((l) => {
          const active = l.id === learnerId;
          return (
            <button
              key={l.id}
              type="button"
              className={`learner-chip${active ? ' learner-chip--active' : ''}`}
              onClick={() => onSelect(l.id)}
              aria-pressed={active}
            >
              <span className="learner-chip__avatar" style={{ background: l.color }} aria-hidden="true">
                {initials(l.name)}
              </span>
              <span className="learner-chip__name">{l.name}</span>
            </button>
          );
        })}
        <button type="button" className="learner-chip learner-chip--add" onClick={add} aria-label="Add a player">
          <span className="learner-chip__avatar learner-chip__avatar--add" aria-hidden="true">+</span>
          <span className="learner-chip__name">Add</span>
        </button>
      </div>
    </div>
  );
}
