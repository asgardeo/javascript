# 02 — Gap Analysis: Current SDK vs Target Implementation

## Current State Summary

The existing `@asgardeo/nuxt` (v0.0.0) is a minimal prototype consisting of:

- A Nuxt module (`module.ts`) that registers runtime config and a single auto-imported composable
- A `useAuth()` composable that makes `fetch()` calls to server API routes
- A catch-all server handler (`AsgardeoAuthHandler`) with basic OAuth redirect flow
- A singleton service for the `@asgardeo/node` client instance

---

## Feature Comparison Matrix

### Core Architecture

| Feature | Current SDK | Target SDK | Spec Section |
|---------|-------------|------------|--------------|
| Layer compliance (depends on Vue SDK) | ❌ Depends only on Node SDK | ✅ Vue SDK (client) + Node SDK (server) | §2.2, §2.6 |
| Nuxt Module with validation | ⚠️ Basic module, no config validation | ✅ Full validation at module setup | §5.1 |
| Auto-imports | ⚠️ Only `useAuth` | ✅ `useAsgardeo`, `useUser`, `useOrganization`, UI components | §7.3 |
| Runtime config (public + private) | ⚠️ Leaks `clientSecret` to public config | ✅ Strict public/private separation | §11.5 |
| Environment variable fallbacks | ⚠️ Partial | ✅ Full env var matrix with NUXT_PUBLIC_ prefix | §5.2 |
| Type augmentation (@nuxt/schema) | ⚠️ Basic | ✅ Full type augmentation for config, composables, components | — |

### Authentication

| Feature | Current SDK | Target SDK | Spec Section |
|---------|-------------|------------|--------------|
| Redirect-based sign-in (PKCE) | ⚠️ Basic (PKCE via Node SDK) | ✅ Full PKCE with state validation | §4.1, §11.2 |
| App-Native / Embedded sign-in | ❌ Not supported | ✅ Multi-step embedded flow via server proxy | §4.2 |
| Embedded sign-up (Flow Execution API) | ❌ Not supported | ✅ Registration, invite, recovery flows | §6.2 |
| Silent sign-in | ❌ Not supported | ⚠️ Not applicable for SSR (redirect mode only, document this) | §6.1 |
| OAuth callback handling | ⚠️ Basic — no state validation | ✅ State + PKCE validation, error handling | §11.3 |
| Sign-out with token revocation | ⚠️ Basic — cookie deletion only | ✅ Revoke refresh token → clear cookies → redirect | §6.4 |
| `isSignedIn` state | ⚠️ Async fetch to /api/auth/isSignedIn | ✅ Reactive `ref<boolean>`, SSR-hydrated | §6.1 |
| `isLoading` state | ❌ Not tracked | ✅ Reactive `ref<boolean>` | §7.1 |

### Session & Token Management

| Feature | Current SDK | Target SDK | Spec Section |
|---------|-------------|------------|--------------|
| Session storage mechanism | ⚠️ Raw UUID cookie | ✅ Signed JWT (jose) in HTTP-only cookie | §11.1, §11.7 |
| Temp session for OAuth flow | ❌ No temp session | ✅ Short-lived temp JWT during redirect flow | — |
| Access token retrieval | ⚠️ Via fetch to /api/auth/get-access-token | ✅ Server action / server route, client composable | §6.5 |
| Token refresh | ❌ Not implemented | ✅ Automatic refresh via @asgardeo/node | §6.5, §11.7 |
| Token exchange (RFC 8693) | ❌ Not implemented | ✅ `exchangeToken()` in composable | §6.5 |
| Decode JWT client-side | ⚠️ Via fetch to /api/auth/get-decoded-id-token | ✅ Client-side JWT decode (non-sensitive) | §6.5 |

### User & Profile Management

| Feature | Current SDK | Target SDK | Spec Section |
|---------|-------------|------------|--------------|
| Get user (basic claims) | ⚠️ Via fetch to /api/auth/user | ✅ Reactive `user` ref, SSR-hydrated | §6.6 |
| Get user profile (SCIM2 + schemas) | ❌ Not implemented | ✅ `getUserProfile()` with flattened schema | §6.6 |
| Update user profile | ❌ Not implemented | ✅ `updateUserProfile()` via SCIM2 PATCH | §6.6 |
| Change password | ❌ Not implemented | ✅ `changePassword()` | §6.6 |

### Organization Management

