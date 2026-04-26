<script setup lang="ts">
import type { PropSpec } from '~/utils/components-manifest';

const props = defineProps<{
  modelValue: unknown;
  spec: PropSpec;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
}>();

const onToggle = (event: Event): void => {
  const checked = (event.target as HTMLInputElement).checked;
  emit('update:modelValue', checked);
};
</script>

<template>
  <label class="inline-flex items-center gap-2">
    <input
      type="checkbox"
      :checked="Boolean(modelValue)"
      class="h-4 w-4 rounded border-border text-accent-600 focus:ring-accent-500"
      @change="onToggle"
    />
    <span class="text-sm text-text-muted">{{ Boolean(modelValue) ? 'Enabled' : 'Disabled' }}</span>
  </label>
</template>
