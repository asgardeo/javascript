<script setup lang="ts">
import { ref } from 'vue';

const {
  isSignedIn,
  isLoading,
  isInitialized,
  clientId,
  baseUrl,
  user,
  signIn,
  signOut,
  signUp,
  signInSilently,
  getAccessToken,
  getIdToken,
  getDecodedIdToken,
  http,
} = useAsgardeo();

// ── signInSilently ─────────────────────────────────────────────────────────
const silentResult   = ref<unknown>(null);
const silentLoading  = ref(false);
const silentError    = ref<string | null>(null);

async function runSignInSilently() {
  silentLoading.value = true;
  silentError.value   = null;
  silentResult.value  = null;
  try {
    const result = await signInSilently();
    silentResult.value = result ?? 'done';
  } catch (e: unknown) {
    silentError.value = e instanceof Error ? e.message : String(e);
  } finally {
    silentLoading.value = false;
  }
}

// ── getAccessToken ─────────────────────────────────────────────────────────
const accessTokenResult  = ref<unknown>(null);
const accessTokenLoading = ref(false);
const accessTokenError   = ref<string | null>(null);

async function runGetAccessToken() {
  accessTokenLoading.value = true;
  accessTokenError.value   = null;
  accessTokenResult.value  = null;
  try {
    const token = await getAccessToken();
    accessTokenResult.value = token.length > 80 ? `${token.slice(0, 80)}…` : token;
  } catch (e: unknown) {
    accessTokenError.value = e instanceof Error ? e.message : String(e);
  } finally {
    accessTokenLoading.value = false;
  }
}

// ── getIdToken ─────────────────────────────────────────────────────────────
const idTokenResult  = ref<unknown>(null);
const idTokenLoading = ref(false);
const idTokenError   = ref<string | null>(null);

async function runGetIdToken() {
  idTokenLoading.value = true;
  idTokenError.value   = null;
  idTokenResult.value  = null;
  try {
    const token = await getIdToken();
    idTokenResult.value = token.length > 80 ? `${token.slice(0, 80)}…` : token;
  } catch (e: unknown) {
    idTokenError.value = e instanceof Error ? e.message : String(e);
  } finally {
    idTokenLoading.value = false;
  }
}

// ── getDecodedIdToken ──────────────────────────────────────────────────────
const decodedResult  = ref<unknown>(null);
const decodedLoading = ref(false);
const decodedError   = ref<string | null>(null);

async function runGetDecodedIdToken() {
  decodedLoading.value = true;
  decodedError.value   = null;
  decodedResult.value  = null;
  try {
    decodedResult.value = await getDecodedIdToken();
  } catch (e: unknown) {
    decodedError.value = e instanceof Error ? e.message : String(e);
  } finally {
    decodedLoading.value = false;
  }
}

// ── http.request ───────────────────────────────────────────────────────────
const httpEndpoint = ref('/scim2/Me');
const httpMethod   = ref('GET');
const httpBody     = ref('');
const httpResult   = ref<unknown>(null);
const httpLoading  = ref(false);
const httpError    = ref<string | null>(null);

async function runHttpRequest() {
  httpLoading.value = true;
  httpError.value   = null;
  httpResult.value  = null;
  try {
    const cfg: Record<string, unknown> = { url: httpEndpoint.value, method: httpMethod.value };
    if (['POST','PUT','PATCH'].includes(httpMethod.value) && httpBody.value.trim()) {
      cfg.data = JSON.parse(httpBody.value);
    }
    const res = await http.request(cfg as Parameters<typeof http.request>[0]);
    httpResult.value = (res as Record<string, unknown>)?.data ?? res;
  } catch (e: unknown) {
    httpError.value = e instanceof Error ? e.message : String(e);
  } finally {
    httpLoading.value = false;
  }
}

