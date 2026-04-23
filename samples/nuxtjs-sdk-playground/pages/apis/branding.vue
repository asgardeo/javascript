<script setup lang="ts">
import { ref } from 'vue';

const {
  activeTheme,
  brandingPreference,
  error,
  isLoading,
  theme,
  fetchBranding,
  refetch,
} = useBranding();

// ── fetchBranding ──────────────────────────────────────────────────────────
const fetchResult   = ref<unknown>(null);
const fetchError    = ref<string | null>(null);
const fetchLoading  = ref(false);

async function runFetchBranding() {
  fetchResult.value  = null;
  fetchError.value   = null;
  fetchLoading.value = true;
  try {
    await fetchBranding();
    fetchResult.value = brandingPreference.value;
  } catch (err) {
    fetchError.value = err instanceof Error ? err.message : String(err);
  } finally {
    fetchLoading.value = false;
  }
}

// ── refetch ────────────────────────────────────────────────────────────────
const refetchResult  = ref<unknown>(null);
const refetchError   = ref<string | null>(null);
const refetchLoading = ref(false);

async function runRefetch() {
  refetchResult.value  = null;
  refetchError.value   = null;
  refetchLoading.value = true;
  try {
    await refetch();
    refetchResult.value = brandingPreference.value;
  } catch (err) {
    refetchError.value = err instanceof Error ? err.message : String(err);
  } finally {
    refetchLoading.value = false;
  }
}

const codeSnippet = `const {
  activeTheme,         // Readonly<Ref<'light' | 'dark' | null>>
  brandingPreference,  // Readonly<Ref<BrandingPreference | null>>
  error,               // Readonly<Ref<Error | null>>
  isLoading,           // Readonly<Ref<boolean>>
  theme,               // Readonly<Ref<Theme | null>>
  fetchBranding,       // () => Promise<void>
  refetch,             // () => Promise<void>  (bypasses dedup)
} = useBranding();

// Fetch branding preference from the organization
await fetchBranding();

// Access the resolved theme object
console.log(theme.value);

// Force a fresh fetch (bypasses deduplication)
await refetch();`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="useBranding"
      description="Fetch and access the organization's branding preference and resolved Theme object from the Asgardeo console."
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
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">activeTheme</td>
              <td class="py-2 font-mono text-xs text-text">{{ activeTheme ?? 'null' }}</td>
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
                {{ error ? (error as Error).message : 'null' }}
              </td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">brandingPreference</td>
              <td class="py-2 font-mono text-xs text-text">{{ brandingPreference ? 'loaded' : 'null' }}</td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">theme</td>
              <td class="py-2 font-mono text-xs text-text">{{ theme ? 'loaded' : 'null' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── fetchBranding ──────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="fetchBranding()"
      description="Fetch the organization branding preference. Deduplicated — returns cached result if already loaded."
    >
      <button
        :disabled="fetchLoading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="runFetchBranding"
      >
        {{ fetchLoading ? 'Fetching...' : 'fetchBranding()' }}
      </button>
      <SharedResultPanel :result="fetchResult" :error="fetchError" :is-loading="fetchLoading" />
    </LayoutSectionCard>

    <!-- ── refetch ────────────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="refetch()"
      description="Force a fresh branding fetch, bypassing deduplication. Always makes a new network request."
    >
      <button
        :disabled="refetchLoading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="runRefetch"
      >
        {{ refetchLoading ? 'Fetching...' : 'refetch()' }}
      </button>
      <SharedResultPanel :result="refetchResult" :error="refetchError" :is-loading="refetchLoading" />
    </LayoutSectionCard>

    <!-- ── brandingPreference viewer ──────────────────────────────────── -->
    <LayoutSectionCard title="brandingPreference" description="Full BrandingPreference object returned by the API." :collapsible="true">
      <SharedResultPanel :result="brandingPreference" />
    </LayoutSectionCard>

    <!-- ── theme viewer ───────────────────────────────────────────────── -->
    <LayoutSectionCard title="theme (from branding)" description="Resolved Theme object derived from the branding preference." :collapsible="true">
      <SharedResultPanel :result="theme" />
    </LayoutSectionCard>

    <!-- ── Code ────────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
