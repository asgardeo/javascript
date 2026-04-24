<script setup lang="ts">
import { ref } from 'vue';

// ── fetch context from demo API route ─────────────────────────────────────
const result   = ref<unknown>(null);
const error    = ref<string | null>(null);
const loading  = ref(false);

async function fetchContext() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await $fetch('/api/demo/context');
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

fetchContext();

const codeSnippet = `// server/api/example.get.ts
import { getAsgardeoContext } from '@asgardeo/nuxt/server';

export default defineEventHandler((event) => {
  const ctx = getAsgardeoContext(event);

  if (!ctx?.isSignedIn) {
    throw createError({ statusCode: 401, statusMessage: 'Not signed in.' });
  }

  // ctx.session is the decoded AsgardeoSessionPayload
  // ctx.ssr holds the SSR-prefetched user/org/branding data
  return {
    userId:   ctx.session!.sub,
    orgId:    ctx.session!.organizationId ?? null,
    hasSsrData: ctx.ssr != null,
  };
});`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="getAsgardeoContext"
      description="Typed accessor for event.context.asgardeo — the Asgardeo context set by the SSR plugin on every Nitro request. Returns session, isSignedIn, and ssr-prefetched data in a single call."
    />
    <div class="flex items-center gap-2 -mt-2">
      <SharedStatusBadge status="neutral" label="Explicit import" />
      <code class="text-xs font-mono text-text-muted">import { getAsgardeoContext } from '@asgardeo/nuxt/server'</code>
    </div>

    <!-- ── What it does ────────────────────────────────────────────────── -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          <span class="font-mono text-text">getAsgardeoContext(event)</span> reads
          <code class="font-mono">event.context.asgardeo</code> and returns a typed
          <code class="font-mono">AsgardeoEventContext</code> object, or
          <code class="font-mono">null</code> if the context has not been populated.
        </p>
        <p>
          The context is set by the Asgardeo Nitro plugin on every SSR request. It contains:
        </p>
        <ul class="list-disc ml-5 space-y-1 text-xs">
          <li><code class="font-mono">session</code> — the decoded <code class="font-mono">AsgardeoSessionPayload</code>, or null when not signed in.</li>
          <li><code class="font-mono">isSignedIn</code> — convenience boolean.</li>
          <li><code class="font-mono">ssr</code> — SSR-prefetched data (user profile, organizations, branding) when the Nitro plugin has run.</li>
        </ul>
        <p>
          Use this function when you want to inspect all three fields from a single access. For
          a session-only check with automatic 401 handling, use
          <code class="font-mono">requireServerSession(event)</code> instead.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- ── Live demo ───────────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="Live demo — GET /api/demo/context"
      description="Calls the demo route which invokes getAsgardeoContext(event) on the current request."
    >
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="fetchContext"
      >
        {{ loading ? 'Fetching…' : 'Fetch context' }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- ── Return type ─────────────────────────────────────────────────── -->
    <LayoutSectionCard title="AsgardeoEventContext shape" :collapsible="true">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-text-muted">Field</th>
              <th class="pb-2 pr-6 font-medium text-text-muted">Type</th>
              <th class="pb-2 font-medium text-text-muted">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-xs">
            <tr v-for="row in [
              ['session', 'AsgardeoSessionPayload | null', 'Decoded session JWT payload, null when not signed in.'],
              ['isSignedIn', 'boolean', 'True when a valid session cookie is present.'],
              ['ssr', 'AsgardeoSSRData | undefined', 'SSR-prefetched user/org/branding data. Present only after the SSR plugin runs.'],
            ]" :key="row[0]">
              <td class="py-2.5 pr-6 font-mono text-text">{{ row[0] }}</td>
              <td class="py-2.5 pr-6 font-mono text-text-muted">{{ row[1] }}</td>
              <td class="py-2.5 text-text-muted">{{ row[2] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── Code ──────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
