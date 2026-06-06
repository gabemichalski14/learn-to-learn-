import { useState } from 'react';
import { navigate } from './router';
import { areasToImprove, type FocusArea } from './mastery/mastery';
import { skillLabel } from './mastery/skills';
import { skillHelp } from './mastery/skill-help';
import { practiceRouteForSkill } from './mastery/skill-games';

/** "Areas to improve" — weak skills with What/Why/How + a targeted practice link. */
export function AreasToImprove({ learnerId, focus }: { learnerId: string; focus?: FocusArea[] }) {
  const areas = focus ?? areasToImprove(learnerId, 3);
  const [open, setOpen] = useState<string | null>(areas[0]?.skillKey ?? null);

  if (areas.length === 0) {
    return (
      <div className="atimprove">
        <h4 className="atimprove__h">⭐ Areas to improve</h4>
        <p className="atimprove__empty">Play a few rounds and personalized focus areas will appear here.</p>
      </div>
    );
  }

  return (
    <div className="atimprove">
      <h4 className="atimprove__h">⭐ What to practice next</h4>
      {areas.map((a) => {
        const help = skillHelp(a.skillKey);
        const route = practiceRouteForSkill(a.skillKey);
        const isOpen = open === a.skillKey;
        const pct = Math.round(a.score * 100);
        return (
          <div key={a.skillKey} className={`focus${isOpen ? ' focus--open' : ''}`}>
            <button type="button" className="focus__bar" onClick={() => setOpen(isOpen ? null : a.skillKey)} aria-expanded={isOpen}>
              <span className="focus__ring" style={{ background: `conic-gradient(var(--teal-deep) 0 ${pct}%, var(--teal-soft) ${pct}% 100%)` }}>
                <i>{pct}%</i>
              </span>
              <span className="focus__title">{skillLabel(a.skillKey)}</span>
              <span className="focus__chev" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
            </button>
            {isOpen && (
              <div className="focus__body">
                <p><b>What:</b> {help.what}</p>
                <p><b>Why it helps:</b> {help.why}</p>
                <p className="focus__tip">💡 {help.tip}</p>
                {route && (
                  <button type="button" className="focus__play" onClick={() => navigate(route)}>▶ Practice this</button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
