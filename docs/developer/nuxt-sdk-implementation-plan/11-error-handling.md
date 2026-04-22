# 11 — Error Handling

## Error Model

Per IAM SDK Specification §10, all errors must use a structured error model.

### `AsgardeoError` Class

```typescript
// src/runtime/errors/asgardeo-error.ts

export class AsgardeoError extends Error {
  /** Machine-readable error code */
  readonly code: string
  /** HTTP status code (if applicable) */
  readonly statusCode?: number
  /** Server-side request ID for support correlation */
  readonly requestId?: string
  /** Original cause (for error chaining) */
  readonly cause?: Error
  /** Additional metadata */
  readonly metadata?: Record<string, unknown>
  
  constructor(
    code: string,
    message: string,
    options?: {
      statusCode?: number
      requestId?: string
      cause?: Error
      metadata?: Record<string, unknown>
    }
  ) {
    super(message, { cause: options?.cause })
    this.name = 'AsgardeoError'
    this.code = code
    this.statusCode = options?.statusCode
    this.requestId = options?.requestId
    this.metadata = options?.metadata
  }
  
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      requestId: this.requestId,
      metadata: this.metadata,
    }
  }
}
```

---

## Error Codes

```typescript
// src/runtime/errors/error-codes.ts

export const ErrorCodes = {
  // ── Configuration ─────────────────────────────
  CONFIG_MISSING_REQUIRED: 'CONFIG_MISSING_REQUIRED',
  CONFIG_INVALID_VALUE: 'CONFIG_INVALID_VALUE',
  CONFIG_INSECURE: 'CONFIG_INSECURE',
  
  // ── Authentication ────────────────────────────
  AUTH_SIGN_IN_FAILED: 'AUTH_SIGN_IN_FAILED',
  AUTH_SIGN_OUT_FAILED: 'AUTH_SIGN_OUT_FAILED',
  AUTH_CALLBACK_FAILED: 'AUTH_CALLBACK_FAILED',
  AUTH_STATE_MISMATCH: 'AUTH_STATE_MISMATCH',
  AUTH_CODE_EXCHANGE_FAILED: 'AUTH_CODE_EXCHANGE_FAILED',
  AUTH_NOT_AUTHENTICATED: 'AUTH_NOT_AUTHENTICATED',
  AUTH_FLOW_FAILED: 'AUTH_FLOW_FAILED',
  AUTH_FLOW_STEP_FAILED: 'AUTH_FLOW_STEP_FAILED',
  
  // ── Session ───────────────────────────────────
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_INVALID: 'SESSION_INVALID',
  SESSION_CREATE_FAILED: 'SESSION_CREATE_FAILED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  
  // ── Token ─────────────────────────────────────
  TOKEN_REFRESH_FAILED: 'TOKEN_REFRESH_FAILED',
  TOKEN_EXCHANGE_FAILED: 'TOKEN_EXCHANGE_FAILED',
  TOKEN_VALIDATION_FAILED: 'TOKEN_VALIDATION_FAILED',
  TOKEN_REVOCATION_FAILED: 'TOKEN_REVOCATION_FAILED',
  
  // ── User/Profile ──────────────────────────────
  USER_FETCH_FAILED: 'USER_FETCH_FAILED',
  PROFILE_FETCH_FAILED: 'PROFILE_FETCH_FAILED',
  PROFILE_UPDATE_FAILED: 'PROFILE_UPDATE_FAILED',
  PASSWORD_CHANGE_FAILED: 'PASSWORD_CHANGE_FAILED',
  
  // ── Organization ──────────────────────────────
  ORG_FETCH_FAILED: 'ORG_FETCH_FAILED',
  ORG_SWITCH_FAILED: 'ORG_SWITCH_FAILED',
  ORG_CREATE_FAILED: 'ORG_CREATE_FAILED',
  
  // ── Network ───────────────────────────────────
  NETWORK_ERROR: 'NETWORK_ERROR',
  DISCOVERY_FAILED: 'DISCOVERY_FAILED',
  
  // ── Internal ──────────────────────────────────
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_INITIALIZED: 'NOT_INITIALIZED',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]
```

---

## Error Propagation

### Server → Client Error Flow

