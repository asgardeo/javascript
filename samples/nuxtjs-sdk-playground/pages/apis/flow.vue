<script setup lang="ts">
import { ref } from 'vue';

const {
  currentStep,
  isLoading,
  error,
  messages,
  showBackButton,
  title,
  subtitle,
  navigateToFlow,
  reset,
  addMessage,
  clearMessages,
  removeMessage,
  setError,
  setIsLoading,
} = useFlow();

// ── navigateToFlow ─────────────────────────────────────────────────────────
type FlowType = 'signin' | 'signup' | 'organization-signin' | 'forgot-password' | 'reset-password' | 'verify-email' | 'mfa';

const selectedFlowType = ref<FlowType>('signin');
const flowTitle        = ref('Sign In');
const flowSubtitle     = ref('');

function runNavigateToFlow() {
  navigateToFlow(selectedFlowType.value, {
    title:    flowTitle.value || undefined,
    subtitle: flowSubtitle.value || undefined,
  });
}

// ── addMessage ─────────────────────────────────────────────────────────────
const msgText = ref('Hello from the flow!');
const msgType = ref<'success' | 'error' | 'warning' | 'info'>('info');

function runAddMessage() {
  addMessage({ message: msgText.value, type: msgType.value, id: Date.now().toString() });
}

// ── setError ───────────────────────────────────────────────────────────────
const errorText = ref('Something went wrong.');

function runSetError() {
  setError(errorText.value || null);
}

function runClearError() {
  setError(null);
}

// ── setIsLoading ───────────────────────────────────────────────────────────
function toggleLoading() {
  setIsLoading(!isLoading.value);
}

