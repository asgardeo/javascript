<script setup lang="ts">
import { composables } from '~/utils/sdk-manifest';
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Composables"
      description="Interactive playground for every composable auto-imported by @asgardeo/nuxt. Click a card to explore."
    />

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <NuxtLink
        v-for="item in composables"
        :key="item.name"
        :to="item.path"
        class="group block rounded-lg border border-border bg-surface p-5 shadow-sm hover:border-accent-500 hover:shadow-md transition-all"
      >
        <div class="flex items-start justify-between mb-2">
          <code class="text-sm font-mono font-semibold text-accent-600">{{ item.name }}</code>
        </div>
        <p class="text-xs text-text-muted leading-relaxed">{{ item.description }}</p>
        <p class="mt-3 text-xs font-medium text-accent-600 group-hover:underline">Explore →</p>
      </NuxtLink>
    </div>
  </div>
</template>
