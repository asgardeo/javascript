<script setup lang="ts">
import { ref } from 'vue';

// ── fetch token metadata from demo API route ───────────────────────────────
const result   = ref<unknown>(null);
const error    = ref<string | null>(null);
const loading  = ref(false);

async function fetchToken() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await $fetch('/api/demo/token');
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

fetchToken();

const codeSnippet = `// server/api/demo/token.get.ts
// getValidAccessToken is auto-imported by @asgardeo/nuxt — no import needed.
export default defineEventHandler(async (event) => {
  // Reads the session; detects whether a refresh happened.
  const sessionBefore = await useServerSession(event);
  if (!sessionBefore) {
    throw createError({ statusCode: 401, statusMessage: 'Not signed in.' });
  }

  const tokenBefore = sessionBefore.accessToken;

  // If the token is within 60 s of expiry AND a refresh token is available,
  // getValidAccessToken will silently refresh and rewrite the session cookie.
  const freshToken = await getValidAccessToken(event);

  return {
    tokenPreview:  freshToken.slice(0, 40) + '…',
    isRefreshed:   freshToken !== tokenBefore,
    expiresAt:     sessionBefore.accessTokenExpiresAt ?? null,
    expiresIn:     sessionBefore.accessTokenExpiresAt
                     ? sessionBefore.accessTokenExpiresAt - Math.floor(Date.now() / 1000)
                     : null,
  };
});`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="getValidAccessToken"
      description="Obtain a guaranteed-fresh access token from any Nitro server handler. Silently performs a refresh_token grant when the stored token is near expiry."
    />

    <!-- ── What it does ────────────────────────────────────────────────── -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          <span class="font-mono text-text">getValidAccessToken(event)</span> reads the
          session cookie, checks whether the access token is within
          <strong class="text-text">60 seconds of expiry</strong>, and:
        </p>
        <ul class="list-disc ml-5 space-y-1">
          <li>Returns the stored token immediately if it is still fresh.</li>
          <li>
            Sends a <code class="font-mono">refresh_token</code> grant to the OIDC token
            endpoint, reissues the session cookie with the new token, and returns the fresh
            token — all transparently to the caller.
          </li>
          <li>Throws a <code class="font-mono">401</code> if the token is expired and no refresh token is available.</li>
        </ul>
        <p>
          Auto-imported by <code class="font-mono">@asgardeo/nuxt</code> — no import statement
          needed in your server files.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- ── Live demo ───────────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="Live demo — GET /api/demo/token"
      description="Calls the demo server route which invokes getValidAccessToken(event). Must be signed in."
    >
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="fetchToken"
      >
        {{ loading ? 'Fetching…' : 'Get valid token' }}
      </button>

      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />

      <div v-if="result && !(result as Record<string, unknown>).isRefreshed === false" class="mt-3">
        <SharedStatusBadge
          :status="(result as Record<string, unknown>).isRefreshed ? 'warning' : 'success'"
          :label="(result as Record<string, unknown>).isRefreshed ? 'Token was silently refreshed' : 'Token was still fresh — no refresh needed'"
        />
      </div>
    </LayoutSectionCard>

    <!-- ── Response fields ────────────────────────────────────────────── -->
    <LayoutSectionCard title="Response fields" :collapsible="true">
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
              ['tokenPreview', 'First 40 chars of the access token (raw value redacted)'],
              ['isRefreshed', 'true when a silent refresh_token grant was performed this request'],
              ['expiresAt', 'Unix timestamp (s) when the access token expires'],
              ['expiresIn', 'Seconds remaining until expiry (may be negative if expired)'],
              ['isExpired', 'true when the stored token was past its expiry'],
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
