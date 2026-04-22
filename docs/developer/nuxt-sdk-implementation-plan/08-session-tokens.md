# 08 — Session & Token Management

## Overview

Session management is the most critical server-side concern. The Nuxt SDK uses **signed JWT cookies** for sessions — the same proven pattern used by the Next.js SDK's `SessionManager`, but improved.

---

## Session Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Session Lifecycle                          │
│                                                              │
│  1. Temp Session (during OAuth redirect)                     │
│     Cookie: asgardeo-temp-session                           │
│     Payload: { sessionId, state, codeVerifier, returnTo }   │
│     Max-Age: 300 seconds (5 min)                            │
│     Purpose: Hold PKCE + state between redirect ↔ callback  │
│                                                              │
│  2. Persistent Session (after successful auth)               │
│     Cookie: asgardeo-session                                │
│     Payload: signed JWT with session claims                  │
│     Max-Age: configurable (default: 24h)                    │
│     Purpose: Maintain auth state across requests             │
│                                                              │
│  3. No Session (signed out)                                  │
│     No cookies present                                       │
│     All composables return isSignedIn=false                  │
└─────────────────────────────────────────────────────────────┘
```

---

## SessionManager Implementation

```typescript
// src/runtime/server/session-manager.ts

import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { getCookie, setCookie, deleteCookie, type H3Event } from 'h3'
import type { AsgardeoNuxtCookieConfig } from '../types'

// ── Session Payload Types ─────────────────────────────────

export interface SessionPayload extends JWTPayload {
  /** User's access token */
  accessToken: string
  /** Refresh token (for silent refresh) */
  refreshToken?: string
  /** ID token (for RP-Initiated Logout) */
  idToken?: string
  /** Access token expiry timestamp (ms) */
  accessTokenExpiresAt: number
  /** Unique session identifier */
  sessionId: string
  /** Authenticated user's ID */
  userId?: string
  /** User's display name */
  userName?: string
  /** OAuth2 scopes granted */
  scopes?: string[]
  /** Current organization ID */
  organizationId?: string
  /** Basic user claims (from ID token) */
  user?: {
    sub: string
    email?: string
    name?: string
    picture?: string
    [key: string]: unknown
  }
}

export interface TempSessionPayload extends JWTPayload {
  /** Session ID for correlation */
  sessionId: string
  /** OAuth2 state parameter */
  state: string
  /** PKCE code verifier */
  codeVerifier: string
  /** URL to redirect to after sign-in */
  afterSignInUrl: string
}

// ── SessionManager Class ──────────────────────────────────

export class SessionManager {
  private secret: Uint8Array
  private cookieConfig: Required<AsgardeoNuxtCookieConfig>
  
  private static readonly TEMP_COOKIE_NAME = 'asgardeo-temp-session'
  private static readonly TEMP_MAX_AGE = 300  // 5 minutes
  
  constructor(sessionSecret: string, cookieConfig?: AsgardeoNuxtCookieConfig) {
    // Derive key from secret
    this.secret = new TextEncoder().encode(sessionSecret)
    
    this.cookieConfig = {
      name: cookieConfig?.name ?? 'asgardeo-session',
      maxAge: cookieConfig?.maxAge ?? 86400,    // 24 hours
      path: cookieConfig?.path ?? '/',
      sameSite: cookieConfig?.sameSite ?? 'lax',
      domain: cookieConfig?.domain ?? '',
    }
  }
  
  // ── Persistent Session ────────────────────────────────
  
