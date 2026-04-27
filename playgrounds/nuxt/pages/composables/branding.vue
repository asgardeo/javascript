<script setup lang="ts">
import {computed, ref} from 'vue';
import FunctionCard from '~/components/composables/FunctionCard.vue';
import StateInspectionTable from '~/components/composables/StateInspectionTable.vue';
import type {StateInspectionRow} from '~/components/composables/StateInspectionTable.vue';
import {composableSpecByName} from '~/utils/composables-manifest';

const spec = composableSpecByName['useBranding'];

const {
  activeTheme,
  brandingPreference,
  error,
  isLoading,
  theme,
  fetchBranding,
  refetch,
} = useBranding();

const functionLoading = ref<Record<string, boolean>>({});
const functionErrors = ref<Record<string, string | null>>({});
const functionResults = ref<Record<string, unknown>>({});

const stateRows = computed<StateInspectionRow[]>(() => {
  const values: Record<string, unknown> = {
    activeTheme: activeTheme.value,
    brandingPreference: brandingPreference.value,
    error: error.value ? error.value.message : null,
    isLoading: isLoading.value,
    theme: theme.value,
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
    if (name === 'fetchBranding') {
      await fetchBranding();
      functionResults.value[name] = brandingPreference.value;
      return;
    }

    if (name === 'refetch') {
      await refetch();
      functionResults.value[name] = brandingPreference.value;
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
      title="useBranding"
      :description="spec.description"
    />

    <LayoutSectionCard
      title="State Inspection"
      description="Live reactive state returned by useBranding()."
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
        />
      </div>
    </LayoutSectionCard>

    <LayoutSectionCard
      title="Import & Usage"
      description="Destructure state and methods from useBranding()."
    >
      <LayoutCodeBlock :code="spec.importSnippet" language="ts" />
    </LayoutSectionCard>
  </div>
</template>
