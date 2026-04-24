<script setup lang="ts">
import { ref } from 'vue';
import { getOrganizations } from '~/utils/sdkRoutes';

const filterParam = ref('');
const limitParam  = ref('');
const afterParam  = ref('');
const beforeParam = ref('');

const result  = ref<unknown>(null);
const error   = ref<string | null>(null);
const loading = ref(false);

async function fetchOrgs() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await getOrganizations({
      ...(filterParam.value ? { filter: filterParam.value } : {}),
      ...(limitParam.value  ? { limit:  Number(limitParam.value) } : {}),
      ...(afterParam.value  ? { after:  afterParam.value } : {}),
      ...(beforeParam.value ? { before: beforeParam.value } : {}),
    });
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

fetchOrgs();

const codeSnippet = `// Direct $fetch:
const orgs = await $fetch('/api/auth/organizations');

// With optional query params:
const filtered = await $fetch('/api/auth/organizations', {
  query: { filter: 'name sw "Acme"', limit: 10 },
});

// Via sdkRoutes helper:
import { getOrganizations } from '~/utils/sdkRoutes';
const orgs = await getOrganizations({ limit: 10 });

// Via composable:
const { getAllOrganizations } = useOrganization();
const result = await getAllOrganizations();`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="GET /api/auth/organizations"
      description="Lists all organizations accessible to the current user with optional filter and pagination."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <p class="text-sm text-text-muted leading-relaxed">
        Calls the Asgardeo organization list API using the stored access token. Supports SCIM-style
        <code class="font-mono">filter</code>, <code class="font-mono">limit</code>,
        <code class="font-mono">after</code> (cursor), and <code class="font-mono">before</code>
        (cursor) query parameters for pagination.
      </p>
    </LayoutSectionCard>

    <!-- Request inputs -->
    <LayoutSectionCard title="Request inputs (optional query params)">
      <div class="grid gap-3 sm:grid-cols-2">
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1"><code class="font-mono">filter</code></label>
          <input v-model="filterParam" type="text" placeholder='name sw "Acme"'
            class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1"><code class="font-mono">limit</code></label>
          <input v-model="limitParam" type="number" placeholder="10"
            class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1"><code class="font-mono">after</code> (cursor)</label>
          <input v-model="afterParam" type="text" placeholder="cursor value"
            class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1"><code class="font-mono">before</code> (cursor)</label>
          <input v-model="beforeParam" type="text" placeholder="cursor value"
            class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500" />
        </div>
      </div>
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard title="Try it — GET /api/auth/organizations">
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="fetchOrgs"
      >
        {{ loading ? 'Fetching…' : 'Fetch organizations' }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- Related -->
    <LayoutSectionCard title="Related composable">
      <p class="text-sm text-text-muted">
        <code class="font-mono">useOrganization().getAllOrganizations()</code> — calls this route.
        See <NuxtLink to="/apis/organization" class="text-accent-600 hover:underline">APIs → useOrganization</NuxtLink>.
      </p>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
