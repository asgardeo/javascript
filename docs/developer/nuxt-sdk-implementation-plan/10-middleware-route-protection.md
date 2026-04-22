# 10 — Middleware & Route Protection

## Overview

The Nuxt SDK provides route protection at two levels:

1. **Server middleware** (Nitro) — validates session before the page is rendered (SSR protection)
2. **Client middleware** (Nuxt route middleware) — guards client-side navigation after hydration

Both work together: server middleware protects initial loads; client middleware protects SPA-style navigation.

---

## Server Middleware

### Registration

Server middleware is registered in the Nuxt module:

```typescript
// In module.ts setup()

// Only register if protectedRoutes are configured
if (options.protectedRoutes?.length) {
  nuxt.hook('nitro:config', (nitroConfig) => {
    nitroConfig.handlers = nitroConfig.handlers || []
    nitroConfig.handlers.push({
      route: '/**',     // Runs on all routes
      handler: resolve('./runtime/server/middleware/session-guard'),
      middleware: true,
    })
  })
}
```

### Implementation

```typescript
// src/runtime/server/middleware/session-guard.ts

import { defineEventHandler, getRequestURL, sendRedirect, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { createRouteMatcher } from '../../utils/route-matcher'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig().public.asgardeo
  const url = getRequestURL(event)
  const path = url.pathname
  
  // Skip auth API routes
  if (path.startsWith(config.apiRoutePrefix)) return
  
  // Skip static assets and internal Nuxt paths
  if (path.startsWith('/_nuxt/') || path.startsWith('/__nuxt')) return
  
  // Skip if no protected routes configured
  if (!config.protectedRoutes?.length) return
  
  const isProtected = createRouteMatcher(config.protectedRoutes)
  const isPublic = createRouteMatcher([
    ...(config.publicRoutes || []),
    config.apiRoutePrefix + '/**',  // Auth routes are always public
    '/_nuxt/**',                     // Static assets
  ])
  
  // Public routes take precedence
  if (isPublic(path)) return
  
  // Not a protected route
  if (!isProtected(path)) return
  
  // Check session
  const { useAsgardeoServer } = await import('../utils/asgardeo-server')
  const client = useAsgardeoServer()
  const session = await client.getSession(event)
  
  if (!session) {
    // For API routes: return 401
    if (path.startsWith('/api/')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Authentication required',
      })
    }
    
    // For page routes: redirect to sign-in with return URL
    const returnTo = encodeURIComponent(url.pathname + url.search)
    return sendRedirect(
      event,
      `${config.apiRoutePrefix}/signin?returnTo=${returnTo}`,
      302
    )
  }
})
```

---

## Client Middleware

### Built-in: `asgardeo-auth`

Automatically registered by the module. Protects pages that declare it:

```typescript
// src/runtime/middleware/auth.ts

import { defineNuxtRouteMiddleware, useNuxtApp, navigateTo, useRuntimeConfig } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  const { $asgardeo } = useNuxtApp()
  const config = useRuntimeConfig().public.asgardeo
  
  // If user is signed in, allow navigation
  if ($asgardeo.isSignedIn.value) return
  
  // If still loading, wait (shouldn't happen with SSR hydration, but handle edge case)
  if ($asgardeo.isLoading.value) return
  
  // User is not signed in → redirect to sign-in
  const returnTo = encodeURIComponent(to.fullPath)
  return navigateTo(
    `${config.apiRoutePrefix}/signin?returnTo=${returnTo}`,
    { external: true }
  )
})
```

### Usage: Per-Page Protection

```vue
<!-- pages/dashboard.vue -->
<script setup>
definePageMeta({
  middleware: 'asgardeo-auth',
})
</script>
```

### Usage: Global Protection (via nuxt.config.ts)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@asgardeo/nuxt'],
  
  routeRules: {
    '/dashboard/**': { appMiddleware: 'asgardeo-auth' },
    '/settings/**': { appMiddleware: 'asgardeo-auth' },
  },
})
```

### Usage: Config-Based Protection

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@asgardeo/nuxt'],
  
  asgardeo: {
    // ...
    protectedRoutes: ['/dashboard/**', '/settings/**', '/admin/**'],
    publicRoutes: ['/', '/about', '/pricing', '/auth/**'],
  },
})
```

---

## Route Matcher Utility

Supports glob-like patterns for defining protected/public routes:

```typescript
// src/runtime/utils/route-matcher.ts

/**
 * Create a route matcher function from an array of patterns.
 * 
 * Supported patterns:
 * - '/exact/path'        — matches exactly
 * - '/prefix/**'         — matches prefix and all sub-paths
 * - '/prefix/*'          — matches prefix and one path segment
 * - '/users/:id'         — matches dynamic segments
 * 
 * @param patterns - Array of route patterns
 * @returns Matcher function that returns true if path matches any pattern
 */
export function createRouteMatcher(patterns: string[]): (path: string) => boolean {
  if (!patterns.length) return () => false
  
  const matchers = patterns.map(patternToRegex)
  
  return (path: string): boolean => {
    return matchers.some(regex => regex.test(path))
  }
}

function patternToRegex(pattern: string): RegExp {
  // Escape regex special chars except * and :
  let regexStr = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    // /** matches everything after
    .replace(/\/\\\*\\\*/g, '(?:/.*)?')
    // /* matches one path segment
    .replace(/\\\*/g, '[^/]+')
    // :param matches one path segment
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, '[^/]+')
  
  return new RegExp(`^${regexStr}$`)
}
```

