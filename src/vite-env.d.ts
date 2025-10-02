/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    /** Enable verbose auth console diagnostics when set (any truthy string). */
    readonly VITE_DEBUG_AUTH?: string;
    /** Force auth bootstrap heartbeat / timing diagnostics. */
    readonly VITE_DEBUG_AUTH_BOOTSTRAP?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
