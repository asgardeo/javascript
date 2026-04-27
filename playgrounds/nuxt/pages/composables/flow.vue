<script setup lang="ts">
import {computed, ref} from 'vue';
import FunctionCard from '~/components/composables/FunctionCard.vue';
import StateInspectionTable from '~/components/composables/StateInspectionTable.vue';
import type {StateInspectionRow} from '~/components/composables/StateInspectionTable.vue';
import {composableSpecByName} from '~/utils/composables-manifest';

const spec = composableSpecByName['useFlow'];

const {
  currentStep,
  isLoading,
  error,
  messages,
  title,
  subtitle,
  showBackButton,
  onGoBack,
  navigateToFlow,
  setCurrentStep,
  setTitle,
  setSubtitle,
  setError,
  setIsLoading,
  setShowBackButton,
  setOnGoBack,
  addMessage,
  removeMessage,
  clearMessages,
  reset,
} = useFlow();

const functionLoading = ref<Record<string, boolean>>({});
const functionErrors = ref<Record<string, string | null>>({});
const functionResults = ref<Record<string, unknown>>({});

const navigateFlowTypeInput = ref('signin');
const navigateTitleInput = ref('Sign In');
const navigateSubtitleInput = ref('');
const navigateMetadataInput = ref('');

const setCurrentStepInput = ref(`{
  "id": "signin-step",
  "type": "signin",
  "title": "Sign In"
}`);
const setTitleInput = ref('Updated Flow Title');
const setSubtitleInput = ref('Updated subtitle');
const setErrorInput = ref('Something went wrong.');
const setIsLoadingInput = ref(false);
const setShowBackButtonInput = ref(false);

const addMessageTextInput = ref('Hello from flow context');
const addMessageTypeInput = ref('info');
const addMessageIdInput = ref('');
const addMessageDismissibleInput = ref(true);

const removeMessageIdInput = ref('');

const flowTypeOptions = [
  'signin',
  'signup',
  'organization-signin',
  'forgot-password',
  'reset-password',
  'verify-email',
  'mfa',
];

const messageOptions = computed(() =>
  messages.value.map((message) => ({
    id: message.id || message.message,
    label: `${message.type}: ${message.message}`,
  })),
);

