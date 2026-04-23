<script setup lang="ts">
// ── Dry-run: simulate what defineAsgardeoMiddleware({ requireOrganization: true })
// would do for the current user without actually blocking the page.
// The real middleware would redirect to /api/auth/signin if the check fails.
const { isSignedIn, user } = useAsgardeo();

const patternRows: [string, string][] = [
  ['Org required, default redirect',    '{ requireOrganization: true }'],
  ['Org required, org picker redirect',  "{ requireOrganization: true, redirectTo: '/org-selection' }"],
  ['Org + scope required',               "{ requireOrganization: true, requireScopes: ['openid'] }"],
];

const organizationId = computed(() => {
  const u = user.value as Record<string, unknown> | null;
  return (u?.['organizationId'] as string | undefined) ?? null;
});

const wouldPass = computed(() => isSignedIn.value && !!organizationId.value);

const dryRunStatus = computed<'success' | 'error' | 'warning'>(() => {
  if (!isSignedIn.value) return 'error';
  if (organizationId.value) return 'success';
  return 'warning';
});

const dryRunLabel = computed(() => {
  if (!isSignedIn.value) return 'Would redirect — not signed in';
  if (organizationId.value) return 'Would pass — organizationId present';
  return 'Would redirect — no organizationId in session';
});

const codeSnippet = `// pages/org-only.vue
// defineAsgardeoMiddleware is auto-imported by @asgardeo/nuxt — no import needed.
<script setup>
definePageMeta({
  middleware: [
    defineAsgardeoMiddleware({ requireOrganization: true }),
  ],
});
<\/script>

// The middleware checks authState.user.organizationId (populated by the SDK
// when the user is acting within an Asgardeo organization).
//
// If the field is absent, the user is redirected to:
//   /api/auth/signin    (or the custom redirectTo you provide)
//
// ── Custom redirect on missing org ────────────────────────────────────────
<script setup>
definePageMeta({
  middleware: [
    defineAsgardeoMiddleware({
      requireOrganization: true,
      redirectTo: '/org-selection',   // send to org picker instead of sign-in
    }),
  ],
});
<\/script>

// ── Combining with requireScopes ───────────────────────────────────────────
<script setup>
definePageMeta({
  middleware: [
    defineAsgardeoMiddleware({
      requireOrganization: true,
      requireScopes: ['openid', 'profile'],
    }),
  ],
});
<\/script>`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="requireOrganization"
      description="Use defineAsgardeoMiddleware({ requireOrganization: true }) to restrict a page to users who are acting within an Asgardeo organization."
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
              <tr>
                <td class="py-2 pr-6 font-mono text-text">user.organizationId</td>
                <td class="py-2 pr-6 text-text-muted">any non-empty value</td>
                <td class="py-2">
                  <SharedStatusBadge
                    :status="organizationId ? 'success' : 'warning'"
                    :label="organizationId ?? 'not present'"
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
      </div>
    </LayoutSectionCard>

    <!-- ── What it does ─────────────────────────────────────────────── -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          <code class="font-mono text-text">defineAsgardeoMiddleware({ requireOrganization: true })</code>
          is an inline route middleware factory that is <strong class="text-text">auto-imported</strong>
          by <code class="font-mono text-text">@asgardeo/nuxt</code>.
        </p>
        <p>
          After confirming the user is signed in, it checks
          <code class="font-mono text-text">authState.user.organizationId</code>. The
          <code class="font-mono">organizationId</code> field is populated by the SDK when the
          user is currently acting within an Asgardeo B2B organization (i.e., the ID token
          contains a <code class="font-mono">user_org</code> claim).
        </p>
        <p>
          If the field is absent, the middleware redirects to
          <code class="font-mono text-text">/api/auth/signin</code> (or a custom
          <code class="font-mono">redirectTo</code> you supply) — useful for sending users to an
          organization-selection screen before accessing tenant-gated pages.
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
              <th class="pb-2 font-medium text-text-muted">Options</th>
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
