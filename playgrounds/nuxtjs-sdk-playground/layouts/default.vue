<script setup lang="ts">
// useThemeMode is a local composable — explicitly imported so Nuxt doesn't
// try to auto-import it from a shadowed global name.
import { useThemeMode } from '~/composables/useThemeMode';

const { theme, mode } = useThemeMode();
</script>

<template>
  <div
    class="min-h-screen"
    :data-theme="theme"
    :data-theme-mode="mode"
    style="background-color: var(--color-bg);"
  >
    <LayoutSidebar />
    <!-- Page content pushed right of the fixed sidebar on md+ -->
    <div class="md:ml-64">
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
