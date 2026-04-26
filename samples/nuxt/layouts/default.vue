<script setup lang="ts">
import { computed } from 'vue';

const { user } = useAsgardeo();

const initials = computed(() => {
  const profile = user.value as Record<string, unknown> | null;
  const givenName = String(profile?.givenName ?? profile?.firstName ?? '').trim();
  const familyName = String(profile?.familyName ?? profile?.lastName ?? '').trim();
  const username = String(profile?.username ?? profile?.userName ?? '').trim();

  if (givenName || familyName) {
    return `${givenName.charAt(0)}${familyName.charAt(0)}`.toUpperCase();
  }

  return username.charAt(0).toUpperCase() || 'U';
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="font-bold text-lg text-gray-900 hover:text-gray-700">
          Asgardeo Nuxt Sample
        </NuxtLink>

        <nav class="hidden md:flex gap-6">
          <NuxtLink to="/" class="text-gray-600 hover:text-gray-900">Home</NuxtLink>
          <AsgardeoSignedIn>
            <NuxtLink to="/profile" class="text-gray-600 hover:text-gray-900">Profile</NuxtLink>
            <NuxtLink to="/organizations" class="text-gray-600 hover:text-gray-900">Organizations</NuxtLink>
          </AsgardeoSignedIn>
        </nav>

        <div class="flex items-center gap-3">
          <AsgardeoSignedIn>
            <span class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold"
              :title="String(user?.username ?? user?.userName ?? 'User')">
              {{ initials }}
            </span>
            <AsgardeoSignOutButton class="px-3 py-2 text-sm bg-white text-gray-900 border border-gray-300 rounded hover:bg-gray-50" />
          </AsgardeoSignedIn>
          <AsgardeoSignedOut>
            <AsgardeoSignInButton/>
          </AsgardeoSignedOut>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
      <slot />
    </main>

    <footer class="border-t border-gray-200 mt-12">
      <div class="max-w-5xl mx-auto px-4 py-6 text-sm text-gray-600">
        Built with <a href="https://github.com/asgardeo/asgardeo-nuxt" class="text-blue-600 hover:underline">@asgardeo/nuxt</a>
      </div>
    </footer>
  </div>
</template>