const stateRows = computed<StateInspectionRow[]>(() => {
  const values: Record<string, unknown> = {
    currentStep: currentStep.value,
    isLoading: isLoading.value,
    error: error.value,
    messages: messages.value,
    title: title.value,
    subtitle: subtitle.value,
    showBackButton: showBackButton.value,
    onGoBack: onGoBack.value ? 'configured' : null,
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
    if (name === 'navigateToFlow') {
      const metadata = navigateMetadataInput.value.trim()
        ? JSON.parse(navigateMetadataInput.value)
        : undefined;
      navigateToFlow(navigateFlowTypeInput.value as any, {
        title: navigateTitleInput.value || undefined,
        subtitle: navigateSubtitleInput.value || undefined,
        metadata,
      });
      functionResults.value[name] = currentStep.value;
      return;
    }

    if (name === 'setCurrentStep') {
      const parsed = setCurrentStepInput.value.trim() ? JSON.parse(setCurrentStepInput.value) : null;
      setCurrentStep(parsed);
      functionResults.value[name] = currentStep.value;
      return;
    }

    if (name === 'setTitle') {
      setTitle(setTitleInput.value);
      functionResults.value[name] = title.value;
      return;
    }

    if (name === 'setSubtitle') {
      setSubtitle(setSubtitleInput.value || undefined);
      functionResults.value[name] = subtitle.value;
      return;
    }

    if (name === 'setError') {
      setError(setErrorInput.value || null);
      functionResults.value[name] = error.value;
      return;
    }

    if (name === 'setIsLoading') {
      setIsLoading(Boolean(setIsLoadingInput.value));
      functionResults.value[name] = isLoading.value;
      return;
    }

    if (name === 'setShowBackButton') {
      setShowBackButton(Boolean(setShowBackButtonInput.value));
      functionResults.value[name] = showBackButton.value;
      return;
    }

    if (name === 'setOnGoBack') {
      setOnGoBack(() => {
        console.log('onGoBack callback invoked from playground');
      });
      functionResults.value[name] = 'Callback set. Trigger via flow UI back action.';
      return;
    }

    if (name === 'addMessage') {
      addMessage({
        message: addMessageTextInput.value,
        type: addMessageTypeInput.value as any,
        id: addMessageIdInput.value || undefined,
        dismissible: addMessageDismissibleInput.value,
      });
      functionResults.value[name] = messages.value;
      return;
    }

    if (name === 'removeMessage') {
      if (!removeMessageIdInput.value) {
        throw new Error('Select a message ID before executing removeMessage.');
      }
      removeMessage(removeMessageIdInput.value);
      functionResults.value[name] = messages.value;
      return;
    }

    if (name === 'clearMessages') {
      clearMessages();
      functionResults.value[name] = messages.value;
      return;
    }

    if (name === 'reset') {
      reset();
      functionResults.value[name] = {
        currentStep: currentStep.value,
        isLoading: isLoading.value,
        error: error.value,
        messages: messages.value,
      };
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
      title="useFlow"
      :description="spec.description"
    />

    <LayoutSectionCard
      title="State Inspection"
      description="Live reactive state returned by useFlow()."
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
            <div v-if="fn.name === 'navigateToFlow'" class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">flowType</label>
                <select
                  v-model="navigateFlowTypeInput"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                >
                  <option v-for="type in flowTypeOptions" :key="type" :value="type">{{ type }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">title</label>
                <input
                  v-model="navigateTitleInput"
                  type="text"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">subtitle</label>
                <input
                  v-model="navigateSubtitleInput"
                  type="text"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">metadata (JSON, optional)</label>
                <textarea
                  v-model="navigateMetadataInput"
                  rows="3"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-text"
                />
              </div>
            </div>

            <div v-else-if="fn.name === 'setCurrentStep'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">step (JSON)</label>
              <textarea
                v-model="setCurrentStepInput"
                rows="6"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-text"
              />
            </div>

            <div v-else-if="fn.name === 'setTitle'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">title</label>
              <input
                v-model="setTitleInput"
                type="text"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              />
            </div>

            <div v-else-if="fn.name === 'setSubtitle'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">subtitle</label>
              <input
                v-model="setSubtitleInput"
                type="text"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              />
            </div>

            <div v-else-if="fn.name === 'setError'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">error</label>
              <input
                v-model="setErrorInput"
                type="text"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              />
            </div>

            <div v-else-if="fn.name === 'setIsLoading'" class="space-y-2">
              <label class="inline-flex items-center gap-2 text-sm text-text">
                <input v-model="setIsLoadingInput" type="checkbox" class="h-4 w-4" />
                loading
              </label>
            </div>

            <div v-else-if="fn.name === 'setShowBackButton'" class="space-y-2">
              <label class="inline-flex items-center gap-2 text-sm text-text">
                <input v-model="setShowBackButtonInput" type="checkbox" class="h-4 w-4" />
                show back button
              </label>
            </div>

            <p v-else-if="fn.name === 'setOnGoBack'" class="text-xs text-text-muted">
              Registers a console logging callback as the back action handler.
            </p>

            <div v-else-if="fn.name === 'addMessage'" class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">message</label>
                <input
                  v-model="addMessageTextInput"
                  type="text"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">type</label>
                <select
                  v-model="addMessageTypeInput"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                >
                  <option value="success">success</option>
                  <option value="error">error</option>
                  <option value="warning">warning</option>
                  <option value="info">info</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">id (optional)</label>
                <input
                  v-model="addMessageIdInput"
                  type="text"
                  class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                />
              </div>
              <label class="inline-flex items-center gap-2 text-sm text-text">
                <input v-model="addMessageDismissibleInput" type="checkbox" class="h-4 w-4" />
                dismissible
              </label>
            </div>

            <div v-else-if="fn.name === 'removeMessage'" class="space-y-2">
              <label class="block text-xs font-medium text-text-muted mb-1">messageId</label>
              <select
                v-model="removeMessageIdInput"
                class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              >
                <option value="">Select message</option>
                <option
                  v-for="option in messageOptions"
                  :key="option.id"
                  :value="option.id"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </template>
        </FunctionCard>
      </div>
    </LayoutSectionCard>

    <LayoutSectionCard
      title="Import & Usage"
      description="Destructure state and methods from useFlow()."
    >
      <LayoutCodeBlock :code="spec.importSnippet" language="ts" />
    </LayoutSectionCard>
  </div>
</template>
