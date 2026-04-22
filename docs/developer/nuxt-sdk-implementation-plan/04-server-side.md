# 04 — Server-Side Implementation

## Overview

Server-side logic runs in Nuxt's **Nitro** server engine. It handles:

1. **OAuth2/OIDC protocol** — authorization redirect, code exchange, token refresh
2. **Session management** — JWT-based cookies (create, verify, destroy)
3. **API routes** — `/api/auth/*` endpoints for sign-in, callback, sign-out, session, tokens, user
4. **Server middleware** — session validation on protected routes
5. **Server composables** — `useAsgardeoServer()` for use in custom server routes

---

## AsgardeoNuxtServerClient

Wraps `@asgardeo/node`'s `AsgardeoNodeClient` with Nuxt-specific concerns:

```typescript
// src/runtime/server/client.ts

import { AsgardeoNodeClient, type AsgardeoNodeConfig } from '@asgardeo/node'
import type { H3Event } from 'h3'
import { SessionManager } from './session-manager'

export class AsgardeoNuxtServerClient extends AsgardeoNodeClient {
  private sessionManager: SessionManager
  
  constructor(config: AsgardeoNodeConfig, sessionSecret: string) {
    super(config)
    this.sessionManager = new SessionManager(sessionSecret, config.cookieConfig)
  }
  
  /**
   * Get session from HTTP request
   */
  async getSession(event: H3Event): Promise<SessionPayload | null> {
    return this.sessionManager.getSession(event)
  }
  
  /**
   * Create a session after successful authentication
   */
  async createSession(event: H3Event, payload: SessionPayload): Promise<void> {
    return this.sessionManager.createSession(event, payload)
  }
  
  /**
   * Destroy session (sign-out)
   */
  async destroySession(event: H3Event): Promise<void> {
    return this.sessionManager.destroySession(event)
  }
  
  /**
   * Get access token for the current session, refreshing if needed
   */
  async getSessionAccessToken(event: H3Event): Promise<string | null> {
    const session = await this.getSession(event)
    if (!session) return null
    
    // Check if access token is expired
    if (session.accessTokenExpiresAt < Date.now()) {
      // Refresh using refresh token
      const tokens = await this.refreshAccessToken(session.refreshToken)
      
      // Update session with new tokens
      await this.createSession(event, {
        ...session,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || session.refreshToken,
        accessTokenExpiresAt: Date.now() + (tokens.expiresIn * 1000),
      })
      
      return tokens.accessToken
    }
    
    return session.accessToken
  }
}
```

### Singleton Factory

```typescript
// src/runtime/server/utils/asgardeo-server.ts

import { useRuntimeConfig } from '#imports'
import { AsgardeoNuxtServerClient } from '../client'

let _client: AsgardeoNuxtServerClient | null = null

/**
 * Server composable — returns the Asgardeo server client.
 * Auto-imported in server routes via addServerImportsDir.
 */
export function useAsgardeoServer(): AsgardeoNuxtServerClient {
  if (!_client) {
    const config = useRuntimeConfig()
    const publicConfig = config.public.asgardeo
    const privateConfig = config.asgardeo
    
    _client = new AsgardeoNuxtServerClient(
      {
        baseUrl: publicConfig.baseUrl,
        clientId: publicConfig.clientId,
        clientSecret: privateConfig.clientSecret,
        scopes: publicConfig.scopes,
        endpoints: publicConfig.endpoints,
      },
      privateConfig.sessionSecret
    )
  }
  
  return _client
}
```

---

## Server Routes

All routes are registered under the configurable `apiRoutePrefix` (default: `/api/auth`).

### Route Map

