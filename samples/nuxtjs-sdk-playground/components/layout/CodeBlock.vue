<script setup lang="ts">
import { ref } from 'vue';

withDefaults(defineProps<{
  code: string;
  language?: string;
  collapsible?: boolean;
  label?: string;
}>(), {
  language: 'vue',
  collapsible: false,
  label: 'Show code',
});

const isOpen = ref(false);
const copied = ref(false);

async function copyCode(code: string) {
  await navigator.clipboard.writeText(code);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}
</script>

<template>
  <div>
    <!-- Collapsible trigger -->
    <button
      v-if="collapsible"
      type="button"
      class="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1.5 transition-colors mb-2"
      @click="isOpen = !isOpen"
    >
      <svg class="h-3.5 w-3.5 transition-transform" :class="{ 'rotate-90': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      {{ label }}
    </button>

    <div v-if="!collapsible || isOpen" class="rounded-lg overflow-hidden border border-border">
      <!-- Header bar -->
      <div class="flex items-center justify-between bg-code-header-bg text-code-header-text text-xs px-4 py-2">
        <span class="font-mono">{{ language }}</span>
        <button
          type="button"
          class="hover:text-code-text transition-colors"
          @click="copyCode(code)"
        >
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <!-- Code body -->
      <pre class="bg-code-bg text-code-text p-4 font-mono text-sm overflow-x-auto leading-relaxed whitespace-pre"><code>{{ code }}</code></pre>
    </div>
  </div>
</template>
