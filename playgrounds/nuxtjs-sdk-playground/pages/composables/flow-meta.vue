<script setup lang="ts">
import {computed, ref} from 'vue';
import FunctionCard from '~/components/composables/FunctionCard.vue';
import StateInspectionTable from '~/components/composables/StateInspectionTable.vue';
import type {StateInspectionRow} from '~/components/composables/StateInspectionTable.vue';
import {composableSpecByName} from '~/utils/composables-manifest';

const spec = composableSpecByName['useFlowMeta'];

const {
  meta,
  isLoading,
  error,
  fetchFlowMeta,
  switchLanguage,
} = useFlowMeta();

const {platform} = useAsgardeo();

const functionLoading = ref<Record<string, boolean>>({});
const functionErrors = ref<Record<string, string | null>>({});
const functionResults = ref<Record<string, unknown>>({});

const switchLanguageInput = ref('en-US');

const isFlowMetaDisabled = computed(() => platform !== 'AsgardeoV2');

const stateRows = computed<StateInspectionRow[]>(() => {
  const values: Record<string, unknown> = {
    meta: meta.value,
    isLoading: isLoading.value,
    error: error.value ? error.value.message : null,
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
    if (name === 'fetchFlowMeta') {
      await fetchFlowMeta();
      functionResults.value[name] = meta.value;
      return;
    }

    if (name === 'switchLanguage') {
      await switchLanguage(switchLanguageInput.value);
      functionResults.value[name] = meta.value;
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
      title="useFlowMeta"
      :description="spec.description"
    />

    <div class="flex items-center gap-2 -mt-2">
      <SharedStatusBadge status="info" label="Auto-imported" />
      <span class="text-xs text-text-muted">from <code class="font-mono">@asgardeo/nuxt</code></span>
    </div>

    <div
      v-if="isFlowMetaDisabled"
      class="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning"
    >
      FlowMeta requires platform: 'AsgardeoV2' - currently disabled in this playground.
    </div>

    <LayoutSectionCard
      title="State Inspection"
      description="Live reactive state returned by useFlowMeta()."
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
            <div v-if="fn.name === 'switchLanguage'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">language</label>
              <input
                v-model="switchLanguageInput"
                type="text"
                placeholder="en-US"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              />
            </div>
          </template>
        </FunctionCard>
      </div>
    </LayoutSectionCard>

    <LayoutSectionCard
      title="Import & Usage"
      description="Destructure state and methods from useFlowMeta()."
    >
      <LayoutCodeBlock :code="spec.importSnippet" language="ts" />
    </LayoutSectionCard>
  </div>
</template>
