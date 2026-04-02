<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@asgardeo/vue'
import ResultPanel from '../shared/ResultPanel.vue'
import SectionCard from '../layout/SectionCard.vue'

const { theme, colorScheme, direction, inheritFromBranding, isBrandingLoading, brandingError, toggleTheme } = useTheme()

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
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">colorScheme</td>
            <td class="py-2">
              <span
                :class="colorScheme === 'dark'
                  ? 'bg-code-header-bg text-code-header-text'
                  : 'bg-status-warning-bg text-status-warning-text'"
                class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
              >{{ colorScheme }}</span>
            </td>
          </tr>
          <tr>
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">direction</td>
            <td class="py-2">
              <span
                class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold bg-status-info-bg text-status-info-text"
              >{{ direction }}</span>
            </td>
          </tr>
          <tr>
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">inheritFromBranding</td>
            <td class="py-2">
              <span
                :class="inheritFromBranding
                  ? 'bg-status-success-bg text-status-success-text'
                  : 'bg-surface-muted text-on-surface-secondary'"
                class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
              >{{ inheritFromBranding }}</span>
            </td>
          </tr>
          <tr>
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">isBrandingLoading</td>
            <td class="py-2">
              <span
                :class="isBrandingLoading
                  ? 'bg-status-warning-bg text-status-warning-text'
                  : 'bg-surface-muted text-on-surface-secondary'"
                class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
              >{{ isBrandingLoading }}</span>
            </td>
          </tr>
          <tr>
            <td class="py-2 pr-6 font-mono text-xs text-on-surface-secondary">brandingError</td>
            <td class="py-2 font-mono text-xs" :class="brandingError ? 'text-status-error-text' : 'text-on-surface-muted italic'">
              {{ brandingError ? brandingError.message : 'null' }}
            </td>
          </tr>
        </tbody>
      </table>
    </SectionCard>

    <!-- theme snapshot -->
    <SectionCard title="theme">
      <p class="mb-3 text-xs text-on-surface-muted">
        The current resolved theme object (colors, typography, spacing). Derived from branding if
        <code class="font-mono">inheritFromBranding</code> is <code class="font-mono">true</code>.
      </p>
      <button
        class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all"
        @click="showTheme"
      >
        Show theme
      </button>
      <ResultPanel class="mt-3" :result="themeResult" />
    </SectionCard>

    <!-- toggleTheme -->
    <SectionCard title="toggleTheme()">
      <p class="mb-3 text-xs text-on-surface-muted">
        Toggles between <code class="font-mono">light</code> and <code class="font-mono">dark</code> color schemes.
        Current scheme: <strong class="font-semibold">{{ colorScheme }}</strong>.
      </p>
      <button
        class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-on-surface-inverse shadow-sm hover:bg-accent-700 active:scale-95 transition-all"
        @click="toggleTheme()"
      >
        Toggle to {{ colorScheme === 'light' ? 'dark' : 'light' }} mode
      </button>
    </SectionCard>

  </div>
</template>
