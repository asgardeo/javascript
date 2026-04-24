<script setup lang="ts">
import { ref } from 'vue';
import { getUserProfile } from '~/utils/sdkRoutes';

const result  = ref<unknown>(null);
const error   = ref<string | null>(null);
const loading = ref(false);

async function fetchProfile() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    result.value = await getUserProfile();
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

fetchProfile();

const codeSnippet = `// Direct $fetch:
const profile = await $fetch('/api/auth/user/profile');

// Via sdkRoutes helper:
import { getUserProfile } from '~/utils/sdkRoutes';
const profile = await getUserProfile();

// The response is the full SCIM2 User resource including custom attributes.
// To update the profile, use PATCH /api/auth/user/profile.`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="GET /api/auth/user/profile"
      description="Returns the full SCIM2 user profile including custom attributes defined in the Asgardeo console."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          Calls the Asgardeo <code class="font-mono">/scim2/Me</code> endpoint using the stored
          access token and returns the raw SCIM2 User resource. Also fetches
          <code class="font-mono">/scim2/Schemas</code> so the client can resolve custom attribute
          names.
        </p>
        <p>
          This is a network call to Asgardeo — use
          <code class="font-mono">useUser().revalidateProfile()</code> to avoid calling it
          unnecessarily when the reactive state is already populated.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard title="Try it — GET /api/auth/user/profile">
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="fetchProfile"
      >
        {{ loading ? 'Fetching…' : 'Fetch profile' }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- Related -->
    <LayoutSectionCard title="Related composable / route">
      <div class="space-y-1 text-sm text-text-muted">
        <p>
          <code class="font-mono">useUser().revalidateProfile()</code> — hits this route and
          updates reactive state.
        </p>
        <p>
          <NuxtLink to="/server/routes/user/profile-patch" class="text-accent-600 hover:underline">
            PATCH /api/auth/user/profile
          </NuxtLink> — update the profile.
        </p>
      </div>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
