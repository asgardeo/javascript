<script setup lang="ts">
import { serverUtilities } from '~/utils/sdk-manifest';
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Server Utilities — Overview"
      description="Nitro auto-imports and the AsgardeoNuxtClient singleton available inside your own server/api/ handlers."
    />

    <!-- ── Utility cards ────────────────────────────────────────────────── -->
    <div class="grid gap-4 md:grid-cols-3">
      <NuxtLink
        v-for="util in serverUtilities"
        :key="util.name"
        :to="util.path"
        class="group rounded-xl border border-border bg-surface p-5 hover:border-accent-400 hover:shadow-sm transition-all"
      >
        <p class="font-mono text-sm font-semibold text-accent-600 group-hover:underline mb-2">
          {{ util.name }}
        </p>
        <p class="text-xs text-text-muted leading-relaxed">{{ util.description }}</p>
        <p class="mt-3 text-xs font-medium text-accent-600 group-hover:underline">View docs →</p>
      </NuxtLink>
    </div>

    <!-- ── Reference table ─────────────────────────────────────────────── -->
    <LayoutSectionCard title="All utilities">
      <ul class="divide-y divide-border">
        <li
          v-for="util in serverUtilities"
          :key="util.name"
          class="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
        >
          <div class="min-w-0">
            <NuxtLink
              :to="util.path"
              class="font-mono text-sm font-semibold text-accent-600 hover:underline"
            >
              {{ util.name }}
            </NuxtLink>
            <p class="text-xs text-text-muted mt-0.5">{{ util.description }}</p>
          </div>
          <NuxtLink
            :to="util.path"
            class="shrink-0 text-xs font-medium text-accent-600 hover:underline"
          >
            Demo →
          </NuxtLink>
        </li>
      </ul>
    </LayoutSectionCard>

    <!-- ── How it works ─────────────────────────────────────────────────── -->
    <LayoutSectionCard title="How server utilities work">
      <div class="space-y-3 text-sm text-text-muted leading-relaxed">
        <p>
          The <span class="font-mono text-text">@asgardeo/nuxt</span> module registers
          <span class="font-mono text-text">useServerSession</span> and
          <span class="font-mono text-text">getValidAccessToken</span> as Nitro auto-imports,
          so you can call them in any <code class="font-mono">server/api/</code> handler without
          an explicit <code class="font-mono">import</code>.
        </p>
        <p>
          <span class="font-mono text-text">AsgardeoNuxtClient</span> is a singleton that wraps
          the Asgardeo Management API — use it to fetch user info, organization data, or branding
          preferences from any server context.
        </p>
        <pre class="bg-surface-muted rounded-lg p-4 text-xs font-mono overflow-x-auto">
// server/api/me.get.ts — no imports needed
export default defineEventHandler(async (event) =&gt; {
  const session = await requireServerSession(event); // throws 401 if not signed in
  const token   = await getValidAccessToken(event);  // always returns a fresh token
  return { userId: session.sub, token };
});</pre>
      </div>
    </LayoutSectionCard>
  </div>
</template>
