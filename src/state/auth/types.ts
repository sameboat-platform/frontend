// src/auth/types.ts

export type AuthErrorCode =
  | "BAD_CREDENTIALS"
  | "ACCOUNT_LOCKED"
  | "USER_DISABLED"
  | "RATE_LIMITED"
  | "NETWORK"
  | "SERVER_ERROR"
  | "UNKNOWN";

export interface AuthUser {
  id: string;
  email: string;
  roles?: string[];
  displayName?: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "error";
  errorCode?: AuthErrorCode;
  errorMessage?: string;
  lastFetched?: number;      // ms since epoch when /me last succeeded
  bootstrapped?: boolean;    // true after first refresh attempt completes

  // NEW: helpful for redirects + avoiding race conditions
  intendedPath?: string | null;
  inFlight?: boolean;        // or: busy?: { refresh: boolean; login: boolean; logout: boolean }
}

export interface AuthActions {
  login(email: string, password: string): Promise<boolean>;
  register(email: string, password: string): Promise<boolean>;
  refresh(): Promise<void>;
  logout(): Promise<void>;
  clearError(): void;

  // NEW: redirect helpers
  setIntendedPath(path: string | null): void;
}

export type AuthStore = AuthState & AuthActions;
