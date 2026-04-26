<script setup lang="ts">
import {computed, ref, useSlots} from 'vue';

const props = withDefaults(defineProps<{
  name: string;
  signature: string;
  description: string;
  executeLabel?: string;
  isLoading: boolean;
  result?: unknown;
  error?: string | null;
  defaultOpen?: boolean;
}>(), {
  executeLabel: 'Execute',
  result: undefined,
  error: null,
  defaultOpen: false,
});

const emit = defineEmits<{
  (event: 'execute'): void;
}>();

const slots = useSlots();
const isOpen = ref(props.defaultOpen);
const hasExecuted = ref(false);

const hasParametersSlot = computed(() => Boolean(slots.parameters));

const shouldShowResultPanel = computed(
  () => hasExecuted.value && (props.isLoading || Boolean(props.error) || props.result !== undefined),
);

const shouldShowVoidResult = computed(
  () => hasExecuted.value && !props.isLoading && !props.error && props.result === undefined,
);

const onExecute = (): void => {
  hasExecuted.value = true;
  emit('execute');
};
</script>

<template>
  <div class="rounded-lg border border-border bg-surface shadow-sm">
    <button
      type="button"
      class="w-full flex items-center justify-between gap-4 px-4 py-3 text-left"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <div>
        <h3 class="font-mono text-sm font-semibold text-text">{{ name }}{{ signature }}</h3>
        <p class="text-xs text-text-muted mt-1">{{ description }}</p>
      </div>
      <svg
        class="h-5 w-5 text-text-muted transition-transform duration-200"
        :class="{ '-rotate-90': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <div v-if="isOpen" class="border-t border-border px-4 py-4 space-y-4">
      <div v-if="hasParametersSlot" class="space-y-2">
        <h4 class="text-xs font-semibold uppercase tracking-wide text-text-muted">Parameters</h4>
        <slot name="parameters" />
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          :disabled="isLoading"
          @click="onExecute"
        >
          <svg v-if="isLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>{{ executeLabel }}</span>
        </button>
      </div>

      <div v-if="hasExecuted" class="space-y-2">
        <h4 class="text-xs font-semibold uppercase tracking-wide text-text-muted">Result</h4>

        <p
          v-if="error"
          class="inline-flex items-center rounded-full bg-danger/15 px-3 py-1 text-xs font-medium text-danger"
        >
          {{ error }}
        </p>

        <p v-else-if="shouldShowVoidResult" class="text-sm text-text-muted">Returned: void</p>

        <SharedResultPanel
          v-else-if="shouldShowResultPanel"
          :result="result"
          :is-loading="isLoading"
        />
      </div>
    </div>
  </div>
</template>
