<script setup lang="ts">
defineProps<{
  label: string;
  value?: unknown;
  mono?: boolean;
}>();
</script>

<template>
  <div class="flex items-start gap-4 py-1.5">
    <dt class="w-28 shrink-0 text-sm text-text-muted pt-0.5">{{ label }}</dt>
    <dd class="flex items-center gap-2 min-w-0">
      <span
        class="text-sm text-text break-all"
        :class="mono ? 'font-mono' : ''"
      >{{ value ?? '—' }}</span>
      <SharedCopyButton v-if="value" :text="String(value)" />
    </dd>
  </div>
</template>
