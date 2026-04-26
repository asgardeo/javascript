/**
 * Playground overrides — client-only plugin.
 *
 * Ensures <html> data-theme / data-theme-mode attributes are in sync with the
 * persisted preference before Vue hydrates, complementing the module-level
 * initialisation in useThemeMode.ts.
 *
 * i18n locale: the SDK's I18nProvider already persists the selected language
 * via its own cookie/localStorage storage and restores it automatically on
 * initialisation — no plugin-level restore is needed.
 */
import { useThemeMode } from '~/composables/useThemeMode';

export default defineNuxtPlugin(() => {
  // useThemeMode already initialises the refs from localStorage at module-load
  // time and calls applyToDocument(). Calling it here (before Vue hydrates)
  // re-applies the <html> attributes one more time so any DOM reset that Nuxt
  // performs during plugin setup is immediately corrected.
  const { theme, mode, setTheme, setMode } = useThemeMode();
  setTheme(theme.value);
  setMode(mode.value);
});
