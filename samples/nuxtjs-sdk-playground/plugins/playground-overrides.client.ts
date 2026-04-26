/**
 * Playground overrides — client-only plugin.
 *
 * Runs in dev mode only. On app boot it:
 *   1. Reads the stored playground theme mode (light/dark) from localStorage
 *      and re-applies it to the document so the correct class is present from
 *      the very first paint (the shared useThemeMode composable also does this
 *      in onMounted, but this plugin fires slightly earlier).
 *
 * i18n locale: the SDK's I18nProvider already persists the selected language
 * via its own cookie/localStorage storage and restores it automatically on
 * initialisation — no plugin-level restore is needed.
 */
import { useThemeMode } from '~/composables/useThemeMode';
import { OVERRIDE_KEYS } from '~/utils/playground-overrides';

export default defineNuxtPlugin(() => {
  // Only run in development. In production the token debugger is disabled and
  // editing live overrides is not meaningful.
  if (!import.meta.dev) return;

  // Re-apply the playground theme mode as early as possible to avoid a
  // flash-of-wrong-theme. useThemeMode() does the same in its onMounted hook;
  // doing it here means the document attributes are set before any SSR hydration.
  const stored = typeof window !== 'undefined'
    ? window.localStorage.getItem(OVERRIDE_KEYS.THEME_MODE)
    : null;

  if (stored === 'light' || stored === 'dark') {
    const { setMode } = useThemeMode();
    setMode(stored);
  }
});
