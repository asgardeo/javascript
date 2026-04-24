<script setup lang="ts">
import { ref } from 'vue';
import { getOrganizationById, getCurrentOrganization } from '~/utils/sdkRoutes';

const orgId   = ref('');
const result  = ref<unknown>(null);
const error   = ref<string | null>(null);
const loading = ref(false);

// Pre-fill the id with the current organization if available
onMounted(async () => {
  try {
    const current = await getCurrentOrganization() as { id?: string } | null;
    if (current?.id) orgId.value = current.id;
  } catch { /* silently ignore */ }
});

async function fetchById() {
  if (!orgId.value.trim()) {
    error.value = 'Organization ID is required.';
    return;
  }
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await getOrganizationById(orgId.value.trim());
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

const codeSnippet = `// Direct $fetch:
const org = await $fetch(\`/api/auth/organizations/\${orgId}\`);

// Via sdkRoutes helper:
import { getOrganizationById } from '~/utils/sdkRoutes';
const org = await getOrganizationById('org-id-here');

// Returns a single Organization object or throws 404 if not found.`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="GET /api/auth/organizations/:id"
      description="Fetches a single organization by its ID."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <p class="text-sm text-text-muted leading-relaxed">
        Returns the <code class="font-mono">Organization</code> object for the given
        <code class="font-mono">:id</code> path parameter, using the stored access token to
        authorize the request against Asgardeo. Throws 404 if the organization does not exist
        or the user lacks access.
      </p>
    </LayoutSectionCard>

    <!-- Request inputs -->
    <LayoutSectionCard title="Request inputs">
      <label class="block text-xs font-medium text-text-muted mb-1">
        <code class="font-mono">:id</code> — Organization ID <span class="text-danger">*</span>
      </label>
      <input
        v-model="orgId"
        type="text"
        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        class="w-full max-w-sm rounded-md border border-border bg-surface px-3 py-2 text-sm font-mono text-text focus:outline-none focus:ring-1 focus:ring-accent-500"
      />
      <p class="text-xs text-text-muted mt-1">Pre-filled with your current organization ID (if any).</p>
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard title="Try it — GET /api/auth/organizations/:id">
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="fetchById"
      >
        {{ loading ? 'Fetching…' : 'Fetch organization' }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
