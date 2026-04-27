<script setup lang="ts">
import { ref } from 'vue';

const result   = ref<unknown>(null);
const error    = ref<string | null>(null);
const loading  = ref(false);

async function fetchSession() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await $fetch('/api/demo/require-session');
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

fetchSession();

const codeSnippet = `// server/api/me.get.ts
import { requireServerSession } from '@asgardeo/nuxt/server';

export default defineEventHandler(async (event) => {
  // Throws HTTP 401 automatically when the user is not signed in.
  // No null-check needed — session is guaranteed non-null below.
  const session = await requireServerSession(event);

  return { userId: session.sub, scopes: session.scopes };
});`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="requireServerSession"
      description="Assert that a valid session exists in any Nitro server handler. Throws an HTTP 401 automatically when the user is not signed in; returns the decoded session payload as a non-null guarantee."
    />
    <!-- ── What it does ────────────────────────────────────────────────── -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          <span class="font-mono text-text">requireServerSession(event)</span> calls
          <code class="font-mono">useServerSession(event)</code> internally. If the session
          is missing or the cookie signature is invalid, it immediately throws an H3 error
          with <code class="font-mono">statusCode: 401</code> — no null-check required in
          your handler.
        </p>
        <p>
          When authentication succeeds the return type is
          <code class="font-mono">AsgardeoSessionPayload</code> (never null), so TypeScript
          knows the session is present for every line that follows.
        </p>
        <p>
          Use <code class="font-mono">useServerSession</code> instead when you want to
          handle the unauthenticated case yourself (e.g. return a public fallback rather than
          a hard 401).
        </p>
      </div>
    </LayoutSectionCard>

    <!-- ── Comparison ────────────────────────────────────────────────────── -->
    <LayoutSectionCard title="Comparison with useServerSession" :collapsible="true">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-text-muted">Behaviour</th>
              <th class="pb-2 pr-6 font-medium text-text-muted">useServerSession</th>
              <th class="pb-2 font-medium text-text-muted">requireServerSession</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-xs">
            <tr v-for="row in [
              ['Return type',        'AsgardeoSessionPayload | null', 'AsgardeoSessionPayload'],
              ['Not signed in',      'Returns null',                  'Throws HTTP 401'],
              ['Null-check needed?', 'Yes',                           'No'],
              ['Best for',           'Optional auth / public pages',  'Protected routes'],
            ]" :key="row[0]">
              <td class="py-2.5 pr-6 font-medium text-text">{{ row[0] }}</td>
              <td class="py-2.5 pr-6 font-mono text-text-muted">{{ row[1] }}</td>
              <td class="py-2.5 font-mono text-text-muted">{{ row[2] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── Live demo ───────────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="Live demo — GET /api/demo/require-session"
      description="Calls a demo route that invokes requireServerSession(event). Returns the session payload when signed in, or a 401 error when not."
    >
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="fetchSession"
      >
        {{ loading ? 'Fetching…' : 'Fetch session (required)' }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- ── Code ────────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
