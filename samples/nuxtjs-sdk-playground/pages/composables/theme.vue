<script setup lang="ts">
const {
  colorScheme,
  direction,
  inheritFromBranding,
  isBrandingLoading,
  brandingError,
  theme,
  toggleTheme,
} = useTheme();

const codeSnippet = `const {
  colorScheme,     // 'light' | 'dark'
  direction,       // 'ltr' | 'rtl'
  inheritFromBranding,
  isBrandingLoading,
  brandingError,
  theme,           // full Theme object
  toggleTheme,     // () => void
} = useTheme();

// Toggle between light and dark
toggleTheme();

// Read the current color scheme
console.log(colorScheme.value); // 'light' or 'dark'`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="useTheme"
      description="Access and control the active color scheme, direction, and resolved Theme object applied to Asgardeo components."
    />
    <div class="flex items-center gap-2 -mt-2">
      <SharedStatusBadge status="info" label="Auto-imported" />
      <span class="text-xs text-text-muted">from <code class="font-mono">@asgardeo/nuxt</code></span>
    </div>

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
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">colorScheme</td>
              <td class="py-2">
                <SharedStatusBadge
                  :status="colorScheme === 'dark' ? 'info' : 'neutral'"
                  :label="colorScheme"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">direction</td>
              <td class="py-2 font-mono text-xs text-text">{{ direction }}</td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">inheritFromBranding</td>
              <td class="py-2 font-mono text-xs text-text">{{ String(inheritFromBranding) }}</td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">isBrandingLoading</td>
              <td class="py-2">
                <SharedStatusBadge :status="isBrandingLoading ? 'warning' : 'neutral'" :label="String(isBrandingLoading)" />
              </td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">brandingError</td>
              <td class="py-2 font-mono text-xs" :class="brandingError ? 'text-danger' : 'text-text-muted'">
                {{ brandingError ? (brandingError as Error).message : 'null' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── toggleTheme ─────────────────────────────────────────────────── -->
    <LayoutSectionCard title="toggleTheme()" description="Switch between light and dark color schemes.">
      <div class="flex items-center gap-4">
        <button
          class="px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
          @click="toggleTheme"
        >
          toggleTheme()
        </button>
        <span class="text-sm text-text-muted">
          Current: <span class="font-medium text-text">{{ colorScheme }}</span>
        </span>
      </div>
    </LayoutSectionCard>

    <!-- ── Theme object ────────────────────────────────────────────────── -->
    <LayoutSectionCard title="theme" description="The full resolved Theme object currently applied." :collapsible="true">
      <SharedResultPanel :result="theme" />
    </LayoutSectionCard>

    <!-- ── Visual preview ─────────────────────────────────────────────── -->
    <LayoutSectionCard title="Live Preview" description="How the current theme scheme looks on Asgardeo components.">
      <div class="flex flex-wrap items-center gap-4">
        <AsgardeoSignIn v-if="false" />
        <div class="rounded-lg border border-border bg-surface p-4 text-sm text-text space-y-2">
          <p class="font-medium">Sample Surface</p>
          <p class="text-text-muted text-xs">colorScheme: <span class="font-mono">{{ colorScheme }}</span></p>
          <div class="flex gap-2 flex-wrap">
            <span class="inline-block px-2 py-1 rounded text-xs bg-accent-600 text-accent-foreground">Accent</span>
            <span class="inline-block px-2 py-1 rounded text-xs bg-surface-muted text-text-muted border border-border">Muted</span>
            <span class="inline-block px-2 py-1 rounded text-xs text-success">Success</span>
            <span class="inline-block px-2 py-1 rounded text-xs text-danger">Danger</span>
            <span class="inline-block px-2 py-1 rounded text-xs text-warning">Warning</span>
          </div>
        </div>
        <SharedThemeSwitcher />
      </div>
    </LayoutSectionCard>

    <!-- ── Code ────────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
