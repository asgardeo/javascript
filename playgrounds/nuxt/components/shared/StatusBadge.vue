<script setup lang="ts">
defineProps<{
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label: string;
}>();

const dotClass: Record<string, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error:   'bg-danger',
  info:    'bg-accent-500',
  neutral: 'bg-text-muted',
};

const textClass: Record<string, string> = {
  success: 'text-success',
  warning: 'text-warning',
  error:   'text-danger',
  info:    'text-accent-600',
  neutral: 'text-text-muted',
};
</script>

<template>
  <span class="inline-flex items-center gap-1.5">
    <span class="h-2 w-2 rounded-full shrink-0" :class="dotClass[status]" />
    <span class="text-sm font-medium" :class="textClass[status]">{{ label }}</span>
  </span>
</template>
