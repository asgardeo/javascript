<script setup lang="ts">
import { ref, watch } from 'vue';
import { useEventLog } from '~/composables/useEventLog';

// All Asgardeo composables / components are auto-imported by @asgardeo/nuxt
const { isInitialized, isLoading, isSignedIn, signIn, signOut, signUp } = useAsgardeo();

// ── Event log ──────────────────────────────────────────────────────────────
const { entries, log, clear } = useEventLog();

// Watch reactive auth state and log transitions
watch(isInitialized, (val) => {
  log(`SDK initialized → ${val}`, val ? 'success' : 'info');
}, { immediate: true });

watch(isSignedIn, (val, prev) => {
  if (val === prev) return;
  log(
    val ? 'User signed in — isSignedIn = true' : 'User signed out — isSignedIn = false',
    val ? 'success' : 'info',
  );
});

watch(isLoading, (val) => {
  if (val) log('SDK loading…', 'info');
});

// ── Button action handlers (log then redirect) ─────────────────────────────
const isActionLoading = ref(false);
const actionError     = ref<string | null>(null);

async function handleSignIn() {
  isActionLoading.value = true;
  actionError.value = null;
  log('signIn() called — redirecting to Asgardeo…', 'info');
  try {
    await signIn();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    actionError.value = msg;
    log(`signIn() error: ${msg}`, 'error');
  } finally {
    isActionLoading.value = false;
  }
}

async function handleSignOut() {
  isActionLoading.value = true;
  actionError.value = null;
  log('signOut() called — redirecting to Asgardeo logout…', 'info');
  try {
    await signOut();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    actionError.value = msg;
    log(`signOut() error: ${msg}`, 'error');
  } finally {
    isActionLoading.value = false;
  }
}

async function handleSignUp() {
  isActionLoading.value = true;
  actionError.value = null;
  log('signUp() called — redirecting to registration…', 'info');
  try {
    await signUp();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    actionError.value = msg;
    log(`signUp() error: ${msg}`, 'error');
  } finally {
    isActionLoading.value = false;
  }
}

// ── How-it-works steps ─────────────────────────────────────────────────────
const flowSteps = [
  {
    step: 1,
    title: 'User clicks Sign In',
    detail: "The browser navigates to /api/auth/signin — the SDK's built-in Nitro route.",
  },
  {
    step: 2,
    title: 'Redirect to Asgardeo',
    detail: 'The server computes the OAuth2 authorization URL and issues a 302 redirect.',
  },
  {
    step: 3,
    title: 'User authenticates',
    detail: 'Asgardeo presents its hosted login page; user enters credentials.',
  },
  {
    step: 4,
    title: 'Callback with code',
    detail: 'Asgardeo redirects to /api/auth/callback with an authorization code.',
  },
  {
    step: 5,
    title: 'Token exchange',
    detail: 'The server exchanges the code for tokens, writes an encrypted cookie session.',
  },
  {
    step: 6,
    title: 'Redirect to app',
    detail: 'User lands on afterSignInUrl. isSignedIn becomes true.',
  },
];

// ── Code snippets ──────────────────────────────────────────────────────────
const buttonSnippet = `<template>
  <!-- Pre-styled buttons — auto-redirect on click -->
  <AsgardeoSignInButton />
  <AsgardeoSignOutButton />
  <AsgardeoSignUpButton />

  <!-- Custom content via default slot -->
  <AsgardeoSignInButton v-slot="{ isLoading }">
    {{ isLoading ? 'Redirecting…' : 'Log in with Asgardeo' }}
  </AsgardeoSignInButton>
</template>`;

