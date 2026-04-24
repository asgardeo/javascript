<script setup lang="ts">
// ── GET /api/auth/signin ────────────────────────────────────────────────────
// This route issues a 302 redirect to Asgardeo — not fetchable inline.
// Opening it in a new tab triggers the full sign-in flow.

const returnTo = ref('');

function openSignIn() {
  const url = returnTo.value
    ? `/api/auth/signin?returnTo=${encodeURIComponent(returnTo.value)}`
    : '/api/auth/signin';
  window.open(url, '_blank');
}

const codeSnippet = `// Initiate sign-in from a server link or $fetch (will follow 302 redirect)
// Most apps use the composable or component instead:
//
//   const { signIn } = useAsgardeo();
//   await signIn();
//
// Or the pre-built component:
//   <AsgardeoSignInButton />
//
// Direct $fetch — NOTE: $fetch does NOT follow 302 redirects in the browser.
// Use window.location.href or <a> for redirect-based auth flows.
window.location.href = '/api/auth/signin';

// With an optional returnTo query parameter:
window.location.href = '/api/auth/signin?returnTo=/dashboard';`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="GET /api/auth/signin"
      description="Initiates the OAuth2 Authorization Code flow by redirecting the browser to the Asgardeo hosted login page."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          The server builds the OAuth2 <code class="font-mono">authorization_url</code> using the
          configured <code class="font-mono">clientId</code>, <code class="font-mono">scope</code>,
          and <code class="font-mono">callbackUrl</code>, then issues a
          <strong class="text-text">302 redirect</strong> to Asgardeo.
        </p>
        <p>
          An optional <code class="font-mono">returnTo</code> query param is stored in the session
          so the user lands on the right page after authentication.
        </p>
        <p class="text-amber-600 dark:text-amber-400 font-medium">
          ⚠️ Because this route returns a redirect, it cannot be called with <code class="font-mono">$fetch</code>
          directly in the browser — use <code class="font-mono">window.location.href</code> or the
          pre-built <code class="font-mono">&lt;AsgardeoSignInButton /&gt;</code> component.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- Request inputs -->
    <LayoutSectionCard title="Request inputs">
      <div class="space-y-3">
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1">
            <code class="font-mono">returnTo</code> (optional query param)
          </label>
          <input
            v-model="returnTo"
            type="text"
            placeholder="/dashboard"
            class="w-full max-w-sm rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>
      </div>
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard
      title="Try it"
      description="Opens the sign-in flow in a new tab. You will be redirected to Asgardeo's hosted login page."
    >
      <button
        class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
        @click="openSignIn"
      >
        Open sign-in flow ↗
      </button>
    </LayoutSectionCard>

    <!-- Related composable -->
    <LayoutSectionCard title="Related composable / component">
      <div class="space-y-1 text-sm text-text-muted">
        <p><code class="font-mono">useAsgardeo().signIn()</code> — calls this route internally.</p>
        <p><code class="font-mono">&lt;AsgardeoSignInButton /&gt;</code> — pre-styled button that calls <code class="font-mono">signIn()</code>.</p>
      </div>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
