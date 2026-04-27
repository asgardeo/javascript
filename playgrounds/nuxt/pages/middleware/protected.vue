<script setup lang="ts">
// ── Apply the built-in auth middleware ────────────────────────────────────
// When not signed in, the middleware redirects to:
//   /api/auth/signin?returnTo=%2Fmiddleware%2Fprotected
// If you see this page, you passed.
definePageMeta({ middleware: ['auth'] });

// ── Show proof ────────────────────────────────────────────────────────────
const { isSignedIn, user } = useAsgardeo();

const displayName = computed(() => {
  const u = user.value as Record<string, unknown> | null;
  return (
    (u?.['displayName'] as string | undefined) ??
    (u?.['username'] as string | undefined) ??
    (u?.['sub'] as string | undefined) ??
    'Unknown'
  );
});

const codeSnippet = `// pages/protected.vue
// The 'auth' middleware is registered globally by @asgardeo/nuxt.
// Reference it by name — no import needed.
<script setup>
definePageMeta({ middleware: ['auth'] });
<\/script>

// When the user is not signed in, the middleware redirects to:
//   /api/auth/signin?returnTo=<current page path>
//
// After a successful sign-in, Asgardeo redirects back to afterSignInUrl.
// The auth handler then reads returnTo from the temp session and forwards
// the user back to this page automatically.

// ── Optional: reading the current user after the guard passes ─────────────
<script setup>
definePageMeta({ middleware: ['auth'] });
const { isSignedIn, user } = useAsgardeo();
// isSignedIn is guaranteed true here — the middleware already checked.
<\/script>`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="auth (named middleware)"
      description="The built-in named middleware shipped by @asgardeo/nuxt. Reference it by name in any page to require authentication."
    />
    <!-- ── Proof banner ──────────────────────────────────────────────── -->
    <div
      class="rounded-lg border border-success/40 bg-success/5 px-5 py-4 flex items-start gap-3"
    >
      <!-- green shield icon -->
      <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-success" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
      <div>
        <p class="text-sm font-semibold text-text">
          Middleware passed — you are signed in
        </p>
        <p class="text-xs text-text-muted mt-1">
          Signed in as
          <span class="font-mono text-text">{{ displayName }}</span>
          &nbsp;·&nbsp;
          <span class="font-mono text-text">isSignedIn = {{ isSignedIn }}</span>
        </p>
      </div>
    </div>

    <!-- ── What it does ─────────────────────────────────────────────── -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          The <code class="font-mono text-text">auth</code> middleware reads the reactive
          <code class="font-mono text-text">useState("asgardeo:auth")</code> key that the SDK
          populates on every SSR request. If <code class="font-mono">isSignedIn</code> is
          <code class="font-mono">false</code>, Nuxt is told to navigate to:
        </p>
        <div class="rounded-md bg-surface-code border border-border px-4 py-3 font-mono text-xs text-text">
          /api/auth/signin?returnTo=<span class="text-accent-600">%2Fmiddleware%2Fprotected</span>
        </div>
        <p>
          The sign-in handler stores <code class="font-mono">returnTo</code> in the temporary
          session cookie. After Asgardeo completes the OAuth2 callback, the callback route reads
          <code class="font-mono">returnTo</code> and redirects the user back to this page —
          so no navigation history is lost.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- ── returnTo flow ─────────────────────────────────────────────── -->
    <LayoutSectionCard title="returnTo flow" :collapsible="true">
      <ol class="space-y-3 text-sm text-text-muted list-decimal list-inside">
        <li>
          User visits <code class="font-mono text-text">/middleware/protected</code> while signed out.
        </li>
        <li>
          The <code class="font-mono text-text">auth</code> middleware fires and calls
          <code class="font-mono text-text">navigateTo("/api/auth/signin?returnTo=%2Fmiddleware%2Fprotected")</code>.
        </li>
        <li>
          The sign-in route handler stores <code class="font-mono text-text">returnTo</code>
          in an encrypted temporary session cookie, then redirects to Asgardeo's authorization endpoint.
        </li>
        <li>
          After successful sign-in, the OAuth2 callback route reads
          <code class="font-mono text-text">returnTo</code> from the temp cookie and redirects
          the user back to <code class="font-mono text-text">/middleware/protected</code>.
        </li>
        <li>
          The <code class="font-mono text-text">auth</code> middleware now finds
          <code class="font-mono text-text">isSignedIn = true</code> and allows the page to render.
        </li>
      </ol>
    </LayoutSectionCard>

    <!-- ── Code ─────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="vue" />
  </div>
</template>
