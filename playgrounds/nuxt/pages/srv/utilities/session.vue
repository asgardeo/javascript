<script setup lang="ts">
import { ref } from 'vue';

// ── fetch session from demo API route ──────────────────────────────────────
const result   = ref<unknown>(null);
const error    = ref<string | null>(null);
const loading  = ref(false);

async function fetchSession() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await $fetch('/api/demo/session');
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

// Auto-fetch on mount so the panel is populated immediately
fetchSession();

const codeSnippet = `// server/api/demo/session.get.ts
// useServerSession is auto-imported by @asgardeo/nuxt — no import needed.
export default defineEventHandler(async (event) => {
  const session = await useServerSession(event);

  if (!session) {
    return { signedIn: false, session: null };
  }

  return {
    signedIn: true,
    session: {
      sub:             session.sub,
      sessionId:       session.sessionId,
      scopes:          session.scopes,
      organizationId:  session.organizationId ?? null,
      accessTokenExpiresAt: session.accessTokenExpiresAt ?? null,
      issuedAt:        session.iat,
      expiresAt:       session.exp,
      // Raw tokens are redacted in this demo for display safety.
    },
  };
});`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="useServerSession"
      description="Read and verify the Asgardeo session JWT cookie from any Nitro server handler. Returns the decoded payload or null when not signed in."
    />
    <div class="flex items-center gap-2 -mt-2">
      <SharedStatusBadge status="neutral" label="Explicit import" />
      <code class="text-xs font-mono text-text-muted">import { useServerSession } from '@asgardeo/nuxt/server'</code>
    </div>

    <!-- ── What it does ────────────────────────────────────────────────── -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          <span class="font-mono text-text">useServerSession(event)</span> reads the
          <code class="font-mono">__asgardeo_session</code> cookie, verifies the JWT signature
          with the server-side <code class="font-mono">sessionSecret</code>, and returns the
          decoded <code class="font-mono">AsgardeoSessionPayload</code>.
        </p>
        <p>
          Returns <code class="font-mono">null</code> gracefully when the cookie is absent or
          the signature is invalid — use
          <NuxtLink to="/server/utilities/require-session" class="font-mono text-accent-600 hover:underline">requireServerSession</NuxtLink>
          instead to have a 401 thrown automatically.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- ── Live demo ───────────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="Live demo — GET /api/demo/session"
      description="Calls the demo server route which invokes useServerSession(event) on the current request."
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

    <!-- ── Session fields ─────────────────────────────────────────────── -->
    <LayoutSectionCard title="AsgardeoSessionPayload fields" :collapsible="true">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-text-muted">Field</th>
              <th class="pb-2 font-medium text-text-muted">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-xs">
            <tr v-for="row in [
              ['sub', 'OIDC subject identifier (user ID)'],
              ['sessionId', 'Internal session identifier used by AsgardeoNuxtClient'],
              ['accessToken', 'Raw JWT access token (redacted in this demo)'],
              ['scopes', 'Space-separated list of granted OAuth scopes'],
              ['organizationId', 'Current organization ID (present when acting in an org)'],
              ['accessTokenExpiresAt', 'Unix timestamp (seconds) when the access token expires'],
              ['refreshToken', 'Refresh token for silent re-authentication (redacted)'],
              ['idToken', 'Raw ID token (redacted in this demo)'],
              ['iat', 'JWT issued-at timestamp'],
              ['exp', 'Session cookie expiry (JWT exp claim)'],
            ]" :key="row[0]">
              <td class="py-2 pr-6 font-mono text-text">{{ row[0] }}</td>
              <td class="py-2 text-text-muted">{{ row[1] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── Code ────────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
