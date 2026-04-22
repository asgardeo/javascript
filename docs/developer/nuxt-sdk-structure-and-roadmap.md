# Asgardeo Nuxt SDK — Complete Structure & Phased Development Roadmap

> Date: 2026-04-19
> Inputs: [`packages/nuxt/`](../../packages/nuxt/), [`packages/nextjs/`](../../packages/nextjs/), [`EVALUATION.md`](./nuxt-sdk-implementation-plan/EVALUATION.md), [`nuxt-vs-nextjs-sdk-evaluation.md`](./nuxt-vs-nextjs-sdk-evaluation.md), [`packages/vue/`](../../packages/vue/), [`packages/node/`](../../packages/node/), [`packages/react/`](../../packages/react/)
> Purpose: Produce a single, complete blueprint for developing `@asgardeo/nuxt` to parity with `@asgardeo/nextjs`, with phase-by-phase execution.

---

## Table of Contents

1. [Guiding Principles](#1-guiding-principles)
2. [Target Architecture](#2-target-architecture)
3. [Package Layering & Dependencies](#3-package-layering--dependencies)
4. [Complete File Structure](#4-complete-file-structure)
5. [Module & Configuration Contract](#5-module--configuration-contract)
6. [Public API Surface](#6-public-api-surface)
7. [Server-Side Design](#7-server-side-design)
8. [Client-Side Design](#8-client-side-design)
9. [Session Token Model](#9-session-token-model)
10. [Middleware & Route Protection](#10-middleware--route-protection)
11. [Error Model & Logging](#11-error-model--logging)
12. [Testing Strategy](#12-testing-strategy)
13. [Phased Development Roadmap](#13-phased-development-roadmap)
14. [Acceptance Criteria per Phase](#14-acceptance-criteria-per-phase)
15. [What to Keep, Change, and Remove from the Current Code](#15-what-to-keep-change-and-remove-from-the-current-code)

---

## 1. Guiding Principles

The structure below is derived from the two evaluations:

- [`EVALUATION.md`](./nuxt-sdk-implementation-plan/EVALUATION.md) — identified missing `@asgardeo/vue` dependency as the biggest gap.
- [`nuxt-vs-nextjs-sdk-evaluation.md`](./nuxt-vs-nextjs-sdk-evaluation.md) — identified singleton concurrency as the biggest **risk**, and the UI/org/profile gap as the biggest feature deficit.

Principles:

1. **Mirror the Next.js layering exactly.** `@asgardeo/nuxt` should depend on both `@asgardeo/node` (server) and `@asgardeo/vue` (client), the way `@asgardeo/nextjs` depends on `@asgardeo/node` and `@asgardeo/react`.
2. **Keep what Nuxt already does better.** Runtime-config integration, secret-leak prevention in [module.ts](../../packages/nuxt/src/module.ts), auto-imported server utilities, PKCE-by-default, dynamic callback URL resolution — all already superior to Next.js and must survive the refactor.
3. **Fix what Nuxt does worse.** Singleton server client is request-unsafe; swap to per-request clients. Replace silent `.catch(() => null)` with typed `AsgardeoError`. Add refresh-token handling.
4. **Enforce client/server boundaries at the bundler level.** Nuxt's `runtime/server/` directory is already bundler-safe; add subpath exports (`@asgardeo/nuxt/server`) for explicit imports to match Next.js's `./server` export.
5. **Reuse, never reinvent.** Every component and composable in `@asgardeo/vue` that Next.js users get through `@asgardeo/react` should be available in Nuxt via auto-imports — not hand-rolled.
6. **Test what can be tested.** `jose` verification, route matchers, session utilities, SCIM2 flatteners, H3 handlers with a mock event. Integration tests using `@nuxt/test-utils`.

---

## 2. Target Architecture

```
┌──────────────────────── @asgardeo/nuxt ─────────────────────────────┐
│                                                                     │
│  ┌────── CLIENT (Vue / Nuxt app runtime) ──────┐                    │
│  │                                             │                    │
│  │  Components (auto-imported from @asgardeo/vue)                   │
│  │  ├─ <AsgardeoSignedIn>, <AsgardeoSignedOut>, <AsgardeoLoading>   │
│  │  ├─ <AsgardeoSignInButton>, <AsgardeoSignOutButton>              │
│  │  ├─ <AsgardeoSignUpButton>, <AsgardeoSignIn>, <AsgardeoSignUp>   │
│  │  ├─ <AsgardeoUser>, <AsgardeoUserProfile>, <AsgardeoUserDropdown>│
│  │  ├─ <AsgardeoOrganization*>                                      │
│  │  └─ <AsgardeoCallback> (Nuxt-specific wrapper)                   │
│  │                                             │                    │
│  │  Composables (auto-imported)               │                    │
│  │  ├─ useAsgardeo()    (bridges Vue SDK + Nuxt SSR state)          │
│  │  ├─ useUser()                               │                    │
│  │  ├─ useOrganization()                       │                    │
│  │  ├─ useFlow(), useTheme(), useBranding(),  │                    │
│  │  │  useI18n()     (re-exports from Vue SDK)│                    │
│  │  └─ defineAsgardeoMiddleware() (helper)    │                    │
│  │                                             │                    │
│  │  Route middleware: auth (named + createRouteMatcher)             │
│  │  Plugin: asgardeo.client.ts  (install Vue plugin, hydrate)       │
│  └─────────────────────────────────────────────┘                    │
│                        ▲                                            │
│                        │  useState('asgardeo:auth')                 │
│                        │  $fetch('/api/auth/*')                     │
│  ┌──────── SERVER (Nitro) ─────────────────────┐                    │
│  │                                             │                    │
│  │  Server composable: useAsgardeoServerClient(event)               │
│  │   → returns a PER-REQUEST AsgardeoNuxtServerClient               │
│  │                                             │                    │
│  │  Session Manager (jose JWT, HS256)         │                    │
│  │  ├─ createSession / verifySession          │                    │
│  │  └─ createTempSession / verifyTempSession  │                    │
│  │                                             │                    │
│  │  Nitro middleware: session-guard            │                    │
│  │   (declarative server-route protection)    │                    │
│  │                                             │                    │
│  │  Nitro plugin: asgardeo.server.ts           │                    │
│  │   (resolves auth, org, branding on SSR)    │                    │
│  │                                             │                    │
│  │  Routes under /api/auth:                   │                    │
│  │  ├─ signin.get.ts, signin.post.ts           │ redirect + embedded│
│  │  ├─ signup.get.ts, signup.post.ts           │                    │
│  │  ├─ callback.get.ts                         │                    │
│  │  ├─ signout.ts                              │                    │
│  │  ├─ session.get.ts                          │                    │
│  │  ├─ token.get.ts, token.exchange.post.ts    │                    │
│  │  ├─ user.get.ts                             │                    │
│  │  ├─ user/profile.{get,patch}.ts             │                    │
│  │  ├─ user/password.post.ts                   │                    │
│  │  ├─ organizations/index.{get,post}.ts       │                    │
│  │  ├─ organizations/mine.get.ts               │                    │
│  │  ├─ organizations/current.get.ts            │                    │
│  │  ├─ organizations/switch.post.ts            │                    │
│  │  └─ branding.get.ts                         │                    │
│  │                                             │                    │
│  │  AsgardeoNuxtServerClient (extends          │                    │
│  │   AsgardeoNodeClient from @asgardeo/node)   │                    │
│  └─────────────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────┘
          ▲                                       ▲
          │                                       │
   @asgardeo/vue (client base)         @asgardeo/node (server base)
   └─ built on @asgardeo/browser       └─ built on @asgardeo/javascript
```

Compare side-by-side with Next.js:

| Layer            | Next.js               | Nuxt (target)                                 |
| ---------------- | --------------------- | --------------------------------------------- |
| Server base      | `@asgardeo/node`      | `@asgardeo/node`                              |
| Client base      | `@asgardeo/react`     | `@asgardeo/vue` ← **add**                     |
| Server client    | `AsgardeoNextClient`  | `AsgardeoNuxtServerClient` ← **add**          |
| Client bridge    | `AsgardeoProvider` (RSC → CC) | `asgardeo.server.ts` Nitro plugin + `asgardeo.client.ts` Vue plugin (**keep + enhance**) |
| Server→client RPC| Server actions        | Nitro routes (`/api/auth/*`) (**keep + extend**) |
| Middleware       | `asgardeoMiddleware` (edge) | `session-guard` Nitro middleware + `auth` Nuxt route middleware |
| Entry points     | `./` and `./server`   | `./` and `./server` ← **add dual export**     |

---

## 3. Package Layering & Dependencies

### Updated `packages/nuxt/package.json`

```json
{
  "name": "@asgardeo/nuxt",
  "version": "0.1.0-alpha.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/types.d.mts",
      "import": "./dist/module.mjs"
    },
    "./server": {
      "types": "./dist/runtime/server/index.d.ts",
      "import": "./dist/runtime/server/index.mjs"
    }
  },
  "dependencies": {
    "@asgardeo/node": "workspace:*",
    "@asgardeo/vue": "workspace:*",
    "@nuxt/kit": "^3.16.0",
    "defu": "^6.1.4",
    "jose": "^6.0.0"
  },
  "peerDependencies": {
    "nuxt": ">=3.10.0",
    "vue": ">=3.5.0"
  }
}
```

Key changes vs. today's [packages/nuxt/package.json](../../packages/nuxt/package.json):

- Add `"@asgardeo/vue"` dependency.
- Add `./server` subpath export (explicit server-only imports).
- Bump version off `0.0.0`.
- Add `vue` peer dependency.

### Layering diagram

```
┌───────────────────────────────────────┐
│ @asgardeo/nuxt (this package)         │
│  ├─ re-exports Vue components         │
│  ├─ re-exports Vue composables        │
│  ├─ Nitro routes + server client      │
│  └─ Nuxt module glue                  │
└──────────────┬─────────────────┬──────┘
               │                 │
               ▼                 ▼
       @asgardeo/vue     @asgardeo/node
               │                 │
               ▼                 ▼
       @asgardeo/browser  @asgardeo/javascript
               │                 ▲
               └────────┬────────┘
                        ▼
                @asgardeo/javascript (core)
```

---

## 4. Complete File Structure

```
packages/nuxt/
├── package.json
├── README.md
├── CHANGELOG.md
├── tsconfig.json
├── vitest.config.ts
│
├── playground/                       # Dev sandbox (Nuxt-standard)
│   ├── nuxt.config.ts
│   ├── app.vue
│   └── pages/
│       ├── index.vue
│       ├── dashboard.vue             # protected
│       ├── sign-in.vue               # custom embedded sign-in
│       ├── sign-up.vue
│       ├── profile.vue
│       └── organizations/
│           ├── index.vue
│           └── switch.vue
│
├── src/
│   ├── module.ts                     # Nuxt module entry (defineNuxtModule)
│   ├── index.ts                      # Root barrel — re-exports from runtime/*
│   │
│   └── runtime/
│       │
│       ├── types/
│       │   ├── index.ts              # barrel
│       │   ├── config.ts             # AsgardeoNuxtConfig, CookieConfig
│       │   ├── session.ts            # SessionPayload, TempSessionPayload
│       │   ├── auth.ts               # SignInOptions, SignOutOptions, AuthState
│       │   ├── user.ts               # UserProfile, UpdateUserProfileRequest
│       │   ├── organization.ts       # Organization, CreateOrganizationRequest
│       │   ├── flow.ts               # FlowResult, Authenticator, FlowStep
│       │   └── augments.d.ts         # Nuxt + H3 module augmentation
│       │
│       ├── errors/
│       │   ├── index.ts
│       │   ├── asgardeo-error.ts     # AsgardeoError (extends Error)
│       │   └── error-codes.ts        # ErrorCode enum
│       │
│       ├── utils/
│       │   ├── route-matcher.ts      # createRouteMatcher (universal)
│       │   ├── url-validation.ts     # validateReturnUrl (stricter than today)
│       │   ├── resolve-config.ts     # env → options → runtimeConfig
│       │   ├── validate-config.ts    # fail-closed in production
│       │   ├── log.ts                # maskToken, logger factory
│       │   └── scim2.ts              # flattenScim2Profile, toScim2Patch
│       │
│       ├── index.ts                  # Client-public barrel (composables, components)
│       │
│       │── # ─────── CLIENT RUNTIME ───────
│       │
│       ├── plugins/
│       │   └── asgardeo.client.ts    # Install Vue plugin; adapt Nuxt useState → Vue providers
│       │
│       ├── composables/
│       │   ├── useAsgardeo.ts        # Nuxt-aware wrapper around Vue's useAsgardeo
│       │   ├── useUser.ts            # Re-export from Vue SDK (or thin wrapper)
│       │   ├── useOrganization.ts
│       │   ├── useFlow.ts            # Re-export
│       │   ├── useTheme.ts           # Re-export
│       │   ├── useBranding.ts        # Re-export
│       │   ├── useI18n.ts            # Re-export (avoid clash with @nuxtjs/i18n)
│       │   └── defineAsgardeoMiddleware.ts  # Typed middleware factory
│       │
│       ├── components/
│       │   ├── index.ts              # Re-exports from @asgardeo/vue
│       │   ├── AsgardeoProvider.vue  # Nuxt-specific wrapper (SSR-aware)
│       │   └── AsgardeoCallback.vue  # Handles /auth/callback in embedded flow
│       │
│       ├── middleware/
│       │   └── auth.ts               # defineNuxtRouteMiddleware (route protection)
│       │
│       │── # ─────── SERVER RUNTIME ───────
│       │
│       └── server/
│           ├── index.ts              # Public server barrel — for @asgardeo/nuxt/server
│           │
│           ├── client.ts             # AsgardeoNuxtServerClient (extends AsgardeoNodeClient)
│           ├── session-manager.ts    # JWT session + temp session (jose)
│           │
│           ├── utils/
│           │   ├── get-client.ts     # Per-request client factory (no singleton)
│           │   ├── require-session.ts # requireServerSession(event) → throws 401
│           │   ├── use-session.ts    # useServerSession(event) → nullable
│           │   ├── token-refresh.ts  # getValidAccessToken(event)
│           │   ├── resolve-callback-url.ts   # X-Forwarded-* aware
│           │   └── handle-error.ts   # handleAuthRouteError (createError + logging)
│           │
│           ├── plugins/
│           │   └── asgardeo.server.ts # Nitro plugin — SSR auth state hydration
│           │
│           ├── middleware/
│           │   └── session-guard.ts  # Nitro middleware — server route protection
│           │
│           └── routes/
│               └── auth/
│                   ├── signin.get.ts       # Redirect sign-in
│                   ├── signin.post.ts      # Embedded sign-in step
│                   ├── signup.get.ts       # Redirect sign-up
│                   ├── signup.post.ts      # Embedded sign-up step
│                   ├── callback.get.ts     # OAuth callback
│                   ├── signout.ts          # GET + POST
│                   ├── session.get.ts      # Current auth state JSON
│                   ├── token.get.ts        # Valid access token (refresh-aware)
│                   ├── token.exchange.post.ts # RFC 8693 (org switch etc.)
│                   ├── user.get.ts         # ID-token claims
│                   ├── user/
│                   │   ├── profile.get.ts   # SCIM2 /Me
│                   │   ├── profile.patch.ts
│                   │   └── password.post.ts
│                   ├── organizations/
│                   │   ├── index.get.ts     # all orgs (admin)
│                   │   ├── index.post.ts    # create
│                   │   ├── mine.get.ts      # user's orgs
│                   │   ├── current.get.ts
│                   │   └── switch.post.ts
│                   └── branding.get.ts
│
├── tests/
│   ├── unit/
│   │   ├── session-manager.test.ts
│   │   ├── route-matcher.test.ts
│   │   ├── url-validation.test.ts
│   │   ├── scim2-utils.test.ts
│   │   ├── resolve-callback-url.test.ts
│   │   └── error-codes.test.ts
│   ├── integration/
│   │   ├── auth-routes.test.ts
│   │   ├── composables.test.ts
│   │   ├── middleware.test.ts
│   │   └── ssr-hydration.test.ts
│   ├── fixtures/
│   │   └── basic/
│   │       ├── nuxt.config.ts
│   │       ├── app.vue
│   │       └── pages/
│   └── helpers/
│       ├── mock-h3-event.ts
│       ├── mock-node-client.ts
│       └── create-test-app.ts
│
└── LICENSE
```

---

## 5. Module & Configuration Contract

### `AsgardeoNuxtConfig` (superset of today)

```typescript
export interface AsgardeoNuxtConfig {
  // Core (already present)
  baseUrl: string;
  clientId: string;
  clientSecret?: string;         // server-only
  afterSignInUrl?: string;
  afterSignOutUrl?: string;
  scopes?: string[];
  sessionSecret?: string;        // server-only

  // Additions to reach Next.js parity
  signInUrl?: string;            // for custom embedded sign-in page, e.g. '/sign-in'
  signUpUrl?: string;
  organizationHandle?: string;   // for org-scoped flows
  applicationId?: string;        // for app-scoped branding
  preferences?: {
    fetchUser?: boolean;
    fetchOrganizations?: boolean;
    fetchBranding?: boolean;
  };
  cookies?: {
    sessionName?: string;
    tempSessionName?: string;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
  };
  endpoints?: {
    authorization?: string;
    token?: string;
    userInfo?: string;
    logout?: string;
    // etc. — fully overrideable
  };
  router?: {
    apiPrefix?: string;          // default '/api/auth'
  };
  tokens?: {
    accessTokenTTL?: number;     // default 3600
    refreshSkewSeconds?: number; // default 60
  };
}
```

### Module augmentation (`augments.d.ts`)

```typescript
declare module '@nuxt/schema' {
  interface NuxtConfig  { asgardeo?: AsgardeoNuxtConfig; }
  interface NuxtOptions { asgardeo?: AsgardeoNuxtConfig; }
  interface PublicRuntimeConfig {
    asgardeo: { baseUrl: string; clientId: string; afterSignInUrl: string;
                afterSignOutUrl: string; scopes: string[];
                signInUrl?: string; signUpUrl?: string;
                organizationHandle?: string; applicationId?: string; };
  }
  interface RuntimeConfig {
    asgardeo: { clientSecret: string; sessionSecret: string; };
  }
}

declare module 'h3' {
  interface H3EventContext {
    asgardeo?: {
      session: SessionPayload | null;
      isSignedIn: boolean;
    };
  }
}
```

H3 context augmentation removes the `event.context['__asgardeoAuth'] as any` pattern called out in [EVALUATION.md §4.8](./nuxt-sdk-implementation-plan/EVALUATION.md).

### Validation (fail-closed)

[validate-config.ts](../../packages/nuxt/src/runtime/utils/validate-config.ts) (new) must:

- Warn on missing `baseUrl` / `clientId` at build time (already done).
- **Throw** if `sessionSecret` is missing and `NODE_ENV === 'production'` (today it only warns — per [EVALUATION.md §4.11](./nuxt-sdk-implementation-plan/EVALUATION.md) and [nuxt-vs-nextjs §8.4](./nuxt-vs-nextjs-sdk-evaluation.md)).
- Strip `clientSecret` / `sessionSecret` from public runtime config (keep current behavior in [module.ts:86-93](../../packages/nuxt/src/module.ts)).

---

## 6. Public API Surface

### Main entry — `@asgardeo/nuxt`

The Nuxt module registers everything as auto-imports; the explicit barrel is for TypeScript consumers who prefer `import { X } from '@asgardeo/nuxt'`:

```typescript
// Composables
export { useAsgardeo, useUser, useOrganization, useFlow, useTheme,
         useBranding, useI18n, defineAsgardeoMiddleware } from './runtime/composables';

// Components (type-only re-exports; components come via addComponent in module.ts)
export type * from './runtime/components';

// Types
export type { AsgardeoNuxtConfig, SessionPayload, User, Organization,
              SignInOptions, AuthState, FlowResult } from './runtime/types';

// Errors
export { AsgardeoError, ErrorCode } from './runtime/errors';

// Utils safe for client
export { createRouteMatcher } from './runtime/utils/route-matcher';
```

### Server entry — `@asgardeo/nuxt/server`

```typescript
export { useAsgardeoServerClient, useServerSession, requireServerSession,
         getValidAccessToken } from './utils';
export { SessionManager } from './session-manager';
export { AsgardeoNuxtServerClient } from './client';
export type { SessionPayload, TempSessionPayload } from '../types';
```

This mirrors Next.js's `@asgardeo/nextjs/server` subpath.

### Auto-imports

In [module.ts](../../packages/nuxt/src/module.ts), register via `@nuxt/kit`:

```typescript
// Composables
addImports([
  { name: 'useAsgardeo',       from: resolve('./runtime/composables/useAsgardeo') },
  { name: 'useUser',           from: resolve('./runtime/composables/useUser') },
  { name: 'useOrganization',   from: resolve('./runtime/composables/useOrganization') },
  { name: 'useFlow',           from: resolve('./runtime/composables/useFlow') },
  { name: 'useTheme',          from: resolve('./runtime/composables/useTheme') },
  { name: 'useBranding',       from: resolve('./runtime/composables/useBranding') },
  { name: 'useI18n',           from: resolve('./runtime/composables/useI18n'),
    as: 'useAsgardeoI18n' },   // avoid clash with @nuxtjs/i18n
  { name: 'defineAsgardeoMiddleware',
    from: resolve('./runtime/composables/defineAsgardeoMiddleware') },
]);

// Components — re-export from @asgardeo/vue
const components = [
  'SignedIn', 'SignedOut', 'Loading',
  'SignInButton', 'SignOutButton', 'SignUpButton',
  'SignIn', 'SignUp',
  'User', 'UserProfile', 'UserDropdown',
  'Organization', 'OrganizationProfile', 'OrganizationSwitcher',
  'OrganizationList', 'CreateOrganization',
];
for (const name of components) {
  addComponent({ name: `Asgardeo${name}`, export: name, filePath: '@asgardeo/vue' });
}

// Server auto-imports (keep existing pattern from current module.ts)
nuxt.hook('nitro:config', (nitroConfig) => {
  nitroConfig.imports ||= {};
  nitroConfig.imports.imports ||= [];
  nitroConfig.imports.imports.push(
    { name: 'useAsgardeoServerClient',
      from: resolve('./runtime/server/utils/get-client') },
    { name: 'useServerSession',
      from: resolve('./runtime/server/utils/use-session') },
    { name: 'requireServerSession',
      from: resolve('./runtime/server/utils/require-session') },
  );
});
```

---

## 7. Server-Side Design

### 7.1 Per-request client (fix singleton bug)

Today, [`runtime/server/utils/client.ts`](../../packages/nuxt/src/runtime/server/utils/client.ts) caches a single `LegacyAsgardeoNodeClient` at module scope. Per [nuxt-vs-nextjs §5.1](./nuxt-vs-nextjs-sdk-evaluation.md), that client holds PKCE verifiers and session state in memory, so concurrent requests can interfere.

New `server/utils/get-client.ts`:

```typescript
export const useAsgardeoServerClient = (event: H3Event): AsgardeoNuxtServerClient => {
  // One client per request; state lives on event.context, not module scope
  if (event.context.asgardeoClient) return event.context.asgardeoClient;

  const runtimeConfig = useRuntimeConfig(event);
  const origin = resolveCallbackUrl(event);
  const client = new AsgardeoNuxtServerClient({
    baseUrl: runtimeConfig.public.asgardeo.baseUrl,
    clientId: runtimeConfig.public.asgardeo.clientId,
    clientSecret: runtimeConfig.asgardeo.clientSecret,
    signInRedirectURL: `${origin}/api/auth/callback`,
    signOutRedirectURL: runtimeConfig.public.asgardeo.afterSignOutUrl,
    scope: runtimeConfig.public.asgardeo.scopes,
    enablePKCE: true,
  });
  event.context.asgardeoClient = client;
  return client;
};
```

- Trades per-request allocation for correctness.
- PKCE `code_verifier` continues to live in the short-lived temp-session JWT, not in client state.
- Matches the Next.js approach (`AsgardeoNextClient.getInstance()` does cache, but in an isolated server-action context per request — Nuxt should go further and use truly per-request instances).

### 7.2 `AsgardeoNuxtServerClient` (extends `AsgardeoNodeClient`)

`server/client.ts`:

```typescript
export class AsgardeoNuxtServerClient extends AsgardeoNodeClient<Record<string, unknown>> {
  // Overrides / additions:
  //   - getValidAccessToken(event)  — checks expiry, refreshes if needed
  //   - exchangeToken(event, params) — RFC 8693 for org switch
  //   - getUserProfile(event)        — SCIM2 /Me + schemas
  //   - updateUserProfile(event, payload)
  //   - getMyOrganizations(event)
  //   - getAllOrganizations(event)
  //   - getCurrentOrganization(event)
  //   - switchOrganization(event, orgId)
  //   - getBrandingPreference()
}
```

Mirrors [`AsgardeoNextClient.ts`](../../packages/nextjs/src/AsgardeoNextClient.ts) surface but constructed per-request.

### 7.3 Session Manager

`server/session-manager.ts` — consolidation of the existing [`session.ts`](../../packages/nuxt/src/runtime/server/utils/session.ts) logic, plus:

```typescript
interface SessionPayload {
  sub: string;
  sessionId: string;
  scopes: string;
  accessToken: string;
  accessTokenExpiresAt: number;   // ADD — enables refresh
  refreshToken?: string;           // ADD — enables refresh
  idToken?: string;                // ADD — used for org/claims
  organizationId?: string;
  iat: number;
  exp: number;
  type: 'session';
}
```

Cookie-size concern from [nuxt-vs-nextjs §5.5](./nuxt-vs-nextjs-sdk-evaluation.md): if payloads approach 4KB, provide a `cookies: { split: true }` option that splits into `.0` / `.1` cookies (matches NextAuth, Auth.js patterns).

### 7.4 Server routes

All routes share:

- `useAsgardeoServerClient(event)` for the per-request client.
- `handleAuthRouteError` wrapper that converts any `AsgardeoError` into a proper H3 error and logs with `maskToken`.
- CSRF-safe methods: GET for idempotent operations, POST for state-changing (sign-out, profile patch, org switch, create org).

Concrete additions vs. today:

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/signup` | GET | Redirect to Asgardeo sign-up endpoint |
| `/api/auth/signup` | POST | Embedded sign-up step |
| `/api/auth/signin` | POST | Embedded sign-in step (authenticator selection / credentials) |
| `/api/auth/token/exchange` | POST | RFC 8693 token exchange (org switch) |
| `/api/auth/user/profile` | GET | SCIM2 /Me with schemas |
| `/api/auth/user/profile` | PATCH | SCIM2 patch user |
| `/api/auth/user/password` | POST | Change password |
| `/api/auth/organizations` | GET | All orgs (admin) |
| `/api/auth/organizations` | POST | Create org |
| `/api/auth/organizations/mine` | GET | User's orgs |
| `/api/auth/organizations/current` | GET | Current org |
| `/api/auth/organizations/switch` | POST | Switch org — token exchange + session re-issue |
| `/api/auth/branding` | GET | Branding preferences |

### 7.5 Nitro SSR plugin

`server/plugins/asgardeo.server.ts` — replaces [`auth-state.ts`](../../packages/nuxt/src/runtime/server/plugins/auth-state.ts). Improvements:

- Use augmented `event.context.asgardeo` (typed) instead of `__asgardeoAuth: any`.
- Optionally fetch organizations and branding in parallel if `preferences.fetchOrganizations` / `preferences.fetchBranding` are enabled — mirrors Next.js's RSC `AsgardeoProvider` prefetch.
- Short-circuit on `/api/auth/*` routes to avoid double-fetching during callback.

---

## 8. Client-Side Design

### 8.1 Client plugin

`runtime/plugins/asgardeo.client.ts`:

```typescript
import { AsgardeoPlugin } from '@asgardeo/vue';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.asgardeo;
  const ssrState = useState<AuthState>('asgardeo:auth');

  nuxtApp.vueApp.use(AsgardeoPlugin, {
    baseUrl: config.baseUrl,
    clientId: config.clientId,
    afterSignInUrl: config.afterSignInUrl,
    afterSignOutUrl: config.afterSignOutUrl,
    scopes: config.scopes,
    // Tell Vue SDK to delegate all auth actions to the Nitro backend
    // instead of running PKCE in the browser.
    mode: 'delegated',
    api: {
      signIn:  '/api/auth/signin',
      signOut: '/api/auth/signout',
      signUp:  '/api/auth/signup',
      callback:'/api/auth/callback',
      session: '/api/auth/session',
      token:   '/api/auth/token',
      user:    '/api/auth/user',
      userProfile:      '/api/auth/user/profile',
      organizations:    '/api/auth/organizations',
      switchOrg:        '/api/auth/organizations/switch',
      branding:         '/api/auth/branding',
    },
    initialState: ssrState.value,
  });
});
```

Key idea: `@asgardeo/vue` was built with the assumption that it runs in a pure SPA and handles PKCE itself (`AsgardeoBrowserClient`). For Nuxt, the Vue client should operate in **delegated mode** where all auth operations go through the Nitro backend. This requires a small addition to `@asgardeo/vue` — a `mode: 'delegated'` option in `AsgardeoPlugin` that routes calls through `$fetch` instead of the browser client.

If modifying `@asgardeo/vue` is out of scope, the alternative is:

- Don't install `AsgardeoPlugin` directly.
- Instead, install its **providers** manually (`UserProvider`, `OrganizationProvider`, `FlowProvider`, `ThemeProvider`, `I18nProvider`, `BrandingProvider`), each seeded with data fetched from `/api/auth/*`.

Both paths work. The delegated-mode addition to `@asgardeo/vue` is cleaner and benefits pure Vue SSR apps too.

### 8.2 `useAsgardeo()` composable

`runtime/composables/useAsgardeo.ts`:

```typescript
export const useAsgardeo = () => {
  // Prefer Vue SDK's composable once the plugin is installed in delegated mode.
  // Augment with Nuxt-specific niceties:
  const vueAsgardeo = vueUseAsgardeo();

  const signIn = async (opts?: SignInOptions) => {
    // Server-side (SSR): use navigateTo for proper redirect
    if (import.meta.server) {
      return navigateTo(buildUrl('/api/auth/signin', opts), { external: true });
    }
    return vueAsgardeo.signIn(opts);
  };

  // similarly: signOut, signUp
  // expose: isSignedIn, isLoading, user, organization, error, flow, ...

  return { ...vueAsgardeo, signIn, signOut, signUp };
};
```

Expose a richer surface than today's 6 properties — match Next.js [useAsgardeo hook](../../packages/nextjs/src/client/contexts/Asgardeo/useAsgardeo.ts):

- `isSignedIn`, `isLoading`, `error` (reactive)
- `user`, `organization`, `branding` (reactive)
- `signIn`, `signOut`, `signUp`
- `getAccessToken`, `refreshUser`
- `switchOrganization`, `createOrganization`
- `updateUserProfile`, `changePassword`
- `handleOAuthCallback` (for embedded flows)

### 8.3 Components

All components come from `@asgardeo/vue` via `addComponent`. Prefix with `Asgardeo` to avoid name collisions in user code (Next.js uses no prefix; Nuxt conventions prefer prefixed component names).

Two Nuxt-only components:

- `AsgardeoProvider.vue` — optional explicit wrapper for users who want to scope auth state to part of the app. In practice most users rely on the module-installed plugin and don't wrap anything.
- `AsgardeoCallback.vue` — renders on `/auth/callback` if the user wants client-driven callback handling (useful for embedded flows).

---

## 9. Session Token Model

### 9.1 Persistent session JWT

- Algorithm: HS256 via `jose` (same as Next.js, same as today).
- Signed with `sessionSecret` (server-only runtime config).
- Cookie: `httpOnly`, `secure` in production, `sameSite=lax`, `path=/`.
- TTL: follows access-token `expires_in` + optional skew; refresh extends it.

Payload (extends today's):

```typescript
{
  sub:                    string,    // from id_token
  sessionId:              string,
  scopes:                 string,
  accessToken:            string,
  accessTokenExpiresAt:   number,    // ADD
  refreshToken?:          string,    // ADD
  idToken?:               string,    // ADD
  organizationId?:        string,
  iat:                    number,
  exp:                    number,
  type: 'session',
}
```

### 9.2 Temp session JWT (OAuth handshake)

Already implemented correctly. Payload carries `state`, `codeVerifier`, `returnTo`; TTL 15 min. Keep as-is.

### 9.3 Refresh flow

New `server/utils/token-refresh.ts`:

```typescript
export const getValidAccessToken = async (event: H3Event): Promise<string> => {
  const session = await requireServerSession(event);
  const skew = 60;
  if (session.accessTokenExpiresAt - skew > Math.floor(Date.now() / 1000)) {
    return session.accessToken; // still fresh
  }
  if (!session.refreshToken) {
    throw new AsgardeoError('Access token expired, no refresh token', ErrorCode.SessionExpired);
  }
  const client = useAsgardeoServerClient(event);
  const refreshed = await client.refreshAccessToken(session.refreshToken);
  // re-issue session JWT with new tokens + expiry
  await SessionManager.update(event, refreshed);
  return refreshed.accessToken;
};
```

Called by `/api/auth/token` and by any server route that needs a valid token. Closes the gap flagged in [EVALUATION.md §4.3](./nuxt-sdk-implementation-plan/EVALUATION.md).

---

## 10. Middleware & Route Protection

### 10.1 Client route middleware (keep + improve)

[`runtime/middleware/auth.ts`](../../packages/nuxt/src/runtime/middleware/auth.ts) — already works. Enhance to accept options:

```typescript
// pages/dashboard.vue
definePageMeta({ middleware: ['auth'] });

// pages/admin.vue
definePageMeta({ middleware: [defineAsgardeoMiddleware({
  requireOrganization: true,
  redirectTo: '/sign-in?reason=org-required',
})]});
```

### 10.2 Nitro server middleware (NEW — fills a critical gap)

`server/middleware/session-guard.ts`:

```typescript
export default defineEventHandler(async (event) => {
  const url = event.node.req.url ?? '';
  if (!url.startsWith('/api/')) return;           // only guard APIs
  if (url.startsWith('/api/auth/')) return;        // auth endpoints are public

  const runtimeConfig = useRuntimeConfig(event);
  const matchers = runtimeConfig.asgardeo.protectedRoutes ?? [];
  const isProtected = matchers.some((m) => createRouteMatcher([m])(url));
  if (!isProtected) return;

  try {
    await requireServerSession(event);
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
});
```

Registered via `addServerHandler({ handler, middleware: true })` in module.ts. Users configure protected routes declaratively:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  asgardeo: {
    protectedRoutes: ['/api/private/**', '/api/admin/**'],
  },
});
```

This closes the gap from [EVALUATION.md §4.4](./nuxt-sdk-implementation-plan/EVALUATION.md) and [nuxt-vs-nextjs §6 "Enhanced Middleware"](./nuxt-vs-nextjs-sdk-evaluation.md).

### 10.3 Route matcher — keep

[`utils/createRouteMatcher.ts`](../../packages/nuxt/src/runtime/utils/createRouteMatcher.ts) — already good. Add unit tests (see Phase 1).

---

## 11. Error Model & Logging

### 11.1 `AsgardeoError`

```typescript
export enum ErrorCode {
  // Configuration
  ConfigMissingBaseUrl    = 'config/missing-base-url',
  ConfigMissingClientId   = 'config/missing-client-id',
  ConfigMissingSecret     = 'config/missing-session-secret',

  // Session
  SessionMissing          = 'session/missing',
  SessionInvalid          = 'session/invalid',
  SessionExpired          = 'session/expired',
  TempSessionInvalid      = 'session/temp-invalid',

  // OAuth
  OAuthStateInvalid       = 'oauth/state-invalid',
  OAuthCallbackError      = 'oauth/callback-error',
  TokenExchangeFailed     = 'oauth/token-exchange-failed',
  TokenRefreshFailed      = 'oauth/token-refresh-failed',

  // SCIM2
  UserProfileFetchFailed  = 'scim2/user-profile-fetch-failed',
  UserProfileUpdateFailed = 'scim2/user-profile-update-failed',

  // Organization
  OrganizationSwitchFailed  = 'organization/switch-failed',
  OrganizationCreateFailed  = 'organization/create-failed',

  // Redirect validation
  OpenRedirectBlocked     = 'security/open-redirect-blocked',
}

export class AsgardeoError extends Error {
  code: ErrorCode;
  statusCode?: number;
  cause?: unknown;
  context?: Record<string, unknown>;
  constructor(message: string, code: ErrorCode, opts?: { statusCode?: number; cause?: unknown; context?: Record<string, unknown> }) {
    super(message);
    this.code = code;
    this.statusCode = opts?.statusCode;
    this.cause = opts?.cause;
    this.context = opts?.context;
  }
}
```

Wrap every `.catch(() => null)` in the existing code with this. Closes [EVALUATION.md §4.2](./nuxt-sdk-implementation-plan/EVALUATION.md), [nuxt-vs-nextjs §5.6](./nuxt-vs-nextjs-sdk-evaluation.md).

### 11.2 Logger

`runtime/utils/log.ts`:

```typescript
export const createLogger = (prefix: string) => ({
  debug: (...args: unknown[]) => { if (process.env.ASGARDEO_DEBUG) console.log(`[${prefix}]`, ...args); },
  info:  (...args: unknown[]) => console.log(`[${prefix}]`, ...args),
  warn:  (...args: unknown[]) => console.warn(`[${prefix}]`, ...args),
  error: (...args: unknown[]) => console.error(`[${prefix}]`, ...args),
});

export const maskToken = (token: string): string =>
  token.length <= 8 ? '***' : `${token.slice(0, 4)}…${token.slice(-4)}`;
```

Use `maskToken` everywhere tokens may appear in logs or error messages.

---

## 12. Testing Strategy

### 12.1 Unit tests (pure functions)

| File under test | Test file |
|---|---|
| `session-manager.ts` | `tests/unit/session-manager.test.ts` — create/verify, expiry, tampered sig |
| `utils/route-matcher.ts` | `tests/unit/route-matcher.test.ts` — globs, negation, edge cases |
| `utils/url-validation.ts` | `tests/unit/url-validation.test.ts` — `//evil.com`, `/\evil.com`, encoded forms |
| `utils/resolve-callback-url.ts` | `tests/unit/resolve-callback-url.test.ts` — X-Forwarded-* headers |
| `utils/scim2.ts` | `tests/unit/scim2-utils.test.ts` — flatten, patch |
| `errors/*` | `tests/unit/error-codes.test.ts` — preserved codes, serialization |

### 12.2 Integration tests (Nuxt + Nitro)

Using `@nuxt/test-utils` with the `tests/fixtures/basic` app:

- `auth-routes.test.ts` — mock Asgardeo, drive the full redirect + callback flow.
- `composables.test.ts` — render a component using `useAsgardeo`, assert reactive state after mocked API.
- `middleware.test.ts` — unauthenticated request to a protected route → 401; authenticated → 200.
- `ssr-hydration.test.ts` — first SSR paint shows correct auth state, no mismatch warning on hydration.

### 12.3 Test helpers

`tests/helpers/mock-node-client.ts` — stub `AsgardeoNuxtServerClient` methods so tests don't need a live Asgardeo.
`tests/helpers/mock-h3-event.ts` — factory for `H3Event` with cookies, headers, context.

---

## 13. Phased Development Roadmap

Five phases. Each phase is independently shippable; later phases strictly build on earlier ones.

### Phase 0 — Hygiene (2–3 days)

Small, high-value cleanup before new features.

- Add `./server` subpath export to [`package.json`](../../packages/nuxt/package.json).
- Add H3 module augmentation; remove all `event.context['__asgardeoAuth']` `any` casts.
- Introduce `AsgardeoError` + `ErrorCode` skeleton (no rewriting of call sites yet).
- Introduce `maskToken` + replace raw token references in log statements.
- Add failing-config validation (throw on missing `sessionSecret` in production).
- Add baseline unit tests: `route-matcher`, `url-validation`, `session-manager`.

**Deliverable:** same feature set, better typed, tested, and failing loudly on misconfig.

---

### Phase 1 — Wire up `@asgardeo/vue` (1–2 weeks) — highest ROI

This is the single most impactful change (per both evaluations).

| # | Task | Files |
|---|---|---|
| 1.1 | Add `"@asgardeo/vue": "workspace:*"` dependency | [`package.json`](../../packages/nuxt/package.json) |
| 1.2 | Add `mode: 'delegated'` option to `@asgardeo/vue`'s `AsgardeoPlugin` (small patch to Vue SDK) | `packages/vue/src/plugins/AsgardeoPlugin.ts` |
| 1.3 | Replace `runtime/plugins/asgardeo.ts` with new client plugin that installs the Vue plugin | [`runtime/plugins/asgardeo.client.ts`](../../packages/nuxt/src/runtime/plugins/asgardeo.ts) |
| 1.4 | Rewrite `useAsgardeo` as a thin Nuxt-aware wrapper around Vue's `useAsgardeo` | `runtime/composables/useAsgardeo.ts` |
| 1.5 | Add auto-imports for `useUser`, `useOrganization`, `useFlow`, `useTheme`, `useBranding`, `useAsgardeoI18n` via `addImports` | `src/module.ts` |
| 1.6 | Register all ~15 components from `@asgardeo/vue` via `addComponent` | `src/module.ts` |
| 1.7 | Seed Vue providers with SSR-resolved state (`useState('asgardeo:auth')`) | `runtime/plugins/asgardeo.client.ts` |
| 1.8 | Playground: add `<AsgardeoSignInButton />`, `<AsgardeoSignedIn>`, `<AsgardeoUserDropdown>` demo | `playground/pages/index.vue` |

**Deliverable:** developers can drop pre-built Vue components into their Nuxt pages without writing markup. ~60% of missing features become "free".

---

### Phase 2 — Per-request server client + refresh tokens (1 week)

Addresses [nuxt-vs-nextjs §5.1](./nuxt-vs-nextjs-sdk-evaluation.md) (singleton) and [EVALUATION.md §4.3](./nuxt-sdk-implementation-plan/EVALUATION.md) (no refresh).

| # | Task | Files |
|---|---|---|
| 2.1 | Create `AsgardeoNuxtServerClient extends AsgardeoNodeClient` | `runtime/server/client.ts` |
| 2.2 | Rewrite client factory to return a per-request instance on `event.context` | `runtime/server/utils/get-client.ts` |
| 2.3 | Extend session payload with `accessTokenExpiresAt`, `refreshToken`, `idToken` | `runtime/server/session-manager.ts` |
| 2.4 | Implement `getValidAccessToken(event)` with 60s skew | `runtime/server/utils/token-refresh.ts` |
| 2.5 | Update `/api/auth/token` and `/api/auth/callback` to use new fields | `runtime/server/routes/auth/token.get.ts`, `callback.get.ts` |
| 2.6 | Add Nitro plugin upgrade: typed `event.context.asgardeo` | `runtime/server/plugins/asgardeo.server.ts` |
| 2.7 | Unit + integration tests for refresh path | `tests/unit/session-manager.test.ts`, `tests/integration/auth-routes.test.ts` |

**Deliverable:** concurrency-safe server; long sessions no longer die silently at access-token expiry.

---

### Phase 3 — Server-side route protection + richer middleware (3–5 days)

Addresses [EVALUATION.md §4.4](./nuxt-sdk-implementation-plan/EVALUATION.md), [nuxt-vs-nextjs §6.3](./nuxt-vs-nextjs-sdk-evaluation.md).

| # | Task | Files |
|---|---|---|
| 3.1 | Nitro middleware for declarative server-route protection | `runtime/server/middleware/session-guard.ts` |
| 3.2 | Config option `asgardeo.protectedRoutes` (array of matcher patterns) | `runtime/types/config.ts`, `src/module.ts` |
| 3.3 | `defineAsgardeoMiddleware` helper: options like `requireOrganization`, `requireScopes` | `runtime/composables/defineAsgardeoMiddleware.ts` |
| 3.4 | Integration tests: unauthed on `/api/private/**` → 401; authed → 200 | `tests/integration/middleware.test.ts` |

**Deliverable:** server routes protected without users writing their own guards.

---

### Phase 4 — User profile + Organization feature parity (2 weeks)

Closes the biggest feature gap ([nuxt-vs-nextjs §Organization Management](./nuxt-vs-nextjs-sdk-evaluation.md)).

| # | Task | Files |
|---|---|---|
| 4.1 | SCIM2 profile routes | `routes/auth/user/profile.get.ts`, `profile.patch.ts` |
| 4.2 | Password change route | `routes/auth/user/password.post.ts` |
| 4.3 | Org routes: index, mine, current, create, switch | `routes/auth/organizations/*.ts` |
| 4.4 | `scim2.ts` utilities (flatten, patch) | `runtime/utils/scim2.ts` |
| 4.5 | Branding preferences route | `routes/auth/branding.get.ts` |
| 4.6 | Ensure `useUser` / `useOrganization` / `useBranding` composables from Phase 1 call these routes | `runtime/plugins/asgardeo.client.ts` |
| 4.7 | Extend Nitro SSR plugin to prefetch orgs/branding per `preferences` | `runtime/server/plugins/asgardeo.server.ts` |
| 4.8 | Playground: organization switcher, user profile editor | `playground/pages/profile.vue`, `organizations/*.vue` |

**Deliverable:** all data-fetching composables in `@asgardeo/vue` now work end-to-end against the Nuxt backend.

---

### Phase 5 — Embedded sign-in / sign-up flows (1–2 weeks)

Addresses [EVALUATION.md §4.5](./nuxt-sdk-implementation-plan/EVALUATION.md), [nuxt-vs-nextjs §Missing 1/8](./nuxt-vs-nextjs-sdk-evaluation.md).

| # | Task | Files |
|---|---|---|
| 5.1 | Embedded sign-in step route (Flow Execution API proxy) | `routes/auth/signin.post.ts` |
| 5.2 | Embedded sign-up route(s) | `routes/auth/signup.get.ts`, `signup.post.ts` |
| 5.3 | Token exchange route | `routes/auth/token.exchange.post.ts` |
| 5.4 | `AsgardeoCallback.vue` component for embedded callback handling | `runtime/components/AsgardeoCallback.vue` |
| 5.5 | `useFlow()` composable returning reactive flow state | auto-import from Vue SDK |
| 5.6 | Playground: custom `/sign-in` page with embedded form | `playground/pages/sign-in.vue` |

**Deliverable:** users can render `<AsgardeoSignIn />` inside their own app without redirecting to Asgardeo's hosted page.

---

### Phase 6 — Polish, docs, release (1 week)

| # | Task |
|---|---|
| 6.1 | Stricter `returnTo` validation (URL canonicalization + allowed-origins list) |
| 6.2 | Opt-in cookie splitting for large session payloads |
| 6.3 | README.md rewrite + QUICKSTART guide (copy Next.js layout) |
| 6.4 | API reference generation (typedoc) |
| 6.5 | E2E tests against a mocked Asgardeo using `@nuxt/test-utils` |
| 6.6 | Changeset + bump to `0.1.0-alpha.0`, publish to npm |

**Deliverable:** shipping alpha.

---

## 14. Acceptance Criteria per Phase

| Phase | Acceptance criteria |
|---|---|
| **0** | `pnpm --filter @asgardeo/nuxt test` passes with ≥80% coverage on utils & session-manager. `NODE_ENV=production` + missing `sessionSecret` throws at module init. No `any` in `event.context`. |
| **1** | Playground can render `<AsgardeoSignInButton />`, `<AsgardeoSignedIn>`, `<AsgardeoUserDropdown>` without any user-written markup. `useAsgardeo()` reports the same fields as `@asgardeo/react`'s hook. |
| **2** | Two concurrent sign-ins in parallel terminals never cross-contaminate. Access token at the 59-minute mark is automatically refreshed and the client sees zero interruption. |
| **3** | Unauthed request to `/api/private/foo` returns 401 without any user code. `defineAsgardeoMiddleware({ requireOrganization: true })` blocks users with no `organizationId` in session. |
| **4** | `useUser().updateProfile({ displayName: 'x' })` persists to SCIM2. `useOrganization().switchTo(orgId)` re-issues the session JWT with the new org claim. |
| **5** | `<AsgardeoSignIn />` mounted on `/sign-in` completes full username+password login without leaving the page. `<AsgardeoCallback />` handles the authorize redirect client-side. |
| **6** | Published to npm as `0.1.0-alpha.0`. Docs at `/docs/reference/nuxt` render. E2E suite green in CI. |

---

## 15. What to Keep, Change, and Remove from the Current Code

### Keep as-is

- Overall directory layout (`src/module.ts` + `src/runtime/{composables,plugins,server,middleware,utils}`).
- Runtime-config pattern in [`module.ts`](../../packages/nuxt/src/module.ts): env → user options → `runtimeConfig`. This is superior to Next.js's env-only approach.
- Secret-leak sanitation in [module.ts:86-93](../../packages/nuxt/src/module.ts).
- PKCE-enabled Node client.
- Dynamic callback URL resolution (X-Forwarded-Host / Proto).
- Temp session JWT for the OAuth handshake.
- `createRouteMatcher` — already good.
- Auto-imported server utilities via Nitro `imports` hook.

### Change

| File | Change |
|---|---|
| [`package.json`](../../packages/nuxt/package.json) | Add `@asgardeo/vue`; add `./server` subpath export; bump version. |
| [`runtime/server/utils/client.ts`](../../packages/nuxt/src/runtime/server/utils/client.ts) | Remove module-level singleton → per-request client on `event.context`. |
| [`runtime/server/utils/session.ts`](../../packages/nuxt/src/runtime/server/utils/session.ts) | Add `accessTokenExpiresAt`, `refreshToken`, `idToken` to payload. |
| [`runtime/server/plugins/auth-state.ts`](../../packages/nuxt/src/runtime/server/plugins/auth-state.ts) | Use typed `event.context.asgardeo`; optional org/branding prefetch. |
| [`runtime/composables/useAsgardeo.ts`](../../packages/nuxt/src/runtime/composables/useAsgardeo.ts) | Replace hand-rolled composable with a thin wrapper over `@asgardeo/vue`'s `useAsgardeo`; expose full API. |
| [`runtime/plugins/asgardeo.ts`](../../packages/nuxt/src/runtime/plugins/asgardeo.ts) | Rename to `asgardeo.client.ts`; install Vue plugin in delegated mode; seed providers from `useState`. |
| [`runtime/middleware/auth.ts`](../../packages/nuxt/src/runtime/middleware/auth.ts) | Accept options (`requireOrganization`, `requireScopes`) via `defineAsgardeoMiddleware`. |
| All server routes | Wrap with `handleAuthRouteError`; throw typed `AsgardeoError`. |
| [`src/module.ts`](../../packages/nuxt/src/module.ts) | Add `addComponent` calls for Vue components; add Nitro middleware registration; throw in prod on missing `sessionSecret`. |

### Remove

- The silent `.catch(() => null)` pattern throughout server routes — replace with typed errors.
- Fallback hardcoded `sessionSecret` in development (warn is fine; in production must throw).
- Any `as any` casts on `event.context` after H3 augmentation lands.

### Add (new files)

- `runtime/types/augments.d.ts`
- `runtime/errors/{asgardeo-error,error-codes,index}.ts`
- `runtime/utils/{log,scim2,validate-config,resolve-config}.ts`
- `runtime/server/client.ts` (`AsgardeoNuxtServerClient`)
- `runtime/server/utils/{token-refresh,handle-error,resolve-callback-url}.ts`
- `runtime/server/middleware/session-guard.ts`
- `runtime/server/routes/auth/{signup.get,signup.post,signin.post,token.exchange.post,branding.get}.ts`
- `runtime/server/routes/auth/user/{profile.get,profile.patch,password.post}.ts`
- `runtime/server/routes/auth/organizations/{index.get,index.post,mine.get,current.get,switch.post}.ts`
- `runtime/components/{AsgardeoProvider.vue,AsgardeoCallback.vue}`
- `runtime/composables/{useUser,useOrganization,useFlow,useTheme,useBranding,useI18n,defineAsgardeoMiddleware}.ts`
- `playground/*`
- `tests/unit/*`, `tests/integration/*`, `tests/fixtures/basic/*`, `tests/helpers/*`

---

## Summary

The Nuxt SDK has solid foundations — Nuxt-idiomatic module, SSR-safe hydration, strong security defaults, PKCE-first, secret-leak prevention. What it lacks is everything above the OAuth handshake: UI, SCIM2 profile, organizations, embedded flows, refresh tokens, structured errors, tests.

The structure above keeps every good decision in the current code and adds the missing half in six sequenced phases. The most valuable single step is **Phase 1**: adding `@asgardeo/vue` as a dependency and auto-importing its composables and components from the Nuxt module. That one phase roughly doubles the feature surface on its own. Phases 2–6 close remaining gaps with the Next.js SDK and harden the package for a public release.