  /**
   * Create a signed session JWT and set it as an HTTP-only cookie.
   */
  async createSession(event: H3Event, payload: SessionPayload): Promise<void> {
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${this.cookieConfig.maxAge}s`)
      .sign(this.secret)
    
    setCookie(event, this.cookieConfig.name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: this.cookieConfig.sameSite,
      maxAge: this.cookieConfig.maxAge,
      path: this.cookieConfig.path,
      ...(this.cookieConfig.domain && { domain: this.cookieConfig.domain }),
    })
  }
  
  /**
   * Read and verify the session JWT from the cookie.
   * Returns null if no cookie, expired, or invalid signature.
   */
  async getSession(event: H3Event): Promise<SessionPayload | null> {
    const token = getCookie(event, this.cookieConfig.name)
    if (!token) return null
    
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        algorithms: ['HS256'],
      })
      return payload as SessionPayload
    } catch {
      // Invalid or expired token — destroy stale cookie
      this.destroySession(event)
      return null
    }
  }
  
  /**
   * Update an existing session (e.g., after token refresh).
   */
  async updateSession(
    event: H3Event,
    updater: (session: SessionPayload) => SessionPayload
  ): Promise<SessionPayload | null> {
    const session = await this.getSession(event)
    if (!session) return null
    
    const updated = updater(session)
    await this.createSession(event, updated)
    return updated
  }
  
  /**
   * Delete the session cookie.
   */
  destroySession(event: H3Event): void {
    deleteCookie(event, this.cookieConfig.name, {
      path: this.cookieConfig.path,
      ...(this.cookieConfig.domain && { domain: this.cookieConfig.domain }),
    })
  }
  
  // ── Temp Session (OAuth flow) ─────────────────────────
  
  /**
   * Create a short-lived temp session for the OAuth redirect flow.
   * Stores PKCE code_verifier, state, and session ID.
   */
  async createTempSession(event: H3Event, payload: TempSessionPayload): Promise<void> {
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${SessionManager.TEMP_MAX_AGE}s`)
      .sign(this.secret)
    
    setCookie(event, SessionManager.TEMP_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SessionManager.TEMP_MAX_AGE,
      path: '/',
    })
  }
  
  /**
   * Read and verify the temp session JWT.
   */
  async getTempSession(event: H3Event): Promise<TempSessionPayload | null> {
    const token = getCookie(event, SessionManager.TEMP_COOKIE_NAME)
    if (!token) return null
    
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        algorithms: ['HS256'],
      })
      return payload as TempSessionPayload
    } catch {
      this.destroyTempSession(event)
      return null
    }
  }
  
  /**
   * Delete the temp session cookie.
   */
  destroyTempSession(event: H3Event): void {
    deleteCookie(event, SessionManager.TEMP_COOKIE_NAME, { path: '/' })
  }
}
```

---

## Token Lifecycle

### Token Types

| Token | Storage | Lifetime | Accessible to Client |
|-------|---------|----------|---------------------|
| Access Token | Inside session JWT cookie | Short (5-60 min) | Via `getAccessToken()` server route |
| Refresh Token | Inside session JWT cookie | Long (hours-days) | ❌ Never |
| ID Token | Inside session JWT cookie | Short | ❌ Never (used for logout hint only) |
| Session JWT | HTTP-only cookie | Configurable (default 24h) | ❌ Never directly |

### Token Refresh Flow

```typescript
// src/runtime/server/utils/token-refresh.ts

/**
 * Get a valid access token, refreshing if expired.
 * Called by server routes that need to make API calls on behalf of the user.
 */