| Route | Method | Purpose | Handler File |
|-------|--------|---------|-------------|
| `/api/auth/signin` | GET | Redirect sign-in (start OAuth flow) | `signin.get.ts` |
| `/api/auth/signin` | POST | Embedded/app-native sign-in step | `signin.post.ts` |
| `/api/auth/signup` | GET | Redirect sign-up | `signup.get.ts` |
| `/api/auth/signup` | POST | Embedded sign-up step | `signup.post.ts` |
| `/api/auth/callback` | GET | OAuth callback handler | `callback.get.ts` |
| `/api/auth/signout` | GET/POST | Sign-out (revoke + clear session) | `signout.ts` |
| `/api/auth/session` | GET | Get current session info | `session.get.ts` |
| `/api/auth/token` | GET | Get access token | `token.get.ts` |
| `/api/auth/token/exchange` | POST | Exchange token (RFC 8693) | `token.exchange.post.ts` |
| `/api/auth/user` | GET | Get user claims | `user.get.ts` |
| `/api/auth/user/profile` | GET | Get full SCIM2 user profile | `user.profile.get.ts` |
| `/api/auth/user/profile` | PATCH | Update user profile | `user.profile.patch.ts` |

---

### Sign-In Route (Redirect Mode)

```typescript
// src/runtime/server/routes/auth/signin.get.ts

import { defineEventHandler, sendRedirect, setCookie, getQuery } from 'h3'
import { useAsgardeoServer } from '../../utils/asgardeo-server'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const client = useAsgardeoServer()
  const config = useRuntimeConfig().public.asgardeo
  const query = getQuery(event)
  
  // Allow overriding redirect URLs via query params
  const afterSignInUrl = (query.returnTo as string) || config.afterSignInUrl
  
  // Generate the authorization URL
  // The Node SDK handles PKCE code_challenge, state, nonce generation
  const { url, sessionId, state, codeVerifier } = await client.signIn({
    callbackUrl: `${getRequestURL(event).origin}${config.apiRoutePrefix}/callback`,
    scopes: config.scopes,
  })
  
  // Store temp session data in a short-lived cookie for the callback
  await client.createTempSession(event, {
    sessionId,
    state,
    codeVerifier,
    afterSignInUrl,
  })
  
  // Redirect to Asgardeo authorization endpoint
  return sendRedirect(event, url, 302)
})
```

### Sign-In Route (Embedded / App-Native Mode)

```typescript
// src/runtime/server/routes/auth/signin.post.ts

import { defineEventHandler, readBody, createError } from 'h3'
import { useAsgardeoServer } from '../../utils/asgardeo-server'

export default defineEventHandler(async (event) => {
  const client = useAsgardeoServer()
  const body = await readBody(event)
  
  // Determine flow type:
  // - { flowId, selectedAuthenticator, ...params } → continue existing flow
  // - {} or { signInType: 'embedded-v1' } → start new flow
  
  try {
    if (body.flowId) {
      // Continue existing flow step
      const result = await client.signIn({
        flowId: body.flowId,
        selectedAuthenticator: body.selectedAuthenticator,
        ...body.params,
      })
      
      if (result.flowStatus === 'SUCCESS_COMPLETED') {
        // Exchange auth code for tokens
        const tokens = await client.exchangeCodeForTokens(result.authorizationCode)
        
        // Create session
        await client.createSession(event, {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          idToken: tokens.idToken,
          accessTokenExpiresAt: Date.now() + (tokens.expiresIn * 1000),
          sessionId: result.sessionId,
          userId: tokens.userId,
          scopes: tokens.scopes,
        })
        
        return {
          flowStatus: 'SUCCESS_COMPLETED',
          redirectUrl: useRuntimeConfig().public.asgardeo.afterSignInUrl,
        }
      }
      
      // Return flow step for client to render
      return {
        flowStatus: result.flowStatus,
        flowId: result.flowId,
        nextStep: result.nextStep,
        authenticators: result.authenticators,
      }
    }
    
    // Start new embedded flow
    const result = await client.signIn({ mode: 'embedded' })
    return {
      flowStatus: result.flowStatus,
      flowId: result.flowId,
      nextStep: result.nextStep,
      authenticators: result.authenticators,
    }
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: error instanceof Error ? error.message : 'Sign-in failed',
    })
  }
})
```

### Callback Route

