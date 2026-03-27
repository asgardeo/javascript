<script setup lang="ts">
import { ref } from 'vue'
import { useFlow } from '@asgardeo/vue'
import type { FlowStep, FlowMessage } from '@asgardeo/vue'
import ResultPanel from '../../components/shared/ResultPanel.vue'
import SectionCard from '../../components/layout/SectionCard.vue'

const {
  currentStep,
  error,
  isLoading,
  messages,
  onGoBack,
  showBackButton,
  subtitle,
  title,
  addMessage,
  clearMessages,
  navigateToFlow,
  removeMessage,
  reset,
  setCurrentStep,
  setError,
  setIsLoading,
  setShowBackButton,
  setSubtitle,
  setTitle,
} = useFlow()

type FlowType = NonNullable<FlowStep>['type']
const flowTypes: FlowType[] = ['signin', 'signup', 'organization-signin', 'forgot-password', 'reset-password', 'verify-email', 'mfa']

// --- setTitle ---
const titleInput = ref('')
function runSetTitle() {
  if (!titleInput.value.trim()) return
  setTitle(titleInput.value.trim())
  titleInput.value = ''
}

// --- setSubtitle ---
const subtitleInput = ref('')
function runSetSubtitle() {
  setSubtitle(subtitleInput.value.trim() || undefined)
  subtitleInput.value = ''
}

// --- setIsLoading ---
function runSetIsLoading(val: boolean) { setIsLoading(val) }

// --- setShowBackButton ---
function runSetShowBackButton(val: boolean) { setShowBackButton(val) }

// --- setError ---
const errorInput = ref('')
function runSetError() {
  setError(errorInput.value.trim() || null)
  errorInput.value = ''
}

// --- setCurrentStep (via raw JSON) ---
const stepJson = ref('{ "type": "signin" }')
const stepSetError = ref<string | null>(null)
function runSetCurrentStep() {
  stepSetError.value = null
  try {
    const parsed = JSON.parse(stepJson.value) as FlowStep
    setCurrentStep(parsed)
  } catch (e: unknown) {
    stepSetError.value = e instanceof Error ? e.message : String(e)
  }
}

// --- addMessage ---
const msgText = ref('')
const msgType = ref<FlowMessage['type']>('info')
const msgDismissible = ref(true)
const msgTypes: FlowMessage['type'][] = ['success', 'error', 'warning', 'info']
function runAddMessage() {
  if (!msgText.value.trim()) return
  addMessage({ message: msgText.value.trim(), type: msgType.value, dismissible: msgDismissible.value })
  msgText.value = ''
}

// --- removeMessage ---
const removeId = ref('')
function runRemoveMessage() {
  if (!removeId.value.trim()) return
  removeMessage(removeId.value.trim())
  removeId.value = ''
}

// --- navigateToFlow ---
const navigateTarget = ref<FlowType>('signin')
const navigateResult = ref<string | null>(null)
const navigateError = ref<string | null>(null)
function runNavigate() {
  navigateError.value = null
  navigateResult.value = null
  try {
    navigateToFlow(navigateTarget.value)
    navigateResult.value = `Navigated to "${navigateTarget.value}".`
  } catch (e: unknown) {
    navigateError.value = e instanceof Error ? e.message : String(e)
  }
}

// --- reset ---
const resetResult = ref<string | null>(null)
const resetError = ref<string | null>(null)
function runReset() {
  try {
    reset()
    resetResult.value = 'Flow reset successfully.'
  } catch (e: unknown) {
    resetError.value = e instanceof Error ? e.message : String(e)
  }
}
</script>

