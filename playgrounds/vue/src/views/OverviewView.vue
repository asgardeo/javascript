<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  useAsgardeo,
  useUser,
  Spinner,
  SignInButton,
  SignOutButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  Loading,
} from '@asgardeo/vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import SectionCard from '@/components/layout/SectionCard.vue';
import ResultPanel from '@/components/shared/ResultPanel.vue';

const { isInitialized, isLoading, isSignedIn, baseUrl, clientId, getAccessToken, getDecodedIdToken } = useAsgardeo();
const { flattenedProfile } = useUser();

const statusCards = [
  { label: 'Initialized', getValue: () => isInitialized.value },
  { label: 'Ready', getValue: () => !isLoading.value },
  { label: 'Authenticated', getValue: () => isSignedIn.value },
];

// ── Config copy ──
const copiedKey = ref<string | null>(null);
async function copyValue(key: unknown, value: unknown) {
  const keyStr = String(key ?? '');
  const valueStr = String(value ?? '');
  await navigator.clipboard.writeText(valueStr);
  copiedKey.value = keyStr;
  setTimeout(() => { copiedKey.value = null; }, 2000);
}

// ── Profile field accessor ──
function getProfileField(field: string): unknown {
  return (flattenedProfile.value as any)?.[field] ?? '—';
}

// ── Token fetching ──
const tokenResult = ref<unknown>(undefined);
const tokenError = ref<string | undefined>(undefined);
const isTokenLoading = ref(false);

async function fetchAccessToken() {
  isTokenLoading.value = true;
  tokenError.value = undefined;
  tokenResult.value = undefined;
  try {
    tokenResult.value = await getAccessToken();
  } catch (e: any) {
    tokenError.value = e?.message ?? String(e);
  } finally {
    isTokenLoading.value = false;
  }
}

async function fetchDecodedIdToken() {
  isTokenLoading.value = true;
  tokenError.value = undefined;
  tokenResult.value = undefined;
  try {
    tokenResult.value = await getDecodedIdToken();
  } catch (e: any) {
    tokenError.value = e?.message ?? String(e);
  } finally {
    isTokenLoading.value = false;
  }
}

const quickLinks = [
  { path: '/auth-flows', title: 'Auth Flows', description: 'Try redirect-based and app-native sign-in flows.' },
  { path: '/components', title: 'Components', description: 'Explore all UI components: primitives, actions, and more.' },
  { path: '/public-apis', title: 'Public APIs', description: 'Test every composable method interactively.' },
];
</script>

<template>
  <div class="space-y-6">
    <!-- 1. Page Header -->
    <PageHeader
      title="Overview"
      description="Dashboard showing SDK state, quick actions, and navigation."
    />

    <!-- 2. Quick Actions Bar -->
    <div class="flex items-center gap-3 flex-wrap">
      <Loading>
        <Spinner />
      </Loading>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <span class="text-on-surface font-medium">
          Welcome, {{ flattenedProfile?.givenName ?? flattenedProfile?.userName ?? 'User' }}
        </span>
        <SignOutButton />
      </SignedIn>
    </div>

    <!-- 3. SDK Status Dashboard -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        v-for="card in statusCards"
        :key="card.label"
        class="bg-surface-secondary rounded-lg shadow-sm border border-border p-4"
      >
        <p class="text-sm text-on-surface-muted mb-2">{{ card.label }}</p>
        <div class="flex items-center gap-2">
          <!-- green check -->
          <svg v-if="card.getValue()" class="h-5 w-5 text-status-success-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <!-- red x (for Authenticated when false) -->
          <svg v-else-if="card.label === 'Authenticated'" class="h-5 w-5 text-status-error-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <!-- yellow clock (for Initialized/Ready when false) -->
          <svg v-else class="h-5 w-5 text-status-warning-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-mono text-sm text-on-surface">{{ card.getValue() }}</span>
        </div>
      </div>
    </div>

    <!-- 4. Configuration Panel -->
    <SectionCard title="Configuration">
      <dl class="space-y-3">
        <div v-for="[key, value] in [['baseUrl', baseUrl], ['clientId', clientId]]" :key="key" class="flex items-start gap-4">
          <dt class="w-24 shrink-0 text-sm text-on-surface-muted pt-0.5">{{ key }}</dt>
          <dd class="flex items-center gap-2 min-w-0">
            <span class="font-mono text-sm text-on-surface break-all">{{ value ?? '—' }}</span>
            <button
              v-if="value"
              type="button"
              class="shrink-0 text-xs text-accent-600 hover:text-accent-800 transition-colors"
              @click="copyValue(key, value)"
            >
              {{ copiedKey === key ? 'Copied!' : 'Copy' }}
            </button>
          </dd>
        </div>
      </dl>
      <p class="mt-4 text-xs text-on-surface-muted">Edit configuration in <code class="bg-surface-muted px-1 py-0.5 rounded">App.vue</code>'s <code class="bg-surface-muted px-1 py-0.5 rounded">&lt;AsgardeoProvider&gt;</code> props.</p>
    </SectionCard>

    <!-- 5. User Info Panel (signed in only) -->
    <SignedIn>
      <SectionCard title="Current User">
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-4">
          <div v-for="field in ['userName', 'givenName', 'familyName', 'email']" :key="field" class="flex gap-2">
            <dt class="text-sm text-on-surface-muted w-28 shrink-0">{{ field }}</dt>
            <dd class="font-mono text-sm text-on-surface break-all">{{ getProfileField(field) }}</dd>
          </div>
        </dl>
        <div class="flex gap-2 flex-wrap mb-3">
          <button
            type="button"
            class="px-3 py-1.5 text-sm bg-accent-600 text-on-surface-inverse rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
            :disabled="isTokenLoading"
            @click="fetchAccessToken"
          >
            Get Access Token
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-sm bg-surface-secondary border border-border-hover text-on-surface rounded-md hover:bg-surface-muted transition-colors disabled:opacity-50"
            :disabled="isTokenLoading"
            @click="fetchDecodedIdToken"
          >
            Get Decoded ID Token
          </button>
        </div>
        <ResultPanel :result="tokenResult" :isLoading="isTokenLoading" :error="tokenError" />
      </SectionCard>
    </SignedIn>

    <!-- 6. Quick Links -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <RouterLink
        v-for="link in quickLinks"
        :key="link.path"
        :to="link.path"
        class="bg-surface-secondary rounded-lg shadow-sm border border-border p-5 flex flex-col gap-2 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <span class="font-semibold text-on-surface">{{ link.title }}</span>
          <svg class="h-4 w-4 text-on-surface-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <p class="text-sm text-on-surface-muted">{{ link.description }}</p>
      </RouterLink>
    </div>
  </div>
</template>