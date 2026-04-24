<script setup lang="ts">
import { ref } from 'vue';
import { getCurrentOrganization } from '~/utils/sdkRoutes';

const result  = ref<unknown>(null);
const error   = ref<string | null>(null);
const loading = ref(false);

async function fetchCurrent() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await getCurrentOrganization();
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

fetchCurrent();

const codeSnippet = `// Direct $fetch:
const current = await $fetch('/api/auth/organizations/current');

// Via sdkRoutes helper:
import { getCurrentOrganization } from '~/utils/sdkRoutes';
const current = await getCurrentOrganization();

// Returns the Organization the user is currently acting in, or null
// when they are in the root organization context.

// Via composable:
const { currentOrganization } = useOrganization();
// currentOrganization.value is populated after sign-in`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="GET /api/auth/organizations/current"
      description="Returns the organization the current session is scoped to, or null when the user is in the root context."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          Reads the <code class="font-mono">organizationId</code> from the session cookie and
          returns the corresponding <code class="font-mono">Organization</code> object.
          Returns <code class="font-mono">null</code> when the session has no
          <code class="font-mono">organizationId</code> (root context).
        </p>
        <p>
          Use <NuxtLink to="/routes/organizations/switch" class="text-accent-600 hover:underline">
            POST /api/auth/organizations/switch
          </NuxtLink> to change the active organization.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard title="Try it — GET /api/auth/organizations/current">
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="fetchCurrent"
      >
        {{ loading ? 'Fetching…' : 'Fetch current organization' }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- Related -->
    <LayoutSectionCard title="Related composable">
      <p class="text-sm text-text-muted">
        <code class="font-mono">useOrganization().currentOrganization</code> — reactive reference to
        the active organization.
      </p>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
