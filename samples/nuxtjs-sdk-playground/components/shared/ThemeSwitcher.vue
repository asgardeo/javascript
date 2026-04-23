<script setup lang="ts">
import { useThemeMode } from '~/composables/useThemeMode';

const { theme, mode, setTheme, setMode } = useThemeMode();

const themes = [
  { id: 'orange' as const, label: 'Orange' },
  { id: 'blue'   as const, label: 'Blue' },
];
const modes = [
  { id: 'light' as const, label: '☀ Light' },
  { id: 'dark'  as const, label: '☾ Dark' },
];
</script>

<template>
  <div class="space-y-3">
    <!-- Palette -->
    <div>
      <p class="text-xs font-semibold uppercase tracking-wide text-sidebar-text opacity-70 mb-1.5">Palette</p>
      <div class="flex gap-1.5">
        <button
          v-for="t in themes"
          :key="t.id"
          type="button"
          class="flex-1 py-1 px-2 text-xs rounded-md border transition-colors"
          :class="
            theme === t.id
              ? 'bg-accent-600 text-accent-foreground border-accent-600'
              : 'bg-surface text-sidebar-text border-border hover:border-accent-500'
          "
          @click="setTheme(t.id)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- Mode -->
    <div>
      <p class="text-xs font-semibold uppercase tracking-wide text-sidebar-text opacity-70 mb-1.5">Mode</p>
      <div class="flex gap-1.5">
        <button
          v-for="m in modes"
          :key="m.id"
          type="button"
          class="flex-1 py-1 px-2 text-xs rounded-md border transition-colors"
          :class="
            mode === m.id
              ? 'bg-accent-600 text-accent-foreground border-accent-600'
              : 'bg-surface text-sidebar-text border-border hover:border-accent-500'
          "
          @click="setMode(m.id)"
        >
          {{ m.label }}
        </button>
      </div>
    </div>
  </div>
</template>
