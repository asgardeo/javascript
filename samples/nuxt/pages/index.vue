<script setup lang="ts">
import { computed } from 'vue';

const { isLoading, user } = useAsgardeo();

const firstName = computed(() => {
  const profile = user.value as Record<string, unknown> | null;
  return String(profile?.givenName ?? profile?.firstName ?? profile?.username ?? 'there');
});
</script>

<template>
  <section>
    <h1 class="text-3xl font-bold">Nuxt SDK Quick Start</h1>
    <p class="text-gray-600 mt-2 mb-6">Minimal sample showing sign in, profile, and organization switching.</p>

    <div v-if="isLoading" class="border border-gray-200 rounded-lg p-4 bg-white">
      Loading authentication state...
    </div>

    <AsgardeoSignedOut>
      <div class="border border-gray-200 rounded-lg p-4 bg-white">
        <p class="text-gray-700">Sign in to access your profile and organizations. Use the Sign In button in the top right.</p>
      </div>
    </AsgardeoSignedOut>

    <AsgardeoSignedIn>
      <div class="border border-gray-200 rounded-lg p-4 bg-white">
        <p class="text-gray-700 mb-4">Welcome back, <span class="font-semibold">{{ firstName }}</span>.</p>
        <div class="flex gap-4">
          <NuxtLink to="/profile" class="text-blue-600 hover:underline">Go to Profile</NuxtLink>
          <NuxtLink to="/organizations" class="text-blue-600 hover:underline">Go to Organizations</NuxtLink>
        </div>
      </div>
    </AsgardeoSignedIn>
  </section>
</template>
