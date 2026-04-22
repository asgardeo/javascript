# 05 — Client-Side Implementation

## Overview

Client-side code runs in the browser and provides:

1. **`useAsgardeo()` composable** — the primary API for components (reactive state + methods)
2. **Client plugin** — initializes auth state from SSR hydration, sets up Vue SDK integration
3. **Helper composables** — `useUser()`, `useOrganization()` for focused data access
4. **SSR state hydration** — server-resolved auth state flows to client without re-fetching

---

## Client Plugin

The client plugin bridges Nuxt's SSR hydration with the Vue SDK's reactive system:

```typescript
// src/runtime/plugins/asgardeo.client.ts

import { defineNuxtPlugin, useState, useRuntimeConfig } from '#app'
import { AsgardeoVueClient } from '@asgardeo/vue'

export default defineNuxtPlugin({
  name: 'asgardeo-client',
  enforce: 'pre',
  
  async setup(nuxtApp) {
    // Only runs on client
    if (!import.meta.client) return
    
    const config = useRuntimeConfig().public.asgardeo
    
    // Read SSR-hydrated auth state
    const authState = useState('asgardeo:auth')
    
    // Create the Vue SDK client
    // In Nuxt, we don't use the full AsgardeoVueClient directly (it does browser OAuth).
    // Instead, we create a lightweight client that proxies auth operations to server routes.
    const client = createNuxtAsgardeoClient(config, authState)
    
    // Provide to Vue app via injection (compatible with @asgardeo/vue composables)
    nuxtApp.vueApp.provide(ASGARDEO_KEY, client)
    
    // Also make available via nuxtApp
    nuxtApp.provide('asgardeo', client)
  },
})
```

---

## NuxtAsgardeoClient

Unlike the Vue SDK's `AsgardeoVueClient` (which does OAuth in the browser), the Nuxt client **delegates all sensitive operations to server routes**. It maintains reactive state and provides a compatible API surface.

