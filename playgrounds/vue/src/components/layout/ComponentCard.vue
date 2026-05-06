<script setup lang="ts">
defineProps<{
  name: string;
  badges?: string[];
}>();

const badgeStyles: Record<string, string> = {
  Auth:            'background:var(--status-info-bg);color:var(--status-info-text)',
  Primitives:      'background:var(--surface-muted);color:var(--text-secondary);border:1px solid var(--border-default)',
  Actions:         'background:var(--status-warning-bg);color:var(--status-warning-text)',
  Control:         'background:var(--status-error-bg);color:var(--status-error-text)',
  Presentation:    'background:var(--status-success-bg);color:var(--status-success-text)',
  Factories:       'background:var(--accent-100);color:var(--accent-700)',
  'Social Logins': 'background:var(--surface-muted);color:var(--text-secondary);border:1px solid var(--border-default)',
};

const BASE_BADGE = 'border-radius:4px;padding:2px 7px;font-size:10px;font-weight:600;white-space:nowrap;line-height:1.5';

function badgeStyle(badge: string): string {
  return (badgeStyles[badge] ?? 'background:var(--surface-muted);color:var(--text-secondary)') + ';' + BASE_BADGE;
}
</script>

<template>
  <!-- h-full is injected by TabGroup's [&>*]:h-full; flex-col propagates height into body -->
  <div class="flex flex-col rounded-xl border border-border bg-surface-secondary shadow-sm overflow-hidden h-full">
    <!-- Header — fixed height, never shrinks -->
    <div class="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface-muted/60 shrink-0">
      <code class="text-sm font-semibold text-on-surface">&lt;{{ name }}/&gt;</code>
      <div class="flex gap-1.5 ml-auto flex-wrap justify-end">
        <span v-for="badge in badges" :key="badge" :style="badgeStyle(badge)">{{ badge }}</span>
      </div>
    </div>

    <!-- Body: stretches to fill all remaining card height -->
    <div class="flex flex-1 min-h-0">
      <!-- Preview canvas -->
      <div class="component-card-canvas flex-1 min-w-0 min-h-0 flex items-center justify-center p-6 overflow-auto">
        <slot name="preview" />
      </div>

      <!-- Vertical divider -->
      <div class="w-px bg-border shrink-0" />

      <!-- Controls panel — doubled width (w-52 → w-[26rem]) -->
      <div class="w-[26rem] shrink-0 flex flex-col p-4 gap-3 overflow-y-auto bg-surface-secondary">
        <slot name="controls">
          <p class="text-[11px] text-on-surface-muted italic mt-1">No customizable props</p>
        </slot>
      </div>
    </div>
  </div>
</template>

<style>
/* Non-scoped so data-theme selector can target it regardless of the scoped hash */
.component-card-canvas {
  background-color: var(--surface-muted);
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.09) 1.5px, transparent 1.5px);
  background-size: 20px 20px;
}

[data-theme="dark"] .component-card-canvas {
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px);
}
</style>
