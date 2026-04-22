# 12 — Security Requirements

## Overview

Per IAM SDK Specification §11, security is not optional. The Nuxt SDK enforces security at every layer.

---

## PKCE (Proof Key for Code Exchange)

**Requirement:** §11.2 — All authorization code flows MUST use PKCE.

| Aspect | Implementation |
|--------|---------------|
| Where | Server-side, in `signin.get.ts` |
| Generator | `@asgardeo/node` handles PKCE generation (code_verifier + code_challenge with S256) |
| Storage | code_verifier stored in signed temp session cookie (HTTP-only) |
| Verification | Sent in token exchange request to Asgardeo's `/oauth2/token` endpoint |
| Client exposure | ❌ Never — client never sees the code_verifier |

```typescript
// In signin.get.ts (pseudocode)
const { url, codeVerifier, state } = await client.signIn(/* ... */)
await sessionManager.createTempSession(event, { codeVerifier, state, /* ... */ })
// codeVerifier is securely stored in a signed, HTTP-only, short-lived cookie
```

---

## State Parameter (CSRF Protection)

**Requirement:** §11.3 — State parameter MUST be cryptographically random and validated on callback.

| Aspect | Implementation |
|--------|---------------|
| Generation | Cryptographic random via `@asgardeo/node` (uses `crypto.randomBytes`) |
| Storage | Inside the temp session JWT cookie (tied to the browser session) |
| Validation | `callback.get.ts` compares `state` query param against stored value |
| Failure mode | Mismatch → 400 error, flow aborted |

```typescript
// In callback.get.ts
if (tempSession.state !== query.state) {
  throw createError({
    statusCode: 400,
    message: 'State mismatch. Possible CSRF attack.',
  })
}
```

---

## Cookie Security

### Session Cookie

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| `httpOnly` | `true` (always) | Prevents JavaScript access → XSS can't steal session |
| `secure` | `true` in production | Prevents transmission over HTTP |
| `sameSite` | `lax` (default) | Allows OAuth redirect, blocks cross-site sub-requests |
| `path` | `/` | Available on all routes |
| `maxAge` | 86400 (configurable) | 24-hour default, matches session JWT expiry |
| Signed | Yes (JWT with HS256) | Tamper-proof — modification invalidates signature |

### Temp Session Cookie

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| `httpOnly` | `true` (always) | Prevents JavaScript access to PKCE verifier |
| `secure` | `true` in production | — |
| `sameSite` | `lax` | Must survive the OAuth redirect |
| `maxAge` | 300 (5 minutes) | Short-lived — only needed during OAuth flow |
| Signed | Yes (JWT with HS256) | — |

---

## Secret Management

### Client Secret

| Rule | Enforcement |
|------|-------------|
| MUST be set via `ASGARDEO_CLIENT_SECRET` env var | Module warns if set in `nuxt.config.ts` directly |
| MUST NOT appear in client bundle | Stored in `runtimeConfig.asgardeo` (private), not `runtimeConfig.public` |
| MUST NOT be logged | Token masking in all debug logs |

### Session Secret

| Rule | Enforcement |
|------|-------------|
| MUST be set via `ASGARDEO_SESSION_SECRET` env var | Required in production; auto-generated in dev |
| Minimum 32 characters | Validated at module setup |
| Unique per environment | Documented requirement |

### Enforcement in Module Setup

```typescript
// In module.ts

// Ensure clientSecret never leaks to public config
if (nuxt.options.runtimeConfig.public?.asgardeo?.clientSecret) {
  delete nuxt.options.runtimeConfig.public.asgardeo.clientSecret
  console.error(
    '[asgardeo] SECURITY: clientSecret was found in public runtime config. ' +
    'It has been removed. Use ASGARDEO_CLIENT_SECRET env var instead.'
  )
}

// Ensure sessionSecret never leaks
if (nuxt.options.runtimeConfig.public?.asgardeo?.sessionSecret) {
  delete nuxt.options.runtimeConfig.public.asgardeo.sessionSecret
  console.error(
    '[asgardeo] SECURITY: sessionSecret was found in public runtime config. ' +
    'It has been removed. Use ASGARDEO_SESSION_SECRET env var instead.'
  )
}
```

---

## HTTPS Enforcement