```typescript
// src/runtime/client/nuxt-asgardeo-client.ts

import { ref, computed, type Ref } from 'vue'
import type { AsgardeoContext, User, Organization } from '@asgardeo/vue'

export interface NuxtAsgardeoClientOptions {
  apiRoutePrefix: string
  afterSignInUrl: string
  afterSignOutUrl: string
}

export function createNuxtAsgardeoClient(
  options: NuxtAsgardeoClientOptions,
  initialState: Ref<AuthState>,
): AsgardeoContext {
  const api = options.apiRoutePrefix
  
  // ── Reactive State ──────────────────────────────────────
  
  const isSignedIn = ref(initialState.value.isSignedIn)
  const isLoading = ref(initialState.value.isLoading)
  const user = ref<User | null>(initialState.value.user)
  const error = ref<Error | null>(null)
  const organizationId = ref<string | null>(initialState.value.organizationId)
  
  // ── Auth Methods ────────────────────────────────────────
  
  /**
   * Redirect-based sign-in.
   * Navigates to the server-side sign-in route which handles PKCE and redirect.
   */
  async function signIn(options?: SignInOptions): Promise<void> {
    if (options?.mode === 'embedded') {
      return signInEmbedded(options)
    }
    
    // Redirect mode (default)
    const params = new URLSearchParams()
    if (options?.returnTo) params.set('returnTo', options.returnTo)
    
    window.location.href = `${api}/signin${params.toString() ? '?' + params : ''}`
  }
  
  /**
   * Embedded / App-Native sign-in.
   * Communicates with server route via fetch, returns flow steps.
   */
  async function signInEmbedded(options: EmbeddedSignInOptions): Promise<FlowResult> {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`${api}/signin`, {
        method: 'POST',
        body: {
          flowId: options.flowId,
          selectedAuthenticator: options.selectedAuthenticator,
          ...options.params,
        },
      })
      
      if (response.flowStatus === 'SUCCESS_COMPLETED') {
        isSignedIn.value = true
        // Fetch user data
        await refreshUser()
      }
      
      return response
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Sign-in failed')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Sign-up (redirect mode).
   */
  async function signUp(options?: SignUpOptions): Promise<void> {
    if (options?.mode === 'embedded') {
      return signUpEmbedded(options)
    }
    window.location.href = `${api}/signup`
  }
  
  /**
   * Sign out. Redirects to server route that handles token revocation.
   */
  async function signOut(options?: SignOutOptions): Promise<void> {
    const params = new URLSearchParams()
    if (options?.returnTo) params.set('returnTo', options.returnTo)
    
    window.location.href = `${api}/signout${params.toString() ? '?' + params : ''}`
  }
  
  /**
   * Get access token (from server, handles refresh).
   */
  async function getAccessToken(): Promise<string> {
    const response = await $fetch<{ accessToken: string }>(`${api}/token`)
    return response.accessToken
  }
  
  /**
   * Exchange access token for a different scope/audience (RFC 8693).
   */
  async function exchangeToken(params: TokenExchangeParams): Promise<string> {
    const response = await $fetch<{ accessToken: string }>(`${api}/token/exchange`, {
      method: 'POST',
      body: params,
    })
    return response.accessToken
  }
  
  /**
   * Get user info (basic claims from token or userinfo endpoint).
   */
  async function getUser(): Promise<User> {
    const response = await $fetch<User>(`${api}/user`)
    user.value = response
    return response
  }
  
  /**
   * Get full user profile via SCIM2.
   */
  async function getUserProfile(): Promise<UserProfile> {
    return $fetch<UserProfile>(`${api}/user/profile`)
  }
  
  /**
   * Update user profile via SCIM2 PATCH.
   */
  async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const updated = await $fetch<UserProfile>(`${api}/user/profile`, {
      method: 'PATCH',
      body: updates,
    })
    // Refresh cached user
    await refreshUser()
    return updated
  }
  
  /**
   * Refresh the cached user data from server.
   */
  async function refreshUser(): Promise<void> {
    try {
      const sessionData = await $fetch<SessionResponse>(`${api}/session`)
      isSignedIn.value = sessionData.isSignedIn
      user.value = sessionData.user
      organizationId.value = sessionData.organizationId
    } catch {
      isSignedIn.value = false
      user.value = null
    }
  }
  
  // ── Organization Methods ────────────────────────────────
  
  async function getAllOrganizations(): Promise<Organization[]> {
    return $fetch<Organization[]>(`${api}/organizations`)
  }
  
  async function getMyOrganizations(): Promise<Organization[]> {
    return $fetch<Organization[]>(`${api}/organizations/mine`)
  }
  
  async function getCurrentOrganization(): Promise<Organization | null> {
    return $fetch<Organization | null>(`${api}/organizations/current`)
  }
  
  async function switchOrganization(orgId: string): Promise<void> {
    await $fetch(`${api}/organizations/switch`, {
      method: 'POST',
      body: { organizationId: orgId },
    })
    await refreshUser()
  }
  
  // ── Return AsgardeoContext ──────────────────────────────
  
  return {
    // Reactive state
    isSignedIn: computed(() => isSignedIn.value),
    isLoading: computed(() => isLoading.value),
    user: computed(() => user.value),
    error: computed(() => error.value),
    
    // Auth methods
    signIn,
    signOut,
    signUp,
    getAccessToken,
    exchangeToken,
    
    // User methods
    getUser,
    getUserProfile,
    updateUserProfile,
    refreshUser,
    
    // Organization methods
    getAllOrganizations,
    getMyOrganizations,
    getCurrentOrganization,
    switchOrganization,
    
    // Utility
    isSignedIn: isSignedIn,
    isLoading: isLoading,
  }
}
```

---

## Composables

### `useAsgardeo()` — Primary Composable

```typescript
// src/runtime/composables/useAsgardeo.ts

import { useNuxtApp } from '#app'
import type { AsgardeoContext } from '@asgardeo/vue'

/**
 * Primary composable for accessing Asgardeo auth in Nuxt components.
 * Auto-imported — no import statement needed.
 * 
 * @example
 * ```vue
 * <script setup>
 * const { isSignedIn, user, signIn, signOut } = useAsgardeo()
 * </script>
 * ```
 */
export function useAsgardeo(): AsgardeoContext {
  const nuxtApp = useNuxtApp()
  
  const context = nuxtApp.$asgardeo
  if (!context) {
    throw new Error(
      '[asgardeo] useAsgardeo() called but Asgardeo is not initialized. ' +
      'Make sure @asgardeo/nuxt is added to your modules in nuxt.config.ts.'
    )
  }
  
  return context
}
```

### `useUser()` — User Data Composable

```typescript
// src/runtime/composables/useUser.ts

import { computed } from 'vue'
import { useAsgardeo } from './useAsgardeo'

/**
 * Focused composable for user data. Auto-imported.
 * 
 * @example
 * ```vue
 * <script setup>
 * const { user, isSignedIn, getUserProfile, updateUserProfile } = useUser()
 * </script>
 * ```
 */
export function useUser() {
  const { user, isSignedIn, getUser, getUserProfile, updateUserProfile } = useAsgardeo()
  
  return {
    user,
    isSignedIn,
    getUser,
    getUserProfile,
    updateUserProfile,
  }
}
```

