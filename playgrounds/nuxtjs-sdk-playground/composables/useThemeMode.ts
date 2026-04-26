/**
 * useThemeMode — playground palette + dark-mode composable.
 *
 * SSR-safe: refs are initialised from localStorage at module-load time on the
 * client so they already hold the persisted values when the first component
 * setup runs — eliminating the flash-of-wrong-theme that appeared when the
 * restore only happened inside onMounted (after the initial render).
 *
 * `data-theme` and `data-theme-mode` are written to <html> immediately on
 * module load (client-only) so all CSS variables resolve correctly before
 * Vue hydrates the page.
 */
import { ref, onMounted } from 'vue';

const STORAGE_THEME = 'asgardeo-playground-theme';
const STORAGE_MODE  = 'asgardeo-playground-mode';

export type ThemeName = 'orange' | 'blue';
export type ThemeMode  = 'light'  | 'dark';

// ── Read persisted preference from localStorage (client-only) ──────────────
// import.meta.client is replaced at build time: true in the browser bundle,
// false in the SSR bundle. The SSR bundle falls back to the defaults below.
function readStored<T extends string>(key: string, valid: readonly T[]): T | null {
  if (!import.meta.client) return null;
  try {
    const v = localStorage.getItem(key) as T | null;
    return v && (valid as ReadonlyArray<string>).includes(v) ? v : null;
  } catch {
    return null;
  }
}

const theme = ref<ThemeName>(readStored(STORAGE_THEME, ['orange', 'blue'] as const) ?? 'orange');
const mode  = ref<ThemeMode> (readStored(STORAGE_MODE,  ['light',  'dark'] as const) ?? 'light');

function applyToDocument() {
  if (import.meta.client) {
    document.documentElement.dataset['theme']     = theme.value;
    document.documentElement.dataset['themeMode'] = mode.value;
  }
}

// Apply to <html> immediately on module load (client bundle only) so body's
// background-color CSS variable is correct before Vue hydrates.
applyToDocument();

export function useThemeMode() {
  onMounted(() => {
    // Re-sync <html> after mount in case the DOM was reset during hydration.
    applyToDocument();
  });

  function setTheme(newTheme: ThemeName) {
    theme.value = newTheme;
    if (import.meta.client) localStorage.setItem(STORAGE_THEME, newTheme);
    applyToDocument();
  }

  function setMode(newMode: ThemeMode) {
    mode.value = newMode;
    if (import.meta.client) localStorage.setItem(STORAGE_MODE, newMode);
    applyToDocument();
  }

  function toggleMode() {
    setMode(mode.value === 'light' ? 'dark' : 'light');
  }

  return { theme, mode, setTheme, setMode, toggleMode };
}
