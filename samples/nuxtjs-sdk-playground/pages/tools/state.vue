<script setup lang="ts">
// `@asgardeo/nuxt` only re-exports its module default/options through the
// built `dist/types.d.mts` (Nuxt module-builder limitation), and `@asgardeo/node`
// is not a direct dep of this sample — so we type the one property we actually
// read (`isSignedIn`) inline and let the other state keys stay as `unknown`.
// `SharedJsonViewer.data` and `isPopulated()` both accept `unknown`.
const authState     = useState<{ isSignedIn: boolean }>('asgardeo:auth');
const userProfile   = useState('asgardeo:user-profile');
const currentOrg    = useState('asgardeo:current-org');
const myOrgs        = useState('asgardeo:my-orgs');
const brandingState = useState('asgardeo:branding');

// ── Descriptive metadata per key ──────────────────────────────────────────
const stateKeys = [
  {
    key: 'asgardeo:auth',
    label: 'Auth state',
    description: 'Core sign-in status, user object, and loading flag. Always populated — it is seeded on every SSR request.',
    value: authState,
    guard: 'always populated',
  },
  {
    key: 'asgardeo:user-profile',
    label: 'User profile (SCIM2)',
    description: 'Full SCIM2 user profile. Populated when preferences.user.fetchUserProfile = true (default) and the user is signed in.',
    value: userProfile,
    guard: 'preferences.user.fetchUserProfile',
  },
  {
    key: 'asgardeo:current-org',
    label: 'Current organization',
    description: 'The organization the user is currently acting within. Non-null only when acting inside a B2B org.',
    value: currentOrg,
    guard: 'requires org session',
  },
  {
    key: 'asgardeo:my-orgs',
    label: 'My organizations',
    description: 'All organizations the user is a member of. Populated when preferences.user.fetchOrganizations = true (default) and the user is signed in.',
    value: myOrgs,
    guard: 'preferences.user.fetchOrganizations',
  },
  {
    key: 'asgardeo:branding',
    label: 'Branding preference',
    description: 'Tenant branding from Asgardeo. Populated when preferences.theme.inheritFromBranding = true.',
    value: brandingState,
    guard: 'preferences.theme.inheritFromBranding',
  },
] as const;

function isPopulated(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v as object).length > 0;
  return true;
}

function populatedCount(): number {
  return [authState.value, userProfile.value, currentOrg.value, myOrgs.value, brandingState.value]
    .filter(isPopulated).length;
}

const codeSnippet = `// \u26a0\ufe0f  Do NOT use these keys directly in your application code.
// They are internal SDK implementation details and may change without notice.
// Use the SDK composables instead:
//
//   const { isSignedIn, user }             = useAsgardeo();
//   const { profile }                      = useUser();
//   const { currentOrganization, myOrgs }  = useOrganization();
//   const { branding }                     = useBranding();
//
// On the server (Nitro), use getAsgardeoContext():
//
//   import { getAsgardeoContext } from '@asgardeo/nuxt/server';
//   const ctx = getAsgardeoContext(event); // { session, isSignedIn, ssr }`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="State dump"
      description="Every useState('asgardeo:*') key the SDK writes to, displayed live. Values are seeded by the Nitro SSR plugin and hydrated to the client — no extra fetch on page load."
    />

    <!-- ── Internal state warning ──────────────────────────────────────── -->
    <div class="rounded-lg border border-warning/40 bg-warning/5 px-5 py-4 flex items-start gap-3">
      <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-text">Playground Internals — do not use these keys in your app</p>
        <p class="text-xs text-text-muted leading-relaxed">
          The <code class="font-mono">asgardeo:*</code> useState keys below are internal SDK implementation details.
          They are shown here for debugging purposes only. Use the SDK composables
          (<code class="font-mono">useAsgardeo()</code>, <code class="font-mono">useUser()</code>, <code class="font-mono">useOrganization()</code>, <code class="font-mono">useBranding()</code>)
          or <code class="font-mono">getAsgardeoContext(event)</code> on the server instead.
        </p>
      </div>
    </div>

    <!-- ── Summary bar ────────────────────────────────────────────────── -->
    <div class="flex flex-wrap gap-3 items-center">
      <span class="text-sm text-text-muted">
        {{ populatedCount() }} / {{ stateKeys.length }} keys populated
      </span>
      <SharedStatusBadge
        :status="authState.isSignedIn ? 'success' : 'warning'"
        :label="authState.isSignedIn ? 'Signed in' : 'Signed out'"
      />
    </div>

    <!-- ── One card per state key ─────────────────────────────────────── -->
    <LayoutSectionCard
      v-for="entry in stateKeys"
      :key="entry.key"
      :title="entry.label"
      :description="entry.description"
      :collapsible="true"
    >
      <div class="space-y-3">
        <!-- Status badge + key name -->
        <div class="flex items-center gap-3">
          <code class="text-xs font-mono bg-surface-code border border-border px-2 py-0.5 rounded text-text">
            {{ entry.key }}
          </code>
          <SharedStatusBadge
            :status="isPopulated(entry.value) ? 'success' : 'neutral'"
            :label="isPopulated(entry.value) ? 'populated' : 'null / empty'"
          />
          <span class="text-xs text-text-muted">guard: {{ entry.guard }}</span>
        </div>

        <!-- JSON tree -->
        <div class="rounded-md bg-surface-code border border-border p-4 overflow-x-auto text-sm leading-relaxed">
          <SharedJsonViewer :data="entry.value" :depth="0" />
        </div>
      </div>
    </LayoutSectionCard>

    <!-- ── How to use these keys ──────────────────────────────────────── -->
    <LayoutSectionCard title="Notes on SDK-owned state" :collapsible="true">
      <ul class="space-y-2 text-sm text-text-muted list-disc list-inside leading-relaxed">
        <li>
          All keys are written by the SDK — <strong class="text-text">never write to them</strong>
          from application code. Use SDK composables instead.
        </li>
        <li>
          <code class="font-mono text-text">asgardeo:auth</code> is always present and reactive.
          The composables <code class="font-mono">useAsgardeo()</code>,
          <code class="font-mono">useUser()</code>, and
          <code class="font-mono">useOrganization()</code> are thin wrappers that read from it.
        </li>
        <li>
          SSR-only data (<code class="font-mono">user-profile</code>,
          <code class="font-mono">my-orgs</code>, <code class="font-mono">branding</code>) is
          fetched once per page request on the server and serialised into the
          <code class="font-mono">__NUXT__</code> payload — the client never re-fetches.
        </li>
        <li>
          If a key shows <em>null / empty</em> while signed in, check the matching
          <code class="font-mono">preferences.*</code> flag in
          <code class="font-mono">nuxt.config.ts</code> — or visit
          <NuxtLink to="/tools/preferences" class="text-accent-600 hover:underline">
            /tools/preferences
          </NuxtLink>
          for a full breakdown.
        </li>
      </ul>
    </LayoutSectionCard>

    <!-- ── Code ──────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
