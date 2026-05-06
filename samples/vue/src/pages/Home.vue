<script setup lang="ts">
import { SignedIn, SignedOut, SignInButton, User } from '@asgardeo/vue';
import Header from '../components/Header.vue';
</script>

<template>
  <Header />

  <main class="max-w-7xl mx-auto px-6 py-8">
    <SignedOut>
      <div class="flex flex-col items-center text-center py-20 gap-5">
        <h1 class="text-3xl font-bold text-gray-900">Welcome to Asgardeo Vue Sample</h1>
        <p class="text-lg text-gray-500">Sign in to access your profile and manage your account.</p>
        <SignInButton />
      </div>
    </SignedOut>

    <SignedIn>
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p class="text-lg text-gray-500 mb-6">This is a sample application to demonstrate the Asgardeo Vue SDK</p>
        <!-- AsgardeoV2 (ID token claims) -->
         <User>   
           <template #default="{ user }">
             <p>Welcome, {{ user.given_name }}!</p>
            </template>
        </User>

        <!-- Non-V2 (SCIM) -->
        <!-- <template #default="{ user }">
          <p>Welcome, {{ user.name?.givenName }}!</p>
        </template> -->

      </div>
    </SignedIn>
  </main>
</template>
