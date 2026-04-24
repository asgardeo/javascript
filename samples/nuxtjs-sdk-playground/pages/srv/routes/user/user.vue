<script setup lang="ts">
import { ref } from 'vue';
import { getUser } from '~/utils/sdkRoutes';

const result  = ref<unknown>(null);
const error   = ref<string | null>(null);
const loading = ref(false);

async function fetchUser() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await getUser();
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

fetchUser();

const codeSnippet = `// Direct $fetch:
const user = await $fetch('/api/auth/user');

// Via sdkRoutes helper:
import { getUser } from '~/utils/sdkRoutes';
const user = await getUser();

// Typical response:
// {
//   sub: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
//   username: "alice@example.com",
//   email: "alice@example.com",
//   givenName: "Alice",
//   familyName: "Smith",
//   organizationId: null
// }`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="GET /api/auth/user"
      description="Returns basic user information from the current session — faster than the full SCIM2 profile."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          Extracts user claims from the stored ID token and session. Does not make a network call
          to Asgardeo — always fast. Returns <code class="font-mono">null</code> when not signed in.
        </p>
        <p>
          For the full SCIM2 profile with custom attributes, use
          <NuxtLink to="/server/routes/user/profile-get" class="text-accent-600 hover:underline">
            GET /api/auth/user/profile
          </NuxtLink> instead.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard title="Try it — GET /api/auth/user">
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="fetchUser"
      >
        {{ loading ? 'Fetching…' : 'Fetch user' }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- Response shape -->
    <LayoutSectionCard title="Response shape" :collapsible="true">
      <pre class="text-xs font-mono text-text-muted leading-relaxed">interface UserResponse {
  sub:            string;
  username:       string;
  email?:         string;
  givenName?:     string;
  familyName?:    string;
  organizationId?: string | null;
} | null</pre>
    </LayoutSectionCard>

    <!-- Related -->
    <LayoutSectionCard title="Related composable">
      <p class="text-sm text-text-muted">
        <code class="font-mono">useUser().profile</code> — reactive wrapper around this route.
        See <NuxtLink to="/composables/user" class="text-accent-600 hover:underline">Composables → useUser</NuxtLink>.
      </p>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
