/**
 * Site-wide footer. Carries the copyright line and an independence/trademark
 * disclaimer so the app never implies affiliation with the Barton Reading &
 * Spelling System® (a registered trademark of its owner). Shown on the
 * non-immersive chrome pages, not inside a running game.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="l2l-footer no-print" role="contentinfo">
      <p className="l2l-footer__brand">© {year} Learn to Learn Tutoring Solutions</p>
      <p className="l2l-footer__legal">
        An independent practice tool aligned to structured-literacy methods. Not
        affiliated with, endorsed by, or derived from the Barton Reading &amp;
        Spelling System®.
      </p>
    </footer>
  );
}
