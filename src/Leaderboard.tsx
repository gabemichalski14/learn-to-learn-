import { navigate } from './router';
import { loadProgress, formatTime } from './progress';
import { ACHIEVEMENTS } from './achievements';

/**
 * Placeholder for the eventual tutoring-center-wide leaderboard. For now it
 * shows this device's own stats; once there's a backend + learner identity it
 * becomes the cross-center board (top times / most stickers).
 */
export function Leaderboard() {
  const { earned, bestMs, sessions } = loadProgress();

  return (
    <main className="site site--page">
      <button type="button" className="back-btn" onClick={() => navigate('#/')}>← Home</button>
      <h1 className="site__title">Leaderboard</h1>
      <p className="page__lead">
        Center-wide leaderboards are coming soon — students will compare best times and stickers
        across the whole tutoring center.
      </p>

      <div className="page__panel">
        <h2 className="site__h2">Your progress</h2>
        <div className="book__stats">
          <span className="book__stat"><strong>{new Set(earned).size}</strong>/{ACHIEVEMENTS.length}<br />stickers</span>
          <span className="book__stat"><strong>{sessions}</strong><br />sessions</span>
          <span className="book__stat"><strong>{bestMs != null ? formatTime(bestMs) : '—'}</strong><br />best time</span>
        </div>
        <p className="page__note">Showing your own progress on this device until center accounts are added.</p>
      </div>
    </main>
  );
}
