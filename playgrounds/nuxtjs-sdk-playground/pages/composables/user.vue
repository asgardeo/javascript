<script setup lang="ts">
import { ref } from 'vue';

const { profile, flattenedProfile, schemas, updateProfile, revalidateProfile } = useUser();

// ── Show profile ───────────────────────────────────────────────────────────
const profileResult = ref<unknown>(null);
const profileError  = ref<string | null>(null);

function showProfile() {
  profileError.value  = null;
  profileResult.value = profile.value;
}

// ── Show schemas ───────────────────────────────────────────────────────────
const schemasResult = ref<unknown>(null);

function showSchemas() {
  schemasResult.value = schemas.value;
}

// ── revalidateProfile ──────────────────────────────────────────────────────
const revalidateResult  = ref<unknown>(null);
const revalidateLoading = ref(false);
const revalidateError   = ref<string | null>(null);

async function runRevalidate() {
  revalidateLoading.value = true;
  revalidateError.value   = null;
  revalidateResult.value  = null;
  try {
    await revalidateProfile();
    revalidateResult.value = 'Profile revalidated successfully.';
  } catch (e: unknown) {
    revalidateError.value = e instanceof Error ? e.message : String(e);
  } finally {
    revalidateLoading.value = false;
  }
}

// ── updateProfile ──────────────────────────────────────────────────────────
const updatePayload = ref(
  JSON.stringify(
    {
      Operations: [{ op: 'replace', value: { name: { givenName: 'Test' } } }],
      schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
    },
    null,
    2,
  ),
);
const updateResult  = ref<unknown>(null);
const updateLoading = ref(false);
const updateError   = ref<string | null>(null);

async function runUpdateProfile() {
  updateLoading.value = true;
  updateError.value   = null;
  updateResult.value  = null;
  try {
    const parsed = JSON.parse(updatePayload.value) as unknown;
    const res = await updateProfile({ payload: parsed });
    updateResult.value = res;
  } catch (e: unknown) {
    updateError.value = e instanceof Error ? e.message : String(e);
  } finally {
    updateLoading.value = false;
  }
}

// ── Code snippet ───────────────────────────────────────────────────────────
const codeSnippet = `const {
  profile,
  flattenedProfile,
  schemas,
  updateProfile,
  revalidateProfile,
} = useUser();

// Reactive state — use in templates
console.log(flattenedProfile.value?.userName);

// Refetch from server (GET /api/auth/user/profile)
await revalidateProfile();

// Update a field via PATCH /api/auth/user/profile (SCIM2 PatchOp)
// Transport changed from POST /api/auth/profile → PATCH /api/auth/user/profile
const result = await updateProfile({
  payload: {
    Operations: [{ op: 'replace', value: { name: { givenName: 'Alice' } } }],
    schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
  },
});`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="useUser"
      description="User profile data — reactive profile & flattenedProfile, SCIM2 schemas, updateProfile, revalidateProfile."
    />
    <div class="flex items-center gap-2 -mt-2">
      <SharedStatusBadge status="info" label="Auto-imported" />
      <span class="text-xs text-text-muted">from <code class="font-mono">@asgardeo/nuxt</code></span>
    </div>

    <!-- ── Reactive State ───────────────────────────────────────────────── -->
    <LayoutSectionCard title="Reactive State" description="Live values from useUser(). Sign in to populate.">
      <div class="flex flex-wrap gap-3 mb-4">
        <button
          class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
          @click="showProfile"
        >
          Show profile
        </button>
        <button
          class="px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors"
          @click="showSchemas"
        >
          Show schemas
        </button>
      </div>
      <SharedResultPanel v-if="profileResult !== null || profileError" :result="profileResult" :error="profileError" />
      <SharedResultPanel v-if="schemasResult !== null" class="mt-3" :result="schemasResult" />
    </LayoutSectionCard>

    <!-- ── flattenedProfile live table ─────────────────────────────────── -->
    <LayoutSectionCard
      title="flattenedProfile"
      description="Flattened map of common SCIM2 attributes — updates reactively after revalidateProfile() completes."
    >
      <div v-if="flattenedProfile" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-text-muted">Key</th>
              <th class="pb-2 font-medium text-text-muted">Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="(val, key) in (flattenedProfile as Record<string, unknown>)" :key="String(key)">
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">{{ key }}</td>
              <td class="py-2 font-mono text-xs text-text break-all">{{ JSON.stringify(val) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-xs text-text-muted italic">Not available — sign in first.</p>
    </LayoutSectionCard>

    <!-- ── revalidateProfile ────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="revalidateProfile()"
      description="Forces a fresh fetch of the user profile from the server and updates profile and flattenedProfile."
    >
      <button
        class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        :disabled="revalidateLoading"
        @click="runRevalidate"
      >
        {{ revalidateLoading ? 'Refreshing…' : 'revalidateProfile()' }}
      </button>
      <SharedResultPanel class="mt-3" :result="revalidateResult" :error="revalidateError" :is-loading="revalidateLoading" />
    </LayoutSectionCard>

    <!-- ── updateProfile ────────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="updateProfile()"
      description="Sends a SCIM2 PatchOp request to PATCH /api/auth/user/profile. Edit the JSON payload and click the button."
    >
      <label class="block text-xs font-medium text-text-muted mb-1">PatchOp payload (JSON)</label>
      <textarea
        v-model="updatePayload"
        rows="8"
        class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-mono text-text focus:outline-none focus:ring-1 focus:ring-accent-500 mb-3"
      />
      <button
        class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors disabled:opacity-50"
        :disabled="updateLoading"
        @click="runUpdateProfile"
      >
        {{ updateLoading ? 'Updating…' : 'updateProfile()' }}
      </button>
      <SharedResultPanel class="mt-3" :result="updateResult" :error="updateError" :is-loading="updateLoading" />
    </LayoutSectionCard>

    <!-- ── Code ────────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
