<script setup lang="ts">
import {AsgardeoProvider} from '@asgardeo/vue';
import {RouterView} from 'vue-router';

const baseUrl = import.meta.env.VITE_ASGARDEO_BASE_URL as string;
const clientId = import.meta.env.VITE_ASGARDEO_CLIENT_ID as string;
const afterSignInUrl = import.meta.env.VITE_ASGARDEO_AFTER_SIGN_IN_URL as string;
const afterSignOutUrl = import.meta.env.VITE_ASGARDEO_AFTER_SIGN_OUT_URL as string;
const scopes = ['openid', 'profile', 'email', 'internal_login', 'address', 'phone'];
const platform = 'AsgardeoV2';
// const platform = 'Asgardeo';
</script>

<template>
  <AsgardeoProvider
    :baseUrl="baseUrl"
    :clientId="clientId"
    :afterSignInUrl="afterSignInUrl"
    :afterSignOutUrl="afterSignOutUrl"
    :scopes="scopes"
    :platform="platform"
  >
    <RouterView />
  </AsgardeoProvider>
</template>
