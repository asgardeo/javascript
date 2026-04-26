<script setup lang="ts">
defineProps<{
  tabs: { key: string; label: string; badge?: string }[];
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div>
    <div class="border-b border-border">
      <div class="flex gap-1 flex-wrap">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="py-2 px-3 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5"
          :class="
            modelValue === tab.key
              ? 'border-accent-500 text-accent-600'
              : 'border-transparent text-text-muted hover:text-text hover:border-border-strong'
          "
          @click="emit('update:modelValue', tab.key)"
        >
          {{ tab.label }}
          <span
            v-if="tab.badge"
            class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none
                   bg-surface-muted text-text-muted border border-border"
          >{{ tab.badge }}</span>
        </button>
      </div>
    </div>
    <div class="mt-4">
      <template v-for="tab in tabs" :key="tab.key">
        <div v-if="modelValue === tab.key">
          <slot :name="tab.key" />
        </div>
      </template>
    </div>
  </div>
</template>
