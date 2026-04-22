# Asgardeo Nuxt SDK — Evaluation & Comparison with the Next.js SDK

> Date: 2026-04-19
> Scope: [`packages/nuxt/`](../../../packages/nuxt/) vs [`packages/nextjs/`](../../../packages/nextjs/), with reference to [`packages/node/`](../../../packages/node/), [`packages/vue/`](../../../packages/vue/), [`packages/react/`](../../../packages/react/), [`packages/javascript/`](../../../packages/javascript/), [`packages/browser/`](../../../packages/browser/)
> Purpose: Identify what the Nuxt SDK does well, where it falls short, and a concrete path to parity with the Next.js SDK.

---

## TL;DR

| Dimension | Next.js SDK | Nuxt SDK | Verdict |
|---|---|---|---|
| **Layer compliance** (uses `@asgardeo/node` for server **and** `@asgardeo/{react,vue}` for client) | ✅ Both | ⚠️ Server only (`@asgardeo/node`); **no `@asgardeo/vue`** | **Major gap** |
| **Client/server boundary** | Explicit: `client/`, `server/`, separate subpath export (`/server`) | Physical: `runtime/composables/` vs `runtime/server/`, **single entry** | Nuxt relies on convention; Next.js enforces via bundler |
| **UI components** | 30+ (SignIn, SignUp, UserProfile, OrganizationSwitcher, etc.) | **0** | **Major gap** |
| **Auth flows** | Redirect + Embedded (sign-in, sign-up), callback, sign-out, org switch | Redirect only | **Major gap** |
| **User/profile mgmt (SCIM2)** | Full CRUD, password change | Basic `/user` claim read only | **Gap** |
| **Organization mgmt** | List, switch, create, current | None | **Major gap** |
| **Session** | JWT (HS256, `jose`), temp + persistent | JWT (HS256, `jose`), temp + persistent | **Parity** |
| **Security defaults (PKCE, HTTP-only cookies, state)** | Strong | Strong | **Parity** |
| **SSR story** | RSC async provider fetches server-side, hydrates client | Nitro plugin hydrates `useState`, no flash | **Parity (different mechanism, equally good)** |
| **Error model** | `AsgardeoRuntimeError` with codes | Generic `Error` / silent catches | **Gap** |
| **Token refresh** | Handled inside `AsgardeoNodeClient` | Not wired; access token expires silently | **Gap** |
| **Tests** | `__tests__/` for server actions | None (vitest configured, unused) | **Gap** |
| **Overall feature completeness vs own published plan** | N/A (production, v0.3.9) | ~35% | **MVP** |

**Overall rating:** Nuxt SDK is an architecturally-sound MVP (~35% of the planned spec). Core redirect auth works securely. Everything above the OAuth handshake — UI, SCIM2, orgs, embedded flows, structured errors, token refresh — is missing.

---

## 1. Background: the package layering

All framework SDKs in this monorepo are meant to compose the same building blocks:

```
@asgardeo/javascript        (core OAuth/OIDC, SCIM2, orgs, models, PKCE, types)
        │
        ├── @asgardeo/node      (server-side session/cookies, AsgardeoNodeClient)
        │       │
        │       └── Used by: Next.js (server/), Nuxt (runtime/server/), Express
        │
        └── @asgardeo/browser   (SPA code flow, storage, AsgardeoBrowserClient)
                │
                ├── @asgardeo/react   (hooks, context, ~30 components)
                │       │
                │       └── Used by: Next.js client/, React SPAs
                │
                └── @asgardeo/vue     (composables, providers, ~30 components)
                        │
                        └── Used by: Nuxt client-side, Vue SPAs  ← currently missing
```

The intended symmetry is:

| Meta-framework | Server-side base | Client-side base |
|---|---|---|
| **Next.js** | `@asgardeo/node` | `@asgardeo/react` |
| **Nuxt** | `@asgardeo/node` | **`@asgardeo/vue`** ← not wired up |

This is the **single biggest structural gap** in the Nuxt SDK today, and the answer to the user's direct question: the separation is not yet as in Next.js — and yes, it **should** mirror the Next.js pattern.

---

## 2. Structural comparison

### Next.js SDK — [`packages/nextjs/src/`](../../../packages/nextjs/src/)

