<script setup lang="ts">
const cards = [
  {
    path:        '/server/session',
    label:       'useServerSession',
    description: 'Reads the signed session cookie and returns the decoded payload. Returns null when not signed in. Safe to call in any Nitro handler.',
    badge:       'util',
  },
  {
    path:        '/server/token',
    label:       'getValidAccessToken',
    description: 'Returns a guaranteed-fresh access token. Performs a silent refresh_token grant when the stored token is near expiry and reissues the session cookie.',
    badge:       'util',
  },
  {
    path:        '/server/userinfo',
    label:       'AsgardeoNuxtClient',
    description: 'Singleton server-side SDK client. getUserProfile() calls /scim2/Me + /scim2/Schemas, flattens the result, and falls back to ID-token claims.',
    badge:       'class',
  },
];
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Server Utilities"
      description="Auto-imported Nitro helpers and the AsgardeoNuxtClient singleton for use in custom server API routes."
    />

    <!-- Note: separate from SDK routes ──────────────────────────────────── -->
    <div class="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm text-text-muted">
      <span class="font-medium text-text">Note:</span>
      This section covers the <strong class="text-text">playground-owned</strong> server utilities
      (<code class="font-mono">useServerSession</code>, <code class="font-mono">AsgardeoNuxtClient</code>)
      that you can call from your own <code class="font-mono">server/api/</code> handlers.
      For the SDK's built-in <code class="font-mono">/api/auth/*</code> routes,
      see <NuxtLink to="/routes" class="text-accent-600 hover:underline">SDK Routes</NuxtLink>.
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <NuxtLink
        v-for="card in cards"
        :key="card.path"
        :to="card.path"
        class="group rounded-xl border border-border bg-surface p-5 hover:border-accent-400 hover:shadow-sm transition-all"
      >
        <div class="flex items-start justify-between mb-3">
          <span class="font-mono text-sm font-semibold text-accent-600">{{ card.label }}</span>
          <span
            class="text-xs px-2 py-0.5 rounded-full border"
            :class="card.badge === 'class'
              ? 'bg-accent-50 text-accent-600 border-accent-200'
              : 'bg-surface-muted text-text-muted border-border'"
          >{{ card.badge }}</span>
        </div>
        <p class="text-sm text-text-muted leading-relaxed">{{ card.description }}</p>
        <p class="mt-3 text-xs font-medium text-accent-600 group-hover:underline">Explore →</p>
      </NuxtLink>
    </div>

    <!-- How it works ──────────────────────────────────────────────────── -->
    <LayoutSectionCard title="How server utilities work">
      <div class="space-y-3 text-sm text-text-muted leading-relaxed">
        <p>
          The <span class="font-mono text-text">@asgardeo/nuxt</span> module registers
          <span class="font-mono text-text">useServerSession</span>,
          <span class="font-mono text-text">requireServerSession</span>, and
          <span class="font-mono text-text">getValidAccessToken</span> as
          <strong class="text-text">Nitro auto-imports</strong>. You can call them directly in any
          <code class="font-mono">server/api/</code> file without an import statement.
        </p>
        <p>
          <span class="font-mono text-text">AsgardeoNuxtClient</span> is a singleton class available via
          <code class="font-mono">import { AsgardeoNuxtClient } from "@asgardeo/nuxt/server"</code>.
          It wraps the underlying <span class="font-mono text-text">@asgardeo/node</span> client and
          exposes typed methods like <code class="font-mono">getUserProfile(sessionId)</code>,
          <code class="font-mono">getMyOrganizations(sessionId)</code>, and more.
        </p>
        <p>
          All three demo endpoints below live in
          <code class="font-mono">server/api/demo/</code> and are called from the playground
          pages via <code class="font-mono">$fetch</code>.
        </p>
      </div>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="`// server/api/me.get.ts — example: custom server route
export default defineEventHandler(async (event) => {
  // useServerSession is auto-imported — no import needed
  const session = await useServerSession(event);
  if (!session) return { user: null };

  // requireServerSession throws 401 when not signed in
  // const session = await requireServerSession(event);

  // getValidAccessToken auto-refreshes the token near expiry
  const token = await getValidAccessToken(event);

  // AsgardeoNuxtClient — explicit import from @asgardeo/nuxt/server
  // import { AsgardeoNuxtClient } from '@asgardeo/nuxt/server';
  // const client = AsgardeoNuxtClient.getInstance();
  // const profile = await client.getUserProfile(session.sessionId);

  return { sub: session.sub, tokenPreview: token.slice(0, 20) + '…' };
});`" language="ts" />
  </div>
</template>
