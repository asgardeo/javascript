<script setup lang="ts">
import { ref, computed } from 'vue';
import { getMyOrganizations, switchOrganization } from '~/utils/sdkRoutes';

// ── Load my organizations for the dropdown ─────────────────────────────────
const myOrgs = ref<Array<{ id: string; name: string }>>([]);
const orgsLoading = ref(true);

onMounted(async () => {
  try {
    const data = await getMyOrganizations() as Array<{ id: string; name: string }>;
    if (Array.isArray(data)) myOrgs.value = data;
  } catch { /* silently ignore */ }
  finally { orgsLoading.value = false; }
});

const selectedOrgId = ref('');

// ── Switch ────────────────────────────────────────────────────────────────
const result  = ref<unknown>(null);
const error   = ref<string | null>(null);
const loading = ref(false);

const selectedLabel = computed(() =>
  myOrgs.value.find(o => o.id === selectedOrgId.value)?.name ?? '',
);

async function runSwitch() {
  if (!selectedOrgId.value) {
    error.value = 'Select an organization first.';
    return;
  }
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await switchOrganization(selectedOrgId.value);
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

const codeSnippet = `// Direct $fetch:
await $fetch('/api/auth/organizations/switch', {
  method: 'POST',
  body: { organizationId: 'target-org-id' },
});

// Via sdkRoutes helper:
import { switchOrganization } from '~/utils/sdkRoutes';
await switchOrganization('target-org-id');

// Via composable (recommended — updates reactive state):
const { switchOrganization } = useOrganization();
await switchOrganization({ organizationId: 'target-org-id' });

// After a successful switch, the session cookie is updated with the new
// organizationId and the page reloads to reflect the new context.`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="POST /api/auth/organizations/switch"
      description="Switches the active organization in the session, re-issuing the session cookie with the new organizationId."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          Exchanges the current session for a new one scoped to the target organization. The server
          calls the Asgardeo organization switch endpoint, receives a new token set, and rewrites
          the <code class="font-mono">__asgardeo_session</code> cookie.
        </p>
        <p>
          After a successful switch the page typically performs a full reload so all SSR-hydrated
          state reflects the new organization context.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- Request inputs -->
    <LayoutSectionCard title="Request inputs">
      <label class="block text-xs font-medium text-text-muted mb-1">
        Select target organization
      </label>
      <div v-if="orgsLoading" class="text-xs text-text-muted italic">Loading your organizations…</div>
      <select
        v-else-if="myOrgs.length"
        v-model="selectedOrgId"
        class="w-full max-w-sm rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500"
      >
        <option value="" disabled>-- select --</option>
        <option v-for="org in myOrgs" :key="org.id" :value="org.id">
          {{ org.name }} ({{ org.id }})
        </option>
      </select>
      <p v-else class="text-xs text-text-muted italic">
        No organizations found. Sign in to an account with organization memberships.
      </p>
      <p v-if="selectedOrgId" class="mt-1 text-xs text-text-muted font-mono">
        organizationId: {{ selectedOrgId }}
      </p>
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard title="Try it — POST /api/auth/organizations/switch">
      <button
        :disabled="loading || !selectedOrgId"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="runSwitch"
      >
        {{ loading ? 'Switching…' : `Switch to ${selectedLabel || 'selected org'}` }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- Related -->
    <LayoutSectionCard title="Related composable">
      <p class="text-sm text-text-muted">
        <code class="font-mono">useOrganization().switchOrganization({ organizationId })</code>
        See <NuxtLink to="/composables/organization" class="text-accent-600 hover:underline">Composables → useOrganization</NuxtLink>.
      </p>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