```
Server Route throws AsgardeoError
       │
       ▼
H3 converts to HTTP error response
       │
       ▼
Client $fetch receives error
       │
       ▼
Composable catches and wraps in AsgardeoError
       │
       ▼
error ref updated → component re-renders
```

### Server-Side Error Handling

```typescript
// src/runtime/server/utils/error-handler.ts

import { createError, type H3Event } from 'h3'
import { AsgardeoError, ErrorCodes } from '../../errors'

/**
 * Wrap server route logic with consistent error handling.
 */
export function handleAuthRouteError(error: unknown): never {
  if (error instanceof AsgardeoError) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.code,
      message: error.message,
      data: {
        code: error.code,
        requestId: error.requestId,
      },
    })
  }
  
  // Wrap unknown errors
  throw createError({
    statusCode: 500,
    statusMessage: ErrorCodes.INTERNAL_ERROR,
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
  })
}
```

### Client-Side Error Handling

```typescript
// In NuxtAsgardeoClient

async function getAccessToken(): Promise<string> {
  try {
    const response = await $fetch<{ accessToken: string }>(`${api}/token`)
    return response.accessToken
  } catch (err) {
    const asgardeoError = wrapFetchError(err, ErrorCodes.TOKEN_REFRESH_FAILED)
    error.value = asgardeoError
    throw asgardeoError
  }
}

/**
 * Convert $fetch errors into AsgardeoError instances.
 */
function wrapFetchError(err: unknown, defaultCode: string): AsgardeoError {
  if (err instanceof AsgardeoError) return err
  
  // Nuxt's $fetch errors include response data
  const fetchError = err as { data?: { code?: string; message?: string }; statusCode?: number }
  
  return new AsgardeoError(
    fetchError.data?.code || defaultCode,
    fetchError.data?.message || (err instanceof Error ? err.message : 'Request failed'),
    {
      statusCode: fetchError.statusCode,
      cause: err instanceof Error ? err : undefined,
    }
  )
}
```

---

## Error Handling in Components

### Using the Error Ref

```vue
<template>
  <div>
    <div v-if="error" class="error-banner">
      <p>{{ error.message }}</p>
      <button @click="error = null">Dismiss</button>
    </div>
    
    <AsgardeoSignedIn>
      <p>Welcome!</p>
    </AsgardeoSignedIn>
  </div>
</template>

<script setup>
const { error } = useAsgardeo()
</script>
```

### Try-Catch Pattern

```vue
<script setup>
const { getAccessToken } = useAsgardeo()

async function fetchData() {
  try {
    const token = await getAccessToken()
    const data = await $fetch('/api/data', {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (err) {
    if (err instanceof AsgardeoError) {
      if (err.code === 'AUTH_NOT_AUTHENTICATED') {
        // Handle not authenticated
      } else if (err.code === 'TOKEN_REFRESH_FAILED') {
        // Handle token refresh failure
      }
    }
  }
}
</script>
```

### Nuxt Error Page Integration

```typescript
// error.vue or layouts/error.vue
<template>
  <div>
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.message }}</p>
    
    <NuxtLink v-if="isAuthError" :to="signInUrl">
      Sign In
    </NuxtLink>
  </div>
</template>

<script setup>
const props = defineProps<{ error: { statusCode: number; message: string; data?: any } }>()

const config = useRuntimeConfig().public.asgardeo
const isAuthError = computed(() => props.error.statusCode === 401)
const signInUrl = computed(() => `${config.apiRoutePrefix}/signin`)
</script>
```

---

## Logging

### Log Levels

| Level | Server | Client | Content |
|-------|--------|--------|---------|
| `error` | ✅ | ✅ | Authentication failures, token errors, session corruption |
| `warn` | ✅ | ✅ | Config issues, deprecated usage, session expiry |
| `info` | ✅ | ❌ | Auth flow progress, session creation/destruction |
| `debug` | ✅ | ❌ | Request/response details (with token masking) |

### Token Masking

```typescript
// src/runtime/utils/log.ts

/**
 * Mask sensitive tokens in log output.
 * Shows first 6 and last 4 characters only.
 */
export function maskToken(token: string): string {
  if (token.length <= 12) return '***'
  return `${token.substring(0, 6)}...${token.substring(token.length - 4)}`
}

// Usage:
// logger.debug(`Token refreshed: ${maskToken(newAccessToken)}`)
// Output: "Token refreshed: eyJhbG...xY2z"
```
