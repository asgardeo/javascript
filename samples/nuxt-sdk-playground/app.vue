<template>
  <div>
    <header style="background: #ff6b00; color: white; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between;">
      <h1 style="font-size: 1.25rem; font-weight: 600;">Asgardeo Nuxt SDK Playground</h1>
      <nav style="display: flex; gap: 1rem; align-items: center;">
        <NuxtLink to="/" style="color: white;">Home</NuxtLink>
        <NuxtLink to="/protected" style="color: white;">Protected</NuxtLink>
        <NuxtLink to="/api-demo" style="color: white;">API Demo</NuxtLink>
        <template v-if="isSignedIn">
          <span style="font-size: 0.875rem;">{{ user?.username || user?.email || 'User' }}</span>
          <button
            style="background: white; color: #ff6b00; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600;"
            @click="signOut"
          >
            Sign Out
          </button>
        </template>
        <template v-else>
          <button
            style="background: white; color: #ff6b00; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600;"
            @click="signIn"
          >
            Sign In
          </button>
        </template>
      </nav>
    </header>
    <main style="max-width: 960px; margin: 2rem auto; padding: 0 1rem;">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const {isSignedIn, user, signIn, signOut} = useAsgardeo();
</script>
