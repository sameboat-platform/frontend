# Things To Do (TTD)

## UI/UX

-   Debounce rapid backend health status flips by enforcing a minimum skeleton display duration.
-   Expose backend health refresh interval via `VITE_HEALTH_REFRESH_MS` environment variable.
-   Add a global `<AnimatePresence>` around route transitions for cohesive page motion.
-   Add a small UI control (dropdown or input) in dev mode to adjust the interval live.
-   Persist preferred interval in localStorage for dev tuning.
-   Animate auth form page transitions distinctly (scale + fade) separate from general routes.
-   Add reduced motion support: disable transitions if user prefers reduced motion (respect `prefers-reduced-motion`).
-   Add copy-to-clipboard button for User ID.
-   Lazy-load avatar with generated identicon fallback.
-   Show lastFetched timestamp and manual refresh (leveraging existing auth context).
-   Introduce a compact mobile variant hiding the identifiers section behind a disclosure.
-   Add a layout test to ensure footer positioning (e.g., snapshot with small content).
-   Implement reduced motion media query to disable route transitions.
-   Pause-on-error behavior for health auto-refresh (stop interval after consecutive failures until manual retry).
-   Add additional env var typings & sample `.env.example` for debug / feature flags (e.g. `VITE_DEBUG_AUTH`, `VITE_HEALTH_REFRESH_MS`, future flags).
-   Add sticky top navigation bar (reuse `Layout` / extend `AppShell` with nav actions, responsive collapse if needed).
-   Implement reduced motion guard using `window.matchMedia('(prefers-reduced-motion: reduce)')` before triggering animations.

## Notes

Add new sections here as areas expand (e.g., Testing, Performance, Accessibility).
