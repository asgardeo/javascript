<script setup lang="ts">
// useAsgardeo is auto-imported — no import statement needed
const {isSignedIn, isLoading, user} = useAsgardeo();
</script>

<template>
  <div>
    <h1>Welcome to the Asgardeo Playground</h1>

    <!-- Loading state -->
    <AsgardeoLoading>
      <p><em>Checking authentication status…</em></p>
    </AsgardeoLoading>

    <!-- Signed-out view -->
    <AsgardeoSignedOut>
      <p>You are not signed in.</p>
      <AsgardeoSignInButton />
    </AsgardeoSignedOut>

    <!-- Signed-in view -->
    <AsgardeoSignedIn>
      <p>Welcome back, <strong>{{ user?.username ?? user?.email }}</strong>!</p>
      <AsgardeoSignOutButton />
    </AsgardeoSignedIn>

    <!-- Debug info (remove before going to production) -->
    <details style="margin-top:2rem;">
      <summary>Auth debug</summary>
      <pre>isSignedIn: {{ isSignedIn }}
isLoading:  {{ isLoading }}
user:       {{ JSON.stringify(user, null, 2) }}</pre>
    </details>
  </div>
</template>
