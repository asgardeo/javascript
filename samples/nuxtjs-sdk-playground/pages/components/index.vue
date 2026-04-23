<script setup lang="ts">
const links = [
  {
    path: '/components/control',
    title: 'Control',
    description: 'AsgardeoSignedIn, AsgardeoSignedOut, AsgardeoLoading — gate content on auth state.',
    badge: '3 components',
  },
  {
    path: '/components/actions',
    title: 'Actions',
    description: 'AsgardeoSignInButton, AsgardeoSignOutButton, AsgardeoSignUpButton — standard and custom-slot variants.',
    badge: '3 components',
  },
  {
    path: '/components/user',
    title: 'User',
    description: 'AsgardeoUser, AsgardeoUserProfile, AsgardeoUserDropdown — display user information.',
    badge: '3 components',
  },
  {
    path: '/components/organization',
    title: 'Organization',
    description: 'AsgardeoOrganization, AsgardeoOrganizationList, AsgardeoOrganizationSwitcher, AsgardeoOrganizationProfile, AsgardeoCreateOrganization.',
    badge: '5 components',
  },
];
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Components"
      description="Every UI component auto-registered by @asgardeo/nuxt — live previews, props, and copy-pasteable snippets."
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NuxtLink
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        class="bg-surface rounded-lg border border-border p-5 flex flex-col gap-3 hover:shadow-md hover:border-accent-500 transition-all group"
      >
        <div class="flex items-start justify-between gap-2">
          <span class="font-semibold text-text group-hover:text-accent-600 transition-colors">{{ link.title }}</span>
          <span class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-100">
            {{ link.badge }}
          </span>
        </div>
        <p class="text-sm text-text-muted">{{ link.description }}</p>
        <div class="flex items-center gap-1 text-xs text-accent-600 font-medium mt-auto">
          Explore
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