```
src/
├── AsgardeoNextClient.ts            ← Singleton, extends AsgardeoNodeClient
├── index.ts                         ← Root barrel
├── client/                          ← 'use client' only
│   ├── contexts/Asgardeo/           (AsgardeoContext, Provider, useAsgardeo)
│   └── components/
│       ├── actions/                 (SignInButton, SignOutButton, SignUpButton)
│       ├── control/                 (SignedIn, SignedOut, Loading)
│       └── presentation/            (SignIn, SignUp, UserProfile, OrganizationSwitcher, …)
├── server/                          ← 'use server' only, separate subpath export
│   ├── AsgardeoProvider.tsx         (async RSC, fetches user/org/branding, wraps client provider)
│   ├── asgardeo.ts                  (factory: server utilities)
│   ├── actions/                     (sign-in, sign-out, callback, user, org CRUD, token, branding)
│   └── middleware/                  (asgardeoMiddleware, createRouteMatcher)
├── configs/
├── models/                          (AsgardeoNextConfig, API types)
└── utils/                           (SessionManager, sessionUtils, logger, decorateConfig)
```

- **Exports** are split into `./` (client default) and `./server` (server-only), so bundlers never pull server code into the client bundle.
- **Client UI** is all re-wrapped from `@asgardeo/react` (providers + components), not reinvented.

### Nuxt SDK — [`packages/nuxt/src/`](../../../packages/nuxt/src/)

```
src/
├── module.ts                        ← Nuxt module entry
├── index.ts                         ← Barrel
└── runtime/
    ├── types.ts
    ├── composables/
    │   └── useAsgardeo.ts           ← client composable (reactive refs)
    ├── plugins/
    │   └── asgardeo.ts              ← client plugin, SSR hydration from useState
    ├── middleware/
    │   └── auth.ts                  ← client-side route middleware
    ├── utils/
    │   └── createRouteMatcher.ts
    └── server/
        ├── utils/
        │   ├── client.ts            (useAsgardeoServerClient singleton)
        │   ├── session.ts           (create/verify session + temp JWT via jose)
        │   └── serverSession.ts     (useServerSession / requireServerSession)
        ├── plugins/
        │   └── auth-state.ts        (Nitro plugin → event.context.__asgardeoAuth)
        └── routes/auth/
            ├── signin.get.ts
            ├── callback.get.ts
            ├── signout.get.ts
            ├── session.get.ts
            ├── token.get.ts
            └── user.get.ts
```

- **Physical separation** is clean (`runtime/server/` vs `runtime/composables|plugins|middleware/`). Nuxt's auto-import + `runtime/server/` convention ensures server files never reach the client bundle. So the boundary is enforced — just through a different mechanism than Next.js's subpath exports.
- **No UI layer.** Nothing is re-exported from `@asgardeo/vue`. The composable surface is one file.

---

## 3. What the Nuxt SDK does **well**

1. **Nuxt-idiomatic module.** Proper use of `@nuxt/kit` (`addPlugin`, `addServerHandler`, `addRouteMiddleware`, `addImports`). Configuration flows through `runtimeConfig` / `publicRuntimeConfig`, with explicit secret filtering in [module.ts](../../../packages/nuxt/src/module.ts) so `clientSecret`/`sessionSecret` never leak to the client.
2. **SSR-first.** A Nitro plugin ([`runtime/server/plugins/auth-state.ts`](../../../packages/nuxt/src/runtime/server/plugins/auth-state.ts)) resolves auth state during SSR and hydrates it via `useState('asgardeo:auth')`. Result: no post-hydration loading flash, first paint shows correct auth state. This is actually a cleaner SSR story than some competing SDKs.
3. **Strong security defaults**, matching Next.js:
   - PKCE enforced in the underlying Node client.
   - HTTP-only, `Secure` (in prod), `SameSite=lax` cookies.
   - Signed JWT session tokens via `jose` (HS256) — same library, same approach as Next.js [`SessionManager`](../../../packages/nextjs/src/utils/SessionManager.ts).
   - 15-min temp session JWT protects the authorize → callback window (CSRF / state binding).
   - Public/private config split in [module.ts:86-93](../../../packages/nuxt/src/module.ts) actively strips secrets that developers accidentally put under `public`.