export async function getValidAccessToken(
  event: H3Event,
  client: AsgardeoNuxtServerClient,
  sessionManager: SessionManager,
): Promise<string | null> {
  const session = await sessionManager.getSession(event)
  if (!session) return null
  
  // Check if access token is still valid (with 30s buffer)
  const isExpired = session.accessTokenExpiresAt < (Date.now() + 30_000)
  
  if (!isExpired) {
    return session.accessToken
  }
  
  // Token expired — refresh it
  if (!session.refreshToken) {
    // No refresh token available — user needs to re-authenticate
    sessionManager.destroySession(event)
    return null
  }
  
  try {
    const tokens = await client.refreshAccessToken(session.refreshToken)
    
    // Update session with new tokens
    await sessionManager.updateSession(event, (s) => ({
      ...s,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || s.refreshToken,
      accessTokenExpiresAt: Date.now() + (tokens.expiresIn * 1000),
    }))
    
    return tokens.accessToken
  } catch (error) {
    // Refresh failed (refresh token may be revoked/expired)
    sessionManager.destroySession(event)
    return null
  }
}
```

---

## Cookie Configuration

### Defaults

```typescript
{
  name: 'asgardeo-session',
  httpOnly: true,           // Always — prevents XSS access to session
  secure: true,             // In production (uses process.env.NODE_ENV)
  sameSite: 'lax',          // Allows redirect-based OAuth flow
  path: '/',                // Available on all routes
  maxAge: 86400,            // 24 hours (configurable)
}
```

### Why SameSite=Lax?

- `strict` would prevent the session cookie from being sent on the OAuth callback redirect (because it's a cross-site redirect from Asgardeo). This breaks the callback flow.
- `lax` allows cookies on top-level navigations (like the OAuth redirect) but blocks cross-site sub-requests.
- `none` is overly permissive and requires `Secure`.

### Cookie Size Considerations

JWT cookies can grow large. Mitigation:

1. **Store only essential claims** in the JWT — don't embed the full user profile
2. **User profile data is fetched on-demand** via server routes, not stored in the cookie
3. **The session JWT contains**: accessToken, refreshToken, idToken, sessionId, userId, scopes, organizationId, basic user claims (sub, email, name, picture)
4. **Size estimate**: ~1.5-2.5 KB (well within the 4KB cookie limit)

If the session grows too large:
- Split into multiple cookies (chunked cookies pattern)
- Or use server-side session storage (Redis, etc.) and store only a session ID in the cookie

---

## Session Secret

The `ASGARDEO_SESSION_SECRET` environment variable is used to sign/verify session JWTs.

### Requirements

- **Minimum 32 characters** (256 bits of entropy)
- **Random, unpredictable** — use `openssl rand -base64 32` or equivalent
- **Unique per environment** — different secrets for dev, staging, production
- **Rotate periodically** — old sessions will be invalidated on rotation

### Auto-Generation (Development Only)

If no session secret is provided in development, the module generates a random one at startup and logs a warning:

```typescript
if (!config.sessionSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new AsgardeoError(
      ErrorCodes.CONFIG_MISSING_REQUIRED,
      'ASGARDEO_SESSION_SECRET must be set in production.'
    )
  }
  
  // Generate random secret for dev (not persistent across restarts)
  const { randomBytes } = await import('node:crypto')
  config.sessionSecret = randomBytes(32).toString('base64')
  
  console.warn(
    '[asgardeo] Using auto-generated session secret. ' +
    'Sessions will not persist across server restarts. ' +
    'Set ASGARDEO_SESSION_SECRET for persistent sessions.'
  )
}
```

---

## Improvements Over Current SDK

| Aspect | Current SDK | New SDK |
|--------|-------------|---------|
| Session identifier | Raw UUID stored in cookie | Signed JWT — tamper-proof |
| Token storage | Unclear / in-memory on server | Inside signed JWT cookie — stateless |
| Token refresh | Not implemented | Automatic, transparent to client |
| PKCE storage | Not explicitly handled | In temp session JWT cookie |
| State validation | Not implemented | Cryptographic state in temp cookie |
| Cookie security | Configurable, can be insecure | Enforced HTTP-only, Secure in prod |
| Session expiry | No explicit expiry | JWT `exp` claim + cookie `maxAge` |

## Improvements Over Next.js SDK

| Aspect | Next.js SDK | Nuxt SDK |
|--------|-------------|----------|
| Session Manager | Instance method on singleton | Standalone class, testable |
| Token refresh | Not clearly implemented | Explicit `getValidAccessToken()` with refresh |
| Temp session | Uses separate `temp-session` cookie | Same pattern but with proper TTL and validation |
| Cookie chunking | Not supported | Designed for extension (chunked cookies if needed) |
| Session update | Recreates entire session | `updateSession()` with atomic updater function |
