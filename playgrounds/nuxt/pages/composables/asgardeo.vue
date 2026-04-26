<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import FunctionCard from '~/components/composables/FunctionCard.vue';
import StateInspectionTable from '~/components/composables/StateInspectionTable.vue';
import type {StateInspectionRow} from '~/components/composables/StateInspectionTable.vue';
import {composableSpecByName} from '~/utils/composables-manifest';

const spec = composableSpecByName['useAsgardeo'];

const {
  isSignedIn,
  isLoading,
  isInitialized,
  clientId,
  baseUrl,
  applicationId,
  signInUrl,
  signUpUrl,
  instanceId,
  user,
  organization,
  organizationHandle,
  platform,
  meta,
  signIn,
  signOut,
  signUp,
  signInSilently,
  getAccessToken,
  getIdToken,
  getDecodedIdToken,
  exchangeToken,
  switchOrganization,
  clearSession,
  reInitialize,
  http,
  resolveFlowTemplateLiterals,
} = useAsgardeo();

const {myOrganizations} = useOrganization();

const functionLoading = ref<Record<string, boolean>>({});
const functionErrors = ref<Record<string, string | null>>({});
const functionResults = ref<Record<string, unknown>>({});

const signInOptionsInput = ref('{\n  "returnTo": "/composables/asgardeo"\n}');
const exchangeTokenConfigInput = ref('{}');
const switchOrganizationIdInput = ref('');
const reInitializeConfigInput = ref('{}');
const requestUrlInput = ref('/scim2/Me');
const requestMethodInput = ref('GET');
const requestBodyInput = ref('');
const requestAllConfigsInput = ref('[]');
const resolveTextInput = ref('Welcome, {{meta(user.name.givenName)}}');

watch(
  () => myOrganizations.value,
  (organizations) => {
    if (!switchOrganizationIdInput.value && organizations.length > 0) {
      switchOrganizationIdInput.value = organizations[0]?.id || '';
    }
  },
  {immediate: true},
);

const organizationOptions = computed(() =>
  myOrganizations.value.map((org) => ({
    id: org.id,
    label: org.name || org.id,
  })),
);

const truncateToken = (token: string): string =>
  token.length > 80 ? `${token.slice(0, 80)}...` : token;

const stateRows = computed<StateInspectionRow[]>(() => {
  const values: Record<string, unknown> = {
    isSignedIn: isSignedIn.value,
    isLoading: isLoading.value,
    isInitialized: isInitialized.value,
    clientId,
    baseUrl,
    applicationId,
    signInUrl,
    signUpUrl,
    instanceId,
    user: user.value,
    organization: organization.value,
    organizationHandle,
    platform,
    meta: meta?.value,
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
    if (name === 'signIn') {
      const options = signInOptionsInput.value.trim() ? JSON.parse(signInOptionsInput.value) : undefined;
      functionResults.value[name] = await signIn(options);
      return;
    }

    if (name === 'signOut') {
      functionResults.value[name] = await signOut();
      return;
    }

    if (name === 'signUp') {
      functionResults.value[name] = await signUp();
      return;
    }

    if (name === 'signInSilently') {
      functionResults.value[name] = await signInSilently();
      return;
    }

    if (name === 'getAccessToken') {
      const token = await getAccessToken();
      functionResults.value[name] = truncateToken(token);
      return;
    }

    if (name === 'getIdToken') {
      const token = await getIdToken();
      functionResults.value[name] = truncateToken(token);
      return;
    }

    if (name === 'getDecodedIdToken') {
      functionResults.value[name] = await getDecodedIdToken();
      return;
    }

    if (name === 'exchangeToken') {
      const config = JSON.parse(exchangeTokenConfigInput.value);
      functionResults.value[name] = await exchangeToken(config as any);
      return;
    }

    if (name === 'switchOrganization') {
      const selected = myOrganizations.value.find((org) => org.id === switchOrganizationIdInput.value);
      if (!selected) {
        throw new Error('Please select an organization from myOrganizations first.');
      }
      await switchOrganization(selected as any);
      functionResults.value[name] = {switchedTo: selected.name || selected.id};
      return;
    }

    if (name === 'clearSession') {
      functionResults.value[name] = await clearSession();
      return;
    }

    if (name === 'reInitialize') {
      const config = JSON.parse(reInitializeConfigInput.value);
      functionResults.value[name] = await reInitialize(config as any);
      return;
    }

    if (name === 'http.request') {
      const config: Record<string, unknown> = {
        url: requestUrlInput.value,
        method: requestMethodInput.value,
      };
      if (['POST', 'PUT', 'PATCH'].includes(requestMethodInput.value) && requestBodyInput.value.trim()) {
        config.data = JSON.parse(requestBodyInput.value);
      }
      const response = await http.request(config as any);
      functionResults.value[name] = (response as unknown as {data?: unknown})?.data ?? response;
      return;
    }

    if (name === 'http.requestAll') {
      const requestConfigs = JSON.parse(requestAllConfigsInput.value);
      functionResults.value[name] = await http.requestAll(requestConfigs as any);
      return;
    }

    if (name === 'resolveFlowTemplateLiterals') {
      if (!resolveFlowTemplateLiterals) {
        throw new Error('resolveFlowTemplateLiterals is not available in this runtime context.');
      }
      functionResults.value[name] = resolveFlowTemplateLiterals(resolveTextInput.value);
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
      title="useAsgardeo"
      :description="spec.description"
    />

    <div class="flex items-center gap-2 -mt-2">
      <SharedStatusBadge status="info" label="Auto-imported" />
      <span class="text-xs text-text-muted">from <code class="font-mono">@asgardeo/nuxt</code></span>
    </div>

    <LayoutSectionCard
      title="State Inspection"
      description="Live reactive state returned by useAsgardeo()."
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
            <div v-if="fn.name === 'signIn'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">options (JSON, optional)</label>
              <textarea
                v-model="signInOptionsInput"
                rows="4"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-text"
              />
            </div>

            <div v-else-if="fn.name === 'exchangeToken'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">config (JSON)</label>
              <textarea
                v-model="exchangeTokenConfigInput"
                rows="7"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-text"
              />
            </div>

            <div v-else-if="fn.name === 'switchOrganization'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">organization</label>
              <select
                v-model="switchOrganizationIdInput"
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

            <div v-else-if="fn.name === 'reInitialize'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">config (JSON)</label>
              <textarea
                v-model="reInitializeConfigInput"
                rows="7"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-text"
              />
            </div>

            <div v-else-if="fn.name === 'http.request'" class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">url</label>
                <input
                  v-model="requestUrlInput"
                  type="text"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">method</label>
                <select
                  v-model="requestMethodInput"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">body (JSON, optional)</label>
                <textarea
                  v-model="requestBodyInput"
                  rows="5"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-text"
                />
              </div>
            </div>

            <div v-else-if="fn.name === 'http.requestAll'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">requestConfigs (JSON array)</label>
              <textarea
                v-model="requestAllConfigsInput"
                rows="7"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-text"
              />
            </div>

            <div v-else-if="fn.name === 'resolveFlowTemplateLiterals'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">text</label>
              <input
                v-model="resolveTextInput"
                type="text"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              />
            </div>
          </template>
        </FunctionCard>
      </div>
    </LayoutSectionCard>

    <LayoutSectionCard
      title="Import & Usage"
      description="Destructure state and methods from useAsgardeo()."
    >
      <LayoutCodeBlock :code="spec.importSnippet" language="ts" />
    </LayoutSectionCard>
  </div>
</template>
