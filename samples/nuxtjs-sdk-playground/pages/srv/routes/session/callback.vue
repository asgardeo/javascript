<script setup lang="ts">
// ── GET /api/auth/callback ─────────────────────────────────────────────────
// Called by Asgardeo after authentication — not triggered manually.

const codeSnippet = `// This route is called automatically by Asgardeo after authentication.
// You do not call it directly. Configure the redirect URI in Asgardeo console:
//
//   Redirect URI: https://your-app.example.com/api/auth/callback
//
// nuxt.config.ts:
// asgardeo: {
//   callbackUrl: '/api/auth/callback',
//   afterSignInUrl: '/',
// }
//
// The handler:
//   1. Reads the authorization code from the query string
//   2. Exchanges it for tokens via the token endpoint
//   3. Writes an encrypted __asgardeo_session cookie
//   4. Redirects to afterSignInUrl`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="GET /api/auth/callback"
      description="OAuth2 callback handler — called by Asgardeo after the user authenticates. Exchanges the authorization code for tokens and creates the session cookie."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          Asgardeo redirects the user's browser here with a short-lived
          <code class="font-mono">code</code> and <code class="font-mono">state</code>
          query parameter after successful authentication.
        </p>
        <p>
          The server validates the <code class="font-mono">state</code> against the PKCE verifier,
          exchanges <code class="font-mono">code</code> for an access token, ID token and refresh
          token at Asgardeo's token endpoint, then writes an encrypted
          <code class="font-mono">__asgardeo_session</code> JWT cookie.
        </p>
        <p>
          After the cookie is set, a <strong class="text-text">302 redirect</strong> to
          <code class="font-mono">afterSignInUrl</code> (default <code class="font-mono">/</code>)
          completes the flow.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- No live trigger -->
    <LayoutSectionCard title="Try it">
      <p class="text-sm text-text-muted">
        This route is called by Asgardeo's servers automatically — there is no user-triggered live
        demo here. Use the
        <NuxtLink to="/server/routes/session/signin" class="text-accent-600 hover:underline">Sign In</NuxtLink>
        demo to start the full flow.
      </p>
    </LayoutSectionCard>

    <!-- Config reference -->
    <LayoutSectionCard title="Configuration">
      <div class="space-y-2 text-sm text-text-muted">
        <p>
          Register this path as the <strong class="text-text">Redirect URI</strong> in the
          Asgardeo console:
        </p>
        <code class="block font-mono text-xs bg-surface-muted rounded px-3 py-2">
          https://your-app.example.com/api/auth/callback
        </code>
        <p class="pt-1">
          Set <code class="font-mono">callbackUrl</code> in <code class="font-mono">nuxt.config.ts</code>
          to match (default: <code class="font-mono">/api/auth/callback</code>).
        </p>
      </div>
    </LayoutSectionCard>

    <!-- Related -->
    <LayoutSectionCard title="Related composable">
      <p class="text-sm text-text-muted">
        <code class="font-mono">useAsgardeo().isSignedIn</code> becomes <code class="font-mono">true</code>
        after this route completes successfully.
      </p>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
