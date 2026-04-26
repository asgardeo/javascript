<script setup lang="ts">
import { computed, ref } from 'vue';
import { decodeJwt, type DecodedJwt } from '~/utils/decodeJwt';
import type { TokensResponse } from '~/server/api/_playground/tokens.get';

const data = ref<TokensResponse | null>(null);
const loading = ref(false);
const fetchError = ref<string | null>(null);

async function loadTokens() {
  loading.value = true;
  fetchError.value = null;

  try {
    data.value = await $fetch<TokensResponse>('/api/_playground/tokens');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error.';

    if (typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: number }).statusCode === 403) {
      fetchError.value = 'Token debugger is disabled in production mode.';
    } else {
      fetchError.value = msg;
    }

    data.value = null;
  } finally {
    loading.value = false;
  }
}

function getNumericClaim(payload: Record<string, unknown> | undefined, claim: string): number | null {
  return typeof payload?.[claim] === 'number' ? payload[claim] as number : null;
}

function decodeRequiredJwt(token: string | null, errorMessage: string): { decoded: DecodedJwt | null; error: string | null } {
  if (!token) {
    return { decoded: null, error: null };
  }

  const decoded = decodeJwt(token);

  return decoded
    ? { decoded, error: null }
    : { decoded: null, error: errorMessage };
}

function decodeOptionalJwt(token: string | null): { decoded: DecodedJwt | null; error: string | null; opaque: boolean } {
  if (!token) {
    return { decoded: null, error: null, opaque: false };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { decoded: null, error: null, opaque: true };
  }

  const decoded = decodeJwt(token);
  if (decoded) {
    return { decoded, error: null, opaque: false };
  }

  return {
    decoded: null,
    error: 'Access token looks like a JWT but could not be decoded.',
    opaque: false,
  };
}

const sessionJwt = computed(() => decodeRequiredJwt(
  data.value?.session.raw ?? null,
  'Session JWT could not be decoded.',
));

const tempSessionJwt = computed(() => decodeRequiredJwt(
  data.value?.tempSession.raw ?? null,
  'Temp session JWT could not be decoded.',
));

const accessJwt = computed(() => decodeOptionalJwt(data.value?.accessToken.value ?? null));

const idJwt = computed(() => decodeRequiredJwt(
  data.value?.idToken.value ?? null,
  'ID token could not be decoded.',
));

const sessionExpiresAt = computed(() => getNumericClaim(sessionJwt.value.decoded?.payload, 'exp'));
const sessionIssuedAt = computed(() => getNumericClaim(sessionJwt.value.decoded?.payload, 'iat'));

const tempSessionExpiresAt = computed(() => getNumericClaim(tempSessionJwt.value.decoded?.payload, 'exp'));
const tempSessionIssuedAt = computed(() => getNumericClaim(tempSessionJwt.value.decoded?.payload, 'iat'));

const accessExpiresAt = computed(() => getNumericClaim(accessJwt.value.decoded?.payload, 'exp'));
const accessIssuedAt = computed(() => getNumericClaim(accessJwt.value.decoded?.payload, 'iat'));

const idExpiresAt = computed(() => getNumericClaim(idJwt.value.decoded?.payload, 'exp'));
const idIssuedAt = computed(() => getNumericClaim(idJwt.value.decoded?.payload, 'iat'));
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Token debugger"
      description="Inspect and decode every token in the current auth flow. Tokens are only fetched when you click Load — nothing is auto-sent."
    />

    <div class="flex items-center gap-4">
      <button
        type="button"
        class="px-4 py-2 rounded-md bg-accent-600 text-white text-sm font-medium hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="loading"
        @click="loadTokens"
      >
        {{ loading ? 'Loading…' : data ? 'Refresh tokens' : 'Load tokens' }}
      </button>
      <p v-if="fetchError" class="text-sm text-danger">{{ fetchError }}</p>
      <p v-if="!data && !loading && !fetchError" class="text-sm text-text-muted">Click to read tokens from the current session cookie.</p>
    </div>

    <template v-if="data">
      <ToolsTokenCard
        title="Session JWT"
        :description="`Cookie: ${data.session.cookieName}`"
        :raw="data.session.raw"
        :decoded="sessionJwt.decoded"
        :expires-at="sessionExpiresAt"
        :issued-at="sessionIssuedAt"
        empty-message="No session cookie present. Sign in first."
        :error="data.session.error ?? sessionJwt.error"
      />

      <ToolsTokenCard
        title="Temp Session JWT"
        :description="`Cookie: ${data.tempSession.cookieName} — present only mid-OAuth`"
        :raw="data.tempSession.raw"
        :decoded="tempSessionJwt.decoded"
        :expires-at="tempSessionExpiresAt"
        :issued-at="tempSessionIssuedAt"
        empty-message="Not present — this cookie only exists during an active OAuth redirect."
        :error="data.tempSession.error ?? tempSessionJwt.error"
      />

      <ToolsTokenCard
        title="Access Token"
        description="Extracted from the session payload. Asgardeo issues JWT access tokens when available — decoded client-side when valid."
        :raw="data.accessToken.value"
        :decoded="accessJwt.decoded"
        :force-opaque="accessJwt.opaque"
        :expires-at="accessExpiresAt"
        :issued-at="accessIssuedAt"
        empty-message="No access token in session. Sign in first."
        :error="accessJwt.error"
      />

      <ToolsTokenCard
        title="ID Token"
        description="OpenID Connect identity token. Contains user claims — decoded client-side."
        :raw="data.idToken.value"
        :decoded="idJwt.decoded"
        :expires-at="idExpiresAt"
        :issued-at="idIssuedAt"
        empty-message="No ID token in session. Sign in first."
        :error="idJwt.error"
      />

      <ToolsTokenCard
        title="Refresh Token"
        description="Always opaque — no decode. Used for silent token renewal."
        :raw="data.refreshToken.value"
        :decoded="null"
        force-opaque
        empty-message="No refresh token in session. The server may not have returned one for this grant."
      />

    </template>
  </div>
</template>
