<script setup lang="ts">
// Protect this page — redirect to sign-in if not authenticated.
// defineAsgardeoMiddleware is auto-imported.
definePageMeta({
  middleware: defineAsgardeoMiddleware({redirectTo: '/api/auth/signin'}),
});

const {user} = useAsgardeo();
</script>

<template>
  <div>
    <h1>Dashboard</h1>
    <p>This page is protected. You can only see this when signed in.</p>

    <!-- Show full user profile card from @asgardeo/vue -->
    <AsgardeoSignedIn>
      <AsgardeoUserProfile />
    </AsgardeoSignedIn>
  </div>
</template>