// ── Code snippet ───────────────────────────────────────────────────────────
const codeSnippet = `const {
  currentStep,
  isLoading,
  error,
  messages,
  title, subtitle,
  showBackButton,
  navigateToFlow,
  reset,
  addMessage,
  clearMessages,
  removeMessage,
  setError,
  setIsLoading,
} = useFlow();

// Navigate to a flow step
navigateToFlow('signin', { title: 'Sign In', subtitle: 'Welcome back' });
navigateToFlow('signup', { title: 'Create Account' });

// Manage messages
addMessage({ message: 'Success!', type: 'success', id: '1' });
clearMessages();
removeMessage('1');

// Reset the entire flow state
reset();`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="useFlow"
      description="Authentication flow UI state — currentStep, messages, navigateToFlow, addMessage, reset, and more."
    />

    <!-- ── Reactive State ───────────────────────────────────────────────── -->
    <LayoutSectionCard title="Reactive State">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-text-muted">Property</th>
              <th class="pb-2 font-medium text-text-muted">Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">currentStep</td>
              <td class="py-2 font-mono text-xs text-text">{{ currentStep ? JSON.stringify(currentStep) : 'null' }}</td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">title</td>
              <td class="py-2 font-mono text-xs text-text">{{ title }}</td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">subtitle</td>
              <td class="py-2 font-mono text-xs text-text">{{ subtitle ?? '—' }}</td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">isLoading</td>
              <td class="py-2">
                <SharedStatusBadge :status="isLoading ? 'warning' : 'neutral'" :label="String(isLoading)" />
              </td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">error</td>
              <td class="py-2 font-mono text-xs" :class="error ? 'text-danger' : 'text-text-muted'">{{ error ?? 'null' }}</td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">messages.length</td>
              <td class="py-2 font-mono text-xs text-text">{{ messages?.length ?? 0 }}</td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">showBackButton</td>
              <td class="py-2 font-mono text-xs text-text">{{ String(showBackButton) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── Messages viewer ─────────────────────────────────────────────── -->
    <LayoutSectionCard title="messages" description="Current flow messages queue. Use addMessage / clearMessages to manage.">
      <div v-if="messages && messages.length > 0" class="space-y-2 mb-3">
        <div
          v-for="msg in messages"
          :key="msg.id ?? msg.message"
          class="flex items-start justify-between rounded-md px-3 py-2 text-xs"
          :class="{
            'bg-success/10 text-success border border-success/20': msg.type === 'success',
            'bg-danger/10 text-danger border border-danger/20': msg.type === 'error',
            'bg-warning/10 text-warning border border-warning/20': msg.type === 'warning',
            'bg-accent-50 text-accent-600 border border-accent-100': msg.type === 'info',
          }"
        >
          <span>{{ msg.message }}</span>
          <button
            type="button"
            class="ml-2 opacity-60 hover:opacity-100 transition-opacity"
            @click="removeMessage(msg.id ?? msg.message)"
          >✕</button>
        </div>
      </div>
      <p v-else class="text-xs text-text-muted italic mb-3">No messages in queue.</p>
      <button
        class="text-xs px-3 py-1.5 rounded-md bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-colors"
        @click="clearMessages"
      >
        clearMessages()
      </button>
    </LayoutSectionCard>

    <!-- ── navigateToFlow ──────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="navigateToFlow()"
      description="Set the current flow step programmatically. Used to drive the embedded auth UI."
    >
      <div class="grid md:grid-cols-3 gap-3 mb-3">
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1">Flow type</label>
          <select
            v-model="selectedFlowType"
            class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500"
          >
            <option value="signin">signin</option>
            <option value="signup">signup</option>
            <option value="organization-signin">organization-signin</option>
            <option value="forgot-password">forgot-password</option>
            <option value="reset-password">reset-password</option>
            <option value="verify-email">verify-email</option>
            <option value="mfa">mfa</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1">Title</label>
          <input v-model="flowTitle" type="text" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1">Subtitle</label>
          <input v-model="flowSubtitle" type="text" placeholder="Optional" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500" />
        </div>
      </div>
      <button
        class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
        @click="runNavigateToFlow"
      >
        navigateToFlow()
      </button>
    </LayoutSectionCard>

    <!-- ── addMessage ──────────────────────────────────────────────────── -->
    <LayoutSectionCard title="addMessage()" description="Push a message into the flow messages queue.">
      <div class="grid md:grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1">Message</label>
          <input v-model="msgText" type="text" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1">Type</label>
          <select v-model="msgType" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500">
            <option value="success">success</option>
            <option value="error">error</option>
            <option value="warning">warning</option>
            <option value="info">info</option>
          </select>
        </div>
      </div>
      <button
        class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
        @click="runAddMessage"
      >
        addMessage()
      </button>
    </LayoutSectionCard>

    <!-- ── setError / setIsLoading / reset ─────────────────────────────── -->
    <LayoutSectionCard title="setError() / setIsLoading() / reset()">
      <div class="space-y-4">
        <div class="flex items-end gap-3">
          <div class="flex-1">
            <label class="block text-xs font-medium text-text-muted mb-1">Error message</label>
            <input v-model="errorText" type="text" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500" />
          </div>
          <button class="px-4 py-2 text-sm font-medium bg-danger/10 text-danger border border-danger/30 rounded-md hover:bg-danger/20 transition-colors" @click="runSetError">setError()</button>
          <button class="px-4 py-2 text-sm font-medium bg-surface border border-border text-text-muted rounded-md hover:bg-surface-muted transition-colors" @click="runClearError">Clear</button>
        </div>
        <div class="flex gap-3">
          <button class="px-4 py-2 text-sm font-medium bg-warning/10 text-warning border border-warning/30 rounded-md hover:bg-warning/20 transition-colors" @click="toggleLoading">
            setIsLoading({{ !isLoading }})
          </button>
          <button class="px-4 py-2 text-sm font-medium bg-surface border border-border text-text rounded-md hover:bg-surface-muted transition-colors" @click="reset">
            reset()
          </button>
        </div>
      </div>
    </LayoutSectionCard>

    <!-- ── Code ────────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
