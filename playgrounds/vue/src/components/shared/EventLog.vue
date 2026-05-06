<script setup lang="ts">
defineProps<{
  events: { timestamp: string; type: string; data?: unknown }[]
}>()

const typeColors: Record<string, string> = {
  info: 'bg-status-info-bg text-status-info-text',
  success: 'bg-status-success-bg text-status-success-text',
  error: 'bg-status-error-bg text-status-error-text',
  warning: 'bg-status-warning-bg text-status-warning-text',
}

function badgeClass(type: string): string {
  return typeColors[type] ?? 'bg-surface-muted text-on-surface-secondary'
}
</script>

<template>
  <div class="overflow-y-auto max-h-[300px] border border-border rounded-lg divide-y divide-border-divider">
    <div v-if="events.length === 0" class="p-4 text-sm text-on-surface-muted italic">
      No events yet.
    </div>
    <div
      v-for="(event, index) in events"
      :key="index"
      class="flex items-start gap-3 px-4 py-2"
    >
      <span class="text-on-surface-muted text-xs mt-0.5 shrink-0">{{ event.timestamp }}</span>
      <span
        class="text-xs font-medium px-1.5 py-0.5 rounded shrink-0"
        :class="badgeClass(event.type)"
      >{{ event.type }}</span>
      <pre
        v-if="event.data !== undefined"
        class="text-xs text-on-surface-secondary whitespace-pre-wrap break-all min-w-0"
      >{{ JSON.stringify(event.data, null, 2) }}</pre>
    </div>
  </div>
</template>