4. **Clean physical separation of server and client code.** `runtime/server/` is Nitro-only; `runtime/composables/`, `runtime/plugins/`, `runtime/middleware/` are client / universal. Nuxt's tooling enforces this at bundle time even without explicit subpath exports.
5. **Singleton Node client keyed on callback URL** ([`runtime/server/utils/client.ts`](../../../packages/nuxt/src/runtime/server/utils/client.ts)) — handles reverse-proxy / variable-host scenarios by re-initializing when the host changes, without spawning a new client per request.
6. **Minimal dependency surface.** Only `@asgardeo/node`, `@nuxt/kit`, `jose`, `defu`. No bloat.
7. **`useState`-based reactive state** fits Vue 3 and Nuxt's SSR model naturally — no third-party store, no Pinia dependency.
8. **Planning docs are excellent.** [`nuxt-sdk-implementation-plan/`](.) is more thorough than most real SDKs' internal docs; this evaluation largely validates what [`02-gap-analysis.md`](02-gap-analysis.md) already identified.

---

## 4. What the Nuxt SDK does **badly** (or has not done)

### 4.1 Missing `@asgardeo/vue` dependency — the headline issue

[`packages/nuxt/package.json`](../../../packages/nuxt/package.json) declares only `@asgardeo/node`. Compare to [`packages/nextjs/package.json`](../../../packages/nextjs/package.json), which pulls in **both** `@asgardeo/node` and `@asgardeo/react`.

Consequences:
- Zero UI components. Users have to hand-roll sign-in buttons, sign-in/sign-up forms, user dropdowns, organization switchers, etc.
- Client-side providers from `@asgardeo/vue` (`UserProvider`, `OrganizationProvider`, `FlowProvider`, `ThemeProvider`, `I18nProvider`, `BrandingProvider`) are completely unused — meaning i18n, theming, and branding are all missing too.
- Composables that exist in `@asgardeo/vue` (`useUser`, `useOrganization`, `useFlow`, `useTheme`, `useBranding`, `useI18n`) are not exposed. Nuxt users only get `useAsgardeo()`.
- Duplicated (and simplified) `useAsgardeo` in Nuxt instead of reusing the one from `@asgardeo/vue`.

### 4.2 Silent error handling

Routes and utilities use `.catch(() => null)` / `.catch(() => ({ isSignedIn: false }))` patterns. The caller cannot tell the difference between "user is signed out" and "token exchange blew up because the client secret is wrong". The Next.js SDK throws `AsgardeoRuntimeError` with error codes; the Nuxt SDK has no error class at all.

### 4.3 No refresh-token handling

Sessions store `accessToken` but not the refresh token, and nothing refreshes it. Once the access token expires (default 3600s), `/api/auth/token` keeps returning the stale value. Next.js delegates refresh to `AsgardeoNodeClient` internals — Nuxt should too, but doesn't wire up the path. See [`runtime/server/utils/session.ts`](../../../packages/nuxt/src/runtime/server/utils/session.ts) session payload.

### 4.4 Client-only route protection

[`runtime/middleware/auth.ts`](../../../packages/nuxt/src/runtime/middleware/auth.ts) runs as a `defineNuxtRouteMiddleware`, which is client/universal — it protects page navigations but does not gate Nitro server routes. An attacker hitting `/api/protected-stuff` directly is not blocked by it. A `requireServerSession()` utility exists in [`runtime/server/utils/serverSession.ts`](../../../packages/nuxt/src/runtime/server/utils/serverSession.ts), but there is no Nitro middleware wrapper and no `createRouteMatcher`-powered server guard. Next.js gates everything through a single `asgardeoMiddleware()` that runs before handlers — Nuxt needs the equivalent Nitro middleware.

### 4.5 No embedded flows

No App-Native / Flow Execution API integration. Users cannot render an in-page sign-in form; they are always redirected to Asgardeo. Next.js supports both redirect and embedded via `<SignIn>` and `<SignUp>` backed by server actions.

### 4.6 No user profile / organization management

- `/api/auth/user` returns only the ID-token claims, not the SCIM2 user resource.
- No `/api/auth/user/profile` GET/PATCH, no `/api/auth/user/password` POST.
- No org listing, switching, creation endpoints — despite org extraction already being half-wired in session.ts (`organizationId` field is set from the ID token but nothing consumes it).

