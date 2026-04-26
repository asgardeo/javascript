<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { formatUnixTimestamp, humanizeOffset } from '~/utils/timeFormat';
import type { DecodedJwt } from '~/utils/decodeJwt';

type TokenTab = 'raw' | 'decoded' | 'claims';

const props = defineProps<{
  title: string;
  description?: string;
  raw: string | null;
  decoded: DecodedJwt | null;
  forceOpaque?: boolean;
  expiresAt?: number | null;
  issuedAt?: number | null;
  emptyMessage?: string;
  error?: string | null;
}>();

const TIME_CLAIMS = new Set(['exp', 'iat', 'nbf', 'auth_time', 'updated_at']);

const claimHints: Record<string, string> = {
  sub: 'Subject — unique user identifier.',
  aud: 'Audience — intended recipients of this token.',
  iss: 'Issuer — the IdP that issued this token.',
  exp: 'Expiry — Unix timestamp when the token expires.',
  iat: 'Issued At — Unix timestamp when the token was issued.',
  nbf: 'Not Before — earliest validity time.',
  auth_time: 'Auth Time — when the user last authenticated.',
  updated_at: 'User Updated At — latest profile update time.',
  azp: 'Authorised Party — the OAuth client.',
  nonce: 'Replay-protection nonce.',
  scope: 'Granted scopes.',
  scp: 'Granted scopes.',
  at_hash: 'Hash binding the ID token to the access token.',
  c_hash: 'Hash binding the ID token to the authorization code.',
  user_org: 'User Org — the organization the user belongs to.',
  email: 'User email address.',
  given_name: 'Given (first) name.',
  family_name: 'Family (last) name.',
};

const activeTab = ref<TokenTab>('decoded');
const tick = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

const isOpaque = computed(() => props.forceOpaque || !props.decoded);
const showTimer = computed(() => !isOpaque.value && props.expiresAt !== null && props.expiresAt !== undefined);
const hasTabs = computed(() => !isOpaque.value && !props.error && !!props.decoded);
const claimEntries = computed(() => Object.entries(props.decoded?.payload ?? {}));

function startTimer() {
  timer = setInterval(() => {
    tick.value += 1;
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function formatClaimValue(claim: string, value: unknown): { primary: string; secondary?: string } {
  void tick.value;

  if (TIME_CLAIMS.has(claim) && typeof value === 'number') {
    const offsetSeconds = value - Math.floor(Date.now() / 1000);
    const direction = offsetSeconds === 0
      ? 'now'
      : offsetSeconds > 0
        ? `in ${humanizeOffset(offsetSeconds)}`
        : `${humanizeOffset(offsetSeconds)} ago`;

    return {
      primary: String(value),
      secondary: `${formatUnixTimestamp(value)} · ${direction}`,
    };
  }

  if (typeof value === 'object' && value !== null) {
    return { primary: JSON.stringify(value, null, 2) };
  }

  return { primary: String(value) };
}

onMounted(startTimer);
onUnmounted(stopTimer);
</script>

<template>
  <div class="rounded-lg border border-border bg-surface p-6 shadow-sm">
    <div class="border-b border-border pb-4">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <p class="text-base font-semibold text-text">{{ title }}</p>
            <span class="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              {{ isOpaque ? 'Opaque' : 'JWT' }}
            </span>
          </div>
          <p v-if="description" class="text-xs text-text-muted">{{ description }}</p>
        </div>

        <ToolsTokenTimer
          v-if="showTimer && expiresAt"
          :expires-at="expiresAt"
          :issued-at="issuedAt ?? undefined"
        />
      </div>
    </div>

    <div class="pt-4">
      <p v-if="raw === null" class="text-sm text-text-muted">{{ emptyMessage }}</p>

      <template v-else>
        <p v-if="error" class="text-sm text-danger">{{ error }}</p>

        <div v-if="hasTabs" class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
            :class="activeTab === 'raw' ? 'bg-accent-600 text-white' : 'bg-surface-muted text-text-muted hover:bg-surface-muted/80'"
            :aria-selected="activeTab === 'raw'"
            @click="activeTab = 'raw'"
          >
            Raw
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
            :class="activeTab === 'decoded' ? 'bg-accent-600 text-white' : 'bg-surface-muted text-text-muted hover:bg-surface-muted/80'"
            :aria-selected="activeTab === 'decoded'"
            @click="activeTab = 'decoded'"
          >
            Decoded
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
            :class="activeTab === 'claims' ? 'bg-accent-600 text-white' : 'bg-surface-muted text-text-muted hover:bg-surface-muted/80'"
            :aria-selected="activeTab === 'claims'"
            @click="activeTab = 'claims'"
          >
            Claims
          </button>
        </div>

        <div
          v-if="!hasTabs || activeTab === 'raw'"
          class="relative overflow-hidden rounded-md border border-border bg-code-bg"
        >
          <div class="absolute right-3 top-3">
            <SharedCopyButton :text="raw" />
          </div>
          <code class="block max-h-80 overflow-y-auto whitespace-pre-wrap break-all px-3 py-3 pr-16 font-mono text-xs leading-6 text-code-text">
            {{ raw }}
          </code>
        </div>

        <template v-if="hasTabs && decoded && activeTab === 'decoded'">
          <div class="space-y-3">
            <div class="space-y-2">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Header</p>
              <div class="overflow-x-auto rounded-md border border-border bg-code-bg px-4 py-3">
                <SharedJsonViewer :data="decoded.header" />
              </div>
            </div>
            <div class="space-y-2">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Payload</p>
              <div class="overflow-x-auto rounded-md border border-border bg-code-bg px-4 py-3">
                <SharedJsonViewer :data="decoded.payload" />
              </div>
            </div>
          </div>
        </template>

        <div v-if="hasTabs && decoded && activeTab === 'claims'" class="overflow-hidden rounded-md border border-border">
          <table class="w-full table-fixed text-xs">
            <thead class="border-b border-border bg-surface-muted">
              <tr>
                <th class="w-1/4 px-3 py-2 text-left font-semibold uppercase tracking-wide text-text-muted">Claim</th>
                <th class="w-1/2 px-3 py-2 text-left font-semibold uppercase tracking-wide text-text-muted">Value</th>
                <th class="px-3 py-2 text-left font-semibold uppercase tracking-wide text-text-muted">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="[claim, value] in claimEntries"
                :key="claim"
                class="border-b border-border align-top last:border-0 hover:bg-surface-muted/40"
              >
                <td class="px-3 py-2 font-mono text-accent-600">{{ claim }}</td>
                <td class="px-3 py-2 font-mono text-text">
                  <p class="whitespace-pre-wrap break-all">{{ formatClaimValue(claim, value).primary }}</p>
                  <p v-if="formatClaimValue(claim, value).secondary" class="mt-1 text-xs text-text-muted">
                    {{ formatClaimValue(claim, value).secondary }}
                  </p>
                </td>
                <td class="px-3 py-2 text-text-muted">{{ claimHints[claim] ?? '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>