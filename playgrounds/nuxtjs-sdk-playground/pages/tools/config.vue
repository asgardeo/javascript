<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useThemeMode } from '~/composables/useThemeMode';
import { OVERRIDE_KEYS, readOverride, writeOverride, clearOverride } from '~/utils/playground-overrides';

// ── Types ──────────────────────────────────────────────────────────────────

interface FieldMeta {
  description: string;
  howToChange: string;
  secret?: boolean;
}

// ── Build-time config ──────────────────────────────────────────────────────

const runtimeCfg = useRuntimeConfig();
// Cast to a known shape; the SDK filters out server-side secrets from
// public runtime config automatically.
const pub = runtimeCfg.public.asgardeo as Record<string, unknown>;

/** Metadata for well-known fields. Fields not in this map will still show but
 *  without a description or howToChange hint. */
const FIELD_META: Record<string, FieldMeta> = {
  baseUrl:         { description: 'Asgardeo tenant base URL.',                               howToChange: 'Set NUXT_PUBLIC_ASGARDEO_BASE_URL and restart.' },
  clientId:        { description: 'OAuth2 client (application) ID.',                          howToChange: 'Set NUXT_PUBLIC_ASGARDEO_CLIENT_ID and restart.' },
  applicationId:   { description: 'Application ID appended to the sign-up URL.',              howToChange: 'Set NUXT_PUBLIC_ASGARDEO_APPLICATION_ID and restart.' },
  signInUrl:       { description: 'Optional override for the hosted sign-in URL.',            howToChange: 'Set NUXT_PUBLIC_ASGARDEO_SIGN_IN_URL and restart.' },
  signUpUrl:       { description: 'Optional override for the hosted sign-up URL.',            howToChange: 'Set NUXT_PUBLIC_ASGARDEO_SIGN_UP_URL and restart.' },
  afterSignInUrl:  { description: 'URL to redirect to after a successful sign-in.',           howToChange: 'Set NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_IN_URL and restart.' },
  afterSignOutUrl: { description: 'URL to redirect to after sign-out.',                       howToChange: 'Set NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_OUT_URL and restart.' },
  scopes:          { description: 'OAuth2 scopes requested during sign-in.',                  howToChange: 'Update asgardeo.scopes in nuxt.config.ts and restart.' },
  preferences:     { description: 'Server-side feature flags — fetching profile, orgs, etc.', howToChange: 'Update asgardeo.preferences in nuxt.config.ts and restart.' },
};

/** Flatten the top-level public config into rows for the table. */
const configRows = computed(() => {
  const rows: Array<{ key: string; value: unknown; meta: FieldMeta | undefined }> = [];
  for (const [key, value] of Object.entries(pub ?? {})) {
    rows.push({ key, value, meta: FIELD_META[key] });
  }
  return rows;
});

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '<not set>';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

// ── Section 2 — Runtime overrides ─────────────────────────────────────────

// Playground UI theme (light/dark)
const { mode: playgroundMode, setMode: setPlaygroundMode } = useThemeMode();

function handleModeChange(newMode: 'light' | 'dark') {
  setPlaygroundMode(newMode);
}

function resetMode() {
  clearOverride(OVERRIDE_KEYS.THEME_MODE);
  clearOverride(OVERRIDE_KEYS.THEME_PALETTE);
  // Hard reload so the default theme is re-applied cleanly.
  window.location.reload();
}

// i18n locale
// useAsgardeoI18n is auto-imported by @asgardeo/nuxt (re-exported from @asgardeo/vue)
const i18n = useAsgardeoI18n();
const currentLocale = computed(() => i18n.currentLanguage.value);

const availableLocales = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'fr-FR', label: 'French (FR)' },
  { code: 'de-DE', label: 'German (DE)' },
  { code: 'ja-JP', label: 'Japanese (JP)' },
];

function handleLocaleChange(locale: string) {
  i18n.setLanguage(locale);
  writeOverride(OVERRIDE_KEYS.I18N_LOCALE, locale);
}

function resetLocale() {
  clearOverride(OVERRIDE_KEYS.I18N_LOCALE);
  // Reload so I18nProvider re-reads its own stored preference.
  window.location.reload();
}

// Restore i18n locale from our override key on mount (supplements the
// I18nProvider's own cookie restore in case the stored values differ).
onMounted(() => {
  const saved = readOverride(OVERRIDE_KEYS.I18N_LOCALE);
  if (saved && saved !== currentLocale.value) {
    i18n.setLanguage(saved);
  }
});

// ── Section 3 — .env snippet ───────────────────────────────────────────────

const ENV_VAR_MAP: Record<string, string> = {
  baseUrl:         'NUXT_PUBLIC_ASGARDEO_BASE_URL',
  clientId:        'NUXT_PUBLIC_ASGARDEO_CLIENT_ID',
  applicationId:   'NUXT_PUBLIC_ASGARDEO_APPLICATION_ID',
  signInUrl:       'NUXT_PUBLIC_ASGARDEO_SIGN_IN_URL',
  signUpUrl:       'NUXT_PUBLIC_ASGARDEO_SIGN_UP_URL',
  afterSignInUrl:  'NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_IN_URL',
  afterSignOutUrl: 'NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_OUT_URL',
};

