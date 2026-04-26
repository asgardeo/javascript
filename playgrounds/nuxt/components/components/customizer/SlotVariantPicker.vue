<script setup lang="ts">
import { computed } from 'vue';
import type { SlotVariant } from '~/utils/components-manifest';

const props = defineProps<{
  variants?: SlotVariant[];
  modelValue?: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

const hasVariants = computed(() => (props.variants?.length ?? 0) > 0);

const updateValue = (value: string): void => {
  emit('update:modelValue', value);
};
</script>

<template>
  <section
    v-if="hasVariants"
    class="rounded-lg border border-border bg-surface p-4 shadow-sm"
  >
    <h4 class="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Slot variant</h4>

    <div class="space-y-2">
      <label
        v-for="variant in variants"
        :key="variant.key"
        class="flex items-center gap-2 text-sm text-text"
      >
        <input
          type="radio"
          name="slot-variant"
          class="h-4 w-4 border-border text-accent-600 focus:ring-accent-500"
          :checked="modelValue === variant.key"
          @change="updateValue(variant.key)"
        />
        <span>{{ variant.label }}</span>
      </label>
    </div>
  </section>
</template>
