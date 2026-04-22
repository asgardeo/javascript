# Asgardeo Nuxt.js SDK vs Next.js SDK — Full Evaluation & Comparison

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Comparison](#architecture-comparison)
3. [Feature-by-Feature Comparison](#feature-by-feature-comparison)
4. [What the Nuxt SDK Does Well](#what-the-nuxt-sdk-does-well)
5. [What the Nuxt SDK Does Badly](#what-the-nuxt-sdk-does-badly)
6. [What the Nuxt SDK Is Missing](#what-the-nuxt-sdk-is-missing)
7. [Client/Server Boundary Analysis](#clientserver-boundary-analysis)
8. [Recommendations](#recommendations)
9. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

The **Asgardeo Next.js SDK (`@asgardeo/nextjs`)** is a mature, feature-rich SDK (v0.3.9) that provides a complete authentication experience with UI components, organization management, embedded sign-in flows, branding/theming, and deep React ecosystem integration. It leverages `@asgardeo/react` for client-side UI and `@asgardeo/node` for server-side auth.

The **Asgardeo Nuxt.js SDK (`@asgardeo/nuxt`)** is an early-stage SDK (v0.0.0) that provides server-side auth flows via Nitro server routes and a minimal client composable. It uses `@asgardeo/node` directly but **does not use `@asgardeo/vue` at all**, missing the entire client-side UI component ecosystem.

**The gap is significant.** The Nuxt SDK covers ~20% of the feature surface the Next.js SDK provides. The core OAuth flow works, but the developer experience, UI components, organization features, and embedded flows are entirely absent.

---

## Architecture Comparison

### Next.js SDK Architecture

```
@asgardeo/nextjs
├── Entry: @asgardeo/nextjs (client exports)
│   └── Re-exports from @asgardeo/react
│       ├── useAsgardeo hook
│       ├── SignedIn, SignedOut (control components)
│       ├── SignInButton, SignOutButton, SignUpButton (action components)
│       ├── SignIn, SignUp, User, UserDropdown, UserProfile (presentation)
│       ├── Organization, OrganizationProfile, OrganizationSwitcher
│       └── CreateOrganization
│
├── Entry: @asgardeo/nextjs/server
│   ├── AsgardeoProvider (RSC → wraps React AsgardeoProvider)
│   │   ├── Initializes AsgardeoNextClient singleton
│   │   ├── Fetches session, user, organizations, branding on server
│   │   └── Passes server actions + data to client AsgardeoProvider
│   ├── asgardeo() — server-side auth client
│   ├── asgardeoMiddleware — Next.js edge middleware
│   └── createRouteMatcher
│
├── Server Actions ('use server')
│   ├── signInAction (redirect + embedded flows)
│   ├── signOutAction
│   ├── handleOAuthCallbackAction
│   ├── getAccessToken (reads from JWT cookie)
│   ├── getUserAction, getUserProfileAction, updateUserProfileAction
│   ├── isSignedIn, getSessionId, getSessionPayload
│   ├── switchOrganization (token exchange)
│   ├── createOrganization, getAllOrganizations, getMyOrganizations
│   ├── getBrandingPreference
│   └── getOrganizationAction, getCurrentOrganizationAction
│
├── AsgardeoNextClient (extends AsgardeoNodeClient)
│   ├── Singleton pattern
│   ├── Wraps LegacyAsgardeoNodeClient
│   ├── SCIM2 user profile, organization APIs
│   ├── Embedded sign-in/sign-up flow support
│   └── Token exchange for org switch
│
└── Session Management (jose JWT)
    ├── SessionManager — create/verify session + temp session JWTs
    └── sessionUtils — middleware-compatible session readers
```

### Nuxt.js SDK Architecture

```
@asgardeo/nuxt
├── Entry: @asgardeo/nuxt (single entry point)
│   ├── Nuxt module definition (defineNuxtModule)
│   └── Exports: types, createRouteMatcher, UseAsgardeoReturn
│
├── Client
│   ├── Plugin (asgardeo.ts) — hydrates SSR auth state into useState
│   ├── Composable: useAsgardeo() — isSignedIn, user, signIn, signOut, getAccessToken, refreshUser
│   └── Middleware: auth — route protection via defineNuxtRouteMiddleware
│
├── Server (Nitro)
│   ├── Plugin: auth-state.ts — resolves auth on SSR requests
│   ├── Routes:
│   │   ├── /api/auth/signin — initiates OAuth with PKCE
│   │   ├── /api/auth/callback — exchanges code for tokens
│   │   ├── /api/auth/signout — RP-Initiated Logout
│   │   ├── /api/auth/session — returns auth state JSON
│   │   ├── /api/auth/token — returns access token
│   │   └── /api/auth/user — returns user info
│   └── Utils:
│       ├── client.ts — singleton LegacyAsgardeoNodeClient factory
│       ├── session.ts — JWT session management (jose)
│       └── serverSession.ts — useServerSession, requireServerSession
│
└── No UI components, no @asgardeo/vue dependency
```

### Key Architectural Differences

| Aspect | Next.js SDK | Nuxt SDK |
|--------|-------------|----------|
| **Package dependencies** | `@asgardeo/node` + `@asgardeo/react` | `@asgardeo/node` only |
| **Client UI framework** | Full React component library via `@asgardeo/react` | None — no `@asgardeo/vue` dependency |
| **Server-client bridge** | Server Actions (`'use server'`) | Nitro server routes (HTTP API) |
| **Auth flow** | Server Actions called directly from client | Client fetches server API endpoints |
| **Entry points** | Dual: `@asgardeo/nextjs` (client) + `@asgardeo/nextjs/server` | Single: `@asgardeo/nuxt` |
| **Client class** | `AsgardeoNextClient extends AsgardeoNodeClient` (singleton) | Direct `LegacyAsgardeoNodeClient` usage |
| **PKCE** | Disabled (uses client secret) | Enabled |
| **Sign-in modes** | Redirect + Embedded | Redirect only |

---

## Feature-by-Feature Comparison

### Authentication Core

| Feature | Next.js SDK | Nuxt SDK | Status |
|---------|-------------|----------|--------|
| OAuth2 Authorization Code flow | ✅ | ✅ | **Parity** |
| PKCE support | ❌ (uses client secret) | ✅ | Nuxt is actually better here |
| JWT session cookies (httpOnly) | ✅ | ✅ | **Parity** |
| Temp session for OAuth flow | ✅ | ✅ | **Parity** |
| Session secret validation | ✅ (required in prod) | ✅ (required in prod) | **Parity** |
| Sign-in with returnTo | ✅ | ✅ | **Parity** |
| Open redirect prevention | ✅ (via middleware) | ✅ (validates relative path) | **Parity** |
| RP-Initiated Logout | ✅ | ✅ | **Parity** |
| Cookie security (httpOnly, secure, sameSite) | ✅ | ✅ | **Parity** |
| Access token retrieval | ✅ (server action) | ✅ (API route) | **Parity** |
| Embedded sign-in flow | ✅ | ❌ | **Missing** |
| Embedded sign-up flow | ✅ | ❌ | **Missing** |
| Token refresh / rotation | ❌ | ❌ | Both missing |

### Session Management

| Feature | Next.js SDK | Nuxt SDK | Status |
|---------|-------------|----------|--------|
| JWT-based sessions | ✅ (jose) | ✅ (jose) | **Parity** |
| Session verification | ✅ | ✅ | **Parity** |
| Temp session JWT | ✅ | ✅ | **Parity** |
| Server-side session access | ✅ (getSessionPayload) | ✅ (useServerSession/requireServerSession) | **Parity** |
| Middleware-compatible session | ✅ (sessionUtils for NextRequest) | ✅ (Nitro plugin reads cookies) | **Parity** |
| Session in custom API routes | ✅ (import getSessionId) | ✅ (useServerSession auto-import) | Nuxt DX is better here |

### SSR & Hydration

| Feature | Next.js SDK | Nuxt SDK | Status |
|---------|-------------|----------|--------|
| SSR auth state resolution | ✅ (AsgardeoProvider RSC) | ✅ (Nitro plugin → useState) | **Parity** |
| No loading flash | ✅ | ✅ | **Parity** |
| Server → client state bridge | ✅ (RSC → Client Component props) | ✅ (event.context → useState) | **Parity** |
| SSR user data fetch | ✅ (SCIM2 /Me + schemas) | ✅ (client.getUser) | Partial parity |
| SSR organization fetch | ✅ | ❌ | **Missing** |
| SSR branding fetch | ✅ | ❌ | **Missing** |

### Client-Side UI Components

| Feature | Next.js SDK | Nuxt SDK | Status |
|---------|-------------|----------|--------|
| `useAsgardeo` hook/composable | ✅ (full: signIn, signOut, signUp, user, org, etc.) | ✅ (basic: signIn, signOut, getAccessToken, refreshUser) | **Partial** |
| `SignedIn` component | ✅ | ❌ | **Missing** |
| `SignedOut` component | ✅ | ❌ | **Missing** |
| `Loading` component | ✅ | ❌ | **Missing** |
| `SignInButton` | ✅ | ❌ | **Missing** |
| `SignOutButton` | ✅ | ❌ | **Missing** |
| `SignUpButton` | ✅ | ❌ | **Missing** |
| `SignIn` (embedded form) | ✅ | ❌ | **Missing** |
| `SignUp` (embedded form) | ✅ | ❌ | **Missing** |
| `User` component | ✅ | ❌ | **Missing** |
| `UserDropdown` | ✅ | ❌ | **Missing** |
| `UserProfile` | ✅ | ❌ | **Missing** |
| `Organization` | ✅ | ❌ | **Missing** |
| `OrganizationProfile` | ✅ | ❌ | **Missing** |
| `OrganizationSwitcher` | ✅ | ❌ | **Missing** |
| `OrganizationList` | ✅ (via React) | ❌ | **Missing** |
| `CreateOrganization` | ✅ | ❌ | **Missing** |
| `LanguageSwitcher` | ✅ (via React) | ❌ | **Missing** |

### Organization Management

| Feature | Next.js SDK | Nuxt SDK | Status |
|---------|-------------|----------|--------|
| Get current organization | ✅ | ❌ | **Missing** |
| Switch organization (token exchange) | ✅ | ❌ | **Missing** |
| List my organizations | ✅ | ❌ | **Missing** |
| List all organizations | ✅ | ❌ | **Missing** |
| Create organization | ✅ | ❌ | **Missing** |
| Get organization details | ✅ | ❌ | **Missing** |
| Organization-scoped base URL | ✅ (auto `/o` suffix) | ❌ | **Missing** |

### Branding & Theming

| Feature | Next.js SDK | Nuxt SDK | Status |
|---------|-------------|----------|--------|
| Branding preference fetch | ✅ | ❌ | **Missing** |
| Theme provider | ✅ (via React) | ❌ | **Missing** |
| I18n provider | ✅ (via React) | ❌ | **Missing** |
| Customizable themes | ✅ | ❌ | **Missing** |

### Middleware & Route Protection

| Feature | Next.js SDK | Nuxt SDK | Status |
|---------|-------------|----------|--------|
| Route protection middleware | ✅ (asgardeoMiddleware) | ✅ (defineNuxtRouteMiddleware) | **Different approach** |
| createRouteMatcher | ✅ (regex-based, NextRequest) | ✅ (glob-based, path string) | **Parity** |
| Middleware context (isSignedIn, getSession, protectRoute) | ✅ (rich context object) | ❌ (simple redirect) | **Missing** |
| Global middleware support | ✅ | ❌ (named middleware only) | **Missing** |
| OAuth callback detection in middleware | ✅ (validates temp session) | ❌ | **Missing** |

### Developer Experience

| Feature | Next.js SDK | Nuxt SDK | Status |
|---------|-------------|----------|--------|
| Auto-import composables | ✅ (via Next.js) | ✅ (via Nuxt module) | **Parity** |
| Auto-import server utils | N/A | ✅ (useServerSession, requireServerSession, useAsgardeoServerClient) | Nuxt is better here |
| Env var configuration | ✅ (NEXT_PUBLIC_ASGARDEO_*) | ✅ (NUXT_PUBLIC_ASGARDEO_*) | **Parity** |
| Runtime config integration | ❌ (env vars only) | ✅ (nuxt.config + runtimeConfig) | Nuxt is better here |
| Config validation | ❌ | ✅ (warns on missing baseUrl/clientId) | Nuxt is better here |
| Secret leak prevention | ❌ | ✅ (explicit public config sanitization) | Nuxt is better here |
| Typed runtime config | ❌ | ✅ (module augments @nuxt/schema) | Nuxt is better here |
| Error codes | ✅ (AsgardeoRuntimeError with codes) | ❌ (generic Error/createError) | **Missing** |
| Logging | ✅ (configurable logger) | ❌ (console.warn/error only) | **Missing** |
| Unit tests | ✅ (server action tests) | ❌ (passWithNoTests) | **Missing** |

### Configuration

| Feature | Next.js SDK | Nuxt SDK | Status |
|---------|-------------|----------|--------|
| baseUrl | ✅ | ✅ | **Parity** |
| clientId | ✅ | ✅ | **Parity** |
| clientSecret | ✅ | ✅ | **Parity** |
| sessionSecret | ✅ (ASGARDEO_SECRET) | ✅ (ASGARDEO_SESSION_SECRET) | Different env var name |
| scopes | ✅ | ✅ | **Parity** |
| afterSignInUrl | ✅ | ✅ | **Parity** |
| afterSignOutUrl | ✅ | ✅ | **Parity** |
| signInUrl (custom page) | ✅ | ❌ | **Missing** |
| signUpUrl (custom page) | ✅ | ❌ | **Missing** |
| organizationHandle | ✅ | ❌ | **Missing** |
| applicationId | ✅ | ❌ | **Missing** |
| preferences (user/theme) | ✅ | ❌ | **Missing** |

---

## What the Nuxt SDK Does Well

### 1. Nuxt Module Integration (Excellent)
The SDK properly uses `defineNuxtModule` with all Nuxt conventions:
- Registers server routes, plugins, middleware, and composables through the module system
- Uses `defu` for config merging
- Augments `@nuxt/schema` for typed runtime config
- Auto-imports server utilities via Nitro config hooks

**This is arguably better than the Next.js approach** where there's no "module" concept and everything must be manually wired.

### 2. Security — Secret Leak Prevention (Better than Next.js)
The module actively checks for and removes `clientSecret`/`sessionSecret` from public runtime config:
```typescript
if (publicAsgardeo?.['clientSecret']) {
  delete publicAsgardeo['clientSecret'];
  console.error(`[${PACKAGE_NAME}] SECURITY: clientSecret found in public config. Removed.`);
}
```
The Next.js SDK has no equivalent safeguard.

### 3. Server Session Utilities (Better DX than Next.js)
The auto-imported `useServerSession()` and `requireServerSession()` provide a cleaner API for custom server routes:
```typescript
// Nuxt — clean and auto-imported
export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event);
  return { userId: session.sub };
});
```
vs. Next.js requires importing and calling multiple functions manually.

### 4. PKCE Support (Better Security)
The Nuxt SDK uses PKCE (`enablePKCE: true`) while Next.js relies on client secret. PKCE is the recommended approach for confidential clients doing authorization code flow and provides an additional layer of security.

### 5. Runtime Config Integration (Nuxt-Idiomatic)
Configuration merges env vars → user options → runtime config, which is the standard Nuxt pattern. The Next.js SDK only reads env vars at initialization time.

### 6. Config Validation at Module Setup
Warns developers early about missing configuration during module setup, before any request hits the server.

### 7. Dynamic Callback URL Resolution
The `resolveCallbackUrl()` function respects `X-Forwarded-Host` and `X-Forwarded-Proto` headers, making it work correctly behind reverse proxies. The URL is recalculated per-request and the client is re-initialized if the origin changes.

---

## What the Nuxt SDK Does Badly

### 1. Singleton Server Client (Critical Issue)
```typescript
let clientInstance: LegacyAsgardeoNodeClient<Record<string, string | boolean>> | null = null;
```
A **module-level singleton** is shared across all requests in the Nitro server. `LegacyAsgardeoNodeClient` stores session state internally (PKCE verifiers, session data), meaning:
- **Concurrent requests can interfere** with each other's auth flows
- Session data from one user could leak to another
- Race conditions during parallel sign-in attempts

This is the most critical issue in the Nuxt SDK. The Next.js SDK has the same problem with its singleton `AsgardeoNextClient`, but it's somewhat mitigated by server actions running in isolated request contexts.

### 2. No Client-Side Framework Package Usage
The SDK **completely ignores `@asgardeo/vue`**, building everything from scratch with raw `useState`/`navigateTo`. This means:
- No UI components (SignedIn, SignedOut, SignInButton, etc.)
- No composable ecosystem (useUser, useOrganization, useBranding, etc.)
- No embedded sign-in/sign-up flow support
- No theming/branding
- No i18n

The Next.js SDK's entire value proposition is that it bridges `@asgardeo/react` to server-side rendering. The Nuxt SDK has no such bridge.

### 3. Minimal Composable API
`useAsgardeo()` only exposes 6 properties/methods:
- `isSignedIn`, `isLoading`, `user` (reactive state)
- `signIn()`, `signOut()` (navigation to API routes)
- `getAccessToken()`, `refreshUser()` (fetch from API)

The Next.js `useAsgardeo()` (via React context) exposes much more: organizations, branding, user profile, sign-up, embedded flows, etc.

### 4. SSR Auth Reads Session Secret Directly from env
```typescript
// auth-state.ts Nitro plugin
const sessionSecret = process.env['ASGARDEO_SESSION_SECRET'];
```
The Nitro plugin reads `process.env` directly instead of using runtime config, because `useRuntimeConfig()` is not available in Nitro plugins. This is noted in a comment but is not ideal — it means the env var must be set even if the secret is provided via `nuxt.config.ts`.

### 5. Access Token in JWT Session Payload
The access token is stored **inside** the JWT session cookie:
```typescript
new SignJWT({
  accessToken: params.accessToken,
  // ...
})
```
This has issues:
- **Cookie size**: Access tokens can be large (especially with many scopes), and cookies have a 4KB limit
- **Stale tokens**: The JWT contains a snapshot of the access token at creation time. If the token expires or is refreshed, the cookie becomes stale
- **Security**: The access token is encrypted only with HS256 symmetric signing, not truly encrypted

The Next.js SDK has the same pattern but this is a design issue in both.

### 6. No Error Code System
Errors use generic `createError()` or `new Error()` without structured error codes. The Next.js SDK uses `AsgardeoRuntimeError` with specific error codes like `'AsgardeoNextClient-getAccessToken-RuntimeError-003'`.

### 7. No Tests
The `package.json` has `"test": "vitest run --passWithNoTests"`, indicating no tests exist. The Next.js SDK has tests for server actions.

### 8. No Logging Infrastructure
Only uses `console.warn` and `console.error` directly. The Next.js SDK uses a configurable logger from `@asgardeo/node`.

### 9. signIn Callback API is Awkward
```typescript
await client.signIn(
  (url: string) => { authorizationUrl = url; },
  sessionId,
  undefined, undefined, undefined, {},
);
```
The callback-based API with five `undefined` arguments is confusing and error-prone. This is a limitation of `LegacyAsgardeoNodeClient`.

---

## What the Nuxt SDK Is Missing

### Critical Missing Features

1. **No `@asgardeo/vue` integration** — The entire UI component library, composables, and provider ecosystem
2. **No embedded sign-in/sign-up flows** — Only redirect-based authentication
3. **No organization management** — No switch org, list orgs, create org, etc.
4. **No user profile management** — No SCIM2 profile fetch/update
5. **No branding/theming** — No branding preference fetch, no theme provider
6. **No i18n support** — No internationalization
7. **No global middleware support** — Only named route middleware

### Important Missing Features

8. **No sign-up flow** — No dedicated sign-up route or action
9. **No token exchange** — No `exchangeToken` support for organization switching
10. **No `reInitialize`** — Cannot update config at runtime (needed for org switching)
11. **No custom sign-in page URL** — No `signInUrl` config for custom-hosted sign-in
12. **No `AsgardeoNuxtClient` class** — No typed client extending `AsgardeoNodeClient`
13. **No separate client/server entry points** — Single export for everything
14. **No token refresh** — JWT session has fixed expiry with no refresh mechanism
15. **No `getDecodedIdToken`** exposed — Can't access ID token claims client-side
16. **No `getSessionPayload`** client action — Can't access full session info client-side

### Nice-to-Have Missing Features

17. **No `applicationId` config** — For app-specific branding
18. **No `organizationHandle` config** — For org-specific flows  
19. **No preferences config** — No user/theme fetch toggle
20. **No OAuth callback detection in middleware** — Middleware doesn't skip OAuth callbacks

---

## Client/Server Boundary Analysis

### Current Nuxt SDK Boundary

```
┌─────────────────────────────────────────┐
│ CLIENT (Browser)                        │
│                                         │
│  useAsgardeo() composable               │
│  ├── Reads: useState('asgardeo:auth')   │
│  ├── signIn() → navigateTo('/api/...')  │
│  ├── signOut() → navigateTo('/api/...')  │
│  ├── getAccessToken() → $fetch(...)     │
│  └── refreshUser() → $fetch(...)        │
│                                         │
│  auth middleware                         │
│  └── Checks: useState + navigateTo      │
│                                         │
│  Nuxt Plugin                            │
│  └── Hydrates: event.context → useState │
│                                         │
│  ❌ NO Vue components                    │
│  ❌ NO @asgardeo/vue dependency          │
│  ❌ NO providers/context system          │
└─────────────┬───────────────────────────┘
              │ HTTP (fetch / redirect)
┌─────────────▼───────────────────────────┐
│ SERVER (Nitro)                          │
│                                         │
│  /api/auth/signin  → OAuth redirect     │
│  /api/auth/callback → Token exchange    │
│  /api/auth/signout → Logout redirect    │
│  /api/auth/session → Auth state JSON    │
│  /api/auth/token   → Access token       │
│  /api/auth/user    → User info          │
│                                         │
│  Nitro plugin: resolves auth on SSR     │
│                                         │
│  Uses: LegacyAsgardeoNodeClient         │
│  Uses: JWT sessions via jose            │
└─────────────────────────────────────────┘
```

### Next.js SDK Boundary

```
┌─────────────────────────────────────────┐
│ CLIENT ('use client')                   │
│                                         │
│  AsgardeoProvider (from @asgardeo/react)│
│  ├── I18nProvider                       │
│  ├── BrandingProvider                   │
│  ├── ThemeProvider                      │
│  ├── FlowProvider                       │
│  ├── UserProvider                       │
│  └── OrganizationProvider               │
│                                         │
│  useAsgardeo() — full auth context      │
│  ├── signIn, signOut, signUp            │
│  ├── user, organization, branding       │
│  └── handleOAuthCallback (embedded)     │
│                                         │
│  UI Components (from @asgardeo/react)   │
│  ├── SignedIn, SignedOut, Loading        │
│  ├── SignInButton, SignOutButton, ...    │
│  ├── UserDropdown, UserProfile          │
│  └── OrganizationSwitcher, etc.         │
│                                         │
│  Calls: Server Actions directly         │
└─────────────┬───────────────────────────┘
              │ Server Actions (RPC)
┌─────────────▼───────────────────────────┐
│ SERVER ('use server' / RSC / Middleware) │
│                                         │
│  AsgardeoProvider (RSC server component)│
│  ├── Initializes AsgardeoNextClient     │
│  ├── Fetches session, user, orgs, brand │
│  └── Passes to client AsgardeoProvider  │
│                                         │
│  Server Actions (20+ actions)           │
│  ├── signInAction (redirect + embedded) │
│  ├── signOutAction, handleOAuthCallback │
│  ├── getAccessToken, getUserAction      │
│  ├── switchOrganization, createOrg      │
│  └── getBrandingPreference              │
│                                         │
│  asgardeoMiddleware (edge)              │
│  ├── isSignedIn, getSession, getSessionId│
│  └── protectRoute with context          │
│                                         │
│  Uses: AsgardeoNextClient singleton     │
│  Uses: JWT sessions via jose            │
└─────────────────────────────────────────┘
```

### Should the Nuxt SDK Separate Client/Server?

**Yes, absolutely.** The Nuxt SDK should follow a similar pattern to Next.js:

| Layer | Next.js Pattern | Recommended Nuxt Pattern |
|-------|-----------------|--------------------------|
| **Server auth** | `@asgardeo/node` via `AsgardeoNextClient` | `@asgardeo/node` via server routes (current) or composable server actions |
| **Client UI** | `@asgardeo/react` (re-exported) | `@asgardeo/vue` (should be re-exported and auto-imported) |
| **Bridge** | RSC `AsgardeoProvider` → Client `AsgardeoProvider` | Nuxt plugin hydrates Vue `AsgardeoProvider` or adapts to Nuxt's `useState` |
| **Middleware** | Edge middleware | Nitro server middleware / Nuxt route middleware |

**However, the implementation approach should differ from Next.js due to Nuxt's architecture:**

1. **Nuxt has a module system** — the module can register everything automatically (server routes, plugins, composables, components)
2. **Nuxt has `useState`** — shared reactive state between server and client, eliminating the need for React Context bridging
3. **Nuxt has auto-imports** — composables and components can be auto-imported without explicit exports
4. **Nuxt has Nitro** — server routes are filesystem-based, not action-based

The recommended separation:

```
@asgardeo/nuxt
├── dependencies: @asgardeo/vue + @asgardeo/node
│
├── Server Boundary (Nitro)
│   ├── Server routes (current — keep as-is)
│   ├── Server utils (useServerSession, requireServerSession — keep)
│   ├── Server plugin (SSR auth state resolution — enhance)
│   └── Add: Organization, user profile, branding server actions
│
├── Client Boundary (Vue/Nuxt)
│   ├── Re-export @asgardeo/vue components (auto-import via module)
│   │   ├── SignedIn, SignedOut, Loading
│   │   ├── SignInButton, SignOutButton, SignUpButton
│   │   ├── UserDropdown, UserProfile
│   │   └── OrganizationSwitcher, OrganizationList, etc.
│   ├── Enhanced useAsgardeo() that bridges server state → Vue providers
│   ├── Nuxt-aware AsgardeoProvider that wraps Vue's AsgardeoProvider
│   └── Additional composables: useUser, useOrganization, useBranding
│
└── Shared
    ├── Types
    ├── createRouteMatcher
    └── Config types
```

**Why not keep the current way?**

The current approach works for basic "sign in / sign out" but cannot scale to support:
- Pre-built UI components (they live in `@asgardeo/vue`)
- Embedded sign-in flows (requires client-side `AsgardeoVueClient`)
- Organization management (requires client context + server actions)
- Branding/theming (requires provider hierarchy)
- User profile editing (requires client components + server APIs)

The existing server route architecture is solid and should be kept, but a client-side layer using `@asgardeo/vue` should be added on top.

---

## Recommendations

### Phase 1: Foundation (Critical)

#### 1.1 Add `@asgardeo/vue` as a dependency
```json
{
  "dependencies": {
    "@asgardeo/vue": "workspace:*",
    "@asgardeo/node": "workspace:*"
  }
}
```

#### 1.2 Create `AsgardeoNuxtClient` class
Like `AsgardeoNextClient`, create a proper typed client that extends `AsgardeoNodeClient`:
- Singleton pattern
- Proper initialization with Nuxt config
- Methods for all auth operations
- Access token from JWT session (not in-memory)

#### 1.3 Bridge Vue Provider with Nuxt SSR
Create a Nuxt-aware wrapper that:
1. On SSR: fetches session, user, organizations from server
2. Hydrates the Vue `AsgardeoProvider` with server-resolved state
3. On client: the Vue provider and all its composables/components just work

#### 1.4 Auto-Import Vue Components
In the Nuxt module, register `@asgardeo/vue` components for auto-import:
```typescript
// In module.ts setup()
addComponent({ name: 'SignedIn', filePath: '@asgardeo/vue', export: 'SignedIn' });
addComponent({ name: 'SignedOut', filePath: '@asgardeo/vue', export: 'SignedOut' });
addComponent({ name: 'SignInButton', filePath: '@asgardeo/vue', export: 'SignInButton' });
// ... etc
```

#### 1.5 Fix Singleton Concurrency Issue
Either:
- Create per-request client instances (recommended)
- Or use a client pool with session-based routing
- Or store PKCE verifiers in the session JWT instead of client memory

### Phase 2: Feature Parity (Important)

#### 2.1 Organization Management
Add server routes/actions for:
- `GET /api/auth/organizations` — list user's organizations
- `GET /api/auth/organizations/all` — list all organizations
- `POST /api/auth/organizations` — create organization
- `POST /api/auth/organizations/switch` — switch organization (token exchange)
- `GET /api/auth/organizations/current` — get current organization

Add composables: `useOrganization()` wrapping the server endpoints.

#### 2.2 User Profile Management
Add server routes for:
- `GET /api/auth/user/profile` — SCIM2 full profile with schemas
- `PATCH /api/auth/user/profile` — update profile

#### 2.3 Enhanced Middleware
- Support global middleware via Nuxt config
- Add rich middleware context (similar to `asgardeoMiddleware`):
  ```typescript
  export default defineNuxtRouteMiddleware((to, from) => {
    const { isSignedIn, getSession, protectRoute } = useAsgardeoMiddleware();
    if (isProtectedRoute(to.path)) {
      return protectRoute({ redirect: '/sign-in' });
    }
  });
  ```

#### 2.4 Error Code System
Adopt `AsgardeoRuntimeError` from `@asgardeo/node` for all server-side errors with structured error codes.

#### 2.5 Logging
Use `createLogger` from `@asgardeo/node` instead of `console.warn`/`console.error`.

### Phase 3: Advanced Features (Nice-to-Have)

#### 3.1 Embedded Sign-In Flow
Support API-driven multi-step authentication (response_mode: 'direct').

#### 3.2 Branding & Theming
Fetch branding preferences server-side and provide via Vue's `BrandingProvider`.

#### 3.3 I18n Integration
Bridge Vue's `I18nProvider` with Nuxt's `@nuxtjs/i18n` or standalone.

#### 3.4 Token Refresh
Implement token refresh/rotation for long-lived sessions.

#### 3.5 Dual Entry Points
Support `@asgardeo/nuxt/server` for explicit server-only imports:
```typescript
// In app code
import { useServerSession } from '#asgardeo/server'
```

#### 3.6 Unit Tests
Add comprehensive tests covering:
- Server routes (sign-in, callback, sign-out flows)
- Session management (create, verify, expire)
- Middleware behavior
- Composable reactivity

---

## Implementation Roadmap

### Priority Matrix

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 🔴 P0 | Add @asgardeo/vue dependency + auto-import components | Medium | Very High |
| 🔴 P0 | Bridge SSR state to Vue AsgardeoProvider | High | Very High |
| 🔴 P0 | Fix singleton concurrency issue | Medium | Critical (security) |
| 🟠 P1 | Organization management (server routes + composables) | High | High |
| 🟠 P1 | User profile management | Medium | High |
| 🟠 P1 | Enhanced useAsgardeo composable | Medium | High |
| 🟠 P1 | Error code system + logging | Low | Medium |
| 🟡 P2 | Enhanced middleware (global + rich context) | Medium | Medium |
| 🟡 P2 | Unit tests | Medium | Medium |
| 🟡 P2 | Separate client/server entry points | Low | Medium |
| 🟢 P3 | Embedded sign-in/sign-up flows | Very High | Medium |
| 🟢 P3 | Branding & theming | High | Medium |
| 🟢 P3 | I18n integration | Medium | Low |
| 🟢 P3 | Token refresh | Medium | Medium |
| 🟢 P3 | Config: signInUrl, signUpUrl, applicationId, preferences | Low | Medium |

### Suggested Milestones

**v0.1.0 — Core Auth with Vue Components**
- Add @asgardeo/vue, auto-import components
- Bridge SSR state to Vue provider
- Fix singleton concurrency
- Enhanced useAsgardeo composable

**v0.2.0 — Organization & User Profile**
- Organization management (list, switch, create)
- User profile CRUD
- Error codes + logging

**v0.3.0 — Advanced Features**
- Enhanced middleware
- Embedded sign-in flow
- Branding/theming
- Tests

**v0.4.0 — Polish**
- I18n
- Token refresh
- Documentation
- Dual entry points

---

## Summary Table

| Category | Next.js SDK Score | Nuxt SDK Score | Notes |
|----------|:-:|:-:|-------|
| **Core Auth** | 9/10 | 8/10 | Nuxt has solid basics, PKCE is a plus |
| **Session Management** | 8/10 | 8/10 | Near parity |
| **SSR/Hydration** | 9/10 | 7/10 | Nuxt lacks org/branding SSR |
| **UI Components** | 9/10 | 0/10 | Nuxt has zero components |
| **Organization** | 9/10 | 0/10 | Entirely missing |
| **User Profile** | 8/10 | 2/10 | Basic user via getUser only |
| **Branding/Theme** | 8/10 | 0/10 | Entirely missing |
| **Middleware** | 9/10 | 5/10 | Basic but functional |
| **DX (Config/Setup)** | 7/10 | 9/10 | Nuxt module system is superior |
| **Security** | 7/10 | 8/10 | PKCE + secret leak prevention |
| **Testing** | 6/10 | 0/10 | No tests at all |
| **Logging/Errors** | 7/10 | 3/10 | No structured errors/logging |
| **Overall** | **8.0/10** | **3.8/10** | Significant gap |

The core server-side architecture of the Nuxt SDK is well-designed and Nuxt-idiomatic. The primary issue is that it's a **server-only SDK** that ignores the entire `@asgardeo/vue` client ecosystem, making it a basic OAuth wrapper rather than a complete authentication solution.
