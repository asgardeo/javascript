# 06 — UI Components

## Strategy

The Nuxt SDK **re-exports** UI components from `@asgardeo/vue` rather than reimplementing them. This follows the layer compliance rule: the Vue SDK (Layer 3) owns the component library; the Nuxt SDK (Layer 4) wraps and auto-registers them.

### Approach

1. **Re-export all Vue SDK components** from `src/runtime/components/`
2. **Register via `addComponentsDir()`** in the Nuxt module with an `Asgardeo` prefix
3. **Nuxt-specific wrapper components** only where Nuxt behavior differs (e.g., callback handling, navigation)
4. **Auto-import** — all components available in templates without explicit imports

---

## Component Registry

### Action Components

| Vue SDK Component | Nuxt Auto-Import Name | Notes |
|-------------------|----------------------|-------|
| `SignInButton` | `<AsgardeoSignInButton>` | Calls `useAsgardeo().signIn()` (redirects to server route) |
| `SignOutButton` | `<AsgardeoSignOutButton>` | Calls `useAsgardeo().signOut()` |
| `SignUpButton` | `<AsgardeoSignUpButton>` | Calls `useAsgardeo().signUp()` |
| `BaseSignInButton` | `<AsgardeoBaseSignInButton>` | Unstyled variant |
| `BaseSignOutButton` | `<AsgardeoBaseSignOutButton>` | Unstyled variant |
| `BaseSignUpButton` | `<AsgardeoBaseSignUpButton>` | Unstyled variant |

### Control Components

| Vue SDK Component | Nuxt Auto-Import Name | Notes |
|-------------------|----------------------|-------|
| `SignedIn` | `<AsgardeoSignedIn>` | Renders slot only when signed in |
| `SignedOut` | `<AsgardeoSignedOut>` | Renders slot only when signed out |
| `Loading` | `<AsgardeoLoading>` | Renders slot during loading state |

### Presentation Components

| Vue SDK Component | Nuxt Auto-Import Name | Notes |
|-------------------|----------------------|-------|
| `SignIn` | `<AsgardeoSignIn>` | Full sign-in form (embedded mode) |
| `SignUp` | `<AsgardeoSignUp>` | Full sign-up form |
| `UserProfile` | `<AsgardeoUserProfile>` | User profile display/edit |
| `UserDropdown` | `<AsgardeoUserDropdown>` | User avatar dropdown menu |
| `OrganizationSwitcher` | `<AsgardeoOrganizationSwitcher>` | Org switcher UI |
| `OrganizationList` | `<AsgardeoOrganizationList>` | List of organizations |
| `OrganizationProfile` | `<AsgardeoOrganizationProfile>` | Org profile display |
| `CreateOrganization` | `<AsgardeoCreateOrganization>` | Create org form |
| `AcceptInvite` | `<AsgardeoAcceptInvite>` | Accept invitation UI |
| `InviteUser` | `<AsgardeoInviteUser>` | Invite user form |
| `LanguageSwitcher` | `<AsgardeoLanguageSwitcher>` | i18n language selector |
| `BaseSignIn` | `<AsgardeoBaseSignIn>` | Unstyled sign-in |
| `BaseSignUp` | `<AsgardeoBaseSignUp>` | Unstyled sign-up |
| `BaseUserProfile` | `<AsgardeoBaseUserProfile>` | Unstyled user profile |
| ... (other Base variants) | `<AsgardeoBase...>` | All unstyled variants |

### Auth Components (Nuxt-Specific)

| Component | Name | Notes |
|-----------|------|-------|
| `Callback` | `<AsgardeoCallback>` | Nuxt-specific: handles OAuth callback rendering state |

---

## Component Re-Export Implementation

### Barrel Exports

```typescript
// src/runtime/components/index.ts

// Re-export all Vue SDK components
export {
  // Action components
  SignInButton,
  SignOutButton,
  SignUpButton,
  BaseSignInButton,
  BaseSignOutButton,
  BaseSignUpButton,
  
  // Control components
  SignedIn,
  SignedOut,
  Loading,
  
  // Presentation components
  SignIn,
  SignUp,
  UserProfile,
  UserDropdown,
  OrganizationSwitcher,
  OrganizationList,
  OrganizationProfile,
  CreateOrganization,
  AcceptInvite,
  InviteUser,
  LanguageSwitcher,
  
  // Base (unstyled) variants
  BaseSignIn,
  BaseSignUp,
  BaseUserProfile,
  BaseUserDropdown,
  BaseOrganizationSwitcher,
  BaseOrganizationList,
  BaseOrganizationProfile,
  BaseCreateOrganization,
  BaseAcceptInvite,
  BaseInviteUser,
} from '@asgardeo/vue'
```

### Module Registration

```typescript
// In module.ts setup()

addComponentsDir({
  path: resolve('./runtime/components'),
  prefix: 'Asgardeo',       // All components get Asgardeo prefix
  pathPrefix: false,         // Don't include directory path in component name
  watch: false,              // No need to watch re-exports
  transpile: true,
})
```

