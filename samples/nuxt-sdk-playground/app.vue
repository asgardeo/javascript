<template>
  <AsgardeoRoot>
    <div>
      <header style="display:flex;align-items:center;justify-content:space-between;padding:1rem;border-bottom:1px solid #eee;">
        <strong>Asgardeo Nuxt Playground</strong>
        <nav style="display:flex;gap:1rem;align-items:center;">
          <NuxtLink to="/">Home</NuxtLink>
          <NuxtLink to="/dashboard">Dashboard</NuxtLink>
          <!-- Show sign-in/out buttons from @asgardeo/vue (auto-imported via addComponent) -->
          <AsgardeoSignedOut>
            <AsgardeoSignInButton />
          </AsgardeoSignedOut>
          <AsgardeoSignedIn>
            <AsgardeoUserDropdown />
          </AsgardeoSignedIn>
        </nav>
      </header>

      <main style="padding:1rem;">
        <NuxtPage />
      </main>
    </div>
  </AsgardeoRoot>
</template>
