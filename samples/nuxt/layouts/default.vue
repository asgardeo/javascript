<script setup lang="ts">
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
            <AsgardeoUserDropdown />
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
