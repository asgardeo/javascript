<script setup lang="ts">
const whichToUseRows: [string, string][] = [
  ['Just require sign-in',           "middleware: ['auth']"],
  ['Require org membership',          'defineAsgardeoMiddleware({ requireOrganization: true })'],
  ['Require specific OAuth scopes',   'defineAsgardeoMiddleware({ requireScopes: [...] })'],
  ['Custom redirect on unauthorised', "defineAsgardeoMiddleware({ redirectTo: '/denied' })"],
  ['Multiple conditions on one page', 'Combine options in a single defineAsgardeoMiddleware call'],
];

const cards = [
  {
    path: '/middleware/protected',
    label: 'auth (named)',
    badge: 'named middleware',
    badgeStatus: 'info' as const,
    description:
      'Protect a page with the built-in named middleware. Unauthenticated visitors are redirected to sign-in with a returnTo parameter.',
    snippet: "definePageMeta({ middleware: ['auth'] })",
  },
  {
    path: '/middleware/org-required',
    label: 'requireOrganization',
    badge: 'inline middleware',
    badgeStatus: 'warning' as const,
    description:
      'Require the user to be acting within an organization. Uses defineAsgardeoMiddleware() with the requireOrganization option.',
    snippet: "defineAsgardeoMiddleware({ requireOrganization: true })",
  },
  {
    path: '/middleware/scoped',
    label: 'requireScopes',
    badge: 'inline middleware',
    badgeStatus: 'warning' as const,
    description:
      "Guard a page behind specific OAuth scopes. Only users whose session contains all listed scopes can proceed.",
    snippet: "defineAsgardeoMiddleware({ requireScopes: ['openid', 'profile'] })",
  },
];

const codeSnippet = `// ── 1. Named middleware (auth) ────────────────────────────────────────────
// pages/protected.vue
<script setup>
definePageMeta({ middleware: ['auth'] });
<\/script>

// ── 2. Inline middleware — requireOrganization ─────────────────────────────
// pages/org-only.vue
// defineAsgardeoMiddleware is auto-imported by @asgardeo/nuxt
<script setup>
definePageMeta({
  middleware: [defineAsgardeoMiddleware({ requireOrganization: true })],
});
<\/script>

// ── 3. Inline middleware — requireScopes ──────────────────────────────────
// pages/scoped.vue
<script setup>
definePageMeta({
  middleware: [
    defineAsgardeoMiddleware({ requireScopes: ['openid', 'profile'] }),
  ],
});
<\/script>

// ── 4. Combining options ───────────────────────────────────────────────────
<script setup>
definePageMeta({
  middleware: [
    defineAsgardeoMiddleware({
      requireOrganization: true,
      requireScopes: ['openid', 'profile'],
      redirectTo: '/access-denied',
    }),
  ],
});
<\/script>`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Middleware"
      description="@asgardeo/nuxt ships a built-in named middleware and a typed factory function for protecting pages based on auth status, organization membership, or OAuth scopes."
    />

    <!-- ── Cards ───────────────────────────────────────────────────────── -->
    <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
      <NuxtLink
        v-for="card in cards"
        :key="card.path"
        :to="card.path"
        class="block rounded-lg border border-border bg-surface p-5 hover:border-accent-400 hover:bg-surface-hover transition-colors group"
      >
        <div class="flex items-start justify-between mb-3">
          <span class="font-mono text-sm font-semibold text-text group-hover:text-accent-600">{{ card.label }}</span>
          <SharedStatusBadge :status="card.badgeStatus" :label="card.badge" />
        </div>
        <p class="text-xs text-text-muted leading-relaxed mb-3">{{ card.description }}</p>
        <code class="text-xs text-accent-600 font-mono break-all">{{ card.snippet }}</code>
      </NuxtLink>
    </div>

    <!-- ── How it works ────────────────────────────────────────────────── -->
    <LayoutSectionCard title="How Asgardeo middleware works">
      <div class="space-y-4 text-sm text-text-muted leading-relaxed">
        <p>
          The SDK registers two middleware primitives automatically via
          <code class="font-mono text-text">@asgardeo/nuxt</code>:
        </p>
        <div class="space-y-3">
          <div class="rounded-md border border-border bg-surface-code p-4">
            <div class="font-mono text-text text-xs font-semibold mb-1">auth (named middleware)</div>
            <p class="text-xs">
              Registered globally by the module via <code class="font-mono">addRouteMiddleware</code>. Reference it
              by name as <code class="font-mono">'auth'</code> in any page. Redirects unauthenticated visitors to
              <code class="font-mono">/api/auth/signin?returnTo=&lt;current path&gt;</code> so users land
              back where they started after signing in.
            </p>
          </div>
          <div class="rounded-md border border-border bg-surface-code p-4">
            <div class="font-mono text-text text-xs font-semibold mb-1">defineAsgardeoMiddleware (factory)</div>
            <p class="text-xs">
              Auto-imported composable that returns an inline route middleware. Accepts
              <code class="font-mono">requireOrganization</code>, <code class="font-mono">requireScopes[]</code>,
              and an optional <code class="font-mono">redirectTo</code> override. Pass the result directly
              to <code class="font-mono">definePageMeta.middleware</code> — no separate file needed.
            </p>
          </div>
        </div>
        <p>
          Both primitives read from the reactive
          <code class="font-mono text-text">useState("asgardeo:auth")</code> key that the SDK populates
          on every SSR request and keeps in sync on the client — no additional API calls.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- ── When to use which ────────────────────────────────────────────── -->
    <LayoutSectionCard title="Which one to use?">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-text-muted">Scenario</th>
              <th class="pb-2 font-medium text-text-muted">Recommended</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-xs">
            <tr v-for="row in whichToUseRows" :key="row[0]">
              <td class="py-2 pr-6 text-text-muted">{{ row[0] }}</td>
              <td class="py-2 font-mono text-text">{{ row[1] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── Code snippet ────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="vue" />
  </div>
</template>
