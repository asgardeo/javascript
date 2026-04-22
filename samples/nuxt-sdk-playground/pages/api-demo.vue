<template>
  <div>
    <section style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Server API Demo</h2>
      <p style="color: #666; margin-bottom: 1.5rem;">
        This page demonstrates using <code>useServerSession</code> and <code>requireServerSession</code>
        in custom server API routes. These utilities let your API routes access the current user's session.
      </p>

      <div v-if="!isSignedIn" style="padding: 1rem; background: #fff3e0; border-radius: 4px;">
        <p style="color: #e65100;">Sign in first to test the server API routes.</p>
      </div>
    </section>

    <!-- Session Info from Server -->
    <section v-if="isSignedIn" style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">GET /api/me</h3>
      <p style="color: #666; margin-bottom: 1rem;">
        Custom API route using <code>requireServerSession(event)</code> to get session data.
      </p>
      <button
        style="background: #ff6b00; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600; margin-bottom: 1rem;"
        @click="fetchSessionInfo"
      >
        Fetch Session Info
      </button>
      <div v-if="sessionError" style="padding: 1rem; background: #ffebee; border-radius: 4px; margin-bottom: 1rem;">
        <p style="color: #c62828;">{{ sessionError }}</p>
      </div>
      <pre v-if="sessionInfo" style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.875rem;">{{ JSON.stringify(sessionInfo, null, 2) }}</pre>
    </section>

    <!-- Access Token from Server -->
    <section v-if="isSignedIn" style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">GET /api/auth/token</h3>
      <p style="color: #666; margin-bottom: 1rem;">
        Built-in SDK route to get the current access token.
      </p>
      <button
        style="background: #ff6b00; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600; margin-bottom: 1rem;"
        @click="fetchToken"
      >
        Get Access Token
      </button>
      <pre v-if="accessToken" style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.875rem; word-break: break-all; white-space: pre-wrap;">{{ accessToken }}</pre>
    </section>

    <!-- Code Examples -->
    <section style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Code Example</h3>
      <p style="color: #666; margin-bottom: 1rem;">
        Create a custom API route with server-side session access:
      </p>
      <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.875rem;">// server/api/me.get.ts
export default defineEventHandler(async (event) =&gt; {
  // requireServerSession throws 401 if not authenticated
  const session = await requireServerSession(event);

  return {
    sub: session.sub,
    sessionId: session.sessionId,
    scopes: session.scopes,
  };
});</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
const {isSignedIn, getAccessToken} = useAsgardeo();

const sessionInfo = ref<Record<string, unknown> | null>(null);
const sessionError = ref<string | null>(null);
const accessToken = ref<string | null>(null);

async function fetchSessionInfo() {
  sessionError.value = null;
  sessionInfo.value = null;
  try {
    sessionInfo.value = await $fetch('/api/me');
  } catch (err: any) {
    sessionError.value = err?.data?.message || err?.message || 'Failed to fetch session info';
  }
}

async function fetchToken() {
  accessToken.value = await getAccessToken();
}
</script>
