<script setup lang="ts">
import { AsgardeoProvider } from '@asgardeo/vue';
import Sidebar from './components/Sidebar.vue';

const baseUrl = import.meta.env.VITE_ASGARDEO_BASE_URL;
const clientId = import.meta.env.VITE_ASGARDEO_CLIENT_ID;
const afterSignInUrl = import.meta.env.VITE_ASGARDEO_AFTER_SIGN_IN_URL;
const afterSignOutUrl = import.meta.env.VITE_ASGARDEO_AFTER_SIGN_OUT_URL
</script>

<template>
  <AsgardeoProvider
    :base-url="baseUrl"
    :client-id="clientId"
    :after-sign-in-url="afterSignInUrl"
    :after-sign-out-url="afterSignOutUrl"
  >
    <div class="min-h-screen bg-surface">
      <Sidebar />
      <div class="md:ml-64">
        <div class="p-6">
          <RouterView />
        </div>
      </div>
    </div>
  </AsgardeoProvider>
</template>
