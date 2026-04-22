# 03 — Module System & Configuration

## Nuxt Module Definition

The Nuxt module is the entry point. It hooks into Nuxt's build system to register runtime config, auto-imports, server routes, and plugins.

### Module Entry Point

```typescript
// src/module.ts
import { defineNuxtModule, addPlugin, addServerHandler, createResolver, 
         addImports, addImportsDir, addComponentsDir, addServerImportsDir,
         addRouteMiddleware } from '@nuxt/kit'
import { defu } from 'defu'
import type { AsgardeoNuxtConfig } from './runtime/types'

export default defineNuxtModule<AsgardeoNuxtConfig>({
  meta: {
    name: '@asgardeo/nuxt',
    configKey: 'asgardeo',         // nuxt.config.ts → asgardeo: { ... }
    compatibility: {
      nuxt: '>=3.10.0',
    },
  },
  
  defaults: {
    scopes: ['openid', 'profile', 'email'],
    afterSignInUrl: '/',
    afterSignOutUrl: '/',
    apiRoutePrefix: '/api/auth',
    cookieConfig: {
      name: 'asgardeo-session',
      maxAge: 24 * 60 * 60,        // 24 hours
      path: '/',
      sameSite: 'lax',
    },
    protectedRoutes: [],
    publicRoutes: [],
  },
  
  setup(options, nuxt) {
    // 1. Validate configuration
    validateConfig(options)
    
    // 2. Resolve paths
    const { resolve } = createResolver(import.meta.url)
    
    // 3. Merge with runtime config (env vars take precedence)
    const config = resolveConfigFromEnv(options)
    
    // 4. Set runtime config (public vs private separation)
    nuxt.options.runtimeConfig.asgardeo = {
      // PRIVATE — server only
      clientSecret: config.clientSecret,       // from ASGARDEO_CLIENT_SECRET env
      sessionSecret: config.sessionSecret,     // from ASGARDEO_SESSION_SECRET env
    }
    nuxt.options.runtimeConfig.public.asgardeo = {
      // PUBLIC — available on client
      baseUrl: config.baseUrl,
      clientId: config.clientId,
      scopes: config.scopes,
      afterSignInUrl: config.afterSignInUrl,
      afterSignOutUrl: config.afterSignOutUrl,
      apiRoutePrefix: config.apiRoutePrefix,
    }
    
    // 5. Register client-side plugin
    addPlugin(resolve('./runtime/plugins/asgardeo.client'))
    
    // 6. Register server-side plugin (session, client init)
    addPlugin(resolve('./runtime/plugins/asgardeo.server'))
    
    // 7. Register auto-imports (composables)
    addImportsDir(resolve('./runtime/composables'))
    
    // 8. Register server auto-imports
    addServerImportsDir(resolve('./runtime/server/utils'))
    
    // 9. Register Vue UI components from @asgardeo/vue
    addComponentsDir({
      path: resolve('./runtime/components'),
      prefix: 'Asgardeo',
      pathPrefix: false,
    })
    
    // 10. Register server routes
    const prefix = config.apiRoutePrefix || '/api/auth'
    registerServerRoutes(resolve, prefix)
    
    // 11. Register Nuxt route middleware (optional auth protection)
    addRouteMiddleware({
      name: 'asgardeo-auth',
      path: resolve('./runtime/middleware/auth'),
    })
    
    // 12. Type augmentation
    nuxt.hook('prepare:types', (opts) => {
      opts.references.push({ path: resolve('./runtime/types/augments.d.ts') })
    })
  },
})
```

---

## Configuration Schema

### `AsgardeoNuxtConfig`

