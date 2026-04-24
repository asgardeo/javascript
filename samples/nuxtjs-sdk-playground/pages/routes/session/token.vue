<script setup lang="ts">
import { ref, computed } from 'vue';
import { getToken } from '~/utils/sdkRoutes';

const result       = ref<unknown>(null);
const displayResult = computed(() => {
  if (!result.value || typeof result.value !== 'object') return result.value;
  const r = result.value as Record<string, unknown>;
  if (typeof r.accessToken === 'string') {
    return { ...r, accessToken: r.accessToken.slice(0, 20) + '…[redacted]' };
  }
  return r;
});
const error   = ref<string | null>(null);
const loading = ref(false);

async function fetchToken() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await getToken();
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

fetchToken();

const codeSnippet = `// Direct $fetch:
const tokenData = await $fetch('/api/auth/token');
console.log(tokenData.accessToken); // JWT string

// Via sdkRoutes helper:
import { getToken } from '~/utils/sdkRoutes';
const tokenData = await getToken();

// NOTE: the access token is redacted in the playground UI for security.

// Server-side equivalent (preferred for server routes):
// const token = await getValidAccessToken(event);  // auto-imported Nitro helper`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="GET /api/auth/token"
      description="Returns the current access token. Performs a silent refresh if the token is near expiry."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          Reads the session cookie, checks whether the access token is near expiry, and if so
          performs a <code class="font-mono">refresh_token</code> grant silently. Returns the
          fresh access token and its expiry.
        </p>
        <p>
          This is the client-facing equivalent of the
          <code class="font-mono">getValidAccessToken(event)</code> Nitro auto-import that server
          handlers use.
        </p>
        <p class="text-amber-600 dark:text-amber-400 text-xs font-medium">
          The access token value is redacted in this playground display for security. The full JWT
          is returned in production responses.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard
      title="Try it — GET /api/auth/token"
      description="Token is truncated for display. Sign in first to see a real token."
    >
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="fetchToken"
      >
        {{ loading ? 'Fetching…' : 'Fetch token' }}
      </button>
      <SharedResultPanel :result="displayResult" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- Response shape -->
    <LayoutSectionCard title="Response shape" :collapsible="true">
      <pre class="text-xs font-mono text-text-muted leading-relaxed">interface TokenResponse {
  accessToken: string;   // JWT access token
  expiresAt:   number;   // Unix timestamp (seconds)
}</pre>
    </LayoutSectionCard>

    <!-- Related -->
    <LayoutSectionCard title="Related server utility">
      <p class="text-sm text-text-muted">
        <code class="font-mono">getValidAccessToken(event)</code> — Nitro auto-import for server
        handlers. See <NuxtLink to="/server/token" class="text-accent-600 hover:underline">Server Utilities → getValidAccessToken</NuxtLink>.
      </p>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
