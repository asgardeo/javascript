<script setup lang="ts">
import { computed } from 'vue';
import type { PropSpec } from '~/utils/components-manifest';

const props = defineProps<{
  modelValue: unknown;
  spec: PropSpec;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: unknown): void;
}>();

const isNumberType = computed(() => props.spec.type === 'number');

const inputValue = computed(() => {
  if (props.modelValue === undefined || props.modelValue === null) {
    return '';
  }

  return String(props.modelValue);
});

const onInput = (event: Event): void => {
  const value = (event.target as HTMLInputElement).value;

  if (isNumberType.value) {
    if (value.trim() === '') {
      emit('update:modelValue', undefined);
      return;
    }

    const parsed = Number(value);
    emit('update:modelValue', Number.isNaN(parsed) ? undefined : parsed);
    return;
  }

  emit('update:modelValue', value);
};
</script>

<template>
  <input
    :type="isNumberType ? 'number' : 'text'"
    :value="inputValue"
    class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
    @input="onInput"
  />
</template>
