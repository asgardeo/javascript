<script setup lang="ts">
import { ref } from 'vue';
// `createRouteMatcher` is auto-imported by the Nuxt module (see packages/nuxt/src/module.ts).
// `maskToken` / `createLogger` live under a non-module-entry subpath so Vite's
// impound plugin allows the import from client code.
import { maskToken, createLogger } from '@asgardeo/nuxt/utils/log';

// ── createRouteMatcher demo ───────────────────────────────────────────────
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

// ── maskToken demo ────────────────────────────────────────────────────────
const maskInput  = ref('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature');
const maskOutput = computed(() => maskToken(maskInput.value));

// ── createLogger demo ─────────────────────────────────────────────────────
const logger = createLogger('playground');
const loggerOutput = ref<string[]>([]);
function logAt(level: 'debug' | 'info' | 'warn' | 'error') {
  const ts = new Date().toISOString();
  loggerOutput.value.unshift(`[${ts}] ${level.toUpperCase()} hello from playground`);
  logger[level]?.('hello from playground');
}

// ── Code snippets ─────────────────────────────────────────────────────────
// `createRouteMatcher` is auto-imported — no import statement required in Nuxt pages.
const createRouteMatcherCode = `// Auto-imported by @asgardeo/nuxt — no explicit import needed.

const isProtected = createRouteMatcher(['/app/**', '/dashboard']);

isProtected('/app/settings'); // true
isProtected('/public');       // false`;

const maskTokenCode = `import { maskToken } from '@asgardeo/nuxt/utils/log';

maskToken('eyJhbGciOiJSUzI1NiJ9.payload.sig');
// -> 'eyJh…sig' (safe to log)`;

const createLoggerCode = `import { createLogger } from '@asgardeo/nuxt/utils/log';

const log = createLogger('my-feature');

log.info('hello');   // [my-feature] INFO  hello
log.warn('heads up');
log.error(new Error('boom'));`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Utilities"
      description="Non-composable helpers exported from @asgardeo/nuxt — safe to import on either the client or server."
    />

    <!-- createRouteMatcher ─────────────────────────────────────────────── -->
    <LayoutSectionCard id="createRouteMatcher" title="createRouteMatcher">
      <p class="text-sm text-text-muted mb-3">
        Build a matcher function from a list of route patterns. Used internally by the middleware
        helpers; handy when you want the same semantics in your own code.
      </p>

      <LayoutCodeBlock :code="createRouteMatcherCode" language="ts" />

      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <label class="text-sm">
          <span class="block text-xs font-medium text-text-muted mb-1">Patterns (comma separated)</span>
          <input
            v-model="matcherPatterns"
            class="w-full px-3 py-1.5 text-sm font-mono rounded-md border border-border bg-surface"
          />
        </label>
        <label class="text-sm">
          <span class="block text-xs font-medium text-text-muted mb-1">Test path</span>
          <input
            v-model="matcherInput"
            class="w-full px-3 py-1.5 text-sm font-mono rounded-md border border-border bg-surface"
          />
        </label>
      </div>
      <p class="mt-3 text-sm">
        <span class="text-text-muted">Result:</span>
        <code class="ml-2 font-mono" :class="matcherResult.ok ? 'text-success' : 'text-danger'">
          {{ String(matcherResult.value) }}
        </code>
      </p>
    </LayoutSectionCard>

    <!-- maskToken ──────────────────────────────────────────────────────── -->
    <LayoutSectionCard id="maskToken" title="maskToken">
      <p class="text-sm text-text-muted mb-3">
        Returns a shortened, log-safe version of a token. Useful when diagnosing auth issues
        without spilling the full bearer value.
      </p>

      <LayoutCodeBlock :code="maskTokenCode" language="ts" />

      <div class="mt-4 space-y-2">
        <label class="block text-sm">
          <span class="block text-xs font-medium text-text-muted mb-1">Token (paste to mask)</span>
          <input
            v-model="maskInput"
            class="w-full px-3 py-1.5 text-sm font-mono rounded-md border border-border bg-surface"
          />
        </label>
        <p class="text-sm">
          <span class="text-text-muted">Masked:</span>
          <code class="ml-2 font-mono text-text">{{ maskOutput }}</code>
        </p>
      </div>
    </LayoutSectionCard>

    <!-- createLogger ───────────────────────────────────────────────────── -->
    <LayoutSectionCard id="createLogger" title="createLogger">
      <p class="text-sm text-text-muted mb-3">
        Creates a namespaced logger with level filtering controlled by the
        <code class="font-mono">ASGARDEO_LOG_LEVEL</code> environment variable.
      </p>

      <LayoutCodeBlock :code="createLoggerCode" language="ts" />

      <div class="mt-4 flex flex-wrap gap-2">
        <button
          v-for="lvl in ['debug', 'info', 'warn', 'error'] as const"
          :key="lvl"
          class="px-3 py-1 text-xs rounded-md border border-border bg-surface hover:bg-surface-muted"
          @click="logAt(lvl)"
        >
          log.{{ lvl }}()
        </button>
        <button
          v-if="loggerOutput.length"
          class="ml-auto px-3 py-1 text-xs rounded-md border border-border bg-surface hover:bg-surface-muted text-text-muted"
          @click="loggerOutput = []"
        >
          Clear
        </button>
      </div>
      <pre
        v-if="loggerOutput.length"
        class="mt-3 rounded-md border border-border bg-surface-muted p-3 text-xs font-mono text-text overflow-x-auto"
      >{{ loggerOutput.join('\n') }}</pre>
      <p v-else class="mt-3 text-xs text-text-muted italic">
        Click a button above to see logger output. Browser console also receives the call.
      </p>
    </LayoutSectionCard>
  </div>
</template>
