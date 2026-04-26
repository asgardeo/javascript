<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  componentName: string;
  activeSlot: 'default' | 'fallback' | 'none';
  scopedPayload?: unknown;
}>();

const slotBadgeStatus = computed<'success' | 'warning' | 'neutral'>(() => {
  if (props.activeSlot === 'default') {
    return 'success';
  }

  if (props.activeSlot === 'fallback') {
    return 'warning';
  }

  return 'neutral';
});

const slotBadgeLabel = computed(() => {
  if (props.activeSlot === 'default') {
    return 'Rendering #default';
  }

  if (props.activeSlot === 'fallback') {
    return 'Rendering #fallback';
  }

  return 'Rendering nothing';
});

const hasPayload = computed(() => props.scopedPayload !== undefined);
</script>

<template>
  <div class="space-y-3">
    <div class="rounded-md border border-border bg-surface p-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="font-mono text-xs text-text">{{ componentName }}</span>
        <SharedStatusBadge :status="slotBadgeStatus" :label="slotBadgeLabel" />
      </div>
    </div>

    <div v-if="hasPayload" class="rounded-md border border-border bg-surface p-3">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Scoped slot payload</p>
      <SharedJsonViewer :data="scopedPayload" />
    </div>

    <p v-else class="text-xs text-text-muted">No scoped payload exposed for the active slot.</p>
  </div>
</template>
