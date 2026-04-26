<script setup lang="ts">
import { ref } from 'vue';
import { useEventLog } from '~/composables/useEventLog';

// All Asgardeo composables / components are auto-imported by @asgardeo/nuxt
const { isSignedIn } = useAsgardeo();

// ── Tab state ──────────────────────────────────────────────────────────────
const activeTab = ref('sign-in');
const tabs = [
  { key: 'sign-in', label: 'Sign In' },
  { key: 'sign-up', label: 'Sign Up' },
  { key: 'callback', label: 'Callback' },
];

// ── Event log ──────────────────────────────────────────────────────────────
const { entries, log, clear } = useEventLog();

function onSuccess(result?: unknown) {
  log(`Embedded flow succeeded${result ? ': ' + JSON.stringify(result) : ''}`, 'success');
}

function onError(err?: unknown) {
  const msg = err instanceof Error ? err.message : String(err ?? 'Unknown error');
  log(`Embedded flow error: ${msg}`, 'error');
}

// ── Code snippets ──────────────────────────────────────────────────────────
const signInSnippet = `<!-- pages/login.vue -->
<template>
  <AsgardeoSignIn
    variant="outlined"
    size="medium"
    @success="onSuccess"
    @error="onError"
  />
</template>

<script setup lang="ts">
function onSuccess() {
  navigateTo('/dashboard');
}
function onError(err: unknown) {
  console.error(err);
}
<\/script>`;

const signUpSnippet = `<!-- pages/register.vue -->
<template>
  <AsgardeoSignUp
    variant="outlined"
    @success="onSuccess"
    @error="onError"
  />
</template>`;

