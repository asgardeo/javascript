<script setup lang="ts">
import type { PropSpec } from '~/utils/components-manifest';

const props = defineProps<{
  modelValue: unknown;
  spec: PropSpec;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

const onChange = (event: Event): void => {
  const value = (event.target as HTMLSelectElement).value;
  emit('update:modelValue', value);
};
</script>

<template>
  <select
    :value="modelValue === undefined || modelValue === null ? '' : String(modelValue)"
    class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
    @change="onChange"
  >
    <option
      v-for="option in spec.options ?? []"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>