```typescript
// src/runtime/types/config.ts

import type { AsgardeoNodeConfig } from '@asgardeo/node'

export interface AsgardeoNuxtCookieConfig {
  /** Cookie name for the session. Default: 'asgardeo-session' */
  name?: string
  /** Max age in seconds. Default: 86400 (24h) */
  maxAge?: number
  /** Cookie path. Default: '/' */
  path?: string
  /** SameSite attribute. Default: 'lax' */
  sameSite?: 'lax' | 'strict' | 'none'
  /** Domain for the cookie (optional) */
  domain?: string
}

export interface AsgardeoNuxtConfig {
  // ── Required ──────────────────────────────────────────
  
  /** Base URL of the Asgardeo tenant (e.g., https://api.asgardeo.io/t/myorg) */
  baseUrl: string
  
  /** OAuth2 client ID */
  clientId: string
  
  // ── Secrets (from env only) ───────────────────────────
  
  /** OAuth2 client secret. MUST be set via ASGARDEO_CLIENT_SECRET env var */
  clientSecret?: string
  
  /** Secret for signing session JWTs. MUST be set via ASGARDEO_SESSION_SECRET env var */
  sessionSecret?: string
  
  // ── Optional ──────────────────────────────────────────
  
  /** OAuth2 scopes. Default: ['openid', 'profile', 'email'] */
  scopes?: string[]
  
  /** URL to redirect to after sign-in. Default: '/' */
  afterSignInUrl?: string
  
  /** URL to redirect to after sign-out. Default: '/' */
  afterSignOutUrl?: string
  
  /** Prefix for auth API routes. Default: '/api/auth' */
  apiRoutePrefix?: string
  
  /** Cookie configuration for session management */
  cookieConfig?: AsgardeoNuxtCookieConfig
  
  /** Routes that require authentication (glob patterns) */
  protectedRoutes?: string[]
  
  /** Routes that are always public, even if protectedRoutes includes them */
  publicRoutes?: string[]
  
  // ── Advanced ──────────────────────────────────────────
  
  /** Custom OIDC endpoints (overrides discovery) */
  endpoints?: Partial<{
    authorizationEndpoint: string
    tokenEndpoint: string
    userinfoEndpoint: string
    jwksUri: string
    endSessionEndpoint: string
    revocationEndpoint: string
  }>
  
  /** Token validation configuration */
  tokenValidation?: {
    /** Validate access token signature. Default: true */
    validateAccessToken?: boolean
    /** Validate ID token signature. Default: true */
    validateIdToken?: boolean
    /** Clock tolerance in seconds. Default: 60 */
    clockTolerance?: number
  }
  
  /** Discovery configuration */
  discovery?: {
    /** Disable OIDC discovery. Default: false */
    disabled?: boolean
    /** Cache discovery response TTL in seconds. Default: 3600 */
    cacheTtl?: number
  }
}
```

---

## Environment Variable Resolution

The module resolves config from multiple sources with this precedence:

```
env vars  >  nuxt.config.ts asgardeo: {}  >  module defaults
```

### Environment Variable Mapping

| Config Key | Env Variable | Public | Notes |
|------------|-------------|--------|-------|
| `baseUrl` | `NUXT_PUBLIC_ASGARDEO_BASE_URL` | ✅ | Required |
| `clientId` | `NUXT_PUBLIC_ASGARDEO_CLIENT_ID` | ✅ | Required |
| `clientSecret` | `ASGARDEO_CLIENT_SECRET` | ❌ | Server-only, never exposed to client |
| `sessionSecret` | `ASGARDEO_SESSION_SECRET` | ❌ | Server-only, for JWT signing |
| `scopes` | `NUXT_PUBLIC_ASGARDEO_SCOPES` | ✅ | Comma-separated |
| `afterSignInUrl` | `NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_IN_URL` | ✅ | |
| `afterSignOutUrl` | `NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_OUT_URL` | ✅ | |

Implementation:

```typescript
// src/runtime/utils/config.ts

export function resolveConfigFromEnv(options: AsgardeoNuxtConfig): AsgardeoNuxtConfig {
  return defu(
    {
      baseUrl: process.env.NUXT_PUBLIC_ASGARDEO_BASE_URL,
      clientId: process.env.NUXT_PUBLIC_ASGARDEO_CLIENT_ID,
      clientSecret: process.env.ASGARDEO_CLIENT_SECRET,
      sessionSecret: process.env.ASGARDEO_SESSION_SECRET,
      scopes: process.env.NUXT_PUBLIC_ASGARDEO_SCOPES?.split(',').map(s => s.trim()),
      afterSignInUrl: process.env.NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_IN_URL,
      afterSignOutUrl: process.env.NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_OUT_URL,
    },
    options
  )
}
```

