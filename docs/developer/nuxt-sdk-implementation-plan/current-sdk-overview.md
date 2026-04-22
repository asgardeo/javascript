# Asgardeo Nuxt SDK — Current State Overview

This document explains how the current `@asgardeo/nuxt` module (located at [packages/nuxt/](../../../packages/nuxt/)) is structured and how requests flow through it end-to-end.

It reflects the code on the `nuxt-sdk-start` branch as of this writing.

---

## 1. What the module is

`@asgardeo/nuxt` is a Nuxt 3 module that wires up **OAuth2 / OIDC authentication** against an Asgardeo tenant. It is built on top of the `@asgardeo/node` SDK and follows Nuxt's standard module layout.

Key characteristics:

- **Server-heavy design.** Tokens never reach the browser. The access token, id token, and refresh token are held by the Nitro server; the browser only holds signed cookies.
- **JWT session cookies.** A signed JWT (via `jose`, HS256) is used for both the "in-flight" OAuth state and the established session.
- **SSR-hydrated auth state.** A Nitro request hook resolves the user on every page request and hands the result to the client via `useState`, so there is no loading flash on first paint.
- **Minimal public API.** One composable (`useAsgardeo`), one named route middleware (`auth`), a `createRouteMatcher` helper, and a small set of server-side utilities.

---

## 2. File structure

```
packages/nuxt/
├── package.json                        # @asgardeo/nuxt, depends on @asgardeo/node + jose
└── src/
    ├── index.ts                        # Public entry — re-exports module + types
    ├── module.ts                       # Nuxt module definition (defineNuxtModule)
    └── runtime/
        ├── types.ts                    # Shared types (config, session payload, auth state)
        │
        ├── composables/
        │   └── useAsgardeo.ts          # Client composable — reactive auth state + actions
        │
        ├── plugins/
        │   └── asgardeo.ts             # Nuxt (client+server) plugin — hydrates useState
        │
        ├── middleware/
        │   └── auth.ts                 # Named route middleware — gates pages
        │
        ├── utils/
        │   └── createRouteMatcher.ts   # Glob-style path matcher for middleware
        │
        └── server/
            ├── plugins/
            │   └── auth-state.ts       # Nitro plugin — resolves user on each page request
            ├── routes/
            │   └── auth/
            │       ├── signin.get.ts     # Starts the OAuth flow
            │       ├── callback.get.ts   # Handles the redirect back from Asgardeo
            │       ├── signout.get.ts    # RP-initiated logout
            │       ├── session.get.ts    # Returns { isSignedIn, user, isLoading }
            │       ├── token.get.ts      # Returns the current access token
            │       └── user.get.ts      # Returns the current user profile
            └── utils/
                ├── client.ts             # Singleton LegacyAsgardeoNodeClient factory
                ├── session.ts            # JWT create/verify + cookie helpers
                └── serverSession.ts      # useServerSession / requireServerSession
```

### How each file fits together

