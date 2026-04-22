<template>
  <div>
    <section style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Welcome to the Asgardeo Nuxt SDK Playground</h2>
      <p style="color: #666; margin-bottom: 1.5rem;">
        This playground demonstrates the <code>@asgardeo/nuxt</code> module with OAuth2/OIDC authentication.
      </p>

      <div v-if="isLoading" style="padding: 1rem; background: #f0f0f0; border-radius: 4px;">
        Loading authentication state...
      </div>

      <div v-else-if="isSignedIn" style="padding: 1rem; background: #e8f5e9; border-radius: 4px;">
        <h3 style="font-weight: 600; color: #2e7d32; margin-bottom: 0.5rem;">✅ Authenticated</h3>
        <p>You are signed in. Check the sections below for details.</p>
      </div>

      <div v-else style="padding: 1rem; background: #fff3e0; border-radius: 4px;">
        <h3 style="font-weight: 600; color: #e65100; margin-bottom: 0.5rem;">🔒 Not Authenticated</h3>
        <p>Click "Sign In" in the header to authenticate with Asgardeo.</p>
      </div>
    </section>

    <!-- User Info Section -->
    <section v-if="isSignedIn" style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">User Information</h3>
      <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.875rem;">{{ JSON.stringify(user, null, 2) }}</pre>
    </section>

    <!-- Access Token Section -->
    <section v-if="isSignedIn" style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Access Token</h3>
      <button
        style="background: #ff6b00; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600; margin-bottom: 1rem;"
        @click="fetchAccessToken"
      >
        Get Access Token
      </button>
      <pre v-if="accessToken" style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.875rem; word-break: break-all; white-space: pre-wrap;">{{ accessToken }}</pre>
    </section>

    <!-- API Routes Info -->
    <section style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Available API Routes</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
          <code>GET /api/auth/signin</code> — Initiates sign-in flow (redirect to Asgardeo)
        </li>
        <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
          <code>GET /api/auth/callback</code> — OAuth callback handler
        </li>
        <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
          <code>GET /api/auth/signout</code> — Signs out and clears session
        </li>
        <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
          <code>GET /api/auth/session</code> — Returns current auth state
        </li>
        <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
          <code>GET /api/auth/token</code> — Returns access token
        </li>
        <li style="padding: 0.5rem 0;">
          <code>GET /api/auth/user</code> — Returns user info
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
const {isSignedIn, isLoading, user, getAccessToken} = useAsgardeo();

const accessToken = ref<string | null>(null);

async function fetchAccessToken() {
  accessToken.value = await getAccessToken();
}
</script>
