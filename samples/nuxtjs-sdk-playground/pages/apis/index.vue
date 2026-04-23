<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Public APIs"
      description="Interactive playground for every composable auto-imported by @asgardeo/nuxt. Click a card to explore."
    />

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <NuxtLink
        v-for="item in apis"
        :key="item.to"
        :to="item.to"
        class="group block rounded-lg border border-border bg-surface p-5 shadow-sm hover:border-accent-500 hover:shadow-md transition-all"
      >
        <div class="flex items-start justify-between mb-2">
          <code class="text-sm font-mono font-semibold text-accent-600">{{ item.name }}</code>
          <span class="text-xs px-2 py-0.5 rounded-full bg-surface-muted text-text-muted border border-border">
            {{ item.count }} {{ item.count === 1 ? 'method' : 'methods' }}
          </span>
        </div>
        <p class="text-xs text-text-muted leading-relaxed">{{ item.description }}</p>
        <p class="mt-3 text-xs font-medium text-accent-600 group-hover:underline">Explore →</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const apis = [
  {
    to: '/apis/asgardeo',
    name: 'useAsgardeo',
    count: 8,
    description: 'Core auth state: isSignedIn, isLoading, isInitialized, signIn/Out/Up, token getters, http client.',
  },
  {
    to: '/apis/user',
    name: 'useUser',
    count: 4,
    description: 'User profile data: profile, flattenedProfile, schemas, updateProfile, revalidateProfile.',
  },
  {
    to: '/apis/organization',
    name: 'useOrganization',
    count: 5,
    description: 'Organization context: currentOrganization, myOrganizations, switchOrganization, getAllOrganizations.',
  },
  {
    to: '/apis/flow',
    name: 'useFlow',
    count: 6,
    description: 'Authentication flow UI state: currentStep, messages, navigateToFlow, reset.',
  },
  {
    to: '/apis/theme',
    name: 'useTheme',
    count: 2,
    description: 'Theme & color scheme: theme, colorScheme, direction, toggleTheme.',
  },
  {
    to: '/apis/branding',
    name: 'useBranding',
    count: 3,
    description: 'Asgardeo branding preferences: brandingPreference, theme, fetchBranding, refetch.',
  },
  {
    to: '/apis/i18n',
    name: 'useAsgardeoI18n',
    count: 3,
    description: 'Internationalization: t(), currentLanguage, setLanguage, injectBundles.',
  },
];
</script>