| Area | File | Responsibility |
|---|---|---|
| Module wiring | [src/module.ts](../../../packages/nuxt/src/module.ts) | Merges config, registers server routes, plugins, middleware, auto-imports |
| Public types | [src/runtime/types.ts](../../../packages/nuxt/src/runtime/types.ts) | `AsgardeoNuxtConfig`, `AsgardeoSessionPayload`, `AsgardeoAuthState`, `AsgardeoTempSessionPayload` |
| Client composable | [src/runtime/composables/useAsgardeo.ts](../../../packages/nuxt/src/runtime/composables/useAsgardeo.ts) | Reactive refs (`isSignedIn`, `user`, `isLoading`) + `signIn`, `signOut`, `getAccessToken`, `refreshUser` |
| Nuxt plugin | [src/runtime/plugins/asgardeo.ts](../../../packages/nuxt/src/runtime/plugins/asgardeo.ts) | Initializes `useState('asgardeo:auth')` from SSR context |
| Route guard | [src/runtime/middleware/auth.ts](../../../packages/nuxt/src/runtime/middleware/auth.ts) | Redirects unauthenticated visitors to `/api/auth/signin` |
| Route matcher | [src/runtime/utils/createRouteMatcher.ts](../../../packages/nuxt/src/runtime/utils/createRouteMatcher.ts) | Glob-to-regex helper for global middlewares |
| Nitro plugin | [src/runtime/server/plugins/auth-state.ts](../../../packages/nuxt/src/runtime/server/plugins/auth-state.ts) | On every non-API request, verifies session cookie and sets `event.context.__asgardeoAuth` |
| Server routes | [src/runtime/server/routes/auth/*.ts](../../../packages/nuxt/src/runtime/server/routes/auth/) | Six Nitro handlers that power the auth flow |
| Node client factory | [src/runtime/server/utils/client.ts](../../../packages/nuxt/src/runtime/server/utils/client.ts) | Lazily creates a `LegacyAsgardeoNodeClient` keyed by the resolved `redirect_uri` |
| JWT + cookies | [src/runtime/server/utils/session.ts](../../../packages/nuxt/src/runtime/server/utils/session.ts) | `createSessionToken` / `verifySessionToken` / temp equivalents + cookie option helpers |
| Custom route helpers | [src/runtime/server/utils/serverSession.ts](../../../packages/nuxt/src/runtime/server/utils/serverSession.ts) | `useServerSession` (optional) and `requireServerSession` (throws 401) for user API routes |

---

## 3. Module setup — what happens at Nuxt boot

[src/module.ts](../../../packages/nuxt/src/module.ts) is invoked by Nuxt during build/prepare. It performs:

1. **Config merge** (env → `nuxt.config` → defaults) using `defu`.
   - Public: `baseUrl`, `clientId`, `afterSignInUrl`, `afterSignOutUrl`, `scopes`.
   - Private (server-only): `clientSecret`, `sessionSecret` — read from `ASGARDEO_CLIENT_SECRET` / `ASGARDEO_SESSION_SECRET`.
2. **Security scrub.** After merging, it actively deletes `clientSecret`/`sessionSecret` if they somehow appear under `runtimeConfig.public.asgardeo` and logs an error.
3. **Registers the six server routes** under `/api/auth/*` via `addServerHandler`.
4. **Registers the Nitro plugin** `auth-state.ts` via `addServerPlugin` (runs per request).
5. **Registers the client/server Nuxt plugin** `asgardeo.ts` via `addPlugin`.
6. **Registers the named middleware** `auth` via `addRouteMiddleware` (opt-in via `definePageMeta`).
7. **Auto-imports** `useAsgardeo` and `createRouteMatcher` for app code, plus `useServerSession`, `requireServerSession`, and `useAsgardeoServerClient` for Nitro code via the `nitro:config` hook.

---

## 4. Sessions and cookies

The SDK issues two signed JWTs as `httpOnly` cookies — both signed with `ASGARDEO_SESSION_SECRET`:

| Cookie | TTL | Purpose |
|---|---|---|
| Temp session (`CookieConfig.TEMP_SESSION_COOKIE_NAME`) | 15 min | Held between `/api/auth/signin` and `/api/auth/callback`. Carries `sessionId` and the optional `returnTo` path. |
| Session (`CookieConfig.SESSION_COOKIE_NAME`) | 1 h (default) | Issued after a successful token exchange. Carries `sessionId`, `sub`, `accessToken`, `scopes`, and optional `organizationId`. |

Cookie options: `httpOnly`, `sameSite: 'lax'`, `path: '/'`, and `secure` when `NODE_ENV === 'production'`. The actual tokens (access, refresh, id) live in the `LegacyAsgardeoNodeClient`'s internal store, keyed by `sessionId` — the session cookie only carries the id needed to look them up on subsequent requests.

---

## 5. End-to-end flows

### 5.1 Sign-in (authorization code + PKCE)

```
Browser                   Nuxt/Nitro                            Asgardeo
   │                          │                                    │
   │ click "Sign in" ───────► │                                    │
   │  useAsgardeo().signIn()  │                                    │
   │                          │                                    │
   │ GET /api/auth/signin ──► signin.get.ts                        │
   │                          │ - generateSessionId()              │
   │                          │ - createTempSessionToken()         │
   │                          │ - Set-Cookie: ASG_TEMP_SESSION     │
   │                          │ - client.signIn(cb, id, ...)       │
   │                          │   └─ captures authorization URL ─► │
   │                          │                                    │
   │ 302 → authorization URL  │                                    │
   │ ───────────────────────────────────────────────────────────► │
   │                                                              user authenticates
   │ ◄──────────── 302 back to /api/auth/callback?code=...&state=
   │                          │                                    │
   │ GET /api/auth/callback ► callback.get.ts                      │
   │                          │ - verifyTempSessionToken()         │
   │                          │   (recovers sessionId + returnTo)  │
   │                          │ - client.signIn(noop, id, code) ─► │
   │                          │   ◄── tokens (access/id/refresh)   │
   │                          │ - createSessionToken(...)          │
   │                          │ - Set-Cookie: ASG_SESSION          │
   │                          │ - Delete-Cookie: ASG_TEMP_SESSION  │
   │ 302 → returnTo || afterSignInUrl
   │ ◄──────────────────────  │                                    │
```

Key details from the code:

- [signin.get.ts](../../../packages/nuxt/src/runtime/server/routes/auth/signin.get.ts) uses `client.signIn(url => ...)` with **no code** to trick the Node SDK into emitting the authorization URL into the callback, then `sendRedirect`s to it.
- `returnTo` is validated as a relative path (`startsWith('/')` and not `//`) to prevent open redirects.
- [callback.get.ts](../../../packages/nuxt/src/runtime/server/routes/auth/callback.get.ts) passes the H3 `event` to `useAsgardeoServerClient(event)` so the client's `redirect_uri` matches the one used at sign-in byte-for-byte — OAuth requires an exact match.
- The id token is decoded via `client.getDecodedIdToken()` to extract `sub` (used as `userId`) and the optional `organizationId` (`user_org` or `organization_id` claim).

### 5.2 Every subsequent page render (SSR hydration)

```
Browser                   Nitro                              Nuxt app
   │                         │                                 │
   │ GET /dashboard ───────► auth-state.ts (Nitro request hook)
   │                         │ skip if /api/* or /_nuxt/*
   │                         │ else:
   │                         │   getCookie(ASG_SESSION)
   │                         │   verifySessionToken()
   │                         │   client.getUser(sessionId)
   │                         │   event.context.__asgardeoAuth =
   │                         │     { isSignedIn, user, isLoading: false }
   │                         │                                 │
   │                         │ Nuxt renders page              │
   │                         │  └─► plugin asgardeo.ts runs
   │                         │      reads event.context.__asgardeoAuth
   │                         │      seeds useState('asgardeo:auth')
   │                         │      useAsgardeo() returns reactive state
   │ ◄───── HTML with user info baked in (no loading flash) ──
```

On the client hydration tick, the same plugin flips `isLoading` to `false` (the SSR state is already correct).

### 5.3 Route protection

Two options are supported:

**A. Named middleware on a specific page** (opt-in):

```vue
<script setup>
definePageMeta({ middleware: ['auth'] });
</script>
```

[auth.ts](../../../packages/nuxt/src/runtime/middleware/auth.ts) reads `useState('asgardeo:auth')`. If not signed in, it navigates externally to `/api/auth/signin?returnTo=<current path>` — which starts the full sign-in flow and round-trips the user back after.

**B. Global middleware with `createRouteMatcher`** (app-authored):

```ts
// middleware/auth.global.ts
const isProtectedRoute = createRouteMatcher(['/dashboard/**', '/admin/**']);
export default defineNuxtRouteMiddleware((to) => {
  const { isSignedIn } = useAsgardeo();
  if (isProtectedRoute(to.path) && !isSignedIn.value) {
    return navigateTo(`/api/auth/signin?returnTo=${encodeURIComponent(to.fullPath)}`, { external: true });
  }
});
```

[createRouteMatcher.ts](../../../packages/nuxt/src/runtime/utils/createRouteMatcher.ts) supports `*` (one segment) and `**` (deep) wildcards.

### 5.4 Sign-out (RP-initiated logout)

[signout.get.ts](../../../packages/nuxt/src/runtime/server/routes/auth/signout.get.ts):

1. Reads and verifies the session cookie to recover `sessionId`.
2. Calls `client.signOut(sessionId)` on the Node SDK, which returns Asgardeo's `end_session_endpoint` URL (id_token_hint + post_logout_redirect_uri).
3. Clears both the session and temp cookies.
4. Redirects the browser to that URL. Asgardeo ends its session and redirects the user back to `afterSignOutUrl`.

If no cookie or an invalid one is present, it silently clears cookies and redirects straight to `afterSignOutUrl`.

### 5.5 Client-side helpers via `useAsgardeo()`

From [useAsgardeo.ts](../../../packages/nuxt/src/runtime/composables/useAsgardeo.ts):

| Method | What it does |
|---|---|
| `signIn(returnTo?)` | `navigateTo('/api/auth/signin?returnTo=...', { external: true })` |
| `signOut()` | `navigateTo('/api/auth/signout', { external: true })` |
| `getAccessToken()` | `$fetch('/api/auth/token')` — server looks up the token by `sessionId` |
| `refreshUser()` | `$fetch('/api/auth/session')` — rehydrates `useState('asgardeo:auth')` |
| `isSignedIn` / `user` / `isLoading` | `computed` refs over `useState('asgardeo:auth')` |

---

## 6. Building custom server routes

Consumers writing their own Nitro handlers use the auto-imported helpers from [serverSession.ts](../../../packages/nuxt/src/runtime/server/utils/serverSession.ts):

```ts
// server/api/me.get.ts
export default defineEventHandler(async (event) => {
  const session = await requireServerSession(event); // 401 if no session
  return { userId: session.sub, orgId: session.organizationId };
});
```

For access to the Node SDK itself (e.g. to call `getUser`, `getDecodedIdToken`, or make token-refresh calls), `useAsgardeoServerClient(event)` is also auto-imported into Nitro.

---

## 7. Security properties worth noting

- **Secrets scrubbed from public config.** [module.ts:86-93](../../../packages/nuxt/src/module.ts#L86-L93) actively deletes leaked secrets and logs a loud error.
- **Required secret in production.** [session.ts:32-37](../../../packages/nuxt/src/runtime/server/utils/session.ts#L32-L37) throws if `ASGARDEO_SESSION_SECRET` is missing in production and only falls back to a dev constant with a warning otherwise.
- **Open-redirect guard.** `returnTo` must start with `/` and must not start with `//`; otherwise it is dropped.
- **Exact-match `redirect_uri`.** The Node client singleton is re-created when the resolved callback URL changes (e.g. different origin via `X-Forwarded-*` headers), so the URL sent to `/authorize` and `/token` are always identical.
- **No tokens in the browser.** Access, id, and refresh tokens live only server-side; the session cookie carries a `sessionId` the server uses to retrieve them.

---

## 8. Summary of the request lifecycle

1. **App boot** — `module.ts` registers routes, plugins, middleware, imports.
2. **Any page request** — Nitro plugin `auth-state.ts` resolves the user and seeds `event.context.__asgardeoAuth`; Nuxt plugin `asgardeo.ts` pipes that into `useState('asgardeo:auth')`.
3. **Protected page without a session** — middleware `auth` (or a `createRouteMatcher`-based global one) redirects to `/api/auth/signin?returnTo=...`.
4. **OAuth round-trip** — `signin.get.ts` → Asgardeo → `callback.get.ts` exchanges the code, creates the session JWT, sets the cookie, and redirects to `returnTo`.
5. **Subsequent requests** — the session cookie is verified on each page render; `useAsgardeo()` exposes reactive state; custom server routes use `useServerSession` / `requireServerSession`.
6. **Sign-out** — `signout.get.ts` kicks off RP-initiated logout and clears cookies.
