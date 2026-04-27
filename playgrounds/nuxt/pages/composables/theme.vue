<script setup lang="ts">
import {computed, ref} from 'vue';
import StateInspectionTable from '~/components/composables/StateInspectionTable.vue';
import FunctionCard from '~/components/composables/FunctionCard.vue';
import type {StateInspectionRow} from '~/components/composables/StateInspectionTable.vue';
import {composableSpecByName} from '~/utils/composables-manifest';

const {
  colorScheme,
  direction,
  inheritFromBranding,
  isBrandingLoading,
  brandingError,
  theme,
  toggleTheme,
} = useTheme();

const spec = composableSpecByName['useTheme'];
const toggleThemeSpec = spec.functions.find((fn) => fn.name === 'toggleTheme');

const isToggleThemeLoading = ref(false);
const toggleThemeError = ref<string | null>(null);

const stateRows = computed<StateInspectionRow[]>(() => {
  const stateValues: Record<string, unknown> = {
    colorScheme: colorScheme.value,
    direction: direction.value,
    inheritFromBranding,
    isBrandingLoading: isBrandingLoading.value,
    brandingError: brandingError.value,
    theme: theme.value,
  };

  return spec.state.map((row) => ({
    name: row.name,
    value: stateValues[row.name],
    type: row.type,
    description: row.description,
  }));
});

const onExecuteToggleTheme = async (): Promise<void> => {
  try {
    toggleThemeError.value = null;
    isToggleThemeLoading.value = true;
    toggleTheme();
  } catch (error) {
    toggleThemeError.value = error instanceof Error ? error.message : String(error);
  } finally {
    isToggleThemeLoading.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="useTheme"
      :description="spec.description"
    />

    <LayoutSectionCard
      title="State Inspection"
      description="Live reactive state returned by useTheme()."
    >
      <StateInspectionTable :rows="stateRows" />
    </LayoutSectionCard>

    <LayoutSectionCard
      title="Functions"
      description="Execute composable functions and inspect returned results."
    >
      <div class="space-y-4">
        <FunctionCard
          name="toggleTheme"
          :signature="toggleThemeSpec?.signature || '() => void'"
          :description="toggleThemeSpec?.description || 'Toggles between light and dark color scheme.'"
          :is-loading="isToggleThemeLoading"
          :error="toggleThemeError"
          @execute="onExecuteToggleTheme"
        />
      </div>
    </LayoutSectionCard>

    <LayoutSectionCard
      title="Import & Usage"
      description="Destructure state and methods from useTheme()."
    >
      <LayoutCodeBlock :code="spec.importSnippet" language="ts" />
    </LayoutSectionCard>
  </div>
</template>
