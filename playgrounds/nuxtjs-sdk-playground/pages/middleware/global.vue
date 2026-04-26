<script setup lang="ts">
import { ref } from 'vue';
import { createRouteMatcher } from '@asgardeo/nuxt/utils';

// ── createRouteMatcher interactive demo ───────────────────────────────────
const matcherPatterns = ref('/app/**,/dashboard');
const matcherInput    = ref('/app/settings');
const matcherResult   = computed(() => {
  const patterns = matcherPatterns.value
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  try {
    const match = createRouteMatcher(patterns);
    return { ok: true, value: match(matcherInput.value) };
  } catch (e) {
    return { ok: false, value: e instanceof Error ? e.message : String(e) };
  }
});

const codeSnippet = `// middleware/auth.global.ts
import { createRouteMatcher } from '@asgardeo/nuxt/utils';

// Define which routes require authentication.
const isProtected = createRouteMatcher(['/app/**', '/dashboard', '/settings']);

export default defineNuxtRouteMiddleware((to) => {
  const { isSignedIn, isLoading } = useAsgardeo();

  // Skip during SSR or while auth state is loading.
  if (import.meta.server) return;
  if (isLoading.value)    return;

  if (isProtected(to.path) && !isSignedIn.value) {
    return navigateTo(\`/api/auth/signin?returnTo=\${encodeURIComponent(to.path)}\`);
  }
});`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Global middleware"
      description="Use createRouteMatcher from @asgardeo/nuxt/utils together with a Nuxt global middleware file to protect entire route patterns from unauthenticated access."
    />
    <div class="flex items-center gap-2 -mt-2">
      <SharedStatusBadge status="neutral" label="Explicit import" />
      <code class="text-xs font-mono text-text-muted">import { createRouteMatcher } from '@asgardeo/nuxt/utils'</code>
    </div>

    <!-- ── What it does ─────────────────────────────────────────────── -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          <span class="font-mono text-text">createRouteMatcher(patterns)</span> builds a matcher
          function from a list of glob-style route patterns. The returned function accepts a path
          string and returns <code class="font-mono">true</code> when it matches any of the patterns.
        </p>
        <p>
          Use it inside a <code class="font-mono">middleware/*.global.ts</code> file to apply
          authentication checks across an entire section of your app without annotating every page.
        </p>
        <p>
          Unlike <code class="font-mono">defineAsgardeoMiddleware()</code>, the global file approach
          can also run custom redirect logic before delegating to the SDK's sign-in route.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- ── Interactive tester ────────────────────────────────────────── -->
    <LayoutSectionCard title="Try it — createRouteMatcher">
      <div class="grid gap-3 md:grid-cols-2 mb-4">
        <label class="text-sm">
          <span class="block text-xs font-medium text-text-muted mb-1">Patterns (comma-separated)</span>
          <input
            v-model="matcherPatterns"
            type="text"
            class="w-full rounded-md border border-border bg-surface-code px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent-400"
          />
        </label>
        <label class="text-sm">
          <span class="block text-xs font-medium text-text-muted mb-1">Test path</span>
          <input
            v-model="matcherInput"
            type="text"
            class="w-full rounded-md border border-border bg-surface-code px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent-400"
          />
        </label>
      </div>

      <div class="flex items-center gap-3">
        <SharedStatusBadge
          v-if="matcherResult.ok"
          :status="matcherResult.value ? 'success' : 'neutral'"
          :label="matcherResult.value ? 'matches — would redirect' : 'no match — would pass'"
        />
        <SharedStatusBadge v-else status="danger" :label="String(matcherResult.value)" />
      </div>
    </LayoutSectionCard>

    <!-- ── Code ──────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
