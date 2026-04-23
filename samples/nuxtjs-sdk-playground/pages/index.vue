<script setup lang="ts">
import { ref } from 'vue';

// useAsgardeo and useUser are auto-imported by @asgardeo/nuxt
const {
  isInitialized,
  isLoading,
  isSignedIn,
  baseUrl,
  clientId,
  getAccessToken,
  getDecodedIdToken,
} = useAsgardeo();

const { flattenedProfile } = useUser();

const runtimeConfig = useRuntimeConfig();

// ── Status cards ──
const statusCards = [
  { label: 'Initialized',    getValue: () => isInitialized.value },
  { label: 'Ready',          getValue: () => !isLoading.value },
  { label: 'Authenticated',  getValue: () => isSignedIn.value },
];

// ── Config copy ──
const copiedKey = ref<string | null>(null);
async function copyConfig(key: string, value: unknown) {
  await navigator.clipboard.writeText(String(value ?? ''));
  copiedKey.value = key;
  setTimeout(() => { copiedKey.value = null; }, 2000);
}

// ── Profile field accessor (avoids template `as` casts) ──
function getProfileField(field: string): unknown {
  const profile = flattenedProfile.value as Record<string, unknown> | null;
  return profile?.[field] ?? '—';
}

// ── Token fetching ──
const tokenResult  = ref<unknown>(undefined);
const tokenError   = ref<string | undefined>(undefined);
const tokenLoading = ref(false);

async function fetchToken(type: 'access' | 'id-decoded') {
  tokenLoading.value = true;
  tokenError.value   = undefined;
  tokenResult.value  = undefined;
  try {
    tokenResult.value = type === 'access'
      ? await getAccessToken()
      : await getDecodedIdToken();
  } catch (e: unknown) {
    tokenError.value = e instanceof Error ? e.message : String(e);
  } finally {
    tokenLoading.value = false;
  }
}

// ── Quick links ──
const quickLinks = [
  {
    path: '/auth-flows',
    title: 'Auth Flows',
    description: 'Try redirect-based and embedded sign-in / sign-up flows.',
    icon: 'key',
  },
  {
    path: '/components',
    title: 'Components',
    description: 'Every UI component — control, actions, user, organization.',
    icon: 'box',
  },
  {
    path: '/apis/asgardeo',
    title: 'Public APIs',
    description: 'Test every composable method interactively.',
    icon: 'code',
  },
  {
    path: '/server/session',
    title: 'Server Utils',
    description: 'useServerSession, getValidAccessToken, AsgardeoNuxtClient.',
    icon: 'server',
  },
  {
    path: '/middleware/protected',
    title: 'Middleware',
    description: 'Named auth middleware + defineAsgardeoMiddleware patterns.',
    icon: 'shield',
  },
  {
    path: '/debug',
    title: 'Debug',
    description: 'Raw useState dump and preferences inspector.',
    icon: 'bug',
  },
];

const codeSnippet = `<script setup lang="ts">
const { isSignedIn, user, signIn, signOut } = useAsgardeo();
<\/script>

<template>
  <AsgardeoSignedOut>
    <AsgardeoSignInButton />
  </AsgardeoSignedOut>
  <AsgardeoSignedIn>
    <p>Welcome, {{ user?.username }}</p>
    <AsgardeoSignOutButton />
  </AsgardeoSignedIn>
</template>`;
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <LayoutPageHeader
      title="Overview"
      description="SDK status dashboard — quick actions, configuration, and navigation."
    />

    <!-- Quick actions bar -->
    <div class="flex flex-wrap items-center gap-3">
      <AsgardeoLoading>
        <div class="flex items-center gap-2 text-text-muted text-sm">
          <svg class="animate-spin h-4 w-4 text-accent-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Initializing…
        </div>
      </AsgardeoLoading>

      <AsgardeoSignedOut>
        <AsgardeoSignInButton
          class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
        />
        <AsgardeoSignUpButton
          class="px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors"
        />
      </AsgardeoSignedOut>

      <AsgardeoSignedIn>
        <span class="text-text font-medium text-sm">
          Welcome, {{ getProfileField('givenName') ?? getProfileField('userName') ?? 'User' }}
        </span>
        <AsgardeoSignOutButton
          class="px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors"
        />
      </AsgardeoSignedIn>
    </div>

    <!-- SDK status cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        v-for="card in statusCards"
        :key="card.label"
        class="bg-surface rounded-lg border border-border p-4 shadow-sm"
      >
        <p class="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">{{ card.label }}</p>
        <div class="flex items-center gap-2">
          <!-- True: green check -->
          <svg
            v-if="card.getValue()"
            class="h-5 w-5 text-success shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <!-- False for Authenticated: red x -->
          <svg
            v-else-if="card.label === 'Authenticated'"
            class="h-5 w-5 text-danger shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <!-- False for others: yellow clock -->
          <svg
            v-else
            class="h-5 w-5 text-warning shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-mono text-sm text-text">{{ card.getValue() }}</span>
        </div>
      </div>
    </div>

    <!-- Configuration panel -->
    <LayoutSectionCard title="Configuration">
      <dl class="divide-y divide-border">
        <SharedConfigRow label="baseUrl"  :value="baseUrl ?? runtimeConfig.public['asgardeo']?.['baseUrl']" mono />
        <SharedConfigRow label="clientId" :value="clientId ?? runtimeConfig.public['asgardeo']?.['clientId']" mono />
        <SharedConfigRow
          label="scopes"
          :value="(runtimeConfig.public['asgardeo']?.['scopes'] as string[] | undefined)?.join(', ')"
        />
      </dl>
      <p class="mt-3 text-xs text-text-muted">
        Edit in <code class="bg-surface-muted px-1 py-0.5 rounded font-mono">nuxt.config.ts</code>
        under the <code class="bg-surface-muted px-1 py-0.5 rounded font-mono">asgardeo</code> key.
      </p>
    </LayoutSectionCard>

    <!-- Current user panel (signed in only) -->
    <AsgardeoSignedIn>
      <LayoutSectionCard title="Current User">
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SharedConfigRow
            v-for="field in ['userName', 'givenName', 'familyName', 'email']"
            :key="field"
            :label="field"
            :value="getProfileField(field)"
            mono
          />
        </dl>

        <div class="flex flex-wrap gap-2 mt-4 mb-3">
          <button
            type="button"
            class="px-3 py-1.5 text-sm bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
            :disabled="tokenLoading"
            @click="fetchToken('access')"
          >
            Get Access Token
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-sm bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors disabled:opacity-50"
            :disabled="tokenLoading"
            @click="fetchToken('id-decoded')"
          >
            Get Decoded ID Token
          </button>
        </div>

        <SharedResultPanel
          :result="tokenResult"
          :is-loading="tokenLoading"
          :error="tokenError"
        />
      </LayoutSectionCard>
    </AsgardeoSignedIn>

    <!-- Quick links grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="link in quickLinks"
        :key="link.path"
        :to="link.path"
        class="bg-surface rounded-lg border border-border p-5 flex flex-col gap-2 hover:shadow-md hover:border-accent-500 transition-all group"
      >
        <div class="flex items-center justify-between">
          <span class="font-semibold text-text group-hover:text-accent-600 transition-colors">{{ link.title }}</span>
          <svg class="h-4 w-4 text-text-muted group-hover:text-accent-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <p class="text-sm text-text-muted">{{ link.description }}</p>
      </NuxtLink>
    </div>

    <!-- Code snippet -->
    <LayoutSectionCard title="Quick start snippet">
      <LayoutCodeBlock :code="codeSnippet" language="vue" />
    </LayoutSectionCard>
  </div>
</template>