| Feature | Current SDK | Target SDK | Spec Section |
|---------|-------------|------------|--------------|
| Get all organizations | ❌ Not implemented | ✅ `getAllOrganizations()` | §6.7 |
| Get my organizations | ❌ Not implemented | ✅ `getMyOrganizations()` | §6.7 |
| Get current organization | ❌ Not implemented | ✅ `getCurrentOrganization()`, SSR-hydrated | §6.7 |
| Switch organization | ❌ Not implemented | ✅ `switchOrganization()` via token exchange | §6.7 |
| Create organization | ❌ Not implemented | ✅ `createOrganization()` | §6.7 |

### UI Components

| Feature | Current SDK | Target SDK | Spec Section |
|---------|-------------|------------|--------------|
| Action components (`SignInButton`, etc.) | ❌ None | ✅ Re-export from @asgardeo/vue | §8.4 |
| Control components (`SignedIn`, `SignedOut`, `Loading`) | ❌ None | ✅ Re-export from @asgardeo/vue | §8.4 |
| Callback component | ❌ None | ✅ Nuxt-specific callback page/component | §8.4 |
| Presentation components (`SignIn`, `SignUp`, `UserProfile`, etc.) | ❌ None | ✅ Re-export from @asgardeo/vue with auto-imports | §8.4 |
| Base* unstyled variants | ❌ None | ✅ Re-export from @asgardeo/vue | §8.3 |
| Organization components | ❌ None | ✅ Re-export from @asgardeo/vue | §8.4 |

### Middleware & Route Protection

| Feature | Current SDK | Target SDK | Spec Section |
|---------|-------------|------------|--------------|
| Server middleware (Nitro) | ❌ None | ✅ Session validation, route protection | — |
| Client middleware (Nuxt route) | ❌ None | ✅ `defineAsgardeoRouteMiddleware` | — |
| Route matcher (pattern-based) | ❌ None | ✅ `createRouteMatcher()` for protected/public routes | — |
| Callback route auto-registration | ❌ None | ✅ Auto-register `/api/auth/callback` | — |

### Error Handling

| Feature | Current SDK | Target SDK | Spec Section |
|---------|-------------|------------|--------------|
| Structured error model (`IAMError`) | ❌ Generic `Error` or `createError` | ✅ `AsgardeoError` with code, message, cause, requestId | §10.1 |
| Machine-readable error codes | ❌ None | ✅ Full error code enum per spec | §10.2 |
| Error propagation to composables | ❌ Errors swallowed (returns null) | ✅ Errors surfaced to composable, catchable | §10.3 |

### Security

| Feature | Current SDK | Target SDK | Spec Section |
|---------|-------------|------------|--------------|
| PKCE (mandatory) | ⚠️ Delegated to Node SDK | ✅ Enforced and validated | §11.2 |
| State parameter (CSRF) | ❌ Not validated | ✅ Cryptographic state with validation | §11.3 |
| HTTP-only cookies | ⚠️ Configurable | ✅ Always HTTP-only, Secure in production | §11.1 |
| Signed session tokens (JWT) | ❌ Raw UUID | ✅ Signed JWT with expiry | §11.7 |
| Secret management | ⚠️ `clientSecret` in runtime config | ✅ Only via env var, never in client bundle | §11.5 |
| HTTPS enforcement | ❌ Not enforced | ✅ Reject non-HTTPS baseUrl | §11.5 |
| Sensitive data in logs | ❌ No log sanitization | ✅ Token masking, no password logging | §11.6 |

### Extensibility

| Feature | Current SDK | Target SDK | Spec Section |
|---------|-------------|------------|--------------|
| Custom storage adapter | ❌ Not supported | ✅ Via configuration | §13.1 |
| Custom logger | ❌ Not supported | ✅ Via configuration | §13.2 |
| Event hooks | ❌ Not supported | ✅ SDK lifecycle events | §13.4 |
| i18n / theming | ❌ Not supported | ✅ Via @asgardeo/vue providers | §5.3 |

---

## Summary

| Category | Current Coverage | Target Coverage |
|----------|-----------------|-----------------|
| Authentication | ~25% | 100% |
| Session Management | ~15% | 100% |
| User/Profile Management | ~10% | 100% |
| Organization Management | 0% | 100% |
| UI Components | 0% | 100% |
| Route Protection | 0% | 100% |
| Error Handling | ~10% | 100% |
| Security | ~30% | 100% |
| Extensibility | 0% | 80%+ |

The current SDK needs a **full rewrite**, not incremental patches. The architecture, dependency graph, session management, and public API all need to change fundamentally.