This means:
- `SignInButton` → `<AsgardeoSignInButton>` (auto-imported)
- `UserProfile` → `<AsgardeoUserProfile>` (auto-imported)
- Also available without prefix if user imports directly

---

## Nuxt-Specific Component Wrappers

Some components need Nuxt-specific behavior:

### `AsgardeoCallback`

The callback component handles the OAuth redirect landing page state:

```vue
<!-- src/runtime/components/Callback.vue -->
<template>
  <div class="asgardeo-callback">
    <slot v-if="isProcessing" name="loading">
      <div class="asgardeo-callback__loading">
        <p>Completing sign-in...</p>
      </div>
    </slot>
    
    <slot v-if="error" name="error" :error="error">
      <div class="asgardeo-callback__error">
        <p>Authentication failed: {{ error.message }}</p>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
/**
 * Handles the OAuth callback page UI.
 * 
 * Typically placed at pages/auth/callback.vue:
 * ```vue
 * <template>
 *   <AsgardeoCallback>
 *     <template #loading>Signing you in...</template>
 *     <template #error="{ error }">Oops: {{ error.message }}</template>
 *   </AsgardeoCallback>
 * </template>
 * ```
 * 
 * Note: The actual callback code exchange happens at the server route
 * /api/auth/callback. This component is for UI feedback only if the
 * developer uses a client-side callback page.
 */
const isProcessing = ref(true)
const error = ref<Error | null>(null)

onMounted(async () => {
  try {
    // The server callback route handles the exchange.
    // If this component is rendered, it means the server route
    // already redirected here or the developer is using a custom flow.
    const route = useRoute()
    
    if (route.query.error) {
      error.value = new Error(
        `${route.query.error}: ${route.query.error_description || 'Unknown error'}`
      )
    }
  } finally {
    isProcessing.value = false
  }
})
</script>
```

### `AsgardeoProvider` (Nuxt Wrapper)

Wraps the Vue SDK's `AsgardeoProvider` with Nuxt-specific initialization:

```vue
<!-- src/runtime/components/Provider.vue -->
<template>
  <slot />
</template>

<script setup lang="ts">
/**
 * Optional root-level provider component for apps that want
 * explicit control over the Asgardeo context tree.
 * 
 * In most cases, the Nuxt plugin handles this automatically.
 * Use this component only when you need to:
 * - Override default config for a subtree
 * - Nest multiple Asgardeo contexts
 * 
 * @example
 * ```vue
 * <!-- app.vue -->
 * <template>
 *   <AsgardeoProvider>
 *     <NuxtPage />
 *   </AsgardeoProvider>
 * </template>
 * ```
 */
import { AsgardeoProvider } from '@asgardeo/vue'

const props = defineProps<{
  config?: Partial<AsgardeoNuxtConfig>
}>()
</script>
```

---

## Component Usage Patterns

### Pattern 1: Conditional Rendering

```vue
<template>
  <header>
    <AsgardeoSignedIn>
      <AsgardeoUserDropdown />
    </AsgardeoSignedIn>
    
    <AsgardeoSignedOut>
      <AsgardeoSignInButton>Login</AsgardeoSignInButton>
    </AsgardeoSignedOut>
  </header>
</template>
```

### Pattern 2: Full Sign-In Page

```vue
<!-- pages/login.vue -->
<template>
  <div class="login-page">
    <AsgardeoSignIn 
      mode="embedded"
      :show-sign-up-link="true"
      @success="router.push('/dashboard')"
      @error="handleError"
    />
  </div>
</template>

<script setup>
const router = useRouter()

function handleError(error: Error) {
  console.error('Sign-in error:', error)
}
</script>
```

### Pattern 3: User Profile Management

```vue
<!-- pages/settings/profile.vue -->
<template>
  <div>
    <AsgardeoUserProfile 
      :editable="true"
      @update="handleProfileUpdate"
    />
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'asgardeo-auth' })

function handleProfileUpdate(profile) {
  console.log('Profile updated:', profile)
}
</script>
```

### Pattern 4: Organization Switcher

```vue
<!-- components/OrgSwitcher.vue -->
<template>
  <AsgardeoOrganizationSwitcher 
    @switch="handleOrgSwitch"
  />
</template>

<script setup>
async function handleOrgSwitch(org) {
  // Organization switch triggers token exchange server-side
  await navigateTo('/dashboard')
}
</script>
```

---

## Component Compatibility Notes

| Concern | How It's Handled |
|---------|-----------------|
| SSR rendering | Control components (`SignedIn`, `SignedOut`, `Loading`) work with SSR because state is hydrated from server |
| Lazy loading | Nuxt auto-imports support lazy loading via `<LazyAsgardeoUserProfile>` |
| Tree shaking | Unused components are tree-shaken since they're individual re-exports |
| Styling | Vue SDK components come with default styles; can be overridden with Nuxt's CSS system |
| i18n | Components use `@asgardeo/i18n` via the Vue SDK's I18nProvider (set up in the plugin) |
| Theming | Branding/theme data fetched server-side and provided to components via Vue SDK providers |