```typescript
// src/runtime/server/routes/auth/callback.get.ts

import { defineEventHandler, getQuery, sendRedirect, createError } from 'h3'
import { useAsgardeoServer } from '../../utils/asgardeo-server'

export default defineEventHandler(async (event) => {
  const client = useAsgardeoServer()
  const query = getQuery(event)
  
  // Check for OAuth error response
  if (query.error) {
    throw createError({
      statusCode: 401,
      message: `OAuth error: ${query.error} - ${query.error_description || ''}`,
    })
  }
  
  const code = query.code as string
  const state = query.state as string
  
  if (!code || !state) {
    throw createError({
      statusCode: 400,
      message: 'Missing code or state parameter',
    })
  }
  
  // Retrieve temp session
  const tempSession = await client.getTempSession(event)
  if (!tempSession) {
    throw createError({
      statusCode: 400,
      message: 'Invalid or expired session. Please try signing in again.',
    })
  }
  
  // Validate state parameter (CSRF protection)
  if (tempSession.state !== state) {
    throw createError({
      statusCode: 400,
      message: 'State mismatch. Possible CSRF attack.',
    })
  }
  
  try {
    // Exchange authorization code for tokens
    const tokens = await client.exchangeCodeForTokens(code, {
      codeVerifier: tempSession.codeVerifier,
      callbackUrl: `${getRequestURL(event).origin}${useRuntimeConfig().public.asgardeo.apiRoutePrefix}/callback`,
    })
    
    // Create persistent session
    await client.createSession(event, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      idToken: tokens.idToken,
      accessTokenExpiresAt: Date.now() + (tokens.expiresIn * 1000),
      sessionId: tempSession.sessionId,
      userId: tokens.userId,
      scopes: tokens.scopes,
      organizationId: tokens.organizationId,
    })
    
    // Clear temp session cookie
    await client.destroyTempSession(event)
    
    // Redirect to afterSignInUrl
    return sendRedirect(event, tempSession.afterSignInUrl || '/', 302)
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to exchange authorization code for tokens.',
    })
  }
})
```

### Sign-Out Route

```typescript
// src/runtime/server/routes/auth/signout.ts

import { defineEventHandler, sendRedirect, getQuery } from 'h3'
import { useAsgardeoServer } from '../../utils/asgardeo-server'

export default defineEventHandler(async (event) => {
  const client = useAsgardeoServer()
  const config = useRuntimeConfig().public.asgardeo
  const query = getQuery(event)
  
  const afterSignOutUrl = (query.returnTo as string) || config.afterSignOutUrl
  
  // Get current session
  const session = await client.getSession(event)
  
  if (session) {
    try {
      // Revoke refresh token at Asgardeo
      if (session.refreshToken) {
        await client.revokeToken(session.refreshToken)
      }
      
      // Get OIDC end_session_endpoint for RP-Initiated Logout
      const endSessionUrl = await client.getEndSessionUrl({
        idTokenHint: session.idToken,
        postLogoutRedirectUri: `${getRequestURL(event).origin}${afterSignOutUrl}`,
      })
      
      // Destroy local session
      await client.destroySession(event)
      
      // Redirect to Asgardeo logout if available, otherwise local redirect
      if (endSessionUrl) {
        return sendRedirect(event, endSessionUrl, 302)
      }
    } catch {
      // Best-effort: still destroy local session even if revocation fails
      await client.destroySession(event)
    }
  }
  
  return sendRedirect(event, afterSignOutUrl, 302)
})
```

### Session Route

```typescript
// src/runtime/server/routes/auth/session.get.ts

import { defineEventHandler } from 'h3'
import { useAsgardeoServer } from '../../utils/asgardeo-server'

export default defineEventHandler(async (event) => {
  const client = useAsgardeoServer()
  const session = await client.getSession(event)
  
  if (!session) {
    return {
      isSignedIn: false,
      user: null,
      sessionId: null,
      organizationId: null,
    }
  }
  
  return {
    isSignedIn: true,
    user: session.user || null,
    sessionId: session.sessionId,
    organizationId: session.organizationId || null,
    scopes: session.scopes,
  }
})
```

