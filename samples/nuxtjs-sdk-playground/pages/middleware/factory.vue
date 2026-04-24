<script setup lang="ts">
// ── defineAsgardeoMiddleware — factory function for typed inline middleware ─
// This page documents the factory and links to the option-specific examples.

const optionRows: [string, string, string][] = [
  ['requireOrganization', 'boolean', 'Redirect when the user has no active organizationId in session.'],
  ['requireScopes',       'string[]', 'Redirect when the user is missing one or more of the listed OAuth scopes.'],
  ['redirectTo',          'string',   'Custom path to redirect to when the guard fails (default: /api/auth/signin).'],
];

const codeSnippet = `// defineAsgardeoMiddleware is auto-imported by @asgardeo/nuxt — no import needed.

// ── Require organization membership ────────────────────────────────────────
// pages/org-only.vue
<script setup>
definePageMeta({
  middleware: [
    defineAsgardeoMiddleware({ requireOrganization: true }),
  ],
});
<\/script>

// ── Require specific OAuth scopes ──────────────────────────────────────────
// pages/scoped.vue
<script setup>
definePageMeta({
  middleware: [
    defineAsgardeoMiddleware({ requireScopes: ['openid', 'profile'] }),
  ],
});
<\/script>

// ── Combine options ────────────────────────────────────────────────────────
// pages/premium.vue
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
      title="defineAsgardeoMiddleware"
      description="Factory function that returns a typed Nuxt inline middleware. Use it in definePageMeta() to guard pages with organization membership or OAuth scope checks."
    />
    <div class="flex items-center gap-2 -mt-2">
      <SharedStatusBadge status="info" label="Auto-imported" />
      <span class="text-xs text-text-muted">from <code class="font-mono">@asgardeo/nuxt</code></span>
    </div>

    <!-- ── Options table ─────────────────────────────────────────────── -->
    <LayoutSectionCard title="Options">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-text-muted">Option</th>
              <th class="pb-2 pr-6 font-medium text-text-muted">Type</th>
              <th class="pb-2 font-medium text-text-muted">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-xs">
            <tr v-for="[option, type, description] in optionRows" :key="option">
              <td class="py-2.5 pr-6 font-mono text-text">{{ option }}</td>
              <td class="py-2.5 pr-6 font-mono text-text-muted">{{ type }}</td>
              <td class="py-2.5 text-text-muted">{{ description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── Example links ─────────────────────────────────────────────── -->
    <div class="grid gap-4 md:grid-cols-2">
      <NuxtLink
        to="/middleware/org-required"
        class="group rounded-xl border border-border bg-surface p-5 hover:border-accent-400 hover:shadow-sm transition-all"
      >
        <p class="font-mono text-sm font-semibold text-accent-600 group-hover:underline mb-1">requireOrganization</p>
        <p class="text-xs text-text-muted leading-relaxed">
          Redirect when the user has no active organization. Try it live with the current session.
        </p>
        <p class="mt-3 text-xs font-medium text-accent-600 group-hover:underline">View example →</p>
      </NuxtLink>

      <NuxtLink
        to="/middleware/scoped"
        class="group rounded-xl border border-border bg-surface p-5 hover:border-accent-400 hover:shadow-sm transition-all"
      >
        <p class="font-mono text-sm font-semibold text-accent-600 group-hover:underline mb-1">requireScopes</p>
        <p class="text-xs text-text-muted leading-relaxed">
          Redirect when the user is missing required OAuth scopes. Try it live with the current session.
        </p>
        <p class="mt-3 text-xs font-medium text-accent-600 group-hover:underline">View example →</p>
      </NuxtLink>
    </div>

    <!-- ── Code ──────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
