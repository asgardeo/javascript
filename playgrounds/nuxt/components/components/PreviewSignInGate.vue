<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: 'Sign in to preview this component',
    description: 'Authenticate first to render this component with live data.',
  },
);
</script>

<template>
  <div class="h-full min-h-[14rem] flex flex-col items-center justify-center gap-3 text-center">
    <p class="text-sm font-semibold text-text">{{ title }}</p>
    <p class="max-w-md text-xs text-text-muted">{{ description }}</p>

    <AsgardeoSignInButton
      class="inline-flex items-center gap-2 rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-700 transition-colors"
      v-slot="{ isLoading }"
    >
      {{ isLoading ? 'Redirecting...' : 'Sign in' }}
    </AsgardeoSignInButton>
  </div>
</template>
