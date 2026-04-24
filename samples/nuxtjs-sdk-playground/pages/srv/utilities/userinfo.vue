<script setup lang="ts">
import { ref } from 'vue';

// ── fetch SCIM2 user profile from demo API route ───────────────────────────
const result   = ref<unknown>(null);
const error    = ref<string | null>(null);
const loading  = ref(false);

async function fetchUserInfo() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await $fetch('/api/demo/userinfo');
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

fetchUserInfo();

const codeSnippet = `// server/api/demo/userinfo.get.ts
import { AsgardeoNuxtClient } from '@asgardeo/nuxt/server';

export default defineEventHandler(async (event) => {
  // useServerSession is auto-imported
  const session = await useServerSession(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Not signed in.' });
  }

  // AsgardeoNuxtClient is a singleton — call getInstance() from any handler.
  const client = AsgardeoNuxtClient.getInstance();

  // getUserProfile fetches /scim2/Me + /scim2/Schemas, flattens the result,
  // and falls back to ID-token user claims if SCIM2 is unavailable.
  const userProfile = await client.getUserProfile(session.sessionId);

  return {
    flattenedProfile: userProfile.flattenedProfile,
    profile:          userProfile.profile,
    schemas:          userProfile.schemas,
  };
});

// ── Other AsgardeoNuxtClient methods ─────────────────────────────────────
// client.getUser(sessionId)                    — ID-token user claims
// client.getAccessToken(sessionId)             — raw access token
// client.getDecodedIdToken(sessionId)          — decoded ID token claims
// client.getMyOrganizations(sessionId)         — list of user's organizations
// client.getAllOrganizations(options, sid)      — paginated org list
// client.getCurrentOrganization(sessionId)     — active org from ID token
// client.updateUserProfile(payload, sessionId) — SCIM2 PATCH /Me
// client.getBrandingPreference(config)         — org branding (no session needed)
// client.switchOrganization(org, sessionId)    — org switch token exchange`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="AsgardeoNuxtClient"
      description="Singleton server-side SDK client for calling Asgardeo APIs from Nitro routes. Access SCIM2 profiles, organizations, tokens, and more."
    />

    <!-- ── What it does ────────────────────────────────────────────────── -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          <span class="font-mono text-text">AsgardeoNuxtClient</span> is a singleton wrapper
          around <code class="font-mono">@asgardeo/node</code> that manages OIDC state for the
          server process. Access it in any Nitro handler via:
        </p>
        <pre class="rounded-md bg-surface-muted border border-border px-4 py-3 font-mono text-xs text-text overflow-x-auto">import { AsgardeoNuxtClient } from '@asgardeo/nuxt/server';
const client = AsgardeoNuxtClient.getInstance();</pre>
        <p>
          This demo calls <code class="font-mono">getUserProfile(sessionId)</code> which hits
          <code class="font-mono">/scim2/Me</code> and <code class="font-mono">/scim2/Schemas</code>,
          flattens the attributes using the schema definitions, and falls back to ID-token
          user claims when SCIM2 is unavailable.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- ── Live demo ───────────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="Live demo — GET /api/demo/userinfo"
      description="Calls the demo route which uses AsgardeoNuxtClient.getInstance().getUserProfile(). Must be signed in."
    >
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="fetchUserInfo"
      >
        {{ loading ? 'Fetching…' : 'getUserProfile()' }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- ── Flattened profile table ────────────────────────────────────── -->
    <LayoutSectionCard
      v-if="result && (result as Record<string, unknown>).flattenedProfile"
      title="flattenedProfile"
      description="Key/value pairs from the flattened SCIM2 profile."
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-text-muted">Attribute</th>
              <th class="pb-2 font-medium text-text-muted">Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="[key, val] in Object.entries((result as Record<string, unknown>).flattenedProfile as Record<string, unknown>)"
              :key="key"
            >
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">{{ key }}</td>
              <td class="py-2 font-mono text-xs text-text break-all">{{ typeof val === 'object' ? JSON.stringify(val) : String(val ?? '') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── Available methods ──────────────────────────────────────────── -->
    <LayoutSectionCard title="Available client methods" :collapsible="true">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-text-muted">Method</th>
              <th class="pb-2 font-medium text-text-muted">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-xs">
            <tr v-for="row in [
              ['getUserProfile(sessionId)', 'SCIM2 /Me + /Schemas, flattened. Falls back to ID-token claims.'],
              ['getUser(sessionId)', 'User claims from the ID token (no network call)'],
              ['getAccessToken(sessionId)', 'Raw access token string from the in-memory store'],
              ['getDecodedIdToken(sessionId)', 'Decoded ID token claims object'],
              ['getMyOrganizations(sessionId)', 'Calls /scim2/v2/Me/Organizations'],
              ['getAllOrganizations(opts, sid)', 'Paginated list of all organizations'],
              ['getCurrentOrganization(sessionId)', 'Active org from org_id/org_name ID-token claims'],
              ['updateUserProfile(payload, sid)', 'SCIM2 PATCH /Me'],
              ['getBrandingPreference(config)', 'Org/app branding — no session required'],
              ['switchOrganization(org, sid)', 'Organization-switch token exchange'],
            ]" :key="row[0]">
              <td class="py-2 pr-6 font-mono text-text">{{ row[0] }}</td>
              <td class="py-2 text-text-muted">{{ row[1] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── Code ────────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
