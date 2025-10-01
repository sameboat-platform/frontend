export interface AuthUser {
    id: string;
    email: string;
    roles?: string[];
}

export interface AuthState {
    user: AuthUser | null;
    status: "idle" | "loading" | "authenticated" | "error";
    errorCode?: string;
    errorMessage?: string;
    lastFetched?: number; // epoch ms when /me last succeeded
    bootstrapped?: boolean; // true after first refresh attempt completes
}

export interface AuthActions {
    login(email: string, password: string): Promise<boolean>;
    register(email: string, password: string): Promise<boolean>;
    refresh(): Promise<void>;
    logout(): Promise<void>;
    clearError(): void;
}

export type AuthStore = AuthState & AuthActions;
