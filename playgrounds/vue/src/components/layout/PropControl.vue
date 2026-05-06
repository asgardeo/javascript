<script setup lang="ts">
defineProps<{
  label: string;
  type?: 'select' | 'text' | 'toggle' | 'number';
  options?: string[];
  min?: number;
  max?: number;
  modelValue: unknown;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: unknown];
}>();

const fieldCls = 'flex-1 min-w-0 rounded border border-border bg-surface-primary px-1.5 py-0.5 text-[11px] text-on-surface focus:outline-none focus:ring-1 focus:ring-accent-500';
</script>

<template>
  <div class="flex items-center justify-between gap-2 min-w-0">
    <span
      class="text-[11px] text-on-surface-muted shrink-0 max-w-[88px] overflow-hidden text-ellipsis whitespace-nowrap"
      :title="label"
    >{{ label }}</span>

    <!-- Select -->
    <select
      v-if="type === 'select'"
      :value="modelValue as string"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      :class="fieldCls"
    >
      <option v-for="opt in options" :key="opt" :value="opt">{{ opt }}</option>
    </select>

    <!-- Number -->
    <input
      v-else-if="type === 'number'"
      type="number"
      :value="modelValue as number"
      :min="min"
      :max="max"
      @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
      class="w-16 rounded border border-border bg-surface-primary px-1.5 py-0.5 text-[11px] text-on-surface focus:outline-none focus:ring-1 focus:ring-accent-500"
    />

    <!-- Toggle -->
    <button
      v-else-if="type === 'toggle'"
      type="button"
      role="switch"
      :aria-checked="!!modelValue"
      @click="emit('update:modelValue', !modelValue)"
      class="relative inline-flex h-4 w-8 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-accent-500"
      :style="modelValue ? 'background:var(--accent-500)' : 'background:var(--border-hover)'"
    >
      <span
        class="inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-150"
        :class="modelValue ? 'translate-x-4' : 'translate-x-0.5'"
      />
    </button>

    <!-- Text (default) -->
    <input
      v-else
      type="text"
      :value="modelValue as string"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :class="fieldCls"
    />
  </div>
</template>
