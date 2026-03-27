<script setup lang="ts">
import { ref } from 'vue'
import { useFlowMeta } from '@asgardeo/vue'
import ResultPanel from '../../components/shared/ResultPanel.vue'
import SectionCard from '../../components/layout/SectionCard.vue'

const { meta, isLoading, error, fetchFlowMeta, switchLanguage } = useFlowMeta()

// fetchFlowMeta
const fetchResult = ref<string | null>(null)
const fetchError = ref<string | null>(null)
const fetchLoading = ref(false)

async function runFetchFlowMeta() {
  fetchLoading.value = true
  fetchError.value = null
  fetchResult.value = null
  try {
    await fetchFlowMeta()
    fetchResult.value = 'Flow metadata fetched successfully.'
  } catch (e: unknown) {
    fetchError.value = e instanceof Error ? e.message : String(e)
  } finally {
    fetchLoading.value = false
  }
}

// switchLanguage
const langTarget = ref('')
const langResult = ref<string | null>(null)
const langError = ref<string | null>(null)
const langLoading = ref(false)

async function runSwitchLanguage() {
  if (!langTarget.value.trim()) return
  langLoading.value = true
  langError.value = null
  langResult.value = null
  try {
    await switchLanguage(langTarget.value.trim())
    langResult.value = `Language switched to "${langTarget.value.trim()}".`
  } catch (e: unknown) {
    langError.value = e instanceof Error ? e.message : String(e)
  } finally {
    langLoading.value = false
  }
}

// meta snapshot
const metaResult = ref<unknown>(null)
function showMeta() { metaResult.value = meta.value }
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
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">error</td>
            <td class="py-2 font-mono text-xs" :class="error ? 'text-status-error-text' : 'text-on-surface-muted italic'">
              {{ error ? error.message : 'null' }}
            </td>
          </tr>
        </tbody>
      </table>
    </SectionCard>

    <!-- fetchFlowMeta -->
    <SectionCard title="fetchFlowMeta()">
      <p class="mb-3 text-xs text-on-surface-muted">
        Fetches flow metadata from the server and populates <code class="font-mono">meta</code>.
      </p>
      <button
        class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all disabled:opacity-50"
        :disabled="fetchLoading"
        @click="runFetchFlowMeta"
      >
        {{ fetchLoading ? 'Fetching…' : 'fetchFlowMeta()' }}
      </button>
      <ResultPanel class="mt-3" :result="fetchResult" :error="fetchError" :loading="fetchLoading" />
    </SectionCard>

    <!-- meta -->
    <SectionCard title="meta">
      <p class="mb-3 text-xs text-on-surface-muted">
        Flow metadata including locale, available languages, and flow configuration.
      </p>
      <button
        class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all"
        @click="showMeta"
      >
        Show meta
      </button>
      <ResultPanel class="mt-3" :result="metaResult" />
    </SectionCard>

    <!-- switchLanguage -->
    <SectionCard title="switchLanguage()">
      <p class="mb-3 text-xs text-on-surface-muted">
        Switches the flow UI to a different locale (e.g. <code class="font-mono">en-US</code>, <code class="font-mono">fr-FR</code>).
      </p>
      <div class="flex gap-2 mb-3">
        <input
          v-model="langTarget"
          type="text"
          placeholder="en-US"
          class="flex-1 rounded-lg border border-border-hover bg-surface-secondary px-3 py-2 text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <button
          class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all disabled:opacity-50"
          :disabled="langLoading || !langTarget.trim()"
          @click="runSwitchLanguage"
        >
          {{ langLoading ? 'Switching…' : 'switchLanguage()' }}
        </button>
      </div>
      <ResultPanel :result="langResult" :error="langError" :loading="langLoading" />
    </SectionCard>

  </div>
</template>
