import { ref, readonly } from 'vue';

export type ThemeId = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  icon: 'sun' | 'moon' | 'monitor';
}

const STORAGE_KEY = 'vue-sdk-playground-theme';
const ATTRIBUTE = 'data-theme';

/**
 * Registry of available themes.
 * To add a new theme:
 * 1. Add its CSS variables in themes.css under [data-theme="<id>"]
 * 2. Add an entry here
 */
export const themes: ThemeConfig[] = [
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'system', label: 'System', icon: 'monitor' },
];

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolve(theme: ThemeId): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

function loadSaved(): ThemeId {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && themes.some((t) => t.id === saved)) return saved as ThemeId;
  return 'system';
}

// ── Singleton state ──────────────────────────────────────────────────────────
const currentTheme = ref<ThemeId>(loadSaved());
const resolvedTheme = ref<'light' | 'dark'>(resolve(currentTheme.value));

function apply(theme: ThemeId) {
  const resolved = resolve(theme);
  document.documentElement.setAttribute(ATTRIBUTE, resolved);
  resolvedTheme.value = resolved;
}

// React to OS theme changes when in 'system' mode
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (currentTheme.value === 'system') {
        apply('system');
      }
    });
}

export function useThemeSwitch() {
  function setTheme(theme: ThemeId) {
    currentTheme.value = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    apply(theme);
  }

  function toggleTheme() {
    const next = resolvedTheme.value === 'light' ? 'dark' : 'light';
    setTheme(next);
  }

  // Apply immediately on first call (idempotent — safe to call multiple times)
  apply(currentTheme.value);

  return {
    /** The user's chosen theme ID (may be 'system') */
    currentTheme: readonly(currentTheme),
    /** The actual resolved theme ('light' or 'dark') */
    resolvedTheme: readonly(resolvedTheme),
    /** All registered themes */
    themes,
    /** Set a specific theme */
    setTheme,
    /** Quick toggle between light ↔ dark */
    toggleTheme,
  };
}
