<script setup lang="ts">
withDefaults(defineProps<{
  result?: unknown;
  isLoading?: boolean;
  error?: string | null;
}>(), {
  isLoading: false,
});
</script>

<template>
  <div class="bg-surface-muted border border-border rounded-lg p-4 font-mono text-sm min-h-[100px]">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[76px]">
      <svg class="animate-spin h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
    <!-- Error state -->
    <p v-else-if="error" class="text-danger">{{ error }}</p>
    <!-- Result state -->
    <pre v-else-if="result !== undefined" class="whitespace-pre-wrap break-all text-text">{{ JSON.stringify(result, null, 2) }}</pre>
    <!-- Empty state -->
    <p v-else class="text-text-muted italic">No result yet.</p>
  </div>
</template>