---

## Configuration Validation

```typescript
// src/runtime/utils/validate-config.ts

import { AsgardeoError, ErrorCodes } from './errors'

export function validateConfig(config: AsgardeoNuxtConfig): void {
  if (!config.baseUrl) {
    throw new AsgardeoError(
      ErrorCodes.CONFIG_MISSING_REQUIRED,
      'baseUrl is required. Set it in nuxt.config.ts or via NUXT_PUBLIC_ASGARDEO_BASE_URL env var.'
    )
  }
  
  if (!config.clientId) {
    throw new AsgardeoError(
      ErrorCodes.CONFIG_MISSING_REQUIRED,
      'clientId is required. Set it in nuxt.config.ts or via NUXT_PUBLIC_ASGARDEO_CLIENT_ID env var.'
    )
  }
  
  // Warn if baseUrl is not HTTPS in production
  if (process.env.NODE_ENV === 'production' && !config.baseUrl.startsWith('https://')) {
    console.warn('[asgardeo] baseUrl should use HTTPS in production.')
  }
  
  // Warn if clientSecret is set in nuxt.config.ts instead of env var
  if (config.clientSecret && !process.env.ASGARDEO_CLIENT_SECRET) {
    console.warn(
      '[asgardeo] clientSecret should be set via ASGARDEO_CLIENT_SECRET env var, ' +
      'not in nuxt.config.ts. The current value may be bundled into the build.'
    )
  }
  
  // Warn if session secret is missing
  if (!config.sessionSecret && !process.env.ASGARDEO_SESSION_SECRET) {
    console.warn(
      '[asgardeo] sessionSecret is not set. A random secret will be generated at startup. ' +
      'Set ASGARDEO_SESSION_SECRET env var for consistent sessions across restarts.'
    )
  }
}
```

---

## Type Augmentation

```typescript
// src/runtime/types/augments.d.ts

import type { AsgardeoNuxtConfig, AsgardeoNuxtPublicConfig } from './config'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    asgardeo?: AsgardeoNuxtConfig
  }
  
  interface RuntimeConfig {
    asgardeo: {
      clientSecret: string
      sessionSecret: string
    }
  }
  
  interface PublicRuntimeConfig {
    asgardeo: AsgardeoNuxtPublicConfig
  }
}

declare module '#app' {
  interface NuxtApp {
    $asgardeo: AsgardeoContext
  }
}
```

---

## Usage Example

### Minimal Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@asgardeo/nuxt'],
  
  asgardeo: {
    baseUrl: 'https://api.asgardeo.io/t/myorg',
    clientId: 'your-client-id',
  },
})
```

### Environment Variables (`.env`)

```bash
# Required
NUXT_PUBLIC_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/myorg
NUXT_PUBLIC_ASGARDEO_CLIENT_ID=your-client-id
ASGARDEO_CLIENT_SECRET=your-client-secret
ASGARDEO_SESSION_SECRET=a-32-byte-random-string-here

# Optional
NUXT_PUBLIC_ASGARDEO_SCOPES=openid,profile,email,internal_login
NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_IN_URL=/dashboard
NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_OUT_URL=/
```

### Full Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@asgardeo/nuxt'],
  
  asgardeo: {
    baseUrl: 'https://api.asgardeo.io/t/myorg',
    clientId: 'your-client-id',
    scopes: ['openid', 'profile', 'email', 'internal_login'],
    afterSignInUrl: '/dashboard',
    afterSignOutUrl: '/',
    apiRoutePrefix: '/api/auth',
    
    cookieConfig: {
      name: 'myapp-session',
      maxAge: 3600,      // 1 hour
      sameSite: 'lax',
    },
    
    protectedRoutes: ['/dashboard/**', '/settings/**', '/admin/**'],
    publicRoutes: ['/', '/about', '/pricing'],
    
    tokenValidation: {
      validateAccessToken: true,
      validateIdToken: true,
      clockTolerance: 60,
    },
    
    discovery: {
      disabled: false,
      cacheTtl: 3600,
    },
  },
})
```
