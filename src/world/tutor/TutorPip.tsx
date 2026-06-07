import { Pip } from '../../mascots/Pip';
import { tutorTipsFor } from './tutorTips';
import type { MasteryMap } from '../../mastery/mastery';
import './tutorPip.css';

/**
 * Pip's coaching corner on the tutor dashboard. Unlike the child-facing roaming
 * buddy, here Pip speaks to the grown-up with concrete, data-driven next steps
 * for THIS student. Read-only; no animation beyond Pip's own idle.
 */
export function TutorPip({ mastery, name }: { mastery: MasteryMap; name: string }) {
  const tips = tutorTipsFor(mastery, name);
  return (
    <div className="l2l-card tutorpip" aria-labelledby="tutorpip-h">
      <div className="tutorpip__head">
        <span className="tutorpip__pip" aria-hidden="true"><Pip size={60} expression="happy" /></span>
        <div>
          <p className="l2l-eyebrow">Pip's coaching corner</p>
          <h3 id="tutorpip-h" className="chart-card__title" style={{ margin: 0 }}>How to help {name} next</h3>
        </div>
      </div>
      <ul className="tutorpip__list">
        {tips.map((t) => (
          <li key={t.id} className="tutorpip__tip">
            <strong className="tutorpip__title">{t.title}</strong>
            <p className="tutorpip__body">{t.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
