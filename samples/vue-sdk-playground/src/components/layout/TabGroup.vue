<script setup lang="ts">
defineProps<{
  tabs: { key: string; label: string }[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div>
    <div class="border-b border-border">
      <div class="flex gap-4">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="py-2 px-1 text-sm font-medium transition-colors border-b-2 -mb-px"
          :class="
            modelValue === tab.key
              ? 'border-accent-500 text-accent-600'
              : 'border-transparent text-on-surface-muted hover:text-on-surface-secondary hover:border-border-hover'
          "
          @click="emit('update:modelValue', tab.key)"
        >
          {{ tab.label }}
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
