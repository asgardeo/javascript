<script setup lang="ts">
// ── Read current preferences from runtime config ──────────────────────────
// These are baked in at build time from nuxt.config.ts and are safe to
// expose — secrets (clientSecret, sessionSecret) are filtered out by the SDK.
const config = useRuntimeConfig();
const pub = config.public.asgardeo as {
  baseUrl?: string;
  clientId?: string;
  afterSignInUrl?: string;
  afterSignOutUrl?: string;
  scopes?: string[];
  preferences?: {
    user?: { fetchUserProfile?: boolean; fetchOrganizations?: boolean };
    theme?: { inheritFromBranding?: boolean; mode?: string };
    i18n?: unknown;
  };
};
const prefs = pub.preferences ?? {};

// ── Preference flag definitions ───────────────────────────────────────────
const prefFlags = computed(() => [
  {
    flag: 'preferences.user.fetchUserProfile',
    current: prefs.user?.fetchUserProfile !== false,
    default: true,
    description: 'Fetch the full SCIM2 user profile during SSR. Populates asgardeo:user-profile.',
    impact: 'Disabling saves one SCIM2 API call per SSR request. The useUser() composable will return a partial object derived from the ID token only.',
  },
  {
    flag: 'preferences.user.fetchOrganizations',
    current: prefs.user?.fetchOrganizations !== false,
    default: true,
    description: "Fetch the user's organizations during SSR. Populates asgardeo:my-orgs.",
    impact: 'Disabling saves one /my-orgs API call per SSR request. The useOrganization() composable will not receive a pre-populated org list.',
  },
  {
    flag: 'preferences.theme.inheritFromBranding',
    current: prefs.theme?.inheritFromBranding === true,
    default: false,
    description: 'Fetch the tenant branding preference during SSR. Populates asgardeo:branding and passes it to BrandingProvider / ThemeProvider.',
    impact: 'Enabling adds one branding API call per SSR request but allows components like AsgardeoSignInButton to inherit the tenant color scheme automatically.',
  },
]);

const themeModeValue = computed(() => prefs.theme?.mode ?? 'light');

const themeModeDocs: Record<string, string> = {
  light:    'Fixed light color scheme.',
  dark:     'Fixed dark color scheme.',
  system:   'Follows OS prefers-color-scheme media query.',
  class:    'Reads a CSS class on <html> — works well with Tailwind dark-mode.',
  branding: 'Follows the active theme from the tenant branding preference.',
};

const codeSnippet = `// nuxt.config.ts — all available preferences
export default defineNuxtConfig({
  asgardeo: {
    // ... baseUrl, clientId, etc.
    preferences: {
      user: {
        fetchUserProfile: true,   // default: true  — fetch SCIM2 profile on SSR
        fetchOrganizations: true, // default: true  — fetch org list on SSR
      },
      theme: {
        inheritFromBranding: false, // default: false — fetch tenant branding on SSR
        mode: 'light',              // 'light' | 'dark' | 'system' | 'class' | 'branding'
      },
      i18n: {
        // I18nPreferences forwarded to I18nProvider
      },
    },
  },
});

// ── Reading preferences at runtime (client or server) ─────────────────────
// useRuntimeConfig is auto-imported by Nuxt.
const config = useRuntimeConfig();
const preferences = config.public.asgardeo.preferences;`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Preferences"
      description="Feature-gating flags that control which server-side data the Nitro plugin fetches on every SSR request. Set in nuxt.config.ts under asgardeo.preferences."
    />

    <!-- ── Current values summary ─────────────────────────────────────── -->
    <LayoutSectionCard
      title="Active configuration"
      description="Values read from useRuntimeConfig().public.asgardeo.preferences at runtime."
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-4 font-medium text-text-muted">Flag</th>
              <th class="pb-2 pr-4 font-medium text-text-muted">Default</th>
              <th class="pb-2 font-medium text-text-muted">Current</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-xs">
            <tr v-for="pref in prefFlags" :key="pref.flag">
              <td class="py-3 pr-4 font-mono text-text">{{ pref.flag }}</td>
              <td class="py-3 pr-4 text-text-muted">{{ pref.default }}</td>
              <td class="py-3 pr-4">
                <SharedStatusBadge
                  :status="pref.current ? 'success' : 'neutral'"
                  :label="String(pref.current)"
                />
              </td>
            </tr>
            <tr>
              <td class="py-3 pr-4 font-mono text-text">preferences.theme.mode</td>
              <td class="py-3 pr-4 text-text-muted">'light'</td>
              <td class="py-3 pr-4">
                <SharedStatusBadge status="info" :label="themeModeValue" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── Per-preference cards ───────────────────────────────────────── -->
    <LayoutSectionCard
      v-for="pref in prefFlags"
      :key="pref.flag"
      :title="pref.flag"
      :description="pref.description"
      :collapsible="true"
    >
      <div class="space-y-4">
        <!-- Current state -->
        <div class="grid grid-cols-1 gap-4 text-sm">
          <div>
            <p class="text-xs text-text-muted mb-1">Preference enabled</p>
            <SharedStatusBadge
              :status="pref.current ? 'success' : 'neutral'"
              :label="pref.current ? 'true (enabled)' : 'false (disabled)'"
            />
          </div>
        </div>

        <!-- Impact note -->
        <div class="rounded-md border border-border bg-surface-code px-4 py-3 text-xs text-text-muted leading-relaxed">
          <strong class="text-text">Impact when disabled:</strong>
          {{ pref.impact }}
        </div>
      </div>
    </LayoutSectionCard>

    <!-- ── Theme mode explainer ───────────────────────────────────────── -->
    <LayoutSectionCard title="preferences.theme.mode" description="Controls how ThemeProvider determines light/dark mode." :collapsible="true">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border text-left">
              <th class="pb-2 pr-6 font-medium text-text-muted">Mode</th>
              <th class="pb-2 font-medium text-text-muted">Behaviour</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-xs">
            <tr v-for="[mode, desc] in Object.entries(themeModeDocs)" :key="mode">
              <td class="py-2 pr-6">
                <span class="font-mono text-text" :class="{ 'text-accent-600 font-semibold': mode === themeModeValue }">
                  '{{ mode }}'{{ mode === themeModeValue ? ' ← active' : '' }}
                </span>
              </td>
              <td class="py-2 text-text-muted">{{ desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── Code ──────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