// ── Code snippet ───────────────────────────────────────────────────────────
const codeSnippet = `const {
  isSignedIn, isLoading, isInitialized,
  clientId, baseUrl, user,
  signIn, signOut, signUp,
  signInSilently,
  getAccessToken, getIdToken, getDecodedIdToken,
  http,
} = useAsgardeo();

// Trigger redirect flows
await signIn();
await signOut();
await signUp();

// Silent re-authentication (no redirect)
await signInSilently();

// Token accessors
const accessToken  = await getAccessToken();
const idToken      = await getIdToken();
const decodedToken = await getDecodedIdToken();

// Authenticated HTTP request (base URL = Asgardeo tenant)
const res = await http.request({ url: '/scim2/Me', method: 'GET' });`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="useAsgardeo"
      description="Core composable — reactive auth state, redirect actions, token getters, and authenticated HTTP client."
    />

    <!-- ── Reactive State ───────────────────────────────────────────────── -->
    <LayoutSectionCard title="Reactive State">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-text-muted">Property</th>
              <th class="pb-2 font-medium text-text-muted">Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">isSignedIn</td>
              <td class="py-2">
                <SharedStatusBadge
                  :status="isSignedIn ? 'success' : 'neutral'"
                  :label="String(isSignedIn)"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">isLoading</td>
              <td class="py-2">
                <SharedStatusBadge
                  :status="isLoading ? 'warning' : 'neutral'"
                  :label="String(isLoading)"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">isInitialized</td>
              <td class="py-2">
                <SharedStatusBadge
                  :status="isInitialized ? 'info' : 'neutral'"
                  :label="String(isInitialized)"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">clientId</td>
              <td class="py-2 font-mono text-xs text-text">{{ clientId ?? '—' }}</td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">baseUrl</td>
              <td class="py-2 font-mono text-xs text-text break-all">{{ baseUrl ?? '—' }}</td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">user</td>
              <td class="py-2 font-mono text-xs text-text">
                {{ user ? (user as Record<string, unknown>)?.['username'] ?? 'signed in' : 'null' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── Auth Actions ─────────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="Auth Actions (Redirect)"
      description="These trigger a full-page redirect — the browser navigates away."
    >
      <div class="flex flex-wrap gap-3">
        <button
          class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
          @click="signIn()"
        >
          signIn()
        </button>
        <button
          class="px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors"
          @click="signOut()"
        >
          signOut()
        </button>
        <button
          class="px-4 py-2 text-sm font-medium bg-success/10 text-success border border-success/30 rounded-md hover:bg-success/20 transition-colors"
          @click="signUp()"
        >
          signUp()
        </button>
      </div>
    </LayoutSectionCard>

    <!-- ── signInSilently ───────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="signInSilently()"
      description="Attempts a silent re-authentication using the existing session. No redirect."
    >
      <button
        class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        :disabled="silentLoading"
        @click="runSignInSilently"
      >
        {{ silentLoading ? 'Running…' : 'signInSilently()' }}
      </button>
      <SharedResultPanel class="mt-3" :result="silentResult" :error="silentError" :is-loading="silentLoading" />
    </LayoutSectionCard>

    <!-- ── Token getters ────────────────────────────────────────────────── -->
    <LayoutSectionCard title="Token Getters" description="Read the current tokens. Requires an active session.">
      <div class="space-y-4">
        <!-- getAccessToken -->
        <div>
          <button
            class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
            :disabled="accessTokenLoading"
            @click="runGetAccessToken"
          >
            {{ accessTokenLoading ? 'Fetching…' : 'getAccessToken()' }}
          </button>
          <SharedResultPanel class="mt-2" :result="accessTokenResult" :error="accessTokenError" :is-loading="accessTokenLoading" />
        </div>

        <!-- getIdToken -->
        <div>
          <button
            class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
            :disabled="idTokenLoading"
            @click="runGetIdToken"
          >
            {{ idTokenLoading ? 'Fetching…' : 'getIdToken()' }}
          </button>
          <SharedResultPanel class="mt-2" :result="idTokenResult" :error="idTokenError" :is-loading="idTokenLoading" />
        </div>

        <!-- getDecodedIdToken -->
        <div>
          <button
            class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
            :disabled="decodedLoading"
            @click="runGetDecodedIdToken"
          >
            {{ decodedLoading ? 'Fetching…' : 'getDecodedIdToken()' }}
          </button>
          <SharedResultPanel class="mt-2" :result="decodedResult" :error="decodedError" :is-loading="decodedLoading" />
        </div>
      </div>
    </LayoutSectionCard>

    <!-- ── HTTP Client ──────────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="http.request()"
      description="Authenticated HTTP request using the Asgardeo tenant as base URL. Injects the current access token."
    >
      <div class="grid md:grid-cols-3 gap-3 mb-3">
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-text-muted mb-1">Path (relative to baseUrl)</label>
          <input
            v-model="httpEndpoint"
            type="text"
            class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-mono text-text focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1">Method</label>
          <select
            v-model="httpMethod"
            class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500"
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
          </select>
        </div>
      </div>
      <div v-if="['POST','PUT','PATCH'].includes(httpMethod)" class="mb-3">
        <label class="block text-xs font-medium text-text-muted mb-1">Request body (JSON)</label>
        <textarea
          v-model="httpBody"
          rows="4"
          class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-mono text-text focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>
      <button
        class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        :disabled="httpLoading"
        @click="runHttpRequest"
      >
        {{ httpLoading ? 'Sending…' : 'http.request()' }}
      </button>
      <SharedResultPanel class="mt-3" :result="httpResult" :error="httpError" :is-loading="httpLoading" />
    </LayoutSectionCard>

    <!-- ── Code ────────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
