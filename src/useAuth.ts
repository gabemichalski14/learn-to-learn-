import { useEffect, useState } from 'react';
import { getCurrentUser, onAuthChange } from './data/cloud';

/**
 * True when a tutor account is signed in. Tutors are the only authenticated
 * role in SP1 (parents arrive in SP2), so this gates tutor-only surfaces like
 * the Tutor Dashboard. No-op / false when Supabase isn't configured.
 */
export function useTutorSignedIn(): boolean {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    let live = true;
    void getCurrentUser().then((u) => { if (live) setSignedIn(!!u); });
    const unsub = onAuthChange((s) => { if (live) setSignedIn(s); });
    return () => { live = false; unsub(); };
  }, []);
  return signedIn;
}
