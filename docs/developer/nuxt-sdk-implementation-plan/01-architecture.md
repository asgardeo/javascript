# 01 — Architecture & Dependency Graph

## Layer Positioning

Per the IAM SDK Specification §2.2, the Nuxt SDK sits at **Layer 4 (Framework Specific SDK)**:

```
Layer 1: JavaScript SDK (@asgardeo/javascript)     ← Agnostic SDK
           ↓                        ↓
Layer 2: Browser SDK              Node SDK          ← Platform SDKs
         (@asgardeo/browser)     (@asgardeo/node)
           ↓                        ↓
Layer 3: Vue SDK                                    ← Core Lib SDK
         (@asgardeo/vue)
           ↓                        ↓
Layer 4: Nuxt SDK (@asgardeo/nuxt)                  ← Framework Specific SDK
         [client-side: Vue SDK]  [server-side: Node SDK]
```

The Nuxt SDK is unique because Nuxt is a **universal framework** — it runs code on both server and client. Therefore, the Nuxt SDK has a **dual dependency**:

- **Client-side code** → imports from `@asgardeo/vue` (which imports from `@asgardeo/browser` → `@asgardeo/javascript`)
- **Server-side code** → imports from `@asgardeo/node` (which imports from `@asgardeo/javascript`)

This is the same pattern used by Next.js SDK (React + Node), adapted for the Vue/Nuxt ecosystem.

---

## Dependency Graph

```
@asgardeo/nuxt
├── dependencies
│   ├── @asgardeo/vue        (workspace:*)  — Client-side: composables, UI, reactive state
│   ├── @asgardeo/node       (workspace:*)  — Server-side: OAuth protocol, session, tokens
│   ├── @nuxt/kit            (^3.16.x)      — Nuxt module API
│   ├── defu                 (^6.x)         — Config deep merge
│   └── jose                 (^6.x)         — JWT session tokens (sign/verify)
│
├── peerDependencies
│   ├── nuxt                 (>=3.10.0)
│   └── vue                  (>=3.5.0)
│
└── devDependencies
    ├── @nuxt/module-builder  — Module build tooling
    ├── @nuxt/test-utils      — Testing
    ├── @nuxt/schema          — Type augmentation
    └── typescript, vitest, etc.
```

### Key Dependency Change from Current SDK

| Aspect | Current SDK | New SDK |
|--------|-------------|---------|
| Client-side parent | _(none — uses Node SDK for everything)_ | `@asgardeo/vue` |
| Server-side parent | `@asgardeo/node` | `@asgardeo/node` (unchanged) |
| Session tokens | _(none — raw UUID cookies)_ | `jose` for signed JWT cookies |
| Layer compliance | ❌ Violates spec (skips Layer 3) | ✅ Compliant |

---

## SSR/CSR Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Nuxt Application                         │
├─────────────────────────────┬───────────────────────────────────┤
│       Server (Nitro)        │        Client (Browser)           │
│                             │                                   │
│  ┌───────────────────────┐  │  ┌─────────────────────────────┐  │
│  │  Nuxt Module          │  │  │  Nuxt Plugin (client)       │  │
│  │  (module.ts)          │  │  │  (asgardeo.client.ts)       │  │
│  │  • Register routes    │  │  │  • Initialize Vue SDK       │  │
│  │  • Register plugin    │  │  │  • Provide composables      │  │
│  │  • Auto-imports       │  │  │  • Hydrate server state     │  │
│  └───────────────────────┘  │  └─────────────────────────────┘  │
│                             │                                   │
│  ┌───────────────────────┐  │  ┌─────────────────────────────┐  │
│  │  Server Routes        │  │  │  useAsgardeo()              │  │
│  │  (Nitro handlers)     │  │  │  (single composable)        │  │
│  │  /api/auth/signin     │  │  │  • isSignedIn (ref)         │  │
│  │  /api/auth/callback   │  │  │  • isLoading (ref)          │  │
│  │  /api/auth/signout    │  │  │  • user (ref)               │  │
│  │  /api/auth/session    │  │  │  • signIn()                 │  │
│  │  /api/auth/token      │  │  │  • signOut()                │  │
│  │  /api/auth/user       │  │  │  • signUp()                 │  │
│  └───────────────────────┘  │  │  • getAccessToken()         │  │
│                             │  │  • getUserProfile()         │  │
│  ┌───────────────────────┐  │  │  • switchOrganization()     │  │
│  │  Server Middleware     │  │  │  • ...                      │  │
│  │  (route protection)   │  │  └─────────────────────────────┘  │
│  │  • Session validation │  │                                   │
│  │  • Protected routes   │  │  ┌─────────────────────────────┐  │
│  │  • Redirect unauthed  │  │  │  Vue UI Components          │  │
│  └───────────────────────┘  │  │  (re-exported from           │  │
│                             │  │   @asgardeo/vue)             │  │
│  ┌───────────────────────┐  │  │  <SignIn />, <SignedIn />,   │  │
│  │  Session Manager      │  │  │  <UserProfile />, etc.       │  │
│  │  (JWT cookies)        │  │  └─────────────────────────────┘  │
│  │  • Sign JWT           │  │                                   │
│  │  • Verify JWT         │  │  ┌─────────────────────────────┐  │
│  │  • Cookie config      │  │  │  Client Middleware           │  │
│  └───────────────────────┘  │  │  (route guards)             │  │
│                             │  │  • Redirect to sign-in       │  │
│  ┌───────────────────────┐  │  │  • Callback handling        │  │
│  │  AsgardeoNuxtClient   │  │  └─────────────────────────────┘  │
│  │  (extends Node SDK)   │  │                                   │
│  │  • Server-side auth   │  │                                   │
│  │  • Token exchange     │  │                                   │
│  │  • SCIM2 profile ops  │  │                                   │
│  └───────────────────────┘  │                                   │
├─────────────────────────────┴───────────────────────────────────┤
│                     SSR Hydration Boundary                       │
│  Server resolves: isSignedIn, user, orgs → serialized to client │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Authentication Lifecycle