---

## Custom Middleware Helper

For developers who need more control:

```typescript
// src/runtime/composables/defineAsgardeoMiddleware.ts

import { defineNuxtRouteMiddleware, useNuxtApp, navigateTo } from '#app'
import type { RouteLocationNormalized } from 'vue-router'

export interface AsgardeoMiddlewareContext {
  /** Whether the user is currently signed in */
  isSignedIn: boolean
  /** Current user (null if not signed in) */
  user: User | null
  /** Current organization ID */
  organizationId: string | null
  /** Check if user has a specific scope */
  hasScope: (scope: string) => boolean
  /** Redirect to sign-in page */
  redirectToSignIn: (returnTo?: string) => ReturnType<typeof navigateTo>
  /** Redirect to sign-out */
  redirectToSignOut: () => ReturnType<typeof navigateTo>
}

/**
 * Define a custom Asgardeo-aware route middleware.
 * Provides auth context for complex authorization logic.
 * 
 * @example
 * ```typescript
 * // middleware/admin.ts
 * export default defineAsgardeoMiddleware(({ isSignedIn, hasScope, redirectToSignIn }, to) => {
 *   if (!isSignedIn) return redirectToSignIn(to.fullPath)
 *   if (!hasScope('admin')) return navigateTo('/unauthorized')
 * })
 * ```
 */
export function defineAsgardeoMiddleware(
  handler: (
    ctx: AsgardeoMiddlewareContext,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ) => ReturnType<typeof navigateTo> | void
) {
  return defineNuxtRouteMiddleware((to, from) => {
    const { $asgardeo } = useNuxtApp()
    const config = useRuntimeConfig().public.asgardeo
    
    const ctx: AsgardeoMiddlewareContext = {
      isSignedIn: $asgardeo.isSignedIn.value,
      user: $asgardeo.user.value,
      organizationId: $asgardeo.organizationId?.value || null,
      
      hasScope(scope: string): boolean {
        const scopes = $asgardeo.scopes?.value || []
        return scopes.includes(scope)
      },
      
      redirectToSignIn(returnTo?: string) {
        const encodedReturn = encodeURIComponent(returnTo || to.fullPath)
        return navigateTo(
          `${config.apiRoutePrefix}/signin?returnTo=${encodedReturn}`,
          { external: true }
        )
      },
      
      redirectToSignOut() {
        return navigateTo(`${config.apiRoutePrefix}/signout`, { external: true })
      },
    }
    
    return handler(ctx, to, from)
  })
}
```

---

## Middleware Patterns

### Pattern 1: Simple Auth Guard

```vue
<!-- pages/dashboard.vue -->
<script setup>
definePageMeta({ middleware: 'asgardeo-auth' })
</script>
```

### Pattern 2: Role-Based Access

```typescript
// middleware/admin.ts
export default defineAsgardeoMiddleware(({ isSignedIn, hasScope, redirectToSignIn }, to) => {
  if (!isSignedIn) return redirectToSignIn(to.fullPath)
  if (!hasScope('admin')) return navigateTo('/unauthorized')
})
```

### Pattern 3: Organization-Specific Access

```typescript
// middleware/org-required.ts
export default defineAsgardeoMiddleware(({ isSignedIn, organizationId, redirectToSignIn }, to) => {
  if (!isSignedIn) return redirectToSignIn(to.fullPath)
  if (!organizationId) return navigateTo('/select-organization')
})
```

### Pattern 4: Guest-Only Pages

```typescript
// middleware/guest-only.ts
export default defineAsgardeoMiddleware(({ isSignedIn }) => {
  if (isSignedIn) return navigateTo('/dashboard')
})
```

```vue
<!-- pages/login.vue -->
<script setup>
definePageMeta({ middleware: 'guest-only' })
</script>
```

---

## Protection Matrix

| Route | Server Middleware | Client Middleware | Effect |
|-------|-------------------|-------------------|--------|
| `/` | Skip (public) | No middleware | Always accessible |
| `/dashboard` | Validate session, redirect if none | `asgardeo-auth` guard | Protected at both levels |
| `/api/auth/signin` | Skip (auth prefix) | N/A (server route) | Always accessible |
| `/api/data` | Validate session, return 401 | N/A (API route) | Protected API |
| `/admin` | Validate session, redirect if none | Custom `admin` middleware | Auth + role check |

### How Both Middleware Layers Interact

1. **First request (SSR)**: Server middleware runs → validates session → renders page with correct state
2. **Client navigation (SPA)**: Client middleware runs → checks reactive `isSignedIn` → allows or redirects
3. **Both are needed** because:
   - Server middleware protects against direct URL access and SSR
   - Client middleware protects against in-app navigation (which doesn't hit the server)
