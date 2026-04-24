<script setup lang="ts">
import { ref } from 'vue';

const {
  currentOrganization,
  myOrganizations,
  isLoading,
  error,
  switchOrganization,
  getAllOrganizations,
  revalidateMyOrganizations,
} = useOrganization();

// ── getAllOrganizations ────────────────────────────────────────────────────
const allOrgsResult  = ref<unknown>(null);
const allOrgsLoading = ref(false);
const allOrgsError   = ref<string | null>(null);

async function runGetAllOrganizations() {
  allOrgsLoading.value = true;
  allOrgsError.value   = null;
  allOrgsResult.value  = null;
  try {
    allOrgsResult.value = await getAllOrganizations();
  } catch (e: unknown) {
    allOrgsError.value = e instanceof Error ? e.message : String(e);
  } finally {
    allOrgsLoading.value = false;
  }
}

// ── revalidateMyOrganizations ──────────────────────────────────────────────
const revalOrgsResult  = ref<unknown>(null);
const revalOrgsLoading = ref(false);
const revalOrgsError   = ref<string | null>(null);

async function runRevalidateMyOrganizations() {
  revalOrgsLoading.value = true;
  revalOrgsError.value   = null;
  revalOrgsResult.value  = null;
  try {
    const orgs = await revalidateMyOrganizations();
    revalOrgsResult.value = orgs;
  } catch (e: unknown) {
    revalOrgsError.value = e instanceof Error ? e.message : String(e);
  } finally {
    revalOrgsLoading.value = false;
  }
}

// ── switchOrganization ─────────────────────────────────────────────────────
const switchResult  = ref<unknown>(null);
const switchLoading = ref(false);
const switchError   = ref<string | null>(null);

async function runSwitchOrganization(org: unknown) {
  switchLoading.value = true;
  switchError.value   = null;
  switchResult.value  = null;
  try {
    await switchOrganization(org as Parameters<typeof switchOrganization>[0]);
    switchResult.value = `Switched to: ${(org as Record<string, unknown>)?.['name'] ?? 'unknown'}`;
  } catch (e: unknown) {
    switchError.value = e instanceof Error ? e.message : String(e);
  } finally {
    switchLoading.value = false;
  }
}

// ── Code snippet ───────────────────────────────────────────────────────────
const codeSnippet = `const {
  currentOrganization,
  myOrganizations,
  isLoading,
  error,
  switchOrganization,
  getAllOrganizations,
  revalidateMyOrganizations,
} = useOrganization();

// Reactive state
console.log(currentOrganization.value?.name);
console.log(myOrganizations.value.length);

// Fetch all organizations (paginated)
const all = await getAllOrganizations();

// Refetch the user's org list
const updated = await revalidateMyOrganizations();

// Switch to an organization (performs token exchange)
await switchOrganization(myOrganizations.value[0]);`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="useOrganization"
      description="Organization context — currentOrganization, myOrganizations, switchOrganization, getAllOrganizations, revalidateMyOrganizations."
    />

    <!-- ── Reactive State ───────────────────────────────────────────────── -->
    <LayoutSectionCard title="Reactive State">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-text-muted">Property</th>
              <th class="pb-2 font-medium text-text-muted">Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">currentOrganization</td>
              <td class="py-2 font-mono text-xs text-text">
                {{ currentOrganization ? (currentOrganization as Record<string, unknown>)?.['name'] : 'null' }}
              </td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">myOrganizations.length</td>
              <td class="py-2 font-mono text-xs text-text">{{ myOrganizations?.length ?? 0 }}</td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">isLoading</td>
              <td class="py-2">
                <SharedStatusBadge :status="isLoading ? 'warning' : 'neutral'" :label="String(isLoading)" />
              </td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">error</td>
              <td class="py-2 font-mono text-xs" :class="error ? 'text-danger' : 'text-text-muted'">
                {{ error ?? 'null' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── myOrganizations list ─────────────────────────────────────────── -->
    <LayoutSectionCard
      title="myOrganizations"
      description="List of organizations the signed-in user belongs to. Click one to call switchOrganization()."
    >
      <div v-if="myOrganizations && myOrganizations.length > 0" class="space-y-2">
        <div
          v-for="org in myOrganizations"
          :key="(org as Record<string, unknown>)?.['id'] as string"
          class="flex items-center justify-between rounded-lg border border-border bg-surface-muted px-4 py-3"
        >
          <div>
            <p class="text-sm font-medium text-text">{{ (org as Record<string, unknown>)?.['name'] }}</p>
            <p class="text-xs font-mono text-text-muted">{{ (org as Record<string, unknown>)?.['id'] }}</p>
          </div>
          <button
            class="text-xs px-3 py-1.5 rounded-md bg-accent-600 text-accent-foreground hover:bg-accent-700 transition-colors disabled:opacity-50"
            :disabled="switchLoading"
            @click="runSwitchOrganization(org)"
          >
            {{ switchLoading ? '…' : 'Switch' }}
          </button>
        </div>
        <SharedResultPanel class="mt-2" :result="switchResult" :error="switchError" :is-loading="switchLoading" />
      </div>
      <p v-else class="text-xs text-text-muted italic">No organizations — sign in first or none exist.</p>
    </LayoutSectionCard>

    <!-- ── getAllOrganizations ──────────────────────────────────────────── -->
    <LayoutSectionCard
      title="getAllOrganizations()"
      description="Fetch all organizations (paginated). Returns AllOrganizationsApiResponse."
    >
      <button
        class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        :disabled="allOrgsLoading"
        @click="runGetAllOrganizations"
      >
        {{ allOrgsLoading ? 'Fetching…' : 'getAllOrganizations()' }}
      </button>
      <SharedResultPanel class="mt-3" :result="allOrgsResult" :error="allOrgsError" :is-loading="allOrgsLoading" />
    </LayoutSectionCard>

    <!-- ── revalidateMyOrganizations ────────────────────────────────────── -->
    <LayoutSectionCard
      title="revalidateMyOrganizations()"
      description="Re-fetches the user-scoped organization list from the server and updates myOrganizations."
    >
      <button
        class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        :disabled="revalOrgsLoading"
        @click="runRevalidateMyOrganizations"
      >
        {{ revalOrgsLoading ? 'Refreshing…' : 'revalidateMyOrganizations()' }}
      </button>
      <SharedResultPanel class="mt-3" :result="revalOrgsResult" :error="revalOrgsError" :is-loading="revalOrgsLoading" />
    </LayoutSectionCard>

    <!-- ── Code ────────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
