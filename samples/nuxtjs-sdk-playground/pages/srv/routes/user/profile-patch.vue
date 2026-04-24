<script setup lang="ts">
import { ref } from 'vue';
import { patchUserProfile } from '~/utils/sdkRoutes';

const defaultPayload = JSON.stringify(
  {
    Operations: [{ op: 'replace', value: { name: { givenName: 'Test' } } }],
    schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
  },
  null,
  2,
);

const payload = ref(defaultPayload);
const result  = ref<unknown>(null);
const error   = ref<string | null>(null);
const loading = ref(false);

async function runPatch() {
  result.value  = null;
  error.value   = null;
  loading.value = true;
  try {
    const parsed = JSON.parse(payload.value) as unknown;
    result.value = await patchUserProfile(parsed);
  } catch (err: unknown) {
    error.value = err instanceof Error
      ? err.message
      : (err as { statusMessage?: string })?.statusMessage ?? String(err);
  } finally {
    loading.value = false;
  }
}

const codeSnippet = `// Direct $fetch (PATCH):
const updated = await $fetch('/api/auth/user/profile', {
  method: 'PATCH',
  body: {
    Operations: [{ op: 'replace', value: { name: { givenName: 'Alice' } } }],
    schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
  },
});

// Via sdkRoutes helper:
import { patchUserProfile } from '~/utils/sdkRoutes';
const updated = await patchUserProfile({
  Operations: [{ op: 'replace', value: { name: { givenName: 'Alice' } } }],
  schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
});

// Via composable (recommended — updates reactive state automatically):
const { updateProfile } = useUser();
await updateProfile({
  payload: {
    Operations: [{ op: 'replace', value: { name: { givenName: 'Alice' } } }],
    schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
  },
});`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="PATCH /api/auth/user/profile"
      description="Updates the user profile via a SCIM2 PatchOp request. Calls the Asgardeo /scim2/Me endpoint."
    />

    <!-- What it does -->
    <LayoutSectionCard title="What it does">
      <div class="space-y-2 text-sm text-text-muted leading-relaxed">
        <p>
          Accepts a <code class="font-mono">SCIM2 PatchOp</code> body and forwards it to the
          Asgardeo <code class="font-mono">PATCH /scim2/Me</code> endpoint using the stored
          access token.
        </p>
        <p>
          The transport is <strong class="text-text">PATCH</strong> (changed from
          <code class="font-mono">POST /api/auth/profile</code> in the previous SDK version)
          to correctly model a partial update.
        </p>
      </div>
    </LayoutSectionCard>

    <!-- Request inputs -->
    <LayoutSectionCard title="Request body — SCIM2 PatchOp (JSON)">
      <label class="block text-xs font-medium text-text-muted mb-1">Edit the PatchOp payload:</label>
      <textarea
        v-model="payload"
        rows="8"
        class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-mono text-text focus:outline-none focus:ring-1 focus:ring-accent-500"
      />
    </LayoutSectionCard>

    <!-- Try it -->
    <LayoutSectionCard title="Try it — PATCH /api/auth/user/profile">
      <button
        :disabled="loading"
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        @click="runPatch"
      >
        {{ loading ? 'Updating…' : 'Send PATCH' }}
      </button>
      <SharedResultPanel :result="result" :error="error" :is-loading="loading" />
    </LayoutSectionCard>

    <!-- Related -->
    <LayoutSectionCard title="Related composable / route">
      <div class="space-y-1 text-sm text-text-muted">
        <p>
          <code class="font-mono">useUser().updateProfile({ payload })</code> — calls this route
          and refreshes reactive state.
          See <NuxtLink to="/composables/user" class="text-accent-600 hover:underline">Composables → useUser</NuxtLink>.
        </p>
        <p>
          <NuxtLink to="/server/routes/user/profile-get" class="text-accent-600 hover:underline">
            GET /api/auth/user/profile
          </NuxtLink> — read the current profile.
        </p>
      </div>
    </LayoutSectionCard>

    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
