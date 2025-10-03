import { useAuthContext } from "./auth-context";

// Public hook re-export. Components import ONLY from this file so we can
// later swap implementation (e.g., Zustand) without touching call sites.
export function useAuth() {
    return useAuthContext();
}
