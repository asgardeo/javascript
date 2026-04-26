<script setup lang="ts">
// ── Dry-run: simulate what defineAsgardeoMiddleware({ requireScopes: [...] })
// would do for the current user without actually blocking the page.
const { isSignedIn, user } = useAsgardeo();

const patternRows: [string, string][] = [
  ['Basic identity pages',      "['openid', 'profile']"],
  ['Email-dependent features',  "['openid', 'email']"],
  ['Group / role-based access', "['openid', 'groups']"],
  ['Custom business scopes',    "['internal_user_mgt_view']"],
];

const REQUIRED_SCOPES = ['openid', 'profile'] as const;

const sessionScopes = computed<string[]>(() => {
  const u = user.value as Record<string, unknown> | null;
  const raw = u?.['scopes'];
  if (!raw) return [];
  return String(raw)
    .split(' ')
    .map((s) => s.trim())
    .filter(Boolean);
});

const scopeRows = computed(() =>
  REQUIRED_SCOPES.map((scope) => ({
    scope,
    present: sessionScopes.value.includes(scope),
  })),
);

const allScopesPresent = computed(() =>
  REQUIRED_SCOPES.every((s) => sessionScopes.value.includes(s)),
);

const wouldPass = computed(() => isSignedIn.value && allScopesPresent.value);

const dryRunStatus = computed<'success' | 'error' | 'warning'>(() => {
  if (!isSignedIn.value) return 'error';
  if (allScopesPresent.value) return 'success';
  return 'warning';
});

const dryRunLabel = computed(() => {
  if (!isSignedIn.value) return 'Would redirect — not signed in';
  if (allScopesPresent.value) return 'Would pass — all scopes present';
  const missing = REQUIRED_SCOPES.filter((s) => !sessionScopes.value.includes(s));
  return `Would redirect — missing: ${missing.join(', ')}`;
});

const codeSnippet = `// pages/scoped.vue
// defineAsgardeoMiddleware is auto-imported by @asgardeo/nuxt — no import needed.
<script setup>
definePageMeta({
  middleware: [
    defineAsgardeoMiddleware({
      requireScopes: ['openid', 'profile'],
    }),
  ],
});
<\/script>

// The middleware checks every required scope against the space-separated
// scopes string stored in the auth state user object.
//
// If any scope is missing, the user is redirected to /api/auth/signin
// (or a custom redirectTo).
//
// Tip: request the required scopes in nuxt.config.ts so they are included
// in the initial token:
//
// asgardeo: {
//   scopes: ['openid', 'profile', 'email', 'groups'],
// }
//
// ── Custom redirect when scopes are insufficient ──────────────────────────
<script setup>
definePageMeta({
  middleware: [
    defineAsgardeoMiddleware({
      requireScopes: ['openid', 'profile'],
      redirectTo: '/insufficient-permissions',
    }),
  ],
});
<\/script>`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="requireScopes option"
      description="Example of defineAsgardeoMiddleware({ requireScopes: [...] }) — redirects users who are missing one or more of the listed OAuth scopes."
    />

    <!-- ── Dry-run result ────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="Dry-run — would this middleware pass for you?"
      description="This page is not actually guarded so you can inspect the result regardless of your session state."
    >
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <SharedStatusBadge :status="dryRunStatus" :label="dryRunLabel" />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border text-left">
                <th class="pb-2 pr-6 font-medium text-text-muted">Check</th>
                <th class="pb-2 pr-6 font-medium text-text-muted">Required</th>
                <th class="pb-2 font-medium text-text-muted">Your session</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border text-xs">
              <tr>
                <td class="py-2 pr-6 font-mono text-text">isSignedIn</td>
                <td class="py-2 pr-6 text-text-muted">true</td>
                <td class="py-2">
                  <SharedStatusBadge
                    :status="isSignedIn ? 'success' : 'error'"
                    :label="String(isSignedIn)"
                  />
                </td>
              </tr>
              <tr v-for="row in scopeRows" :key="row.scope">
                <td class="py-2 pr-6 font-mono text-text">scope: {{ row.scope }}</td>
                <td class="py-2 pr-6 text-text-muted">present in session</td>
                <td class="py-2">
                  <SharedStatusBadge
                    :status="row.present ? 'success' : 'warning'"
                    :label="row.present ? 'present' : 'not found'"
                  />
                </td>
              </tr>
              <tr>
                <td class="py-2 pr-6 font-semibold text-text">Overall result</td>
                <td class="py-2 pr-6 text-text-muted">all checks pass</td>
                <td class="py-2">
                  <SharedStatusBadge
                    :status="wouldPass ? 'success' : 'error'"
                    :label="wouldPass ? 'Would allow' : 'Would redirect'"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Session scopes breakdown -->
        <div v-if="sessionScopes.length > 0" class="rounded-md bg-surface-code border border-border px-4 py-3">
          <p class="text-xs text-text-muted mb-2">Scopes in your current session:</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="scope in sessionScopes"
              :key="scope"
              class="inline-flex items-center rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-mono text-accent-700"
            >
              {{ scope }}
            </span>
          </div>
        </div>
        <p v-else-if="isSignedIn" class="text-xs text-text-muted">
          No <code class="font-mono">scopes</code> field found in the auth state user object.
          Ensure the scopes are included in the Asgardeo SDK configuration.
        </p>
        <p v-else class="text-xs text-text-muted">
          Sign in to see your session scopes.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- ── What it does ─────────────────────────────────────────────── -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          <code class="font-mono text-text">defineAsgardeoMiddleware({ requireScopes: [...] })</code>
          is an inline route middleware factory that is <strong class="text-text">auto-imported</strong>
          by <code class="font-mono text-text">@asgardeo/nuxt</code>.
        </p>
        <p>
          After confirming the user is signed in, it splits
          <code class="font-mono text-text">authState.user.scopes</code> on spaces and checks
          that every scope listed in <code class="font-mono">requireScopes</code> is present.
          If any scope is missing, the user is redirected to
          <code class="font-mono text-text">/api/auth/signin</code> (or a custom
          <code class="font-mono">redirectTo</code>).
        </p>
        <p>
          Scopes are determined at sign-in time. To ensure the required scopes are requested,
          add them to the <code class="font-mono text-text">asgardeo.scopes</code> array in
          <code class="font-mono text-text">nuxt.config.ts</code>.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- ── Common patterns ──────────────────────────────────────────── -->
    <LayoutSectionCard title="Common patterns" :collapsible="true">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-text-muted">Pattern</th>
              <th class="pb-2 font-medium text-text-muted">requireScopes value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-xs">
            <tr v-for="row in patternRows" :key="row[0]">
              <td class="py-2 pr-6 text-text-muted">{{ row[0] }}</td>
              <td class="py-2 font-mono text-text">{{ row[1] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── Code ─────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="vue" />
  </div>
</template>
