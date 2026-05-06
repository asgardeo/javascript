<script setup lang="ts">
defineProps<{
  tabs: { key: string; label: string; internal?: boolean }[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <!-- flex flex-col so that h-full / flex-1 passed by a parent propagates into the content area -->
  <div class="flex flex-col">
    <!-- Tab navigation bar — never shrinks -->
    <div class="border-b border-border shrink-0">
      <div class="tab-scroll flex gap-4 flex-nowrap overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="py-2 px-1 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5"
          :class="
            modelValue === tab.key
              ? 'border-accent-500 text-accent-600'
              : 'border-transparent text-on-surface-muted hover:text-on-surface-secondary hover:border-border-hover'
          "
          @click="emit('update:modelValue', tab.key)"
        >
          {{ tab.label }}
          <span
            v-if="tab.internal"
            class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none bg-status-warning-bg text-status-warning-text border border-border"
          >Internal</span>
        </button>
      </div>
    </div>

    <!-- Active tab content — grows to fill whatever height the parent gave TabGroup,
         and passes that full height down to the slot content via [&>*]:h-full -->
    <div class="mt-4 flex-1 min-h-0 [&>*]:h-full">
      <template v-for="tab in tabs" :key="tab.key">
        <div v-if="modelValue === tab.key" class="h-full">
          <slot :name="tab.key" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tab-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tab-scroll::-webkit-scrollbar {
  display: none;
}
</style>