```typescript
// Production validation
if (process.env.NODE_ENV === 'production') {
  if (!config.baseUrl.startsWith('https://')) {
    throw new AsgardeoError(
      ErrorCodes.CONFIG_INSECURE,
      'baseUrl must use HTTPS in production. ' +
      'Set NUXT_PUBLIC_ASGARDEO_BASE_URL to an https:// URL.'
    )
  }
}
```

---

## Token Security

| Token | Storage Location | Accessible to Client JS | Transmitted Over |
|-------|-----------------|------------------------|------------------|
| Access Token | Session JWT cookie (server) | Only via `getAccessToken()` server route | HTTPS only |
| Refresh Token | Session JWT cookie (server) | ❌ Never | Server-to-Asgardeo only |
| ID Token | Session JWT cookie (server) | ❌ Never (used for logout hint) | Server-to-Asgardeo only |
| PKCE Code Verifier | Temp session cookie (server) | ❌ Never | Server-to-Asgardeo only |
| User Claims | SSR hydration payload + composable | ✅ (non-sensitive claims only) | HTTPS |

### Access Token Exposure

The `getAccessToken()` composable returns the access token to the client. This is intentional — the client needs it to make API calls. However:

- The token is **short-lived** (5-60 minutes)
- The token is obtained **on-demand** from the server route, not stored client-side persistently
- The token is **scoped** — it only grants access to authorized resources
- The token is **never stored in localStorage/sessionStorage** (XSS risk)

---

## Input Validation

All server routes validate input:

```typescript
// Example: organization switch
const { organizationId } = await readBody(event)

if (!organizationId || typeof organizationId !== 'string') {
  throw createError({
    statusCode: 400,
    message: 'organizationId is required and must be a string',
  })
}

// Prevent path traversal / injection in org ID
if (!/^[a-zA-Z0-9-_]+$/.test(organizationId)) {
  throw createError({
    statusCode: 400,
    message: 'Invalid organizationId format',
  })
}
```

---

## Open Redirect Prevention

The `returnTo` parameter (used in sign-in/sign-out) must be validated:

```typescript
// src/runtime/server/utils/url-validation.ts

/**
 * Validate that a return URL is safe (same-origin or relative).
 * Prevents open redirect attacks.
 */
export function validateReturnUrl(returnTo: string, requestOrigin: string): string {
  // Allow relative paths
  if (returnTo.startsWith('/')) return returnTo
  
  // Allow same-origin URLs
  try {
    const url = new URL(returnTo)
    const origin = new URL(requestOrigin)
    if (url.origin === origin.origin) return returnTo
  } catch {
    // Invalid URL — fall through to default
  }
  
  // Reject all other URLs (could be open redirect)
  return '/'
}
```

---

## Security Headers

The module can optionally add security headers to auth responses:

```typescript
// In server routes
setResponseHeaders(event, {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
})
```

---

## Security Checklist

| # | Requirement | Status | Implementation |
|---|-------------|--------|---------------|
| 1 | PKCE on all auth code flows | ✅ | `@asgardeo/node` generates PKCE; verifier in temp cookie |
| 2 | State parameter with validation | ✅ | Random state in temp cookie; validated on callback |
| 3 | HTTP-only session cookies | ✅ | `httpOnly: true` on all auth cookies |
| 4 | Secure cookies in production | ✅ | `secure: true` when `NODE_ENV === 'production'` |
| 5 | Signed session tokens | ✅ | JWT with HS256 using session secret |
| 6 | Client secret server-only | ✅ | Private runtime config, never in client bundle |
| 7 | No tokens in client storage | ✅ | Tokens in HTTP-only cookies; client gets via server route |
| 8 | Token refresh server-side | ✅ | Refresh token never exposed to client |
| 9 | HTTPS enforcement (production) | ✅ | Config validation at module setup |
| 10 | Open redirect prevention | ✅ | `validateReturnUrl()` on all redirect targets |
| 11 | Input validation | ✅ | All server routes validate body/query params |
| 12 | Token masking in logs | ✅ | `maskToken()` utility for all debug logging |
| 13 | Session expiry | ✅ | JWT `exp` claim + cookie `maxAge` |
| 14 | CSRF protection | ✅ | State parameter + SameSite=Lax cookies |
