<script setup lang="ts">
import { ref } from 'vue';

withDefaults(defineProps<{
  title: string;
  description?: string;
  collapsible?: boolean;
}>(), {
  collapsible: false,
});

const isOpen = ref(true);
</script>

<template>
  <div class="bg-surface rounded-lg border border-border p-6 shadow-sm">
    <div
      class="flex items-center justify-between"
      :class="{ 'mb-4': !collapsible || isOpen }"
    >
      <div>
        <h2 class="text-lg font-semibold text-text">{{ title }}</h2>
        <p v-if="description" class="text-sm text-text-muted mt-0.5">{{ description }}</p>
      </div>
      <button
        v-if="collapsible"
        type="button"
        class="text-text-muted hover:text-text transition-colors"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <svg
          class="w-5 h-5 transition-transform duration-200"
          :class="{ 'rotate-180': !isOpen }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
    <div v-if="!collapsible || isOpen">
      <slot />
    </div>
  </div>
</template>
