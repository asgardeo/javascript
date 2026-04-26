<script setup lang="ts">
import {computed} from 'vue';
import {composables} from '~/utils/sdk-manifest';
import {composableSpecByName} from '~/utils/composables-manifest';

type SourceKind = 'wrapped' | 're-exported';

interface ComposableCardItem {
  name: string;
  description: string;
  path: string;
  stateCount: number;
  functionCount: number;
  source: SourceKind;
  sourceLabel: string;
  sourceTooltip: string;
}

// `useAsgardeo` is the only composable with a Nuxt-specific wrapper at
// runtime/composables/useAsgardeo.ts (re-binds signIn/signOut/signUp to
// `navigateTo`). Every other entry in `addImports` resolves directly to
// `@asgardeo/vue`. See packages/nuxt/src/module.ts.
const wrappedComposables = new Set<string>(['useAsgardeo']);

const items = computed<ComposableCardItem[]>(() =>
  composables.map((entry) => {
    const spec = composableSpecByName[entry.name];
    const isWrapped = wrappedComposables.has(entry.name);
    return {
      name: entry.name,
      description: entry.description,
      path: entry.path,
      stateCount: spec?.state.length ?? 0,
      functionCount: spec?.functions.length ?? 0,
      source: isWrapped ? 'wrapped' : 're-exported',
      sourceLabel: isWrapped ? 'Nuxt wrapper' : 'Re-exported',
      sourceTooltip: isWrapped
        ? 'Nuxt-specific wrapper around @asgardeo/vue — re-binds redirect actions to navigateTo.'
        : 'Re-exported as-is from @asgardeo/vue and registered as a Nuxt auto-import.',
    };
  }),
);
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Composables"
      description="Interactive playground for every composable auto-imported by @asgardeo/nuxt. Click a card to explore."
    />

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <NuxtLink
        v-for="item in items"
        :key="item.name"
        :to="item.path"
        class="group flex flex-col rounded-lg border border-border bg-surface p-5 shadow-sm hover:border-accent-500 hover:shadow-md transition-all"
      >
        <div class="flex items-start justify-between gap-2 mb-2">
          <code class="text-sm font-mono font-semibold text-accent-600">{{ item.name }}</code>
          <span
            :title="item.sourceTooltip"
            class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide border"
            :class="item.source === 'wrapped'
              ? 'bg-accent-50 text-accent-700 border-accent-200'
              : 'bg-surface-muted text-text-muted border-border'"
          >
            {{ item.sourceLabel }}
          </span>
        </div>

        <p class="text-xs text-text-muted leading-relaxed">{{ item.description }}</p>

        <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
          <span class="inline-flex items-center gap-1">
            <span class="font-semibold text-text">{{ item.stateCount }}</span>
            state
          </span>
          <span aria-hidden="true" class="text-border">·</span>
          <span class="inline-flex items-center gap-1">
            <span class="font-semibold text-text">{{ item.functionCount }}</span>
            functions
          </span>
        </div>

        <p class="mt-3 text-xs font-medium text-accent-600 group-hover:underline">Explore →</p>
      </NuxtLink>
    </div>
  </div>
</template>
