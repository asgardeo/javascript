<script setup lang="ts">
import { UserProfile } from '@asgardeo/vue';
import Header from '../components/Header.vue';
</script>

<template>
  <Header />

  <main class="max-w-7xl mx-auto px-6 py-8">
    <div class="max-w-2xl mx-auto">
      <UserProfile />
    </div>
  </main>
</template>
