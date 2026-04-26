<script setup lang="ts">
// useThemeMode is a local composable — explicitly imported so Nuxt doesn't
// try to auto-import it from a shadowed global name.
//
// Theme attributes (data-theme / data-theme-mode) are applied to <html> by
// applyToDocument() inside useThemeMode — NOT on this layout div. Putting them
// on the layout div caused a persistent light-mode-on-reload bug: the SSR
// server always renders "light" on the div, and Vue's reactive watcher only
// fires on *changes* to the ref — if mode is already 'dark' before hydration,
// the watcher never fires and the SSR-rendered "light" attribute is never
// patched. Keeping the theme on <html> (set by the inline <head> script and
// applyToDocument) avoids any SSR mismatch on this element entirely.
import { useThemeMode } from '~/composables/useThemeMode';

useThemeMode(); // registers onMounted → applyToDocument() on <html>
</script>

<template>
  <div class="min-h-screen" style="background-color: var(--color-bg);">
    <LayoutSidebar />
    <!-- Page content pushed right of the fixed sidebar on md+ -->
    <div class="md:ml-64">
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
