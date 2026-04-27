<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import FunctionCard from '~/components/composables/FunctionCard.vue';
import StateInspectionTable from '~/components/composables/StateInspectionTable.vue';
import type {StateInspectionRow} from '~/components/composables/StateInspectionTable.vue';
import {composableSpecByName} from '~/utils/composables-manifest';

const spec = composableSpecByName['useOrganization'];

const {
  currentOrganization,
  myOrganizations,
  isLoading,
  error,
  getAllOrganizations,
  revalidateMyOrganizations,
  switchOrganization,
  createOrganization,
} = useOrganization();

const functionLoading = ref<Record<string, boolean>>({});
const functionErrors = ref<Record<string, string | null>>({});
const functionResults = ref<Record<string, unknown>>({});

const selectedOrganizationId = ref('');
const createOrganizationPayloadInput = ref(`{
  "name": "Playground Organization"
}`);
const createOrganizationSessionIdInput = ref('');

watch(
  () => myOrganizations.value,
  (organizations) => {
    if (!selectedOrganizationId.value && organizations.length > 0) {
      selectedOrganizationId.value = organizations[0]?.id || '';
    }
  },
  {immediate: true},
);

const organizationOptions = computed(() =>
  myOrganizations.value.map((organization) => ({
    id: organization.id,
    label: organization.name || organization.id,
  })),
);

const stateRows = computed<StateInspectionRow[]>(() => {
  const values: Record<string, unknown> = {
    currentOrganization: currentOrganization.value,
    myOrganizations: myOrganizations.value,
    isLoading: isLoading.value,
    error: error.value,
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
    if (name === 'getAllOrganizations') {
      functionResults.value[name] = await getAllOrganizations();
      return;
    }

    if (name === 'revalidateMyOrganizations') {
      functionResults.value[name] = await revalidateMyOrganizations();
      return;
    }

    if (name === 'switchOrganization') {
      const selected = myOrganizations.value.find((org) => org.id === selectedOrganizationId.value);
      if (!selected) {
        throw new Error('Please select an organization from myOrganizations first.');
      }
      await switchOrganization(selected);
      functionResults.value[name] = {switchedTo: selected.name || selected.id};
      return;
    }

    if (name === 'createOrganization') {
      if (!createOrganization) {
        throw new Error('createOrganization is not available in this context.');
      }
      const payload = JSON.parse(createOrganizationPayloadInput.value);
      const sessionId = createOrganizationSessionIdInput.value.trim();
      if (!sessionId) {
        throw new Error('sessionId is required for createOrganization.');
      }
      functionResults.value[name] = await createOrganization(payload as any, sessionId);
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
      title="useOrganization"
      :description="spec.description"
    />

    <LayoutSectionCard
      title="State Inspection"
      description="Live reactive state returned by useOrganization()."
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
            <div v-if="fn.name === 'switchOrganization'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">organization</label>
              <select
                v-model="selectedOrganizationId"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              >
                <option
                  v-for="option in organizationOptions"
                  :key="option.id"
                  :value="option.id"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div v-else-if="fn.name === 'createOrganization'" class="space-y-3">
              <p
                v-if="!createOrganization"
                class="text-xs text-warning"
              >
                createOrganization is optional and not available in this runtime context.
              </p>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">payload (JSON)</label>
                <textarea
                  v-model="createOrganizationPayloadInput"
                  rows="6"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-text"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">sessionId</label>
                <input
                  v-model="createOrganizationSessionIdInput"
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
      description="Destructure state and methods from useOrganization()."
    >
      <LayoutCodeBlock :code="spec.importSnippet" language="ts" />
    </LayoutSectionCard>
  </div>
</template>