const programmaticSnippet = `<script setup lang="ts">
const { signIn, signOut, signUp } = useAsgardeo();
// Optionally pass a returnTo so the user lands back on the right page
await signIn({ returnTo: '/dashboard' });

// signOut() submits a form POST to /api/auth/signout (CSRF protection).
// Never call GET /api/auth/signout directly — the route does not exist.
await signOut();
<\/script>`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Auth Flows — Redirect"
      description="Redirect-based OAuth2 sign-in, sign-out, and sign-up driven by the SDK's built-in /api/auth/* Nitro routes."
    />

    <!-- ── Current auth state ─────────────────────────────────────────────── -->
    <div class="flex flex-wrap gap-3">
      <SharedStatusBadge
        :status="isInitialized ? 'success' : 'warning'"
        :label="isInitialized ? 'Initialized' : 'Initializing…'"
      />
      <SharedStatusBadge
        :status="isLoading ? 'info' : 'neutral'"
        :label="isLoading ? 'Loading' : 'Idle'"
      />
      <SharedStatusBadge
        :status="isSignedIn ? 'success' : 'error'"
        :label="isSignedIn ? 'Signed In' : 'Signed Out'"
      />
    </div>

    <!-- ── Pre-styled component buttons ──────────────────────────────────── -->
    <LayoutSectionCard
      title="Pre-styled Buttons"
      description="Drop these anywhere — no handlers required. They redirect automatically."
    >
      <div class="space-y-5">
        <!-- Standard -->
        <div>
          <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Standard</p>
          <div class="flex flex-wrap gap-3">
            <AsgardeoSignInButton
              class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
            />
            <AsgardeoSignOutButton
              class="px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors"
            />
            <AsgardeoSignUpButton
              class="px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors"
            />
          </div>
        </div>

        <!-- Custom slot -->
        <div>
          <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Custom slot content</p>
          <div class="flex flex-wrap gap-3">
            <AsgardeoSignInButton
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
              v-slot="{ isLoading: btnLoading }"
            >
              <svg v-if="btnLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{{ btnLoading ? 'Redirecting…' : 'Log in with Asgardeo' }}</span>
            </AsgardeoSignInButton>

            <AsgardeoSignOutButton
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-danger/10 text-danger rounded-md hover:bg-danger/20 transition-colors"
              v-slot="{ isLoading: btnLoading }"
            >
              <span>{{ btnLoading ? 'Logging out…' : '→ Log out' }}</span>
            </AsgardeoSignOutButton>
          </div>
        </div>
      </div>

      <LayoutCodeBlock :code="buttonSnippet" language="vue" :collapsible="true" label="Show button snippet" class="mt-4" />
    </LayoutSectionCard>

    <!-- ── Programmatic actions ────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="Programmatic Actions"
      description="Call signIn / signOut / signUp directly from useAsgardeo() — same redirect behaviour."
    >
      <div v-if="actionError" class="mb-3 px-3 py-2 bg-danger/10 border border-danger/30 rounded text-sm text-danger">
        {{ actionError }}
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
          :disabled="isActionLoading"
          @click="handleSignIn"
        >
          signIn()
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors disabled:opacity-50"
          :disabled="isActionLoading"
          @click="handleSignOut"
        >
          signOut()
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors disabled:opacity-50"
          :disabled="isActionLoading"
          @click="handleSignUp"
        >
          signUp()
        </button>
      </div>

      <LayoutCodeBlock :code="programmaticSnippet" language="vue" :collapsible="true" label="Show snippet" class="mt-4" />
    </LayoutSectionCard>

    <!-- ── How the redirect flow works ────────────────────────────────────── -->
    <LayoutSectionCard title="How It Works" :collapsible="true">
      <ol class="space-y-3">
        <li
          v-for="s in flowSteps"
          :key="s.step"
          class="flex gap-3"
        >
          <span class="flex-shrink-0 w-6 h-6 rounded-full bg-accent-100 text-accent-700 text-xs font-bold flex items-center justify-center">
            {{ s.step }}
          </span>
          <div>
            <p class="text-sm font-medium text-text">{{ s.title }}</p>
            <p class="text-xs text-text-muted mt-0.5">{{ s.detail }}</p>
          </div>
        </li>
      </ol>
      <div class="mt-4 pt-4 border-t border-border text-xs text-text-muted space-y-1">
        <p class="font-semibold text-text">Sign-out flow</p>
        <p>
          <code class="font-mono">signOut()</code> and <code class="font-mono">&lt;AsgardeoSignOutButton /&gt;</code>
          both submit a <strong class="text-text">form POST</strong> to
          <code class="font-mono">POST /api/auth/signout</code>. The route is POST-only to prevent
          cross-site request forgery — a third-party page cannot trigger sign-out via a
          <code class="font-mono">&lt;img&gt;</code> or <code class="font-mono">&lt;a&gt;</code> tag.
          After the session cookie is cleared the user is redirected to
          <code class="font-mono">afterSignOutUrl</code>.
        </p>
        <p>
          See the route explorer:
          <NuxtLink to="/routes/session/signout" class="text-accent-600 hover:underline">
            POST /api/auth/signout
          </NuxtLink>.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- ── Event log ──────────────────────────────────────────────────────── -->
    <LayoutSectionCard title="Event Log">
      <div class="flex items-center justify-between mb-3">
        <p class="text-xs text-text-muted">Auth state transitions are logged here automatically.</p>
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
        No events yet. Try signing in or out.
      </div>

      <ul v-else class="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
        <li
          v-for="entry in entries"
          :key="entry.id"
          class="flex items-start gap-2 px-2 py-1.5 rounded"
          :class="{
            'bg-success/10 text-success':    entry.type === 'success',
            'bg-danger/10 text-danger':       entry.type === 'error',
            'bg-warning/10 text-warning':     entry.type === 'warning',
            'bg-surface-muted text-text-muted': entry.type === 'info',
          }"
        >
          <span class="shrink-0 text-text-muted/60">{{ entry.timestamp }}</span>
          <span>{{ entry.message }}</span>
        </li>
      </ul>
    </LayoutSectionCard>

    <!-- ── Link to embedded flow ──────────────────────────────────────────── -->
    <div class="flex justify-end">
      <NuxtLink
        to="/auth-flows/embedded"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:border-accent-500 hover:text-accent-600 transition-colors"
      >
        Next: Embedded flow
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>
