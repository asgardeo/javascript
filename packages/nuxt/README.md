<p align="center" style="color: #343a40">
  <h1 align="center">@asgardeo/nuxt</h1>
</p>
<p align="center" style="font-size: 1.2rem;">Nuxt 3 module for Asgardeo — Authentication and Identity Management</p>
<div align="center">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@asgardeo/nuxt">
  <img alt="npm" src="https://img.shields.io/npm/dw/@asgardeo/nuxt">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License"></a>
</div>

---

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Configuration reference](#configuration-reference)
  - [Core config](#core-config)
  - [Preferences](#preferences)
  - [Environment variables](#environment-variables)
- [AsgardeoRoot wrapper](#asgardeoroot-wrapper)
- [Composables](#composables)
- [Server-side data flow](#server-side-data-flow)
  - [How the Nitro plugin works](#how-the-nitro-plugin-works)
  - [SSR → client hydration](#ssr--client-hydration)
  - [AsgardeoRoot reads hydrated state](#asgardeoroot-reads-hydrated-state)
- [Server API routes](#server-api-routes)
- [Coming from the Next.js SDK](#coming-from-the-nextjs-sdk)
- [License](#license)

---

## Installation

```bash
# npm
npm install @asgardeo/nuxt

# pnpm
pnpm add @asgardeo/nuxt
```

---

## Quick start

### 1. Register the module

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@asgardeo/nuxt'],

  asgardeo: {
    baseUrl: 'https://api.asgardeo.io/t/<your-org-name>',
    clientId: '<your-client-id>',
  },
});
```

Secrets should be supplied via environment variables rather than committed to source (see [Environment variables](#environment-variables)).

### 2. Wrap your app with `<AsgardeoRoot>`

```vue
<!-- app.vue -->
<template>
  <AsgardeoRoot>
    <NuxtPage />
  </AsgardeoRoot>
</template>
```

`AsgardeoRoot` is auto-registered by the module — no import needed. It mounts the full provider tree (branding, theme, user, organisation) and forwards server-resolved data to every downstream composable.

### 3. Use composables in your pages

```vue
<!-- pages/profile.vue -->
<script setup lang="ts">
const { isSignedIn, user, signIn, signOut } = useAsgardeo();
</script>

<template>
  <div v-if="isSignedIn">
    <p>Welcome, {{ user?.given_name }}</p>
    <button @click="signOut()">Sign out</button>
  </div>
  <div v-else>
    <button @click="signIn()">Sign in</button>
  </div>
</template>
```

### 4. Protect pages with middleware

```ts
// middleware/auth.ts
export default defineAsgardeoMiddleware();
```

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
definePageMeta({ middleware: 'auth' });
</script>
```

---

## Configuration reference

### Core config

All options are set under the `asgardeo` key in `nuxt.config.ts`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | — | Base URL of your Asgardeo organisation, e.g. `https://api.asgardeo.io/t/your_org`. |
| `clientId` | `string` | — | OAuth 2.0 Client ID. |
| `clientSecret` | `string` | — | OAuth 2.0 Client Secret. **Prefer the `ASGARDEO_CLIENT_SECRET` env var.** |
| `sessionSecret` | `string` | — | Secret used to sign session JWTs. **Prefer the `ASGARDEO_SESSION_SECRET` env var.** |
| `scopes` | `string[]` | `['openid', 'profile']` | OAuth 2.0 scopes to request. |
| `afterSignInUrl` | `string` | `'/'` | Path to redirect to after a successful sign-in. |
| `afterSignOutUrl` | `string` | `'/'` | Path to redirect to after sign-out. |
| `preferences` | `object` | see below | Feature-gating for server-side data fetches. |

### Preferences

The `preferences` block controls which data the Nitro server plugin fetches on every SSR request. All options default to `true`; set to `false` to skip a fetch and reduce per-request latency.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  asgardeo: {
    baseUrl: '...',
    clientId: '...',
    preferences: {
      user: {
        /**
         * Fetch the SCIM2 user profile (flattened attributes + schemas) on
         * every server-rendered request.
         * Consumed by `useUser()` → UserProvider.
         * Default: true
         */
        fetchUserProfile: true,

        /**
         * Fetch the user's organisation memberships and the current
         * organisation (derived from the ID-token `org_id` claim) on every
         * server-rendered request.
         * Consumed by `useOrganization()` → OrganizationProvider.
         * Default: true
         */
        fetchOrganizations: true,
      },
      theme: {
        /**
         * Fetch the Asgardeo branding preference and pass it to
         * BrandingProvider / ThemeProvider so server-rendered pages match
         * the configured brand theme without a client-side round-trip.
         * Default: true
         */
        inheritFromBranding: true,
      },
      /**
       * i18n options forwarded directly to I18nProvider.
       * See @asgardeo/vue I18nProvider for the full type.
       */
      i18n: {
        defaultLocale: 'en-US',
      },
    },
  },
});
```

#### When to disable a preference

| Scenario | Recommendation |
|----------|----------------|
| Public-facing marketing page that does not show user data | `fetchUserProfile: false`, `fetchOrganizations: false` to avoid unnecessary SCIM calls |
| App has its own theming system | `inheritFromBranding: false` |
| Single-organization app where org context is never needed | `fetchOrganizations: false` |

### Environment variables

Secrets and URLs can be supplied through environment variables. They take precedence over values in `nuxt.config.ts`.

| Variable | Corresponding config key |
|----------|--------------------------|
| `NUXT_PUBLIC_ASGARDEO_BASE_URL` | `asgardeo.baseUrl` |
| `NUXT_PUBLIC_ASGARDEO_CLIENT_ID` | `asgardeo.clientId` |
| `NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_IN_URL` | `asgardeo.afterSignInUrl` |
| `NUXT_PUBLIC_ASGARDEO_AFTER_SIGN_OUT_URL` | `asgardeo.afterSignOutUrl` |
| `ASGARDEO_CLIENT_SECRET` | `asgardeo.clientSecret` (**server-only**) |
| `ASGARDEO_SESSION_SECRET` | `asgardeo.sessionSecret` (**server-only**) |

> **Security note:** `ASGARDEO_CLIENT_SECRET` and `ASGARDEO_SESSION_SECRET` are server-only values. They are never exposed to the browser. Do not set them via `NUXT_PUBLIC_*` prefixed variables.

---

## AsgardeoRoot wrapper

`<AsgardeoRoot>` is the Nuxt equivalent of `AsgardeoClientProvider` in the Next.js SDK. It is a single component that:

1. Reads the five SSR-hydrated `useState` keys written by the Nitro plugin.
2. Passes them as props to the Vue SDK's provider tree:
   - `I18nProvider` — receives `preferences.i18n`
   - `BrandingProvider` — receives `brandingPreference`
   - `ThemeProvider` — receives `inheritFromBranding`
   - `FlowProvider`
   - `UserProvider` — receives `profile`, `flattenedProfile`, `schemas`, and callback props
   - `OrganizationProvider` — receives `currentOrganization`, `myOrganizations`, and callback props
3. Wires callback props (e.g. `updateProfile`, `onOrganizationSwitch`) to the corresponding Nitro API routes so downstream composables like `useUser()` and `useOrganization()` work out of the box.

### Usage

Place it at the root of your app so every page has access to auth context:

```vue
<!-- app.vue -->
<template>
  <AsgardeoRoot>
    <NuxtPage />
  </AsgardeoRoot>
</template>
```

### Preference gating in AsgardeoRoot

`AsgardeoRoot` reads the same `preferences` flags as the Nitro plugin. When a flag is `false`, the corresponding provider receives `null` / empty values and its callbacks are omitted — keeping the client in sync with what the server decided to fetch.

| Flag | Effect on providers |
|------|---------------------|
| `fetchUserProfile: false` | `UserProvider` receives `profile=null`, `flattenedProfile=null`, `schemas=null`; update/revalidate callbacks are omitted |
| `fetchOrganizations: false` | `OrganizationProvider` receives `currentOrganization=null`, `myOrganizations=[]`; switch/list callbacks are omitted |
| `inheritFromBranding: false` | `BrandingProvider` receives `brandingPreference=null`; `ThemeProvider` receives `inheritFromBranding=false` |

---

## Composables

All composables from `@asgardeo/vue` work inside `<AsgardeoRoot>` because the provider tree is mounted there.

| Composable | Provided by | Description |
|------------|-------------|-------------|
| `useAsgardeo()` | Nuxt plugin (ASGARDEO_KEY) | Core auth state: `isSignedIn`, `user`, `isLoading`, `signIn()`, `signOut()`, `signUp()` |
| `useUser()` | `UserProvider` | SCIM2 user profile: `profile`, `flattenedProfile`, `schemas`, `updateProfile()` |
| `useOrganization()` | `OrganizationProvider` | Org context: `currentOrganization`, `myOrganizations`, `onOrganizationSwitch()`, `getAllOrganizations()` |
| `useBranding()` | `BrandingProvider` | `brandingPreference` object |
| `useTheme()` | `ThemeProvider` | Resolved theme tokens |
| `useAsgardeoI18n()` | `I18nProvider` | i18n helpers |

### Protecting routes

Use the built-in `defineAsgardeoMiddleware` helper to protect any route:

```ts
// middleware/auth.ts
export default defineAsgardeoMiddleware({
  // Optional: redirect unauthenticated users to a custom page
  redirectTo: '/login',

  // Optional: require specific OAuth scopes
  requireScopes: ['openid', 'profile', 'admin'],

  // Optional: require the user to be inside an organisation
  requireOrganization: true,
});
```

---

## Server-side data flow

The SDK uses a three-layer pipeline to resolve auth data on the server and hydrate the client without additional network round-trips.

### How the Nitro plugin works

On every page request the Nitro server plugin (`asgardeo-ssr.ts`) runs **before** the page is rendered:

```
Request arrives
    │
    ▼
[1] AsgardeoNuxtClient.initialize(config)   — idempotent, runs once per process
    │
    ▼
[2] Verify JWT session cookie               — resolves isSignedIn + session payload
    │
    ├── Not signed in → event.context.asgardeo = {session: null, isSignedIn: false}
    │
    └── Signed in ──────────────────────────────────────────────────────────────────┐
                                                                                    │
    [3] Detect org context from ID token (user_org claim)                           │
        → resolvedBaseUrl = baseUrl + '/o' when user is in an org                   │
                                                                                    │
    [4] Parallel fetches (gated by preferences):                                    │
        ├── getUser(sessionId)              — always                                │
        ├── getUserProfile(sessionId)       — if fetchUserProfile !== false          │
        ├── getMyOrganizations(sessionId)   — if fetchOrganizations !== false        │
        ├── getCurrentOrganization(...)     — if fetchOrganizations !== false        │
        └── getBrandingPreference(...)      — if inheritFromBranding !== false       │
                                                                                    │
    [5] Write to event.context.asgardeo.ssr ────────────────────────────────────────┘
```

Each fetch is independently wrapped in a `try/catch` — a failed SCIM call or branding lookup does not crash SSR. The client-side `revalidate*` callbacks on `AsgardeoRoot` are the recovery path when a server fetch fails.

### SSR → client hydration

The universal Nuxt plugin (`plugins/asgardeo.ts`) runs on both the server and client.

On the **server** it seeds five `useState` keys from `event.context.asgardeo.ssr`. Nuxt automatically serialises these into the `__NUXT__` payload that is sent to the browser:

| useState key | Source field | Consumed by |
|---|---|---|
| `asgardeo:auth` | `isSignedIn`, `user` | `useAsgardeo()` |
| `asgardeo:user-profile` | `userProfile` | `UserProvider` |
| `asgardeo:current-org` | `currentOrganization` | `OrganizationProvider` |
| `asgardeo:my-orgs` | `myOrganizations` | `OrganizationProvider` |
| `asgardeo:branding` | `brandingPreference` | `BrandingProvider` / `ThemeProvider` |

On the **client**, `useState` rehydrates from the `__NUXT__` payload — no additional network requests are made during hydration.

### AsgardeoRoot reads hydrated state

`<AsgardeoRoot>` calls `useState` (without initialiser factories) to read the keys that the Nuxt plugin already seeded. It passes the values directly as props to each Vue provider. Because `useState` returns reactive refs, any later update (e.g. `updateProfile()` writing to `asgardeo:user-profile`) is immediately reflected in downstream composables.

```
Nitro plugin          Nuxt plugin (server)       AsgardeoRoot         Composables
─────────────────     ──────────────────────     ──────────────────   ──────────────
event.context  ──────► useState('asgardeo:*)  ──► I18nProvider      ► useAsgardeoI18n()
  .asgardeo               (seeded once, SSR)      BrandingProvider  ► useBranding()
  .ssr                                            ThemeProvider     ► useTheme()
                                                  UserProvider      ► useUser()
                                                  OrgProvider       ► useOrganization()
```

---

## Server API routes

The module registers the following Nitro routes automatically. These back the callbacks wired by `AsgardeoRoot` and can also be called directly from your own code.

### Authentication

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/auth/signin` | Initiates the OAuth 2.0 authorization code flow. Redirects to Asgardeo. |
| `GET` | `/api/auth/callback` | Handles the OAuth callback, exchanges the code for tokens, and issues a signed session cookie. |
| `GET` | `/api/auth/signout` | Clears the session cookie and redirects to Asgardeo's end-session endpoint. |
| `GET` | `/api/auth/session` | Returns the current session state `{isSignedIn, user}` as JSON. |
| `GET` | `/api/auth/token` | Returns the current access token (for use in client-side API calls). |

### User

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/auth/user` | Returns the raw user object from the in-memory token store. |
| `GET` | `/api/auth/user-profile` | Returns the full SCIM2 user profile (`profile`, `flattenedProfile`, `schemas`). |
| `POST` | `/api/auth/profile` | Updates the SCIM2 `/Me` resource. Body: `UpdateMeProfileConfig`. Returns `{data: {user}, success, error}`. |

### Organisations

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/auth/my-orgs` | Returns the list of organisations the signed-in user is a member of. |
| `GET` | `/api/auth/orgs` | Returns a paginated list of all organisations (requires sufficient scope). |
| `POST` | `/api/auth/switch-org` | Performs an organisation token exchange. Body: `{organization: Organization}`. Re-issues the session cookie with the new organisation context. |

---

## Coming from the Next.js SDK

If you are familiar with `@asgardeo/nextjs`, the table below maps each concept to its Nuxt equivalent.

| Next.js concept | Nuxt equivalent | Notes |
|-----------------|-----------------|-------|
| `<AsgardeoServerProvider config={...}>` | Nitro plugin `asgardeo-ssr.ts` (installed automatically by the module) | Invisible to the user — no component to place. Config comes from `nuxt.config.ts`. |
| Props passed from server component to client component | SSR-hydrated `useState` keys (`asgardeo:auth`, `asgardeo:user-profile`, etc.) | Serialised into `__NUXT__` payload; zero extra network requests on hydration. |
| `<AsgardeoClientProvider user={...} userProfile={...} ...>` | `<AsgardeoRoot>` | Reads the hydrated state and passes it as props to Vue SDK providers. |
| Server actions (`signInAction`, `signOutAction`, …) | Nitro server routes (`/api/auth/signin`, `/api/auth/signout`, …) | Already implemented. |
| `AsgardeoContext.Provider` value | `nuxtApp.vueApp.provide(ASGARDEO_KEY, …)` in the Nuxt plugin | Same result: `useAsgardeo()` reads from `ASGARDEO_KEY`. |
| `config.preferences.*` on `<AsgardeoServerProvider>` | `asgardeo.preferences.*` in `nuxt.config.ts` | Identical flag names. |
| Client-side OAuth callback (`useEffect` detecting `?code&state`) | Not needed — `/api/auth/callback` handles the full exchange server-side | Nuxt never exposes the OAuth code to the browser, which is an improvement. |
| `useSearchParams()` / `useRouter()` inside client provider | Not needed | See above. |
| `handleSignIn` / `handleSignOut` wrapping server actions + `router.push` | `signIn()` / `signOut()` calling `navigateTo('/api/auth/signin')` | Functionally equivalent; slightly simpler in Nuxt because there is no server-action boundary. |

### Key design insight

React Server Components and Nuxt's Nitro-plugin-plus-`useState` approach are two implementations of the same idea: the server resolves auth data and the client hydrates against it. The user-visible API deliberately uses Nuxt idioms rather than mimicking React Server Component tree structure.

- The **Nitro plugin** *is* `AsgardeoServerProvider`.
- **`<AsgardeoRoot>`** *is* `AsgardeoClientProvider`.
- The hand-off happens through `useState` instead of component props — but the result is identical.

---

## License

Licenses this source under the Apache License, Version 2.0 [LICENSE](./LICENSE), You may not use this file except in compliance with the License.
