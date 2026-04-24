<script setup lang="ts">
import { ref, computed } from 'vue';

const {
  bundles,
  currentLanguage,
  fallbackLanguage,
  setLanguage,
  injectBundles,
  t,
} = useAsgardeoI18n();

// ── setLanguage ────────────────────────────────────────────────────────────
const languages = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'fr-FR', label: 'French (FR)' },
  { code: 'de-DE', label: 'German (DE)' },
  { code: 'ja-JP', label: 'Japanese (JP)' },
];

// ── t() tester ─────────────────────────────────────────────────────────────
const tKey     = ref('signin.title');
const tParams  = ref('');
const tResult  = ref<string | null>(null);
const tError   = ref<string | null>(null);

function runT() {
  tResult.value = null;
  tError.value  = null;
  try {
    let params: Record<string, string | number> | undefined;
    if (tParams.value.trim()) {
      params = JSON.parse(tParams.value);
    }
    tResult.value = t(tKey.value, params);
  } catch (err) {
    tError.value = err instanceof Error ? err.message : String(err);
  }
}

// ── injectBundles ──────────────────────────────────────────────────────────
const injectJson   = ref(`{
  "en-US": {
    "demo.greeting": "Hello, {name}!",
    "demo.farewell": "Goodbye!"
  }
}`);
const injectResult = ref<unknown>(null);
const injectError  = ref<string | null>(null);

function runInjectBundles() {
  injectResult.value = null;
  injectError.value  = null;
  try {
    const parsed = JSON.parse(injectJson.value);
    injectBundles(parsed);
    injectResult.value = { success: true, injectedKeys: Object.keys(parsed) };
  } catch (err) {
    injectError.value = err instanceof Error ? err.message : String(err);
  }
}

// ── bundles summary ────────────────────────────────────────────────────────
const bundleSummary = computed(() => {
  if (!bundles.value) return null;
  return Object.fromEntries(
    Object.entries(bundles.value as Record<string, unknown>).map(([lang, bundle]) => [
      lang,
      { keys: Object.keys(bundle as Record<string, unknown>).length },
    ])
  );
});

const codeSnippet = `const {
  bundles,          // Readonly<Ref<Record<string, I18nBundle>>>
  currentLanguage,  // Readonly<Ref<string>>
  fallbackLanguage, // string
  setLanguage,      // (language: string) => void
  injectBundles,    // (bundles: Record<string, I18nBundle>) => void
  t,                // (key: string, params?) => string
} = useAsgardeoI18n();

// Switch the active language
setLanguage('fr-FR');

// Translate a key
const label = t('signin.title');
const greeting = t('demo.greeting', { name: 'Alice' });

// Inject custom translation bundles
injectBundles({
  'en-US': { 'demo.greeting': 'Hello, {name}!' },
  'fr-FR': { 'demo.greeting': 'Bonjour, {name}!' },
});`;
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="useAsgardeoI18n"
      description="Access internationalization utilities — translate keys, switch languages, and inject custom bundles."
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
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">currentLanguage</td>
              <td class="py-2">
                <SharedStatusBadge status="info" :label="currentLanguage" />
              </td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">fallbackLanguage</td>
              <td class="py-2 font-mono text-xs text-text">{{ fallbackLanguage }}</td>
            </tr>
            <tr>
              <td class="py-2 pr-6 font-mono text-xs text-text-muted">bundles (loaded)</td>
              <td class="py-2 font-mono text-xs text-text">
                {{ bundles ? Object.keys(bundles as Record<string, unknown>).length : 0 }} language(s)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </LayoutSectionCard>

    <!-- ── setLanguage ────────────────────────────────────────────────── -->
    <LayoutSectionCard title="setLanguage()" description="Switch the active language. Affects all calls to t().">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="lang in languages"
          :key="lang.code"
          class="px-4 py-2 text-sm font-medium rounded-md border transition-colors"
          :class="currentLanguage === lang.code
            ? 'bg-accent-600 text-accent-foreground border-accent-600'
            : 'bg-surface text-text border-border hover:bg-surface-muted'"
          @click="setLanguage(lang.code)"
        >
          {{ lang.label }}
        </button>
      </div>
    </LayoutSectionCard>

    <!-- ── t() tester ─────────────────────────────────────────────────── -->
    <LayoutSectionCard title="t()" description="Translate a key with optional interpolation parameters.">
      <div class="grid md:grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1">Translation key</label>
          <input
            v-model="tKey"
            type="text"
            placeholder="e.g. signin.title"
            class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1">Params (JSON, optional)</label>
          <input
            v-model="tParams"
            type="text"
            placeholder='{"name": "Alice"}'
            class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>
      </div>
      <button
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
        @click="runT"
      >
        t()
      </button>
      <div v-if="tResult !== null" class="rounded-md bg-surface-muted border border-border px-4 py-3 font-mono text-sm text-text">
        {{ tResult }}
      </div>
      <SharedResultPanel v-if="tError" :error="tError" />
    </LayoutSectionCard>

    <!-- ── injectBundles ──────────────────────────────────────────────── -->
    <LayoutSectionCard
      title="injectBundles()"
      description="Merge custom translation bundles into the i18n registry. Existing keys are preserved."
    >
      <div class="mb-3">
        <label class="block text-xs font-medium text-text-muted mb-1">Bundles JSON</label>
        <textarea
          v-model="injectJson"
          rows="8"
          class="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>
      <button
        class="mb-4 px-4 py-2 text-sm font-medium bg-accent-600 text-accent-foreground rounded-md hover:bg-accent-700 transition-colors"
        @click="runInjectBundles"
      >
        injectBundles()
      </button>
      <SharedResultPanel :result="injectResult" :error="injectError" />
    </LayoutSectionCard>

    <!-- ── Bundles viewer ─────────────────────────────────────────────── -->
    <LayoutSectionCard title="bundles" description="All currently registered translation bundles (key counts per language)." :collapsible="true">
      <SharedResultPanel :result="bundleSummary" />
    </LayoutSectionCard>

    <!-- ── Code ────────────────────────────────────────────────────────── -->
    <LayoutCodeBlock :code="codeSnippet" language="ts" />
  </div>
</template>
