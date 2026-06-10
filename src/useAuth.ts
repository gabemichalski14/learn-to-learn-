import { useEffect, useState } from 'react';
import { getCurrentUser, onAuthChange, getRole } from './data/cloud';

export type Role = 'owner' | 'tutor' | 'parent';

/**
 * The signed-in user's role (server-derived). `undefined` while loading, `null`
 * when signed out / no role yet. Refreshes on auth changes.
 */
export function useRole(): Role | null | undefined {
  const [role, setRole] = useState<Role | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    const refresh = () => { void getRole().then((r) => { if (live) setRole(r); }); };
    refresh();
    const unsub = onAuthChange(() => refresh());
    return () => { live = false; unsub(); };
  }, []);
  return role;
}

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
