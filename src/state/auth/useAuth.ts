import { useAuthStore } from './store';

// Public hook. Components import ONLY from this file so we can
// swap implementation details without touching call sites.
export function useAuth() {
    return useAuthStore();
}
