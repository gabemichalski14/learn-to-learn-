import { skillInsights, type MasteryMap, type SkillInsight } from '../../mastery/mastery';
import { skillLabel } from '../../mastery/skills';
import './strengthsPanel.css';

/** A short human note for a skill, drawn from the gameplay signals. */
function note(s: SkillInsight, kind: 'strength' | 'need'): string {
  if (kind === 'strength') {
    if (s.avgMs != null && s.avgMs < 3500) return 'quick & sure';
    return s.score >= 0.95 ? 'rock solid' : 'strong';
  }
  if (s.score < 0.6) return 'needs practice';
  if (s.replays >= 3) return 'often re-hears it';
  if (s.avgMs != null && s.avgMs > 6500) return 'takes some thought';
  return 'almost there';
}

function Row({ s, kind }: { s: SkillInsight; kind: 'strength' | 'need' }) {
  const pct = Math.round(s.score * 100);
  return (
    <li className="sp-row">
      <span className="sp-row__label">{skillLabel(s.skillKey)}</span>
      <span className={`sp-bar sp-bar--${kind}`}><span className="sp-bar__fill" style={{ width: `${pct}%` }} /></span>
      <span className="sp-row__pct">{pct}%</span>
      <span className="sp-row__note">{note(s, kind)}</span>
    </li>
  );
}

/**
 * Strengths & needs at a glance, synthesised from gameplay data: accuracy plus
 * the re-hear count and response time we now collect. Actionable, not a data
 * dump — the strongest sounds on the left, the ones to work on (with *why*) on
 * the right.
 */
export function StrengthsPanel({ mastery }: { mastery: MasteryMap }) {
  const insights = skillInsights(mastery);
  if (insights.length === 0) {
    return <p className="sp-empty">A few rounds of play and each sound's strengths &amp; needs show up here.</p>;
  }
  const strengths = insights.filter((s) => s.score >= 0.8).sort((a, b) => b.score - a.score).slice(0, 4);
  const needs = insights.filter((s) => s.score < 0.8).sort((a, b) => a.score - b.score).slice(0, 4);
  return (
    <div className="sp">
      <div className="sp-col">
        <h4 className="sp-col__h sp-col__h--strength">💪 Strengths</h4>
        {strengths.length ? <ul className="sp-list">{strengths.map((s) => <Row key={s.skillKey} s={s} kind="strength" />)}</ul>
          : <p className="sp-col__none">Building these up — keep playing!</p>}
      </div>
      <div className="sp-col">
        <h4 className="sp-col__h sp-col__h--need">🎯 Work on next</h4>
        {needs.length ? <ul className="sp-list">{needs.map((s) => <Row key={s.skillKey} s={s} kind="need" />)}</ul>
          : <p className="sp-col__none">No weak spots right now — lovely work! 🌟</p>}
      </div>
    </div>
  );
}
