<script setup lang="ts">
import { watch } from 'vue';
import { useTheme } from '@asgardeo/vue';
import { useThemeSwitch, type ThemeConfig } from '@/composables/useThemeSwitch';

const { currentTheme, resolvedTheme, setTheme, themes } = useThemeSwitch();

// Sync SDK ThemeProvider's colorScheme with the playground's resolved theme.
// ThemeSwitcher is rendered inside <AsgardeoProvider>, so useTheme() is available.
const { colorScheme, toggleTheme } = useTheme();
watch(
  resolvedTheme,
  (newTheme) => {
    if (newTheme !== colorScheme.value) {
      toggleTheme();
    }
  },
  { immediate: true },
);

function iconPath(icon: ThemeConfig['icon']): string {
  switch (icon) {
    case 'sun':
      return 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z';
    case 'moon':
      return 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z';
    case 'monitor':
      return 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
    default:
      return '';
  }
}
</script>

<template>
  <div class="w-full">
    <!-- Theme Switcher Header with inline toggle buttons -->
    <div class="flex items-center justify-between gap-2">
      <label class="text-xs font-semibold uppercase tracking-wide text-sidebar-text opacity-75 whitespace-nowrap">
        Theme
      </label>

      <!-- Compact toggle buttons -->
      <div class="flex items-center gap-1 rounded-lg bg-sidebar-hover-bg p-1 flex-shrink-0">
        <button v-for="theme in themes" :key="theme.id" type="button"
          class="flex items-center justify-center rounded-md p-1.5 transition-all duration-200" :class="currentTheme === theme.id
              ? 'bg-accent-600 text-white shadow-sm'
              : 'text-sidebar-text hover:text-accent-600'
            " :title="theme.label" :aria-label="`Switch to ${theme.label} theme`"
          :aria-pressed="currentTheme === theme.id" @click="setTheme(theme.id)">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" :d="iconPath(theme.icon)" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