### 4.7 Weak type surface

Exported types: `AsgardeoNuxtConfig`, `AsgardeoSessionPayload`, `AsgardeoTempSessionPayload`, `AsgardeoAuthState`, `UseAsgardeoReturn`. That's it. Missing: `User`, `Organization`, `SignInOptions`, `ErrorCode`, `AsgardeoError`, and ~15 other types the planning doc calls for. Nuxt users lose the type help that Next.js users get.

### 4.8 Fragile server-context typing

[`runtime/server/plugins/auth-state.ts`](../../../packages/nuxt/src/runtime/server/plugins/auth-state.ts) stashes state on `event.context['__asgardeoAuth']` as unchecked `any`. No H3 module augmentation, so downstream server handlers have no type-safe way to read it. Next.js's `NextRequest` is similarly extended via module augmentation.

### 4.9 No tests

Vitest is configured but `src/` contains no test files. Next.js has `server/actions/__tests__/` with unit coverage. For a package that handles auth tokens, zero test coverage is the worst trade-off.

### 4.10 Incomplete `useAsgardeo()` API

Returns `{ isSignedIn, isLoading, user, signIn, signOut, getAccessToken, refreshUser }`. Missing versus Next.js / Vue SDK: `signUp`, error/error-reason field, ability to pass per-call options to `signIn` (`organizationId`, `scopes`, `prompt`), access to the underlying flow for embedded forms, org context, branding, i18n.

### 4.11 Minor things

- Version is `0.0.0` — no changeset has been cut, indicating the package has not shipped.
- Hardcoded cookie names come from `@asgardeo/node`'s `CookieConfig`; not user-configurable.
- `returnTo` open-redirect check only guards `/`-prefixed URLs and rejects `//` — doesn't canonicalize; edge cases like `/\evil.com` on some browsers may slip through.
- `sessionSecret` falls back to a hardcoded default in dev with only a log warning — should throw in production even if the env is not strictly `production`.

---

## 5. Client/server separation — direct answer to your question

> **Is the Nuxt SDK separated with proper boundaries using `@asgardeo/vue` for client and `@asgardeo/node` for server, like the Next.js SDK does with `@asgardeo/react` + `@asgardeo/node`?**

**No.** Right now:

| Concern | Next.js | Nuxt |
|---|---|---|
| Server base package | `@asgardeo/node` ✅ | `@asgardeo/node` ✅ |
| Client base package | `@asgardeo/react` ✅ | **nothing** — client code is hand-rolled in `runtime/composables/` |
| Separation enforced at bundler level | `./` vs `./server` subpath exports ✅ | Nuxt's `runtime/server/` convention ✅ (effectively equivalent) |
| UI components | 30+ re-exported from `@asgardeo/react` ✅ | **none** ❌ |

The physical/bundler boundary between server and client **is** in place in the Nuxt SDK — Nitro won't bundle `runtime/server/**` into the client, and that's as reliable as Next.js's subpath exports for this purpose. So the **directory** boundary is fine.

What is missing is the **package** boundary: the Nuxt SDK is not reusing `@asgardeo/vue` for its client surface. That is the Next.js pattern, and it is **the right one** to copy, because:

1. **No duplication.** `useUser`, `useOrganization`, theming, i18n, branding, and every UI component already exist in `@asgardeo/vue`. Reinventing them in `packages/nuxt/runtime/composables/` means double maintenance (and we're currently at single maintenance with zero components — worst of both worlds).
2. **Consistency across Vue and Nuxt.** A developer who moves from a pure-Vue app to Nuxt (or vice versa) sees the same `<SignInButton>`, same `useUser()`, same theming contract.
3. **The planning doc already says so.** [`00-overview.md`](00-overview.md) and [`02-gap-analysis.md`](02-gap-analysis.md) both list `@asgardeo/vue` as a required dependency and flag its absence as the root architectural violation.

**Recommendation:** mirror the Next.js layering exactly — `@asgardeo/nuxt` depends on **`@asgardeo/node` (server) + `@asgardeo/vue` (client)**. Keep the current directory layout; add the Vue package as a dependency and re-export its providers, composables, and components from `runtime/`. Nothing about the current server architecture needs to change.

---

## 6. Feature-by-feature comparison

| Feature | Next.js | Nuxt | Gap |
|---|---|---|---|
| Redirect sign-in with PKCE | ✅ | ✅ | — |
| Embedded sign-in (Flow Execution API) | ✅ | ❌ | Full |
| Embedded sign-up | ✅ | ❌ | Full |
| Sign-out with RP-Initiated Logout | ✅ | ✅ | — |
| OAuth callback validation (code/state/session_state) | ✅ | ✅ | — |
| JWT session token (HS256 via `jose`) | ✅ | ✅ | — |
| Temp session JWT during auth handshake | ✅ | ✅ | — |
| Refresh-token handling | ✅ (delegated to Node client) | ❌ | Must wire |
| Token exchange (RFC 8693) | ✅ | ❌ | Missing |
| Organization listing | ✅ | ❌ | Missing |
| Organization switching | ✅ | ❌ | Missing |
| Organization creation | ✅ | ❌ | Missing |
| Current organization from ID token | ✅ | ⚠️ Extracted but not consumed | Partial |
| User claims (from ID token) | ✅ | ✅ | — |
| SCIM2 user profile fetch | ✅ | ❌ | Missing |
| SCIM2 user profile update | ✅ | ❌ | Missing |
| Password change | ✅ | ❌ | Missing |
| Branding preference fetch | ✅ | ❌ | Missing |
| Theming provider | ✅ | ❌ | Missing (needs `@asgardeo/vue`) |
| i18n provider | ✅ | ❌ | Missing (needs `@asgardeo/vue`) |
| Server-side route protection | ✅ (`asgardeoMiddleware`) | ⚠️ Utility exists, no middleware | Partial |
| Client-side route protection | ✅ | ✅ | — |
| `createRouteMatcher` | ✅ | ✅ | — |
| SSR-side auth hydration | ✅ (async RSC provider) | ✅ (Nitro plugin + `useState`) | — |
| Structured error class (`AsgardeoError`) | ✅ | ❌ | Missing |
| Logger utility | ✅ | ❌ | Missing |
| Custom storage / session backend | Partial | ❌ | Missing |
| UI: SignInButton / SignOutButton / SignUpButton | ✅ | ❌ | Missing |
| UI: `<SignedIn>` / `<SignedOut>` / `<Loading>` | ✅ | ❌ | Missing |
| UI: `<SignIn>` / `<SignUp>` embedded forms | ✅ | ❌ | Missing |
| UI: `<User>` render-prop / `<UserProfile>` / `<UserDropdown>` | ✅ | ❌ | Missing |
| UI: `<Organization>` / `<OrganizationProfile>` / `<OrganizationSwitcher>` / `<OrganizationList>` / `<CreateOrganization>` | ✅ | ❌ | Missing |
| Typed config | ✅ rich types | ⚠️ 4 types only | Partial |
| Unit tests | ✅ | ❌ | Missing |
| Published version | 0.3.9 | 0.0.0 | — |

---

## 7. Recommended roadmap to parity

Ordered by leverage — each step unlocks the next, and you avoid rework.

### Phase 1 — Wire up `@asgardeo/vue` (1–2 weeks)

1. Add `"@asgardeo/vue": "workspace:*"` to [`packages/nuxt/package.json`](../../../packages/nuxt/package.json) dependencies.
2. In [`runtime/plugins/asgardeo.ts`](../../../packages/nuxt/src/runtime/plugins/asgardeo.ts), install `AsgardeoPlugin` from `@asgardeo/vue`, configured with the public runtime config. Bridge the existing SSR hydration (`useState('asgardeo:auth')`) into the Vue SDK's providers so they read the server-resolved state instead of fetching again on mount.
3. Replace the hand-rolled [`runtime/composables/useAsgardeo.ts`](../../../packages/nuxt/src/runtime/composables/useAsgardeo.ts) with a re-export of `@asgardeo/vue`'s `useAsgardeo` (or a thin wrapper that keeps the SSR-friendly behavior of navigating to `/api/auth/signin`).
4. Auto-import every composable (`useUser`, `useOrganization`, `useFlow`, `useTheme`, `useBranding`, `useI18n`) via `addImports` in [`module.ts`](../../../packages/nuxt/src/module.ts).
5. Auto-register every component via `addComponent` from `@nuxt/kit`, pointing at `@asgardeo/vue`'s component exports. This alone brings ~30 components with no new code.

Outcome: the Nuxt SDK gains full UI, theming, i18n, branding, and org/user composables in days, by composition rather than reimplementation.

### Phase 2 — Close the server gaps (1–2 weeks)

1. **Structured errors.** Introduce (or re-export from `@asgardeo/javascript`) an `AsgardeoError` class with codes. Wrap every `.catch(() => null)` with a typed error — still graceful for callers, but with information preserved.
2. **Refresh-token handling.** Store `refreshToken` in the session JWT payload; add a `/api/auth/refresh` route and a server-side helper that rotates when the access token is near expiry. Gate `/api/auth/token` through it.
3. **Server-side route protection.** Add a Nitro middleware `runtime/server/middleware/asgardeo.ts` that uses `requireServerSession()` + `createRouteMatcher()` so API routes can be protected declaratively from `nuxt.config`. This mirrors `asgardeoMiddleware` in Next.js.
4. **H3 module augmentation** for `event.context.asgardeo` so server handlers get typed access to the session.

### Phase 3 — User & organization features (2 weeks)

Add Nitro route handlers that call through to `AsgardeoNodeClient`:

- `runtime/server/routes/auth/user/profile.get.ts`
- `runtime/server/routes/auth/user/profile.patch.ts`
- `runtime/server/routes/auth/user/password.post.ts`
- `runtime/server/routes/auth/organizations/index.get.ts`
- `runtime/server/routes/auth/organizations/mine.get.ts`
- `runtime/server/routes/auth/organizations/current.get.ts`
- `runtime/server/routes/auth/organizations/switch.post.ts`
- `runtime/server/routes/auth/branding.get.ts`

The composables from `@asgardeo/vue` (`useUser`, `useOrganization`, etc.) already call these endpoints — wiring the server side is the only missing half.

### Phase 4 — Embedded flows (1–2 weeks)

Add `/api/auth/flow/*` Nitro routes that proxy the Flow Execution API, so `@asgardeo/vue`'s `<SignIn>` / `<SignUp>` components Just Work in Nuxt. This matches `handleOAuthCallbackAction` + the embedded-flow server actions in Next.js.

### Phase 5 — Hardening (1 week)

- Unit tests for session utils, route handlers, middleware.
- E2E test using `@nuxt/test-utils` that exercises the redirect flow end-to-end against a mocked Asgardeo.
- Fail-closed `sessionSecret` check — if not set and `NODE_ENV !== 'development'`, throw at module load.
- Stricter `returnTo` validation (resolve against known origins, not just `/`-prefix check).
- Tighten H3 event-context types, remove `any`.
- Release plan: bump from `0.0.0`, add a changeset, publish alpha to npm.

### Stretch

- Custom storage / logger extensibility hooks (match the spec in [`13-testing.md`](13-testing.md)).
- Full type exports matching Next.js's surface.
- A playground app demonstrating the main flows (Nuxt module repo pattern).

---

## 8. Summary ratings

| Aspect | Next.js | Nuxt | Comment |
|---|---|---|---|
| Architecture | A | A- | Nuxt pattern is sound; only the Vue-package dependency is missing |
| Security defaults | A | A- | Parity, minus the dev-fallback `sessionSecret` issue |
| Code quality | A- | B+ | Nuxt is clean but untested and silent-on-errors |
| Feature completeness | A | D+ | Nuxt ~35% of planned spec |
| Type safety | A- | C+ | Few exported types in Nuxt |
| Error model | B+ | D | No structured errors in Nuxt |
| Tests | B | F | None |
| Production readiness | Ships at 0.3.9 | MVP / PoC | `0.0.0`, not published |

**Bottom line:** the Nuxt SDK has the right bones. The single most valuable change is adding `@asgardeo/vue` as a client-side dependency and re-exporting its composables and components through the Nuxt module — it unlocks most of the missing features at once, keeps the server side exactly as it is today, and matches the Next.js layering precisely.
