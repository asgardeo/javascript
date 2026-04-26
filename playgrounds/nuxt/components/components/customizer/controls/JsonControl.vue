<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { PropSpec } from '~/utils/components-manifest';

const props = defineProps<{
  modelValue: unknown;
  spec: PropSpec;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: unknown): void;
}>();

const hasError = ref(false);

const stringifyValue = (value: unknown): string => {
  if (value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
};

const editorValue = ref(stringifyValue(props.modelValue));

watch(
  () => props.modelValue,
  (nextValue) => {
    editorValue.value = stringifyValue(nextValue);
    hasError.value = false;
  },
);

const rows = computed(() => {
  const lineCount = editorValue.value.split('\n').length;
  return Math.min(Math.max(lineCount, 3), 12);
});

const parseJson = (value: string): void => {
  if (value.trim() === '') {
    hasError.value = false;
    emit('update:modelValue', undefined);
    return;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    hasError.value = false;
    emit('update:modelValue', parsed);
  } catch {
    hasError.value = true;
  }
};

const onInput = (event: Event): void => {
  const value = (event.target as HTMLTextAreaElement).value;
  editorValue.value = value;
  parseJson(value);
};
</script>

<template>
  <div class="space-y-2">
    <textarea
      :value="editorValue"
      :rows="rows"
      class="w-full rounded-md border bg-surface px-3 py-2 font-mono text-xs text-text"
      :class="hasError ? 'border-danger' : 'border-border'"
      @input="onInput"
    />
    <p v-if="hasError" class="text-xs text-danger">Invalid JSON. Keep editing until it parses.</p>
  </div>
</template>
