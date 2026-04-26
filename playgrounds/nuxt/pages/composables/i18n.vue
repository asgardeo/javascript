<script setup lang="ts">
import {computed, ref} from 'vue';
import FunctionCard from '~/components/composables/FunctionCard.vue';
import StateInspectionTable from '~/components/composables/StateInspectionTable.vue';
import type {StateInspectionRow} from '~/components/composables/StateInspectionTable.vue';
import {composableSpecByName} from '~/utils/composables-manifest';

const spec = composableSpecByName['useAsgardeoI18n'];

const {
  bundles,
  currentLanguage,
  fallbackLanguage,
  setLanguage,
  injectBundles,
  t,
} = useAsgardeoI18n();

const functionLoading = ref<Record<string, boolean>>({});
const functionErrors = ref<Record<string, string | null>>({});
const functionResults = ref<Record<string, unknown>>({});

const tKeyInput = ref('signin.title');
const tParamsInput = ref('');
const setLanguageInput = ref('en-US');
const injectBundlesInput = ref(`{
  "en-US": {
    "demo.greeting": "Hello, {name}!"
  }
}`);

const availableLanguages = computed<string[]>(() => Object.keys(bundles.value || {}));

const stateRows = computed<StateInspectionRow[]>(() => {
  const values: Record<string, unknown> = {
    bundles: bundles.value,
    currentLanguage: currentLanguage.value,
    fallbackLanguage,
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
    if (name === 't') {
      const params = tParamsInput.value.trim() ? JSON.parse(tParamsInput.value) : undefined;
      functionResults.value[name] = t(tKeyInput.value, params);
      return;
    }

    if (name === 'setLanguage') {
      setLanguage(setLanguageInput.value);
      functionResults.value[name] = currentLanguage.value;
      return;
    }

    if (name === 'injectBundles') {
      const parsed = JSON.parse(injectBundlesInput.value);
      injectBundles(parsed);
      functionResults.value[name] = {injectedLanguages: Object.keys(parsed)};
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
      title="useAsgardeoI18n"
      :description="spec.description"
    />

    <div class="flex items-center gap-2 -mt-2">
      <SharedStatusBadge status="info" label="Auto-imported" />
      <span class="text-xs text-text-muted">from <code class="font-mono">@asgardeo/nuxt</code></span>
    </div>

    <LayoutSectionCard
      title="State Inspection"
      description="Live reactive state returned by useAsgardeoI18n()."
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
            <div v-if="fn.name === 't'" class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">key</label>
                <input
                  v-model="tKeyInput"
                  type="text"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">params (JSON, optional)</label>
                <textarea
                  v-model="tParamsInput"
                  rows="3"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-text"
                />
              </div>
            </div>

            <div v-else-if="fn.name === 'setLanguage'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">language</label>
              <select
                v-model="setLanguageInput"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              >
                <option
                  v-for="language in availableLanguages"
                  :key="language"
                  :value="language"
                >
                  {{ language }}
                </option>
              </select>
            </div>

            <div v-else-if="fn.name === 'injectBundles'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">bundles (JSON)</label>
              <textarea
                v-model="injectBundlesInput"
                rows="7"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-text"
              />
            </div>
          </template>
        </FunctionCard>
      </div>
    </LayoutSectionCard>

    <LayoutSectionCard
      title="Import & Usage"
      description="Destructure state and methods from useAsgardeoI18n()."
    >
      <LayoutCodeBlock :code="spec.importSnippet" language="ts" />
    </LayoutSectionCard>
  </div>
</template>