### `useOrganization()` — Organization Composable

```typescript
// src/runtime/composables/useOrganization.ts

import { useAsgardeo } from './useAsgardeo'

/**
 * Focused composable for organization data. Auto-imported.
 * 
 * @example
 * ```vue
 * <script setup>
 * const { getAllOrganizations, switchOrganization, currentOrganization } = useOrganization()
 * </script>
 * ```
 */
export function useOrganization() {
  const {
    getAllOrganizations,
    getMyOrganizations,
    getCurrentOrganization,
    switchOrganization,
  } = useAsgardeo()
  
  return {
    getAllOrganizations,
    getMyOrganizations,
    getCurrentOrganization,
    switchOrganization,
  }
}
```

---

## SSR State Hydration Flow

```
┌──────────────── Server ────────────────┐    ┌──────────── Client ──────────────┐
│                                        │    │                                  │
│  asgardeo.server.ts plugin             │    │  asgardeo.client.ts plugin       │
│  ┌────────────────────────────────┐    │    │  ┌────────────────────────────┐  │
│  │ 1. Read session cookie         │    │    │  │ 5. Read useState()         │  │
│  │ 2. Verify JWT                  │    │    │  │    (SSR-hydrated data)     │  │
│  │ 3. Decode user claims          │    │    │  │ 6. Create reactive refs    │  │
│  │ 4. Write to useState():        │    │    │  │    from hydrated state     │  │
│  │    isSignedIn, user, org, etc  │────┼────┤  │ 7. Provide via inject()    │  │
│  └────────────────────────────────┘    │    │  └────────────────────────────┘  │
│                                        │    │                                  │
│  Rendered HTML includes:               │    │  Components render immediately   │
│  <script>__NUXT__ = { state: {         │    │  with auth state — no flash of   │
│    'asgardeo:auth': { isSignedIn: true │    │  loading state on initial page   │
│    user: {...}, ... }                  │    │  load.                           │
│  }}</script>                           │    │                                  │
└────────────────────────────────────────┘    └──────────────────────────────────┘
```

Key benefit: **No loading flash.** When a signed-in user navigates to a page, the SSR HTML already contains the correct auth state. The client picks it up from `useState()` and renders immediately.

---

## Usage Examples

### Basic Auth Flow

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    
    <div v-else-if="isSignedIn">
      <p>Welcome, {{ user?.name }}!</p>
      <button @click="signOut()">Sign Out</button>
    </div>
    
    <div v-else>
      <button @click="signIn()">Sign In</button>
      <button @click="signUp()">Sign Up</button>
    </div>
  </div>
</template>

<script setup>
const { isSignedIn, isLoading, user, signIn, signOut, signUp } = useAsgardeo()
</script>
```

### Using UI Components (from @asgardeo/vue)

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <AsgardeoLoading>
      <p>Loading...</p>
    </AsgardeoLoading>
    
    <AsgardeoSignedIn>
      <p>Welcome, {{ user?.name }}!</p>
      <AsgardeoSignOutButton />
      <AsgardeoUserDropdown />
    </AsgardeoSignedIn>
    
    <AsgardeoSignedOut>
      <AsgardeoSignInButton />
    </AsgardeoSignedOut>
  </div>
</template>

<script setup>
const { user } = useAsgardeo()
</script>
```

### Protected Page with Middleware

```vue
<!-- pages/dashboard.vue -->
<template>
  <div>
    <h1>Dashboard</h1>
    <p>User: {{ user?.email }}</p>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'asgardeo-auth',
})

const { user } = useAsgardeo()
</script>
```

### Embedded Sign-In

```vue
<!-- pages/login.vue -->
<template>
  <div>
    <!-- Option 1: Use Vue SDK component -->
    <AsgardeoSignIn mode="embedded" />
    
    <!-- Option 2: Build custom UI -->
    <form v-if="flowStep" @submit.prevent="handleStep">
      <div v-for="field in flowStep.fields" :key="field.name">
        <label>{{ field.label }}</label>
        <input v-model="formData[field.name]" :type="field.type" />
      </div>
      <button type="submit">Continue</button>
    </form>
  </div>
</template>

<script setup>
const { signIn } = useAsgardeo()
const flowStep = ref(null)
const formData = ref({})

// Start embedded flow
onMounted(async () => {
  flowStep.value = await signIn({ mode: 'embedded' })
})

async function handleStep() {
  flowStep.value = await signIn({
    mode: 'embedded',
    flowId: flowStep.value.flowId,
    params: formData.value,
  })
}
</script>
```
