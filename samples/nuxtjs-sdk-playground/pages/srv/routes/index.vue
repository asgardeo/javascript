<script setup lang="ts">
import { ref, computed } from 'vue';
import { serverRoutes } from '~/utils/sdk-manifest';

// Flatten the domain tree into a single list for the table.
const allRoutes = computed(() =>
  serverRoutes.flatMap((domain) =>
    domain.routes.map((r) => ({ ...r, domain: domain.label })),
  ),
);

// ── Filter ────────────────────────────────────────────────────────────────
type Filter = 'All' | (typeof serverRoutes)[number]['label'];

const activeFilter = ref<Filter>('All');
const filters = computed<Filter[]>(() => ['All', ...serverRoutes.map((d) => d.label)]);

const filteredRoutes = computed(() =>
  activeFilter.value === 'All'
    ? allRoutes.value
    : allRoutes.value.filter((r) => r.domain === activeFilter.value),
);

// ── Smoke-test all safe GET routes ────────────────────────────────────────
const statuses = ref<Record<string, { status: number | null; loading: boolean; error: string | null }>>({});

const safeGetRoutes = computed(() =>
  allRoutes.value.filter(
    (r) =>
      r.method === 'GET'
      && !r.path.includes(':id')
      && r.path !== '/api/auth/signin'
      && r.path !== '/api/auth/callback',
  ),
);

async function hitAllGetRoutes() {
  for (const r of safeGetRoutes.value) {
    statuses.value[r.path] = { status: null, loading: true, error: null };
  }
  await Promise.allSettled(
    safeGetRoutes.value.map(async (r) => {
      try {
        await $fetch(r.path);
        statuses.value[r.path] = { status: 200, loading: false, error: null };
      } catch (err: unknown) {
        const e = err as { statusCode?: number; message?: string };
        statuses.value[r.path] = {
          status: e.statusCode ?? 0,
          loading: false,
          error: e.message ?? String(err),
        };
      }
    }),
  );
}

const methodClass = (method: string) => {
  if (method === 'GET')   return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (method === 'POST')  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  if (method === 'PATCH') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-surface-muted text-text-muted';
};
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Server Routes — Overview"
      description="All built-in /api/auth/* routes registered by @asgardeo/nuxt. Click any row to open the route's demo page."
    />

    <LayoutSectionCard title="Filter & Smoke Test">
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <button
          v-for="f in filters"
          :key="f"
          class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
          :class="activeFilter === f
            ? 'bg-accent-600 text-accent-foreground border-accent-600'
            : 'bg-surface border-border text-text-muted hover:bg-surface-muted'"
          @click="activeFilter = f"
        >
          {{ f }}
        </button>
        <div class="ml-auto">
          <button
            class="px-4 py-2 text-xs font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
            @click="hitAllGetRoutes"
          >
            Hit all safe GET routes
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-4 font-medium text-text-muted">Domain</th>
              <th class="pb-2 pr-4 font-medium text-text-muted">Method</th>
              <th class="pb-2 pr-4 font-medium text-text-muted">Path</th>
              <th class="pb-2 pr-4 font-medium text-text-muted">Composable</th>
              <th class="pb-2 font-medium text-text-muted">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="r in filteredRoutes"
              :key="r.path + r.method"
              class="hover:bg-surface-muted cursor-pointer transition-colors"
              @click="navigateTo(r.page)"
            >
              <td class="py-2 pr-4 text-xs text-text-muted">{{ r.domain }}</td>
              <td class="py-2 pr-4">
                <span class="px-1.5 py-0.5 rounded text-xs font-mono font-semibold" :class="methodClass(r.method)">
                  {{ r.method }}
                </span>
              </td>
              <td class="py-2 pr-4 font-mono text-xs text-text">{{ r.path }}</td>
              <td class="py-2 pr-4 font-mono text-xs text-text-muted">{{ r.composable ?? '—' }}</td>
              <td class="py-2">
                <span v-if="statuses[r.path]?.loading" class="text-xs text-text-muted">…</span>
                <SharedStatusBadge
                  v-else-if="statuses[r.path]"
                  :status="statuses[r.path].status === 200 ? 'success' : 'danger'"
                  :label="statuses[r.path].status === 200 ? '200' : String(statuses[r.path].status)"
                />
                <span v-else class="text-xs text-text-muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>
  </div>
</template>
