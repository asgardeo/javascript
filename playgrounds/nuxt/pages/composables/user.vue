<script setup lang="ts">
import {computed, ref} from 'vue';
import FunctionCard from '~/components/composables/FunctionCard.vue';
import StateInspectionTable from '~/components/composables/StateInspectionTable.vue';
import type {StateInspectionRow} from '~/components/composables/StateInspectionTable.vue';
import {composableSpecByName} from '~/utils/composables-manifest';

const spec = composableSpecByName['useUser'];

const {
  profile,
  flattenedProfile,
  schemas,
  revalidateProfile,
  updateProfile,
} = useUser();

const functionLoading = ref<Record<string, boolean>>({});
const functionErrors = ref<Record<string, string | null>>({});
const functionResults = ref<Record<string, unknown>>({});

const updateProfileConfigInput = ref(`{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
  "Operations": [
    {
      "op": "replace",
      "value": {
        "name": {
          "givenName": "Alice"
        }
      }
    }
  ]
}`);
const updateProfileSessionIdInput = ref('');

const stateRows = computed<StateInspectionRow[]>(() => {
  const values: Record<string, unknown> = {
    profile: profile.value,
    flattenedProfile: flattenedProfile.value,
    schemas: schemas.value,
  };

  return spec.state.map((row) => ({
    name: row.name,
    value: values[row.name],
    type: row.type,
    description: row.description,
  }));
});

const runFunction = async (name: string): Promise<void> => {
  functionLoading.value[name] = true;
  functionErrors.value[name] = null;
  functionResults.value[name] = undefined;

  try {
    if (name === 'revalidateProfile') {
      await revalidateProfile();
      functionResults.value[name] = profile.value;
      return;
    }

    if (name === 'updateProfile') {
      const parsed = JSON.parse(updateProfileConfigInput.value) as Record<string, unknown>;
      const sessionId = updateProfileSessionIdInput.value.trim() || undefined;
      functionResults.value[name] = await updateProfile(parsed as any, sessionId);
      return;
    }

    throw new Error(`No execution handler configured for ${name}`);
  } catch (errorValue) {
    functionErrors.value[name] = errorValue instanceof Error ? errorValue.message : String(errorValue);
  } finally {
    functionLoading.value[name] = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="useUser"
      :description="spec.description"
    />

    <LayoutSectionCard
      title="State Inspection"
      description="Live reactive state returned by useUser()."
    >
      <StateInspectionTable :rows="stateRows" />
    </LayoutSectionCard>

    <LayoutSectionCard
      title="Functions"
      description="Execute composable functions and inspect returned results."
    >
      <div class="space-y-4">
        <FunctionCard
          v-for="fn in spec.functions"
          :key="fn.name"
          :name="fn.name"
          :signature="fn.signature"
          :description="fn.description"
          :is-loading="Boolean(functionLoading[fn.name])"
          :result="functionResults[fn.name]"
          :error="functionErrors[fn.name]"
          @execute="runFunction(fn.name)"
        >
          <template #parameters>
            <div v-if="fn.name === 'updateProfile'" class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">requestConfig (JSON)</label>
                <textarea
                  v-model="updateProfileConfigInput"
                  rows="9"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-text"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">sessionId (optional)</label>
                <input
                  v-model="updateProfileSessionIdInput"
                  type="text"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                />
              </div>
            </div>
          </template>
        </FunctionCard>
      </div>
    </LayoutSectionCard>

    <LayoutSectionCard
      title="Import & Usage"
      description="Destructure state and methods from useUser()."
    >
      <LayoutCodeBlock :code="spec.importSnippet" language="ts" />
    </LayoutSectionCard>
  </div>
</template>