const callbackSnippet = `<!-- pages/callback.vue -->
<!--
  REQUIRED for embedded flows.
  
  When Asgardeo redirects back after an embedded authenticator step
  (e.g. social login prompt, MFA), it sends an authorization code
  to your callbackUrl.
  
  <AsgardeoCallback> reads the query params and forwards them
  back to the originating sign-in step without a full page reload.
  
  Add this page and set callbackUrl in nuxt.config.ts:
    asgardeo: {
      callbackUrl: '/callback'   // must match the registered redirect URI
    }
-->
<template>
  <AsgardeoCallback
    @error="(err) => console.error(err)"
  />
</template>`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Auth Flows — Embedded"
      description="Render the hosted sign-in / sign-up widget inline. No redirect to a separate login page."
    />

    <!-- ── Current auth state badge ────────────────────────────────────── -->
    <div class="flex gap-3">
      <SharedStatusBadge
        :status="isSignedIn ? 'success' : 'neutral'"
        :label="isSignedIn ? 'Signed In' : 'Signed Out'"
      />
    </div>

    <!-- ── Info banner ───────────────────────────────────────────────────── -->
    <div class="flex gap-3 px-4 py-3 bg-accent-50 border border-accent-100 rounded-lg text-sm text-text">
      <svg class="h-5 w-5 shrink-0 text-accent-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
      <p>
        The embedded flow requires a <code class="bg-surface-muted px-1 rounded font-mono">/callback</code> page with
        <code class="bg-surface-muted px-1 rounded font-mono">&lt;AsgardeoCallback /&gt;</code> to handle any redirect steps
        (e.g. social login, MFA prompts). See the <strong>Callback</strong> tab for the setup.
      </p>
    </div>

    <!-- ── Tabs ──────────────────────────────────────────────────────────── -->
    <LayoutTabGroup :tabs="tabs" v-model="activeTab">
      <!-- ─── Sign In tab ─── -->
      <template #sign-in>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoSignIn"
            description="Renders the Asgardeo-hosted sign-in widget inline. Handles the full app-native flow including MFA steps."
          >
            <!-- Live preview -->
            <div class="flex justify-center py-4">
              <AsgardeoSignIn
                variant="outlined"
                size="medium"
                @success="onSuccess"
                @error="onError"
              />
            </div>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="signInSnippet" language="vue" />
        </div>
      </template>

      <!-- ─── Sign Up tab ─── -->
      <template #sign-up>
        <div class="space-y-5">
          <LayoutSectionCard
            title="AsgardeoSignUp"
            description="Renders the Asgardeo-hosted registration widget inline."
          >
            <div class="flex justify-center py-4">
              <AsgardeoSignUp
                variant="outlined"
                @success="onSuccess"
                @error="onError"
              />
            </div>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="signUpSnippet" language="vue" />
        </div>
      </template>

      <!-- ─── Callback tab ─── -->
      <template #callback>
        <div class="space-y-5">
          <LayoutSectionCard title="AsgardeoCallback">
            <div class="space-y-4 text-sm">
              <p class="text-text">
                The callback page is <strong>required</strong> when using the embedded flow with any
                authenticator that performs a browser redirect (social logins, external IdPs, some MFA
                methods). Without it, the user lands on a blank callback URL after authentication.
              </p>

              <div class="space-y-2">
                <p class="font-semibold text-text">Setup</p>
                <ol class="list-decimal list-inside space-y-1 text-text-muted">
                  <li>
                    Create <code class="bg-surface-muted px-1 rounded font-mono">pages/callback.vue</code>
                    containing only <code class="bg-surface-muted px-1 rounded font-mono">&lt;AsgardeoCallback /&gt;</code>.
                  </li>
                  <li>
                    Register <code class="bg-surface-muted px-1 rounded font-mono">/callback</code> as an
                    Authorized Redirect URI in your Asgardeo application.
                  </li>
                  <li>
                    Set <code class="bg-surface-muted px-1 rounded font-mono">callbackUrl: '/callback'</code>
                    in <code class="bg-surface-muted px-1 rounded font-mono">nuxt.config.ts → asgardeo</code>.
                  </li>
                </ol>
              </div>

              <div class="space-y-2">
                <p class="font-semibold text-text">What it does</p>
                <p class="text-text-muted">
                  <code class="bg-surface-muted px-1 rounded font-mono">&lt;AsgardeoCallback /&gt;</code>
                  reads <code class="bg-surface-muted px-1 rounded font-mono">code</code>,
                  <code class="bg-surface-muted px-1 rounded font-mono">state</code>, and
                  <code class="bg-surface-muted px-1 rounded font-mono">error</code> from the URL, validates
                  the state stored in <code class="bg-surface-muted px-1 rounded font-mono">sessionStorage</code>,
                  and forwards the OAuth parameters back to the originating sign-in step — all client-side,
                  without a full page reload.
                </p>
              </div>
            </div>
          </LayoutSectionCard>

          <LayoutCodeBlock :code="callbackSnippet" language="vue" />
        </div>
      </template>
    </LayoutTabGroup>

    <!-- ── Event log ──────────────────────────────────────────────────────── -->
    <LayoutSectionCard title="Event Log">
      <div class="flex items-center justify-between mb-3">
        <p class="text-xs text-text-muted">Success and error events from the embedded widget appear here.</p>
        <button
          type="button"
          class="text-xs text-text-muted hover:text-text underline"
          @click="clear"
        >
          Clear
        </button>
      </div>

      <div
        v-if="entries.length === 0"
        class="text-center py-6 text-text-muted text-sm"
      >
        No events yet. Try the sign-in or sign-up widget above.
      </div>

      <ul v-else class="space-y-1 max-h-48 overflow-y-auto font-mono text-xs">
        <li
          v-for="entry in entries"
          :key="entry.id"
          class="flex items-start gap-2 px-2 py-1.5 rounded"
          :class="{
            'bg-success/10 text-success':      entry.type === 'success',
            'bg-danger/10 text-danger':         entry.type === 'error',
            'bg-warning/10 text-warning':       entry.type === 'warning',
            'bg-surface-muted text-text-muted': entry.type === 'info',
          }"
        >
          <span class="shrink-0 text-text-muted/60">{{ entry.timestamp }}</span>
          <span>{{ entry.message }}</span>
        </li>
      </ul>
    </LayoutSectionCard>

    <!-- ── Back link ──────────────────────────────────────────────────────── -->
    <div class="flex justify-start">
      <NuxtLink
        to="/auth-flows"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:border-accent-500 hover:text-accent-600 transition-colors"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back: Redirect flow
      </NuxtLink>
    </div>
  </div>
</template>
