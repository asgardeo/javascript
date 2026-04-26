<script setup lang="ts">
import type { ComponentSpec } from '~/utils/components-manifest';

defineProps<{
  components: ComponentSpec[];
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="border-b border-border">
    <div class="-mb-px flex flex-wrap gap-0.5">
      <button
        v-for="spec in components"
        :key="spec.name"
        type="button"
        class="border-b-2 px-3 py-2 font-mono text-xs font-medium transition-colors"
        :class="
          modelValue === spec.name
            ? 'border-accent-500 text-accent-600'
            : 'border-transparent text-text-muted hover:border-border-strong hover:text-text'
        "
        @click="emit('update:modelValue', spec.name)"
      >
        &lt;{{ spec.name }}&nbsp;/&gt;
      </button>
    </div>
  </div>
</template>
