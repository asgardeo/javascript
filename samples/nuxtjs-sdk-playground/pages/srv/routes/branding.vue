<script setup lang="ts">
import { ref } from 'vue';
import { getBranding } from '~/utils/sdkRoutes';

const result  = ref<unknown>(null);
const error   = ref<string | null>(null);
const loading = ref(false);

async function fetchBranding() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await getBranding();
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

fetchBranding();

const codeSnippet = `// Direct $fetch:
const branding = await $fetch('/api/auth/branding');

// Via sdkRoutes helper:
import { getBranding } from '~/utils/sdkRoutes';
const branding = await getBranding();

// Via composable:
const { fetchBranding, brandingPreference, theme } = useBranding();
await fetchBranding();      // initial fetch (deduped)
await refetch();            // force re-fetch (bypasses dedup, hits this route)

// The response is a BrandingPreference object containing colors, logos,
// font settings, and other theming data from the Asgardeo console.`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="GET /api/auth/branding"
      description="Fetches the branding preference and theme configuration for the current organization from the Asgardeo console."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          Calls the Asgardeo Branding API using the current organization context (from the session
          cookie) and returns the <code class="font-mono">BrandingPreference</code> object — colors,
          logos, font, and login page configurations.
        </p>
        <p>
          Returns <code class="font-mono">null</code> when no branding has been configured for the
          organization. The <code class="font-mono">useBranding()</code> composable wraps this route
          and exposes a resolved <code class="font-mono">theme</code> ref.
        </p>
        <p>
          The composable's <code class="font-mono">refetch()</code> method bypasses deduplication
          and directly calls this route — useful after changing branding settings in the console.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard
      title="Try it — GET /api/auth/branding"
      description="Sign in first to fetch organization branding."
    >
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="fetchBranding"
      >
        {{ loading ? 'Fetching…' : 'Fetch branding' }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- Related -->
    <LayoutSectionCard title="Related composable">
      <div class="space-y-1 text-sm text-text-muted">
        <p>
          <code class="font-mono">useBranding().fetchBranding()</code> — deduplicated fetch
          (safe to call multiple times).
        </p>
        <p>
          <code class="font-mono">useBranding().refetch()</code> — force re-fetch, always hits this
          route.
        </p>
        <p>
          See <NuxtLink to="/composables/branding" class="text-accent-600 hover:underline">Composables → useBranding</NuxtLink>.
        </p>
      </div>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
