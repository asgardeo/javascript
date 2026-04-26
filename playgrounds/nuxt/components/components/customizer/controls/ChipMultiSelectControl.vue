<script setup lang="ts">
import { computed } from 'vue';
import type { PropSpec } from '~/utils/components-manifest';

const props = defineProps<{
  modelValue: unknown;
  spec: PropSpec;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void;
}>();

const selected = computed<string[]>(() => (Array.isArray(props.modelValue) ? (props.modelValue as string[]) : []));

const toggle = (value: string): void => {
  const current = selected.value;
  const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];

  emit('update:modelValue', next);
};
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="chip in spec.chipPool ?? []"
      :key="chip"
      type="button"
      class="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
      :class="selected.includes(chip)
        ? 'border-accent-600 bg-accent-50 text-accent-700'
        : 'border-border bg-surface text-text-muted hover:text-text'"
      @click="toggle(chip)"
    >
      {{ chip }}
    </button>
  </div>
</template>