const envSnippet = computed(() => {
  const lines: string[] = [];
  for (const [key, envName] of Object.entries(ENV_VAR_MAP)) {
    const value = pub?.[key];
    const isSet = value !== null && value !== undefined && value !== '';
    lines.push(`${envName}=${isSet ? String(value) : ''}`);
  }
  lines.push('');
  lines.push('# Server-only secrets — never displayed in the UI:');
  lines.push('# ASGARDEO_CLIENT_SECRET=<your client secret>');
  lines.push('# ASGARDEO_SESSION_SECRET=<your session secret — at least 32 characters>');
  return lines.join('\n');
});

const envCopied = ref(false);
async function copyEnv() {
  await navigator.clipboard.writeText(envSnippet.value);
  envCopied.value = true;
  setTimeout(() => { envCopied.value = false; }, 2000);
}
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Config inspector"
      description="What @asgardeo/nuxt is running with right now. Build-time fields are read-only; a small live-editable section lets you adjust playground-only overrides."
    />

    <!-- ── Section 1 — Build-time config ──────────────────────────────── -->
    <LayoutSectionCard
      title="Build-time config"
      description="Read from useRuntimeConfig().public.asgardeo. These values are set at build/start time and cannot be changed without a restart."
    >
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-surface-muted border-b border-border">
            <tr>
              <th class="text-left px-3 py-2 font-semibold text-text-muted uppercase tracking-wide w-1/5">Key</th>
              <th class="text-left px-3 py-2 font-semibold text-text-muted uppercase tracking-wide w-2/5">Value</th>
              <th class="text-left px-3 py-2 font-semibold text-text-muted uppercase tracking-wide">How to change</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in configRows"
              :key="row.key"
              class="border-b border-border last:border-0 hover:bg-surface-muted/40 transition-colors align-top"
            >
              <td class="px-3 py-2.5">
                <code class="font-mono text-accent-600">{{ row.key }}</code>
                <p v-if="row.meta?.description" class="text-text-muted mt-0.5 text-xs leading-relaxed">{{ row.meta.description }}</p>
              </td>
              <td class="px-3 py-2.5">
                <pre class="font-mono text-text whitespace-pre-wrap break-all">{{ formatValue(row.value) }}</pre>
              </td>
              <td class="px-3 py-2.5 text-text-muted leading-relaxed">{{ row.meta?.howToChange ?? 'Update nuxt.config.ts and restart.' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── Section 2 — Runtime overrides ──────────────────────────────── -->
    <LayoutSectionCard
      title="Runtime overrides"
      description="These overrides are stored in localStorage and apply only in this playground tab. They don't change nuxt.config.ts or .env."
    >
      <!-- Banner -->
      <div class="mb-5 rounded-lg border border-accent-500/30 bg-accent-500/5 px-4 py-3 text-xs text-text-muted leading-relaxed">
        Changes here affect only this browser tab. To make a permanent change, update
        <code class="font-mono">nuxt.config.ts</code> (or your <code class="font-mono">.env</code>) and restart the dev server.
      </div>

      <div class="space-y-5">
        <!-- Playground UI mode (light / dark) -->
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p class="text-sm font-medium text-text">Playground UI mode</p>
            <p class="text-xs text-text-muted mt-0.5">Light or dark color scheme for the playground itself.</p>
          </div>
          <div class="flex items-center gap-2">
            <select
              :value="playgroundMode"
              class="rounded-md border border-border bg-surface text-text text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-500"
              @change="handleModeChange(($event.target as HTMLSelectElement).value as 'light' | 'dark')"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <button
              type="button"
              class="text-xs text-text-muted hover:text-text transition-colors border border-border rounded px-2 py-1.5"
              @click="resetMode"
            >
              Reset
            </button>
          </div>
        </div>

        <hr class="border-border" />

        <!-- i18n locale -->
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p class="text-sm font-medium text-text">i18n locale</p>
            <p class="text-xs text-text-muted mt-0.5">
              Active language for SDK UI components. Applied via <code class="font-mono">useAsgardeoI18n().setLanguage()</code>.
              Persists across reloads via the I18nProvider's own cookie.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <select
              :value="currentLocale"
              class="rounded-md border border-border bg-surface text-text text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-500"
              @change="handleLocaleChange(($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="locale in availableLocales"
                :key="locale.code"
                :value="locale.code"
              >
                {{ locale.label }}
              </option>
            </select>
            <button
              type="button"
              class="text-xs text-text-muted hover:text-text transition-colors border border-border rounded px-2 py-1.5"
              @click="resetLocale"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </LayoutSectionCard>

    <!-- ── Section 3 — .env snippet ───────────────────────────────────── -->
    <LayoutSectionCard
      title="Generate .env snippet"
      description="Current effective values formatted for a .env file. Copy and adjust, then restart the dev server."
    >
      <div class="rounded-lg overflow-hidden border border-border">
        <!-- Header bar -->
        <div class="flex items-center justify-between bg-code-header-bg text-code-header-text text-xs px-4 py-2">
          <span class="font-mono">.env</span>
          <button
            type="button"
            class="hover:text-code-text transition-colors"
            @click="copyEnv"
          >
            {{ envCopied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <!-- Code body -->
        <pre class="bg-code-bg text-code-text p-4 font-mono text-sm overflow-x-auto leading-relaxed whitespace-pre"><code>{{ envSnippet }}</code></pre>
      </div>
    </LayoutSectionCard>
  </div>
</template>
