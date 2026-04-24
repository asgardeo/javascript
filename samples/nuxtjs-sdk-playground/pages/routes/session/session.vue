<script setup lang="ts">
import { ref } from 'vue';
import { getSession } from '~/utils/sdkRoutes';

const result  = ref<unknown>(null);
const error   = ref<string | null>(null);
const loading = ref(false);

async function fetchSession() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await getSession();
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

fetchSession();

const codeSnippet = `// Direct $fetch:
const session = await $fetch('/api/auth/session');

// Via sdkRoutes helper:
import { getSession } from '~/utils/sdkRoutes';
const session = await getSession();

// Typical response shape:
// {
//   isSignedIn: true,
//   sub: "user-id",
//   sessionId: "...",
//   scopes: "openid profile email",
//   organizationId: null,
//   accessTokenExpiresAt: 1714000000
// }`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="GET /api/auth/session"
      description="Returns the decoded session state for the current request — safe to call from client-side code."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          Reads the <code class="font-mono">__asgardeo_session</code> cookie, verifies the JWT
          signature, and returns the decoded payload as JSON. Returns
          <code class="font-mono">{ isSignedIn: false }</code> when the cookie is absent or invalid —
          never throws.
        </p>
        <p>
          This is the route the SSR plugin uses to hydrate
          <code class="font-mono">useAsgardeo()</code> reactive state on every page load.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard
      title="Try it — GET /api/auth/session"
      description="Calls $fetch('/api/auth/session') directly."
    >
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="fetchSession"
      >
        {{ loading ? 'Fetching…' : 'Fetch session' }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- Response shape -->
    <LayoutSectionCard title="Response shape" :collapsible="true">
      <pre class="text-xs font-mono text-text-muted leading-relaxed">interface SessionResponse {
  isSignedIn: boolean;
  sub?:                  string;   // OIDC subject (user ID)
  sessionId?:            string;   // internal session identifier
  scopes?:               string;   // space-separated OAuth scopes
  organizationId?:       string | null;
  accessTokenExpiresAt?: number;   // Unix timestamp (seconds)
}</pre>
    </LayoutSectionCard>

    <!-- Related -->
    <LayoutSectionCard title="Related composable">
      <p class="text-sm text-text-muted">
        <code class="font-mono">useAsgardeo().isSignedIn</code> is populated from this route on SSR
        and re-fetched after sign-in / sign-out.
      </p>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
