/**
 * Environment helpers for gating code by build/runtime context.
 *
 * Why this exists:
 * - We want a single, well-documented source of truth for environment checks
 *   instead of sprinkling `import.meta.env.DEV` / `PROD` throughout the codebase.
 * - Using a helper makes intent clear and enables future changes (e.g., treat
 *   preview as prod) without touching many call sites.
 *
 * Usage patterns:
 * - Component that must never run effects in production:
 *   function DevOnlyWidget() {
 *     if (isProd()) return null; // place BEFORE any hooks
 *     // ... hooks/effects here ...
 *     return <UI/>;
 *   }
 *
 * - Conditional render at call-site for tree-shaking and clarity:
 *   {isDev() && <DevOnlyWidget />}
 */

/** Returns true when running a development build in Vite. */
export function isDev(): boolean {
  return Boolean(import.meta.env?.DEV);
}

/** Returns true when running a production build in Vite. */
export function isProd(): boolean {
  return Boolean(import.meta.env?.PROD);
}

/** Returns true when running under test (e.g., Vitest). */
export function isTest(): boolean {
  return import.meta.env?.MODE === 'test';
}
