<script setup lang="ts">
import { ref } from 'vue';
import { getMyOrganizations } from '~/utils/sdkRoutes';

const result  = ref<unknown>(null);
const error   = ref<string | null>(null);
const loading = ref(false);

async function fetchMe() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await getMyOrganizations();
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

fetchMe();

const codeSnippet = `// Direct $fetch:
const myOrgs = await $fetch('/api/auth/organizations/me');

// Via sdkRoutes helper:
import { getMyOrganizations } from '~/utils/sdkRoutes';
const myOrgs = await getMyOrganizations();

// Via composable:
const { myOrganizations } = useOrganization();
// myOrganizations.value is populated after sign-in`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="GET /api/auth/organizations/me"
      description="Returns the list of organizations the signed-in user is a member of."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <p class="text-sm text-text-muted leading-relaxed">
        Calls the Asgardeo API to retrieve the organizations the current user belongs to, using the
        stored access token. Returns an array of <code class="font-mono">Organization</code> objects.
        Returns an empty array when the user has no organization memberships.
      </p>
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard title="Try it — GET /api/auth/organizations/me">
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="fetchMe"
      >
        {{ loading ? 'Fetching…' : 'Fetch my organizations' }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- Related -->
    <LayoutSectionCard title="Related composable">
      <p class="text-sm text-text-muted">
        <code class="font-mono">useOrganization().myOrganizations</code> — reactive wrapper.
        See <NuxtLink to="/composables/organization" class="text-accent-600 hover:underline">Composables → useOrganization</NuxtLink>.
      </p>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
