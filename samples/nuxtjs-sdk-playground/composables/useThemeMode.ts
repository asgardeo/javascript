/**
 * useThemeMode — playground palette + dark-mode composable.
 *
 * SSR-safe: state is read from localStorage on mount, written back on every
 * change. `data-theme` and `data-theme-mode` attributes on <html> are
 * updated so CSS [data-theme="..."] selectors pick up the change immediately.
 *
 * The layout wraps its root div with both attributes so the scope is
 * constrained to the layout element (no flash-of-wrong-theme from the html
 * element in SSR).
 */
import { ref, onMounted } from 'vue';

const STORAGE_THEME = 'asgardeo-playground-theme';
const STORAGE_MODE  = 'asgardeo-playground-mode';

export type ThemeName = 'orange' | 'blue';
export type ThemeMode  = 'light'  | 'dark';

const theme = ref<ThemeName>('orange');
const mode  = ref<ThemeMode>('light');

function applyToDocument() {
  if (import.meta.client) {
    document.documentElement.dataset['theme']     = theme.value;
    document.documentElement.dataset['themeMode'] = mode.value;
  }
}

export function useThemeMode() {
  onMounted(() => {
    const savedTheme = localStorage.getItem(STORAGE_THEME) as ThemeName | null;
    const savedMode  = localStorage.getItem(STORAGE_MODE)  as ThemeMode  | null;
    if (savedTheme && (savedTheme === 'orange' || savedTheme === 'blue')) {
      theme.value = savedTheme;
    }
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      mode.value = savedMode;
    }
    applyToDocument();
  });

  function setTheme(newTheme: ThemeName) {
    theme.value = newTheme;
    if (import.meta.client) {
      localStorage.setItem(STORAGE_THEME, newTheme);
    }
    applyToDocument();
  }

  function setMode(newMode: ThemeMode) {
    mode.value = newMode;
    if (import.meta.client) {
      localStorage.setItem(STORAGE_MODE, newMode);
    }
    applyToDocument();
  }

  function toggleMode() {
    setMode(mode.value === 'light' ? 'dark' : 'light');
  }

  return { theme, mode, setTheme, setMode, toggleMode };
}
