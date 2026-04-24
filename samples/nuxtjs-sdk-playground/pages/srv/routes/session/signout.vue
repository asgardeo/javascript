<script setup lang="ts">
// ── POST /api/auth/signout ─────────────────────────────────────────────────
// Must be POST to prevent CSRF (a GET link can be triggered by a third party).
// The SDK composable and <AsgardeoSignOutButton /> both submit a form POST.

const codeSnippet = `// Via composable (recommended):
const { signOut } = useAsgardeo();
await signOut();

// Via component:
// <AsgardeoSignOutButton />

// Direct form POST (e.g. in a plain HTML page):
// <form method="POST" action="/api/auth/signout">
//   <button type="submit">Sign out</button>
// </form>

// NOTE: $fetch with method:'POST' also works but will NOT follow the 302
// redirect automatically in the browser — the SDK component handles this.
await $fetch('/api/auth/signout', { method: 'POST' });`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="POST /api/auth/signout"
      description="Signs the user out by revoking the session and clearing the session cookie, then redirects to afterSignOutUrl."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          Clears the <code class="font-mono">__asgardeo_session</code> cookie and calls the
          Asgardeo logout endpoint to revoke the refresh token. Responds with a
          <strong class="text-text">302 redirect</strong> to
          <code class="font-mono">afterSignOutUrl</code> (default: <code class="font-mono">/</code>).
        </p>
        <p class="text-amber-600 dark:text-amber-400 font-medium">
          ⚠️ This route is <strong>POST-only</strong> to prevent cross-site request forgery. A GET
          link from a third-party page could silently sign the user out. The SDK enforces POST.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard
      title="Try it"
      description="Submits a form POST to /api/auth/signout. The page will redirect after sign-out."
    >
      <form method="POST" action="/api/auth/signout">
        <button
          type="submit"
          class="px-4 py-2 text-sm font-medium bg-danger text-white rounded-md hover:opacity-90 transition-opacity"
        >
          Sign out (form POST)
        </button>
      </form>
    </LayoutSectionCard>

    <!-- Related -->
    <LayoutSectionCard title="Related composable / component">
      <div class="space-y-1 text-sm text-text-muted">
        <p><code class="font-mono">useAsgardeo().signOut()</code> — calls this route internally.</p>
        <p><code class="font-mono">&lt;AsgardeoSignOutButton /&gt;</code> — pre-styled button that submits the form POST.</p>
      </div>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
