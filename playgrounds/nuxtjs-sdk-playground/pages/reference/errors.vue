<script setup lang="ts">
import { ref } from 'vue';
// Imported from the `/errors` subpath rather than the `@asgardeo/nuxt` module
// entry — Vite's impound plugin blocks the Vue layer from importing the module
// entry directly.
import { AsgardeoError, ErrorCode } from '@asgardeo/nuxt/errors';

// ── Enumerate every ErrorCode so the page never drifts from the SDK ──────
const errorCodes = Object.entries(ErrorCode).filter(
  ([, v]) => typeof v === 'string',
) as Array<[string, string]>;

// ── Live demo: throw + catch an AsgardeoError ────────────────────────────
const caught = ref<{ name: string; code: string; message: string } | null>(null);

function throwAndCatch() {
  try {
    throw new AsgardeoError(
      'Example error from the playground',
      ErrorCode.Unknown ?? 'UNKNOWN',
    );
  } catch (e) {
    if (e instanceof AsgardeoError) {
      caught.value = { name: e.name, code: String(e.code), message: e.message };
    } else if (e instanceof Error) {
      caught.value = { name: e.name, code: '—', message: e.message };
    }
  }
}

const usageCode = `import { AsgardeoError, ErrorCode } from '@asgardeo/nuxt/errors';

try {
  // something that may throw
} catch (e) {
  if (e instanceof AsgardeoError) {
    console.error(e.code, e.message);

    if (e.code === ErrorCode.SessionExpired) {
      // redirect to sign-in, show a toast, etc.
    }
  }
  throw e;
}`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Errors"
      description="The AsgardeoError class and every ErrorCode the SDK may emit — useful for targeted error handling in your app."
    />

    <!-- AsgardeoError ──────────────────────────────────────────────────── -->
    <LayoutSectionCard id="AsgardeoError" title="AsgardeoError">
      <p class="text-sm text-text-muted mb-3">
        Base error class thrown by the SDK. Carries a stable <code class="font-mono">code</code>
        so your handler can branch on a specific failure without string-matching messages.
      </p>

      <LayoutCodeBlock :code="usageCode" language="ts" />

      <div class="mt-4">
        <button
          class="px-3 py-1.5 text-sm bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700"
          @click="throwAndCatch"
        >
          Throw & catch an example
        </button>
        <dl v-if="caught" class="mt-3 text-sm grid grid-cols-[100px_1fr] gap-x-4 gap-y-1">
          <dt class="text-text-muted">name</dt>
          <dd class="font-mono text-text">{{ caught.name }}</dd>
          <dt class="text-text-muted">code</dt>
          <dd class="font-mono text-text">{{ caught.code }}</dd>
          <dt class="text-text-muted">message</dt>
          <dd class="font-mono text-text">{{ caught.message }}</dd>
        </dl>
      </div>
    </LayoutSectionCard>

    <!-- ErrorCode enum ─────────────────────────────────────────────────── -->
    <LayoutSectionCard id="ErrorCode" title="ErrorCode">
      <p class="text-sm text-text-muted mb-3">
        All error codes the SDK emits. This list is generated at runtime from the
        <code class="font-mono">ErrorCode</code> enum — it never drifts from the shipped SDK.
      </p>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-4 font-medium text-text-muted">Name</th>
              <th class="pb-2 font-medium text-text-muted">Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="[name, value] in errorCodes" :key="name">
              <td class="py-1.5 pr-4 font-mono text-text">{{ name }}</td>
              <td class="py-1.5 font-mono text-xs text-text-muted">{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="!errorCodes.length" class="mt-3 text-sm text-text-muted italic">
        The SDK does not currently export any string-valued error codes.
      </p>
    </LayoutSectionCard>
  </div>
</template>
