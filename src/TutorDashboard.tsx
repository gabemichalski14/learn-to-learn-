import { navigate } from './router';
import { SessionLogPanel } from './SessionLogPanel';

/** Full-page tutor view of the session log (same data as the in-game modal). */
export function TutorDashboard() {
  return (
    <main className="site site--page">
      <button type="button" className="back-btn" onClick={() => navigate('#/')}>← Home</button>
      <h1 className="site__title">Tutor Dashboard</h1>
      <p className="page__lead">Every finished session, recorded so you can track a student's progress over weeks.</p>
      <div className="page__panel">
        <SessionLogPanel />
      </div>
    </main>
  );
}
