/**
 * Typed localStorage helpers for playground runtime overrides.
 *
 * Using these helpers keeps key strings typo-proof across
 * playground-overrides.client.ts and pages/tools/config.vue.
 */

/** All playground override keys in one place. */
export const OVERRIDE_KEYS = {
  /** Playground UI color palette — 'orange' | 'blue' */
  THEME_PALETTE: 'asgardeo-playground-theme',
  /** Playground UI mode — 'light' | 'dark' */
  THEME_MODE:    'asgardeo-playground-mode',
  /** i18n locale override (e.g. 'en-US'). */
  I18N_LOCALE:   'asgardeo-playground:i18n.locale',
} as const;

export type OverrideKey = (typeof OVERRIDE_KEYS)[keyof typeof OVERRIDE_KEYS];

/** Read a playground override value from localStorage. Returns null when not set or on error. */
export function readOverride(key: OverrideKey): string | null {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

/** Persist a playground override value to localStorage. */
export function writeOverride(key: OverrideKey, value: string): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, value); } catch {}
}

/** Remove a playground override from localStorage. */
export function clearOverride(key: OverrideKey): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(key); } catch {}
}