<template>
  <div class="space-y-6">

    <!-- Reactive State -->
    <SectionCard title="Reactive State">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border text-left">
            <th class="pb-2 pr-6 font-medium text-on-surface-muted">Property</th>
            <th class="pb-2 font-medium text-on-surface-muted">Value</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-divider">
          <tr>
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">isLoading</td>
            <td class="py-2">
              <span
                :class="isLoading
                  ? 'bg-status-warning-bg text-status-warning-text'
                  : 'bg-surface-muted text-on-surface-secondary'"
                class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
              >{{ isLoading }}</span>
            </td>
          </tr>
          <tr>
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">title</td>
            <td class="py-2 font-mono text-xs text-on-surface">{{ title }}</td>
          </tr>
          <tr>
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">subtitle</td>
            <td class="py-2 font-mono text-xs" :class="subtitle ? 'text-on-surface' : 'text-on-surface-muted italic'">
              {{ subtitle ?? 'undefined' }}
            </td>
          </tr>
          <tr>
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">error</td>
            <td class="py-2 font-mono text-xs" :class="error ? 'text-status-error-text' : 'text-on-surface-muted italic'">
              {{ error ?? 'null' }}
            </td>
          </tr>
          <tr>
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">showBackButton</td>
            <td class="py-2">
              <span
                :class="showBackButton
                  ? 'bg-status-success-bg text-status-success-text'
                  : 'bg-surface-muted text-on-surface-secondary'"
                class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
              >{{ showBackButton }}</span>
            </td>
          </tr>
          <tr>
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">onGoBack</td>
            <td class="py-2 font-mono text-xs" :class="onGoBack ? 'text-status-success-text' : 'text-on-surface-muted italic'">
              {{ onGoBack ? 'function set' : 'undefined' }}
            </td>
          </tr>
          <tr>
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">messages.length</td>
            <td class="py-2 font-mono text-xs text-on-surface">{{ messages?.length ?? 0 }}</td>
          </tr>
          <tr>
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">currentStep</td>
            <td class="py-2 font-mono text-xs text-on-surface break-all">{{ JSON.stringify(currentStep) }}</td>
          </tr>
        </tbody>
      </table>
    </SectionCard>

    <!-- messages live list -->
    <SectionCard title="messages">
      <p class="mb-3 text-xs text-on-surface-muted">
        Active messages in the flow. Use <code class="font-mono">addMessage()</code> and
        <code class="font-mono">removeMessage()</code> below to manage them.
      </p>
      <div v-if="messages && messages.length" class="space-y-2">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="rounded-lg border border-border p-3 text-xs font-mono text-on-surface"
        >
          {{ JSON.stringify(msg) }}
        </div>
      </div>
      <p v-else class="text-xs text-on-surface-muted italic">No messages in current flow.</p>
    </SectionCard>

    <!-- setTitle -->
    <SectionCard title="setTitle()">
      <p class="mb-3 text-xs text-on-surface-muted">
        Updates the flow's <code class="font-mono">title</code> string.
      </p>
      <div class="flex gap-2">
        <input
          v-model="titleInput"
          type="text"
          placeholder="Sign In"
          class="flex-1 rounded-lg border border-border-hover bg-surface-secondary px-3 py-2 text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <button
          class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all disabled:opacity-50"
          :disabled="!titleInput.trim()"
          @click="runSetTitle"
        >
          setTitle()
        </button>
      </div>
    </SectionCard>

    <!-- setSubtitle -->
    <SectionCard title="setSubtitle()">
      <p class="mb-3 text-xs text-on-surface-muted">
        Updates the flow's <code class="font-mono">subtitle</code>. Leave blank to clear it.
      </p>
      <div class="flex gap-2">
        <input
          v-model="subtitleInput"
          type="text"
          placeholder="Welcome back (leave blank to clear)"
          class="flex-1 rounded-lg border border-border-hover bg-surface-secondary px-3 py-2 text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <button
          class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all"
          @click="runSetSubtitle"
        >
          setSubtitle()
        </button>
      </div>
    </SectionCard>

    <!-- setIsLoading / setShowBackButton / setError -->
    <SectionCard title="setIsLoading() / setShowBackButton() / setError()">
      <div class="space-y-4">
        <div>
          <p class="mb-2 text-xs text-on-surface-muted">Toggle <code class="font-mono">isLoading</code>:</p>
          <div class="flex gap-2">
            <button
              class="rounded-lg bg-status-warning-text px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-status-warning-text active:scale-95 transition-all"
              @click="runSetIsLoading(true)"
            >
              setIsLoading(true)
            </button>
            <button
              class="rounded-lg bg-surface-secondary border border-border px-4 py-2 text-sm font-medium text-on-surface shadow-sm hover:bg-surface-muted active:scale-95 transition-all"
              @click="runSetIsLoading(false)"
            >
              setIsLoading(false)
            </button>
          </div>
        </div>
        <div>
          <p class="mb-2 text-xs text-on-surface-muted">Toggle <code class="font-mono">showBackButton</code>:</p>
          <div class="flex gap-2">
            <button
              class="rounded-lg bg-status-success-text px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all"
              @click="runSetShowBackButton(true)"
            >
              setShowBackButton(true)
            </button>
            <button
              class="rounded-lg bg-surface-secondary border border-border px-4 py-2 text-sm font-medium text-on-surface shadow-sm hover:bg-surface-muted active:scale-95 transition-all"
              @click="runSetShowBackButton(false)"
            >
              setShowBackButton(false)
            </button>
          </div>
        </div>
        <div>
          <p class="mb-2 text-xs text-on-surface-muted">Set <code class="font-mono">error</code> (leave blank to clear):</p>
          <div class="flex gap-2">
            <input
              v-model="errorInput"
              type="text"
              placeholder="Something went wrong (blank = null)"
              class="flex-1 rounded-lg border border-border-hover bg-surface-secondary px-3 py-2 text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <button
              class="rounded-lg bg-status-error-text px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-status-error-text active:scale-95 transition-all"
              @click="runSetError"
            >
              setError()
            </button>
          </div>
        </div>
      </div>
    </SectionCard>

    <!-- setCurrentStep -->
    <SectionCard title="setCurrentStep()">
      <p class="mb-3 text-xs text-on-surface-muted">
        Manually set the current flow step. Provide a <code class="font-mono">FlowStep</code>-shaped JSON object.
      </p>
      <textarea
        v-model="stepJson"
        rows="3"
        spellcheck="false"
        class="w-full rounded-lg border border-border-hover bg-surface-secondary px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-accent-500 mb-3"
      />
      <button
        class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all"
        @click="runSetCurrentStep"
      >
        setCurrentStep()
      </button>
      <p v-if="stepSetError" class="mt-2 text-xs text-status-error-text font-mono">{{ stepSetError }}</p>
    </SectionCard>

    <!-- addMessage / removeMessage / clearMessages -->
    <SectionCard title="addMessage() / removeMessage() / clearMessages()">
      <div class="space-y-4">
        <div>
          <p class="mb-2 text-xs text-on-surface-muted">Add a message:</p>
          <div class="flex flex-col gap-2">
            <div class="flex gap-2">
              <input
                v-model="msgText"
                type="text"
                placeholder="Message text"
                class="flex-1 rounded-lg border border-border-hover bg-surface-secondary px-3 py-2 text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <select
                v-model="msgType"
                class="rounded-lg border border-border-hover bg-surface-secondary px-3 py-2 text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option v-for="mt in msgTypes" :key="mt" :value="mt">{{ mt }}</option>
              </select>
            </div>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1.5 text-xs text-on-surface-secondary cursor-pointer">
                <input v-model="msgDismissible" type="checkbox" class="rounded" />
                dismissible
              </label>
              <button
                class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all disabled:opacity-50"
                :disabled="!msgText.trim()"
                @click="runAddMessage"
              >
                addMessage()
              </button>
            </div>
          </div>
        </div>
        <div>
          <p class="mb-2 text-xs text-on-surface-muted">Remove by ID:</p>
          <div class="flex gap-2">
            <input
              v-model="removeId"
              type="text"
              placeholder="message-id"
              class="flex-1 rounded-lg border border-border-hover bg-surface-secondary px-3 py-2 text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <button
              class="rounded-lg bg-surface-secondary border border-border px-4 py-2 text-sm font-medium text-on-surface shadow-sm hover:bg-surface-muted active:scale-95 transition-all disabled:opacity-50"
              :disabled="!removeId.trim()"
              @click="runRemoveMessage"
            >
              removeMessage()
            </button>
          </div>
        </div>
        <div>
          <p class="mb-2 text-xs text-on-surface-muted">Clear all messages at once:</p>
          <button
            class="rounded-lg bg-status-error-text px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-status-error-text active:scale-95 transition-all"
            @click="clearMessages()"
          >
            clearMessages()
          </button>
        </div>
      </div>
    </SectionCard>

    <!-- navigateToFlow -->
    <SectionCard title="navigateToFlow()">
      <p class="mb-3 text-xs text-on-surface-muted">
        Navigate to one of the supported flow types.
      </p>
      <div class="flex gap-2 mb-3">
        <select
          v-model="navigateTarget"
          class="rounded-lg border border-border-hover bg-surface-secondary px-3 py-2 text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-accent-500"
        >
          <option v-for="ft in flowTypes" :key="ft" :value="ft">{{ ft }}</option>
        </select>
        <button
          class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all"
          @click="runNavigate"
        >
          Navigate
        </button>
      </div>
      <ResultPanel :result="navigateResult" :error="navigateError" />
    </SectionCard>

    <!-- reset -->
    <SectionCard title="reset()">
      <p class="mb-3 text-xs text-on-surface-muted">
        Resets the current flow state back to the initial step.
      </p>
      <button
        class="rounded-lg bg-surface-secondary border border-border px-4 py-2 text-sm font-medium text-on-surface shadow-sm hover:bg-surface-muted active:scale-95 transition-all"
        @click="runReset"
      >
        reset()
      </button>
      <ResultPanel class="mt-3" :result="resetResult" :error="resetError" />
    </SectionCard>

  </div>
</template>