### Token Route

```typescript
// src/runtime/server/routes/auth/token.get.ts

import { defineEventHandler, createError } from 'h3'
import { useAsgardeoServer } from '../../utils/asgardeo-server'

export default defineEventHandler(async (event) => {
  const client = useAsgardeoServer()
  const accessToken = await client.getSessionAccessToken(event)
  
  if (!accessToken) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  return { accessToken }
})
```

### User Profile Routes

```typescript
// src/runtime/server/routes/auth/user.get.ts

import { defineEventHandler, createError } from 'h3'
import { useAsgardeoServer } from '../../utils/asgardeo-server'

export default defineEventHandler(async (event) => {
  const client = useAsgardeoServer()
  const session = await client.getSession(event)
  
  if (!session) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  // Get user info from Asgardeo (or from cached session)
  const user = await client.getUser(session.accessToken)
  return user
})
```

```typescript
// src/runtime/server/routes/auth/user.profile.get.ts

import { defineEventHandler, createError } from 'h3'
import { useAsgardeoServer } from '../../utils/asgardeo-server'

export default defineEventHandler(async (event) => {
  const client = useAsgardeoServer()
  const accessToken = await client.getSessionAccessToken(event)
  
  if (!accessToken) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const profile = await client.getUserProfile(accessToken)
  return profile
})
```

```typescript
// src/runtime/server/routes/auth/user.profile.patch.ts

import { defineEventHandler, readBody, createError } from 'h3'
import { useAsgardeoServer } from '../../utils/asgardeo-server'

export default defineEventHandler(async (event) => {
  const client = useAsgardeoServer()
  const accessToken = await client.getSessionAccessToken(event)
  
  if (!accessToken) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  
  const updates = await readBody(event)
  const updatedProfile = await client.updateUserProfile(accessToken, updates)
  return updatedProfile
})
```

---

## Server Middleware (Route Protection)

```typescript
// src/runtime/server/middleware/auth-protection.ts

import { defineEventHandler, createError, getRequestURL } from 'h3'
import { useAsgardeoServer } from '../utils/asgardeo-server'
import { createRouteMatcher } from '../../utils/route-matcher'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig().public.asgardeo
  
  // Skip auth routes themselves
  if (getRequestURL(event).pathname.startsWith(config.apiRoutePrefix)) {
    return
  }
  
  // Skip if no protected routes configured
  if (!config.protectedRoutes?.length) {
    return
  }
  
  const isProtected = createRouteMatcher(config.protectedRoutes)
  const isPublic = createRouteMatcher(config.publicRoutes || [])
  const path = getRequestURL(event).pathname
  
  // Public routes override protected routes
  if (isPublic(path)) return
  
  // Check if route is protected
  if (!isProtected(path)) return
  
  // Validate session
  const client = useAsgardeoServer()
  const session = await client.getSession(event)
  
  if (!session) {
    // For API routes, return 401
    if (path.startsWith('/api/')) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
    // For page routes, could redirect to sign-in (handled by client middleware)
  }
})
```

---

## Server Plugin

```typescript
// src/runtime/plugins/asgardeo.server.ts

import { defineNuxtPlugin, useState } from '#app'
import { useAsgardeoServer } from '../server/utils/asgardeo-server'

export default defineNuxtPlugin({
  name: 'asgardeo-server',
  enforce: 'pre',
  
  async setup(nuxtApp) {
    // Only runs on server during SSR
    if (!import.meta.server) return
    
    const event = nuxtApp.ssrContext?.event
    if (!event) return
    
    const client = useAsgardeoServer()
    
    // Read session from cookie during SSR
    const session = await client.getSession(event)
    
    // Hydrate auth state for client via useState
    const authState = useState('asgardeo:auth', () => ({
      isSignedIn: !!session,
      isLoading: false,
      user: session?.user || null,
      sessionId: session?.sessionId || null,
      organizationId: session?.organizationId || null,
      scopes: session?.scopes || [],
    }))
  },
})
```
