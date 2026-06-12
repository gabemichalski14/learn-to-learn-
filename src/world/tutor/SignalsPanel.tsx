import type { SkillEvent } from '../../mastery/events';
import { skillLabel } from '../../mastery/skills';
import { tutorSignalSummary } from '../../signals/summary';

/**
 * Tutor-facing "deeper signals" card — surfaces what the derivation layer sees that
 * the score-based panels miss: skills practised hard without converging (try a new
 * approach), skills that are accurate-but-not-yet-fluent (needs fluency practice),
 * and skills coming along. Behavioral signals to guide teaching — framed honestly,
 * never as a diagnosis, never showing a speed "target" to chase.
 */
export function SignalsPanel({ events, name }: { events: SkillEvent[]; name: string }) {
  const sig = tutorSignalSummary(events);
  if (sig.stuck.length === 0 && sig.effortful.length === 0 && sig.improving.length === 0) return null;

  return (
    <div className="l2l-card" style={{ marginTop: '16px' }}>
      <h3 className="chart-card__title">📈 Deeper signals</h3>
      <p className="dash-engage">Behavioral signals from how {name} plays — a guide for teaching, not a diagnosis.</p>

      {sig.stuck.length > 0 && (
        <>
          <p className="dash-next__eyebrow">🔁 Worth a fresh approach</p>
          <ul className="dash-fresh">
            {sig.stuck.slice(0, 5).map((s) => (
              <li key={s}>{skillLabel(s)} — lots of practice, hasn't clicked yet. Re-teach it a new way rather than more of the same.</li>
            ))}
          </ul>
        </>
      )}

      {sig.effortful.length > 0 && (
        <>
          <p className="dash-next__eyebrow">🐢 Accurate, not yet automatic</p>
          <ul className="dash-fresh">
            {sig.effortful.slice(0, 5).map((s) => (
              <li key={s}>{skillLabel(s)} — gets it right, but still effortful. A little more practice builds fluency.</li>
            ))}
          </ul>
        </>
      )}

      {sig.improving.length > 0 && (
        <>
          <p className="dash-next__eyebrow">✅ Coming along</p>
          <ul className="dash-fresh">
            {sig.improving.slice(0, 5).map((s) => (
              <li key={s}>{skillLabel(s)} — getting faster and surer with practice.</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
