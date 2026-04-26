<script setup lang="ts">
withDefaults(
  defineProps<{
    minHeight?: string;
  }>(),
  {
    minHeight: '16rem',
  },
);
</script>

<template>
  <div class="preview-canvas h-full flex flex-col rounded-bl-xl" :style="{ minHeight }">
    <slot />
  </div>
</template>

<style scoped>
.preview-canvas {
  background-color: var(--color-surface-muted);
  background-image:
    linear-gradient(0deg, color-mix(in srgb, var(--color-border) 35%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--color-border) 35%, transparent) 1px, transparent 1px);
  background-size: 18px 18px;
}
</style>
