<script setup lang="ts">
import { ref } from 'vue'
import { useBranding } from '@asgardeo/vue'
import ResultPanel from '../../components/shared/ResultPanel.vue'
import SectionCard from '../../components/layout/SectionCard.vue'

const { brandingPreference, theme, isLoading, error, activeTheme, fetchBranding, refetch } = useBranding()

// fetchBranding (deduplicated)
const fetchResult = ref<string | null>(null)
const fetchError = ref<string | null>(null)
const fetchBrandingLoading = ref(false)

async function runFetchBranding() {
  fetchBrandingLoading.value = true
  fetchError.value = null
  fetchResult.value = null
  try {
    await fetchBranding()
    fetchResult.value = 'Branding fetched (deduplicated — skipped if already in-flight).'
  } catch (e: unknown) {
    fetchError.value = e instanceof Error ? e.message : String(e)
  } finally {
    fetchBrandingLoading.value = false
  }
}

// refetch (force-fresh)
const refetchResult = ref<string | null>(null)
const refetchError = ref<string | null>(null)
const refetchLoading = ref(false)

async function runRefetch() {
  refetchLoading.value = true
  refetchError.value = null
  refetchResult.value = null
  try {
    await refetch()
    refetchResult.value = 'Branding force-refetched (bypasses deduplication).'
  } catch (e: unknown) {
    refetchError.value = e instanceof Error ? e.message : String(e)
  } finally {
    refetchLoading.value = false
  }
}

// snapshots
const prefResult = ref<unknown>(null)
function showPreference() { prefResult.value = brandingPreference.value }

const themeResult = ref<unknown>(null)
function showTheme() { themeResult.value = theme.value }
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
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">activeTheme</td>
            <td class="py-2">
              <span
                v-if="activeTheme"
                :class="activeTheme === 'dark'
                  ? 'bg-code-header-bg text-code-header-text'
                  : 'bg-status-warning-bg text-status-warning-text'"
                class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
              >{{ activeTheme }}</span>
              <span v-else class="font-mono text-xs text-on-surface-muted italic">null</span>
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

    <!-- fetchBranding -->
    <SectionCard title="fetchBranding()">
      <p class="mb-3 text-xs text-on-surface-muted">
        Fetches branding preferences from the server. Deduplicated — concurrent calls share the same
        request. Use <code class="font-mono">refetch()</code> to force a fresh request.
      </p>
      <button
        class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all disabled:opacity-50"
        :disabled="fetchBrandingLoading"
        @click="runFetchBranding"
      >
        {{ fetchBrandingLoading ? 'Fetching…' : 'fetchBranding()' }}
      </button>
      <ResultPanel class="mt-3" :result="fetchResult" :error="fetchError" :loading="fetchBrandingLoading" />
    </SectionCard>

    <!-- refetch -->
    <SectionCard title="refetch()">
      <p class="mb-3 text-xs text-on-surface-muted">
        Forces a fresh branding fetch from the server, bypassing the deduplication guard in
        <code class="font-mono">fetchBranding()</code>.
      </p>
      <button
        class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all disabled:opacity-50"
        :disabled="refetchLoading"
        @click="runRefetch"
      >
        {{ refetchLoading ? 'Refetching…' : 'refetch()' }}
      </button>
      <ResultPanel class="mt-3" :result="refetchResult" :error="refetchError" :loading="refetchLoading" />
    </SectionCard>

    <!-- brandingPreference -->
    <SectionCard title="brandingPreference">
      <p class="mb-3 text-xs text-on-surface-muted">
        The current branding preference object including logo URLs, color palette, and layout settings.
        Run <code class="font-mono">fetchBranding()</code> first to populate it.
      </p>
      <button
        class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all"
        @click="showPreference"
      >
        Show brandingPreference
      </button>
      <ResultPanel class="mt-3" :result="prefResult" />
    </SectionCard>

    <!-- theme (branding-derived) -->
    <SectionCard title="theme (branding-derived)">
      <p class="mb-3 text-xs text-on-surface-muted">
        The resolved theme object derived from branding preferences.
      </p>
      <button
        class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all"
        @click="showTheme"
      >
        Show theme
      </button>
      <ResultPanel class="mt-3" :result="themeResult" />
    </SectionCard>

  </div>
</template>
