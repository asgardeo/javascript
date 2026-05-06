<script setup lang="ts">
import { ref } from 'vue'
import { useUser } from '@asgardeo/vue'
import ResultPanel from '../shared/ResultPanel.vue'
import SectionCard from '../layout/SectionCard.vue'

const { profile, flattenedProfile, schemas, updateProfile, revalidateProfile } = useUser()

// profile / schemas snapshots
const profileResult = ref<unknown>(null)
const profileError = ref<string | null>(null)
const schemasResult = ref<unknown>(null)

function showProfile() {
  profileError.value = null
  try {
    profileResult.value = profile.value
  } catch (e: unknown) {
    profileError.value = e instanceof Error ? e.message : String(e)
  }
}

function showSchemas() {
  schemasResult.value = schemas.value
}

// revalidateProfile
const revalidateResult = ref<string | null>(null)
const revalidateError = ref<string | null>(null)
const revalidateLoading = ref(false)

async function runRevalidate() {
  revalidateLoading.value = true
  revalidateError.value = null
  revalidateResult.value = null
  try {
    await revalidateProfile()
    revalidateResult.value = 'Profile revalidated successfully.'
  } catch (e: unknown) {
    revalidateError.value = e instanceof Error ? e.message : String(e)
  } finally {
    revalidateLoading.value = false
  }
}

// updateProfile
const updatePayload = ref(
  JSON.stringify(
    {
      Operations: [{ op: 'replace', value: { name: { givenName: 'Test' } } }],
      schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
    },
    null,
    2,
  ),
)
const updateResult = ref<unknown>(null)
const updateError = ref<string | null>(null)
const updateLoading = ref(false)

async function runUpdateProfile() {
  updateLoading.value = true
  updateError.value = null
  updateResult.value = null
  try {
    const parsed = JSON.parse(updatePayload.value) as unknown
    const res = await updateProfile({ payload: parsed })
    updateResult.value = res
  } catch (e: unknown) {
    updateError.value = e instanceof Error ? e.message : String(e)
  } finally {
    updateLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">

    <!-- Reactive State -->
    <SectionCard title="Reactive State">
      <p class="mb-3 text-xs text-on-surface-muted">
        Live snapshots from <code class="font-mono">useUser()</code>. Click
        <strong class="font-semibold">Show</strong> to render the current value in a result panel.
      </p>
      <div class="flex gap-2 flex-wrap mb-3">
        <button
          class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all"
          @click="showProfile"
        >
          Show profile
        </button>
        <button
          class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all"
          @click="showSchemas"
        >
          Show schemas
        </button>
      </div>
      <ResultPanel v-if="profileResult !== null || profileError" :result="profileResult" :error="profileError" />
      <ResultPanel v-if="schemasResult !== null" class="mt-3" :result="schemasResult" />
    </SectionCard>

    <!-- flattenedProfile live table -->
    <SectionCard title="flattenedProfile">
      <p class="mb-3 text-xs text-on-surface-muted">
        A flattened map of common SCIM2 attributes — updates reactively when
        <code class="font-mono">revalidateProfile()</code> completes.
      </p>
      <div v-if="flattenedProfile" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-on-surface-muted">Key</th>
              <th class="pb-2 font-medium text-on-surface-muted">Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-divider">
            <tr v-for="(val, key) in flattenedProfile" :key="String(key)">
              <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">{{ key }}</td>
              <td class="py-2 font-mono text-xs text-on-surface break-all">{{ JSON.stringify(val) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-xs text-on-surface-muted italic">Not available — sign in first.</p>
    </SectionCard>

    <!-- revalidateProfile -->
    <SectionCard title="revalidateProfile()">
      <p class="mb-3 text-xs text-on-surface-muted">
        Forces a fresh fetch of the user profile from the server and updates
        <code class="font-mono">profile</code> and <code class="font-mono">flattenedProfile</code>.
      </p>
      <button
        class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all disabled:opacity-50"
        :disabled="revalidateLoading"
        @click="runRevalidate"
      >
        {{ revalidateLoading ? 'Refreshing…' : 'revalidateProfile()' }}
      </button>
      <ResultPanel class="mt-3" :result="revalidateResult" :error="revalidateError" :loading="revalidateLoading" />
    </SectionCard>

    <!-- updateProfile -->
    <SectionCard title="updateProfile()">
      <p class="mb-3 text-xs text-on-surface-muted">
        Sends a SCIM2 <code class="font-mono">PatchOp</code> request to update the user profile.
        Edit the JSON payload below and click <strong class="font-semibold">updateProfile()</strong>.
      </p>
      <textarea
        v-model="updatePayload"
        rows="8"
        spellcheck="false"
        class="w-full rounded-lg border border-border-hover bg-surface-secondary px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-accent-500 mb-3"
      />
      <button
        class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all disabled:opacity-50"
        :disabled="updateLoading"
        @click="runUpdateProfile"
      >
        {{ updateLoading ? 'Updating…' : 'updateProfile()' }}
      </button>
      <ResultPanel class="mt-3" :result="updateResult" :error="updateError" :loading="updateLoading" />
    </SectionCard>

  </div>
</template>