### 1. Initial Page Load (SSR)

```
Browser → Nuxt Server → Server Middleware
                            │
                    Read session cookie
                    Verify JWT (jose)
                            │
                    ┌───────┴──────┐
                    │ Valid session │ Invalid/missing
                    │              │
              Fetch user data    Set isSignedIn=false
              from @asgardeo/    in SSR payload
              node client
                    │
              Serialize to
              useState()
                    │
              Render HTML
              with auth state
                    │
Browser ← SSR HTML (hydrated with auth state, no loading flash)
```

### 2. Sign-In Flow (Redirect Mode)

```
Browser: user clicks <SignInButton /> or calls signIn()
    │
    ├─ Client composable calls /api/auth/signin
    │
Server Route: /api/auth/signin
    ├─ Generate sessionId
    ├─ Create temp session JWT cookie
    ├─ Build authorize URL (via @asgardeo/node)
    │   └─ Includes PKCE code_challenge, state, nonce
    └─ Redirect 302 → Asgardeo /oauth2/authorize
    
Asgardeo: user authenticates
    └─ Redirect 302 → /api/auth/callback?code=...&state=...

Server Route: /api/auth/callback
    ├─ Validate state parameter
    ├─ Read temp session cookie → get sessionId
    ├─ Exchange code for tokens (via @asgardeo/node)
    ├─ Create signed session JWT with claims
    ├─ Set session cookie (HTTP-only, Secure, SameSite=Lax)
    ├─ Delete temp session cookie
    └─ Redirect 302 → afterSignInUrl

Browser: page reloads → SSR picks up session → user is authenticated
```

### 3. Sign-In Flow (App-Native / Embedded Mode)

```
Browser: renders <SignIn /> component
    │
    ├─ useAsgardeo().signIn(payload) → POST /api/auth/signin
    │
Server Route: /api/auth/signin (POST)
    ├─ Forward to @asgardeo/node embedded flow API
    ├─ Return flow step response (authenticators, fields)
    └─ Client renders step UI
    
    ... (multi-step loop: user submits, server forwards to Asgardeo)
    
    ├─ flowStatus === SUCCESS_COMPLETED
    ├─ Exchange auth code for tokens
    ├─ Create signed session JWT
    ├─ Set session cookie
    └─ Return success + afterSignInUrl
    
Browser: composable navigates to afterSignInUrl
```

---

## Module Registration Flow

```typescript
// nuxt.config.ts — Developer's configuration
export default defineNuxtConfig({
  modules: ['@asgardeo/nuxt'],
  
  asgardeo: {
    baseUrl: 'https://api.asgardeo.io/t/myorg',
    clientId: 'abc123',
    afterSignInUrl: '/dashboard',
    afterSignOutUrl: '/',
    scopes: ['openid', 'profile', 'email'],
    // clientSecret is read from env only (ASGARDEO_CLIENT_SECRET)
  }
})
```

Module setup sequence:

```
1. defineNuxtModule.setup()
    ├─ Merge config: module options → runtimeConfig → env vars
    ├─ Validate required fields (baseUrl, clientId)
    ├─ Register auto-imports:
    │   ├─ useAsgardeo (composable)
    │   ├─ useUser (composable)
    │   ├─ useOrganization (composable)
    │   └─ defineAsgardeoRouteMiddleware (helper)
    ├─ Register server auto-imports:
    │   └─ useAsgardeoServer (server composable)
    ├─ Register Nitro server routes:
    │   ├─ /api/auth/signin
    │   ├─ /api/auth/callback
    │   ├─ /api/auth/signout
    │   ├─ /api/auth/session
    │   ├─ /api/auth/token
    │   └─ /api/auth/user
    ├─ Register client plugin (asgardeo.client.ts):
    │   └─ Initializes Vue SDK, hydrates server state
    ├─ Register server middleware (optional):
    │   └─ Session validation on protected routes
    └─ Augment Nuxt type declarations
```
