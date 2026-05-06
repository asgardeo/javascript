<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { SignedIn, SignedOut, SignInButton, UserDropdown } from '@asgardeo/vue';

</script>

<template>
  <header class="sticky top-0 z-50 bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
      <!-- Main Heading -->
      <h1 class="text-xl font-semibold text-gray-900">Asgardeo Vue Sample</h1>

      <!-- Nav links -->
      <nav class="flex items-center gap-6 flex-1">
        <SignedIn>
          <RouterLink
            to="/"
            class="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
            active-class="text-orange-500"
          >
            Home
          </RouterLink>
          <RouterLink
            to="/profile"
            class="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
            active-class="text-orange-500"
          >
            Profile
          </RouterLink>
        </SignedIn>
      </nav>

      <!-- Right actions -->
      <div class="ml-auto flex items-center gap-3">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserDropdown
            :menuAlign="'right'"
          />
        </SignedIn>
      </div>
    </div>
  </header>
</template>
