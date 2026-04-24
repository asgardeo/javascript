<script setup lang="ts">
import { ref } from 'vue';
import { createOrganization } from '~/utils/sdkRoutes';

const orgName        = ref('');
const orgDescription = ref('');
const orgParentId    = ref('');

const result  = ref<unknown>(null);
const error   = ref<string | null>(null);
const loading = ref(false);

async function runCreate() {
  if (!orgName.value.trim()) {
    error.value = 'Organization name is required.';
    return;
  }
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await createOrganization({
      name: orgName.value.trim(),
      ...(orgDescription.value ? { description: orgDescription.value } : {}),
      ...(orgParentId.value    ? { parentId:    orgParentId.value } : {}),
    });
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

const codeSnippet = `// Direct $fetch:
const newOrg = await $fetch('/api/auth/organizations', {
  method: 'POST',
  body: { name: 'My New Org', description: 'Optional description' },
});

// Via sdkRoutes helper:
import { createOrganization } from '~/utils/sdkRoutes';
const newOrg = await createOrganization({ name: 'My New Org' });

// Response: the created Organization object`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="POST /api/auth/organizations"
      description="Creates a new organization under the current user's root or a specified parent organization."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <p class="text-sm text-text-muted leading-relaxed">
        Calls the Asgardeo create organization API using the stored access token.
        <code class="font-mono">name</code> is required; <code class="font-mono">description</code>
        and <code class="font-mono">parentId</code> are optional. Returns the newly created
        <code class="font-mono">Organization</code> object.
      </p>
    </LayoutSectionCard>

    <!-- Request inputs -->
    <LayoutSectionCard title="Request body">
      <div class="grid gap-3 sm:grid-cols-2">
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1">
            <code class="font-mono">name</code> <span class="text-danger">*</span>
          </label>
          <input v-model="orgName" type="text" placeholder="My New Org"
            class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1"><code class="font-mono">description</code> (optional)</label>
          <input v-model="orgDescription" type="text" placeholder="Optional description"
            class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-xs font-medium text-text-muted mb-1"><code class="font-mono">parentId</code> (optional)</label>
          <input v-model="orgParentId" type="text" placeholder="Parent organization ID"
            class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500" />
        </div>
      </div>
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard title="Try it — POST /api/auth/organizations">
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="runCreate"
      >
        {{ loading ? 'Creating…' : 'Create organization' }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- Related -->
    <LayoutSectionCard title="Related composable">
      <p class="text-sm text-text-muted">
        <code class="font-mono">useOrganization().createOrganization({ name, description?, parentId? })</code>
      </p>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
